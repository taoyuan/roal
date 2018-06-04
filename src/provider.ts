import {EventEmitter} from "events";
import {Method} from "./method";
import {Message} from "./interfaces";
import {createError, ErrorCodes} from "./errors";

export const MSG_RESOLVE = "resolve";
export const MSG_REJECT = "reject";
export const MSG_ERROR = "error";

export interface Listener<T> {
  (event: T): any;
}

export interface Disposable {
  dispose(): void;
}

export interface Transaction {
  id: number;
  hTimeout?: any;

  resolve(result: any): void;

  reject(error: string): void;
}

export enum MessageType {
  signal,
  rpc,
  internal
}

export interface Dispatcher {
  (message: Message, transfer?: Array<any>): boolean;
}

export interface ProviderOptions {
  dispatch?: Dispatcher,
  timeout?: number
}

export class Provider extends EventEmitter {
  private _nextId = 0;
  private _signals = new EventEmitter();
  private _methods: { [id: string]: Method } = {};
  private _txs: { [id: number]: Transaction } = {};

  protected _dispatch?: Dispatcher;
  protected _timeout: number = 0;

  constructor(dispatch?: Dispatcher | null, timeout?: number) {
    super();
    this._dispatch = dispatch ? dispatch : undefined;
    this._timeout = timeout || 0;
  }

  dispatch(message: Message, transfer?: any): boolean {
    if (!this._dispatch) {
      throw new Error('Not implemented');
    }
    return this._dispatch(message, transfer);
  }

  error(code?: number, message?: string, data?: any) {
    return createError(code, message, data);
  }

  method(name: string, definition: any): void {
    const isMethod = definition instanceof Method;
    const isFunction = typeof definition === 'function';

    // a valid method is either a function or a client (relayed method)
    if (!isMethod && !isFunction) {
      return;
      // throw new TypeError('method definition must be either a function or an instance of Method');
    }

    if (/^rpc\./.test(name)) {
      throw new TypeError('"' + name + '" is a reserved method name');
    }

    // make instance of jayson.Method
    if (!isMethod) {
      definition = new Method(definition, {});
    }

    this._methods[name] = definition;
  }

  methods(methods: { [name: string]: Function }): this {
    methods = methods || {};

    for (let name in methods) {
      this.method(name, methods[name]);
    }

    return this;
  }

  hasMethod(name: string): boolean {
    return name in this._methods;
  }

  removeMethod(name: string): void {
    if (this.hasMethod(name)) {
      delete this._methods[name];
    }
  }

  onSignal(signal: string | symbol, listener: Listener<any>): Disposable {
    this._signals.on(signal, listener);
    return {
      dispose: () => this.offSignal(signal, listener)
    };
  }

  offSignal(signal: string | symbol, listener: Listener<any>) {
    return this._signals.removeListener(signal, listener);
  }

  offAllSignals(signal?: string | symbol) {
    return this._signals.removeAllListeners(signal);
  }

  async call(name: string, params: any): Promise<any> {
    if (!this._methods[name]) {
      throw new Error(`invalid method ${name}`);
    }

    return await this._methods[name].execute(this, params);
  }

  handle(message: Message): void {
    switch (message.type) {
      case MessageType.signal:
        return this._handleSignal(message);

      case MessageType.rpc:
        return this._handelRequest(message);

      case MessageType.internal:
        return this._handleInternal(message);

      default:
        return this._raiseError(`invalid message type ${message.type}`);
    }
  }

  request<T, U>(method: string, params?: T, transfer?: any, options?: any | number): Promise<U> {
    return new Promise((resolve, reject) => {
      if (typeof options === 'number') {
        options = {timeout: options}
      }
      options = options || {};
      const timeout = options.timeout != null ? options.timeout : this._timeout;

      const id = this._nextId++;

      const transaction = this._txs[id] = {
        id,
        resolve,
        reject
      };

      if (timeout > 0) {
        this._txs[id].hTimeout = setTimeout(() => this._handleTimeout(transaction), timeout);
      }

      this.dispatch({
        type: MessageType.rpc,
        id: id,
        name: method,
        payload: params
      }, transfer ? transfer : undefined);
    });
  }

  signal(name: string, payload?: any, transfer?: any): boolean {
    return this.dispatch({
      type: MessageType.signal,
      name,
      payload,
    }, transfer ? transfer : undefined);
  }

  private _raiseError(reason: string): void {
    const error = createError(ErrorCodes.INVALID_SIGNAL, reason);
    this.emit('error', error);
    this.dispatch({
      type: MessageType.internal,
      name: MSG_ERROR,
      payload: error
    });
  }

  private _handleSignal(message: Message): void {
    if (!this._signals.listenerCount('signal') && !this._signals.listenerCount(message.name)) {
      return this._raiseError(`invalid signal ${message.name}`);
    }
    this._signals.emit(message.name, message.payload);
  }

  private _handelRequest(message: Message): any {
    if (!this._methods[message.name]) {
      // return this._raiseError(`invalid method "${message.name}"`);
      return this.dispatch({
        type: MessageType.internal,
        name: MSG_REJECT,
        id: message.id,
        payload: createError(ErrorCodes.METHOD_NOT_FOUND, `invalid method "${message.name}"`)
      });
    }

    return this.call(message.name, message.payload).then(
      (result: any) => this.dispatch({
        type: MessageType.internal,
        name: MSG_RESOLVE,
        id: message.id,
        payload: result
      }),
      (reason: any) => this.dispatch({
        type: MessageType.internal,
        name: MSG_REJECT,
        id: message.id,
        payload: reason
      })
    );
  }

  private _handleInternal(message: Message): any {
    switch (message.name) {
      case MSG_RESOLVE:
        if (!message.id && message.id != 0) {
          return this._raiseError(`invalid internal message. message "id" is required`);
        }
        if (!this._txs[message.id]) {
          return this._raiseError(`no pending transaction with id ${message.id}`);
        }

        this._txs[message.id].resolve(message.payload);
        this._clearTransaction(this._txs[message.id]);

        break;

      case MSG_REJECT:
        if (!message.id && message.id != 0) {
          return this._raiseError(`invalid internal message. message "id" is required`);
        }
        if (!this._txs[message.id]) {
          return this._raiseError(`no pending transaction with id ${message.id}`);
        }

        this._txs[message.id].reject(message.payload);
        this._clearTransaction(this._txs[message.id]);

        break;

      case MSG_ERROR:
        this.emit('error', message.payload);
        break;

      default:
        this._raiseError(`unhandled internal message ${message.name}`);
        break;
    }
  }

  private _handleTimeout(transaction: Transaction): void {
    transaction.reject('transaction timed out');
    this._raiseError(`transaction ${transaction.id} timed out`);
    delete this._txs[transaction.id];
  }

  private _clearTransaction(transaction: Transaction): void {
    if (typeof(transaction.hTimeout) !== 'undefined') {
      clearTimeout(transaction.hTimeout);
    }

    delete this._txs[transaction.id];
  }

}

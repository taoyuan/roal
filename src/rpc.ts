import {Provider} from "./provider";
import {TransportContext, Framer, Message} from "./defines";
import {ErrorCodes} from "./errors";
import {Transport} from "./transport";

export interface RPCOptions {
  id?: any;
  timeout?: number;
  framer?: Framer<any>;
  methods?: { [name: string]: Function }
}

export class RPC extends Provider {
  id: any;

  protected _transport: Transport;

  static create(transport: Transport, options: RPCOptions = {}) {
    return new RPC(transport, options);
  }

  constructor(transport: Transport, options: RPCOptions = {}) {
    super(undefined, options.timeout);
    this._transport = transport;

    this.id = options.id;

    this.init(options);
  }

  get transport() {
    return this._transport;
  }

  protected init(options: RPCOptions) {
    // handle incoming message
    this._transport.on('error:decode', (err, context) => {
      this._raiseError(ErrorCodes.PARSE_ERROR, err.message, context);
    });

    this._transport.on('message', (message, context) => {
      if (!message || !message.name) {
        return this._raiseError(ErrorCodes.PARSE_ERROR, context);
      }
      try {
        this.handle(message, context);
      } catch (e) {
        this._raiseError(ErrorCodes.INTERNAL_ERROR, e.message, context);
      }
    });

    this._transport.on('error', error => {
      this.emit('error', error);
    });

    this._transport.on('exit', (code, signal) => {
      this.emit('exit', code, signal);
    });

    if (options.methods) {
      this.methods(options.methods);
    }
  }

  async dispatch(message: Message, context?: TransportContext) {
    // handle outgoing message
    await this._transport.send(message, context);
  }

  async close() {
    await this._transport.close();
  }
}

import {Provider} from "./provider";
import {Context, Framer, Message} from "./defines";
import {JsonFramer} from "./framers";
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
  framer: Framer<any>;

  static create(transport: Transport, options: RPCOptions = {}) {
    return new RPC(transport, options);
  }

  constructor(public transport: Transport, options: RPCOptions = {}) {
    super(undefined, options.timeout);

    this.id = options.id;
    this.framer = options.framer || new JsonFramer();

    this.init(options);
  }

  protected init(options: RPCOptions) {
    // handle incoming message
    this.transport.on('data', (data, context) => {
      try {
        const message = this.framer.decode(data);
        try {
          this.handle(message, context);
        } catch (e) {
          this._raiseError(ErrorCodes.INTERNAL_ERROR, e.message);
        }
      } catch (e) {
        this._raiseError(ErrorCodes.PARSE_ERROR, e.message);
      }
    });

    this.transport.on('error', error => {
      this.emit('error', error);
    });

    this.transport.on('exit', (code, signal) => {
      this.emit('exit', code, signal);
    });

    if (options.methods) {
      this.methods(options.methods);
    }
  }

  dispatch(message: Message, context?: Context): boolean {
    // handle outgoing message
    this.transport.send(this.framer.encode(message), context);
    return true;
  }

  async close() {
    await this.transport.close();
  }
}

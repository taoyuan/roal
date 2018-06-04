import {Provider} from "./provider";
import {Channel, Framer, Message} from "./interfaces";
import {Transport} from "./transport";
import {JsonFramer} from "./framers";

export interface RPCOptions {
  id?: any;
  timeout?: number,
  framer?: Framer<any>,
}

export class RPC extends Provider {
  id: any;
  framer: Framer<any>;
  transport: Transport;

  static create(transportOrChannel: Transport | Channel, options: RPCOptions = {}) {
    return new RPC(transportOrChannel, options);
  }

  constructor(transportOrChannel: Transport | Channel, options: RPCOptions = {}) {
    super(undefined, options.timeout);

    if (transportOrChannel instanceof Transport) {
      this.transport = transportOrChannel;
    } else {
      this.transport = new Transport(transportOrChannel);
    }

    this.id = options.id;
    this.framer = options.framer || new JsonFramer();

    this.init();
  }

  protected init() {
    // handle incoming message
    this.transport.on('data', data => {
      const message = this.framer.decode(data);
      this.handle(message);
    });

    this.transport.on('error', error => {
      this.emit('error', error);
    });

    this.transport.on('exit', (code, signal) => {
      this.emit('exit', code, signal);
    });
  }

  dispatch(message: Message, transfer?: any): boolean {
    // handle outgoing message
    return this.transport.send(this.framer.encode(message), transfer);
  }

  async close() {
    await this.transport.close();
  }
}

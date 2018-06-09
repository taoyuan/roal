import {TransportContext, Message} from "./defines";
import {EventEmitter} from "events";

export class Transport extends EventEmitter {
  private _context = {};

  constructor() {
    super();
  }

  protected sureContext(context?: TransportContext): TransportContext {
    return context || this._context;
  }

  recv(message: Message, context?: TransportContext) {
    this.emit('message', message, this.sureContext(context));
  }

  send(message: Message, context?: TransportContext) {
    throw new Error('Unimplemented')
  }

  close() {
  }

}

import {Context} from "./defines";
import {EventEmitter} from "events";

export class Transport extends EventEmitter {

  constructor() {
    super();
  }

  recv(data: Buffer | Uint8Array | number[], context?: Context) {
    this.emit('data', data, context);
  }

  send(data: Buffer | Uint8Array | number[], context?: Context) {

  }

  close() {
  }

}

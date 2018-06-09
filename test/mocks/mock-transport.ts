import {Message, Transport} from "../../src";

export class MockTransport extends Transport {
  dest: MockTransport;

  pipe(dest: MockTransport): MockTransport {
    this.dest = dest;
    return dest;
  }

  send(message: Message) {
    if (!this.dest) throw new Error('dest pipe is not assigned');
    this.dest.emit('message', message);
  }

}

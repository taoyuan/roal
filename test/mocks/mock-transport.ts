import {Transport} from "../../src";

export class MockTransport extends Transport {
  dest: MockTransport;

  pipe(dest: MockTransport): MockTransport {
    this.dest = dest;
    return dest;
  }

  send(data: Buffer) {
    if (!this.dest) throw new Error('dest pipe is not assigned');
    this.dest.emit('data', data);
  }

}

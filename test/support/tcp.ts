import {EventEmitter} from "events";
import {Socket} from "net";
import {Channel} from "../../src";

export class TcpChannel extends EventEmitter implements Channel {

  constructor(public conn: Socket) {
    super();
    conn.on('data', data => {
      this.emit('data', data);
    });

    conn.on('end', () => {
      this.emit('end');
    });
  }

  write(data) {
    this.conn.write(data);
  }

  async close() {
    this.conn.end();
  }
}

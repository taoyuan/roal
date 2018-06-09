import {Socket} from "net";
import {StreamTransport} from "../../src";

export class TcpTransport extends StreamTransport {

  constructor(public conn: Socket) {
    super();

    const c = <any> conn;
    c.__rpc = c.__rpc || {conn};

    conn.on('data', data => {
      this.read(data, c.__rpc);
    });

    conn.on('end', () => {
      this.emit('end');
    });
  }

  write(data, context) {
    this.conn.write(data);
  }

  async close() {
    this.conn.end();
  }
}

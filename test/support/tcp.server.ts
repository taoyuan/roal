import * as net from "net";
import {Socket} from "net";
import {Channel, RPC, StreamTransport} from "../../src";
import {EventEmitter} from "events";

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
}

export function buildConnectionListener(methods, errorHandler?: (err) => void) {
  const errorListener = errorHandler || (() => undefined);
  return conn => {
    const channel = new TcpChannel(conn);
    channel.once('end', () => rpc.close());
    const rpc = RPC.create(new StreamTransport(channel), {methods});
    rpc.on('error', errorListener);
  }
}

export function createServer(methods) {
  return net.createServer(buildConnectionListener(methods));
}

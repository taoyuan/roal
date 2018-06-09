import * as net from "net";
import {RPC, StreamTransport} from "../../src";
import {TcpChannel} from "./tcp";
import {Counter} from "./counter";

export function buildConnectionListener(methods, errorHandler?: (err) => void) {
  const errorListener = errorHandler || (() => undefined);
  return conn => {
    const channel = new TcpChannel(conn);
    channel.once('end', () => rpc.close());
    const rpc = RPC.create(new StreamTransport(channel), {methods});
    rpc.on('error', errorListener);
    rpc.framer.register(Counter);
  }
}

export function createServer(methods) {
  return net.createServer(buildConnectionListener(methods));
}

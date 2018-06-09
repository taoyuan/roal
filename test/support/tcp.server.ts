import * as net from "net";
import {RPC} from "../../src";
import {TcpTransport} from "./tcp";
import {Counter} from "./counter";

export function buildConnectionListener(methods, errorHandler?: (err) => void) {
  const errorListener = errorHandler || (() => undefined);
  return conn => {
    const transport = new TcpTransport(conn);
    transport.framer.register(Counter);
    transport.once('end', () => rpc.close());

    const rpc = RPC.create(transport, {methods});
    rpc.on('error', errorListener);
  }
}

export function createServer(methods) {
  return net.createServer(buildConnectionListener(methods));
}

import * as net from "net";
import {RPC, StreamTransport} from "../../src";
import {TcpTransport} from "./tcp";
import {Counter} from "./counter";

export function createClient(port: number, host?: string, errorHandler?: (err) => void);
export function createClient(port: number, errorHandler?: (err) => void);
export function createClient(port: number, host?: string | ((err) => void), errorHandler?: (err) => void) {
  if (typeof host === 'function') {
    errorHandler = host;
    host = undefined;
  }
  const errorListener = errorHandler || (() => undefined);
  const transport = new TcpTransport(net.connect(port, host));
  transport.framer.register(Counter);

  const rpc = RPC.create(transport);
  rpc.on('error', errorListener);
  return rpc;
}

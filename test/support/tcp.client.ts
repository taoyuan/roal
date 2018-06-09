import * as net from "net";
import {RPC, StreamTransport} from "../../src";
import {TcpChannel} from "./tcp";
import {Counter} from "./counter";

export function createClient(port: number, host?: string, errorHandler?: (err) => void);
export function createClient(port: number, errorHandler?: (err) => void);
export function createClient(port: number, host?: string | ((err) => void), errorHandler?: (err) => void) {
  if (typeof host === 'function') {
    errorHandler = host;
    host = undefined;
  }
  const errorListener = errorHandler || (() => undefined);
  const channel = new TcpChannel(net.connect(port, host));
  const rpc = RPC.create(new StreamTransport(channel));
  rpc.on('error', errorListener);
  rpc.framer.register(Counter);
  return rpc;
}

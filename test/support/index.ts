import * as chai from "chai";
import * as chaiAsPromised from "chai-as-promised";
import {RPC} from "../../src";
import {MockTransport} from "../mocks/mock-transport";
import * as _methods from "./methods";

chai.use(chaiAsPromised);

export * from "./counter";
export const methods = _methods;

export function wait(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export function fixture(name: string): string {
  return require.resolve('./fixtures/' + name)
}

export function throwError(err: Error) {
  throw err;
}

export async function repeat(times, fn) {
  const arr = new Array(times).fill(0);
  return Promise.all(arr.map(() => fn()));
}

export function givenAPairOfRPCWithMockChannel(methods) {
  const st = new MockTransport();
  const ct = new MockTransport();
  st.pipe(ct).pipe(st);

  const server = RPC.create(st);
  const client = RPC.create(ct);

  server.methods(methods);

  return {server, client};
}



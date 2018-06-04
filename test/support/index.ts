import * as chai from "chai";
import * as chaiAsPromised from "chai-as-promised";
import {Counter} from "./counter";
import {RPC} from "../../src";
import {MockTransport} from "../mocks/mock-transport";

export * from "./counter";

chai.use(chaiAsPromised);

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

export function givenAPairOfProvider(dispatchServer, dispatchClient, methods) {

}

export function givenAPairOfRPCWithMockChannel(methods) {
  const st = new MockTransport();
  const ct = new MockTransport();
  st.pipe(ct).pipe(st);

  const server = RPC.create(st);
  const client = RPC.create(ct);

  server.framer.register(Counter);
  client.framer.register(Counter);

  server.methods(methods);

  return {server, client};
}

export const server = {
  /*
   * Methods for the common test server
   */
  methods: {
    error() {
      throw this.error(-1000, 'An error message');
    },

    incrementCounterBy: function(counter, value) {
      if(!(counter instanceof Counter)) {
        throw this.error(-1000, 'Argument not an instance of Counter');
      }
      counter.incrementBy(value);
      return counter;
    },

    add: function(a, b) {
      return a + b;
    },

    async addSlow(a, b, isSlow) {
      const result = a + b;
      if(isSlow) await wait(15);
      return result;
    },

    empty: function() {
    },

    noArgs: function(): boolean {
      return true;
    },

    invalidError: function() {
      throw {invalid: true};
    },

    delay: function(ms) {
      return wait(ms);
    }
  }
};

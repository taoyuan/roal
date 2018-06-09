import {assert} from "chai";
import * as s from "./support";
import {Counter} from "./support";

describe("rpc", () => {
  describe('request', () => {
    it("should add", async () => {
      const {client} = s.givenAPairOfRPCWithMockChannel(s.methods);
      const result = await client.request('add', [1, 2]);
      assert.equal(result, 3);
    });

    it("should add slow", async () => {
      const {client} = s.givenAPairOfRPCWithMockChannel(s.methods);
      const result = await client.request('addSlow', [1, 2]);
      assert.equal(result, 3);
    });

    it("should incrementCounterBy", async () => {
      const {server, client} = s.givenAPairOfRPCWithMockChannel(s.methods);
      const counter = new Counter(1);
      const result = <Counter> await client.request('incrementCounterBy', [counter, 2]);
      assert.equal(result.count, 3);
    });

    it("should throw error", async () => {
      const {client} = s.givenAPairOfRPCWithMockChannel(s.methods);
      return assert.isRejected(client.request('error'), /An error message/);
    });
  });

});

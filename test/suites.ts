import {assert} from "chai";
import {RPC} from "../src";
import {Counter} from "./support";

export function suitesCommonForClient(getClient: () => RPC, options?) {
  options = options || {instanceOfClient: true};

  return function () {

    let client: RPC;

    beforeEach(() => {
      client = getClient();
    });

    if (options.instanceOfClient) {
      it('should be an instance of jayson.Client',() => {
        assert.instanceOf(client, RPC)
      });
    }

    it('should be able to request a success-method on the server', async () => {
      const a = 11, b = 12;
      const result = await client.request('add', [a, b]);
      assert.ok(result);
      assert.equal(result, a + b);
    });

    it('should be able to request an error-method on the server', async () => {
      try {
        await client.request('error');
        assert.fail()
      } catch (e) {
        assert.propertyVal(e, 'message', 'An error message');
        assert.propertyVal(e, 'code', -1000);
      }
    });

    it('should be able to request an exception-method on the server', async () => {
      try {
        await client.request('exception');
        assert.fail()
      } catch (e) {
        assert.deepInclude(e, {
          code: -32603,
          message: 'Internal error',
          data: {
            name: 'Error',
            message: 'An exception message'
          }
        });
      }
    });

    it('should support reviving and replacing', async () => {
      const a = 2, b = 1;
      const instance = new Counter(a);

      const result = await client.request('incrementCounterBy', [instance, b]);
      assert.ok(result);
      assert.instanceOf(result, Counter);
      assert.notDeepEqual(result, instance);
      assert.propertyVal(result, 'count', a + b);
    });
  };
}

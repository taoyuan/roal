import {assert} from "chai";
import {Provider, TimeoutError} from "../src";

describe("provider", () => {
  let server: Provider;
  let client: Provider;
  let errorServer: Error | null;
  let errorClient: Error | null;

  beforeEach(() => {
    server = new Provider(async (message, transfer) => {
      client.handle(message);
      return true;
    }, 50);

    client = new Provider(async (message, transfer) => {
      server.handle(message);
      return true;
    }, 50);
    server.on('error', err => errorServer = err);
    client.on('error', err => errorClient = err);

    errorServer = errorClient = null;

  });

  describe('request', () => {
    it('methods can return values', async () => {
      server.method('action', () => 10);

      const result = await client.request('action');
      assert.strictEqual(result, 10);
      assert(!errorClient);
      assert(!errorServer);
    });

    it('methods can return promises', async () => {
      server.method('action', () => new Promise(resolve => setTimeout(() => resolve(10), 15)));

      const result = await client.request('action');
      assert.strictEqual(result, 10);
      assert(!errorClient);
      assert(!errorServer);
    });

    it('Promise rejection is transferred', () => {
      server.method('action', () => new Promise((resolve, reject) => setTimeout(() => reject(10), 15)));

      return client.request('action').then(
        () => Promise.reject('should have been rejected'),
        (e) => {
          assert.deepEqual(e, {
            code: -32603,
            data: 10,
            message: "Internal error"
          });
          assert(!errorClient);
          assert(!errorServer);
        }
      )
    });

    it('Invalid calls are rejected without throws both ends', () => {
      return client.request('action').then(
        () => Promise.reject('should have been rejected'),
        () => undefined
      ).then(() => {
        assert(!errorClient);
        assert(!errorServer);
      });
    });

    it('request calls time out', () => {
      server.method('action', () => new Promise(r => setTimeout(() => r(10), 100)));
      return client.request('action').then(
        () => Promise.reject('should have been rejected'),
        (err) => {
          assert.instanceOf(err, TimeoutError);
        }
      )
    });

    it('multiple request do not interfere', () => {
      server.method('a1', (value: number) => new Promise(r => setTimeout(() => r(value), 30)));
      server.method('a2', (value: number) => 2 * value);

      return Promise.all([
        client.request('a1', 10),
        client.request('a2', 20)
      ]).then(([r1, r2]) => {
        assert.strictEqual(r1, 10);
        assert.strictEqual(r2, 40);
        assert(!errorClient);
        assert(!errorServer);
      });
    });

    it('methods can be removed', () => {
      server.method('action', () => 10);
      server.removeMethod('action');

      return client.request('action').then(
        () => Promise.reject('should have been rejected'),
        () => {
          assert(!errorClient);
          assert(!errorServer);
        });
    });

  });


  describe('signals', () => {
    it('Signals are propagated', () => {
      let x = -1;
      server.onSignal('action', (value: number) => x = value);
      client.signal('action', 5);

      assert.notOk(errorServer);
      assert.notOk(errorClient);
      assert.strictEqual(x, 5);
    });

    it('Multiple signals do not interfere', () => {
      let x = -1, y = -1;

      server.onSignal('setx', (value: number) => x = value);
      server.onSignal('sety', (value: number) => y = value);

      client.signal('setx', 5);
      client.signal('sety', 6);

      assert.notOk(errorClient);
      assert.notOk(errorServer);
      assert.strictEqual(x, 5);
      assert.strictEqual(y, 6);
    });

    it('Multiple listeners can be bound to one signal', () => {
      let x = -1;

      server.onSignal('action', (value: number) => x = value);

      client.signal('action', 1);
      client.signal('action', 2);

      assert(!errorClient);
      assert(!errorServer);
      assert.strictEqual(x, 2);
    });

    it('Listeners can be dispose', () => {
      let x = -1;

      const s = server.onSignal('action', (value: number) => x = value);
      s.dispose();

      client.signal('action', 5);

      assert.strictEqual(x, -1);
    });

  });

});

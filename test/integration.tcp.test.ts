import {assert} from "chai";
import * as net from "net";
import * as s from "./support";
import {RPC} from "../src";
import {createServer} from "./support/tcp.server";
import {createClient} from "./support/tcp.client";
import {TcpTransport} from "./support/tcp";
import {suitesCommonForClient} from "./suites";
import {makeRequestMessage} from "../src/utils";

describe('tcp/integration', () => {
  describe('server', () => {
    let server;

    before(function () {
      server = createServer(s.methods);
    });

    after(function () {
      server.close();
    });

    it('should listen to a local port', done => {
      const server = createServer(s.methods);
      server.listen(3999, 'localhost', function () {
        server.close(done);
      });
    });

    context('connected socket', () => {
      let socket;
      let transport;

      before(function (done) {
        server.listen(3999, 'localhost', done);
      });

      beforeEach(function (done) {
        socket = net.connect(3999, 'localhost', done);
        transport = new TcpTransport(socket);
      });

      afterEach(function (done) {
        socket.end();
        done();
      });

      it('should send a parse error for invalid JSON data', function (done) {
        transport.on('message', function (message) {
          // parse
          assert.equal(message.name, 'error');
          assert.include(message.payload, {
            code: -32700 // Parse Error
          });
          done();
        });

        // obviously invalid
        transport.send('abc');
      });

      it('should send more than one reply on the same socket', function (done) {
        const replies: any[] = [];
        transport.on('message', function (message) {
          replies.push(message);
        });

        // write raw requests to the socket
        transport.send(makeRequestMessage('delay', [20]));
        transport.send(makeRequestMessage('delay', [5]));

        setTimeout(function () {
          assert.lengthOf(replies, 2);
          assert.propertyVal(replies[0], 'payload', 5);
          assert.propertyVal(replies[1], 'payload', 20);
          done();
        }, 40);
      });
    });
  });

  describe('client', function() {
    let client: RPC;
    const server = createServer(s.methods);

    before(done => {
      server.listen(3999, 'localhost', done);
    });

    after(function() {
      server.close();
    });

    beforeEach(() => {
      client = createClient(3999, 'localhost');
    });

    afterEach(async () => {
      await client.close();
    });

    describe('common tests', suitesCommonForClient(() => client));
  });
});

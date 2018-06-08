import {assert} from "chai";
import * as net from "net";
import {createServer, TcpChannel} from "./support/tcp.server";
import * as s from "./support";
import {StreamTransport} from "../src";

describe('tcp/integration', () => {

  let server;

  before(function() {
    server = createServer(s.server.methods);
  });

  after(function() {
    server.close();
  });

  it('should listen to a local port', done => {
    const server = createServer(s.server.methods);
    server.listen(3999, 'localhost', function() {
      server.close(done);
    });
  });

  context('connected socket', () => {
    let socket;
    let transport;

    before(function(done) {
      server.listen(3999, 'localhost', done);
    });

    beforeEach(function(done) {
      socket = net.connect(3999, 'localhost', done);
      transport = new StreamTransport(new TcpChannel(socket));
    });

    afterEach(function(done) {
      socket.end();
      done();
    });

    it('should send a parse error for invalid JSON data', function(done) {
      transport.on('data', function(data) {
        // parse
        const message = JSON.parse(data);

        assert.equal(message.name, 'error');
        assert.include(message.payload, {
          code: -32700 // Parse Error
        });
        done();
      });

      // obviously invalid
      transport.send('abc');
    });
  });
});

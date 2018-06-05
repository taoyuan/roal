# roal

> A Remoting Object Access Layer for communicating for C/S on top of any transport that transfers JSON data.

## What is it?

This package provides a simple RPC mechanism on top of any transport that transfers JSON data. It can be used on top of different transport channels, i.e. `postMessage` between frames, websockets via `socket.io` or JSON encoded messages over pipes.

## Useage

### Installation

```shell
npm install roal
```

The library is written in Typescript and will work in any environment that supports ES5 and ES6-style promises (either native or through a shim). No external typings are required for using this library with Typescript (version >= 2).

### Examples

__Comming Soon__

## API

The API is built around the `Provider`  and `RPC` class. A `Provider` or `RPC` acts both as client and server for RPC calls and event-like signals. The library uses ES6 promises and can consume any A+ compliant promises.

### Creating a new provider

```typescript
const rpc = new Provider(dispatcher, timeout);
```

- `dispatcher`: A function that will be called for dispatching messages. The first argument will be an opaque message object, and the second argument an error of `Transferable` objects that are to be passed via ownership
  transfer (if supported by the transport).
- `timeout` (optional): The timeout for RPC transactions in milliseconds. Values of `0` or smaller disable the timeout (this is the default).

### Creating a new rpc

```typescript
const rpc = new RPC(transportOrChannel, options);
```

RPC class integrated with `channel`, `transport` and `framer` to simplify usage.

__Comming Soon__

### Incoming messages

```typescript
rpc.handle(message);
```

Similar to message dispatch, `trpc` does not provide a built-in mechanism for receiving messages. Instead, incoming messages must be relayed to the provider by invoking `handle`.

- `message`: The received message.

### Registering One RPC handler

```typescript
rpc.method(name, definition);
```

Register a srvice method for RPC calls with name `name`. Returns the provider instance.

- `name`: RPC call name. Only a single handler can be registered for any name. 
- `definition`: The handler function or `method` instance. This function receives the payload object as
  its argument and can return its result either as an immediate value or as a promise.

### Registering RPC handlers

```typescript
rpc.methods({[name: string]: function});
```

Register multiple rpc handlers.

### Listening signal

```typescript
rpc.onSignal(signal, listener));
```

Register a handler function for signals with id `id`. Returns the provider instance.

- `signal`: Signal name. The namespace for signal ids is seperate from that of RPC names, and multiple handlers my be attached tp a single signal. Naems should be strings
- `listener`: The linster function. This function receives the payload object as its argument; the result is ignored.

### Sending RPC remote calls

```typescript
const result = rpc.request(name, payload, transfer);
```

Dispatch a RPC call and returns a promise for its result. The promise is rejected
if the call times out or if no handler is registered (or if the handler rejects
the operation).

- `name`: RPC call name.
- `payload` (optional): RPC call payload.
- `transfer` (optional): List of `Transferables` that will be passed to dispatched (see above).

### Emitting signals

```typescript
rpc.signal(signal, payload, transfer);
```

Dispatch a signal. 

- `signal`: Signal name.
- `payload` (optional): Signal payload.
- `transfer` (optional): List of `Transferables` that will be passed to dispatched (see above).

Returns a `Disposable` instance. The `Disposable` instance has one method `dispose`, it can remove the signal handler.

### Removing RPC handlers

```typescript
rpc.removeMethod(name);
```

Returns the provider instance.

### Removing signal handlers

```typescript
rpc.offSignal(signal);
```

Returns the provider instance.

### Errors

```typescript
rpc.on('error', handler);
```

The error event is dispatched if there is either a local or remote communcation
error (timeout, invalid id, etc.). 

## License

Feel free to use this library under the conditions of the MIT license.


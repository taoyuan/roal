import {Message, MessageType} from "./index";

let _nextId = 0;

export function nextId(): number {
  return _nextId++;
}

export function makeMessage(type: MessageType, name: string, payload?: any, id?: number | string): Message {
  return {type, id, name, payload};
}

export function makeInternalMessage(name: string, payload?: any, id?: number | string): Message {
  return makeMessage(MessageType.internal, name, payload, id);
}

export function makeRequestMessage(method: string, params?: any, id?: number | string): Message {
  if (id === undefined) {
    id = nextId();
  }
  return makeMessage(MessageType.rpc, method, params, id);
}

export function makeSignalMessage(signal: string, payload?: any): Message {
  return makeMessage(MessageType.signal, signal, payload);
}

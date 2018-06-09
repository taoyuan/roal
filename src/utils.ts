import {Message, MT_INTERNAL, MT_RPC, MT_SIGNAL} from ".";

let _nextId = 0;

export function nextId(): number {
  return _nextId++;
}

export function makeMessage(type: string, name: string, payload?: any, id?: number | string): Message {
  return {type, id, name, payload};
}

export function makeInternalMessage(name: string, payload?: any, id?: number | string): Message {
  return makeMessage(MT_INTERNAL, name, payload, id);
}

export function makeRequestMessage(method: string, params?: any, id?: number | string): Message {
  if (id === undefined) {
    id = nextId();
  }
  return makeMessage(MT_RPC, method, params, id);
}

export function makeSignalMessage(signal: string, payload?: any): Message {
  return makeMessage(MT_SIGNAL, signal, payload);
}

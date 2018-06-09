export const MT_RPC = 'rpc';
export const MT_SIGNAL = 'signal';
export const MT_INTERNAL = 'internal';

export type EncodeFunc = (input: any) => any;
export type DecodeFunc = (input: any) => any;

export interface Constructor<T> {
  new(...args: any[]): T;
}

export interface Codec<T> {
  clazz: Constructor<T>,
  encode: (input: T, encode?: EncodeFunc) => any,
  decode: (input: any, decode?: DecodeFunc) => T
}

export function isCodec(arg: any): arg is Codec<any> {
  return arg.clazz != null;
}

export interface Framer<T> {
  register(...codecs: T[]);

  encode(input: any): Buffer;

  decode(input: Buffer | Uint8Array | number[]): any;
}

export interface Message {
  type: string;
  id?: number | string;
  name: string;
  payload?: any;
}

export interface TransportContext {
  [name: string]: any;
}

export interface Dispatcher {
  (message: Message, context?: TransportContext): boolean;
}

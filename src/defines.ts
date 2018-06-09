import {EventEmitter} from "events";
import {MessageType} from "./provider";

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
  type: MessageType;
  id?: number | string;
  name: string;
  payload?: any;
}

export interface Context {
  [name: string]: any;
}

export function isTransport(arg: any): arg is Transport {
  return typeof arg.send === 'function';
}

export interface Channel extends EventEmitter {
  write(data: ArrayLike<any>);

  close?(): Promise<void>;
}

export interface Dispatcher {
  (message: Message, context?: Context): boolean;
}

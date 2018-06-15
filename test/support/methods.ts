import {wait} from "./index";
import {Counter} from "./counter";
import {makeFailureError} from "../../src";

export function error() {
  throw makeFailureError(-1000, 'An error message');
}

export function exception() {
  throw new Error('An exception message');
}

export function incrementCounterBy(counter, value) {
  if (!(counter instanceof Counter)) {
    throw makeFailureError(-1000, 'Argument not an instance of Counter');
  }
  counter.incrementBy(value);
  return counter;
}

export function add(a, b) {
  return a + b;
}

export async function addSlow(a, b, isSlow) {
  const result = a + b;
  if (isSlow) await wait(15);
  return result;
}

export function empty() {
}

export function noArgs(): boolean {
  return true;
}

export function invalidError() {
  throw {invalid: true};
}

export async function delay(ms) {
  await wait(ms);
  return ms;
}

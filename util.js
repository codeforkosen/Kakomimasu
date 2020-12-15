import { v4 } from "https://deno.land/std@0.79.0/uuid/mod.ts";

const util = {};

util.rnd = (n) => {
  return Math.floor(Math.random() * n); // MT is better
};

util.uuid = () => {
  return v4.generate();
};

util.p = (json) => {
  console.log(JSON.stringify(json, null, 2));
};

util.deepEquals = (x, y) => {
  if (x === y) return true;
  if (!(x instanceof Object) || !(y instanceof Object)) return false;
  if (x.constructor !== y.constructor) return false;
  for (const p in x) {
    if (!x.hasOwnProperty(p)) continue;
    if (!y.hasOwnProperty(p)) return false;
    if (x[p] === y[p]) continue;
    if (typeof (x[p]) !== "object") return false;
    if (!util.deepEquals(x[p], y[p])) return false;
  }
  for (const p in y) {
    if (y.hasOwnProperty(p) && !x.hasOwnProperty(p)) return false;
  }
  return true;
};

util.nowUnixTime = () => {
  return Math.floor(new Date().getTime() / 1000);
};

export default util;

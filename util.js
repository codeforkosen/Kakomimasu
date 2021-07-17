const util = {};

util.rnd = (n) => {
  return Math.floor(Math.random() * n); // MT is better
};

util.p = (json) => {
  console.log(JSON.stringify(json, null, 2));
};

util.deepEquals = (x, y) => {
  if (x === y) return true;
  if (!(x instanceof Object) || !(y instanceof Object)) return false;
  if (x.constructor !== y.constructor) return false;
  for (const p in x) {
    if (!Object.prototype.hasOwnProperty.call(x, p)) continue;
    if (!Object.prototype.hasOwnProperty.call(y, p)) return false;
    if (x[p] === y[p]) continue;
    if (typeof (x[p]) !== "object") return false;
    if (!util.deepEquals(x[p], y[p])) return false;
  }
  for (const p in y) {
    if (
      Object.prototype.hasOwnProperty.call(y, p) &&
      !Object.prototype.hasOwnProperty.call(x, p)
    ) {
      return false;
    }
  }
  return true;
};

util.nowUnixTime = () => {
  return Math.floor(new Date().getTime() / 1000);
};

export default util;

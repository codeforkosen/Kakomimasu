import util from "./util.js";

class AssertionError extends Error {
}

const assertEquals = (x, y) => {
  if (!util.deepEquals(x, y)) {
    throw new AssertionError(`${y} is must be ${x}`);
  }
};

const assert = b => {
  if (!b) {
    throw new AssertionError(`must be true`);
  }
};

// const test = Deno.test; // for 1.0.5 bug
const test = async (s, f) => {
  let res = "ok";
  try {
    if (f.constructor.name === "AsyncFunction") await f();
    else f();
  } catch (_e) {
    res = "err";
  }
  console.log("test " + s, res);
};

export { test, assert, assertEquals, AssertionError };

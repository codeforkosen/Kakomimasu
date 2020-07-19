import util from "./util.js";

class AssertionError extends Error {
}

const assertEquals = (x, y) => {
  if (!util.deepEquals(x, y)) {
    throw new AssertionError(`${x} is not equals ${y}`);
  }
};

const assert = (b) => {
  if (!b) {
    throw new AssertionError();
  }
};

// const test = Deno.test; // for 1.0.5 bug
const test = (s, f) => {
  let res = "ok";
  try {
    f();
  } catch (e) {
    res = "err";
  }
  console.log("test " + s, res);
};

export { test, assertEquals, assert };

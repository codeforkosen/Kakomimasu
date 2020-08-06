import util from "../util.js";
import { test, assert, assertEquals } from "../asserts.js";

test("rnd", () => {
  for (let i = 0; i < 100; i++) {
    const n = util.rnd(10);
    assert(n >= 0 && n < 10);
  }
});

test("uuid", () => {
  const uuid = util.uuid();
  console.log("uuid", uuid);
  const num = uuid.match(/[0-9a-f]{8}\-[0-9a-f]{4}\-[0-9a-f]{4}\-[0-9a-f]{4}\-[0-9a-f]{12}/);
  assert(num !== null);
});

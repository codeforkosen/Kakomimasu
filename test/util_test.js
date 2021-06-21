import util from "../util.js";
import { assert } from "../asserts.js";

Deno.test("rnd", () => {
  for (let i = 0; i < 100; i++) {
    const n = util.rnd(10);
    assert(n >= 0 && n < 10);
  }
});

Deno.test("uuid", () => {
  const uuid = util.uuid();
  //console.log("uuid", uuid);
  const num = uuid.match(
    /^[0-9a-f]{8}\-[0-9a-f]{4}\-4[0-9a-f]{3}\-[89ab][0-9a-f]{3}\-[0-9a-f]{12}$/,
  );
  assert(num !== null);
});

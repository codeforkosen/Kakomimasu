import util from "../../util.js";
import { assert } from "./deps.ts";

Deno.test("rnd", () => {
  for (let i = 0; i < 100; i++) {
    const n = util.rnd(10);
    assert(n >= 0 && n < 10);
  }
});

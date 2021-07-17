import { assert, v4 } from "../deps.ts";
import { randomUUID } from "../apiserver_util.ts";

Deno.test("randamUUID", () => {
  const uuid = randomUUID();
  assert(v4.validate(uuid));
});

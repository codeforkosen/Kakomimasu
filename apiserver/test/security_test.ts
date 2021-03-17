import { assertEquals } from "https://deno.land/std@0.67.0/testing/asserts.ts";

const host = "http://localhost:8880";

Deno.test("fetch img ok", async () => {
  const path = "/img/kakomimasu-logo.png";
  //console.log(path);
  const res = await fetch(host + path);
  await res.arrayBuffer();
  //console.log("res", res);
  assertEquals(200, res.status);
});

Deno.test("fetch illegal failed", async () => {
  const path = "/img/.../img/kakomimasu-logo.png";
  //console.log(path);
  const res = await fetch(host + path);
  //console.log("res", res);
  await res.arrayBuffer();
  assertEquals(404, res.status);
});

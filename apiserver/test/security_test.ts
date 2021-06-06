import { assertEquals } from "../deps.ts";

import * as util from "../apiserver_util.ts";
const resolve = util.pathResolver(import.meta);

const host = "http://localhost:8880";

Deno.test("fetch img ok", async () => {
  const path = "/img/kakomimasu-logo.png";
  //console.log(path);
  const res = await fetch(host + path);
  await res.arrayBuffer();
  //console.log("res", res);
  assertEquals(200, res.status);
});

// 存在しないファイルにアクセスした場合にはpages/layout.htmlを返す
Deno.test("fetch illegal failed", async () => {
  const path = "/img/.../img/kakomimasu-logo.png";
  //console.log(path);
  const res = await fetch(host + path);
  //console.log("res", res);
  const body = await res.text();
  //console.log(body);

  const html = Deno.readTextFileSync(resolve("../../pages/layout.html"));
  //console.log(html);

  assertEquals(body, html);
});

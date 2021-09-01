import { assert, assertEquals } from "../deps.ts";
import { errors } from "../error.ts";
import { randomUUID } from "../apiserver_util.ts";

import ApiClient from "../../client_js/api_client.js";
const ac = new ApiClient();

const authRequiredUrlList = [
  `match`,
  `match/${randomUUID()}/action`,
  `users/delete`,
];

// fetch all urls by no Authorization header
authRequiredUrlList.forEach((url) => {
  Deno.test(`${url} nothing Authorization header`, async () => {
    const res = await fetch("http://localhost:8880/api/" + url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: "{}",
    });
    console.log(res.headers);
    const wwwAuthentiate = res.headers.get("WWW-Authenticate");
    assert(wwwAuthentiate !== null);
    assert(wwwAuthentiate.includes(`Bearer realm="token_required`));
    const body = await res.json();
    //console.log(body);
    //assertEquals(body, errors.INVALID_CONTENT_TYPE);
  });
});

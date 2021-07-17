import { assertEquals } from "../deps.ts";
import { errors } from "../error.ts";
import { randomUUID } from "../apiserver_util.ts";

import ApiClient from "../../client_js/api_client.js";
const ac = new ApiClient();

const urls = [
  `game/create`,
  `match`,
  `match/${randomUUID()}/action`,
  `tournament/create`,
  `tournament/delete`,
  `tournament/add`,
  `users/regist`,
  `users/delete`,
];

// fetch all urls by no Content-Type header
urls.forEach((url) => {
  Deno.test(`${url} without Content-Type header`, async () => {
    const res = await fetch("http://localhost:8880/api/" + url, {
      method: "POST",
      body: "a",
    });
    const body = await res.json();
    assertEquals(body, errors.INVALID_CONTENT_TYPE);
  });
});

// fetch all urls by invalid json
for await (const url of urls) {
  Deno.test(`${url} with invalid json`, async () => {
    const uuid = randomUUID();
    const data = { screenName: uuid, name: uuid, password: uuid };
    const userRes = await ac.usersRegist(data);
    if (!userRes.success) new Error("Could not create user");

    const res = await fetch("http://localhost:8880/api/" + url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + userRes.data.bearerToken,
      },
      body: "{",
    });
    const body = await res.json();
    assertEquals(body, errors.INVALID_SYNTAX);

    await ac.usersDelete({}, "Bearer " + userRes.data.bearerToken);
  });
}

import { assertEquals, v4 } from "../deps.ts";
import { errors } from "../error.ts";

const urls = [
  `game/create`,
  `match`,
  `match/${v4.generate()}/action`,
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

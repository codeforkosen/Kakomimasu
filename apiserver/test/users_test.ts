import {
  assert,
  assertEquals,
} from "https://deno.land/std@0.90.0/testing/asserts.ts";
import { v4 } from "https://deno.land/std@0.89.0/uuid/mod.ts";

import ApiClient from "../api_client.js";
const ac = new ApiClient();

import { pathResolver } from "../apiserver_util.ts";
const resolve = pathResolver(import.meta);

import { ErrorType } from "../error.ts";

const save = (fileName: string, data: object) => {
  Deno.writeTextFileSync(
    resolve(`./sample/${fileName}.json`),
    JSON.stringify(data),
  );
};
const read = (fileName: string) => {
  return JSON.parse(
    Deno.readTextFileSync(resolve(`./sample/${fileName}.json`)),
  );
};

Deno.test("users regist:normal", async () => {
  const res = await ac.usersRegist({
    screenName: "A-1",
    name: "a1",
    password: "pw",
    option: { dryRun: true },
  });
  //save("usersRegist", res);

  assert(v4.validate(res.id));
  const sample = read("usersRegist");

  res.id = sample.id = undefined;
  assertEquals(res, sample);
});

Deno.test("users regist:not password", async () => {
  const data: any = {
    screenName: "A-1",
    name: "a1",
    password: undefined,
    option: { dryRun: true },
  };
  {
    const res = await ac.usersRegist(data);
    assertEquals(res.errorCode, ErrorType.NOT_PASSWORD);
  }
  {
    data.password = null;
    const res = await ac.usersRegist(data);
    assertEquals(res.errorCode, ErrorType.NOT_PASSWORD);
  }
  {
    data.password = "";
    const res = await ac.usersRegist(data);
    assertEquals(res.errorCode, ErrorType.NOT_PASSWORD);
  }
});

Deno.test("users regist:invalid screenName", async () => {
  const data: any = {
    screenName: undefined,
    name: "a1",
    password: "pw",
    option: { dryRun: true },
  };
  {
    const res = await ac.usersRegist(data);
    assertEquals(res.errorCode, ErrorType.INVALID_SCREEN_NAME);
  }
  {
    data.screenName = null;
    const res = await ac.usersRegist(data);
    assertEquals(res.errorCode, ErrorType.INVALID_SCREEN_NAME);
  }
  {
    data.screenName = "";
    const res = await ac.usersRegist(data);
    assertEquals(res.errorCode, ErrorType.INVALID_SCREEN_NAME);
  }
});

Deno.test("users regist:invalid name", async () => {
  const data: any = {
    screenName: "A-1",
    name: undefined,
    password: "pw",
    option: { dryRun: true },
  };
  {
    const res = await ac.usersRegist(data);
    assertEquals(res.errorCode, ErrorType.INVALID_NAME);
  }
  {
    data.name = null;
    const res = await ac.usersRegist(data);
    assertEquals(res.errorCode, ErrorType.INVALID_NAME);
  }
  {
    data.name = "";
    const res = await ac.usersRegist(data);
    assertEquals(res.errorCode, ErrorType.INVALID_NAME);
  }
});

// すでに同じユーザ名が登録されていた時のテストが必要

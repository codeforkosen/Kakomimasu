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
    resolve(`./sample_/${fileName}.json`),
    JSON.stringify(data),
  );
};
const read = (fileName: string) => {
  return JSON.parse(
    Deno.readTextFileSync(resolve(`./sample_/${fileName}.json`)),
  );
};

const uuid = v4.generate();
const data: any = {
  screenName: uuid,
  name: uuid,
  password: uuid,
};

const assertUser = (user: any, sample: any | undefined = undefined) => {
  let user_ = Object.assign({}, user);
  let sample_ = Object.assign({}, sample);
  assert(v4.validate(user_.id));
  if (!sample_) {
    //save("usersRegist", res);
    sample_ = read("usersRegist");
  } else {
    delete sample_.password;
    sample_.gamesId = [];
  }
  user_.id = sample_.id = undefined;
  assertEquals(user_, sample_);
};

Deno.test("users regist:normal", async () => {
  const res = await ac.usersRegist({
    ...data,
    option: { dryRun: true },
  });
  assertUser(res, data);
});
Deno.test("users regist:not password", async () => {
  const data_: any = {
    ...data,
    password: undefined,
    option: { dryRun: true },
  };
  {
    const res = await ac.usersRegist(data_);
    assertEquals(res.errorCode, ErrorType.NOT_PASSWORD);
  }
  {
    data_.password = null;
    const res = await ac.usersRegist(data_);
    assertEquals(res.errorCode, ErrorType.NOT_PASSWORD);
  }
  {
    data_.password = "";
    const res = await ac.usersRegist(data_);
    assertEquals(res.errorCode, ErrorType.NOT_PASSWORD);
  }
});
Deno.test("users regist:invalid screenName", async () => {
  const data_: any = {
    ...data,
    screenName: undefined,
    option: { dryRun: true },
  };
  {
    const res = await ac.usersRegist(data_);
    assertEquals(res.errorCode, ErrorType.INVALID_SCREEN_NAME);
  }
  {
    data_.screenName = null;
    const res = await ac.usersRegist(data_);
    assertEquals(res.errorCode, ErrorType.INVALID_SCREEN_NAME);
  }
  {
    data_.screenName = "";
    const res = await ac.usersRegist(data_);
    assertEquals(res.errorCode, ErrorType.INVALID_SCREEN_NAME);
  }
});
Deno.test("users regist:invalid name", async () => {
  const data_: any = {
    ...data,
    name: undefined,
    option: { dryRun: true },
  };
  {
    const res = await ac.usersRegist(data_);
    assertEquals(res.errorCode, ErrorType.INVALID_NAME);
  }
  {
    data_.name = null;
    const res = await ac.usersRegist(data_);
    assertEquals(res.errorCode, ErrorType.INVALID_NAME);
  }
  {
    data_.name = "";
    const res = await ac.usersRegist(data_);
    assertEquals(res.errorCode, ErrorType.INVALID_NAME);
  }
});
Deno.test("users regist:already registered name", async () => {
  let res = await ac.usersRegist(data);
  assertUser(res, data);
  data.id = res.id;

  res = await ac.usersRegist(data);
  assertEquals(res.errorCode, ErrorType.ALREADY_REGISTERED_NAME);
});

Deno.test("users delete:normal by name", async () => {
  const res = await ac.usersDelete({
    name: data.name,
    password: data.password,
    option: { dryRun: true },
  });
  assertUser(res, data);
});
Deno.test("users delete:normal by id", async () => {
  const res = await ac.usersDelete({
    id: data.id,
    password: data.password,
    option: { dryRun: true },
  });
  assertUser(res, data);
});
Deno.test("users delete:not password", async () => {
  const data_: any = {
    ...data,
    password: undefined,
    option: { dryRun: true },
  };
  {
    const res = await ac.usersDelete(data_);
    assertEquals(res.errorCode, ErrorType.NOT_PASSWORD);
  }
  {
    data_.password = null;
    const res = await ac.usersRegist(data_);
    assertEquals(res.errorCode, ErrorType.NOT_PASSWORD);
  }
  {
    data_.password = "";
    const res = await ac.usersRegist(data_);
    assertEquals(res.errorCode, ErrorType.NOT_PASSWORD);
  }
});
Deno.test("users delete:not user", async () => {
  let res;
  res = await ac.usersDelete({
    password: data.password,
    option: { dryRun: true },
  });
  assertEquals(res.errorCode, ErrorType.NOT_USER);
});
Deno.test("users delete:normal no dryrun", async () => {
  let res;
  res = await ac.usersDelete({ ...data });
  assertUser(res, data);
});

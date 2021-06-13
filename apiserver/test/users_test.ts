import { assert, assertEquals, v4 } from "../deps.ts";

import ApiClient from "../../client_js/api_client.js";
const ac = new ApiClient();

import { pathResolver } from "../apiserver_util.ts";
const resolve = pathResolver(import.meta);

import { errors } from "../error.ts";

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
  let user_ = { ...user };
  let sample_ = { ...sample };
  assert(v4.validate(user_.id));
  assert(v4.validate(user_.accessToken));
  if (!sample_) {
    //save("usersRegist", res);
    sample_ = read("usersRegist");
  } else {
    //delete sample_.password;
    sample_.gamesId = [];
  }
  user_.id = sample_.id = undefined;
  user_.accessToken = sample_.accessToken = undefined;
  assertEquals(user_, sample_);
};

// /api/users/regist Test
// テスト項目
// 正常・パスワード無し・表示名無し・名前無し・登録済みのユーザ
Deno.test("users regist:normal", async () => {
  const res = await ac.usersRegist({
    ...data,
    option: { dryRun: true },
  });
  assertUser(res.data, data);
});
Deno.test("users regist:not password", async () => {
  const data_: any = {
    ...data,
    password: undefined,
    option: { dryRun: true },
  };
  {
    const res = await ac.usersRegist(data_);
    assertEquals(res.data, errors.NOTHING_PASSWORD);
  }
  {
    data_.password = null;
    const res = await ac.usersRegist(data_);
    assertEquals(res.data, errors.NOTHING_PASSWORD);
  }
  {
    data_.password = "";
    const res = await ac.usersRegist(data_);
    assertEquals(res.data, errors.NOTHING_PASSWORD);
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
    assertEquals(res.data, errors.INVALID_SCREEN_NAME);
  }
  {
    data_.screenName = null;
    const res = await ac.usersRegist(data_);
    assertEquals(res.data, errors.INVALID_SCREEN_NAME);
  }
  {
    data_.screenName = "";
    const res = await ac.usersRegist(data_);
    assertEquals(res.data, errors.INVALID_SCREEN_NAME);
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
    assertEquals(res.data, errors.INVALID_USER_NAME);
  }
  {
    data_.name = null;
    const res = await ac.usersRegist(data_);
    assertEquals(res.data, errors.INVALID_USER_NAME);
  }
  {
    data_.name = "";
    const res = await ac.usersRegist(data_);
    assertEquals(res.data, errors.INVALID_USER_NAME);
  }
});
Deno.test("users regist:already registered name", async () => {
  let res = await ac.usersRegist(data);
  assertUser(res.data, data);
  data.id = res.data.id;

  res = await ac.usersRegist(data);
  assertEquals(res.data, errors.ALREADY_REGISTERED_NAME);
});

// /api/users/show Test
// テスト項目
// 正常(名前・ID)・ユーザ無し
Deno.test("users show:normal by name", async () => {
  let res = await ac.usersShow(data.name, data.password);
  assertUser(res.data, data);
});
Deno.test("users show:normal by id", async () => {
  let res = await ac.usersShow(data.id);
  assertUser(res.data, data);
});
Deno.test("users show:not user", async () => {
  let res = await ac.usersShow(v4.generate());
  assertEquals(res.data, errors.NOT_USER);
});

// /api/users/search Test
// テスト項目
// 正常(名前・ID)・クエリ無し
Deno.test("users search:normal by name", async () => {
  const res = await ac.usersSearch(data.name);
  assertUser(res.data[0], data);
});
Deno.test("users search:normal by id", async () => {
  const res = await ac.usersSearch(data.id);
  assertUser(res.data[0], data);
});
Deno.test("users search:no query", async () => {
  {
    const res = await ac.usersSearch("");
    assertEquals(res.data, errors.NOTHING_SEARCH_QUERY);
  }
  {
    const res = await ac._fetchToJson(`/users/search`);
    assertEquals(res, errors.NOTHING_SEARCH_QUERY);
  }
});

// /api/users/delete Test
// テスト項目
// 正常(名前で削除・IDで削除)・パスワード無し・ユーザ無し
Deno.test("users delete:normal by name", async () => {
  const res = await ac.usersDelete({
    name: data.name,
    password: data.password,
    option: { dryRun: true },
  });
  assertUser(res.data, data);
});
Deno.test("users delete:normal by id", async () => {
  const res = await ac.usersDelete({
    id: data.id,
    password: data.password,
    option: { dryRun: true },
  });
  assertUser(res.data, data);
});
Deno.test("users delete:not password", async () => {
  const data_: any = {
    ...data,
    password: undefined,
    option: { dryRun: true },
  };
  {
    const res = await ac.usersDelete(data_);
    assertEquals(res.data, errors.NOTHING_PASSWORD);
  }
  {
    data_.password = null;
    const res = await ac.usersRegist(data_);
    assertEquals(res.data, errors.NOTHING_PASSWORD);
  }
  {
    data_.password = "";
    const res = await ac.usersRegist(data_);
    assertEquals(res.data, errors.NOTHING_PASSWORD);
  }
});
Deno.test("users delete:not user", async () => {
  let res;
  res = await ac.usersDelete({
    password: data.password,
    option: { dryRun: true },
  });
  assertEquals(res.data, errors.NOT_USER);
});
Deno.test("users delete:normal no dryrun", async () => {
  let res;
  res = await ac.usersDelete({ ...data });
  assertUser(res.data, data);
});

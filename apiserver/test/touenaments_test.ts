import {
  assert,
  assertEquals,
} from "https://deno.land/std@0.90.0/testing/asserts.ts";
import { v4 } from "https://deno.land/std@0.89.0/uuid/mod.ts";

import ApiClient from "../api_client.js";
const ac = new ApiClient();

import { errors } from "../error.ts";

const typelist = ["round-robin", "knockout"];
const assertType = (type: string) => {
  return typelist.some((e) => e === type);
};

const assertTournament = (tournament: any, sample: any = {}) => {
  const tournament_ = Object.assign({}, tournament);
  const sample_ = Object.assign({}, sample);
  assert(v4.validate(tournament_.id));
  assertType(tournament_.type);
  assert(typeof tournament_.users, "array");
  assert(typeof tournament_.gameIds, "array");

  if (!sample_.id) tournament_.id = sample_.id = undefined;
  if (!sample_.type) tournament_.type = sample_.type = undefined;
  if (!sample_.name) tournament_.name = sample_.name = undefined;
  if (!sample_.organizer) tournament_.organizer = sample_.organizer = undefined;
  if (!sample_.remarks) tournament_.remarks = sample_.remarks = undefined;
  if (!sample_.users) tournament_.users = sample_.users = undefined;
  if (!sample_.gameIds) tournament_.gameIds = sample_.gameIds = undefined;

  assertEquals(tournament_, sample_);
};

const uuid = v4.generate();

const data: any = {
  name: uuid,
  type: "round-robin",
};

// /api/tournament/create Test
// テスト項目
// 正常(round-robin・knockout)・大会名無し・大会種別無し
Deno.test("api/tournament/create:normal", async () => {
  let res = await ac.tournamentsCreate({
    ...data,
    option: { dryRun: true },
  });
  assertTournament(res.data, data);

  res = await ac.tournamentsCreate({
    ...data,
    type: "knockout",
    option: { dryRun: true },
  });
  assertTournament(res.data, { ...data, type: "knockout" });
});
Deno.test("api/tournament/create:invalid tournament name", async () => {
  {
    const res = await ac.tournamentsCreate({
      ...data,
      name: "",
      option: { dryRun: true },
    });
    assertEquals(res.data, errors.INVALID_TOURNAMENT_NAME);
  }
  {
    const res = await ac.tournamentsCreate({
      ...data,
      name: undefined,
      option: { dryRun: true },
    });
    assertEquals(res.data, errors.INVALID_TOURNAMENT_NAME);
  }
  {
    const res = await ac.tournamentsCreate({
      ...data,
      name: null,
      option: { dryRun: true },
    });
    assertEquals(res.data, errors.INVALID_TOURNAMENT_NAME);
  }
});
Deno.test("api/tournament/create:invalid tournament type", async () => {
  {
    const res = await ac.tournamentsCreate({
      ...data,
      type: "",
      option: { dryRun: true },
    });
    assertEquals(res.data, errors.INVALID_TYPE);
  }
  {
    const res = await ac.tournamentsCreate({
      ...data,
      type: undefined,
      option: { dryRun: true },
    });
    assertEquals(res.data, errors.INVALID_TYPE);
  }
  {
    const res = await ac.tournamentsCreate({
      ...data,
      type: null,
      option: { dryRun: true },
    });
    assertEquals(res.data, errors.INVALID_TYPE);
  }
  {
    const res = await ac.tournamentsCreate({
      ...data,
      type: "round-robins",
      option: { dryRun: true },
    });
    assertEquals(res.data, errors.INVALID_TYPE);
  }
});
Deno.test("api/tournament/create:normal by no dryRun", async () => {
  const res = await ac.tournamentsCreate(data);
  assertTournament(res.data, data);

  data.id = res.data.id;
});

// /api/tournament/get Test
// テスト項目
// 正常（1大会・全大会）・ID無し
Deno.test("api/tournament/get:normal by single", async () => {
  const res = await ac.tournamentsGet(data.id);
  assertTournament(res.data, data);
});
Deno.test("api/tournament/get:normal by all", async () => {
  const res = await ac.tournamentsGet(); // as Array<any>;
  if (res.success === false) assert(false);
  res.data.forEach((e: any) => assertTournament(e));
});
Deno.test("api/tournament/get:nothing tournament id", async () => {
  const res = await ac.tournamentsGet(v4.generate());
  assertEquals(res.data, errors.NOTHING_TOURNAMENT_ID);
});

// /api/tournament/add Test
// テスト項目
// 正常、ID無し、user無し、存在しない大会ID、存在しないユーザ、登録済みのユーザ
Deno.test("api/tournament/add:normal", async () => {
  const uuid = v4.generate();
  const userData = { screenName: uuid, name: uuid, password: uuid };
  const userRes = await ac.usersRegist(userData);

  const res = await ac.tournamentsAddUser(data.id, {
    user: userRes.data.id,
    option: { dryRun: true },
  });

  await ac.usersDelete(userData);
  assertTournament(res.data, { ...data, users: [userRes.data.id] });
});
Deno.test("api/tournament/add:tournament that do not exist", async () => {
  {
    const res = await ac.tournamentsAddUser(v4.generate(), {
      option: { dryRun: true },
    });
    assertEquals(res.data, errors.INVALID_TOURNAMENT_ID);
  }
});
Deno.test("api/tournament/add:invalid tournament id", async () => {
  {
    const res = await ac.tournamentsAddUser("", {
      option: { dryRun: true },
    });
    assertEquals(res.data, errors.INVALID_TOURNAMENT_ID);
  }
  {
    const res = await ac.tournamentsAddUser(undefined, {
      option: { dryRun: true },
    });
    assertEquals(res.data, errors.INVALID_TOURNAMENT_ID);
  }
  {
    const res = await ac.tournamentsAddUser(null, {
      option: { dryRun: true },
    });
    assertEquals(res.data, errors.INVALID_TOURNAMENT_ID);
  }
});
Deno.test("api/tournament/add:nothing user", async () => {
  {
    const res = await ac.tournamentsAddUser(data.id, {
      user: "",
      option: { dryRun: true },
    });
    assertEquals(res.data, errors.INVALID_USER_IDENTIFIER);
  }
  {
    const res = await ac.tournamentsAddUser(data.id, {
      user: undefined,
      option: { dryRun: true },
    });
    assertEquals(res.data, errors.INVALID_USER_IDENTIFIER);
  }
  {
    const res = await ac.tournamentsAddUser(data.id, {
      user: null,
      option: { dryRun: true },
    });
    assertEquals(res.data, errors.INVALID_USER_IDENTIFIER);
  }
});
Deno.test("api/tournament/add:user that do not exist", async () => {
  {
    const res = await ac.tournamentsAddUser(data.id, {
      user: v4.generate(),
      option: { dryRun: true },
    });
    assertEquals(res.data, errors.NOT_USER);
  }
});
Deno.test("api/tournament/add:already registed user", async () => {
  const uuid = v4.generate();
  const userData = { screenName: uuid, name: uuid, password: uuid };
  const userRes = await ac.usersRegist(userData);

  await ac.tournamentsAddUser(data.id, { user: userRes.data.id });
  const res = await ac.tournamentsAddUser(data.id, { user: userRes.data.id });

  await ac.usersDelete(userData);
  assertEquals(res.data, errors.ALREADY_REGISTERED_USER);
});

// /api/tournament/delete Test
// テスト項目
// 正常・ID無し
Deno.test("api/tournament/delete:normal", async () => {
  const res = await ac.tournamentsDelete({
    id: data.id,
    option: { dryRun: true },
  });
  assertTournament(res, data);
});
Deno.test("api/tournament/delete:invalid tournament id", async () => {
  {
    const res = await ac.tournamentsDelete({
      id: "",
      option: { dryRun: true },
    });
    assertEquals(res, errors.INVALID_TOURNAMENT_ID);
  }
  {
    const res = await ac.tournamentsDelete({
      id: undefined,
      option: { dryRun: true },
    });
    assertEquals(res, errors.INVALID_TOURNAMENT_ID);
  }
  {
    const res = await ac.tournamentsDelete({
      id: null,
      option: { dryRun: true },
    });
    assertEquals(res, errors.INVALID_TOURNAMENT_ID);
  }
});
Deno.test("api/tournament/delete:nothing tournament id", async () => {
  const res = await ac.tournamentsDelete({
    id: v4.generate(),
    option: { dryRun: true },
  });
  assertEquals(res, errors.NOTHING_TOURNAMENT_ID);
});
Deno.test("api/tournament/delete:normal by no dryRun", async () => {
  const res = await ac.tournamentsDelete({ id: data.id });
  assertTournament(res, data);
});

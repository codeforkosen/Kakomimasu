import {
  assert,
  assertEquals,
} from "https://deno.land/std@0.90.0/testing/asserts.ts";
import { v4 } from "https://deno.land/std@0.89.0/uuid/mod.ts";

import ApiClient from "../api_client.js";
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

  //sample_.organizer = "";
  //sample_.remarks = "";
  //sample_.users = [];
  //sample_.gameIds = [];

  if (!sample_.id) tournament_.id = sample_.id = undefined;
  if (!sample_.type) tournament_.type = sample_.type = undefined;
  if (!sample_.name) tournament_.name = sample_.name = undefined;
  if (!sample_.organizer) tournament_.organizer = sample_.organizer = undefined;
  else sample_.organizer = "";
  if (!sample_.remarks) tournament_.remarks = sample_.remarks = undefined;
  else sample_.remarks = "";
  if (!sample_.users) tournament_.users = sample_.users = undefined;
  else sample_.users = [];
  if (!sample_.gameIds) tournament_.gameIds = sample_.gameIds = undefined;
  else sample_.gameIds = [];

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
  assertTournament(res, data);

  res = await ac.tournamentsCreate({
    ...data,
    type: "knockout",
    option: { dryRun: true },
  });
  assertTournament(res, { ...data, type: "knockout" });
});
Deno.test("api/tournament/create:invalid tournament name", async () => {
  {
    const res = await ac.tournamentsCreate({
      ...data,
      name: "",
      option: { dryRun: true },
    });
    assertEquals(res, errors.INVALID_TOURNAMENT_NAME);
  }
  {
    const res = await ac.tournamentsCreate({
      ...data,
      name: undefined,
      option: { dryRun: true },
    });
    assertEquals(res, errors.INVALID_TOURNAMENT_NAME);
  }
  {
    const res = await ac.tournamentsCreate({
      ...data,
      name: null,
      option: { dryRun: true },
    });
    assertEquals(res, errors.INVALID_TOURNAMENT_NAME);
  }
});
Deno.test("api/tournament/create:invalid tournament type", async () => {
  {
    const res = await ac.tournamentsCreate({
      ...data,
      type: "",
      option: { dryRun: true },
    });
    assertEquals(res, errors.INVALID_TYPE);
  }
  {
    const res = await ac.tournamentsCreate({
      ...data,
      type: undefined,
      option: { dryRun: true },
    });
    assertEquals(res, errors.INVALID_TYPE);
  }
  {
    const res = await ac.tournamentsCreate({
      ...data,
      type: null,
      option: { dryRun: true },
    });
    assertEquals(res, errors.INVALID_TYPE);
  }
  {
    const res = await ac.tournamentsCreate({
      ...data,
      type: "round-robins",
      option: { dryRun: true },
    });
    assertEquals(res, errors.INVALID_TYPE);
  }
});
Deno.test("api/tournament/create:normal by no dryRun", async () => {
  const res = await ac.tournamentsCreate(data);
  assertTournament(res, data);

  data.id = res.id;
});

// /api/tournament/get Test
// テスト項目
// 正常（1大会・全大会）・ID無し
Deno.test("api/tournament/get:normal by single", async () => {
  const res = await ac.tournamentsGet(data.id);
  assertTournament(res, data);
});
Deno.test("api/tournament/get:normal by all", async () => {
  const res = await ac.tournamentsGet() as Array<any>;
  res.forEach((e) => assertTournament(e));
});
Deno.test("api/tournament/get:nothing tournament id", async () => {
  const res = await ac.tournamentsGet(v4.generate());
  assertEquals(res, errors.NOTHING_TOURNAMENT_ID);
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

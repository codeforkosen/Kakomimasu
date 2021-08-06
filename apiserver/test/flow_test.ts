import { assert, assertEquals, v4 } from "../deps.ts";

//import { assert, assertEquals, test } from "../../asserts.js";
import { pathResolver, randomUUID } from "../apiserver_util.ts";
import { diffTime, sleep } from "./client_util.ts";

// @deno-types=../../client_js/api_client.d.ts
import ApiClient from "../../client_js/api_client.js";
const ac = new ApiClient();

const resolve = pathResolver(import.meta);

const testScreenName = "高専太郎";
const testName = randomUUID();
const testPassword = "nit-taro-pw";
const testSpec = "test";

var bearerToken = "";
var userId = "";
var gameId = "";

Deno.test("regist user", async () => {
  const sampleFilePath = resolve("./sample/userRegist_sample.json");

  const res = await ac.usersRegist({
    screenName: testScreenName,
    name: testName,
    password: testPassword,
  });
  if (res.success === false) {
    throw Error("Response Error. ErrorCode:" + res.data.errorCode);
  }
  //Deno.writeTextFileSync(sampleFilePath, JSON.stringify(res.data));

  userId = res.data.id;
  bearerToken = res.data.bearerToken;

  const sample = JSON.parse(Deno.readTextFileSync(sampleFilePath));
  sample.name = testName;
  assert(v4.validate(res.data.id));
  assert(v4.validate(res.data.bearerToken));
  res.data.id = sample.id = "";
  res.data.bearerToken = sample.bearerToken = "";
  assertEquals(sample, res.data);
});

Deno.test("show user", async () => {
  const sampleFilePath = resolve("./sample/userShow_sample.json");

  const res = await ac.usersShow(testName, `Basic ${testName}:${testPassword}`);
  if (res.success === false) {
    throw Error("Response Error. ErrorCode:" + res.data.errorCode);
  }
  //Deno.writeTextFileSync(sampleFilePath, JSON.stringify(res.data));

  const sample = JSON.parse(Deno.readTextFileSync(sampleFilePath));
  sample.name = testName;
  assert(v4.validate(res.data.id));
  res.data.bearerToken && v4.validate(res.data.bearerToken);
  res.data.id = sample.id = "";
  res.data.bearerToken = sample.bearerToken = "";
  assertEquals(sample, res.data);
});

Deno.test("create game", async () => {
  const sampleFilePath = resolve("./sample/createGame_sample.json");
  const res = await ac.gameCreate({ name: "test", boardName: "A-1" });
  if (res.success === false) {
    throw Error("Response Error. ErrorCode:" + res.data.errorCode);
  }
  //Deno.writeTextFileSync(sampleFilePath, JSON.stringify(res, null, 2));
  const sample = JSON.parse(Deno.readTextFileSync(sampleFilePath));

  assert(v4.validate(res.data.gameId));
  gameId = res.data.gameId;
  res.data.gameId = sample.gameId = "";
  assertEquals(sample, res.data);
});

Deno.test("match", async () => {
  const sampleFilePath = resolve("./sample/match_sample.json");

  const res = await ac.match(
    { spec: testSpec, gameId },
    `Bearer ${bearerToken}`,
  );
  if (res.success === false) {
    throw Error(
      "Response Error. ErrorCode:" + res.data.errorCode + " " +
        res.data.message,
    );
  }
  await ac.match({ spec: testSpec, gameId: gameId }, `Bearer ${bearerToken}`);
  //Deno.writeTextFileSync(sampleFilePath, JSON.stringify(res.data, null, 2));

  const sample = JSON.parse(Deno.readTextFileSync(sampleFilePath));
  assert(v4.validate(res.data.gameId));
  sample.gameId = res.data.gameId = "";
  sample.userId = userId;
  assertEquals(sample, res.data);
});

Deno.test("get gameinfo", async () => {
  const sampleFilePath = resolve("./sample/matchGameInfo_sample.json");

  const res = await ac.getMatch(gameId);
  if (res.success === false) {
    throw Error("Response Error. ErrorCode:" + res.data.errorCode);
  }
  //console.log(JSON.stringify(res));
  //Deno.writeTextFileSync(sampleFilePath, JSON.stringify(res.data, null, 2));

  const sample = JSON.parse(Deno.readTextFileSync(sampleFilePath));
  assert(v4.validate(res.data.gameId));
  assert(v4.validate(res.data.players[0].id));
  assert(v4.validate(res.data.players[1].id));
  sample.gameId = res.data.gameId = "";
  sample.players[0].id = res.data.players[0].id = "";
  sample.players[1].id = res.data.players[1].id = "";
  sample.startedAtUnixTime = res.data.startedAtUnixTime = 0;
  sample.nextTurnUnixTime = res.data.nextTurnUnixTime = 0;

  assertEquals(sample, res.data);
});

Deno.test("send action", async () => {
  const sampleFilePath = resolve("./sample/afterAction_sample.json");

  let res = await ac.getMatch(gameId);
  if (res.success === false) {
    throw Error("Response Error. ErrorCode:" + res.data.errorCode);
  }
  const gameInfo = res.data;
  if (!gameInfo.startedAtUnixTime) throw Error("startedAtUnixTime is null.");
  await sleep(diffTime(gameInfo.startedAtUnixTime) + 0.3);
  await ac.setAction(gameId, {
    actions: [{ agentId: 0, type: "PUT", x: 1, y: 1 }],
  }, "Bearer " + bearerToken);
  //console.log(reqJson);

  if (!gameInfo.nextTurnUnixTime) throw Error("nextTurnUnixTime is null.");
  await sleep(diffTime(gameInfo.nextTurnUnixTime) + 0.3);
  res = await ac.getMatch(gameId);
  if (res.success === false) {
    throw Error("Response Error. ErrorCode:" + res.data.errorCode);
  }
  //Deno.writeTextFileSync(sampleFilePath, JSON.stringify(res.data, null, 2));

  //console.log(res);
  //console.log(JSON.stringify(reqJson, null, 2));
  const sample = JSON.parse(Deno.readTextFileSync(sampleFilePath));

  assert(v4.validate(res.data.gameId));
  assert(v4.validate(res.data.players[0].id));
  assert(v4.validate(res.data.players[1].id));
  sample.gameId = res.data.gameId = "";
  sample.players[0].id = res.data.players[0].id = "";
  sample.players[1].id = res.data.players[1].id = "";
  sample.startedAtUnixTime = res.data.startedAtUnixTime = 0;
  sample.nextTurnUnixTime = res.data.nextTurnUnixTime = 0;

  assertEquals(sample, res.data);
});

Deno.test("delete user", async () => {
  const res = await ac.usersDelete({}, `Bearer ${bearerToken}`);
  //console.log(res);
  assert(res.success);
});

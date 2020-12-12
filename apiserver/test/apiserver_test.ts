import { v4 } from "https://deno.land/std@0.79.0/uuid/mod.ts";

import { assertEquals, test } from "../../asserts.js";
import { solvedPath } from "../apiserver_util.ts";
import {
  Action,
  createGame,
  diffTime,
  getGameInfo,
  match,
  setAction,
  sleep,
  userDelete,
  userRegist,
  userShow,
} from "./client_util.ts";

const testScreenName = "高専太郎";
const testName = v4.generate();
const testPassword = "nit-taro-pw";
const testSpec = "test";

var userId = "";
var accessToken = "";
var gameId = "";

Deno.test("regist user", async () => {
  const sampleFilePath = solvedPath(
    import.meta.url,
    "./sample/userRegist_sample.json",
  );

  const res = await userRegist(testScreenName, testName, testPassword);
  //Deno.writeTextFileSync(sampleFilePath, JSON.stringify(res));

  userId = res.id;

  const sample = JSON.parse(Deno.readTextFileSync(sampleFilePath));
  sample.name = testName;
  tokenCheck(res.id);
  res.id = sample.id = "";
  assertEquals(sample, res);
});

Deno.test("show user", async () => {
  const sampleFilePath = solvedPath(
    import.meta.url,
    "./sample/userShow_sample.json",
  );

  var res = await userShow(testName);
  //Deno.writeTextFileSync(sampleFilePath, JSON.stringify(res));

  const sample = JSON.parse(Deno.readTextFileSync(sampleFilePath));
  sample.name = testName;
  tokenCheck(res.id);
  res.id = sample.id = "";
  assertEquals(sample, res);
});

Deno.test("create game", async () => {
  const sampleFilePath = solvedPath(
    import.meta.url,
    "./sample/createGame_sample.json",
  );
  const res = await createGame("test", "A-1");
  //Deno.writeTextFileSync(sampleFilePath, JSON.stringify(res, null, 2));
  const sample = JSON.parse(Deno.readTextFileSync(sampleFilePath));

  tokenCheck(res.gameId);
  gameId = res.gameId;
  res.gameId = sample.gameId = "";
  assertEquals(sample, res);
});

Deno.test("match", async () => {
  const sampleFilePath = solvedPath(
    import.meta.url,
    "./sample/match_sample.json",
  );

  const res = await match(
    { name: testName, password: testPassword, spec: testSpec, gameId: gameId },
  );
  await match(
    { id: userId, password: testPassword, spec: testSpec, gameId: gameId },
  );
  //Deno.writeTextFileSync(sampleFilePath, JSON.stringify(res, null, 2));
  accessToken = res.accessToken;

  const sample = JSON.parse(Deno.readTextFileSync(sampleFilePath));

  tokenCheck(res.accessToken);
  tokenCheck(res.gameId);
  sample.accessToken = res.accessToken = "";
  sample.gameId = res.gameId = "";
  sample.userId = userId;
  assertEquals(sample, res);
});

Deno.test("get gameinfo", async () => {
  const sampleFilePath = solvedPath(
    import.meta.url,
    "./sample/matchGameInfo_sample.json",
  );

  const res = await getGameInfo(gameId);
  //console.log(JSON.stringify(res));
  //Deno.writeTextFileSync(sampleFilePath, JSON.stringify(res, null, 2));

  const sample = JSON.parse(Deno.readTextFileSync(sampleFilePath));

  tokenCheck(res.gameId);
  tokenCheck(res.players[0].id);
  tokenCheck(res.players[1].id);
  sample.gameId = res.gameId = "";
  sample.players[0].id = res.players[0].id = "";
  sample.players[1].id = res.players[1].id = "";
  sample.startedAtUnixTime = res.startedAtUnixTime = 0;
  sample.nextTurnUnixTime = res.nextTurnUnixTime = 0;

  assertEquals(sample, res);
});

Deno.test("send action", async () => {
  const sampleFilePath = solvedPath(
    import.meta.url,
    "./sample/afterAction_sample.json",
  );

  const gameInfo = await getGameInfo(gameId);
  await sleep(diffTime(gameInfo.startedAtUnixTime) + 1);
  await setAction(
    gameId,
    accessToken,
    [new Action(0, "PUT", 1, 1)],
  );
  //console.log(reqJson);

  await sleep(diffTime(gameInfo.nextTurnUnixTime) + 1);
  const res = await getGameInfo(gameId);
  //Deno.writeTextFileSync(sampleFilePath, JSON.stringify(res, null, 2));

  //console.log(res);
  //console.log(JSON.stringify(reqJson, null, 2));
  const sample = JSON.parse(Deno.readTextFileSync(sampleFilePath));

  tokenCheck(res.gameId);
  tokenCheck(res.players[0].id);
  tokenCheck(res.players[1].id);
  sample.gameId = res.gameId = "";
  sample.players[0].id = res.players[0].id = "";
  sample.players[1].id = res.players[1].id = "";
  sample.startedAtUnixTime = res.startedAtUnixTime = 0;
  sample.nextTurnUnixTime = res.nextTurnUnixTime = 0;

  assertEquals(sample, res);
});

Deno.test("delete user", async () => {
  const res = await userDelete({ name: testName, password: testPassword });
  //console.log(res);
  assertEquals(res.status, 200);
  await res.body?.cancel();
});

function tokenCheck(token: string) {
  const tokenRegExp = new RegExp("^(.{8}-.{4}-.{4}-.{4}-.{12})$");
  if (!tokenRegExp.test(token)) {
    throw new Error(`Different format token "${token}"`);
  }
}

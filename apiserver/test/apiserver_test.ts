import { v4 } from "https://deno.land/std/uuid/mod.ts";

import { test, assertEquals } from "../../asserts.js";
import {
  Action,
  sleep,
  userRegist,
  userShow,
  userDelete,
  match,
  getGameInfo,
  setAction,
  diffTime,
} from "./client_util.ts";

const testScreenName = "高専太郎";
const testName = v4.generate();
const testPassword = "nit-taro-pw";
const testSpec = "test";

var userId = "";
var accessToken = "";
var gameId = "";

await test("regist user", async () => {
  const sampleFilePath = "./sample/userRegist_sample.json";

  const res = await userRegist(testScreenName, testName, testPassword);
  //Deno.writeTextFileSync(sampleFilePath, JSON.stringify(res));

  userId = res.id;

  const sample = JSON.parse(Deno.readTextFileSync(sampleFilePath));
  sample.name = testName;
  tokenCheck(res.id);
  res.id = sample.id = "";
  assertEquals(sample, res);
});

await test("show user", async () => {
  const sampleFilePath = "./sample/userShow_sample.json";

  var res = await userShow(testName);
  //Deno.writeTextFileSync(sampleFilePath, JSON.stringify(res));

  const sample = JSON.parse(Deno.readTextFileSync(sampleFilePath));
  sample.name = testName;
  tokenCheck(res.id);
  res.id = sample.id = "";
  assertEquals(sample, res);
});

await test("get playerToken&gameId", async () => {
  const sampleFilePath = "./sample/match_sample.json";

  const res = await match(
    { name: testName, password: testPassword, spec: testSpec },
  );
  await match({ name: testName, password: testPassword, spec: testSpec });
  //Deno.writeTextFileSync(sampleFilePath, JSON.stringify(res));

  accessToken = res.accessToken;
  gameId = res.gameId;

  const sample = JSON.parse(Deno.readTextFileSync(sampleFilePath));

  tokenCheck(res.accessToken);
  tokenCheck(res.gameId);
  sample.accessToken = res.accessToken = "";
  sample.gameId = res.gameId = "";
  sample.userId = userId;
  assertEquals(sample, res);
});

await test("get gameinfo", async () => {
  const sampleFilePath = "./sample/matchGameInfo_sample.json";

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

await test("send action", async () => {
  const sampleFilePath = "./sample/afterAction_sample.json";

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

await test("delete user", async () => {
  var res = await userDelete({ name: testName, password: testPassword });
  if (res.status !== 200) throw Error("Invalid delete user");
});

function tokenCheck(token: string) {
  const tokenRegExp = new RegExp("^(.{8}-.{4}-.{4}-.{4}-.{12})$");
  if (!tokenRegExp.test(token)) {
    throw new Error(`Different format token "${token}"`);
  }
}

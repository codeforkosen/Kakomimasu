import { test, assertEquals } from "../../asserts.js";
import util from "../../util.js";

const host = "http://localhost:8880";

const testName = "テスト 太郎";
const testSpec = "test";

class Action {
  public agentid: number;
  public type: string;
  public x: number;
  public y: number;

  constructor(agentid: number, type: string, x: number, y: number) {
    this.agentid = agentid;
    this.type = type;
    this.x = x;
    this.y = y;
  }
}

test("get player&roomID", async () => {
  const reqJson = await match(testName, testSpec);
  await match(testName, testSpec);
  assertEquals(reqJson.name, testName);
  assertEquals(reqJson.spec, testSpec);
  tokenCheck(reqJson.playerId);
  tokenCheck(reqJson.roomId);
});

test("get gameinfo", async () => {
  const matchJson = await match(testName, testSpec);
  await match(testName, testSpec);

  const reqJson = await getGameInfo(matchJson.roomId);
  //Deno.writeTextFileSync("info_sample.json", JSON.stringify(reqJson, null, 2));

  const sampleJson = JSON.parse(Deno.readTextFileSync("info_sample.json"));
  tokenCheck(reqJson.roomID);
  tokenCheck(reqJson.players[0].playerID);
  tokenCheck(reqJson.players[1].playerID);
  sampleJson.roomID = reqJson.roomID = "";
  sampleJson.players[0].playerID = reqJson.players[0].playerID = "";
  sampleJson.players[1].playerID = reqJson.players[1].playerID = "";
  sampleJson.startedAtUnixTime = reqJson.startedAtUnixTime = 0;
  sampleJson.nextTurnUnixTime = reqJson.nextTurnUnixTime = 0;

  assertEquals(sampleJson, reqJson);
});

test("send action", async () => {
  const matchJson = await match(testName, testSpec);
  await match(testName, testSpec);

  const gameInfo = await getGameInfo(matchJson.roomId);
  await sleep((diffTime(gameInfo.startedAtUnixTime) + 1) * 1000);
  await setAction(
    matchJson.roomId,
    matchJson.playerId,
    [new Action(0, "PUT", 1, 1)],
  );
  //console.log(reqJson);

  await sleep((diffTime(gameInfo.nextTurnUnixTime) + 1 + 3) * 1000);
  const reqJson = await getGameInfo(matchJson.roomId);
  //Deno.writeTextFileSync("afterAction_sample.json",JSON.stringify(reqJson, null, 2),);

  //console.log(gameInfo2);
  //console.log(JSON.stringify(reqJson, null, 2));
  const sampleJson = JSON.parse(
    Deno.readTextFileSync("afterAction_sample.json"),
  );

  tokenCheck(reqJson.roomID);
  tokenCheck(reqJson.players[0].playerID);
  tokenCheck(reqJson.players[1].playerID);
  sampleJson.roomID = reqJson.roomID = "";
  sampleJson.players[0].playerID = reqJson.players[0].playerID = "";
  sampleJson.players[1].playerID = reqJson.players[1].playerID = "";
  sampleJson.startedAtUnixTime = reqJson.startedAtUnixTime = 0;
  sampleJson.nextTurnUnixTime = reqJson.nextTurnUnixTime = 0;

  assertEquals(sampleJson, reqJson);
});

async function match(name: string, spec: string) {
  const sendJson = { name: name, spec: spec };
  const reqJson = await (await fetch(
    `${host}/match`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(sendJson),
    },
  )).json();
  return reqJson;
}

async function getGameInfo(roomid: string) {
  const reqJson = await (await fetch(`${host}/match/${roomid}`)).json();
  return reqJson;
}

async function setAction(roomid: string, playerid: string, actions: Action[]) {
  const sendJson = {
    time: Math.floor(new Date().getTime() / 1000),
    actions: actions,
  };
  const reqJson = await (await fetch(
    `${host}/match/${roomid}/action`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": playerid,
      },
      body: JSON.stringify(sendJson),
    },
  )).json();
  return reqJson;
}

function tokenCheck(token: string) {
  const tokenRegExp = new RegExp("^(.{8}-.{4}-.{4}-.{4}-.{12})$");
  if (!tokenRegExp.test(token)) {
    throw new Error(`Different format token "${token}"`);
  }
}

function diffTime(unixTime: number) {
  return unixTime - Math.floor(new Date().getTime() / 1000);
}

function sleep(msec: number) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(), msec);
  });
}

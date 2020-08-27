import {
  Action,
  sleep,
  userRegist,
  userShow,
  match,
  getGameInfo,
  setAction,
  diffTime,
} from "./client_util.ts";

const name = `nit-taro1`;
const password = `${name}-pw`;

// ユーザ取得（ユーザがなかったら新規登録）
let user = await userShow(name);
if (user.hasOwnProperty("error")) {
  user = await userRegist(`高専太郎1`, name, password);
}

// プレイヤー登録
const resMatch = await match(
  { id: user.id, password: password, spec: "ポンコツ" },
);
const token = resMatch.accessToken;
const gameId = resMatch.gameId;

let gameInfo;
do {
  gameInfo = await getGameInfo(gameId);
  await sleep(100);
} while (gameInfo.startedAtUnixTime === null);

console.log(gameInfo);

console.log(
  "ゲーム開始時間：",
  new Date(gameInfo.startedAtUnixTime / 1000).toLocaleString("ja-JP"),
);

await sleep(diffTime(gameInfo.startedAtUnixTime + 1));

// ターン1
setAction(
  gameId,
  token,
  [new Action(0, "PUT", 1, 1), new Action(1, "PUT", 3, 3)],
);
await sleep(diffTime(gameInfo.nextTurnUnixTime + 1));

// ターン2
gameInfo = await getGameInfo(gameId);
setAction(
  gameId,
  token,
  [new Action(0, "MOVE", 1, 2), new Action(1, "MOVE", 3, 2)],
);
await sleep(diffTime(gameInfo.nextTurnUnixTime + 1));

// ターン3
gameInfo = await getGameInfo(gameId);
setAction(
  gameId,
  token,
  [new Action(0, "MOVE", 1, 3), new Action(1, "MOVE", 3, 1)],
);
await sleep(diffTime(gameInfo.nextTurnUnixTime + 1));

// ターン4
gameInfo = await getGameInfo(gameId);
setAction(
  gameId,
  token,
  [new Action(0, "MOVE", 2, 3), new Action(1, "MOVE", 2, 1)],
);
await sleep(diffTime(gameInfo.nextTurnUnixTime + 1));

//console.log(await getGameInfo(roomid[0]));

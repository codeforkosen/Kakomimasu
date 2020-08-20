import {
  Action,
  sleep,
  userRegist,
  userShow,
  match,
  getGameInfo,
  setAction,
  diffTime,
} from "./client_util.js";

//const [ token, roomid] = await match(`高専太郎`, "ポンコツ");
const name = `nit-taro2`;
const password = `${name}-pw`;

// ユーザ取得（ユーザがなかったら新規登録）
let user = await userShow(name);
if (user.hasOwnProperty("error")) {
  user = await userRegist(`高専太郎2`, name, password);
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

console.log(
  "ゲーム開始時間：",
  new Date(gameInfo.startedAtUnixTime / 1000).toLocaleString("ja-JP"),
);

await sleep((diffTime(gameInfo.startedAtUnixTime) + 1) * 1000);

// ターン1
setAction(
  gameId,
  token,
  [new Action(0, "PUT", 4, 4), new Action(1, "PUT", 6, 6)],
);
await sleep((diffTime(gameInfo.nextTurnUnixTime) + 3 + 1) * 1000);

// ターン2
gameInfo = await getGameInfo(gameId);
setAction(
  gameId,
  token,
  [new Action(0, "MOVE", 4, 5), new Action(1, "MOVE", 6, 5)],
);
await sleep((diffTime(gameInfo.nextTurnUnixTime) + 3 + 1) * 1000);

// ターン3
gameInfo = await getGameInfo(gameId);
setAction(
  gameId,
  token,
  [new Action(0, "MOVE", 4, 6), new Action(1, "MOVE", 6, 4)],
);
await sleep((diffTime(gameInfo.nextTurnUnixTime) + 3 + 1) * 1000);

// ターン4
gameInfo = await getGameInfo(gameId);
setAction(
  gameId,
  token,
  [new Action(0, "MOVE", 5, 6), new Action(1, "MOVE", 5, 4)],
);
await sleep((diffTime(gameInfo.nextTurnUnixTime) + 3 + 1) * 1000);

//console.log(await getGameInfo(roomid[0]));

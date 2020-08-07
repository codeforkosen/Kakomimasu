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
import util from "../util.js";

//const [ playerid, roomid] = await match(`ふくの`, "ランダム");

const name = `taisukef`;
const password = `${name}-pw`;

// ユーザ取得（ユーザがなかったら新規登録）
let user = await userShow(name);
if (user.hasOwnProperty("error")) {
  user = await userRegist(`ふくの`, name, password);
}

// プレイヤー登録
const resMatch = await match(
  { id: user.id, password: password, spec: "ランダム" },
);
const token = resMatch.accessToken;
const roomid = resMatch.gameId;
const pno = resMatch.index;
console.log("playerid", resMatch, pno);

let gameInfo;
do {
  gameInfo = await getGameInfo(roomid);
  await sleep(100);
} while (gameInfo.startedAtUnixTime === null);

console.log(gameInfo);

console.log(
  "ゲーム開始時間：",
  new Date(gameInfo.startedAtUnixTime * 1000).toLocaleString("ja-JP"),
);

const points = gameInfo.points;
const w = gameInfo.width;
const nplayers = gameInfo.players[pno].agents.length;
const totalTurn = gameInfo.totalTurn;
console.log("totalTurn", totalTurn);

// デタラメに置き、デタラメに動くアルゴリズム

// 8方向、上から時計回り
const DIR = [
  [0, -1],
  [1, -1],
  [1, 0],
  [1, 1],
  [0, 1],
  [-1, 1],
  [-1, 0],
  [-1, -1],
];

// ポイントの高い順ソート
const pntall = points.map((p, idx) => {
  return { x: idx % w, y: Math.floor(idx / w), p: p };
});
const pntsorted = pntall.sort((a, b) => b.p - a.p);

// スタート時間待ち
await sleep(diffTime(gameInfo.startedAtUnixTime));

for (let i = 1; i <= totalTurn; i++) {
  console.log("turn", i);

  // ランダムにずらしつつ置けるだけおく
  // 置いたものはランダムに8方向動かす
  const actions = [];
  const offset = util.rnd(nplayers);
  for (let i = 0; i < nplayers; i++) {
    const agent = gameInfo.players[pno].agents[i];
    console.log(pno, agent);
    if (agent.x === -1) {
      const p = pntsorted[i + offset];
      actions.push(new Action(i, "PUT", p.x, p.y));
    } else {
      for (;;) {
        const [dx, dy] = DIR[util.rnd(8)];
        const x = agent.x + dx;
        const y = agent.y + dy;
        if (x < 0 || x >= w || y < 0 || y >= w)
          continue;
        console.log(x, y);
        actions.push(new Action(i, "MOVE", x, y));
        break;
      }
    }
  }
  setAction(roomid, token, actions);

  if (i < totalTurn) {
    const bknext = gameInfo.nextTurnUnixTime;
    await sleep(diffTime(gameInfo.nextTurnUnixTime));

    for (;;) {
      gameInfo = await getGameInfo(roomid);
      if (gameInfo.nextTurnUnixTime !== bknext) {
        break;
      }
      await sleep(100);
    }
  }
}

// ゲームデータ出力
try {
  Deno.mkdirSync("log");
} catch (e) {}
const fname = `log/${gameInfo.roomID}-player${pno}.log`;
Deno.writeTextFileSync(fname, JSON.stringify(gameInfo, null, 2));

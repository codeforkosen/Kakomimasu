import { Action, sleep, match, getGameInfo, setAction, diffTime } from "./client_util.js";

const [ playerid, roomid] = await match(`ふくの`, "ポンコツ");

import util from "../util.js";

let gameInfo;
do {
  gameInfo = await getGameInfo(roomid);
  await sleep(100);
} while (gameInfo.startedAtUnixTime === null);

console.log(gameInfo);

console.log(
  "ゲーム開始時間：",
  new Date(gameInfo.startedAtUnixTime / 1000).toLocaleString("ja-JP"),
);

const pno = gameInfo.players[0].playerID === playerid ? 0 : 1;
console.log(pno);

const points = gameInfo.points;
const w = gameInfo.width;
const nplayers = gameInfo.players[pno].agents.length;
const totalTurn = gameInfo.totalTurn;
console.log(totalTurn);

// ポイントの高い順ソート
const pntall = points.map((p, idx) => { return { x: idx % w, y: Math.floor(idx / w), p: p }});
const pntsorted = pntall.sort((a, b) => b.p - a.p);

for (let i = 1; i <= totalTurn; i++) {
  console.log("turn", i);
  await sleep((diffTime(gameInfo.startedAtUnixTime) + 1) * 1000);

  // 上から時計回り
  const DIR = [[0, -1], [1, -1], [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1]];

  const actions = [];
  const offset = util.rnd(nplayers);
  for (let i = 0; i < nplayers; i++) {
    const agent = gameInfo.players[pno].agents[i];
    console.log(pno, agent);
    if (agent.x === -1) {
      const p = pntsorted[i + offset];
      actions.push(new Action(i, "PUT", p.x, p.y));
    } else {
      const [dx, dy] = DIR[util.rnd(8)];
      actions.push(new Action(i, "MOVE", agent.x + dx, agent.y + dy));
    }
  }
  setAction(roomid, playerid, actions);
  await sleep((diffTime(gameInfo.nextTurnUnixTime) + 3 + 1) * 1000);
  gameInfo = await getGameInfo(roomid);
}

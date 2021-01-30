// だいたい点数の高い順にデタラメに置き、デタラメに動くアルゴリズム
import { parse } from "https://deno.land/std@0.84.0/flags/mod.ts";

import util from "../util.js";
import { Action, DIR, KakomimasuClient } from "./KakomimasuClient.js";

const args = parse(Deno.args);

const name = `ai-1`;
const password = `${name}-pw`;

const kc = new KakomimasuClient("ai-1", "AI-1", "", "ai-1-pw");

if (args.gameId) {
  kc.gameId = args.gameId;
}
if (args.local) kc.setServerHost("http://localhost:8880");
let gameInfo = await kc.waitMatching();
const roomid = gameInfo.gameId;
const pno = kc.getPlayerNumber();

const points = kc.getPoints();
const w = points[0].length;
const nplayers = gameInfo.players[pno].agents.length;
const totalTurn = gameInfo.totalTurn;
console.log("totalTurn", totalTurn);

// ポイントの高い順ソート
const pntall = points.map((p, idx) => {
  return { x: idx % w, y: Math.floor(idx / w), p: p };
});
const pntsorted = pntall.sort((a, b) => b.p - a.p);

// スタート時間待ち
gameInfo = await kc.waitStart();
console.log(gameInfo);

const log = [gameInfo];
while (gameInfo) {
  console.log("turn", gameInfo.turn);

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
      const [dx, dy] = DIR[util.rnd(8)];
      actions.push(new Action(i, "MOVE", agent.x + dx, agent.y + dy));
    }
  }
  kc.setActions(actions);
  gameInfo = await kc.waitNextTurn();
  log.push(gameInfo);
}

// ゲームデータ出力
try {
  Deno.mkdirSync("log");
} catch (e) { }
const fname = `log/${gameInfo.gameId}-player${pno}.log`;
Deno.writeTextFileSync(fname, JSON.stringify(log, null, 2));

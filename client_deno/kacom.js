// 大きく囲む戦略

import { KakomimasuClient, Action, DIR } from "./KakomimasuClient.js"
import util from "../util.js";

const kc = new KakomimasuClient("taisukef_kacom", "kacom", "kacom", "tf_kacom_kakomimasu" );
// kc.setServerHost("http://localhost:8880"); // ローカルに接続してチェックする場合に使う

let info = await kc.waitMatching();
const pno = kc.getPlayerNumber();
const nagents = kc.getAgentCount();
const points = kc.getPoints();
const w = points[0].length;
const h = points.length;

const line = [];
for (let i = 0; i < w; i++) { line.push([i, 0]); }
for (let i = 1; i < h; i++) { line.push([w - 1, i]); }
for (let i = w - 2; i >= 0; i--) { line.push([i, h - 1 ]); }
for (let i = h - 2; i >= 1; i--) { line.push([0, i]); }

info = await kc.waitStart(); // スタート時間待ち
const field = kc.getField();
while (info) {
  const actions = [];
  for (let i = 0; i < nagents; i++) {
    const agent = info.players[pno].agents[i];
    // console.log(field);
    if (agent.x === -1) { // 置く前？
      const p = line[(line.length / nagents * i) >> 0];
      actions.push(new Action(i, "PUT", p[0], p[1]));
    } else {
      const n = line.findIndex(p => p[0] === agent.x && p[1] === agent.y);
      if (n >= 0) {
        const next = line[(n + 1) % line.length];
        actions.push(new Action(i, "MOVE", next[0], next[1]));
      }
    }
  }
  console.log(actions);
  kc.setActions(actions);
  info = await kc.waitNextTurn();
}

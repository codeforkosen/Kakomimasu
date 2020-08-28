// だいたい点数の高い順にデタラメに置き、デタラメに動くアルゴリズム （KakomimasuClient版）

import { KakomimasuClient, Action, DIR } from "./KakomimasuClient.js"
import util from "../util.js";

const kc = new KakomimasuClient("a3", "デタラメ", "サンプル", "a3-pw" );

let info = await kc.waitMatching();
const pno = kc.getPlayerNumber();
const nagents = kc.getAgentCount();
const points = kc.getPoints();

// ポイントの高い順ソート
const pntall = [];
for (let i = 0; i < points.length; i++) {
  for (let j = 0; j < points[i].length; j++) {
    pntall.push({ x: j, y: i, point: points[i][j] });
  }
}
const pntsorted = pntall.sort((a, b) => b.point - a.point);

info = await kc.waitStart(); // スタート時間待ち
while (info) {
  // ランダムにずらしつつ置けるだけおく
  // 置いたものはランダムに8方向動かす
  const actions = [];
  const offset = util.rnd(nagents);
  for (let i = 0; i < nagents; i++) {
    const agent = info.players[pno].agents[i];
    console.log(pno, agent);
    if (agent.x === -1) { // 置く前?
      const p = pntsorted[i + offset];
      actions.push(new Action(i, "PUT", p.x, p.y));
    } else {
      const [dx, dy] = DIR[util.rnd(8)];
      actions.push(new Action(i, "MOVE", agent.x + dx, agent.y + dy));
    }
  }
  kc.setActions(actions);
  info = await kc.waitNextTurn();
}

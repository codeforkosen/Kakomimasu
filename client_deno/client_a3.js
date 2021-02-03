// だいたい点数の高い順にデタラメに置き、デタラメに動くアルゴリズム （KakomimasuClient版）
import util from "../util.js";
import { KakomimasuClient, Action, DIR, cl } from "./KakomimasuClient.js"

const kc = new KakomimasuClient("ai-3", "AI-3", "デタラメ", "ai-3-pw");

let info = await kc.waitMatching();
const pno = kc.getPlayerNumber();
const points = kc.getPoints();
const w = points[0].length;
const h = points.length;
const nagents = kc.getAgentCount();

// ポイントの高い順ソート
const pntall = [];
for (let i = 0; i < h; i++) {
  for (let j = 0; j < w; j++) {
    pntall.push({ x: j, y: i, point: points[i][j] });
  }
}
const sortByPoint = (p) => {
  p.sort((a, b) => b.point - a.point);
};
sortByPoint(pntall);

// スタート時間待ち
info = await kc.waitStart();
cl(info);

// ↓ここからがAIの中身↓
while (info) {
  // ランダムにずらしつつ置けるだけおく
  // 置いたものはランダムに8方向動かす
  const actions = [];
  const offset = util.rnd(nagents);
  for (let i = 0; i < nagents; i++) {
    const agent = info.players[pno].agents[i];
    cl(pno, agent);
    if (agent.x === -1) { // 置く前?
      const p = pntall[i + offset];
      actions.push(new Action(i, "PUT", p.x, p.y));
    } else {
      const [dx, dy] = DIR[util.rnd(8)];
      actions.push(new Action(i, "MOVE", agent.x + dx, agent.y + dy));
    }
  }
  kc.setActions(actions);
  info = await kc.waitNextTurn();
}

// だいたい点数の高い順にデタラメに置き、画面外を避けつつデタラメに動くアルゴリズム
import util from "../util.js";
import { Action, DIR, KakomimasuClient, cl, args } from "./KakomimasuClient.js";

const kc = new KakomimasuClient("ai-2", "AI-2", "", "ai-2-pw");

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
const log = [info];
while (info) {
  // ランダムにずらしつつ置けるだけおく
  // 置いたものはランダムに8方向動かす
  // 画面外にはでない判定を追加（a1 → a2)
  const actions = [];
  const offset = util.rnd(nagents);
  for (let i = 0; i < nagents; i++) {
    const agent = info.players[pno].agents[i];
    cl(pno, agent);
    if (agent.x === -1) {
      const p = pntall[i + offset];
      actions.push(new Action(i, "PUT", p.x, p.y));
    } else {
      for (; ;) {
        const [dx, dy] = DIR[util.rnd(8)];
        const x = agent.x + dx;
        const y = agent.y + dy;
        if (x < 0 || x >= w || y < 0 || y >= w)
          continue;
        cl(x, y);
        actions.push(new Action(i, "MOVE", x, y));
        break;
      }
    }
  }
  kc.setActions(actions);
  info = await kc.waitNextTurn();
  log.push(info);
}
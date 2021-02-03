// だいたい点数の高い順に置き、点数の高い順に壊しながら動くアルゴリズム （KakomimasuClient版）
import util from "../util.js";
import { KakomimasuClient, Action, DIR, cl } from "./KakomimasuClient.js"

const kc = new KakomimasuClient("ai-4", "AI-4", "破壊者", "ai-4-pw");

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
const sortByPoint = p => {
  p.sort((a, b) => b.point - a.point);
};
sortByPoint(pntall);

// スタート時間待ち
info = await kc.waitStart();
cl(info);

// ↓ここからがAIの中身↓
const field = kc.getField();
while (info) {
  const actions = [];
  const offset = util.rnd(nagents);
  const poschk = []; // 動く予定の場所
  const checkFree = (x, y) => {
    for (let i = 0; i < poschk.length; i++) {
      const p = poschk[i];
      if (p.x === x && p.y === y)
        return false;
    }
    return true;
  };
  for (let i = 0; i < nagents; i++) {
    const agent = info.players[pno].agents[i];
    // cl(field);
    if (agent.x === -1) { // 置く前?
      const p = pntall[i + offset];
      actions.push(new Action(i, "PUT", p.x, p.y));
    } else {
      const dirall = [];
      for (const [dx, dy] of DIR) {
        const x = agent.x + dx;
        const y = agent.y + dy;
        if (x >= 0 && x < w && y >= 0 && y < h && checkFree(x, y)) {
          const f = field[y][x];
          if (f.type === 0 && f.pid !== -1 && f.pid !== pno) { // 敵土地、おいしい！
            dirall.push({ x, y, type: f.type, pid: f.pid, point: f.point + 10 });
          } else if (f.type === 0 && f.pid === -1) { // 空き土地優先
            dirall.push({ x, y, type: f.type, pid: f.pid, point: f.point + 5 });
          } else if (f.type === 1 && f.pid !== pno) { // 敵壁
            dirall.push({ x, y, type: f.type, pid: f.pid, point: f.point });
          }
        }
      }
      if (dirall.length > 0) { //  && util.rnd(5) > 0) { // 膠着状態を防ぐために20%で回避 → 弱くなった
        sortByPoint(dirall);
        const p = dirall[0];
        if (p.type === 0 || p.pid === -1) {
          actions.push(new Action(i, "MOVE", p.x, p.y));
          poschk.push({ x: p.x, y: p.y });
          poschk.push({ x: agent.x, y: agent.y }); // 動けなかった時用
        } else {
          actions.push(new Action(i, "REMOVE", p.x, p.y));
          poschk.push({ x: agent.x, y: agent.y });
        }
      } else {
        // 周りが全部埋まっていたらランダムに動く
        cl("random", i);
        for (; ;) {
          const [dx, dy] = DIR[util.rnd(8)];
          const x = agent.x + dx;
          const y = agent.y + dy;
          if (x < 0 || x >= w || y < 0 || y >= w)
            continue;
          actions.push(new Action(i, "MOVE", x, y));
          poschk.push({ x, y });
          break;
        }
      }
    }
  }
  cl(actions);
  kc.setActions(actions);
  info = await kc.waitNextTurn();
}

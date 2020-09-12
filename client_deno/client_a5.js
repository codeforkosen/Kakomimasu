// だいたい点数の高い順に置き、点数の高い順に壊しながら動くアルゴリズム （KakomimasuClient版）

import { KakomimasuClient, Action, DIR } from "./KakomimasuClient.js"
import util from "../util.js";

const kc = new KakomimasuClient("a5pre", "破壊者改", "", "a5-pw" );
// kc.setServerHost("http://localhost:8880"); // ローカルに接続してチェックする場合に使う

let info = await kc.waitMatching();
const pno = kc.getPlayerNumber();
const nagents = kc.getAgentCount();
const points = kc.getPoints();
const w = points[0].length;
const h = points.length;

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

info = await kc.waitStart(); // スタート時間待ち
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
    // console.log(field);
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
          if (f.point > 0) { // プラスのときだけ
            if (f.type === 0 && f.pid !== -1 && f.pid !== pno && f.point > 0) { // 敵土地、おいしい！
              dirall.push({ x, y, type: f.type, pid: f.pid, point: f.point + 10 });
            } else if (f.type === 0 && f.pid === -1 && f.point > 0) { // 空き土地優先
              dirall.push({ x, y, type: f.type, pid: f.pid, point: f.point + 5 });
            } else if (f.type === 1 && f.pid !== pno) { // 敵壁
              dirall.push({ x, y, type: f.type, pid: f.pid, point: f.point });
            }
          }
        }
      }
      if (dirall.length > 0) { //  && util.rnd(5) > 0) { // 膠着状態を防ぐために20%で回避 → 弱くなった
        sortByPoint(dirall);
        const p = dirall[0];
        if (p.type === 0 || p.pid === -1) {
          actions.push(new Action(i, "MOVE", p.x, p.y));
          poschk.push({ x: p.x, y: p.y });
        } else {
          actions.push(new Action(i, "REMOVE", p.x, p.y));
        }
        poschk.push({ x: agent.x, y: agent.y });
      } else {
        // 周りが全部埋まっていたら空いている高得点で一番近いところを目指す
        let dis = w * h;
        let target = null;
        for (const p of pntall) {
          if (field[p.y][p.x].type === 0 && field[p.y][p.x].pid === -1) {
            const dx = agent.x - p.x;
            const dy = agent.y - p.y;
            const d = dx * dx + dy * dy;
            if (d < dis) {
              dis = d;
              target = p;
            }
          }
        }
        if (target) {
          const sgn = (n) => {
            if (n < 0) return -1;
            if (n > 0) return 1;
            return 0;
          };
          const x2 = sgn(agent.x - target.x);
          const y2 = sgn(agent.y - target.y);
          const p = field[y2][x2];
          if (p.type === 0 || p.pid === -1) {
            actions.push(new Action(i, "MOVE", x2, y2));
            poschk.push({ x: x2, y: y2 });
          } else {
            actions.push(new Action(i, "REMOVE", x2, y2));
          }
          poschk.push({ x: agent.x, y: agent.y });
        } else {
          // 空いているところなければランダム
          for (;;) {
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
  }
  console.log(actions);
  kc.setActions(actions);
  info = await kc.waitNextTurn();
}

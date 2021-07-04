// だいたい点数の高い順に置き、点数の高い順に壊しながら動くアルゴリズム （KakomimasuClient版）
import { Algorithm } from "./algorithm.js";

export class ClientA5 extends Algorithm {
  onInit(boardPoints, agentNum, turnNum) {
    const w = boardPoints[0].length;
    const h = boardPoints.length;

    // ポイントの高い順ソート
    this.pntall = [];
    for (let i = 0; i < h; i++) {
      for (let j = 0; j < w; j++) {
        this.pntall.push({ x: j, y: i, point: boardPoints[i][j] });
      }
    }
    this.sortByPoint(this.pntall);
  }

  onTurn(field, pid, agents, turn) {
    const w = field[0].length;
    const h = field.length;

    const actions = [];
    const offset = this.rnd(agents.length);
    const poschk = []; // 動く予定の場所
    const checkFree = (x, y) => {
      for (let i = 0; i < poschk.length; i++) {
        const p = poschk[i];
        if (p.x === x && p.y === y) {
          return false;
        }
      }
      return true;
    };
    for (let i = 0; i < agents.length; i++) {
      const agent = agents[i];
      if (agent.x === -1) { // 置く前?
        const p = this.pntall[i + offset];
        actions.push([i, "PUT", p.x, p.y]);
      } else {
        const dirall = [];
        for (const [dx, dy] of this.DIR) {
          const x = agent.x + dx;
          const y = agent.y + dy;
          if (x >= 0 && x < w && y >= 0 && y < h && checkFree(x, y)) {
            const f = field[y][x];
            if (f.point > 0) { // プラスのときだけ
              if (
                f.type === 0 && f.pid !== -1 && f.pid !== pid && f.point > 0
              ) { // 敵土地、おいしい！
                dirall.push(
                  { x, y, type: f.type, pid: f.pid, point: f.point + 10 },
                );
              } else if (f.type === 0 && f.pid === -1 && f.point > 0) { // 空き土地優先
                dirall.push(
                  { x, y, type: f.type, pid: f.pid, point: f.point + 5 },
                );
              } else if (f.type === 1 && f.pid !== pid) { // 敵壁
                dirall.push({ x, y, type: f.type, pid: f.pid, point: f.point });
              }
            }
          }
        }
        if (dirall.length > 0) { //  && this.rnd(5) > 0) { // 膠着状態を防ぐために20%で回避 → 弱くなった
          this.sortByPoint(dirall);
          const p = dirall[0];
          if (p.type === 0 || p.pid === -1) {
            actions.push([i, "MOVE", p.x, p.y]);
            poschk.push({ x: p.x, y: p.y });
          } else {
            actions.push([i, "REMOVE", p.x, p.y]);
          }
          poschk.push({ x: agent.x, y: agent.y });
        } else {
          // 周りが全部埋まっていたら空いている高得点で一番近いところを目指す
          let dis = w * h;
          let target = null;
          for (const p of this.pntall) {
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
            const x2 = agent.x + sgn(target.x - agent.x);
            const y2 = agent.y + sgn(target.y - agent.y);
            const p = field[y2][x2];
            if (p.type === 0 || p.pid === -1) {
              actions.push([i, "MOVE", x2, y2]);
              poschk.push({ x: x2, y: y2 });
            } else {
              actions.push([i, "REMOVE", x2, y2]);
            }
            poschk.push({ x: agent.x, y: agent.y });
          } else {
            // 空いているところなければランダム
            for (;;) {
              const [dx, dy] = this.DIR[this.rnd(8)];
              const x = agent.x + dx;
              const y = agent.y + dy;
              if (x < 0 || x >= w || y < 0 || y >= w) {
                continue;
              }
              actions.push([i, "MOVE", x, y]);
              poschk.push({ x, y });
              break;
            }
          }
        }
      }
    }
    return actions;
  }

  sortByPoint(p) {
    p.sort((a, b) => b.point - a.point);
  }

  DIR = [
    [0, -1],
    [1, -1],
    [1, 0],
    [1, 1],
    [0, 1],
    [-1, 1],
    [-1, 0],
    [-1, -1],
  ];

  rnd(n) {
    return Math.floor(Math.random() * n); // MT is better
  }
}

if (import.meta.main) {
  const a = new ClientA5();
  a.match({
    id: "ai-5",
    name: "AI-5",
    spec: "破壊者",
    password: "ai-5-pw",
  });
}

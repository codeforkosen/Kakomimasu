// だいたい点数の高い順にデタラメに置き、画面外を避けつつデタラメに動くアルゴリズム
import { Algorithm } from "./algorithm.js";

export class ClientA2 extends Algorithm {
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

    // ランダムにずらしつつ置けるだけおく
    // 置いたものはランダムに8方向動かす
    // 画面外にはでない判定を追加（a1 → a2)
    const actions = [];
    const offset = this.rnd(agents.length);
    for (let i = 0; i < agents.length; i++) {
      const agent = agents[i];
      if (agent.x === -1) {
        const p = this.pntall[i + offset];
        actions.push([i, "PUT", p.x, p.y]);
      } else {
        for (;;) {
          const [dx, dy] = this.DIR[this.rnd(8)];
          const x = agent.x + dx;
          const y = agent.y + dy;
          if (x < 0 || x >= w || y < 0 || y >= h) {
            continue;
          }
          actions.push([i, "MOVE", x, y]);
          break;
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
  const a = new ClientA2();
  a.match({
    id: "ai-2",
    name: "AI-2",
    spec: "",
    password: "ai-2-pw",
  });
}

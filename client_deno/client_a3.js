// だいたい点数の高い順にデタラメに置き、デタラメに動くアルゴリズム （KakomimasuClient版）
import { Algorithm } from "./algorithm.js";

export class ClientA3 extends Algorithm {
  onInit(boardPoints, _agentNum, _turnNum) {
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

  onTurn(_field, _pid, agents, _turn) {
    // ランダムにずらしつつ置けるだけおく
    // 置いたものはランダムに8方向動かす
    const actions = [];
    const offset = this.rnd(agents.length);
    for (let i = 0; i < agents.length; i++) {
      const agent = agents[i];
      if (agent.x === -1) { // 置く前?
        const p = this.pntall[i + offset];
        actions.push([i, "PUT", p.x, p.y]);
      } else {
        const [dx, dy] = this.DIR[this.rnd(8)];
        actions.push([i, "MOVE", agent.x + dx, agent.y + dy]);
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
  const a = new ClientA3();
  a.match({
    id: "ai-3",
    name: "AI-3",
    spec: "デタラメ",
    password: "ai-3-pw",
  });
}

// 大きく囲む戦略
import { Algorithm } from "./algorithm.js";

export class Kacom extends Algorithm {
  onInit(boardPoints, agentNum, turnNum) {
    const w = boardPoints[0].length;
    const h = boardPoints.length;

    this.line = [];
    for (let i = 0; i < w; i++) this.line.push([i, 0]);
    for (let i = 1; i < h; i++) this.line.push([w - 1, i]);
    for (let i = w - 2; i >= 0; i--) this.line.push([i, h - 1]);
    for (let i = h - 2; i >= 1; i--) this.line.push([0, i]);
  }

  onTurn(field, pid, agents, turn) {
    const actions = [];
    for (let i = 0; i < agents.length; i++) {
      const agent = agents[i];
      // console.log(field);
      if (agent.x === -1) { // 置く前？
        const p = this.line[(this.line.length / agents.length * i) >> 0];
        actions.push([i, "PUT", p[0], p[1]]);
      } else {
        const n = this.line.findIndex((p) =>
          p[0] === agent.x && p[1] === agent.y
        );
        if (n >= 0) {
          const next = this.line[(n + 1) % this.line.length];
          actions.push([i, "MOVE", next[0], next[1]]);
        }
      }
    }
    return actions;
  }
}

if (import.meta.main) {
  const a = new Kacom();
  a.match({
    id: "taisukef_kacom",
    name: "kacom",
    spec: "kacom",
    password: "tf_kacom_kakomimasu",
  });
}

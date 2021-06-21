// 大きく囲む戦略
import { Algorithm } from "./algorithm.js";
import { Action } from "./KakomimasuClient.js";

export class Kacom extends Algorithm {
  think(info) {
    const pno = this.getPlayerNumber();
    const nagents = this.getAgentCount();
    const points = this.getPoints();
    const w = points[0].length;
    const h = points.length;

    const line = [];
    for (let i = 0; i < w; i++) line.push([i, 0]);
    for (let i = 1; i < h; i++) line.push([w - 1, i]);
    for (let i = w - 2; i >= 0; i--) line.push([i, h - 1]);
    for (let i = h - 2; i >= 1; i--) line.push([0, i]);

    const _field = this.getField();
    const actions = [];
    for (let i = 0; i < nagents; i++) {
      const agent = info.players[pno].agents[i];
      // console.log(field);
      if (agent.x === -1) { // 置く前？
        const p = line[(line.length / nagents * i) >> 0];
        actions.push(new Action(i, "PUT", p[0], p[1]));
      } else {
        const n = line.findIndex((p) => p[0] === agent.x && p[1] === agent.y);
        if (n >= 0) {
          const next = line[(n + 1) % line.length];
          actions.push(new Action(i, "MOVE", next[0], next[1]));
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

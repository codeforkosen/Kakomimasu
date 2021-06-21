// だいたい点数の高い順にデタラメに置き、デタラメに動くアルゴリズム
import util from "../util.js";
import { Algorithm } from "./algorithm.js";
import { Action, DIR } from "./KakomimasuClient.js";

export class ClientA1 extends Algorithm {
  think(info) {
    const pno = this.getPlayerNumber();
    const points = this.getPoints();
    const w = points[0].length;
    const h = points.length;
    const nagents = this.getAgentCount();

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

    // ランダムにずらしつつ置けるだけおく
    // 置いたものはランダムに8方向動かす
    const actions = [];
    const offset = util.rnd(nagents);
    for (let i = 0; i < nagents; i++) {
      const agent = info.players[pno].agents[i];
      if (agent.x === -1) {
        const p = pntall[i + offset];
        actions.push(new Action(i, "PUT", p.x, p.y));
      } else {
        const [dx, dy] = DIR[util.rnd(8)];
        actions.push(new Action(i, "MOVE", agent.x + dx, agent.y + dy));
      }
    }
    return actions;
  }
}

if (import.meta.main) {
  const a = new ClientA1();
  a.match({
    id: "ai-1",
    name: "AI-1",
    spec: "",
    password: "ai-1-pw",
  });
}

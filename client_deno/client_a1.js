// だいたい点数の高い順にデタラメに置き、デタラメに動くアルゴリズム
import util from "../util.js";
import { Action, DIR, KakomimasuClient, cl, args } from "./KakomimasuClient.js";

const kc = new KakomimasuClient("ai-1", "AI-1", "", "ai-1-pw");

if (args.gameId) {
  kc.gameId = args.gameId;
}
if (args.local) kc.setServerHost("http://localhost:8880");
let gameInfo = await kc.waitMatching();
const roomid = gameInfo.gameId;
const pno = kc.getPlayerNumber();

const points = kc.getPoints();
const w = points[0].length;
const h = points.length;
const nplayers = gameInfo.players[pno].agents.length;
const totalTurn = gameInfo.totalTurn;
cl("totalTurn", totalTurn);

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
gameInfo = await kc.waitStart();
cl(gameInfo);

const log = [gameInfo];
console.log(pntall);
while (gameInfo) {
  // ランダムにずらしつつ置けるだけおく
  // 置いたものはランダムに8方向動かす
  const actions = [];
  const offset = util.rnd(nplayers);
  for (let i = 0; i < nplayers; i++) {
    const agent = gameInfo.players[pno].agents[i];
    cl(pno, agent);
    if (agent.x === -1) {
      const p = pntall[i + offset];
      console.log(i, "p", p);
      actions.push(new Action(i, "PUT", p.x, p.y));
    } else {
      const [dx, dy] = DIR[util.rnd(8)];
      actions.push(new Action(i, "MOVE", agent.x + dx, agent.y + dy));
    }
  }
  kc.setActions(actions);
  gameInfo = await kc.waitNextTurn();
  log.push(gameInfo);
}

// ゲームデータ出力
if (!args.nolog) {
  try {
    Deno.mkdirSync("log");
  } catch (e) { }
  const fname = `log/${gameInfo.gameId}-player${pno}.log`;
  Deno.writeTextFileSync(fname, JSON.stringify(log, null, 2));
}
// アルゴリズムを自動対戦して強さ測定
import { ClientA1 } from "./client_a1.js";
import { ClientA4 } from "./client_a4.js";
import { Action, Board, Game, Player } from "../Kakomimasu.js";
import { KakomimasuClient } from "./KakomimasuClient.js";

// ボード名、アルゴリズム実装、対戦回数を設定する
const BOARD_NAME = "A-1";
const ALGORITHMS = [
  new ClientA1(),
  new ClientA4(),
];
const BATTLE_NUM = 10;

const board = new Board(
  JSON.parse(Deno.readTextFileSync(`../apiserver/board/${BOARD_NAME}.json`)),
);
const win = new Array(ALGORITHMS.length).fill(0);

for (let i = 0; i < BATTLE_NUM; i++) {
  const game = new Game(board);
  for (let j = 0; j < ALGORITHMS.length; j++) {
    game.attachPlayer(new Player(j));
  }
  let info = game2Info(game);
  for (let j = 0; j < ALGORITHMS.length; j++) {
    ALGORITHMS[j].kc = new KakomimasuClient("", "", "", "");
    ALGORITHMS[j].kc.gameInfo = info;
    ALGORITHMS[j].kc.pno = j;
    ALGORITHMS[j].kc._makeField();
  }
  while (!game.ending) {
    for (let j = 0; j < ALGORITHMS.length; j++) {
      const kact = ALGORITHMS[j].think(info);
      game.players[j].setActions(kact.map((a) => convertGameAction(a)));
    }
    game.nextTurn();
    info = game2Info(game);
    for (let j = 0; j < ALGORITHMS.length; j++) {
      ALGORITHMS[j].kc.gameInfo = info;
      ALGORITHMS[j].kc._updateField();
    }
  }
  const points = game.field.getPoints();
  let maxPoint = Number.MIN_VALUE;
  let maxPlayer = [];
  let str = `試合数:${i + 1} `;
  str += "ポイント:";
  for (let j = 0; j < ALGORITHMS.length; j++) {
    const p = points[j].basepoint + points[j].wallpoint;
    if (p >= maxPoint) {
      if (p > maxPoint) {
        maxPlayer = [];
        maxPoint = p;
      }
      maxPlayer.push(j);
    }
    str += p;
    if (j < ALGORITHMS.length - 1) {
      str += ",";
    }
  }
  str += " 勝数";
  for (let j = 0; j < maxPlayer.length; j++) {
    win[maxPlayer[j]]++;
  }
  for (let j = 0; j < ALGORITHMS.length; j++) {
    str += win[j];
    if (j < ALGORITHMS.length - 1) {
      str += ",";
    }
  }
  str += " 勝率:";
  for (let j = 0; j < ALGORITHMS.length; j++) {
    str += `${parseInt(win[j] / (i + 1) * 100)}`;
    if (j < ALGORITHMS.length - 1) {
      str += ",";
    }
  }
  console.log(str);
}

function convertGameAction(a) {
  let type;
  switch (a.type) {
    case "PUT":
      type = Action.PUT;
      break;
    case "NONE":
      type = Action.NONE;
      break;
    case "MOVE":
      type = Action.MOVE;
      break;
    case "REMOVE":
      type = Action.REMOVE;
      break;
  }
  return new Action(a.agentId, type, a.x, a.y);
}

function game2Info(game) {
  return JSON.parse(JSON.stringify(game));
}

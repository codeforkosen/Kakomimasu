import { Action, Game, Player } from "../mod.ts";

const width = 8;
const height = 8;
const points = [];
for (let i = 0; i < width * height; i++) {
  points[i] = i;
}
const nAgent = 6;
const totalTurn = 10;
const board = { width, height, points, nAgent, totalTurn };

const game = new Game(board);
const p1 = new Player("test1");
const p2 = new Player("test2");
game.attachPlayer(p1);
game.attachPlayer(p2);
game.start();
for (;;) {
  p1.setActions(Action.fromArray([
    [0, Action.PUT, 1, 1],
    [0, Action.MOVE, 2, 2],
  ]));
  p2.setActions(Action.fromArray([
    [0, Action.PUT, 1, 1],
    [1, Action.PUT, 1, 2],
  ]));
  if (!game.nextTurn()) {
    break;
  }
}
console.log(game);

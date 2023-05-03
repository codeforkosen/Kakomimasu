import { Action, Board, Game, Player } from "../Kakomimasu.ts";
import { assertEquals } from "./deps.ts";
//import util from "../util.mjs";

const cl = (...a: Parameters<Console["log"]>) => {
  a;
}; //console.log(...a);

Deno.test("flow", () => {
  //test("flow", () => {
  const width = 8;
  const height = 8;
  const points = [];
  for (let i = 0; i < width * height; i++) {
    points[i] = i;
    // points[i] = i % (16 * 2 + 1) - 16;
    // util.rnd(16 * 2 + 1) - 16;
  }
  const nAgent = 6;
  const totalTurn = 10;
  const board: Board = { width, height, points, nAgent, totalTurn };

  const game = new Game(board);
  const p1 = new Player("test1");
  const p2 = new Player("test2");
  game.attachPlayer(p1);
  game.attachPlayer(p2);
  game.start();
  for (;;) {
    const _st = game;
    // console.log(st);
    p1.setActions(Action.fromArray([
      [0, Action.PUT, 1, 1],
      [0, Action.MOVE, 2, 2],
    ]));
    p2.setActions(Action.fromArray([
      [0, Action.PUT, 1, 1], // point 9
      [1, Action.PUT, 1, 2], // point 17
      [2, Action.PUT, 1, 3], // point 25
      [10, Action.PUT, 2, 2], // point 18(failed)
      //total 9+17+25=51
    ]));
    if (!game.nextTurn()) {
      break;
    }
  }
  assertEquals(game.log.length, totalTurn);
  cl(game.field.points);
  assertEquals(game.log.at(-1)?.players.map((p) => p.point), [{
    areaPoint: 0,
    wallPoint: 0,
  }, {
    areaPoint: 0,
    wallPoint: 51,
  }]);
  // util.p(game.getStatusJSON());
});

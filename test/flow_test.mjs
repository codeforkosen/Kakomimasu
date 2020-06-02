import { Kakomimasu, Board, Action } from "../Kakomimasu.mjs";
import { assertEquals } from "https://deno.land/std/testing/asserts.ts";
import util from "../util.mjs";

Deno.test("flow test", () => {
  const w = 8;
  const h = 8;
  const points = [];
  for (let i = 0; i < w * h; i++) {
    points[i] = i;
    // points[i] = i % (16 * 2 + 1) - 16;
    // util.rnd(16 * 2 + 1) - 16;
  }
  const nagent = 6;
  const board = new Board(w, h, points, nagent);

  const kkmm = new Kakomimasu();
  kkmm.appendBoard(board);
  const nturn = 10;
  const game = kkmm.createGame(board, nturn);
  const p1 = kkmm.createPlayer("test1");
  const p2 = kkmm.createPlayer("test2");
  game.attachPlayer(p1);
  game.attachPlayer(p2);
  game.start();
  for (;;) {
    const st = game.getStatusJSON();
    // console.log(st);
    p1.setActions(Action.fromJSON([
      [0, Action.PUT, 1, 1],
      [0, Action.MOVE, 2, 2],
    ]));
    p2.setActions(Action.fromJSON([
      [0, Action.PUT, 1, 1],
      [1, Action.PUT, 1, 2],
      [2, Action.PUT, 1, 3],
      [10, Action.PUT, 2, 2],
    ]));
    if (!game.nextTurn()) {
      break;
    }
  }
  assertEquals(game.getStatusJSON().log.length, nturn);
  assertEquals(game.getStatusJSON().points, [ { basepoint: 0, wallpoint: 0 }, { basepoint: 0, wallpoint: 42 } ]);
  // util.p(game.getStatusJSON());
});

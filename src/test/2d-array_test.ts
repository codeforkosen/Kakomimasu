import { Action, Board, Kakomimasu } from "../Kakomimasu.ts";
import { assertEquals } from "./deps.ts";

const cl = (...a: Parameters<Console["log"]>) => {
  a;
}; //console.log(...a);

Deno.test("two-dimensional array check", () => {
  const w = 8;
  const h = 8;
  const points = [];
  for (let i = 0; i < w * h; i++) points[i] = i;
  const nagent = 6;
  const nturn = 10;
  const board = new Board({ w, h, points, nagent, nturn });

  const kkmm = new Kakomimasu();
  kkmm.appendBoard(board);
  const game = kkmm.createGame(board);
  const p1 = kkmm.createPlayer("test1");
  const p2 = kkmm.createPlayer("test2");
  game.attachPlayer(p1);
  game.attachPlayer(p2);
  game.start();
  for (;;) {
    const _st = game.getStatusJSON();
    // console.log(st);
    p1.setActions(Action.fromJSON([
      [0, Action.PUT, 1, 1],
      [0, Action.MOVE, 2, 2],
    ]));
    p2.setActions(Action.fromJSON([
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
  assertEquals(game.getStatusJSON().log.length, nturn);
  cl(game.getStatusJSON().points);
  assertEquals(game.getStatusJSON().points, [{ basepoint: 0, wallpoint: 0 }, {
    basepoint: 0,
    wallpoint: 51,
  }]);
  // util.p(game.getStatusJSON());

  const log = game.toLogJSON();
  test2dArray(log);
});

function test2dArray(
  obj: unknown,
  [prevKey, prevValue]: [string, unknown] = ["", {}],
) {
  if (typeof obj !== "object") return;
  if (!obj) return;
  Object.entries(obj).forEach(([k, v]) => {
    if (typeof v === "object") {
      if (Array.isArray(v)) {
        if (Array.isArray(prevValue)) {
          throw Error(`Found 2d-array : ${prevKey}`);
        } else test2dArray(v, [k, v]);
      } else test2dArray(v);
    }
  });
}

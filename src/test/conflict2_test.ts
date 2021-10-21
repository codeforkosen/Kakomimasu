import { Action, Board, Kakomimasu } from "../Kakomimasu.ts";
import { assert, assertEquals, AssertionError } from "./deps.ts";

Deno.test("conflict2", () => {
  const nagent = 6;
  const [w, h] = [3, 3];
  const nturn = 20;
  const board = new Board({ w, h, points: new Array(w * h), nagent, nturn });

  const kkmm = new Kakomimasu();
  kkmm.appendBoard(board);
  const game = kkmm.createGame(board);

  const field = game.field;

  const p1 = kkmm.createPlayer("test1");
  const p2 = kkmm.createPlayer("test2");
  game.attachPlayer(p1);
  game.attachPlayer(p2);
  game.start();

  const isOnAgent = (p: number, x: number, y: number) => {
    let cnt = 0;
    for (const a of game.agents[p]) {
      if (a.x === x && a.y === y) {
        cnt++;
      }
    }
    if (cnt === 1) {
      return true;
    }
    if (cnt === 0) {
      return false;
    }
    throw new AssertionError("agent conflict!! cnt:" + cnt);
  };

  const tos = () => {
    const res = [];
    for (let i = 0; i < h; i++) {
      const s = [];
      for (let j = 0; j < w; j++) {
        const n = field.field[j + i * w];
        const a0 = isOnAgent(0, j, i);
        const a1 = isOnAgent(1, j, i);
        if (a0 && a1) {
          throw new AssertionError("agent conflict!!");
        }
        const a = a0 ? "0" : (a1 ? "1" : ".");
        s.push(
          "_W".charAt(n.type) + (n.player === null
            ? "."
            : n.player).toString() +
            a,
        );
      }
      res.push(s.join(" "));
    }
    return res.join("\n");
  };

  const cl = (...a: Parameters<Console["log"]>) => a; //console.log(...a);
  const p = () => cl(tos());
  const chk = (s: string) => assertEquals(s.trim(), tos());

  // put
  p1.setActions(Action.fromJSON([
    [0, Action.PUT, 0, 0],
    [1, Action.PUT, 0, 1],
    [2, Action.PUT, 0, 2],
  ]));
  p2.setActions(Action.fromJSON([
    [0, Action.PUT, 2, 0],
    [1, Action.PUT, 2, 1],
    [2, Action.PUT, 2, 2],
  ]));
  assert(game.nextTurn());
  p();
  chk(`
W00 _.. W11
W00 _.. W11
W00 _.. W11
`);

  // move conflict
  p1.setActions(Action.fromJSON([
    [0, Action.MOVE, 1, 1],
    [1, Action.MOVE, 1, 1],
    [2, Action.MOVE, 1, 1],
  ]));
  p2.setActions(Action.fromJSON([
    [0, Action.MOVE, 1, 1],
    [1, Action.MOVE, 1, 1],
    [2, Action.MOVE, 1, 1],
  ]));
  assert(game.nextTurn());
  p();
  chk(`
W00 _.. W11
W00 _.. W11
W00 _.. W11
`);

  // move remove put conflict
  p1.setActions(Action.fromJSON([
    [0, Action.MOVE, 1, 1],
    [1, Action.REMOVE, 1, 1],
    [2, Action.REMOVE, 1, 1],
    [3, Action.PUT, 1, 1],
  ]));
  p2.setActions(Action.fromJSON([
    [0, Action.MOVE, 1, 1],
    [1, Action.REMOVE, 1, 1],
    [2, Action.MOVE, 1, 1],
    [3, Action.PUT, 1, 1],
  ]));
  assert(game.nextTurn());
  p();
  chk(`
W00 _.. W11
W00 _.. W11
W00 _.. W11
`);

  // move no conflict
  p1.setActions(Action.fromJSON([
    [0, Action.MOVE, 1, 0],
    [1, Action.MOVE, 1, 1],
    [2, Action.MOVE, 1, 2],
  ]));
  p2.setActions(Action.fromJSON([]));
  assert(game.nextTurn());
  p();
  chk(`
W0. W00 W11
W0. W00 W11
W0. W00 W11
`);

  // move no other wall and agent
  p1.setActions(Action.fromJSON([
    [0, Action.MOVE, 2, 0],
    [1, Action.MOVE, 2, 1],
    [2, Action.MOVE, 2, 2],
  ]));
  p2.setActions(Action.fromJSON([]));
  assert(game.nextTurn());
  p();
  chk(`
W0. W00 W11
W0. W00 W11
W0. W00 W11
`);

  // finish
  while (game.nextTurn());
});

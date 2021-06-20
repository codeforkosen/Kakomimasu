import { Action, Board, Kakomimasu } from "../Kakomimasu.js";
import { assert, assertEquals, AssertionError } from "../asserts.js";

const cl = (...a) => { a; };//console.log(...a);

Deno.test("revert1", () => {
  const nagent = 6;
  const [w, h] = [3, 1];
  const nturn = 20;
  const board = new Board(w, h, new Array(w * h), nagent, nturn);

  const kkmm = new Kakomimasu();
  kkmm.appendBoard(board);
  const game = kkmm.createGame(board);

  const field = game.field;

  const p1 = kkmm.createPlayer("test1");
  const p2 = kkmm.createPlayer("test2");
  game.attachPlayer(p1);
  game.attachPlayer(p2);
  game.start();

  const isOnAgent = (p, x, y) => {
    let cnt = 0;
    for (const a of game.agents[p]) {
      if (a.x === x && a.y === y) {
        cnt++;
      }
    }
    if (cnt === 1)
      return true;
    if (cnt === 0)
      return false;
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
        s.push("_W".charAt(n[0]) + (n[1] < 0 ? "." : n[1]).toString() + a);
      }
      res.push(s.join(" "));
    }
    return res.join("\n");
  };
  const p = () => cl(tos());
  const chk = (s) => assertEquals(s.trim(), tos());

  // put
  p1.setActions(Action.fromJSON([
    [0, Action.PUT, 0, 0],
    [1, Action.PUT, 1, 0],
  ]));
  assert(game.nextTurn());
  p();
  chk("W00 W00 _..");

  // move x2
  p1.setActions(Action.fromJSON([
    [0, Action.MOVE, 1, 0],
    [1, Action.MOVE, 2, 0],
  ]));
  assert(game.nextTurn());
  p();
  chk("W0. W00 W00");

  // move x2 revert
  p1.setActions(Action.fromJSON([
    [0, Action.MOVE, 2, 0],
    [1, Action.MOVE, 3, 0],
  ]));
  assert(game.nextTurn());
  p();
  chk("W0. W00 W00");

  // finish
  while (game.nextTurn());
});
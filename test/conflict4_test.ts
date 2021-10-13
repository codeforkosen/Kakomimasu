import { Action, Board, Kakomimasu } from "../src/Kakomimasu.ts";
import { assert, assertEquals, AssertionError } from "./deps.ts";

Deno.test("conflict4", () => {
  const nagent = 2;
  const nturn = 30;
  const nsec = 3;
  const [w, h] = [3, 2];
  const board = new Board({
    w,
    h,
    points: new Array(w * h),
    nagent,
    nturn,
    nsec,
  });

  const kkmm = new Kakomimasu();
  kkmm.appendBoard(board);
  const game = kkmm.createGame(board);

  const field = game.field;

  const p1 = kkmm.createPlayer("test1");
  const p2 = kkmm.createPlayer("test2");
  game.attachPlayer(p1);
  game.attachPlayer(p2);
  game.start();

  const cl = (...a: Parameters<Console["log"]>) => {
    a;
  }; //console.log(...a);

  const _showAgents = () => {
    let i = 0;
    for (const agent of game.agents) {
      let j = 0;
      for (const a of agent) {
        console.log("pid", i, "aid", j, a.x, a.y);
        j++;
      }
      i++;
    }
  };

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
        s.push("_W".charAt(n[0]) + (n[1] < 0 ? "." : n[1]).toString() + a);
      }
      res.push(s.join(" "));
    }
    return res.join("\n");
  };

  const p = () => cl(tos());
  const chk = (s: string) => assertEquals(s.trim(), tos());

  cl("put");
  p1.setActions(Action.fromJSON([
    [0, Action.PUT, 0, 0],
    [1, Action.PUT, 1, 1],
  ]));
  p2.setActions(Action.fromJSON([
    [0, Action.PUT, 1, 0],
  ]));
  assert(game.nextTurn());
  p();
  chk(`
W00 W11 _..
_.. W00 _..
`);

  cl("move");
  p2.setActions(Action.fromJSON([
    [0, Action.MOVE, 2, 0],
  ]));
  assert(game.nextTurn());
  p();
  chk(`
W00 W1. W11
_.. W00 _..
`);

  cl("remove move conflict");
  p1.setActions(Action.fromJSON([
    [0, Action.REMOVE, 1, 0],
    [1, Action.MOVE, 1, 0],
  ]));
  assert(game.nextTurn());
  p();
  chk(`
W00 _.. W11
_.. W00 _..
`);

  cl("move");
  p1.setActions(Action.fromJSON([
    [0, Action.MOVE, 1, 0],
  ]));
  assert(game.nextTurn());
  p();
  chk(`
W0. W00 W11
_.. W00 _..
`);

  cl("move remove conflict myself");
  p1.setActions(Action.fromJSON([
    [0, Action.MOVE, 0, 0],
    [0, Action.REMOVE, 0, 0],
  ]));
  assert(game.nextTurn());
  p();
  chk(`
W0. W00 W11
_.. W00 _..
`);

  // finish
  for (let i = 0;; i++) {
    //console.log("turn", i);
    // showAgents();
    if (!game.nextTurn()) break;
  }
  console.log("finish");
});

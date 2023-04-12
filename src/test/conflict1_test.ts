import { Action, Board, Kakomimasu } from "../Kakomimasu.ts";
import { assert, assertEquals, AssertionError } from "./deps.ts";

Deno.test("conflict1", () => {
  const nAgent = 6;
  const [width, height] = [3, 1];
  const totalTurn = 20;
  const board = new Board({
    width,
    height,
    points: new Array(width * height),
    nAgent,
    totalTurn,
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

  const isOnAgent = (p: number, x: number, y: number) => {
    let cnt = 0;
    for (const a of game.players[p].agents) {
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
    for (let i = 0; i < height; i++) {
      const s = [];
      for (let j = 0; j < width; j++) {
        const n = field.tiles[j + i * width];
        const a0 = isOnAgent(0, j, i);
        const a1 = isOnAgent(1, j, i);
        if (a0 && a1) {
          throw new AssertionError("agent conflict!!");
        }
        const a = a0 ? "0" : (a1 ? "1" : ".");
        s.push(
          "_W".charAt(n.type) +
            (n.player === null ? "." : n.player).toString() +
            a,
        );
      }
      res.push(s.join(" "));
    }
    return res.join("\n");
  };

  const chk = (s: string) => assertEquals(s.trim(), tos());

  const cl = (...a: Parameters<Console["log"]>) => a; //console.log(...a);
  const p = () => cl(tos());

  // put
  cl("put");
  p1.setActions(Action.fromArray([
    [0, Action.PUT, 0, 0],
  ]));
  p2.setActions(Action.fromArray([
    [0, Action.PUT, 2, 0],
  ]));
  assert(game.nextTurn());
  p();
  chk("W00 _.. W11");

  cl("move conflict");
  p1.setActions(Action.fromArray([
    [0, Action.MOVE, 1, 0],
  ]));
  p2.setActions(Action.fromArray([
    [0, Action.MOVE, 1, 0],
  ]));
  assert(game.nextTurn());
  p();
  chk("W00 _.. W11");

  // move conflict
  p1.setActions(Action.fromArray([
    [0, Action.MOVE, 1, 0],
  ]));
  p2.setActions(Action.fromArray([
    [0, Action.MOVE, 1, 0],
  ]));
  assert(game.nextTurn());
  p();
  chk("W00 _.. W11");

  // put move conflict
  p1.setActions(Action.fromArray([
    [1, Action.PUT, 1, 0],
  ]));
  p2.setActions(Action.fromArray([
    [0, Action.MOVE, 1, 0],
  ]));
  assert(game.nextTurn());
  p();
  chk("W00 _.. W11");

  // move no conflict
  p1.setActions(Action.fromArray([
    [0, Action.MOVE, 1, 0],
  ]));
  p2.setActions(Action.fromArray([]));
  assert(game.nextTurn());
  p();
  chk("W0. W00 W11");

  // move no conflict
  p1.setActions(Action.fromArray([
    [0, Action.MOVE, 0, 0],
  ]));
  p2.setActions(Action.fromArray([]));
  assert(game.nextTurn());
  p();
  chk("W00 W0. W11");

  // move remove conflict
  p1.setActions(Action.fromArray([
    [0, Action.MOVE, 1, 0],
  ]));
  p2.setActions(Action.fromArray([
    [0, Action.REMOVE, 1, 0],
  ]));
  assert(game.nextTurn());
  p();
  chk("W00 W0. W11");

  // remove no conflict
  p1.setActions(Action.fromArray([]));
  p2.setActions(Action.fromArray([
    [0, Action.REMOVE, 1, 0],
  ]));
  assert(game.nextTurn());
  p();
  chk("W00 _.. W11");

  cl("move no conflict");
  p1.setActions(Action.fromArray([]));
  p2.setActions(Action.fromArray([
    [0, Action.MOVE, 1, 0],
  ]));
  assert(game.nextTurn());
  p();
  chk("W00 W11 W1.");

  cl("remove failed");
  p1.setActions(Action.fromArray([]));
  p2.setActions(Action.fromArray([
    [0, Action.REMOVE, 0, 0],
  ]));
  assert(game.nextTurn());
  p();
  chk("W00 W11 W1.");

  cl("move failed");
  p1.setActions(Action.fromArray([]));
  p2.setActions(Action.fromArray([
    [0, Action.MOVE, 0, 0],
  ]));
  assert(game.nextTurn());
  p();
  chk("W00 W11 W1.");

  cl("cross move failed");
  p1.setActions(Action.fromArray([
    [0, Action.MOVE, 1, 0],
  ]));
  p2.setActions(Action.fromArray([
    [0, Action.MOVE, 0, 0],
  ]));
  assert(game.nextTurn());
  p();
  chk("W00 W11 W1.");

  // finish
  while (game.nextTurn());
});

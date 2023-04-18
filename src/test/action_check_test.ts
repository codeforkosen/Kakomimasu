import { Action, Board, Game, Player } from "../Kakomimasu.ts";
import { assert, assertEquals, AssertionError } from "./deps.ts";

const tos = (game: Game) => {
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

  const { height, width } = game.board;
  const res = [];

  for (let i = 0; i < height; i++) {
    const s = [];
    for (let j = 0; j < width; j++) {
      const n = game.field.tiles[j + i * width];
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

Deno.test("Action: NONE", () => {
  const [width, height] = [3, 1];
  const board = new Board({ width, height, points: new Array(width * height) });

  const game = new Game(board);

  const p1 = new Player("test1");
  const p2 = new Player("test2");
  game.attachPlayer(p1);
  game.attachPlayer(p2);
  game.start();

  p1.setActions(Action.fromArray([
    [0, Action.NONE, 0, 0],
  ]));
  assert(game.nextTurn());
  assertEquals("_.. _.. _..", tos(game));
});

Deno.test("Action: REMOVE checkOnBoard", () => {
  const [width, height] = [3, 1];
  const board = new Board({ width, height, points: new Array(width * height) });

  const game = new Game(board);

  const p1 = new Player("test1");
  const p2 = new Player("test2");
  game.attachPlayer(p1);
  game.attachPlayer(p2);
  game.start();

  p1.setActions(Action.fromArray([[0, Action.PUT, 2, 0]]));
  assert(game.nextTurn());
  assertEquals("_.. _.. W00", tos(game));

  const action = new Action(0, Action.REMOVE, 3, 0);
  p1.setActions([action]);
  assert(game.nextTurn());
  assertEquals(action.res, Action.ERR_ILLEGAL_ACTION);
  assertEquals("_.. _.. W00", tos(game));
});

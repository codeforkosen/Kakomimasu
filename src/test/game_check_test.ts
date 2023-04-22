import { Board, Game, Player } from "../Kakomimasu.ts";
import { assertEquals } from "./deps.ts";

Deno.test("Game: too much attach", () => {
  const [width, height] = [3, 1];
  const board: Board = { width, height, points: new Array(width * height) };

  const game = new Game(board);

  assertEquals(game.attachPlayer(new Player("test1")), true);
  assertEquals(game.attachPlayer(new Player("test2")), true);
  assertEquals(game.attachPlayer(new Player("test3")), false);
});

Deno.test("Game: attach same player", () => {
  const [width, height] = [3, 1];
  const board: Board = { width, height, points: new Array(width * height) };

  const game = new Game(board);

  const p = new Player("test1");

  assertEquals(game.attachPlayer(p), true);
  assertEquals(game.attachPlayer(p), false);
});

Deno.test("Game: status check", () => {
  const [width, height] = [3, 1];
  const board: Board = { width, height, points: new Array(width * height) };

  const game = new Game(board);

  const check = (
    isFree: boolean,
    isReady: boolean,
    isGaming: boolean,
    isEnded: boolean,
  ) => {
    assertEquals(game.isFree(), isFree);
    assertEquals(game.isReady(), isReady);
    assertEquals(game.isGaming(), isGaming);
    assertEquals(game.isEnded(), isEnded);
  };

  check(true, false, false, false);
  game.attachPlayer(new Player("test1"));
  check(true, false, false, false);
  game.attachPlayer(new Player("test2"));
  check(false, true, false, false);
  game.start();
  check(false, false, true, false);
  while (game.nextTurn()) {
    check(false, false, true, false);
  }
  check(false, false, false, true);
});

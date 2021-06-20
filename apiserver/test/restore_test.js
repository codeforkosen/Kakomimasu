import { assertEquals } from "https://deno.land/std@0.99.0/testing/asserts.ts";
import { Board, ExpGame } from "../parts/expKakomimasu.ts";

Deno.test("restore ExpGame class", () => {
  const board = new Board(2, 2, [1, 2, 3, 4], 1, 10, 1, 2);
  const game = new ExpGame(board);
  const restoredGame = ExpGame.restore(game.toLogJSON());
  assertEquals(game, restoredGame);
});
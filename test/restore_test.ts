import { assertEquals } from "https://deno.land/std@0.99.0/testing/asserts.ts";
import { Agent, Board, Field, Game, Player } from "../Kakomimasu.js";

Deno.test("restore Board class", () => {
  const board = new Board(2, 2, [1, 2, 3, 4], 1, 10, 1, 2);
  const restoredBoard = Board.restore(board.toLogJSON());

  assertEquals(board, restoredBoard);
});

Deno.test("restore Agent class", () => {
  const board = new Board(2, 2, [1, 2, 3, 4], 1, 10, 1, 2);
  const field = new Field(board);
  const agent = new Agent(board, field, 1);
  const restoredAgent = Agent.restore(agent.toLogJSON(), board, field);

  assertEquals(agent, restoredAgent);
});

Deno.test("restore Game class", () => {
  const board = new Board(2, 2, [1, 2, 3, 4], 1, 10, 1, 2);
  const game = new Game(board);
  const restoredGame = Game.restore(game.toLogJSON());

  assertEquals(game, restoredGame);
});

Deno.test("restore Player class", () => {
  const player = new Player("abcd", "spec");
  const restoredPlayer = Player.restore(player.toLogJSON());

  assertEquals(player, restoredPlayer);
});

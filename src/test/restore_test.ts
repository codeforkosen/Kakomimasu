import { assertEquals } from "./deps.ts";
import { Agent, Board, Field, Game, Player } from "../Kakomimasu.ts";

const boardObj: ConstructorParameters<typeof Board>[0] = {
  w: 2,
  h: 2,
  points: [1, 2, 3, 4],
  nagent: 1,
  nturn: 10,
  nsec: 1,
  nplayer: 2,
};

Deno.test("restore Board class", () => {
  const board = new Board(boardObj);
  const restoredBoard = Board.restore(board.toLogJSON());

  assertEquals(board, restoredBoard);
});

Deno.test("restore Agent class", () => {
  const board = new Board(boardObj);
  const field = new Field(board);
  const agent = new Agent(board, field, 1);
  const restoredAgent = Agent.restore(agent.toLogJSON(), board, field);

  assertEquals(agent, restoredAgent);
});

Deno.test("restore Game class", () => {
  const board = new Board(boardObj);
  const game = new Game(board);
  const restoredGame = Game.restore(game.toLogJSON());

  assertEquals(game, restoredGame);
});

Deno.test("restore Player class", () => {
  const player = new Player("abcd", "spec");
  const restoredPlayer = Player.restore(player.toLogJSON());

  assertEquals(player, restoredPlayer);
});

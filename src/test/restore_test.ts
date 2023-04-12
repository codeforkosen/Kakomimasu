import { assert, assertEquals } from "./deps.ts";
import { Action, Agent, Board, Field, Game, Player } from "../Kakomimasu.ts";

const boardObj: ConstructorParameters<typeof Board>[0] = {
  width: 2,
  height: 2,
  points: [1, 2, 3, 4],
  nAgent: 1,
  totalTurn: 10,
  nPlayer: 2,
};

function assertBoard(a: Board, b: Board) {
  assertEquals(a, b);
}

function assertAgent(a: Agent, b: Agent) {
  assertEquals(a, b);
  assert(a.board === b.board); // check same instance
  assert(a.field === b.field); // check same instance
  assertEquals(a.lastaction, b.lastaction);
}

function assertAction(a: Action, b: Action) {
  assertEquals(a, b);
}

function assertField(a: Field, b: Field) {
  assertEquals(a, b);
  assert(a.board === b.board); // check same instance
}

function assertGame(a: Game, b: Game) {
  assertEquals(a, b);
}

function assertPlayer(a: Player, b: Player) {
  assertEquals(a, b);
  assert(a.game === b.game); // check same instance
}

// Board test
// constructor paramを変えてテスト
Deno.test("fromJSON Board class with all param", () => {
  const board = new Board(boardObj);
  const restoredBoard = Board.fromJSON(board.toJSON());

  assertEquals(board, restoredBoard);
});
Deno.test("fromJSON Board class with no 'totalTurn'", () => {
  const { totalTurn: _, ...b } = boardObj;
  const board = new Board(b);
  const restoredBoard = Board.fromJSON(board.toJSON());

  assertBoard(board, restoredBoard);
});
Deno.test("fromJSON Board class with no 'nPlayer'", () => {
  const { nPlayer: _, ...b } = boardObj;
  const board = new Board(b);
  const restoredBoard = Board.fromJSON(board.toJSON());

  assertBoard(board, restoredBoard);
});

// Agent test
// lastactionを変えてテスト
Deno.test("fromJSON Agent class with lastaction is null", () => {
  const board = new Board(boardObj);
  const field = new Field(board);
  const agent = new Agent(board, field, 1);
  const restoredAgent = Agent.fromJSON(agent.toLogJSON(), board, field);

  assertAgent(agent, restoredAgent);
});
Deno.test("fromJSON Agent class with lastaction is Action class", () => {
  const board = new Board(boardObj);
  const field = new Field(board);
  const agent = new Agent(board, field, 1);
  const action = new Action(0, Action.NONE, 0, 0);
  agent.lastaction = action;
  const restoredAgent = Agent.fromJSON(agent.toLogJSON(), board, field);

  assertAgent(agent, restoredAgent);
});

// Action test
Deno.test("fromJSON Action class", () => {
  const action = new Action(0, Action.NONE, 0, 0);
  const restoredAction = Action.fromJSON(action);

  assertAction(action, restoredAction);
});

// Field test
Deno.test("fromJSON Field class", () => {
  const board = new Board(boardObj);
  const field = new Field(board);
  const restoredField = Field.fromJSON(field.toLogJSON(), board);

  assertField(field, restoredField);
});

// Game test
Deno.test("fromJSON Game class", () => {
  const board = new Board(boardObj);
  const game = new Game(board);
  const restoredGame = Game.fromJSON(game.toLogJSON());

  assertGame(game, restoredGame);
});

// Player test
// game有り無しでテスト
Deno.test("fromJSON Player class with game is null", () => {
  const player = new Player("abcd", "spec");
  const restoredPlayer = Player.fromJSON(player.toLogJSON());

  assertPlayer(player, restoredPlayer);
});

Deno.test("fromJSON Player class with game is class", () => {
  const board = new Board(boardObj);
  const game = new Game(board);
  const player = new Player("abcd", "spec");
  player.setGame(game);
  const restoredPlayer = Player.fromJSON(player.toLogJSON(), game);

  assertPlayer(player, restoredPlayer);
});

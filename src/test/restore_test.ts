import { assert, assertEquals } from "./deps.ts";
import { Action, Agent, Board, Field, Game, Player } from "../Kakomimasu.ts";

const boardObj: ConstructorParameters<typeof Board>[0] = {
  width: 2,
  height: 2,
  points: [1, 2, 3, 4],
  nAgent: 1,
  nPlayer: 2,
  totalTurn: 10,
};

function assertBoard(a: Board, b: Board) {
  assertEquals(a, b);
}

function assertAgent(a: Agent, b: Agent) {
  assertEquals(a, b);
  assert(a.board === b.board); // check same instance
  assert(a.field === b.field); // check same instance
}

function assertAction(a: Action, b: Action) {
  assertEquals(a, b);
}

function assertField(a: Field, b: Field) {
  assertEquals(a, b);
  assert(a.board === b.board); // check same instance
}

function assertGame(a: Game, b: Game) {
  // Player.gameが循環参照になるので分けて比較
  const { players: aPlayers, ...aOther } = a;
  const { players: bPlayers, ...bOther } = b;
  assertEquals(aOther, bOther);
  assertEquals(aPlayers.length, bPlayers.length);
  for (let i = 0; i < aPlayers.length; i++) {
    const { game: aGame, ...aOther } = aPlayers[i];
    const { game: bGame, ...bOther } = bPlayers[i];
    if (aGame) aGame.turn = 1;
    assert(aGame === a); // check same instance
    assert(bGame === b); // check same instance
    assertEquals(aOther, bOther);
  }
}

function assertPlayer(a: Player, b: Player) {
  assertEquals(a, b);
  assert(a.game === b.game); // check same instance
}

// Board test
// constructor paramを変えてテスト
Deno.test("fromJSON Board class with all param", () => {
  const board = new Board(boardObj);
  const restoredBoard = Board.fromJSON(JSON.parse(JSON.stringify(board)));

  assertEquals(board, restoredBoard);
});
Deno.test("fromJSON Board class with no 'totalTurn'", () => {
  const { totalTurn: _, ...b } = boardObj;
  const board = new Board(b);
  const restoredBoard = Board.fromJSON(JSON.parse(JSON.stringify(board)));

  assertBoard(board, restoredBoard);
});
Deno.test("fromJSON Board class with no 'nPlayer'", () => {
  const { nPlayer: _, ...b } = boardObj;
  const board = new Board(b);
  const restoredBoard = Board.fromJSON(JSON.parse(JSON.stringify(board)));

  assertBoard(board, restoredBoard);
});

// Agent test
// lastactionを変えてテスト
Deno.test("fromJSON Agent class with lastaction is null", () => {
  const board = new Board(boardObj);
  const field = new Field(board);
  const agent = new Agent(board, field, 1);
  const restoredAgent = Agent.fromJSON(
    JSON.parse(JSON.stringify(agent)),
    1,
    board,
    field,
  );

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
  const restoredField = Field.fromJSON(
    JSON.parse(JSON.stringify(field)),
    board,
  );

  assertField(field, restoredField);
});

// Game test
Deno.test("fromJSON Game class", () => {
  const board = new Board(boardObj);
  const game = new Game(board);
  const restoredGame = Game.fromJSON(JSON.parse(JSON.stringify(game)));

  assertGame(game, restoredGame);
});
Deno.test("fromJSON Game class with custom", () => {
  const board = new Board(boardObj);
  const game = new Game(board, { nPlayer: 3, totalTurn: 20 });
  const restoredGame = Game.fromJSON(JSON.parse(JSON.stringify(game)));

  assertGame(game, restoredGame);
});
Deno.test("fromJSON Game class with players", () => {
  const board = new Board(boardObj);
  const game = new Game(board, { nPlayer: 2, totalTurn: 20 });
  game.attachPlayer(new Player("abcd", "spec"));
  game.attachPlayer(new Player("efgh", "spec"));
  const restoredGame = Game.fromJSON(JSON.parse(JSON.stringify(game)));

  assertGame(game, restoredGame);
});

// Player test
// game有り無しでテスト
Deno.test("fromJSON Player class with game is null", () => {
  const player = new Player("abcd", "spec");
  const restoredPlayer = Player.fromJSON(JSON.parse(JSON.stringify(player)));

  assertPlayer(player, restoredPlayer);
});

Deno.test("fromJSON Player class with game is class", () => {
  const board = new Board(boardObj);
  const game = new Game(board);
  const player = new Player("abcd", "spec");
  player.setGame(game);
  const restoredPlayer = Player.fromJSON(
    JSON.parse(JSON.stringify(player)),
    game,
  );

  assertPlayer(player, restoredPlayer);
});

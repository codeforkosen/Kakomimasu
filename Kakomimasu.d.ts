export class Board {
  public x: number;
  public h: number;
  public points: number[];
  public nagent: number;
  public nturn: number;
  public nsec: number;
  public nplayer: number;
  public name: string;

  constructor(
    w: number | {
      width: string;
      height: string;
      points: number[];
      nagent: number;
      nturn: number;
      nsec: number;
      nplayer: number;
      name: string;
    },
    h?: number,
    points?: number[],
    nagent?: number,
    nturn?: number,
    nsec?: number,
    nplayer?: number,
  );

  static restore(data: Board): Board;

  toLogJSON(): Board;
  getJSON(): {
    name: string;
    w: number;
    h: number;
    points: number[];
    nagents: number;
    nturn: number;
    nsec: number;
    nplayer: number;
  };

  toJSON(): {
    name: string;
    width: number;
    height: number;
    nAgent: number;
    nPlayer: number;
    nTurn: number;
    nSec: number;
    points: number[];
  };
}

type AgentGetJSON = { x: number; y: number };

export class Agent {
  public board: Board;
  public field: Field;
  public playerid: number;
  public x: number;
  public y: number;
  public bkx: number;
  public bky: number;
  public lastaction: Action;
  constructor(board: Board, field: Field, playerid: number);

  static restore(data: Agent, board: Board, field: Field): Agent;

  toLogJSON(): Agent & { board: null; field: null };

  isOnBoard(): boolean;

  // AgentがBoard上に乗っているいるかの確認
  checkOnBoard(x: number, y: number): boolean;

  // Agentの移動先が上下左右1マスかの確認
  checkDir(x: number, y: number): boolean;

  // AgentがPutできるかの確認
  checkPut(x: number, y: number): boolean;

  // AgentがNoneできるかの確認
  checkNone(x: number, y: number): boolean;

  // AgentがMoveできるかの確認
  checkMove(x: number, y: number): boolean;

  // AgentがRemoveできるかの確認
  checkRemove(x: number, y: number): boolean;

  // lastactionが成功したかの確認
  isValidAction(): boolean;

  putOrMove(): boolean;

  put(x: number, y: number): boolean;

  none(x: number, y: number): boolean;
  move(x: number, y: number): boolean;
  remove(): boolean;

  commit(): void;
  revert(): void;

  getJSON(): { x: number; y: number };

  check(act: Action): boolean;
}

type ActionType = 1 | 2 | 3 | 4;
type ActionRes = 0 | 1 | 2 | 3 | 4 | 5;

export class Action {
  public agentid: number;
  public type: ActionType;
  public x: number;
  public y: number;
  public res: ActionRes;

  // Action Type
  public static readonly PUT = 1;
  public static readonly NONE = 2;
  public static readonly MOVE = 3;
  public static readonly REMOVE = 4;

  // Action Res
  public static readonly SUCCESS = 0;
  public static readonly CONFLICT = 1;
  public static readonly REVERT = 2;
  public static readonly ERR_ONLY_ONE_TURN = 3;
  public static readonly ERR_ILLEGAL_AGENT = 4;
  public static readonly ERR_ILLEGAL_ACTION = 5;

  constructor(agentid: number, type: ActionType, x: number, y: number);

  getJSON(): {
    agentId: number;
    type: ActionType;
    x: number;
    y: number;
    res: ActionRes;
  };

  static getMessage(res: ActionRes): string;
  static fromJSON(array: [number, ActionType, number, number][]): Action[];
}

type FieldType = 0 | 1;
type FieldCell = [FieldType, number];

export class Field {
  public board: Board;
  public field: FieldCell[];

  public static readonly BASE = 0;
  public static readonly WALL = 1;

  constructor(board: Board);

  toLogJSON(): Field & { board: null };

  set(x: number, y: number, att: FieldType, playerid: number): void;
  get(x: number, y: number): FieldCell;
  setAgent(playerid: number, x: number, y: number): boolean;
  fillBase(): void;
  getPoints(): { basepoint: number; wallpoint: number }[];
  getJSON(): FieldCell[];
}

export class Game {
  public uuid: string;
  public board: Board;
  public players: Player[];
  public nturn: number;
  public nsec: number;
  public gaming: boolean;
  public ending: boolean;
  public field: Field;
  public log: {
    point: { basepoint: number; wallpoint: number };
    actions: ReturnType<typeof Action.prototype.getJSON>[];
  }[][];
  public turn: number;
  public agents: Agent[][];

  constructor(board: Board);

  static restore(data: Game): Game;

  toLogJSON(): Game;
  attachPlayer(player: Player): boolean;
  isReady(): boolean;
  isFree(): boolean;
  isGaming(): boolean;

  start(): void;
  nextTurn(): boolean;
  checkActions(): void;
  checkConflict(): void;
  checkAgentConflict(): void;
  putOrMove(): void;
  revertOverlap(): void;
  removeOrNot(): void;
  revertNotOwnerWall(): void;
  commit(): void;
  getStatusJSON(): {
    players: ReturnType<typeof Player.prototype.getJSON>[];
    board: ReturnType<typeof Board.prototype.getJSON>;
    field: ReturnType<typeof Field.prototype.getJSON>;
    agents: ReturnType<typeof Agent.prototype.getJSON>[][];
    points: ReturnType<typeof Field.prototype.getPoints>;
    log: typeof Game.prototype.log;
  };

  toJSON(): {
    gameId: typeof Game.prototype.uuid; //string;
    gaming: typeof Game.prototype.gaming; // boolean;
    ending: typeof Game.prototype.ending; //boolean;
    board: ReturnType<Board["toJSON"]> | null;
    turn: typeof Game.prototype.turn;
    totalTurn: typeof Game.prototype.nturn;
    tiled: typeof Game.prototype.field.field | null;
    players: {
      id: string;
      agents: { x: number; y: number }[];
      point: ReturnType<typeof Field.prototype.getPoints>[0];
    }[];
    log: typeof Game.prototype.log;
  };
}

export class Player {
  public id: string;
  public spec: string;
  public game: Game | null;
  public actions: Action[];
  public index: number;

  constructor(id: string, spec: string);

  static restore(data: Player): Player;

  toLogJSON(): Player & { game: null };

  setGame(game: Game): void;
  noticeStart(): void;
  setActions(actions: Action[]): typeof Game.prototype.turn;
  getActions(): typeof Player.prototype.actions;
  clearActions(): void;
  getJSON(): {
    userId: typeof Player.prototype.id;
    spec: typeof Player.prototype.spec;
    gameId: null | typeof Game.prototype.uuid;
    index: typeof Player.prototype.index;
  };
}

export abstract class Kakomimasu<T extends Game = Game> {
  public games: T[];
  public boards: Board[];

  constructor();

  appendBoard(board: Board): void;
  getBoards(): typeof Kakomimasu.prototype.boards;
  abstract createGame( // deno-lint-ignore no-explicit-any ban-types
    ...param: ConstructorParameters<(new (...args: any) => {}) & T>
  ): T;
  getGames(): T[];
  getFreeGames(): T[];
  createPlayer(playername: string, spec?: string): Player;
}

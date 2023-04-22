import { flat } from "./util.ts";
import type {
  ActionJson,
  AgentJson,
  FieldJson,
  GameJson,
  PlayerJson,
} from "./json_type.ts";

export type Point = {
  areaPoint: number;
  wallPoint: number;
};

interface Board {
  width: number;
  height: number;
  points: number[];
  nAgent?: number;
  nPlayer?: number;
  totalTurn?: number;
}

class Agent {
  field: Field;
  playerIdx: number;
  x: number;
  y: number;
  bkx: number;
  bky: number;
  #lastaction: Action | null;

  constructor(field: Field, playeridx: number) {
    this.field = field;
    this.playerIdx = playeridx;
    this.x = -1;
    this.y = -1;
    this.bkx = -1;
    this.bky = -1;
    this.#lastaction = null;
  }

  static fromJSON(data: AgentJson, playerIdx: number, field: Field): Agent {
    const agent = new Agent(field, playerIdx);
    agent.x = data.x;
    agent.y = data.y;
    return agent;
  }
  toJSON(): AgentJson {
    return { x: this.x, y: this.y };
  }

  #isOnBoard(): boolean {
    return this.x !== -1;
  }

  #checkOnBoard(x: number, y: number): boolean {
    return x >= 0 && x < this.field.width && y >= 0 &&
      y < this.field.height;
  }

  #checkDir(x: number, y: number): boolean {
    if (this.x === x && this.y === y) return false;
    return Math.abs(this.x - x) <= 1 && Math.abs(this.y - y) <= 1;
  }

  check(act: Action): boolean {
    this.#lastaction = act;
    this.bkx = this.x;
    this.bky = this.y;
    const x = act.x;
    const y = act.y;
    const t = act.type;
    if (t === Action.PUT) return this.#checkPut(x, y);
    else if (t === Action.MOVE) return this.#checkMove(x, y);
    else if (t === Action.REMOVE) return this.#checkRemove(x, y);
    else return false;
  }

  #checkPut(x: number, y: number): boolean {
    if (this.#isOnBoard()) return false;
    if (!this.#checkOnBoard(x, y)) return false;
    return true;
  }

  #checkMove(x: number, y: number) {
    if (!this.#isOnBoard()) return false;
    if (!this.#checkOnBoard(x, y)) return false;
    if (!this.#checkDir(x, y)) return false;
    return true;
  }

  #checkRemove(x: number, y: number) {
    if (!this.#isOnBoard()) return false;
    if (!this.#checkOnBoard(x, y)) return false;
    if (!this.#checkDir(x, y)) return false;
    if (this.field.get(x, y).type !== Field.WALL) return false;
    return true;
  }

  isValidAction(): Action | undefined {
    if (!this.#lastaction) return;
    if (this.#lastaction.res !== Action.SUCCESS) return;
    return this.#lastaction;
  }

  putOrMove(): boolean {
    //console.log("putormove", this);
    if (this.#lastaction == null) throw new Error("putOrMove before check");
    if (this.#lastaction.res !== Action.SUCCESS) return false;
    const act = this.#lastaction;
    const x = act.x;
    const y = act.y;
    const t = act.type;
    if (t === Action.PUT) return this.#put(x, y);
    if (t === Action.MOVE) return this.#move(x, y);
    return true;
  }

  #put(x: number, y: number): boolean {
    if (!this.#checkPut(x, y)) return false;
    if (!this.field.setAgent(this.playerIdx, x, y)) {
      return false; // throw new Error("can't enter the wall");
    }
    this.x = x;
    this.y = y;
    return true;
  }

  #move(x: number, y: number): boolean {
    if (!this.#checkMove(x, y)) return false;
    if (!this.field.setAgent(this.playerIdx, x, y)) {
      return false; // throw new Error("can't enter the wall");
    }
    this.x = x;
    this.y = y;
    return true;
  }

  remove(): boolean {
    if (this.#lastaction == null) throw new Error("remove before check");
    const { x, y } = this.#lastaction;
    if (!this.#checkRemove(x, y)) return false;
    this.field.set(x, y, Field.AREA, null);
    return true;
  }

  commit(): void {
    this.#lastaction = null;
  }

  revert(): void {
    const act = this.#lastaction;
    if (
      act && (act.type === Action.MOVE || act.type === Action.PUT) &&
      act.res === Action.SUCCESS
    ) {
      act.res = Action.REVERT;
      this.x = this.bkx;
      this.y = this.bky;
    }
  }
}

export type ActionType = 1 | 2 | 3 | 4;
export type ActionRes = 0 | 1 | 2 | 3 | 4 | 5;
export type ActionArray = [number, ActionType, number, number];

class Action {
  agentId: number;
  type: ActionType;
  x: number;
  y: number;
  res: ActionRes;

  // Action Type
  static readonly PUT = 1;
  static readonly NONE = 2;
  static readonly MOVE = 3;
  static readonly REMOVE = 4;

  // Action Res
  static readonly SUCCESS = 0;
  static readonly CONFLICT = 1;
  static readonly REVERT = 2;
  static readonly ERR_ONLY_ONE_TURN = 3;
  static readonly ERR_ILLEGAL_AGENT = 4;
  static readonly ERR_ILLEGAL_ACTION = 5;

  constructor(agentid: number, type: ActionType, x: number, y: number) {
    this.agentId = agentid;
    this.type = type;
    this.x = x;
    this.y = y;
    this.res = Action.SUCCESS;
  }

  static fromJSON(data: ActionJson) {
    const action = new Action(data.agentId, data.type, data.x, data.y);
    action.res = data.res;
    return action;
  }

  static getMessage(res: ActionRes): string {
    return [
      "success",
      "conflict",
      "revert",
      "err: only 1 turn",
      "err: illegal agent",
      "err: illegal action",
    ][res];
  }

  static fromArray = (array: ActionArray[]) =>
    array.map((a) => new Action(a[0], a[1], a[2], a[3]));
}

type FieldType = typeof Field.AREA | typeof Field.WALL;
export type FieldTile = { type: FieldType; player: null | number };

export type FieldInit = Omit<Board, "totalTurn">;

class Field {
  width: number;
  height: number;
  nAgent: number;
  nPlayer: number;
  points: number[];
  tiles: FieldTile[];

  static readonly AREA = 0;
  static readonly WALL = 1;

  constructor({ width, height, points, nAgent = 4, nPlayer = 2 }: FieldInit) {
    if (points.length !== width * height) {
      throw Error("points.length must be " + width * height);
    }

    this.width = width;
    this.height = height;
    this.nAgent = nAgent;
    this.nPlayer = nPlayer;
    this.points = points;
    this.tiles = new Array(width * height).fill({
      type: Field.AREA,
      player: null,
    });
  }

  static fromJSON(data: FieldJson) {
    const { tiles, ...init } = data;
    const field = new Field(init);
    field.tiles = tiles;
    return field;
  }

  set(x: number, y: number, att: FieldType, playerid: number | null): void {
    if (playerid !== null && playerid < 0) {
      throw Error("playerid must be 0 or more");
    }
    this.tiles[x + y * this.width] = { type: att, player: playerid };
  }

  get(x: number, y: number): FieldTile {
    return this.tiles[x + y * this.width];
  }

  setAgent(playerid: number, x: number, y: number): boolean {
    const { type: att, player: pid } = this.get(x, y);
    if (att === Field.WALL && pid !== playerid) return false;
    this.set(x, y, Field.WALL, playerid);
    return true;
  }

  fillArea(): void {
    // プレイヤーごとに入れ子関係なく囲まれている所にフラグを立て、まとめる。
    // (bitごと 例:010だったら、1番目のプレイヤーの領地or城壁であるという意味)
    // 各マスの立っているbitが一つだけだったらそのプレイヤーの領地or城壁で確定。
    // 2つ以上bitが立っていたら入れ子になっているので、その部分だけmaskをかけ、もう一度最初からやり直す。
    // （whileするたびに入れ子が一個ずつ解消されていくイメージ）
    // 説明難しい…

    const w = this.width;
    const h = this.height;
    const field: FieldTile[] = [];

    // 外側に空白のマスを作る
    for (let y = -1; y < h + 1; y++) {
      for (let x = -1; x < w + 1; x++) {
        if (x < 0 || x >= w || y < 0 || y >= h) {
          field.push({ type: Field.AREA, player: null });
        } else field.push({ ...this.tiles[x + y * w] });
      }
    }

    const mask = new Array(field.length);
    for (let i = 0; i < mask.length; i++) mask[i] = 1;

    while (mask.reduce((s, c) => s + c)) {
      const area = new Array(field.length);
      for (let pid = 0; pid < this.nPlayer; pid++) {
        for (let i = 0; i < field.length; i++) {
          area[i] |= 1 << pid;
        }
        // 外側の囲まれていないところを判定
        const chk = (x: number, y: number) => {
          const n = x + y * (w + 2);
          if (x < 0 || x >= w + 2 || y < 0 || y >= h + 2) return;
          else if ((area[n] & (1 << pid)) === 0) return;
          else if (
            mask[n] !== 0 && field[n].type === Field.WALL &&
            field[n].player === pid
          ) {
            return;
          } else {
            area[n] &= ~(1 << pid);
            chk(x - 1, y);
            chk(x + 1, y);
            chk(x - 1, y - 1);
            chk(x, y - 1);
            chk(x + 1, y - 1);
            chk(x - 1, y + 1);
            chk(x, y + 1);
            chk(x + 1, y + 1);
          }
        };
        chk(0, 0);
        //console.log(mask, narea, pid);
      }

      //console.log(area);

      //console.log("mamamama");
      //console.log(mask, area, "mask");
      for (let i = 0; i < field.length; i++) {
        if (area[i] === 0) {
          mask[i] = 0;
        } else if ((area[i] & (area[i] - 1)) === 0) { // 2のべき乗かを判定
          field[i].player = Math.log2(area[i]);
          mask[i] = 0;
        }
      }
    }

    for (let i = 0; i < w; i++) {
      for (let j = 0; j < h; j++) {
        const n = i + j * w;
        const nexp = (i + 1) + (j + 1) * (w + 2);
        if (this.tiles[n].type !== Field.WALL) {
          this.tiles[n].player = field[nexp].player;
        }
      }
    }
  }

  getPoints(): Point[] {
    const points: ReturnType<Field["getPoints"]> = [];
    for (let i = 0; i < this.nPlayer; i++) {
      points[i] = { areaPoint: 0, wallPoint: 0 };
    }
    this.tiles.forEach(({ type: att, player: pid }, idx) => {
      if (pid === null) return;
      const p = points[pid];
      const pnt = this.points[idx];
      if (att === Field.WALL) {
        p.wallPoint += pnt;
      } else if (att === Field.AREA) {
        p.areaPoint += Math.abs(pnt);
      }
    });
    return points;
  }
}

export type GameInit = Board;

class Game {
  totalTurn: number;
  players: Player[];
  field: Field;
  log: {
    players: {
      point: Point;
      actions: Action[];
    }[];
  }[];
  turn: number;

  constructor(gameInit: GameInit) {
    const { totalTurn = 30, ...fieldInit } = gameInit;

    this.totalTurn = totalTurn;
    this.players = [];
    this.field = new Field(fieldInit);
    this.log = [];
    this.turn = 0;
  }

  static fromJSON(data: GameJson): Game {
    const board: GameInit = {
      width: data.field.width,
      height: data.field.height,
      points: data.field.points,
      nAgent: data.field.nAgent,
      nPlayer: data.field.nPlayer,
      totalTurn: data.totalTurn,
    };
    const game = new Game(board);
    game.players = data.players.map((p) => Player.fromJSON(p, game));
    game.field.tiles = data.field.tiles;
    game.log = data.log;
    game.turn = data.turn;
    return game;
  }

  attachPlayer(player: Player): boolean {
    if (!this.isFree()) return false;
    if (this.players.indexOf(player) >= 0) return false;

    player.index = this.players.push(player) - 1;
    player.setGame(this);
    return true;
  }

  // status : free -> ready -> gaming -> ended
  getStatus() {
    if (this.turn === 0) {
      if (this.players.length < this.field.nPlayer) return "free";
      else return "ready";
    } else if (this.log.length !== this.totalTurn) {
      return "gaming";
    } else {
      return "ended";
    }
  }
  isFree() {
    return this.getStatus() === "free";
  }
  isReady() {
    return this.getStatus() === "ready";
  }
  isGaming() {
    return this.getStatus() === "gaming";
  }
  isEnded() {
    return this.getStatus() === "ended";
  }

  start(): void {
    this.turn = 1;
  }

  nextTurn(): boolean {
    const actions: Action[][] = [];
    this.players.forEach((p, idx) => actions[idx] = p.getActions());
    // console.log("actions", actions);

    this.#checkActions(actions); // 同じエージェントの2回移動、画面外など無効な操作をチェック
    this.#revertNotOwnerWall(); // PUT, MOVE先が敵陣壁ではないか？チェックし無効化
    this.#checkConflict(actions); // 同じマスを差しているものはすべて無効 // 壁remove & move は、removeが有効
    this.#revertOverlap(); // 仮に配置または動かし、かぶったところをrevert
    this.#putOrMove(); // 配置または動かし、フィールド更新
    this.#removeOrNot(); // AgentがいるところをREMOVEしているものはrevert

    this.#commit();

    this.field.fillArea();

    this.log.push({
      players: actions.map((ar, idx) => {
        return {
          point: this.field.getPoints()[idx],
          actions: ar,
        };
      }),
    });

    this.players.forEach((p) => p.clearActions());
    if (this.turn < this.totalTurn) {
      this.turn++;
      return true;
    } else {
      return false;
    }
  }

  #checkActions(actions: Action[][]): void {
    const nplayer = actions.length;
    // 範囲外と、かぶりチェック
    for (let playerid = 0; playerid < nplayer; playerid++) {
      const done: Record<string, Action> = {};
      actions[playerid].forEach((a) => {
        const aid = a.agentId;
        const agents = this.players[playerid].agents;
        if (aid < 0 || aid >= agents.length) {
          a.res = Action.ERR_ILLEGAL_AGENT;
          return;
        }
        const doneAgent = done[aid];
        if (doneAgent) {
          a.res = Action.ERR_ONLY_ONE_TURN;
          doneAgent.res = Action.ERR_ONLY_ONE_TURN;
          return;
        }
        done[aid] = a;
      });
    }
    // 変な動きチェック
    for (let playerid = 0; playerid < nplayer; playerid++) {
      actions[playerid].filter((a) => a.res === Action.SUCCESS).forEach((a) => {
        const aid = a.agentId;
        const agents = this.players[playerid].agents;
        const agent = agents[aid];
        if (!agent.check(a)) {
          a.res = Action.ERR_ILLEGAL_ACTION;
          return;
        }
      });
    }
  }

  #checkConflict(actions: Action[][]): void {
    //console.log("Actions", actions);
    const chkfield: Action[][] = new Array(this.field.tiles.length);
    for (let i = 0; i < chkfield.length; i++) {
      chkfield[i] = [];
    }
    const nplayer = actions.length;
    for (let playerid = 0; playerid < nplayer; playerid++) {
      actions[playerid].forEach((a) => {
        if (a.res !== Action.SUCCESS) return false;
        const n = a.x + a.y * this.field.width;
        if (n >= 0 && n < chkfield.length) {
          chkfield[n].push(a);
        }
      });
    }
    // PUT/MOVE/REMOVE、競合はすべて無効
    chkfield.filter((a) => a.length >= 2).forEach((a) => {
      // console.log("conflict", a);
      a.forEach((action) => action.res = Action.CONFLICT);
    });
  }

  #putOrMove(): void {
    flat(this.players.map((p) => p.agents)).forEach((agent) => {
      if (!agent.isValidAction()) return;
      if (!agent.putOrMove()) {
        // throw new Error("illegal action!")
        // console.log(`throw new Error("illegal action!")`);
        return;
      }
    });
  }

  #revertOverlap(): void {
    let reverts = false;
    const chkfield: Agent[][] = new Array(this.field.tiles.length);
    do {
      for (let i = 0; i < chkfield.length; i++) {
        chkfield[i] = [];
      }
      flat(this.players.map((p) => p.agents)).forEach((agent) => {
        const act = agent.isValidAction();
        if (
          act &&
          (act.type === Action.MOVE || act.type === Action.PUT)
        ) {
          const n = act.x + act.y * this.field.width;
          //console.log("act", n);
          chkfield[n].push(agent);
        } else {
          if (agent.x === -1) return;
          const n = agent.x + agent.y * this.field.width;
          //console.log("agent", n);
          chkfield[n].push(agent);
        }
      });
      reverts = false;
      //console.log("chkfield", chkfield);
      chkfield.filter((a) => a.length >= 2).forEach((a) => {
        // console.log("**\nreverts", a);
        a.forEach((agent) => agent.revert());
        reverts = true;
      });
      //console.log(reverts);
    } while (reverts); // revertがあったら再度全件チェック
  }

  #removeOrNot(): void {
    const agents = flat(this.players.map((p) => p.agents));
    agents.forEach((agent) => {
      if (agent.x === -1) return;
      const act = agent.isValidAction();
      if (!act) return;
      if (act.type !== Action.REMOVE) return;
      if (agents.find((a) => a.x === act.x && a.y === act.y)) {
        act.res = Action.REVERT;
      } else {
        agent.remove();
      }
    });
  }

  #revertNotOwnerWall(): void {
    const agents = flat(this.players.map((p) => p.agents));
    const fld = this.field.tiles;
    const w = this.field.width;
    agents.forEach((agent) => {
      if (agent.x === -1) return;
      const act = agent.isValidAction();
      if (!act) return;
      if (act.type !== Action.MOVE && act.type !== Action.PUT) return;
      // only PUT & MOVE
      const n = act.x + act.y * w;
      const f = fld[n];
      const iswall = f.type === Field.WALL;
      const owner = f.player;
      if (iswall && owner !== agent.playerIdx && owner !== -1) {
        agent.revert();
      }
    });
  }

  #commit(): void {
    const agents = flat(this.players.map((p) => p.agents));
    agents.forEach((agent) => {
      // if (agent.x === -1) return;
      // if (!agent.isValidAction()) return;
      agent.commit();
    });
  }
}

class Player<T extends Game = Game> {
  id: string;
  spec: string;
  game: T | null;
  actions: Action[];
  index: number;
  agents: Agent[];

  constructor(id: string, spec = "") {
    this.id = id;
    this.spec = spec;
    this.game = null;
    this.actions = [];
    this.index = -1;
    this.agents = [];
  }

  static fromJSON(data: PlayerJson, game?: Game): Player {
    const player = new Player(data.id, data.spec);
    player.index = data.index;
    if (game) {
      player.game = game;
      player.agents = data.agents.map((a) => {
        return Agent.fromJSON(a, player.index, game.field);
      });
    }

    return player;
  }

  toJSON(): PlayerJson {
    return {
      id: this.id,
      spec: this.spec,
      index: this.index,
      actions: this.actions,
      agents: this.agents,
    };
  }

  setGame(game: T): void {
    this.game = game;
    for (let j = 0; j < game.field.nAgent; j++) {
      this.agents.push(new Agent(game.field, this.index));
    }
  }

  setActions(actions: Action[]): typeof Game.prototype.turn {
    if (this.game === null) throw new Error("game is null");
    this.actions = actions;
    return this.game.turn;
  }

  getActions(): typeof Player.prototype.actions {
    return this.actions;
  }

  clearActions(): void {
    this.actions = [];
  }
}

export { Action, Agent, type Board, Field, Game, Player };

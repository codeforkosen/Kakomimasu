import { flat } from "./util.ts";

class Board {
  public w: number;
  public h: number;
  public points: number[];
  public nagent: number;
  public nturn: number;
  public nsec: number;
  public nplayer: number;
  public name: string;

  constructor(
    { w, h, points, nagent, nturn, nsec, nplayer, name }: {
      w: number;
      h: number;
      points: number[];
      nagent: number;
      nturn?: number;
      nsec?: number;
      nplayer?: number;
      name?: string;
    },
  ) {
    this.w = w;
    this.h = h;
    this.points = points;
    this.nagent = nagent;
    this.nturn = nturn || 30;
    this.nsec = nsec || 3;
    this.nplayer = nplayer || 2;
    this.name = name || "";
    if (this.points.length !== this.w * this.h) {
      throw new Error("points.length must be " + this.w * this.h);
    }
    //console.log("board", this, this.name);
    // if (!(w >= 12 && w <= 24 && h >= 12 && h <= 24)) { throw new Error("w and h 12-24"); }
  }

  static restore(data: Board): Board {
    const board = new Board(data);
    return board;
  }

  toLogJSON(): Board {
    return { ...this };
  }

  getJSON(): {
    name: string;
    w: number;
    h: number;
    points: number[];
    nagents: number;
    nturn: number;
    nsec: number;
    nplayer: number;
  } {
    return {
      name: this.name,
      w: this.w,
      h: this.h,
      points: this.points,
      nagents: this.nagent,
      nturn: this.nturn,
      nsec: this.nsec,
      nplayer: this.nplayer,
    };
  }

  toJSON(): {
    name: string;
    width: number;
    height: number;
    nAgent: number;
    nPlayer: number;
    nTurn: number;
    nSec: number;
    points: number[];
  } {
    return {
      name: this.name,
      width: this.w,
      height: this.h,
      nAgent: this.nagent,
      nPlayer: this.nplayer,
      nTurn: this.nturn,
      nSec: this.nsec,
      points: this.points,
    };
  }
}

class Agent {
  public board: Board;
  public field: Field;
  public playerid: number;
  public x: number;
  public y: number;
  public bkx: number;
  public bky: number;
  public lastaction: Action | null;

  constructor(board: Board, field: Field, playerid: number) {
    this.board = board;
    this.field = field;
    this.playerid = playerid;
    this.x = -1;
    this.y = -1;
    this.bkx = -1;
    this.bky = -1;
    this.lastaction = null;
  }

  static restore(data: Agent, board: Board, field: Field): Agent {
    const agent = new Agent(board, field, data.playerid);
    agent.x = data.x;
    agent.y = data.y;
    agent.bkx = data.bkx;
    agent.bky = data.bky;
    agent.lastaction = data.lastaction;
    return agent;
  }

  toLogJSON(): Agent & { board: null; field: null } {
    return { ...this, board: null, field: null };
  }

  isOnBoard(): boolean {
    return this.x !== -1;
  }

  checkOnBoard(x: number, y: number): boolean {
    return x >= 0 && x < this.board.w && y >= 0 && y < this.board.h;
  }

  checkDir(x: number, y: number): boolean {
    if (this.x === x && this.y === y) return false;
    return Math.abs(this.x - x) <= 1 && Math.abs(this.y - y) <= 1;
  }

  check(act: Action): boolean {
    this.lastaction = act;
    const x = act.x;
    const y = act.y;
    const t = act.type;
    if (t === Action.PUT) return this.checkPut(x, y);
    if (t === Action.NONE) return this.checkNone(x, y);
    if (t === Action.MOVE) return this.checkMove(x, y);
    if (t === Action.REMOVE) return this.checkRemove(x, y);
    return false;
  }

  checkPut(x: number, y: number): boolean {
    if (this.isOnBoard()) return false;
    if (!this.checkOnBoard(x, y)) return false;
    return true;
  }

  checkNone(_x: number, _y: number): boolean {
    if (!this.isOnBoard()) return false;
    return true;
  }

  checkMove(x: number, y: number) {
    if (!this.isOnBoard()) return false;
    if (!this.checkOnBoard(x, y)) return false;
    if (!this.checkDir(x, y)) return false;
    return true;
  }

  checkRemove(x: number, y: number) {
    if (!this.isOnBoard()) return false;
    if (!this.checkOnBoard(x, y)) return false;
    if (!this.checkDir(x, y)) return false;
    //const _n = x + y * this.board.w;
    if (this.field.get(x, y).type !== Field.WALL) return false;
    return true;
  }

  isValidAction(): boolean {
    if (!this.lastaction) return false;
    if (this.lastaction.res !== Action.SUCCESS) return false;
    return true;
  }

  putOrMove(): boolean {
    //console.log("putormove", this);
    if (this.lastaction == null) throw new Error("putOrMove before check");
    if (this.lastaction.res !== Action.SUCCESS) return false;
    const act = this.lastaction;
    const x = act.x;
    const y = act.y;
    const t = act.type;
    if (t === Action.PUT) return this.put(x, y);
    if (t === Action.MOVE) return this.move(x, y);
    return true;
  }

  put(x: number, y: number): boolean {
    if (!this.checkPut(x, y)) return false;
    if (!this.field.setAgent(this.playerid, x, y)) {
      return false; // throw new Error("can't enter the wall");
    }
    this.x = x;
    this.y = y;
    return true;
  }

  none(x: number, y: number): boolean {
    if (!this.checkNone(x, y)) return false;
    return true;
  }

  move(x: number, y: number): boolean {
    if (!this.checkMove(x, y)) return false;
    if (!this.field.setAgent(this.playerid, x, y)) {
      return false; // throw new Error("can't enter the wall");
    }
    this.x = x;
    this.y = y;
    return true;
  }

  remove(): boolean {
    if (this.lastaction == null) throw new Error("remove before check");
    const { x, y } = this.lastaction;
    if (!this.checkRemove(x, y)) return false;
    this.field.set(x, y, Field.BASE, null);
    return true;
  }

  commit(): void {
    this.bkx = this.x;
    this.bky = this.y;
    this.lastaction = null;
  }

  revert(): void {
    this.x = this.bkx;
    this.y = this.bky;
    const act = this.lastaction;
    if (
      act && (act.type === Action.MOVE || act.type === Action.PUT) &&
      act.res === Action.SUCCESS
    ) {
      act.res = Action.REVERT;
    }
  }

  getJSON(): { x: number; y: number } {
    return { x: this.x, y: this.y };
  }
}

export type ActionType = 1 | 2 | 3 | 4;
type ActionRes = 0 | 1 | 2 | 3 | 4 | 5;
export type ActionJSON = [number, ActionType, number, number];

class Action {
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

  constructor(agentid: number, type: ActionType, x: number, y: number) {
    this.agentid = agentid;
    this.type = type;
    this.x = x;
    this.y = y;
    this.res = Action.SUCCESS;
  }

  getJSON(): {
    agentId: number;
    type: ActionType;
    x: number;
    y: number;
    res: ActionRes;
  } {
    return {
      agentId: this.agentid,
      type: this.type,
      x: this.x,
      y: this.y,
      res: this.res,
    };
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

  static fromJSON = (array: ActionJSON[]) =>
    array.map((a) => new Action(a[0], a[1], a[2], a[3]));
}

type FieldType = typeof Field.BASE | typeof Field.WALL;
type FieldCell = { type: FieldType; player: null | number };

class Field {
  public board: Board;
  public field: FieldCell[];

  public static readonly BASE = 0;
  public static readonly WALL = 1;

  constructor(board: Board) {
    this.board = board;
    // field
    this.field = [];
    for (let i = 0; i < this.board.w * this.board.h; i++) {
      this.field.push({ type: Field.BASE, player: null });
    }
  }

  toLogJSON(): Field & { board: null } {
    return { ...this, board: null };
  }

  set(x: number, y: number, att: FieldType, playerid: number | null): void {
    if (playerid !== null && playerid < 0) {
      throw Error("playerid must be 0 or more");
    }
    this.field[x + y * this.board.w] = { type: att, player: playerid };
  }

  get(x: number, y: number): FieldCell {
    return this.field[x + y * this.board.w];
  }

  setAgent(playerid: number, x: number, y: number): boolean {
    const { type: att, player: pid } = this.get(x, y);
    if (att === Field.WALL && pid !== playerid) return false;
    this.set(x, y, Field.WALL, playerid);
    return true;
  }

  fillBase(): void {
    // プレイヤーごとに入れ子関係なく囲まれている所にフラグを立て、まとめる。
    // (bitごと 例:010だったら、1番目のプレイヤーの領地or城壁であるという意味)
    // 各マスの立っているbitが一つだけだったらそのプレイヤーの領地or城壁で確定。
    // 2つ以上bitが立っていたら入れ子になっているので、その部分だけmaskをかけ、もう一度最初からやり直す。
    // （whileするたびに入れ子が一個ずつ解消されていくイメージ）
    // 説明難しい…

    const w = this.board.w;
    const h = this.board.h;
    const field: FieldCell[] = [];

    // 外側に空白のマスを作る
    for (let y = -1; y < h + 1; y++) {
      for (let x = -1; x < w + 1; x++) {
        if (x < 0 || x >= w || y < 0 || y >= h) {
          field.push({ type: Field.BASE, player: null });
        } else field.push({ ...this.field[x + y * w] });
      }
    }

    const mask = new Array(field.length);
    for (let i = 0; i < mask.length; i++) mask[i] = 1;

    while (mask.reduce((s, c) => s + c)) {
      const area = new Array(field.length);
      for (let pid = 0; pid < this.board.nplayer; pid++) {
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
        if (this.field[n].type !== Field.WALL) {
          this.field[n].player = field[nexp].player;
        }
      }
    }
  }

  getPoints(): { basepoint: number; wallpoint: number }[] {
    // tilePoint,areaPointの区別が必要→ここでいうWallとBaseかな？
    const points: { basepoint: number; wallpoint: number }[] = [];
    for (let i = 0; i < this.board.nplayer; i++) {
      points[i] = { basepoint: 0, wallpoint: 0 };
    }
    this.field.forEach(({ type: att, player: pid }, idx) => {
      if (pid === null) return;
      const p = points[pid];
      const pnt = this.board.points[idx];
      if (att === Field.WALL) {
        p.wallpoint += pnt;
      } else if (att === Field.BASE) {
        p.basepoint += Math.abs(pnt);
      }
    });
    return points;
  }

  getJSON(): FieldCell[] {
    return this.field;
  }
}

class Game {
  public board: Board;
  public players: Player[];
  public nturn: number;
  public nsec: number;
  public gaming: boolean;
  public ending: boolean;
  public field: Field;
  public log: {
    players: {
      point: { basepoint: number; wallpoint: number };
      actions: ReturnType<typeof Action.prototype.getJSON>[];
    }[];
  }[];
  public turn: number;
  //public agents: Agent[][];

  constructor(board: Board) {
    this.board = board;
    this.players = [];
    this.nturn = board.nturn;
    this.nsec = board.nsec;
    this.gaming = false;
    this.ending = false;
    //this.actions = [];
    this.field = new Field(board);
    this.log = [];
    this.turn = 0;
  }

  static restore(data: Game): Game {
    const board = Board.restore(data.board);
    const game = new Game(board);
    game.players = data.players.map((p) => Player.restore(p));
    game.gaming = data.gaming;
    game.ending = data.ending;
    game.field.field = data.field.field;
    game.log = data.log;
    game.turn = data.turn;
    return game;
  }

  toLogJSON(): Game {
    const data = { ...this };
    data.players = data.players.map((p) => p.toLogJSON());
    data.board = data.board.toLogJSON();
    data.field = data.field.toLogJSON();
    return data;
  }

  attachPlayer(player: Player): boolean {
    if (!this.isFree()) return false;
    if (this.players.indexOf(player) >= 0) return false;
    player.index = this.players.length;
    this.players.push(player);
    player.setGame(this);

    return true;
  }

  isReady(): boolean {
    return this.players.length === this.board.nplayer;
  }

  isFree(): boolean {
    return !this.isReady() && !this.gaming && !this.ending;
  }

  isGaming(): boolean {
    return this.gaming && !this.ending;
  }

  start(): void {
    this.turn = 1;
    this.gaming = true;
    this.players.forEach((p) => p.noticeStart());
  }

  /*setActions(player, actions) {
    this.actions[player] = actions;
  }*/

  nextTurn(): boolean {
    const actions: Action[][] = [];
    this.players.forEach((p, idx) => actions[idx] = p.getActions());
    // console.log("actions", actions);

    this.checkActions(actions); // 同じエージェントの2回移動、画面外など無効な操作をチェック
    this.revertNotOwnerWall(); // PUT, MOVE先が敵陣壁ではないか？チェックし無効化
    this.checkConflict(actions); // 同じマスを差しているものはすべて無効 // 壁remove & move は、removeが有効
    this.revertOverlap(); // 仮に配置または動かし、かぶったところをrevert
    this.putOrMove(); // 配置または動かし、フィールド更新
    this.removeOrNot(); // AgentがいるところをREMOVEしているものはrevert

    this.commit();

    this.checkAgentConflict();

    this.field.fillBase();

    this.log.push({
      players: actions.map((ar, idx) => {
        return {
          point: this.field.getPoints()[idx],
          actions: ar.map((a) => a.getJSON()),
        };
      }),
    });

    if (this.turn < this.nturn) {
      this.turn++;
    } else {
      this.gaming = false;
      this.ending = true;
    }
    this.players.forEach((p) => p.clearActions());
    return this.gaming;
  }

  checkActions(actions: Action[][]): void {
    const nplayer = actions.length;
    // 範囲外と、かぶりチェック
    for (let playerid = 0; playerid < nplayer; playerid++) {
      const done: Record<string, Action> = {};
      actions[playerid].forEach((a) => {
        const aid = a.agentid;
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
        const aid = a.agentid;
        const agents = this.players[playerid].agents;
        const agent = agents[aid];
        if (!agent.check(a)) {
          a.res = Action.ERR_ILLEGAL_ACTION;
          return;
        }
      });
    }
  }

  checkConflict(actions: Action[][]): void {
    //console.log("Actions", actions);
    const chkfield: Action[][] = new Array(this.field.field.length);
    for (let i = 0; i < chkfield.length; i++) {
      chkfield[i] = [];
    }
    const nplayer = actions.length;
    for (let playerid = 0; playerid < nplayer; playerid++) {
      actions[playerid].forEach((a) => {
        if (a.res !== Action.SUCCESS) return false;
        const n = a.x + a.y * this.board.w;
        if (n >= 0 && n < chkfield.length) {
          chkfield[n].push(a);
        } else {
          console.log("?? n", n);
        }
      });
    }
    // PUT/MOVE/REMOVE、競合はすべて無効
    chkfield.filter((a) => a.length >= 2).forEach((a) => {
      // console.log("conflict", a);
      a.forEach((action) => action.res = Action.CONFLICT);
    });
  }

  checkAgentConflict(): void {
    const chkfield = new Array(this.field.field.length);
    for (let i = 0; i < chkfield.length; i++) {
      chkfield[i] = [];
    }

    flat(this.players.map((p) => p.agents)).forEach((agent) => {
      if (agent.x === -1) return;
      const _act = agent.lastaction;
      const n = agent.x + agent.y * this.board.w;
      chkfield[n].push(agent);
      // console.log("agent", agent.playerid, agent.x, agent.y);
    });
    chkfield.filter((a) => a.length >= 2).forEach((a) => {
      console.log("**\nduplicate!!", a);
      throw Error("**\nduplicate!!");
      //Deno.exit(0);
    });
  }

  putOrMove(): void {
    flat(this.players.map((p) => p.agents)).forEach((agent) => {
      if (!agent.isValidAction()) return;
      if (!agent.putOrMove()) {
        // throw new Error("illegal action!")
        // console.log(`throw new Error("illegal action!")`);
        return;
      }
    });
  }

  revertOverlap(): void {
    let reverts = false;
    const chkfield: Agent[][] = new Array(this.field.field.length);
    do {
      for (let i = 0; i < chkfield.length; i++) {
        chkfield[i] = [];
      }
      flat(this.players.map((p) => p.agents)).forEach((agent) => {
        const act = agent.lastaction;
        if (
          agent.isValidAction() && act &&
          (act.type === Action.MOVE || act.type === Action.PUT)
        ) {
          const n = act.x + act.y * this.board.w;
          //console.log("act", n);
          chkfield[n].push(agent);
        } else {
          if (agent.x === -1) return;
          const n = agent.x + agent.y * this.board.w;
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

  removeOrNot(): void {
    const agents = flat(this.players.map((p) => p.agents));
    agents.forEach((agent) => {
      if (agent.x === -1) return;
      if (!agent.isValidAction()) return;
      const act = agent.lastaction;
      if (!act) return;
      if (act.type !== Action.REMOVE) return;
      if (agents.find((a) => a.x === act.x && a.y === act.y)) {
        act.res = Action.REVERT;
      } else {
        agent.remove();
      }
    });
  }

  revertNotOwnerWall(): void {
    const agents = flat(this.players.map((p) => p.agents));
    const fld = this.field.field;
    const w = this.board.w;
    agents.forEach((agent) => {
      if (agent.x === -1) return;
      if (!agent.isValidAction()) return;
      const act = agent.lastaction;
      if (!act) return;
      if (act.type !== Action.MOVE && act.type !== Action.PUT) return;
      // only PUT & MOVE
      const n = act.x + act.y * w;
      const f = fld[n];
      const iswall = f.type === Field.WALL;
      const owner = f.player;
      if (iswall && owner !== agent.playerid && owner !== -1) {
        agent.revert();
      }
    });
  }

  commit(): void {
    const agents = flat(this.players.map((p) => p.agents));
    agents.forEach((agent) => {
      // if (agent.x === -1) return;
      // if (!agent.isValidAction()) return;
      agent.commit();
    });
  }

  getStatusJSON(): {
    players: ReturnType<typeof Player.prototype.getJSON>[];
    board: ReturnType<typeof Board.prototype.getJSON>;
    field: ReturnType<typeof Field.prototype.getJSON>;
    agents: ReturnType<typeof Agent.prototype.getJSON>[][];
    points: ReturnType<typeof Field.prototype.getPoints>;
    log: typeof Game.prototype.log;
  } {
    return {
      players: this.players.map((p) => p.getJSON()),
      board: this.board.getJSON(),
      field: this.field.getJSON(),
      agents: this.players.map((p) => p.agents.map((a) => a.getJSON())),
      points: this.field.getPoints(),
      log: this.log,
    };
  }

  toJSON(): {
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
  } {
    const players: {
      id: string;
      agents: { x: number; y: number }[];
      point: { basepoint: number; wallpoint: number };
    }[] = [];
    this.players.forEach((p, i) => {
      const id = p.id;
      let agents: { x: number; y: number }[] = [];
      if (this.isReady()) {
        agents = [];
        p.agents.forEach((a) => {
          const agent = {
            x: a.x,
            y: a.y,
          };
          agents.push(agent);
        });
      }
      const player = {
        id: id,
        agents: agents,
        point: this.field.getPoints()[i],
      };
      players.push(player);
    });

    let board = null;
    if (this.isReady()) board = this.board;

    return {
      gaming: this.gaming,
      ending: this.ending,
      board: board ? board.toJSON() : null,
      turn: this.turn,
      totalTurn: this.nturn,
      tiled: this.isReady() ? this.field.field : null,
      players: players,
      log: this.log,
    };
  }
}

class Player<T extends Game = Game> {
  public id: string;
  public spec: string;
  public game: T | null;
  public actions: Action[];
  public index: number;
  public agents: Agent[];

  constructor(id: string, spec = "") {
    this.id = id;
    this.spec = spec;
    this.game = null;
    this.actions = [];
    this.index = -1;
    this.agents = [];
  }

  static restore(data: Player, game?: Game): Player {
    const player = new Player(data.id, data.spec);
    player.index = data.index;
    if (game) {
      player.game = game;
      player.agents = data.agents.map((a) => {
        return Agent.restore(a, game.board, game.field);
      });
    }

    return player;
  }

  toLogJSON(): Player {
    const p = { ...this };
    p.game = null;
    p.agents = p.agents.map((a) => a.toLogJSON());
    return p;
  }

  setGame(game: T): void {
    this.game = game;
    for (let j = 0; j < game.board.nagent; j++) {
      this.agents.push(new Agent(game.board, game.field, this.index));
    }
  }

  noticeStart(): void {
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

  getJSON(): {
    userId: typeof Player.prototype.id;
    spec: typeof Player.prototype.spec;
    index: typeof Player.prototype.index;
  } {
    return {
      userId: this.id,
      spec: this.spec,
      index: this.index,
    };
  }
}

class Kakomimasu {
  public games: Game[];
  public boards: Board[];

  constructor() {
    this.games = [];
    this.boards = [];
  }

  appendBoard(board: Board): void {
    this.boards.push(board);
  }

  getBoards(): typeof Kakomimasu.prototype.boards {
    return this.boards;
  }

  createGame(...param: ConstructorParameters<typeof Game>): Game {
    //console.log(board);
    const game = new Game(...param);
    this.games.push(game);
    return game;
  }

  getGames() {
    return this.games;
  }

  getFreeGames(): Game[] {
    return this.games.filter((g) => g.isFree());
  }

  createPlayer(playername: string, spec = ""): Player {
    if (spec == null) return new Player(playername);
    else return new Player(playername, spec);
  }
}

export { Action, Agent, Board, Field, Game, Kakomimasu, Player };

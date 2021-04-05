import util from "./util.js";

class Board {
  constructor(w, h, points, nagent, nturn, nsec = 3, nplayer = 2) {
    if (typeof w === "object") {
      this.w = w.width;
      this.h = w.height;
      this.points = w.points;
      this.nagent = w.nagent;
      this.nturn = w.nturn || 30;
      this.nsec = w.nsec || 3;
      this.nplayer = w.nplayer || 2;
      this.name = w.name;
    } else {
      this.w = w;
      this.h = h;
      this.points = points;
      this.nagent = nagent;
      this.nturn = nturn;
      this.nsec = nsec;
      this.nplayer = nplayer;
    }
    if (this.points.length !== this.w * this.h) {
      throw new Error("points.length must be " + this.w * this.h);
    }
    //console.log("board", this, this.name);
    // if (!(w >= 12 && w <= 24 && h >= 12 && h <= 24)) { throw new Error("w and h 12-24"); }
  }

  getJSON() {
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

  toJSON() {
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
  constructor(board, field, playerid) {
    this.board = board;
    this.field = field;
    this.playerid = playerid;
    this.x = -1;
    this.y = -1;
    this.bkx = -1;
    this.bky = -1;
    this.lastaction = null;
  }

  static restore(data, board, field) {
    const agent = new Agent(board, field);
    agent.playerid = data.playerid;
    agent.x = data.x;
    agent.y = data.y;
    agent.bkx = data.bkx;
    agent.bky = data.bky;
    agent.lastaction = data.lastaction;
    return agent;
  }

  isOnBoard() {
    return this.x !== -1;
  }

  checkOnBoard(x, y) {
    return x >= 0 && x < this.board.w && y >= 0 && y < this.board.h;
  }

  checkDir(x, y) {
    if (this.x === x && this.y === y) return false;
    return Math.abs(this.x - x) <= 1 && Math.abs(this.y - y) <= 1;
  }

  check(act) {
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

  checkPut(x, y) {
    if (this.isOnBoard()) return false;
    if (!this.checkOnBoard(x, y)) return false;
    return true;
  }

  checkNone(x, y) {
    if (!this.isOnBoard()) return false;
    return true;
  }

  checkMove(x, y) {
    if (!this.isOnBoard()) return false;
    if (!this.checkOnBoard(x, y)) return false;
    if (!this.checkDir(x, y)) return false;
    return true;
  }

  checkRemove(x, y) {
    if (!this.isOnBoard()) return false;
    if (!this.checkOnBoard(x, y)) return false;
    if (!this.checkDir(x, y)) return false;
    const n = x + y * this.board.w;
    if (this.field.get(x, y)[0] !== Field.WALL) return false;
    return true;
  }

  isValidAction() {
    if (!this.lastaction) return false;
    if (this.lastaction.res !== Action.SUCCESS) return false;
    return true;
  }

  putOrMove() {
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

  put(x, y) {
    if (!this.checkPut(x, y)) return false;
    if (!this.field.setAgent(this.playerid, x, y)) {
      return false; // throw new Error("can't enter the wall");
    }
    this.x = x;
    this.y = y;
    return true;
  }

  none(x, y) {
    if (!this.checkNone(x, y)) return false;
    return true;
  }

  move(x, y) {
    if (!this.checkMove(x, y)) return false;
    if (!this.field.setAgent(this.playerid, x, y)) {
      return false; // throw new Error("can't enter the wall");
    }
    this.x = x;
    this.y = y;
    return true;
  }

  remove() {
    if (this.lastaction == null) throw new Error("remove before check");
    const { x, y } = this.lastaction;
    if (!this.checkRemove(x, y)) return false;
    this.field.set(x, y, Field.BASE);
    return true;
  }

  commit() {
    this.bkx = this.x;
    this.bky = this.y;
    this.lastaction = null;
  }

  revert() {
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

  getJSON() {
    return { x: this.x, y: this.y };
  }
}

class Action {
  constructor(agentid, type, x, y) {
    this.agentid = agentid;
    this.type = type;
    this.x = x;
    this.y = y;
    this.res = Action.SUCCESS;
  }

  getJSON() {
    return {
      agentId: this.agentid,
      type: this.type,
      x: this.x,
      y: this.y,
      res: this.res,
    };
  }
}
Action.PUT = 1;
Action.NONE = 2;
Action.MOVE = 3;
Action.REMOVE = 4;

Action.SUCCESS = 0;
Action.CONFLICT = 1;
Action.REVERT = 2;
Action.ERR_ONLY_ONE_TURN = 3;
Action.ERR_ILLEGAL_AGENT = 4;
Action.ERR_ILLEGAL_ACTION = 5;
Action.getMessage = (res) => {
  return [
    "success",
    "conflict",
    "revert",
    "err: only 1 turn",
    "err: illegal agent",
    "err: illegal action",
  ][res];
};

Action.fromJSON = (array) =>
  array.map((a) => new Action(a[0], a[1], a[2], a[3]));

class Field {
  constructor(board) {
    this.board = board;
    // field
    this.field = [];
    for (let i = 0; i < this.board.w * this.board.h; i++) {
      this.field.push([Field.BASE, -1]);
    }
  }

  set(x, y, att, playerid = -1) {
    this.field[x + y * this.board.w] = [att, playerid];
  }

  get(x, y) {
    return this.field[x + y * this.board.w];
  }

  setAgent(playerid, x, y) {
    const [att, pid] = this.get(x, y);
    if (att === Field.WALL && pid !== playerid) return false;
    this.set(x, y, Field.WALL, playerid);
    return true;
  }

  fillBase() {
    // プレイヤーごとに入れ子関係なく囲まれている所にフラグを立て、まとめる。
    // (bitごと 例:010だったら、1番目のプレイヤーの領地or城壁であるという意味)
    // 各マスの立っているbitが一つだけだったらそのプレイヤーの領地or城壁で確定。
    // 2つ以上bitが立っていたら入れ子になっているので、その部分だけmaskをかけ、もう一度最初からやり直す。
    // （whileするたびに入れ子が一個ずつ解消されていくイメージ）
    // 説明難しい…

    const w = this.board.w;
    const h = this.board.h;
    const field = [];

    // 外側に空白のマスを作る
    for (let y = -1; y < h + 1; y++) {
      for (let x = -1; x < w + 1; x++) {
        if (x < 0 || x >= w || y < 0 || y >= h) field.push([0, -1]);
        else field.push(this.field[x + y * w].concat());
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
        const chk = (x, y) => {
          const n = x + y * (w + 2);
          if (x < 0 || x >= w + 2 || y < 0 || y >= h + 2) return;
          else if ((area[n] & (1 << pid)) === 0) return;
          else if (
            mask[n] !== 0 && field[n][0] === Field.WALL && field[n][1] === pid
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
          field[i][1] = Math.log2(area[i]);
          mask[i] = 0;
        }
      }
    }

    for (let i = 0; i < w; i++) {
      for (let j = 0; j < h; j++) {
        const n = i + j * w;
        const nexp = (i + 1) + (j + 1) * (w + 2);
        if (this.field[n][0] !== Field.WALL) {
          this.field[n][1] = field[nexp][1];
        }
      }
    }
  }

  getPoints() {
    // tilePoint,areaPointの区別が必要→ここでいうWallとBaseかな？
    const points = [];
    for (let i = 0; i < this.board.nplayer; i++) {
      points[i] = { basepoint: 0, wallpoint: 0 };
    }
    this.field.forEach(([att, pid], idx) => {
      if (pid < 0) return;
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

  getJSON() {
    return this.field;
  }
}
Field.BASE = 0;
Field.WALL = 1;

class Game {
  constructor(board, dummy) {
    if (dummy) {
      console.log(dummy);
      throw new Error("too much");
    }
    this.uuid = util.uuid();
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

    // agents
    this.agents = [];
    for (let i = 0; i < this.board.nplayer; i++) {
      const a = [];
      for (let j = 0; j < this.board.nagent; j++) {
        a.push(new Agent(board, this.field, i));
      }
      this.agents.push(a);
    }
  }

  static restore(data) {
    const game = new Game(data.board);
    game.uuid = data.uuid;
    game.players = data.players.map(p => Player.restore(p));
    game.gaming = data.gaming;
    game.ending = data.ending;
    game.field.field = data.tiled;
    game.log = data.log;
    game.turn = data.turn;
    game.agents = data.players.map((p, i) => {
      return data.agents[i].map(a => Agent.restore(a, game.board, game.field));
    });
    return game;
  }

  attachPlayer(player) {
    if (!this.isFree()) return false;
    if (this.players.indexOf(player) >= 0) return false;
    player.index = this.players.length;
    this.players.push(player);
    player.setGame(this);

    return true;
  }

  isReady() {
    return this.players.length === this.board.nplayer;
  }

  isFree() {
    return !this.isReady() && !this.gaming && !this.ending;
  }

  isGaming() {
    return this.gaming && !this.ending;
  }

  start() {
    this.turn = 1;
    this.gaming = true;
    this.players.forEach((p) => p.noticeStart());
  }

  /*setActions(player, actions) {
    this.actions[player] = actions;
  }*/

  nextTurn() {
    const actions = [];
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

    this.log.push(
      actions.map((ar, idx) => {
        return {
          point: this.field.getPoints()[idx],
          actions: ar.map((a) => a.getJSON()),
        };
      }),
    );

    if (this.turn < this.nturn) {
      this.turn++;
    } else {
      this.gaming = false;
      this.ending = true;
    }
    this.players.forEach((p) => p.clearActions());
    return this.gaming;
  }

  checkActions(actions) {
    const nplayer = actions.length;
    // 範囲外と、かぶりチェック
    for (let playerid = 0; playerid < nplayer; playerid++) {
      const done = {};
      actions[playerid].forEach((a) => {
        const aid = a.agentid;
        const agents = this.agents[playerid];
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
        const agents = this.agents[playerid];
        const agent = agents[aid];
        if (!agent.check(a)) {
          a.res = Action.ERR_ILLEGAL_ACTION;
          return;
        }
      });
    }
  }

  checkConflict(actions) {
    const chkfield = new Array(this.field.field.length);
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

  checkAgentConflict() {
    const chkfield = new Array(this.field.field.length);
    for (let i = 0; i < chkfield.length; i++) {
      chkfield[i] = [];
    }
    this.agents.flat().forEach((agent) => {
      if (agent.x === -1) return;
      const act = agent.lastaction;
      const n = agent.x + agent.y * this.board.w;
      chkfield[n].push(agent);
      // console.log("agent", agent.playerid, agent.x, agent.y);
    });
    chkfield.filter((a) => a.length >= 2).forEach((a) => {
      console.log("**\nduplicate!!", a);
      Deno.exit(0);
    });
  }

  putOrMove() {
    this.agents.flat().forEach((agent) => {
      if (!agent.isValidAction()) return;
      if (!agent.putOrMove()) {
        // throw new Error("illegal action!")
        // console.log(`throw new Error("illegal action!")`);
        return;
      }
    });
  }

  revertOverlap() {
    let reverts = false;
    const chkfield = new Array(this.field.field.length);
    do {
      for (let i = 0; i < chkfield.length; i++) {
        chkfield[i] = [];
      }
      this.agents.flat().forEach((agent) => {
        const act = agent.lastaction;
        if (
          agent.isValidAction() &&
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

  removeOrNot() {
    const agents = this.agents.flat();
    agents.forEach((agent) => {
      if (agent.x === -1) return;
      if (!agent.isValidAction()) return;
      const act = agent.lastaction;
      if (act.type !== Action.REMOVE) return;
      if (agents.find((a) => a.x === act.x && a.y === act.y)) {
        act.res = Action.REVERT;
      } else {
        agent.remove();
      }
    });
  }

  revertNotOwnerWall() {
    const agents = this.agents.flat();
    const fld = this.field.field;
    const w = this.board.w;
    agents.forEach((agent) => {
      if (agent.x === -1) return;
      if (!agent.isValidAction()) return;
      const act = agent.lastaction;
      if (act.type !== Action.MOVE && act.type !== Action.PUT) return;
      // only PUT & MOVE
      const n = act.x + act.y * w;
      const f = fld[n];
      const iswall = f[0] === Field.WALL;
      const owner = f[1];
      if (iswall && owner !== agent.playerid && owner !== -1) {
        agent.revert();
      }
    });
  }

  commit() {
    const agents = this.agents.flat();
    agents.forEach((agent) => {
      // if (agent.x === -1) return;
      // if (!agent.isValidAction()) return;
      agent.commit();
    });
  }

  getStatusJSON() {
    return {
      players: this.players.map((p) => p.getJSON()),
      board: this.board.getJSON(),
      field: this.field.getJSON(),
      agents: this.agents.map((ar) => ar.map((a) => a.getJSON())),
      points: this.field.getPoints(),
      log: this.log,
    };
  }

  toJSON() {
    const players = [];
    this.players.forEach((p, i) => {
      const id = p.id;
      let agents = null;
      if (this.isReady()) {
        agents = [];
        this.agents[i].forEach((a) => {
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
        // don't need point, need tile&areaPoint
        point: this.field.getPoints()[i],
        tilePoint: null,
        areaPoint: null,
      };
      players.push(player);
    });

    let board = null;
    if (this.isReady()) board = this.board;

    // いろいろ仕様と違うので実際に使用するときに修正
    return {
      gameId: this.uuid,
      gaming: this.gaming,
      ending: this.ending,
      board: board,
      turn: this.turn,
      totalTurn: this.nturn,
      tiled: this.isReady() ? this.field.field : null,
      players: players,
      log: this.log,
    };
  }
}

class Player {
  constructor(id, spec = "") {
    this.accessToken = util.uuid(); //accessToken;
    this.id = id;
    this.spec = spec;
    this.game = null;
    this.actions = [];
    this.index = -1;
  }

  static restore(data) {
    const player = new Player(data.id, data.spec);
    player.accessToken = data.accessToken;
    player.index = data.index;
    return player;
  }

  setGame(game) {
    this.game = game;
  }

  noticeStart() {
  }

  setActions(actions) {
    this.actions = actions;
    return this.game.turn;
  }

  getActions() {
    return this.actions;
  }

  clearActions() {
    this.actions = [];
  }

  getJSON() {
    return {
      userId: this.id,
      spec: this.spec,
      accessToken: this.accessToken,
      gameId: this.game?.uuid,
      index: this.index,
    };
  }
}

class Kakomimasu {
  constructor() {
    this.games = [];
    this.boards = [];
  }

  appendBoard(board) {
    this.boards.push(board);
  }

  getBoards() {
    return this.boards;
  }

  createGame(...param) {
    //console.log(board);
    const game = new Game(...param);
    this.games.push(game);
    return game;
  }

  getGames() {
    return this.games;
  }

  getFreeGames() {
    return this.games.filter((g) => g.isFree());
  }

  createPlayer(playername, spec = "") {
    if (spec == null) return new Player(playername);
    else return new Player(playername, spec);
  }
}

export { Kakomimasu, Board, Action, Field, Game, Player, Agent };

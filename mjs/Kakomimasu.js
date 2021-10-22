import { flat } from "./util.js";
class Board {
    constructor({ w, h, points, nagent, nturn, nsec, nplayer, name }) {
        Object.defineProperty(this, "w", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "h", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "points", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "nagent", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "nturn", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "nsec", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "nplayer", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
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
    static restore(data) {
        const board = new Board(data);
        return board;
    }
    toLogJSON() {
        return Object.assign({}, this);
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
        Object.defineProperty(this, "board", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "field", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "playerid", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "x", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "y", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "bkx", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "bky", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "lastaction", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
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
        const agent = new Agent(board, field, data.playerid);
        agent.x = data.x;
        agent.y = data.y;
        agent.bkx = data.bkx;
        agent.bky = data.bky;
        agent.lastaction = data.lastaction;
        return agent;
    }
    toLogJSON() {
        return Object.assign(Object.assign({}, this), { board: null, field: null });
    }
    isOnBoard() {
        return this.x !== -1;
    }
    checkOnBoard(x, y) {
        return x >= 0 && x < this.board.w && y >= 0 && y < this.board.h;
    }
    checkDir(x, y) {
        if (this.x === x && this.y === y)
            return false;
        return Math.abs(this.x - x) <= 1 && Math.abs(this.y - y) <= 1;
    }
    check(act) {
        this.lastaction = act;
        const x = act.x;
        const y = act.y;
        const t = act.type;
        if (t === Action.PUT)
            return this.checkPut(x, y);
        if (t === Action.NONE)
            return this.checkNone(x, y);
        if (t === Action.MOVE)
            return this.checkMove(x, y);
        if (t === Action.REMOVE)
            return this.checkRemove(x, y);
        return false;
    }
    checkPut(x, y) {
        if (this.isOnBoard())
            return false;
        if (!this.checkOnBoard(x, y))
            return false;
        return true;
    }
    checkNone(_x, _y) {
        if (!this.isOnBoard())
            return false;
        return true;
    }
    checkMove(x, y) {
        if (!this.isOnBoard())
            return false;
        if (!this.checkOnBoard(x, y))
            return false;
        if (!this.checkDir(x, y))
            return false;
        return true;
    }
    checkRemove(x, y) {
        if (!this.isOnBoard())
            return false;
        if (!this.checkOnBoard(x, y))
            return false;
        if (!this.checkDir(x, y))
            return false;
        //const _n = x + y * this.board.w;
        if (this.field.get(x, y).type !== Field.WALL)
            return false;
        return true;
    }
    isValidAction() {
        if (!this.lastaction)
            return false;
        if (this.lastaction.res !== Action.SUCCESS)
            return false;
        return true;
    }
    putOrMove() {
        //console.log("putormove", this);
        if (this.lastaction == null)
            throw new Error("putOrMove before check");
        if (this.lastaction.res !== Action.SUCCESS)
            return false;
        const act = this.lastaction;
        const x = act.x;
        const y = act.y;
        const t = act.type;
        if (t === Action.PUT)
            return this.put(x, y);
        if (t === Action.MOVE)
            return this.move(x, y);
        return true;
    }
    put(x, y) {
        if (!this.checkPut(x, y))
            return false;
        if (!this.field.setAgent(this.playerid, x, y)) {
            return false; // throw new Error("can't enter the wall");
        }
        this.x = x;
        this.y = y;
        return true;
    }
    none(x, y) {
        if (!this.checkNone(x, y))
            return false;
        return true;
    }
    move(x, y) {
        if (!this.checkMove(x, y))
            return false;
        if (!this.field.setAgent(this.playerid, x, y)) {
            return false; // throw new Error("can't enter the wall");
        }
        this.x = x;
        this.y = y;
        return true;
    }
    remove() {
        if (this.lastaction == null)
            throw new Error("remove before check");
        const { x, y } = this.lastaction;
        if (!this.checkRemove(x, y))
            return false;
        this.field.set(x, y, Field.BASE, null);
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
        if (act && (act.type === Action.MOVE || act.type === Action.PUT) &&
            act.res === Action.SUCCESS) {
            act.res = Action.REVERT;
        }
    }
    getJSON() {
        return { x: this.x, y: this.y };
    }
}
class Action {
    constructor(agentid, type, x, y) {
        Object.defineProperty(this, "agentid", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "type", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "x", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "y", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "res", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
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
    static getMessage(res) {
        return [
            "success",
            "conflict",
            "revert",
            "err: only 1 turn",
            "err: illegal agent",
            "err: illegal action",
        ][res];
    }
}
// Action Type
Object.defineProperty(Action, "PUT", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: 1
});
Object.defineProperty(Action, "NONE", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: 2
});
Object.defineProperty(Action, "MOVE", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: 3
});
Object.defineProperty(Action, "REMOVE", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: 4
});
// Action Res
Object.defineProperty(Action, "SUCCESS", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: 0
});
Object.defineProperty(Action, "CONFLICT", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: 1
});
Object.defineProperty(Action, "REVERT", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: 2
});
Object.defineProperty(Action, "ERR_ONLY_ONE_TURN", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: 3
});
Object.defineProperty(Action, "ERR_ILLEGAL_AGENT", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: 4
});
Object.defineProperty(Action, "ERR_ILLEGAL_ACTION", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: 5
});
Object.defineProperty(Action, "fromJSON", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: (array) => array.map((a) => new Action(a[0], a[1], a[2], a[3]))
});
class Field {
    constructor(board) {
        Object.defineProperty(this, "board", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "field", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.board = board;
        // field
        this.field = [];
        for (let i = 0; i < this.board.w * this.board.h; i++) {
            this.field.push({ type: Field.BASE, player: null });
        }
    }
    toLogJSON() {
        return Object.assign(Object.assign({}, this), { board: null });
    }
    set(x, y, att, playerid) {
        if (playerid !== null && playerid < 0) {
            throw Error("playerid must be 0 or more");
        }
        this.field[x + y * this.board.w] = { type: att, player: playerid };
    }
    get(x, y) {
        return this.field[x + y * this.board.w];
    }
    setAgent(playerid, x, y) {
        const { type: att, player: pid } = this.get(x, y);
        if (att === Field.WALL && pid !== playerid)
            return false;
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
                if (x < 0 || x >= w || y < 0 || y >= h) {
                    field.push({ type: Field.BASE, player: null });
                }
                else
                    field.push(Object.assign({}, this.field[x + y * w]));
            }
        }
        const mask = new Array(field.length);
        for (let i = 0; i < mask.length; i++)
            mask[i] = 1;
        while (mask.reduce((s, c) => s + c)) {
            const area = new Array(field.length);
            for (let pid = 0; pid < this.board.nplayer; pid++) {
                for (let i = 0; i < field.length; i++) {
                    area[i] |= 1 << pid;
                }
                // 外側の囲まれていないところを判定
                const chk = (x, y) => {
                    const n = x + y * (w + 2);
                    if (x < 0 || x >= w + 2 || y < 0 || y >= h + 2)
                        return;
                    else if ((area[n] & (1 << pid)) === 0)
                        return;
                    else if (mask[n] !== 0 && field[n].type === Field.WALL &&
                        field[n].player === pid) {
                        return;
                    }
                    else {
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
                }
                else if ((area[i] & (area[i] - 1)) === 0) { // 2のべき乗かを判定
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
    getPoints() {
        // tilePoint,areaPointの区別が必要→ここでいうWallとBaseかな？
        const points = [];
        for (let i = 0; i < this.board.nplayer; i++) {
            points[i] = { basepoint: 0, wallpoint: 0 };
        }
        this.field.forEach(({ type: att, player: pid }, idx) => {
            if (pid === null)
                return;
            const p = points[pid];
            const pnt = this.board.points[idx];
            if (att === Field.WALL) {
                p.wallpoint += pnt;
            }
            else if (att === Field.BASE) {
                p.basepoint += Math.abs(pnt);
            }
        });
        return points;
    }
    getJSON() {
        return this.field;
    }
}
Object.defineProperty(Field, "BASE", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: 0
});
Object.defineProperty(Field, "WALL", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: 1
});
class Game {
    //public agents: Agent[][];
    constructor(board) {
        Object.defineProperty(this, "board", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "players", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "nturn", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "nsec", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "gaming", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "ending", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "field", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "log", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "turn", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
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
    static restore(data) {
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
    toLogJSON() {
        const data = Object.assign({}, this);
        data.players = data.players.map((p) => p.toLogJSON());
        data.board = data.board.toLogJSON();
        data.field = data.field.toLogJSON();
        return data;
    }
    attachPlayer(player) {
        if (!this.isFree())
            return false;
        if (this.players.indexOf(player) >= 0)
            return false;
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
        }
        else {
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
    checkConflict(actions) {
        //console.log("Actions", actions);
        const chkfield = new Array(this.field.field.length);
        for (let i = 0; i < chkfield.length; i++) {
            chkfield[i] = [];
        }
        const nplayer = actions.length;
        for (let playerid = 0; playerid < nplayer; playerid++) {
            actions[playerid].forEach((a) => {
                if (a.res !== Action.SUCCESS)
                    return false;
                const n = a.x + a.y * this.board.w;
                if (n >= 0 && n < chkfield.length) {
                    chkfield[n].push(a);
                }
                else {
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
        flat(this.players.map((p) => p.agents)).forEach((agent) => {
            if (agent.x === -1)
                return;
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
    putOrMove() {
        flat(this.players.map((p) => p.agents)).forEach((agent) => {
            if (!agent.isValidAction())
                return;
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
            flat(this.players.map((p) => p.agents)).forEach((agent) => {
                const act = agent.lastaction;
                if (agent.isValidAction() && act &&
                    (act.type === Action.MOVE || act.type === Action.PUT)) {
                    const n = act.x + act.y * this.board.w;
                    //console.log("act", n);
                    chkfield[n].push(agent);
                }
                else {
                    if (agent.x === -1)
                        return;
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
        const agents = flat(this.players.map((p) => p.agents));
        agents.forEach((agent) => {
            if (agent.x === -1)
                return;
            if (!agent.isValidAction())
                return;
            const act = agent.lastaction;
            if (!act)
                return;
            if (act.type !== Action.REMOVE)
                return;
            if (agents.find((a) => a.x === act.x && a.y === act.y)) {
                act.res = Action.REVERT;
            }
            else {
                agent.remove();
            }
        });
    }
    revertNotOwnerWall() {
        const agents = flat(this.players.map((p) => p.agents));
        const fld = this.field.field;
        const w = this.board.w;
        agents.forEach((agent) => {
            if (agent.x === -1)
                return;
            if (!agent.isValidAction())
                return;
            const act = agent.lastaction;
            if (!act)
                return;
            if (act.type !== Action.MOVE && act.type !== Action.PUT)
                return;
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
    commit() {
        const agents = flat(this.players.map((p) => p.agents));
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
            agents: this.players.map((p) => p.agents.map((a) => a.getJSON())),
            points: this.field.getPoints(),
            log: this.log,
        };
    }
    toJSON() {
        const players = [];
        this.players.forEach((p, i) => {
            const id = p.id;
            let agents = [];
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
        if (this.isReady())
            board = this.board;
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
class Player {
    constructor(id, spec = "") {
        Object.defineProperty(this, "id", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "spec", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "game", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "actions", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "index", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "agents", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.id = id;
        this.spec = spec;
        this.game = null;
        this.actions = [];
        this.index = -1;
        this.agents = [];
    }
    static restore(data, game) {
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
    toLogJSON() {
        const p = Object.assign({}, this);
        p.game = null;
        p.agents = p.agents.map((a) => a.toLogJSON());
        return p;
    }
    setGame(game) {
        this.game = game;
        for (let j = 0; j < game.board.nagent; j++) {
            this.agents.push(new Agent(game.board, game.field, this.index));
        }
    }
    noticeStart() {
    }
    setActions(actions) {
        if (this.game === null)
            throw new Error("game is null");
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
            index: this.index,
        };
    }
}
class Kakomimasu {
    constructor() {
        Object.defineProperty(this, "games", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "boards", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.games = [];
        this.boards = [];
    }
    appendBoard(board) {
        this.boards.push(board);
    }
    getBoards() {
        return this.boards;
    }
    /**
     * @deprecated use addGame
     */
    createGame(...param) {
        //console.log(board);
        const game = new Game(...param);
        this.games.push(game);
        return game;
    }
    addGame(game) {
        this.games.push(game);
        return game;
    }
    getGames() {
        return this.games;
    }
    getFreeGames() {
        return this.games.filter((g) => g.isFree());
    }
    /**
     * @deprecated use Player class
     */
    createPlayer(playername, spec = "") {
        if (spec == null)
            return new Player(playername);
        else
            return new Player(playername, spec);
    }
}
export { Action, Agent, Board, Field, Game, Kakomimasu, Player };

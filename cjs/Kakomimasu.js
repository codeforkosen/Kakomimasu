"use strict";
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var _Agent_instances, _Agent_lastaction, _Agent_isOnBoard, _Agent_checkOnBoard, _Agent_checkDir, _Agent_checkPut, _Agent_checkMove, _Agent_checkRemove, _Agent_put, _Agent_move, _Game_instances, _Game_checkActions, _Game_checkConflict, _Game_putOrMove, _Game_revertOverlap, _Game_removeOrNot, _Game_revertNotOwnerWall, _Game_commit;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Player = exports.Game = exports.Field = exports.Agent = exports.Action = void 0;
const util_js_1 = require("./util.js");
class Agent {
    constructor(field, playeridx) {
        _Agent_instances.add(this);
        Object.defineProperty(this, "field", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "playerIdx", {
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
        _Agent_lastaction.set(this, void 0);
        this.field = field;
        this.playerIdx = playeridx;
        this.x = -1;
        this.y = -1;
        this.bkx = -1;
        this.bky = -1;
        __classPrivateFieldSet(this, _Agent_lastaction, null, "f");
    }
    static fromJSON(data, playerIdx, field) {
        const agent = new Agent(field, playerIdx);
        agent.x = data.x;
        agent.y = data.y;
        return agent;
    }
    toJSON() {
        return { x: this.x, y: this.y };
    }
    check(act) {
        __classPrivateFieldSet(this, _Agent_lastaction, act, "f");
        this.bkx = this.x;
        this.bky = this.y;
        const x = act.x;
        const y = act.y;
        const t = act.type;
        if (t === Action.PUT)
            return __classPrivateFieldGet(this, _Agent_instances, "m", _Agent_checkPut).call(this, x, y);
        else if (t === Action.MOVE)
            return __classPrivateFieldGet(this, _Agent_instances, "m", _Agent_checkMove).call(this, x, y);
        else if (t === Action.REMOVE)
            return __classPrivateFieldGet(this, _Agent_instances, "m", _Agent_checkRemove).call(this, x, y);
        else
            return false;
    }
    isValidAction() {
        if (!__classPrivateFieldGet(this, _Agent_lastaction, "f"))
            return;
        if (__classPrivateFieldGet(this, _Agent_lastaction, "f").res !== Action.SUCCESS)
            return;
        return __classPrivateFieldGet(this, _Agent_lastaction, "f");
    }
    putOrMove() {
        //console.log("putormove", this);
        if (__classPrivateFieldGet(this, _Agent_lastaction, "f") == null)
            throw new Error("putOrMove before check");
        if (__classPrivateFieldGet(this, _Agent_lastaction, "f").res !== Action.SUCCESS)
            return false;
        const act = __classPrivateFieldGet(this, _Agent_lastaction, "f");
        const x = act.x;
        const y = act.y;
        const t = act.type;
        if (t === Action.PUT)
            return __classPrivateFieldGet(this, _Agent_instances, "m", _Agent_put).call(this, x, y);
        if (t === Action.MOVE)
            return __classPrivateFieldGet(this, _Agent_instances, "m", _Agent_move).call(this, x, y);
        return true;
    }
    remove() {
        if (__classPrivateFieldGet(this, _Agent_lastaction, "f") == null)
            throw new Error("remove before check");
        const { x, y } = __classPrivateFieldGet(this, _Agent_lastaction, "f");
        if (!__classPrivateFieldGet(this, _Agent_instances, "m", _Agent_checkRemove).call(this, x, y))
            return false;
        this.field.set(x, y, Field.AREA, null);
        return true;
    }
    commit() {
        __classPrivateFieldSet(this, _Agent_lastaction, null, "f");
    }
    revert() {
        const act = __classPrivateFieldGet(this, _Agent_lastaction, "f");
        if (act && (act.type === Action.MOVE || act.type === Action.PUT) &&
            act.res === Action.SUCCESS) {
            act.res = Action.REVERT;
            this.x = this.bkx;
            this.y = this.bky;
        }
    }
}
exports.Agent = Agent;
_Agent_lastaction = new WeakMap(), _Agent_instances = new WeakSet(), _Agent_isOnBoard = function _Agent_isOnBoard() {
    return this.x !== -1;
}, _Agent_checkOnBoard = function _Agent_checkOnBoard(x, y) {
    return x >= 0 && x < this.field.width && y >= 0 &&
        y < this.field.height;
}, _Agent_checkDir = function _Agent_checkDir(x, y) {
    if (this.x === x && this.y === y)
        return false;
    return Math.abs(this.x - x) <= 1 && Math.abs(this.y - y) <= 1;
}, _Agent_checkPut = function _Agent_checkPut(x, y) {
    if (__classPrivateFieldGet(this, _Agent_instances, "m", _Agent_isOnBoard).call(this))
        return false;
    if (!__classPrivateFieldGet(this, _Agent_instances, "m", _Agent_checkOnBoard).call(this, x, y))
        return false;
    return true;
}, _Agent_checkMove = function _Agent_checkMove(x, y) {
    if (!__classPrivateFieldGet(this, _Agent_instances, "m", _Agent_isOnBoard).call(this))
        return false;
    if (!__classPrivateFieldGet(this, _Agent_instances, "m", _Agent_checkOnBoard).call(this, x, y))
        return false;
    if (!__classPrivateFieldGet(this, _Agent_instances, "m", _Agent_checkDir).call(this, x, y))
        return false;
    return true;
}, _Agent_checkRemove = function _Agent_checkRemove(x, y) {
    if (!__classPrivateFieldGet(this, _Agent_instances, "m", _Agent_isOnBoard).call(this))
        return false;
    if (!__classPrivateFieldGet(this, _Agent_instances, "m", _Agent_checkOnBoard).call(this, x, y))
        return false;
    if (!__classPrivateFieldGet(this, _Agent_instances, "m", _Agent_checkDir).call(this, x, y))
        return false;
    if (this.field.get(x, y).type !== Field.WALL)
        return false;
    return true;
}, _Agent_put = function _Agent_put(x, y) {
    if (!__classPrivateFieldGet(this, _Agent_instances, "m", _Agent_checkPut).call(this, x, y))
        return false;
    if (!this.field.setAgent(this.playerIdx, x, y)) {
        return false; // throw new Error("can't enter the wall");
    }
    this.x = x;
    this.y = y;
    return true;
}, _Agent_move = function _Agent_move(x, y) {
    if (!__classPrivateFieldGet(this, _Agent_instances, "m", _Agent_checkMove).call(this, x, y))
        return false;
    if (!this.field.setAgent(this.playerIdx, x, y)) {
        return false; // throw new Error("can't enter the wall");
    }
    this.x = x;
    this.y = y;
    return true;
};
class Action {
    constructor(agentid, type, x, y) {
        Object.defineProperty(this, "agentId", {
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
        this.agentId = agentid;
        this.type = type;
        this.x = x;
        this.y = y;
        this.res = Action.SUCCESS;
    }
    static fromJSON(data) {
        const action = new Action(data.agentId, data.type, data.x, data.y);
        action.res = data.res;
        return action;
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
exports.Action = Action;
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
Object.defineProperty(Action, "fromArray", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: (array) => array.map((a) => new Action(a[0], a[1], a[2], a[3]))
});
class Field {
    constructor({ width, height, points, nAgent = 4, nPlayer = 2 }) {
        Object.defineProperty(this, "width", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "height", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "nAgent", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "nPlayer", {
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
        Object.defineProperty(this, "tiles", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
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
    static fromJSON(data) {
        const { tiles } = data, init = __rest(data, ["tiles"]);
        const field = new Field(init);
        field.tiles = tiles;
        return field;
    }
    set(x, y, att, playerid) {
        if (playerid !== null && playerid < 0) {
            throw Error("playerid must be 0 or more");
        }
        this.tiles[x + y * this.width] = { type: att, player: playerid };
    }
    get(x, y) {
        return this.tiles[x + y * this.width];
    }
    setAgent(playerid, x, y) {
        const { type: att, player: pid } = this.get(x, y);
        if (att === Field.WALL && pid !== playerid)
            return false;
        this.set(x, y, Field.WALL, playerid);
        return true;
    }
    fillArea() {
        // プレイヤーごとに入れ子関係なく囲まれている所にフラグを立て、まとめる。
        // (bitごと 例:010だったら、1番目のプレイヤーの領地or城壁であるという意味)
        // 各マスの立っているbitが一つだけだったらそのプレイヤーの領地or城壁で確定。
        // 2つ以上bitが立っていたら入れ子になっているので、その部分だけmaskをかけ、もう一度最初からやり直す。
        // （whileするたびに入れ子が一個ずつ解消されていくイメージ）
        // 説明難しい…
        const w = this.width;
        const h = this.height;
        const field = [];
        // 外側に空白のマスを作る
        for (let y = -1; y < h + 1; y++) {
            for (let x = -1; x < w + 1; x++) {
                if (x < 0 || x >= w || y < 0 || y >= h) {
                    field.push({ type: Field.AREA, player: null });
                }
                else
                    field.push(Object.assign({}, this.tiles[x + y * w]));
            }
        }
        const mask = new Array(field.length);
        for (let i = 0; i < mask.length; i++)
            mask[i] = 1;
        while (mask.reduce((s, c) => s + c)) {
            const area = new Array(field.length);
            for (let pid = 0; pid < this.nPlayer; pid++) {
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
                if (this.tiles[n].type !== Field.WALL) {
                    this.tiles[n].player = field[nexp].player;
                }
            }
        }
    }
    getPoints() {
        const points = [];
        for (let i = 0; i < this.nPlayer; i++) {
            points[i] = { areaPoint: 0, wallPoint: 0 };
        }
        this.tiles.forEach(({ type: att, player: pid }, idx) => {
            if (pid === null)
                return;
            const p = points[pid];
            const pnt = this.points[idx];
            if (att === Field.WALL) {
                p.wallPoint += pnt;
            }
            else if (att === Field.AREA) {
                p.areaPoint += Math.abs(pnt);
            }
        });
        return points;
    }
}
exports.Field = Field;
Object.defineProperty(Field, "AREA", {
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
    constructor(gameInit) {
        _Game_instances.add(this);
        Object.defineProperty(this, "totalTurn", {
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
        const { totalTurn = 30 } = gameInit, fieldInit = __rest(gameInit, ["totalTurn"]);
        this.totalTurn = totalTurn;
        this.players = [];
        this.field = new Field(fieldInit);
        this.log = [];
        this.turn = 0;
    }
    static fromJSON(data) {
        const board = {
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
    attachPlayer(player) {
        if (!this.isFree())
            return false;
        if (this.players.indexOf(player) >= 0)
            return false;
        player.index = this.players.push(player) - 1;
        player.setGame(this);
        return true;
    }
    // status : free -> ready -> gaming -> ended
    getStatus() {
        if (this.turn === 0) {
            if (this.players.length < this.field.nPlayer)
                return "free";
            else
                return "ready";
        }
        else if (this.log.length !== this.totalTurn) {
            return "gaming";
        }
        else {
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
    start() {
        this.turn = 1;
    }
    nextTurn() {
        const actions = [];
        this.players.forEach((p, idx) => actions[idx] = p.getActions());
        // console.log("actions", actions);
        __classPrivateFieldGet(this, _Game_instances, "m", _Game_checkActions).call(this, actions); // 同じエージェントの2回移動、画面外など無効な操作をチェック
        __classPrivateFieldGet(this, _Game_instances, "m", _Game_revertNotOwnerWall).call(this); // PUT, MOVE先が敵陣壁ではないか？チェックし無効化
        __classPrivateFieldGet(this, _Game_instances, "m", _Game_checkConflict).call(this, actions); // 同じマスを差しているものはすべて無効 // 壁remove & move は、removeが有効
        __classPrivateFieldGet(this, _Game_instances, "m", _Game_revertOverlap).call(this); // 仮に配置または動かし、かぶったところをrevert
        __classPrivateFieldGet(this, _Game_instances, "m", _Game_putOrMove).call(this); // 配置または動かし、フィールド更新
        __classPrivateFieldGet(this, _Game_instances, "m", _Game_removeOrNot).call(this); // AgentがいるところをREMOVEしているものはrevert
        __classPrivateFieldGet(this, _Game_instances, "m", _Game_commit).call(this);
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
        }
        else {
            return false;
        }
    }
}
exports.Game = Game;
_Game_instances = new WeakSet(), _Game_checkActions = function _Game_checkActions(actions) {
    const nplayer = actions.length;
    // 範囲外と、かぶりチェック
    for (let playerid = 0; playerid < nplayer; playerid++) {
        const done = {};
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
}, _Game_checkConflict = function _Game_checkConflict(actions) {
    //console.log("Actions", actions);
    const chkfield = new Array(this.field.tiles.length);
    for (let i = 0; i < chkfield.length; i++) {
        chkfield[i] = [];
    }
    const nplayer = actions.length;
    for (let playerid = 0; playerid < nplayer; playerid++) {
        actions[playerid].forEach((a) => {
            if (a.res !== Action.SUCCESS)
                return false;
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
}, _Game_putOrMove = function _Game_putOrMove() {
    (0, util_js_1.flat)(this.players.map((p) => p.agents)).forEach((agent) => {
        if (!agent.isValidAction())
            return;
        if (!agent.putOrMove()) {
            // throw new Error("illegal action!")
            // console.log(`throw new Error("illegal action!")`);
            return;
        }
    });
}, _Game_revertOverlap = function _Game_revertOverlap() {
    let reverts = false;
    const chkfield = new Array(this.field.tiles.length);
    do {
        for (let i = 0; i < chkfield.length; i++) {
            chkfield[i] = [];
        }
        (0, util_js_1.flat)(this.players.map((p) => p.agents)).forEach((agent) => {
            const act = agent.isValidAction();
            if (act &&
                (act.type === Action.MOVE || act.type === Action.PUT)) {
                const n = act.x + act.y * this.field.width;
                //console.log("act", n);
                chkfield[n].push(agent);
            }
            else {
                if (agent.x === -1)
                    return;
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
}, _Game_removeOrNot = function _Game_removeOrNot() {
    const agents = (0, util_js_1.flat)(this.players.map((p) => p.agents));
    agents.forEach((agent) => {
        if (agent.x === -1)
            return;
        const act = agent.isValidAction();
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
}, _Game_revertNotOwnerWall = function _Game_revertNotOwnerWall() {
    const agents = (0, util_js_1.flat)(this.players.map((p) => p.agents));
    const fld = this.field.tiles;
    const w = this.field.width;
    agents.forEach((agent) => {
        if (agent.x === -1)
            return;
        const act = agent.isValidAction();
        if (!act)
            return;
        if (act.type !== Action.MOVE && act.type !== Action.PUT)
            return;
        // only PUT & MOVE
        const n = act.x + act.y * w;
        const f = fld[n];
        const iswall = f.type === Field.WALL;
        const owner = f.player;
        if (iswall && owner !== agent.playerIdx && owner !== -1) {
            agent.revert();
        }
    });
}, _Game_commit = function _Game_commit() {
    const agents = (0, util_js_1.flat)(this.players.map((p) => p.agents));
    agents.forEach((agent) => {
        // if (agent.x === -1) return;
        // if (!agent.isValidAction()) return;
        agent.commit();
    });
};
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
    static fromJSON(data, game) {
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
    toJSON() {
        return {
            id: this.id,
            spec: this.spec,
            index: this.index,
            actions: this.actions,
            agents: this.agents,
        };
    }
    setGame(game) {
        this.game = game;
        for (let j = 0; j < game.field.nAgent; j++) {
            this.agents.push(new Agent(game.field, this.index));
        }
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
}
exports.Player = Player;

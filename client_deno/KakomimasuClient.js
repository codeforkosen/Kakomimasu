import {
  Action,
  sleep,
  userRegist,
  userShow,
  match,
  getGameInfo,
  setAction,
  diffTime,
  setHost,
} from "./client_util.js";
import dotenv from "https://taisukef.github.io/denolib/dotenv.js";

class KakomimasuClient {
  constructor(id, name, spec, password) {
    dotenv.config();
    this.id = id || Deno.env.get("id");
    this.password = password || Deno.env.get("password");
    this.name = name || Deno.env.get("name");
    this.spec = spec || Deno.env.get("spec");
    console.log(this.id, this.password, this.name, this.spec);
    this.setServerHost(Deno.env.get("host"));
  }
  setServerHost(host) {
    setHost(host);
  }
  async waitMatching() { // GameInfo
    // ユーザ取得（ユーザがなかったら新規登録）
    let user = await userShow(this.id);
    if (user.hasOwnProperty("error")) {
      user = await userRegist(this.name, this.id, this.password);
    }
    
    // プレイヤー登録
    const resMatch = await match({ id: user.id, password: this.password, spec: this.spec });
    this.token = resMatch.accessToken;
    this.roomid = resMatch.gameId;
    this.pno = resMatch.index;
    console.log("playerid", resMatch, this.pno);
    
    do {
      this.gameInfo = await getGameInfo(this.roomid);
      await sleep(100);
    } while (this.gameInfo.startedAtUnixTime === null);
    
    console.log(this.gameInfo);
    console.log(
      "ゲーム開始時間：",
      new Date(this.gameInfo.startedAtUnixTime * 1000).toLocaleString("ja-JP"),
    );
    return this.gameInfo;
  }

  getPlayerNumber() {
    return this.pno;
  }

  getAgentCount() {
    return this.gameInfo.players[this.pno].agents.length;
  }

  getPoints() {
    const w = this.gameInfo.board.width;
    const h = this.gameInfo.board.height;
    const p = this.gameInfo.board.points;
    const res = [];
    for (let i = 0; i < h; i++) {
      const row = [];
      for (let j = 0; j < w; j++) {
        row.push(p[i * w + j]);
      }
      res.push(row);
    }
    return res;
  }

  _makeField() {
    const w = this.gameInfo.board.width;
    const h = this.gameInfo.board.height;
    const p = this.gameInfo.board.points;
    const res = [];
    const tiled = this.gameInfo.tiled;
    for (let i = 0; i < h; i++) {
      const row = [];
      for (let j = 0; j < w; j++) {
        const idx = i * w + j;
        const point = p[idx];
        const type = tiled[idx][0];
        const pid = tiled[idx][1];
        row.push({ type, pid, point, x: j, y: i });
      }
      res.push(row);
    }
    this.field = res;
  }

  _updateField() {
    const w = this.gameInfo.board.width;
    const h = this.gameInfo.board.height;
    const tiled = this.gameInfo.tiled;
    for (let i = 0; i < h; i++) {
      for (let j = 0; j < w; j++) {
        const f = this.field[i][j];
        const idx = i * w + j;
        f.type = tiled[idx][0];
        f.pid = tiled[idx][1];
      }
    }
  }

  getField() { // after start
    return this.field;
  }

  async waitStart() { // GameInfo
    await sleep(diffTime(this.gameInfo.startedAtUnixTime));
    this.gameInfo = await getGameInfo(this.roomid);
    console.log(this.gameInfo);
    this.log = [this.gameInfo];
    this.turn = 1;
    this.totalTurn = this.gameInfo.totalTurn;
    console.log("totalTurn", this.totalTurn);
    this._makeField();
    return this.gameInfo;
  }

  setActions(actions) { // void
    setAction(this.roomid, this.token, actions);
  }

  async waitNextTurn() { // GameInfo? (null if end)
    if (this.turn < this.totalTurn) {
      const bknext = this.gameInfo.nextTurnUnixTime;
      await sleep(diffTime(this.gameInfo.nextTurnUnixTime));
  
      for (;;) {
        this.gameInfo = await getGameInfo(this.roomid);
        if (this.gameInfo.nextTurnUnixTime !== bknext) {
          break;
        }
        await sleep(100);
      }
    } else {
      this.saveLog();
      return null;
    }
    this.log.push(this.gameInfo);
    this.turn++;
    console.log("turn", this.turn);
    this._updateField();
    return this.gameInfo;
  }

  saveLog() {
    try {
      Deno.mkdirSync("log");
    } catch (e) {}
    const fname = `log/${this.gameInfo.gameId}-player${this.pno}.log`;
    Deno.writeTextFileSync(fname, JSON.stringify(this.log, null, 2));
  }
}

// 8方向、上から時計回り
const DIR = [
  [0, -1],
  [1, -1],
  [1, 0],
  [1, 1],
  [0, 1],
  [-1, 1],
  [-1, 0],
  [-1, -1],
];

export { KakomimasuClient, Action, DIR };

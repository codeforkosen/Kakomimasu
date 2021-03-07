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
  cl,
  args
} from "./client_util.js";
import dotenv from "https://taisukef.github.io/denolib/dotenv.js";

class KakomimasuClient {
  constructor(id, name, spec, password) {
    dotenv.config();
    this.id = id || Deno.env.get("id");
    this.password = password || Deno.env.get("password");
    this.name = name || Deno.env.get("name");
    this.spec = spec || Deno.env.get("spec");
    cl(this.id, this.password, this.name, this.spec);
    if (args.local) this.setServerHost("http://localhost:8880");
    else this.setServerHost(Deno.env.get("host"));
  }
  setServerHost(host) {
    if (host) {
      if (host.endsWith("/")) {
        host = host.substring(0, host.length - 1);
      }
      setHost(`${host}/api`);
    }
  }
  readGameId() {
    cl("入室するゲームIDを入力してください。入力しないとランダムマッチを行います。");
    const stdinArray = new Uint8Array(37);
    Deno.stdin.readSync(stdinArray);
    const gameId = new TextDecoder().decode(stdinArray).match(/\S*/)[0];
    if (gameId !== "") {
      this.gameId = gameId;
    }
  }
  async waitMatching() { // GameInfo
    // ユーザ取得（ユーザがなかったら新規登録）
    let user = await userShow(this.id);
    if (user.hasOwnProperty("error")) {
      user = await userRegist(this.name, this.id, this.password);
    }

    // プレイヤー登録
    let matchParam = { id: user.id, password: this.password, spec: this.spec };
    if (args.useAi) {
      matchParam.useAi = true;
      matchParam.aiOption = {
        aiName: args.useAi,
        boardName: args.aiBoard,
      }
    } else if (args.gameId) {
      matchParam.gameId = args.gameId;
    }
    cl(matchParam);
    const resMatch = await match(matchParam);
    this.token = resMatch.accessToken;
    this.gameId = resMatch.gameId;
    this.pno = resMatch.index;
    cl("playerid", resMatch, this.pno);

    do {
      this.gameInfo = await getGameInfo(this.gameId);
      await sleep(100);
    } while (this.gameInfo.startedAtUnixTime === null);

    cl(this.gameInfo);
    cl(
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
    this.gameInfo = await getGameInfo(this.gameId);
    cl(this.gameInfo);
    this.log = [this.gameInfo];
    this.turn = 1;
    this.totalTurn = this.gameInfo.totalTurn;
    cl("totalTurn", this.totalTurn);
    this._makeField();
    return this.gameInfo;
  }

  setActions(actions) { // void
    setAction(this.gameId, this.token, actions);
  }

  async waitNextTurn() { // GameInfo? (null if end)
    if (this.turn < this.totalTurn) {
      const bknext = this.gameInfo.nextTurnUnixTime;
      cl("nextTurnUnixTime", bknext);
      await sleep(diffTime(bknext));

      for (; ;) {
        this.gameInfo = await getGameInfo(this.gameId);
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
    cl("turn", this.turn);
    this._updateField();
    return this.gameInfo;
  }

  saveLog() {
    if (!args.nolog) {
      try {
        Deno.mkdirSync("log");
      } catch (e) { }
      const fname = `log/${this.gameInfo.gameId}-player${this.pno}.log`;
      Deno.writeTextFileSync(fname, JSON.stringify(this.log, null, 2));
    }
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

export { KakomimasuClient, Action, DIR, cl, args };

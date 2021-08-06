import { Action, args, cl, diffTime, sleep } from "./client_util.js";

import ApiClient from "../client_js/api_client.js";
import dotenv from "https://taisukef.github.io/denolib/dotenv.js";

class KakomimasuClient {
  apiClient = new ApiClient("https://practice.kakomimasu.website");

  constructor(id, name, spec, password) {
    dotenv.config();
    this.id = id || Deno.env.get("id");
    this.password = password || Deno.env.get("password");
    this.name = name || Deno.env.get("name");
    this.spec = spec || Deno.env.get("spec");
    if (!args.aiOnly) this.bearerToken = Deno.env.get("bearerToken");
    console.log(args.local);
    if (args.local) this.setServerHost("http://localhost:8880");
    else this.setServerHost(Deno.env.get("host"));
  }
  setServerHost(host) {
    if (host) {
      if (host.endsWith("/")) {
        host = host.substring(0, host.length - 1);
      }
      //setHost(`${host}/api`);
      this.apiClient = new ApiClient(host);
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
    let user;
    if (!this.bearerToken) {
      // ユーザ取得（ユーザがなかったら新規登録）
      const userRes = await this.apiClient.usersShow(
        this.id,
        `Basic ${this.id}:${this.password}`,
      );
      if (userRes.success) user = userRes.data;
      else {
        const res = await this.apiClient.usersRegist({
          screenName: this.name,
          name: this.id,
          password: this.password,
        });
        if (res.success) user = res.data;
        else throw Error("User Regist Error");
      }
      this.bearerToken = user.bearerToken;
      cl(user);
    }

    // プレイヤー登録
    const matchParam = {
      id: user?.id,
      password: this.password,
      spec: this.spec,
    };
    if (args.useAi) {
      matchParam.useAi = true;
      matchParam.aiOption = {
        aiName: args.useAi,
        boardName: args.aiBoard,
      };
    } else if (args.gameId) {
      matchParam.gameId = args.gameId;
    }
    //cl(matchParam);
    const MatchRes = await this.apiClient.match(
      matchParam,
      `Bearer ${this.bearerToken}`,
    );
    //cl(MatchRes);
    if (MatchRes.success) {
      const matchGame = MatchRes.data;
      this.gameId = matchGame.gameId;
      this.pno = matchGame.index;
      cl("playerid", matchGame, this.pno);
    } else {
      console.log(MatchRes.data);
      throw Error("Match Error");
    }
    do {
      const gameRes = await this.apiClient.getMatch(this.gameId);
      if (gameRes.success) this.gameInfo = gameRes.data;
      else throw Error("Get Match Error");
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
    const res = await this.apiClient.getMatch(this.gameId);
    if (res.success) this.gameInfo = res.data;
    else throw Error("Get Match Error");
    cl(this.gameInfo);
    this.log = [this.gameInfo];
    cl("totalTurn", this.gameInfo.board.nTurn);
    this._makeField();
    return this.gameInfo;
  }

  async setActions(actions) { // void
    const res = await this.apiClient.setAction(
      this.gameId,
      { actions, index: this.pno },
      "Bearer " + this.bearerToken,
    );
    console.log("setActions", res);
    if (res.success === false) throw Error("Set Action Error");
  }

  async waitNextTurn() { // GameInfo? (null if end)
    if (this.gameInfo.nextTurnUnixTime) {
      const bknext = this.gameInfo.nextTurnUnixTime;
      cl("nextTurnUnixTime", bknext);
      await sleep(diffTime(bknext));

      for (;;) {
        const res = await this.apiClient.getMatch(this.gameId);
        if (res.success) this.gameInfo = res.data;
        else throw Error("Get Match Error");
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
    cl("turn", this.gameInfo.turn);
    this._updateField();
    return this.gameInfo;
  }

  saveLog() {
    if (!args.nolog) {
      try {
        Deno.mkdirSync("log");
      } catch (_e) {
        //
      }
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

export { Action, args, cl, DIR, KakomimasuClient };

import util from "../../util.js";

export * from "../../Kakomimasu.js";

import { Agent, Board, Game, Kakomimasu, Player } from "../../Kakomimasu.js";
import { LogFileOp } from "./file_opration.ts";

import { accounts } from "../user.ts";

export class ExpGame extends Game {
  public name?: string;
  public startedAtUnixTime: number | null;
  public nextTurnUnixTime: number | null;
  public changeFuncs: (((id: string) => void) | (() => void))[];
  public reservedUsers: string[];
  public type: "normal" | "self";

  constructor(board: Board, name?: string) {
    super(board);
    this.name = name;
    this.startedAtUnixTime = null;
    this.nextTurnUnixTime = null;
    this.changeFuncs = [];
    this.reservedUsers = [];
    this.type = "normal";
  }

  static restore(data: ExpGame) {
    const board = Board.restore(data.board);
    const game = new ExpGame(board, data.name);
    game.uuid = data.uuid;
    game.players = data.players.map((p) => Player.restore(p));
    game.gaming = data.gaming;
    game.ending = data.ending;
    game.field.field = data.field.field;
    game.log = data.log;
    game.turn = data.turn;
    game.agents = data.agents.map((agents) =>
      agents.map((agent) => Agent.restore(agent, game.board, game.field))
    );
    game.startedAtUnixTime = data.startedAtUnixTime;
    game.nextTurnUnixTime = data.nextTurnUnixTime;
    game.reservedUsers = data.reservedUsers;
    game.type = data.type || "normal";
    return game;
  }

  attachPlayer(player: Player) {
    if (this.reservedUsers.length > 0) {
      const isReservedUser = this.reservedUsers.some((e) => e === player.id);
      if (!isReservedUser) throw Error("Not allowed user");
    }

    if (super.attachPlayer(player) === false) return false;
    if (this.isReady()) {
      this.startedAtUnixTime = Math.floor(new Date().getTime() / 1000) + 5;
      this.nextTurnUnixTime = this.startedAtUnixTime + this.nsec;
      this.updateStatus();
    }
    accounts.addGame(player.id, this.uuid);
    this.wsSend();
    return true;
  }

  nextTurn() {
    if (this.turn < this.nturn) {
      this.nextTurnUnixTime = util.nowUnixTime() + this.nsec;
    } else if (this.turn == this.nturn) {
      this.nextTurnUnixTime = null;
    }
    const ret = super.nextTurn();
    return ret;
  }

  addReservedUser(userId: string) {
    if (this.reservedUsers.some((e) => e === userId)) {
      return false;
    } else {
      this.reservedUsers.push(userId);
      return true;
    }
  }

  updateStatus = () => {
    try {
      if (this.isGaming()) { // ゲーム進行中
        if (!this.nextTurnUnixTime) throw Error("nextTurnUnixTime is null");
        const diff = (this.nextTurnUnixTime * 1000) - new Date().getTime();
        if (diff <= 0) {
          this.nextTurn();
          this.wsSend();
          this.updateStatus();
        } else {
          setTimeout(() => this.updateStatus(), diff);
        }
      } else if (this.ending) { // ゲーム終了後
        LogFileOp.save(this);

        console.log("turn", this.turn);
        this.wsSend();
      } // ゲーム開始前
      else {
        if (!this.startedAtUnixTime) throw Error("startedAtUnixTime is null");
        const diff = (this.startedAtUnixTime * 1000) - new Date().getTime();
        if (diff <= 0) {
          this.start();
          this.wsSend();
          this.updateStatus();
        } else {
          setTimeout(() => this.updateStatus(), diff);
        }
      }
    } catch (e) {
      console.log(e);
    }
  };

  toJSON() {
    const ret = super.toJSON();
    return {
      ...ret,
      gameName: this.name,
      startedAtUnixTime: this.startedAtUnixTime,
      nextTurnUnixTime: this.nextTurnUnixTime,
      reservedUsers: this.reservedUsers,
      type: this.type,
    };
  }

  toLogJSON() {
    const data = { ...this, ...super.toLogJSON() };
    data.changeFuncs = [];
    return data;
  }

  wsSend() {
    //console.log("expKakomimasu", this.uuid);
    this.changeFuncs.forEach((func) => func(this.uuid));
  }
}

class ExpKakomimasu extends Kakomimasu<ExpGame> {
  createGame(...param: ConstructorParameters<typeof ExpGame>) {
    const game = new ExpGame(...param);
    this.games.push(game);
    return game;
  }

  getFreeGames() {
    const games = super.getFreeGames();
    return games.filter((game) => game.type === "normal");
  }
}

export { ExpKakomimasu };

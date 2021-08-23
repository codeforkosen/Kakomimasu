import util from "../../util.js";
import { randomUUID } from "../apiserver_util.ts";

import {
  Action,
  Agent,
  Board,
  Game,
  Kakomimasu,
  Player as RawPlayer,
} from "../../Kakomimasu.js";
import { LogFileOp } from "./file_opration.ts";

import { accounts } from "../user.ts";

import { Game as GameType } from "../types.ts";

class Player extends RawPlayer<ExpGame> {
  getJSON() {
    return {
      ...super.getJSON(),
      gameId: this.game?.uuid,
    };
  }
}

class ExpGame extends Game {
  public uuid: string;
  public name?: string;
  public startedAtUnixTime: number | null;
  public changeFuncs: (((id: string) => void) | (() => void))[];
  public reservedUsers: string[];
  public type: "normal" | "self";

  constructor(board: Board, name?: string) {
    super(board);
    this.uuid = randomUUID();
    this.name = name;
    this.startedAtUnixTime = null;
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
    this.updateStatus();
    accounts.addGame(player.id, this.uuid);
    return true;
  }

  addReservedUser(userId: string) {
    if (this.reservedUsers.some((e) => e === userId)) {
      return false;
    } else {
      this.reservedUsers.push(userId);
      return true;
    }
  }

  updateStatus() {
    try {
      if (this.isGaming()) { // ゲーム進行中
        const nextTurnUnixTime = this.getNextTurnUnixTime();
        if (!nextTurnUnixTime) throw Error("nextTurnUnixTime is null");
        const diff = (nextTurnUnixTime * 1000) - new Date().getTime();
        setTimeout(() => {
          this.nextTurn();
          this.updateStatus();
        }, diff);
      } else if (this.ending) { // ゲーム終了後
        LogFileOp.save(this);

        //console.log("turn", this.turn);
      } // ゲーム開始前
      else if (this.isReady()) {
        this.startedAtUnixTime = util.nowUnixTime() + 5;
        const diff = (this.startedAtUnixTime * 1000) - new Date().getTime();
        setTimeout(() => {
          this.start();
          this.updateStatus();
        }, diff);
      }
      this.wsSend();
    } catch (e) {
      console.error(e);
    }
  }

  getNextTurnUnixTime() {
    if (this.startedAtUnixTime === null || this.ending) {
      return null;
    } else {
      return this.startedAtUnixTime + this.nsec * this.turn;
    }
  }

  toJSON(): GameType {
    const ret = super.toJSON();
    return {
      ...ret,
      gameId: this.uuid,
      gameName: this.name,
      startedAtUnixTime: this.startedAtUnixTime,
      nextTurnUnixTime: this.getNextTurnUnixTime(),
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

class ExpKakomimasu extends Kakomimasu<ExpGame, Player> {
  createGame(...param: ConstructorParameters<typeof ExpGame>) {
    const game = new ExpGame(...param);
    this.games.push(game);
    return game;
  }

  getFreeGames() {
    const games = super.getFreeGames();
    return games.filter((game) => game.type === "normal");
  }

  createPlayer(...param: ConstructorParameters<typeof RawPlayer>) {
    const [playername, spec] = param;
    if (spec == null) return new Player(playername);
    else return new Player(playername, spec);
  }
}

export { Action, Agent, Board, ExpGame, ExpKakomimasu, Player };

import util from "../../util.js";
import { Game, Kakomimasu } from "../../Kakomimasu.js";
import { LogFileOp } from "./file_opration.ts";

import { accounts } from "../user.ts";

export class ExpGame extends Game {
  constructor(board, name, dummy) {
    super(board, dummy);
    this.name = name;
    this.startedAtUnixTime = null;
    this.nextTurnUnixTime = null;
    this.changeFuncs = [];
    this.reservedUsers = [];
  }
  attachPlayer(player) {
    if (this.reservedUsers > 0) {
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
    const ret = super.nextTurn();
    if (this.turn < this.nturn) {
      this.nextTurnUnixTime = util.nowUnixTime() + this.nsec;
    } else if (this.turn == this.nturn) {
      this.nextTurnUnixTime = null;
    }
    return ret;
  }

  addReservedUser(userId) {
    if (this.reservedUsers.some((e) => e === userId)) {
      return false;
    } else {
      this.reservedUsers.push(userId);
      return true;
    }
  }

  updateStatus() {
    if (this.isGaming()) { // ゲーム進行中
      const diff = (this.nextTurnUnixTime * 1000) - new Date().getTime();
      if (diff <= 0) {
        this.nextTurn();
        this.wsSend();
        this.updateStatus();
      } else {
        setTimeout(() => this.updateStatus(), diff);
      }
    }
    else if (this.ending) { // ゲーム終了後
      LogFileOp.save(this);

      console.log("turn", this.turn);
      this.wsSend();
    } // ゲーム開始前
    else {
      const diff = (this.startedAtUnixTime * 1000) - new Date().getTime();
      if (diff <= 0) {
        this.start();
        this.wsSend();
        this.updateStatus();
      } else {
        setTimeout(() => this.updateStatus(), diff);
      }
    }
  }

  toJSON() {
    const ret = super.toJSON();
    return {
      ...ret,
      gameName: this.name,
      startedAtUnixTime: this.startedAtUnixTime,
      nextTurnUnixTime: this.nextTurnUnixTime,
      reservedUsers: this.reservedUsers,
    };
  }

  wsSend() {
    //console.log("expKakomimasu", this.uuid);
    this.changeFuncs.forEach((func) => func(this.uuid));
  }
}

class ExpKakomimasu extends Kakomimasu {
  createGame(...param) {
    const game = new ExpGame(...param);
    this.games.push(game);
    return game;
  }
}

export { ExpKakomimasu };

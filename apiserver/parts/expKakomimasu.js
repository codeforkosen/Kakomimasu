import util from "../../util.js";
import { Game, Kakomimasu } from "../../Kakomimasu.js";
import { LogFileOp } from "./file_opration.ts";

class ExpGame extends Game {
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
      this.intervalId = setInterval(() => this.updateStatus(), 50);
      //console.log("intervalID", this.intervalId);
    }
    this.wsSend(); //this.changeFuncs.forEach((func) => func());
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
    let self = this;
    if (
      self.isReady() && !self.isGaming() && !self.ending &&
      (new Date().getTime() > (this.startedAtUnixTime * 1000))
    ) {
      self.start();
      this.wsSend(); //this.changeFuncs.forEach((func) => func());
    }
    if (self.isGaming()) {
      if (new Date().getTime() > (this.nextTurnUnixTime * 1000)) {
        self.nextTurn();
        this.wsSend(); //this.changeFuncs.forEach((func) => func());
      }
    }
    if (this.ending) {
      //saveLogFile(this);
      LogFileOp.save(this);

      this.dispose();
      console.log("turn", this.turn);
      this.wsSend(); //this.changeFuncs.forEach(func => func());
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

  dispose() {
    //console.log(this.intervalId);
    clearInterval(this.intervalId);
  }

  wsSend() {
    console.log("expKakomimasu", this.uuid);
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

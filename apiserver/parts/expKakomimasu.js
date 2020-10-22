import util from "../../util.js";
import { Game, Kakomimasu } from "../../Kakomimasu.js";

class ExpGame extends Game {
  constructor(board, name, dummy) {
    super(board, dummy);
    this.name = name;
    this.startedAtUnixTime = null;
    this.nextTurnUnixTime = null;
    this.changeFuncs = [];
  }
  attachPlayer(player) {
    if (super.attachPlayer(player) === false) return false;
    if (this.isReady()) {
      this.startedAtUnixTime = Math.floor(new Date().getTime() / 1000) + 5;
      this.nextTurnUnixTime = this.startedAtUnixTime + this.nsec;
      this.updateStatus();
      this.intervalId = setInterval(() => this.updateStatus(), 50);
      //console.log("intervalID", this.intervalId);
    }
    this.changeFuncs.forEach((func) => func());
    return true;
  }

  nextTurn() {
    const ret = super.nextTurn();
    if (this.turn < this.nturn) {
      this.nextTurnUnixTime = util.nowUnixTime() + this.nsec;
    }
    return ret;
  }

  updateStatus() {
    let self = this;
    if (
      self.isReady() && !self.isGaming() && !self.ending &&
      (new Date().getTime() > (this.startedAtUnixTime * 1000))
    ) {
      self.start();
      this.changeFuncs.forEach((func) => func());
    }
    if (self.isGaming()) {
      if (new Date().getTime() > (this.nextTurnUnixTime * 1000)) {
        self.nextTurn();
        this.changeFuncs.forEach((func) => func());
      }
    }
    if (this.ending) {
      /*const logData = {
        gameId: this.uuid,
        board: this.board,
        log: this.log,
      }*/
      Deno.mkdirSync("./log", { recursive: true });
      Deno.writeTextFileSync(`./log/${this.startedAtUnixTime}_${this.uuid}.log`, JSON.stringify(this, null, 2));

      this.dispose();
      console.log("turn", this.turn);
      this.changeFuncs.forEach(func => func());
    }
  }

  toJSON() {
    const ret = super.toJSON();
    return {
      ...ret,
      gameName: this.name,
      startedAtUnixTime: this.startedAtUnixTime,
      nextTurnUnixTime: this.nextTurnUnixTime,
    }
  }

  dispose() {
    clearInterval(this.intervalId);
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
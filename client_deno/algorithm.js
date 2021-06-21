import { KakomimasuClient } from "./KakomimasuClient.js";

// アルゴリズムはこれを継承する
export class Algorithm {
  // サーバに接続して対戦する(id,name,spec,passwordの連想配列を渡す)
  async match(param) {
    this.kc = new KakomimasuClient(
      param.id,
      param.name,
      param.spec,
      param.password,
    );
    this.kc.setServerHost(param.host);
    let info = await this.kc.waitMatching();
    info = await this.kc.waitStart();
    while (info) {
      const actions = this.think(info);
      this.kc.setActions(actions);
      info = await this.kc.waitNextTurn();
    }
  }

  getPlayerNumber() {
    return this.kc.getPlayerNumber();
  }

  getPoints() {
    return this.kc.getPoints();
  }

  getAgentCount() {
    return this.kc.getAgentCount();
  }

  getField() {
    return this.kc.getField();
  }
}

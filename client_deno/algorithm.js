import { Action, KakomimasuClient } from "./KakomimasuClient.js";

// アルゴリズムはこれを継承する
export class Algorithm {
  // サーバに接続して対戦する(id,name,spec,passwordの連想配列を渡す)
  async match(param) {
    const kc = new KakomimasuClient(
      param.id,
      param.name,
      param.spec,
      param.password,
    );
    kc.setServerHost(param.host);
    let info = await kc.waitMatching();
    this.onInit(
      kc.getPoints(),
      kc.getAgentCount(),
      info.totalTurn,
    );
    info = await kc.waitStart();
    while (info) {
      const actions = this.onTurn(
        kc.getField(),
        kc.getPlayerNumber(),
        info.players[kc.getPlayerNumber()].agents,
        info.turn,
      );
      kc.setActions(
        actions.map((a) => new Action(a[0], a[1], a[2], a[3])),
      );
      info = await kc.waitNextTurn();
    }
  }
}

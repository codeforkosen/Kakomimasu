import { KakomimasuClient, Action, DIR } from "./KakomimasuClient.js";

const kc = new KakomimasuClient("nit-taro1", "高専太郎1", "テスト", "nit-taro1-pw");
kc.setServerHost("http://localhost:8880"); // ローカルに接続してチェックする場合に使う

let info = await kc.waitMatching();

info = await kc.waitStart(); // スタート時間待ち

kc.setActions([new Action(0, "PUT", 2, 2)]);
info = await kc.waitNextTurn();
console.log(info.log[info.log.length - 1][0].actions);

kc.setActions([ new Action(0, "MOVE", 4, 2),new Action(0, "MOVE", 3, 2)]); // こっちだとAgentが[3,2]に移動する。
//kc.setActions([ new Action(0, "MOVE", 3, 2),new Action(0, "MOVE", 4, 2)]); // こっちだとAgentは移動しない。
info = await kc.waitNextTurn();
console.log(info.log[info.log.length - 1][0].actions);

/*
kc.setActions([new Action(0, "PUT", 2, 2), new Action(1, "PUT", 2, 4), new Action(2, "PUT", 2, 6)]);
info = await kc.waitNextTurn();

kc.setActions([new Action(0, "MOVE", 2, 2), new Action(1, "MOVE", 4, 4), new Action(2, "REMOVE", 3, 6)]); // 0:敵とのコンフリクト 1:無効な場所へ無効 2:AgentがいるマスをRemove
info = await kc.waitNextTurn();

kc.setActions([new Action(1, "MOVE", 3, 4), new Action(1, "MOVE", 2, 4)]); //1:同じAgentに複数のAction
info = await kc.waitNextTurn();
*/
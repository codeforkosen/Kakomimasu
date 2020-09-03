import { KakomimasuClient, Action, DIR } from "./KakomimasuClient.js";

const kc = new KakomimasuClient("nit-taro1", "高専太郎1", "テスト", "nit-taro1-pw");
kc.setServerHost("http://localhost:8880"); // ローカルに接続してチェックする場合に使う

let info = await kc.waitMatching();

info = await kc.waitStart(); // スタート時間待ち

kc.setActions([new Action(0, "PUT", 2, 2), new Action(1, "PUT", 4, 4)]);
info = await kc.waitNextTurn();

kc.setActions([new Action(0, "MOVE", 3, 2), new Action(1, "MOVE", 3, 4)]);
info = await kc.waitNextTurn();

kc.setActions([new Action(0, "MOVE", 4, 2), new Action(1, "MOVE", 2, 4)]);
info = await kc.waitNextTurn();

kc.setActions([new Action(0, "MOVE", 4, 3), new Action(1, "MOVE", 2, 3)]);
info = await kc.waitNextTurn();
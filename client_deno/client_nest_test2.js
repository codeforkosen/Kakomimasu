import { KakomimasuClient, Action, DIR } from "./KakomimasuClient.js";

const kc = new KakomimasuClient("nit-taro1", "高専太郎1", "テスト", "nit-taro1-pw");
kc.setServerHost("http://localhost:8880"); // ローカルに接続してチェックする場合に使う

let info = await kc.waitMatching();

info = await kc.waitStart(); // スタート時間待ち

kc.setActions([new Action(0, "PUT", 0, 0), new Action(1, "PUT", 6, 6), new Action(2, "PUT", 0, 6), new Action(3, "PUT", 6, 0)]);
info = await kc.waitNextTurn();

kc.setActions([new Action(0, "MOVE", 1, 0), new Action(1, "MOVE", 5, 6), new Action(2, "MOVE", 0, 5), new Action(3, "MOVE", 6, 1)]);
info = await kc.waitNextTurn();

kc.setActions([new Action(0, "MOVE", 2, 0), new Action(1, "MOVE", 4, 6), new Action(2, "MOVE", 0, 4), new Action(3, "MOVE", 6, 2)]);
info = await kc.waitNextTurn();

kc.setActions([new Action(0, "MOVE", 3, 0), new Action(1, "MOVE", 3, 6), new Action(2, "MOVE", 0, 3), new Action(3, "MOVE", 6, 3)]);
info = await kc.waitNextTurn();

kc.setActions([new Action(0, "MOVE", 4, 0), new Action(1, "MOVE", 2, 6), new Action(2, "MOVE", 0, 2), new Action(3, "MOVE", 6, 4)]);
info = await kc.waitNextTurn();

kc.setActions([new Action(0, "MOVE", 5, 0), new Action(1, "MOVE", 1, 6), new Action(2, "MOVE", 0, 1), new Action(3, "MOVE", 6, 5)]);
info = await kc.waitNextTurn();
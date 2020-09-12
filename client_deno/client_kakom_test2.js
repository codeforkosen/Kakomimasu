import { KakomimasuClient, Action, DIR } from "./KakomimasuClient.js";

const kc = new KakomimasuClient("nit-taro1", "高専太郎1", "テスト", "nit-taro1-pw");
kc.setServerHost("http://localhost:8880"); // ローカルに接続してチェックする場合に使う

let info = await kc.waitMatching();

info = await kc.waitStart(); // スタート時間待ち

kc.setActions([
  new Action(0, "PUT", 2, 2),
  new Action(1, "PUT", 8, 2),
  new Action(2, "PUT", 8, 8),
  new Action(3, "PUT", 2, 8),
]);
info = await kc.waitNextTurn();

kc.setActions([
  new Action(0, "MOVE", 3, 2),
  new Action(1, "MOVE", 8, 3),
  new Action(2, "MOVE", 7, 8),
  new Action(3, "MOVE", 2, 7),
]);
info = await kc.waitNextTurn();

kc.setActions([
  new Action(0, "MOVE", 4, 2),
  new Action(1, "MOVE", 8, 4),
  new Action(2, "MOVE", 6, 8),
  new Action(3, "MOVE", 2, 6),
]);
info = await kc.waitNextTurn();

kc.setActions([
  new Action(0, "MOVE", 5, 2),
  new Action(1, "MOVE", 8, 5),
  new Action(2, "MOVE", 5, 8),
  new Action(3, "MOVE", 2, 5),
]);
info = await kc.waitNextTurn();

kc.setActions([
  new Action(0, "MOVE", 6, 2),
  new Action(1, "MOVE", 8, 6),
  new Action(2, "MOVE", 4, 8),
  new Action(3, "MOVE", 2, 4),
]);
info = await kc.waitNextTurn();

kc.setActions([
  new Action(0, "MOVE", 7, 2),
  new Action(1, "MOVE", 8, 7),
  new Action(2, "MOVE", 3, 8),
  new Action(3, "MOVE", 2, 3),
]);
info = await kc.waitNextTurn();

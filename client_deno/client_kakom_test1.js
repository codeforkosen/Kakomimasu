import { KakomimasuClient, Action, DIR } from "./KakomimasuClient.js";

const kc = new KakomimasuClient("nit-taro1", "高専太郎1", "テスト", "nit-taro1-pw");
kc.setServerHost("http://localhost:8880"); // ローカルに接続してチェックする場合に使う

let info = await kc.waitMatching();

info = await kc.waitStart(); // スタート時間待ち

const i = 0;
kc.setActions([
  new Action(0, "PUT", 0 + i, 0),
  new Action(1, "PUT", 10 + i, 0),
  new Action(2, "PUT", 10 + i, 10),
  new Action(3, "PUT", 0 + i, 10),
  new Action(4, "PUT", 4, 4),
  new Action(5, "PUT", 6, 4),
  new Action(6, "PUT", 6, 6),
  new Action(7, "PUT", 4, 6),
]);
info = await kc.waitNextTurn();

kc.setActions([
  new Action(0, "MOVE", 1 + i, 0),
  new Action(1, "MOVE", 10 + i, 1),
  new Action(2, "MOVE", 9 + i, 10),
  new Action(3, "MOVE", 0 + i, 9),
  new Action(4, "MOVE", 5, 4),
  new Action(5, "MOVE", 6, 5),
  new Action(6, "MOVE", 5, 6),
  new Action(7, "MOVE", 4, 5),
]);
info = await kc.waitNextTurn();

kc.setActions([
  new Action(0, "MOVE", 2 + i, 0),
  new Action(1, "MOVE", 10 + i, 2),
  new Action(2, "MOVE", 8 + i, 10),
  new Action(3, "MOVE", 0 + i, 8),
]);
info = await kc.waitNextTurn();

kc.setActions([
  new Action(0, "MOVE", 3 + i, 0),
  new Action(1, "MOVE", 10 + i, 3),
  new Action(2, "MOVE", 7 + i, 10),
  new Action(3, "MOVE", 0 + i, 7),
]);
info = await kc.waitNextTurn();

kc.setActions([
  new Action(0, "MOVE", 4 + i, 0),
  new Action(1, "MOVE", 10 + i, 4),
  new Action(2, "MOVE", 6 + i, 10),
  new Action(3, "MOVE", 0 + i, 6),
]);
info = await kc.waitNextTurn();

kc.setActions([
  new Action(0, "MOVE", 5 + i, 0),
  new Action(1, "MOVE", 10 + i, 5),
  new Action(2, "MOVE", 5 + i, 10),
  new Action(3, "MOVE", 0 + i, 5),
]);
info = await kc.waitNextTurn();

kc.setActions([
  new Action(0, "MOVE", 6 + i, 0),
  new Action(1, "MOVE", 10 + i, 6),
  new Action(2, "MOVE", 4 + i, 10),
  new Action(3, "MOVE", 0 + i, 4),
]);
info = await kc.waitNextTurn();

kc.setActions([
  new Action(0, "MOVE", 7 + i, 0),
  new Action(1, "MOVE", 10 + i, 7),
  new Action(2, "MOVE", 3 + i, 10),
  new Action(3, "MOVE", 0 + i, 3),
]);
info = await kc.waitNextTurn();

kc.setActions([
  new Action(0, "MOVE", 8 + i, 0),
  new Action(1, "MOVE", 10 + i, 8),
  new Action(2, "MOVE", 2 + i, 10),
  new Action(3, "MOVE", 0 + i, 2),
]);
info = await kc.waitNextTurn();

kc.setActions([
  new Action(0, "MOVE", 9 + i, 0),
  new Action(1, "MOVE", 10 + i, 9),
  new Action(2, "MOVE", 1 + i, 10),
  new Action(3, "MOVE", 0 + i, 1),
]);
info = await kc.waitNextTurn();

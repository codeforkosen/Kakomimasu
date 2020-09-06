import { KakomimasuClient, Action, DIR } from "./KakomimasuClient.js";

const kc = new KakomimasuClient("nit-taro1", "高専太郎1", "なにもしない", "nit-taro1-pw");
kc.setServerHost("http://localhost:8880"); // ローカルに接続してチェックする場合に使う

let info = await kc.waitMatching();

info = await kc.waitStart(); // スタート時間待ち

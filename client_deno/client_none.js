import util from "../util.js";
import { Algorithm } from "./algorithm.js";
import { Action, DIR } from "./KakomimasuClient.js";

export class ClientNone extends Algorithm {

  think(info) {
    return [];
  }
}

if (import.meta.main) {
  let a = new ClientNone();
  a.match({
    id: "ai-none",
    name: "AI-NONE",
    spec: "なにもしない",
    password: "ai-none-pw"
  });
}
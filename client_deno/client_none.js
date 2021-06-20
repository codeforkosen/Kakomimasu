import { Algorithm } from "./algorithm.js";

export class ClientNone extends Algorithm {

  think(_info) {
    return [];
  }
}

if (import.meta.main) {
  const a = new ClientNone();
  a.match({
    id: "ai-none",
    name: "AI-NONE",
    spec: "なにもしない",
    password: "ai-none-pw"
  });
}
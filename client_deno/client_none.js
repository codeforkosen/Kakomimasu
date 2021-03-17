import { KakomimasuClient } from "./KakomimasuClient.js";

const kc = new KakomimasuClient("ai-none", "AI-NONE", "なにもしない", "ai-none-pw");

await kc.waitMatching();

// スタート時間待ち
await kc.waitStart();

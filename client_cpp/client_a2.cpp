#include "kakomimasu.h"

int main() {
    KakomimasuClient kc("ai-2", "AI-2", "", "ai-2-pw");
    kc.waitMatching();
    kc.getGameInfo();

    const int pno = kc.getPlayerNumber();
    const vector<vector<int>> points = kc.getPoints();
    const int w = kc.getWidth();
    const int h = kc.getHeight();
    const int nagents = kc.getAgentCount();

    // ポイントの高い順ソート
    vector<tuple<int, int, int>> pntall;
    for (int i = 0; i < h; i++) {
        for (int j = 0; j < w; j++) {
            pntall.emplace_back(points[i][j], j, i);
        }
    }
    sort(pntall.rbegin(), pntall.rend());

    // ↓ここからがAIの中身↓
    while (kc.getGameInfo()) {
        // ランダムにずらしつつ置けるだけおく
        // 置いたものはランダムに8方向に動かす
        // 画面外にはでない判定を追加（a1 → a2)
        vector<Action> action;
        const int offset = rnd(nagents);
        for (int i = 0; i < nagents; i++) {
            const Agent agent = kc.getAgent()[i];
            if (agent.x == -1) {
                auto [point, x, y] = pntall[i + offset];
                action.push_back({i, "PUT", x, y});
            } else {
                while (true) {
                    auto [dx, dy] = DIR[rnd(8)];
                    const int x = agent.x + dx;
                    const int y = agent.y + dy;
                    if (x < 0 || x >= w || y < 0 || y >= h)
                        continue;
                    action.push_back({i, "MOVE", agent.x + dx, agent.y + dy});
                    break;
                }
            }
        }
        kc.setAction(action);
        kc.waitNextTurn();
    }

    return 0;
}
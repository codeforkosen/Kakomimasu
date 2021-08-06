#include "kakomimasu.h"

int main() {
    // 自分のbearerTokenを書く
    KakomimasuClient kc("");
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
        vector<Action> action;
        const int offset = rnd(nagents);
        for (int i = 0; i < nagents; i++) {
            const Agent agent = kc.getAgent()[i];
            if (agent.x == -1) {
                const auto [point, x, y] = pntall[i + offset];
                action.push_back({i, "PUT", x, y});
            } else {
                const auto [dx, dy] = DIR[rnd(8)];
                action.push_back({i, "MOVE", agent.x + dx, agent.y + dy});
            }
        }
        kc.setAction(action);
        kc.waitNextTurn();
    }

    return 0;
}
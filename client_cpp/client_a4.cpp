// だいたい点数の高い順に置き、点数の高い順に壊しながら動くアルゴリズム
#include "kakomimasu.h"

struct Tile_info {
    int x, y;
    int type, pid;
    int point;

    // ポイントが高い順にソートできるように比較演算子の定義
    bool operator<(const Tile_info &right) const {
        return point < right.point;
    }
};

int main() {
    KakomimasuClient kc("ai-4", "AI-4", "破壊者", "ai-4-pw");
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
        vector<Action> actions;
        vector<vector<Tile>> field = kc.getFiled();
        const int offset = rnd(nagents);
        vector<tuple<int, int>> poschk; // 動く予定の場所

        auto checkFree = [&](int x, int y) -> bool {
            for (int i = 0; i < poschk.size(); i++) {
                const auto [px, py] = poschk[i];
                if (px == x && py == y)
                    return false;
            }
            return true;
        };

        for (int i = 0; i < nagents; i++) {
            const Agent agent = kc.getAgent()[i];
            if (agent.x == -1) { // 置く前
                const auto [p_point, p_x, p_y] = pntall[i + offset];
                actions.push_back({i, "PUT", p_x, p_y});
            } else {
                vector<Tile_info> dirall;
                for (const auto [dx, dy] : DIR) {
                    const int x = agent.x + dx;
                    const int y = agent.y + dy;
                    if (x >= 0 && x < w && y >= 0 && y < h && checkFree(x, y)) {
                        Tile f = field[y][x];
                        if (f.type == 0 && f.pid != -1 && f.pid != pno) {
                            dirall.push_back({x, y, f.type, f.pid, f.point + 10});
                        } else if (f.type == 0 && f.pid == -1) {
                            dirall.push_back({x, y, f.type, f.pid, f.point + 5});
                        } else if (f.type == 1 && f.pid != pno) {
                            dirall.push_back({x, y, f.type, f.pid, f.point});
                        }
                    }
                }
                if (dirall.size() > 0) {
                    sort(dirall.rbegin(), dirall.rend());
                    const Tile_info p = dirall[0];
                    if (p.type == 0 || p.pid == -1) {
                        actions.push_back({i, "MOVE", p.x, p.y});
                        poschk.push_back({p.x, p.y});
                        poschk.push_back({agent.x, agent.y}); // 動けなかった時用
                    } else {
                        actions.push_back({i, "REMOVE", p.x, p.y});
                        poschk.push_back({agent.x, agent.y});
                    }
                } else {
                    while (true) {
                        const auto [dx, dy] = DIR[rnd(8)];
                        const int x = agent.x + dx;
                        const int y = agent.y + dy;
                        if (x < 0 || x >= w || y < 0 || y >= h)
                            continue;
                        actions.push_back({i, "MOVE", x, y});
                        poschk.push_back({x, y});
                        break;
                    }
                }
            }
        }
        kc.setAction(actions);
        kc.waitNextTurn();
    }

    return 0;
}
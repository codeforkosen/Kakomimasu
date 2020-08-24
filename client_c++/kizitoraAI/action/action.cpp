#include "action.hpp"

#include <cstring>
#include <queue>

// 遷移判定
// 詳しいアルゴリズムは、TMCIT_PROCON2020ディレクトリのREADMEを参照してください。
bool TurnInfo::has_conflict(const std::vector<Action>& actions) const {
    // 無効判定
    for (const Action action : actions) {
        const int b = action.get_behavior();
        const Cell& t = action.get_target();

        // 共通部分
        if (is_outside(t) == true) return true;

        // 行動の種類によって分かれる部分
        if (b == 'a' || b == 'w') {
            if (get_cell_state(t) == ENEMY_WALL) return true;
        }
        else if (b == 'e') {
            if (get_cell_state(t) != ENEMY_WALL && get_cell_state(t) != ALLY_WALL) return true;
        }
    }

    // 競合判定(移動)
    bool agent_existed[MAX_BOARD_SIZE][MAX_BOARD_SIZE];
    std::memset(agent_existed, false, sizeof(agent_existed));

    for (const Action action : actions) {
        const int b = action.get_behavior();
        const Cell& t = action.get_target();

        if (b == 'w') {
            if (agent_existed[t.get_y()][t.get_x()] == false) {
                agent_existed[t.get_y()][t.get_x()] = true;
            }
            else {
                return true;
            }
        }
    }

    // 競合判定(配置・除去)
    // 移動の競合判定を行ってから配置・除去の判定を行うのは、移動によってエージェントの位置が変化するため
    for (const Action action : actions) {
        const int b = action.get_behavior();
        const Cell& t = action.get_target();

        if (b == 'a' || b == 'e') {
            if (agent_existed[t.get_y()][t.get_x()] == false) {
                agent_existed[t.get_y()][t.get_x()] = true;
            }
            else {
                return true;
            }
        }
    }

    return false;
}

// エージェントごとの有効な行動を列挙して、二次元配列に入れる
std::vector<std::vector<Action>> enumerate_agent_moves(const TurnInfo& turn_info) {
    std::vector<std::vector<Action>> candidate(turn_info.get_max_agent_num());

    // 盤面上にあるエージェントが、次ターンに移動または除去できる行動の候補をすべて洗い出す
    for (int i = 0; i < turn_info.get_max_agent_num(); ++i) {
        Cell agent_pos = turn_info.get_agent_pos(i, ALLY);

        if (agent_pos == Cell(-1, -1)) {
            std::priority_queue<std::pair<int, Cell>> pq;

            for (int posY = 0; posY < turn_info.get_heigt(); posY++) {
                for (int posX = 0; posX < turn_info.get_width(); posX++) {
                    const Cell now = Cell(posY, posX);
                    if (turn_info.get_cell_state(now) == NONE
                        || turn_info.get_cell_state(now) == ENEMY_BASE)
                        pq.push(std::make_pair(turn_info.get_cell_point(now), now));
                }
            }

            // 8近傍分の候補を取る。これはwalkやeraseが最大で8近傍取れるのに合わせている
            for (int j = 0; j < kNextToEit.size(); ++j) {
                const Cell best_pos = pq.top().second;
                pq.pop();

                candidate[i].push_back(Action('a', best_pos));
            }
        }
        else {
            for (int direction = 0; direction < kNextToEit.size(); ++direction) {
                Cell next_cell = agent_pos + kNextToEit[direction];

                if (turn_info.is_outside(next_cell) == true) continue;

                int next_cell_state = turn_info.get_cell_state(next_cell);

                // 次の候補のマスが自チームの城壁だった場合は移動や除去をする意味がないので省く
                if (next_cell_state == ALLY_WALL) continue;

                if (next_cell_state == NONE || next_cell_state == ENEMY_BASE) {
                    candidate[i].push_back(Action('w', next_cell));
                }
                else if (next_cell_state == ENEMY_WALL) {
                    candidate[i].push_back(Action('e', next_cell));
                }
            }
        }
    }

    return candidate;
}
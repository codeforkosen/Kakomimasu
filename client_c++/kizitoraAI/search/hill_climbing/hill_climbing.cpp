#include "hill_climbing.hpp"

#include <chrono>
#include <queue>
#include <random>

namespace hill_climbing {
    // 範囲指定の乱数を作るときに必要になる変数
    std::random_device rnd;
    std::mt19937 mt(rnd());

    std::vector<Action> hill_climbing_search(TurnInfo& turn_info) {
        // 時間計測開始。後に山登り法で使う
        Timer tm;

        // 各エージェントの行動候補を出す
        std::vector<std::vector<Action>> candidate = enumerate_agent_moves(turn_info);

        int best_score = 0;
        std::vector<Action> best_actions;

        while (1) {
            if (tm.elapsed_ms() > 2900) break;

            // 次の各エージェントの行動をランダムに確定する
            std::vector<Action> tmp_actions;
            for (int i = 0; i < turn_info.get_agent_num_on_board(); i++) {
                std::uniform_int_distribution<> rnd(0, candidate[i].size() - 1);
                int rand_idx = rnd(mt);
                tmp_actions.push_back(candidate[i].at(rand_idx));
            }

            // 遷移判定で引っかかったらアウト
            if (turn_info.has_conflict(tmp_actions) == true) continue;

            int tmp_score
                = turn_info.calc_wall_score(tmp_actions) + turn_info.calc_base_score(tmp_actions);

            // ランダムに確定したものが今の行動よりも良いスコアを出せるのなら、そちらに変更する
            if (tmp_score > best_score) {
                best_score = tmp_score;
                best_actions = tmp_actions;
            }
        }

        int non_deployed_agent_num = turn_info.get_non_deployed_agent_num();

        // 未配置のエージェントがいる場合は、得点ボードをすべて見てもっともポイントの高いマスを探し、そこにエージェントを配置する
        if (non_deployed_agent_num != 0) {
            std::priority_queue<hill_climbing::PointAndCellPos> pq;

            for (int posY = 0; posY < turn_info.get_heigt(); posY++) {
                for (int posX = 0; posX < turn_info.get_width(); posX++) {
                    Cell pos(posY, posX);
                    pq.push(PointAndCellPos(turn_info.get_cell_point(pos), pos));
                }
            }

            for (int i = 0; i < non_deployed_agent_num; i++) {
                while (1) {
                    hill_climbing::PointAndCellPos tmp = pq.top();
                    pq.pop();

                    const Cell& pos = tmp.get_position();
                    const int s = turn_info.get_cell_state(pos);

                    if (turn_info.agent_existed(pos) == true)
                        continue;
                    else if (s == ALLY_WALL || s == ALLY_BASE)
                        continue;

                    best_actions.push_back(Action('a', pos));
                    break;
                }
            }
        }

        return best_actions;
    }
}
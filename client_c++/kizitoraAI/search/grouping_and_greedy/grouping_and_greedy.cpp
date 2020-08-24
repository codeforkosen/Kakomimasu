#include "grouping_and_greedy.hpp"

#include <algorithm>
#include <cstring>
#include <queue>
#include <random>

namespace grouping_and_greedy {
    // ランダム移動
    Action get_random_action(const std::vector<InfoAboutCell>& k8) {
        std::random_device rnd;
        std::mt19937 mt(rnd());
        std::uniform_int_distribution<> rnd_idx(0, k8.size() - 1);

        auto rnd_access_cell = k8[rnd_idx(mt)];

        if (rnd_access_cell.state == ENEMY_WALL)
            return Action('e', rnd_access_cell.position);
        else
            return Action('w', rnd_access_cell.position);
    }


    // posの8近傍のセルについての情報を配列にまとめて返す関数
    std::vector<InfoAboutCell> get_near_8cells_info(const TurnInfo& turn_info, const Cell& pos) {
        std::vector<InfoAboutCell> k8_cells_info;

        for (int direction = 0; direction < kNextToEit.size(); direction++) {
            const Cell next = pos + kNextToEit[direction];

            if (turn_info.is_outside(next) == false && turn_info.get_cell_point(next) > 0)
                k8_cells_info.push_back(InfoAboutCell(
                    turn_info.get_cell_point(next), turn_info.get_cell_state(next), next));
        }

        return k8_cells_info;
    }


    std::vector<Action> grouping_and_greedy_search(const TurnInfo& turn_info) {
        std::vector<Action> agent_actions;

        // 最初のターンではまだ何もエージェントが設置されていないので、まずエージェントを配置させる
        if (turn_info.get_now_turn() == 0) {
            // priority_queueを用いてボードで最もポイントが高いマスを見つける
            std::priority_queue<InfoAboutCell> pq;

            for (int posY = 0; posY < turn_info.get_heigt(); posY++) {
                for (int posX = 0; posX < turn_info.get_width(); posX++) {
                    const Cell& pos = Cell(posY, posX);
                    pq.push(InfoAboutCell(
                        turn_info.get_cell_point(pos), turn_info.get_cell_state(pos), pos));
                }
            }


            bool agent_existed[24][24];
            std::memset(agent_existed, false, sizeof(agent_existed));

            // エージェントの配置場所を確定させる
            for (int agent_id = 0; agent_id < turn_info.get_max_agent_num(); agent_id++) {
                // agent_idが偶数の場合は、前処理で求めた最もポイントが高いマスに設置する
                if (agent_id % 2 == 0) {
                    const InfoAboutCell tmp = pq.top();
                    pq.pop();

                    agent_actions.push_back(Action('a', tmp.position));

                    agent_existed[tmp.position.get_y()][tmp.position.get_x()] = true;
                }
                // agent_idが奇数の場合は、agent_id - 1 のエージェントが設置したマスの8近傍を見て
                // 1以上16以下で最もポイントが小さいマスに設置する。
                else {
                    const Cell& agent_pos = agent_actions.back().get_target();
                    auto k8 = get_near_8cells_info(turn_info, agent_pos);

                    // ポイントを昇順にソートする
                    sort(k8.begin(), k8.end());

                    for (int i = 0; i < k8.size(); ++i) {
                        // すでにエージェントが存在する場合はスキップ
                        if (agent_existed[k8[i].position.get_y()][k8[i].position.get_x()] == true)
                            continue;

                        if (k8[i].point > 0) {
                            agent_actions.push_back(Action('a', k8[i].position));
                            agent_existed[k8[i].position.get_y()][k8[i].position.get_x()] = true;
                            break;
                        }
                    }
                }
            }
            return agent_actions;
        }

        // 1ターン目以降
        bool agent_existed[24][24];
        std::memset(agent_existed, false, sizeof(agent_existed));

        for (int agent_id = 0; agent_id < turn_info.get_max_agent_num(); agent_id++) {
            const Cell& agent_pos = turn_info.get_agent_pos(agent_id, ALLY);

            // エージェントが未配置の場合
            if (agent_pos == Cell(-1, -1)) {
                if (agent_id % 2 == 0) {
                    // 相方のエージェントの位置
                    const Cell& next_agent_pos = turn_info.get_agent_pos(agent_id + 1, ALLY);

                    auto k8 = get_near_8cells_info(turn_info, next_agent_pos);

                    // ポイントを降順にソートする
                    sort(k8.rbegin(), k8.rend());

                    bool can_move = false;
                    // 8近傍を見て、中立か敵の陣地だった場合はそこに移動する
                    for (int i = 0; i < k8.size(); i++) {
                        // すでにエージェントが存在する場合はスキップ
                        if (agent_existed[k8[i].position.get_y()][k8[i].position.get_x()] == true)
                            continue;

                        if (k8[i].state == NONE) {
                            agent_actions.push_back(Action('a', k8[i].position));
                            agent_existed[k8[i].position.get_y()][k8[i].position.get_x()] = true;
                            can_move = true;
                            break;
                        }
                    }

                    // 次の移動先が見つからなかった場合は、8近傍のいずれかにランダムに移動する
                    // 将来的には、中立が多い場所へ移動するみたいなことをしたい。
                    if (can_move == false) {
                        Action rnd = get_random_action(k8);
                        agent_actions.push_back(rnd);
                    }
                }
                else {
                    const Cell& pre_agent_pos = turn_info.get_agent_pos(agent_id - 1, ALLY);

                    auto k8 = get_near_8cells_info(turn_info, agent_pos);

                    // ポイントを昇順にソートする
                    sort(k8.begin(), k8.end());

                    for (int i = 0; i < k8.size(); ++i) {
                        if (k8[i].point > 0) {
                            agent_actions.push_back(Action('a', k8[i].position));
                            agent_existed[k8[i].position.get_y()][k8[i].position.get_x()] = true;
                            break;
                        }
                    }
                }
            }
            else {
                // エージェントIDが偶数の場合は、8近傍で最も高い点を取りに行くグループとする。
                if (agent_id % 2 == 0) {
                    auto k8 = get_near_8cells_info(turn_info, agent_pos);

                    // ポイントを降順にソートする
                    sort(k8.rbegin(), k8.rend());

                    bool can_move = false;
                    // 8近傍を見て、中立か敵の陣地だった場合はそこに移動する
                    for (int i = 0; i < k8.size(); i++) {
                        // すでにエージェントが存在する場合はスキップ
                        if (agent_existed[k8[i].position.get_y()][k8[i].position.get_x()] == true)
                            continue;

                        if (k8[i].state == NONE || k8[i].state == ENEMY_BASE) {
                            agent_actions.push_back(Action('w', k8[i].position));
                            agent_existed[k8[i].position.get_y()][k8[i].position.get_x()] = true;
                            can_move = true;
                            break;
                        }
                    }

                    // 次の移動先が見つからなかった場合は、8近傍のいずれかにランダムに移動する
                    // 将来的には、中立が多い場所へ移動するみたいなことをしたい。
                    if (can_move == false) {
                        Action rnd = get_random_action(k8);
                        agent_actions.push_back(rnd);
                    }
                }
                // 奇数の場合は8近傍で1ポイント以上のマスのうち、もっとも低い点を取りに行くグループとする。
                // ただし、8近傍に敵の城壁がある場合は、先にその城壁を除去する
                else {
                    bool can_move = false;
                    auto k8 = get_near_8cells_info(turn_info, agent_pos);

                    // ポイントを昇順にソートする
                    sort(k8.begin(), k8.end());

                    // もし8近傍に敵の城壁がある場合はまずそのマスを除去する
                    for (int i = 0; i < k8.size(); i++) {
                        // すでにエージェントが存在する場合はスキップ
                        if (agent_existed[k8[i].position.get_y()][k8[i].position.get_x()] == true)
                            continue;

                        if (k8[i].state == ENEMY_WALL) {
                            agent_actions.push_back(Action('e', k8[i].position));
                            agent_existed[k8[i].position.get_y()][k8[i].position.get_x()] = true;
                            can_move = true;
                            break;
                        }
                    }

                    // もし次の移動先が決まってたらこれ以降の処理はスキップ
                    if (can_move) continue;


                    for (int i = 0; i < k8.size(); ++i) {
                        if (agent_existed[k8[i].position.get_y()][k8[i].position.get_x()] == true)
                            continue;

                        if (k8[i].point > 0 && k8[i].state == NONE || k8[i].state == ENEMY_BASE) {
                            agent_actions.push_back(Action('w', k8[i].position));
                            agent_existed[k8[i].position.get_y()][k8[i].position.get_x()] = true;
                            can_move = true;
                            break;
                        }
                    }

                    // 次の移動先が見つからなかった場合は、8近傍のいずれかにランダムに移動する
                    // 将来的には、中立が多い場所へ移動するみたいなことをしたい。
                    if (can_move == false) {
                        Action rnd = get_random_action(k8);
                        agent_actions.push_back(rnd);
                    }
                }
            }
        }
        return agent_actions;
    }
}

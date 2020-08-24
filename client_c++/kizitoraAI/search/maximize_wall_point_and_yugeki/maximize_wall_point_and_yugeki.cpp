#include "maximize_wall_point_and_yugeki.hpp"

#include <algorithm>
#include <cstring>
#include <map>
#include <queue>
#include <random>

namespace maximize_wall_point_and_yugeki {
    // 範囲指定の乱数を作るときに必要になる変数
    std::random_device rnd;
    std::mt19937 mt(rnd());


    constexpr int make_base = 1;
    constexpr int prevent_makeing_enemy_base = 0;
    // 遊撃部隊はとりあえず1エージェントだけ
    constexpr int yuugeki = make_base + prevent_makeing_enemy_base;
    // それ以外はすべて城壁貪欲を行うエージェントとなる
    // greedyのみエージェントの総数で値が変化するため、代入はsearch関数のはじめで行われる
    int greedy;

    // エージェントの移動先, 設置先が被らないように、次のターンエージェントがどこにいるのかを記録するs
    bool agent_existed[24][24];

    // ポイントの高いマスの候補をgreedyを行うエージェント×2ほどとり、その中からランダムに置くマスを決める関数
    // 候補を多めにとるのは、エージェントが一つの場所に固まりにくいようにするため
    Cell search_high_score_pos_from_board(const TurnInfo& turn_info) {
        std::priority_queue<std::pair<int, Cell>> pq;

        for (int posY = 0; posY < turn_info.get_heigt(); posY++) {
            for (int posX = 0; posX < turn_info.get_width(); posX++) {
                const Cell& pos = Cell(posY, posX);

                if (turn_info.get_cell_state(pos) == NONE
                    || turn_info.get_cell_state(pos) == ENEMY_BASE)
                    pq.push(std::make_pair(turn_info.get_cell_point(pos), pos));
            }
        }

        // 候補をgreedy×2個分決める
        std::vector<Cell> candidate;
        for (int i = 0; i < greedy * 2 && !pq.empty(); i++) {
            const Cell& pos = pq.top().second;
            pq.pop();

            if (agent_existed[pos.get_y()][pos.get_x()] == true) continue;

            candidate.push_back(pos);
        }

        // 候補の中からランダムに一つ決める
        std::uniform_int_distribution<> random(0, candidate.size());
        const Cell& random_cell = candidate[random(mt)];

        return random_cell;
    }

    // 第二引数posの周囲八近傍を見て最もポイントの高いマスを返す関数
    Cell search_highest_score_pos_from_k8(const TurnInfo& turn_info, const Cell& pos) {
        std::vector<std::pair<int, Cell>> k8;

        // 周囲八近傍のポイントと位置をk8にまとめる
        for (int direction = 0; direction < kNextToEit.size(); direction++) {
            const Cell next = pos + kNextToEit[direction];

            if (turn_info.is_outside(next) == true
                || agent_existed[next.get_y()][next.get_x()] == true)
                continue;

            k8.push_back(std::make_pair(turn_info.get_cell_point(next), next));
        }

        // k8をポイント順にまとめる
        sort(k8.rbegin(), k8.rend());

        for (int i = 0; i < k8.size(); i++) {
            // 味方の陣地や城壁は、移動したり除去したりの意味がないのでスキップ
            if (turn_info.get_cell_state(k8[i].second) == ALLY_BASE
                || turn_info.get_cell_state(k8[i].second) == ALLY_WALL)
                continue;

            // マイナスマスは踏まないようにする
            if (turn_info.get_cell_point(k8[i].second) < 0) continue;

            return k8[i].second;
        }

        // 上記の処理を抜けてしまったということは、次に行く候補が見つからないということ。
        // そのため次の移動はランダムに確定させる
        std::uniform_int_distribution<> rnd_idx(0, k8.size() - 1);
        return k8[rnd_idx(mt)].second;
    }

    // あるマスを囲んで陣地にした場合の城壁ポイント + 陣地ポイントの合計が最も高くなる位置を見つけてそれを返す関数
    // この関数では、一つのエージェントにつき一つの陣地を囲むようにしている。つまり、一つの陣地を複数人のエージェントが囲もうとしないようにしている
    Cell search_candidate_for_base_pos(const TurnInfo& turn_info, const Cell& now_agent_pos) {
        // 自分以外のエージェントの位置を調べる。これは後に一つの陣地を複数人のエージェントが囲むのを防ぐのに使う
        std::map<Cell, bool> other_agents_pos;
        for (int i = 0; i < turn_info.get_max_agent_num(); i++) {
            const Cell& oa = turn_info.get_agent_pos(i, ALLY);

            if (oa == now_agent_pos) continue;
            other_agents_pos[oa] = true;
        }

        // 最もポイントの高くなる陣地候補を探す
        std::priority_queue<std::pair<int, Cell>> pq;

        for (int posY = 0; posY < turn_info.get_heigt(); posY++) {
            for (int posX = 0; posX < turn_info.get_width(); posX++) {
                // (posX, posY)の位置がボードの辺だった場合は陣地が作れないのでスルー
                if (posY == 0 || posY == turn_info.get_heigt() - 1 || posX == 0
                    || posX == turn_info.get_width() - 1)
                    continue;
                // すでにその場所にほかの陣地を作るエージェントがいる場合はスルー
                else if (other_agents_pos.count(Cell(posY, posX)) == 1)
                    continue;
                else if (turn_info.get_cell_state(Cell(posY, posX)) == ALLY_WALL
                         || turn_info.get_cell_state(Cell(posY, posX)) == ALLY_BASE)
                    continue;

                bool is_agent_existed = false;
                int wall_point = 0;
                const Cell now_pos = Cell(posY, posX);

                for (int direction = 0; direction < kNextToEit.size(); direction++) {
                    const Cell& next_pos = now_pos + kNextToEit[direction];

                    // now_posの周囲八近傍に他のmake_baseエージェントがいる場合は、
                    // すでにその場所をほかエージェントが囲もうとしているということなのでスキップ
                    if (other_agents_pos.count(next_pos) == 1) {
                        is_agent_existed = true;
                        continue;
                    }

                    wall_point += turn_info.get_cell_point(next_pos);
                }

                if (is_agent_existed) continue;

                int base_point = std::abs(turn_info.get_cell_point(now_pos));
                pq.push(std::make_pair(wall_point + base_point, now_pos));
            }
        }
        return pq.top().second;
    }

    // 目標の位置の周囲を囲むための次に移動すべきマスを返す関数
    Cell search_next_pos_to_surround_target_pos(const TurnInfo& turn_info,
                                                const Cell& now_agent_pos,
                                                const Cell& target_pos) {
        bool checked[24][24];
        std::memset(checked, false, sizeof(checked));
        std::queue<BFS_state> que;
        std::map<Cell, bool> target_pos_k8;

        checked[now_agent_pos.get_y()][now_agent_pos.get_x()] = true;
        que.push(BFS_state(now_agent_pos, now_agent_pos));

        // target_posの八近傍のうち、まだ自チームの城壁にできていない場所を見つけてmapに入れる。これは後にBFSするときの目標地点となる
        for (int direction = 0; direction < kNextToEit.size(); direction++) {
            const Cell next = target_pos + kNextToEit[direction];
            if (now_agent_pos == next)
                continue;
            else if (turn_info.get_cell_state(next) == ALLY_WALL)
                continue;
            else {
                target_pos_k8[next] = true;
            }
        }

        //BFS
        int i = 0;
        while (!que.empty()) {
            const BFS_state now = que.front();
            que.pop();
            if (target_pos_k8[now.now] == true) {
                return now.root;
            }

            for (int direction = 0; direction < kNextToEit.size(); direction++) {
                const Cell next = now.now + kNextToEit[direction];
                const int ny = next.get_y();
                const int nx = next.get_x();
                const int ns = turn_info.get_cell_state(next);

                if (turn_info.is_outside(next) == false && checked[ny][nx] == false
                    && agent_existed[ny][nx] == false && next != target_pos) {
                    if (next - target_pos <= Cell(1, 1) && turn_info.get_cell_point(next) < 0)
                        continue;

                    checked[ny][nx] = true;

                    // i = 0のときはBFS_stateのrootに値を入れておく
                    if (i == 0)
                        que.push(BFS_state(next, next));
                    else
                        que.push(BFS_state(next, now.root));
                }
            }
            i++;
        }
        return Cell(-1, -1);
    }

    std::vector<Action> maximize_wall_point_and_yugeki_search(const TurnInfo& turn_info) {
        greedy = turn_info.get_max_agent_num() - yuugeki;
        std::memset(agent_existed, false, sizeof(agent_existed));
        std::vector<Action> agents_actions;

        // agent_id = 0 ~ greddy-1 のエージェントは城壁貪欲を行う
        for (int agent_id = 0; agent_id < greedy; agent_id++) {
            // エージェントが未配置の場合は、ポイントの高いマスをランダムに一つを確定してそこに設置する
            if (turn_info.get_agent_pos(agent_id, ALLY) == Cell(-1, -1)) {
                const Cell& next_pos = search_high_score_pos_from_board(turn_info);
                agents_actions.push_back(Action('a', next_pos));
                agent_existed[next_pos.get_y()][next_pos.get_x()] = true;
            }
            //　エージェントがすでに設置されている場合は、その周囲八近傍のうち最もポイントの高いマスへ移動する
            else {
                const Cell next_pos = search_highest_score_pos_from_k8(
                    turn_info, turn_info.get_agent_pos(agent_id, ALLY));

                // 最もポイントの高いマスが敵の城壁だった場合は除去をする
                if (turn_info.get_cell_state(next_pos) == ENEMY_WALL) {
                    agents_actions.push_back(Action('e', next_pos));
                }
                else {
                    agents_actions.push_back(Action('w', next_pos));
                }
                agent_existed[next_pos.get_y()][next_pos.get_x()] = true;
            }
        }

        // agent_id = greedy ~ greedy + make_base までは陣地を作る動きをする
        for (int agent_id = greedy; agent_id < greedy + make_base; agent_id++) {
            const Cell& now_agent_pos = turn_info.get_agent_pos(agent_id, ALLY);

            // 各エージェントの囲む陣地の位置を決める
            const Cell& target_pos = search_candidate_for_base_pos(turn_info, now_agent_pos);

            // もしエージェントが未配置の場合は、target_posの八近傍のうち置けるマスに設置する
            // 万が一8近傍すべてが敵の城壁だった場合、下記の処理だと設置することができない。しかし、今回のソルバーではmake_baseは最初に設置する予定なのでおそらく問題ない
            if (now_agent_pos == Cell(-1, -1)) {
                for (int direction = 0; direction < kNextToEit.size(); direction++) {
                    const Cell& next_pos = target_pos + kNextToEit[direction];

                    if (turn_info.get_cell_state(next_pos) != ENEMY_WALL) {
                        agents_actions.push_back(Action('a', next_pos));
                        agent_existed[next_pos.get_y()][next_pos.get_x()] = true;
                        break;
                    }
                }
            }
            // すでに設置されている場合は、target_posを囲む移動、またはtarget_posへ向かう移動を行う
            else {
                std::cerr << "target_pos: " << target_pos << std::endl;
                const Cell& next_pos
                    = search_next_pos_to_surround_target_pos(turn_info, now_agent_pos, target_pos);

                if (next_pos == Cell(-1, -1))
                    agents_actions.push_back(Action('n', Cell()));
                else if (turn_info.get_cell_state(next_pos) == ENEMY_WALL)
                    agents_actions.push_back(Action('e', next_pos));
                else
                    agents_actions.push_back(Action('w', next_pos));
                agent_existed[next_pos.get_y()][next_pos.get_x()] = true;
            }
        }
        return agents_actions;
    }
}
#include "beam_search_and_yugeki.hpp"

#include <cstring>
#include <map>
#include <queue>


namespace beam_search_and_yugeki {
    constexpr int BEAM_DEPTH = 10;
    constexpr int BEAM_WIDTH = 50;

    // ビームサーチを行うエージェントの最大値。5つ以上だと一気に処理が遅くなるので無理
    constexpr int MAX_BEAM_SEARCH_AGENT_NUM = 4;

    // make_baseで貪欲を行う際にエージェントの行き先が被らないようにする二次元配列
    std::vector<std::vector<bool>> make_base_agents_existed(MAX_BOARD_SIZE,
                                                            std::vector<bool>(MAX_BOARD_SIZE));


    // 各エージェントの8近傍に対しての行動候補を列挙する関数
    // エージェントが未配置の場合は、8つの配置候補を列挙する。
    std::vector<std::vector<Action>> enumrate_next_action(const TurnInfo& turn_info) {
        std::vector<std::vector<Action>> candidate(turn_info.get_max_agent_num());

        for (int i = 0; i < turn_info.get_max_agent_num(); ++i) {
            Cell agent_pos = turn_info.get_agent_pos(i, ALLY);

            // 未配置の場合は、最もポイントの高い8つのマスを候補として列挙する
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
                    //if (turn_info.get_cell_state(next_cell) == ALLY_WALL) continue;

                    if (turn_info.get_cell_state(next_cell) == ENEMY_WALL) {
                        candidate[i].push_back(Action('e', next_cell));
                    }
                    else {
                        candidate[i].push_back(Action('w', next_cell));
                    }
                }
            }
        }

        return candidate;
    }

    // 各エージェントの行動の組み合わせをdo-whileで列挙する関数
    /* 各引数について
    第一引数：各エージェントのすべての行動候補
    第二引数：次の組み合わせを作成する際に、今どのエージェントをインクリメントしているのかを判断する変数
    第三引数：エージェントの数だけ定義した配列。各エージェントが今いくらインクリメントされたかの情報が入っている
    第四引数：組み合わせの結果がこの配列に入る
    */
    bool next_permuration(const std::vector<std::vector<Action>>& all_moves,
                          const int& change_agent,
                          std::vector<int>& move_ids,
                          std::vector<Action>& ret_moves) {
        if (change_agent == all_moves.size()) return false;

        int& next_move_id = ++move_ids[change_agent];
        const std::vector<Action>& target_moves = all_moves[change_agent];

        if (next_move_id == target_moves.size()) {
            next_move_id = 0;
            ret_moves[change_agent] = target_moves[next_move_id];
            return next_permuration(all_moves, change_agent + 1, move_ids, ret_moves);
        }
        else {
            ret_moves[change_agent] = target_moves[next_move_id];
            return true;
        }
    }


    // あるマスを囲んで陣地にした場合の城壁ポイント + 陣地ポイントの合計が最も高くなる位置を見つけてそれを返す関数
    // この関数では、一つのエージェントにつき一つの陣地を囲むようにしている。つまり、一つの陣地を複数人のエージェントが囲もうとしないようにしている
    Cell search_candidate_for_base_pos(const TurnInfo& turn_info, const Cell& now_agent_pos) {
        // 最もポイントの高くなる陣地候補を探す
        std::priority_queue<std::pair<int, Cell>> pq;

        for (int posY = 0; posY < turn_info.get_heigt(); posY++) {
            for (int posX = 0; posX < turn_info.get_width(); posX++) {
                // (posX, posY)の位置がボードの辺だった場合は陣地が作れないのでスルー
                if (posY == 0 || posY == turn_info.get_heigt() - 1 || posX == 0
                    || posX == turn_info.get_width() - 1)
                    continue;
                // すでにその場所にほかの陣地を作るエージェントがいる場合はスルー
                else if (make_base_agents_existed[posY][posX] == true)
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
                    if (make_base_agents_existed[next_pos.get_y()][next_pos.get_x()] == true) {
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
                    && make_base_agents_existed[ny][nx] == false && next != target_pos) {
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


    std::vector<Action> beam_search_and_yugeki_search(const TurnInfo& turn_info) {
        // ビームサーチの対象となるエージェントを4以下にする
        const int BEAM_SEARCH_AGENT_NUM
            = std::min(MAX_BEAM_SEARCH_AGENT_NUM, turn_info.get_max_agent_num());

        std::priority_queue<Node> now_state;
        now_state.push(Node(turn_info));
        // BeamSearch
        for (int turn = 0; turn < BEAM_DEPTH; turn++) {
            // 現在のビームサーチの深さが、最大ターンを超えたら探索を終了する
            if (turn_info.get_now_turn() + turn == turn_info.get_max_turn()) break;

            std::priority_queue<Node> next_state;

            for (int i = 0; i < BEAM_WIDTH; i++) {
                std::cout << "1" << std::endl;
                if (now_state.empty()) break;

                const Node now_node = now_state.top();
                now_state.pop();

                std::cout << "2" << std::endl;
                // next_permurationをdo-whileするための前処理
                std::vector<std::vector<Action>> agents_action
                    = enumrate_next_action(now_node.turn_info);
                std::cout << "2.5" << std::endl;

                agents_action.resize(BEAM_SEARCH_AGENT_NUM);
                std::vector<int> agents_id(BEAM_SEARCH_AGENT_NUM);
                std::vector<Action> next_agents_action(BEAM_SEARCH_AGENT_NUM);

                std::cout << "3" << std::endl;
                for (int i = 0; i < BEAM_SEARCH_AGENT_NUM; ++i)
                    next_agents_action[i] = agents_action[i].front();

                // do-whileで、enumrate_next_actionで列挙した行動候補の組み合わせをすべて試す
                do {
                    if (now_node.turn_info.has_conflict(next_agents_action) == true) continue;

                    const TurnInfo next_turn_info
                        = now_node.turn_info.transition(next_agents_action);

                    Node next_node(now_node.point
                                       + calc_evalation(now_node.turn_info, next_agents_action),
                                   next_turn_info);

                    // 最初のターンに移動した方向を保存しておく
                    if (turn == 0)
                        next_node.first_move_pos = next_agents_action;
                    else
                        next_node.first_move_pos = now_node.first_move_pos;

                    next_state.push(next_node);

                std::cout << "4" << std::endl;
                } while (next_permuration(agents_action, 0, agents_id, next_agents_action));
            }

            now_state = next_state;
        }

        std::vector<Action> agents_action = now_state.top().first_move_pos;

        // ビームサーチ以外のエージェントは、make_baseを行う
        for (int agent_id = BEAM_SEARCH_AGENT_NUM; agent_id < turn_info.get_max_agent_num();
             agent_id++) {
            const Cell& now_agent_pos = turn_info.get_agent_pos(agent_id, ALLY);

            // 各エージェントの囲む陣地の位置を決める
            const Cell& target_pos = search_candidate_for_base_pos(turn_info, now_agent_pos);

            // もしエージェントが未配置の場合は、target_posの八近傍のうち置けるマスに設置する
            // 万が一8近傍すべてが敵の城壁だった場合、下記の処理だと設置することができない。しかし、今回のソルバーではmake_baseは最初に設置する予定なのでおそらく問題ない
            if (now_agent_pos == Cell(-1, -1)) {
                for (int direction = 0; direction < kNextToEit.size(); direction++) {
                    const Cell& next_pos = target_pos + kNextToEit[direction];

                    if (turn_info.get_cell_state(next_pos) != ENEMY_WALL) {
                        agents_action.push_back(Action('a', next_pos));
                        make_base_agents_existed[next_pos.get_y()][next_pos.get_x()] = true;
                        break;
                    }
                }
            }
            // すでに設置されている場合は、target_posを囲む移動、またはtarget_posへ向かう移動を行う
            else {
                const Cell& next_pos
                    = search_next_pos_to_surround_target_pos(turn_info, now_agent_pos, target_pos);

                if (next_pos == Cell(-1, -1))
                    agents_action.push_back(Action('n', Cell()));
                else if (turn_info.get_cell_state(next_pos) == ENEMY_WALL)
                    agents_action.push_back(Action('e', next_pos));
                else
                    agents_action.push_back(Action('w', next_pos));
                make_base_agents_existed[next_pos.get_y()][next_pos.get_x()] = true;
            }
        }


        return agents_action;
    }
}
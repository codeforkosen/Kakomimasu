#include "calculation.hpp"

#include <queue>
#include <set>

// calc_base_point関数内でBFSを行う際に用いる関数
void TurnInfo::BFS_for_search_base(const std::vector<std::vector<int>> next_board_state,
                                   std::vector<std::vector<std::vector<int>>>& board_depth) const {
    std::vector<std::vector<std::vector<bool>>> searched(
        2, std::vector<std::vector<bool>>(height, std::vector<bool>(width)));

    for (int team = 0; team <= 1; team++) {
        std::vector<std::vector<int>> eraseed_enemy_board_state
            = erase_enemy_state(next_board_state, team);

        for (int posY = 0; posY < height; posY++) {
            for (int posX = 0; posX < width; posX++) {
                // 探索済みだったらスキップ
                if (searched[team][posY][posX] == true) continue;

                // (posY, posX)が城壁だったら値を更新してスキップ
                if (eraseed_enemy_board_state[posY][posX] == ALLY_WALL
                    || eraseed_enemy_board_state[posY][posX] == ENEMY_WALL) {
                    searched[team][posY][posX] = true;
                    board_depth[team][posY][posX] = -2;
                    continue;
                }

                std::set<Cell> searched_pos;
                std::queue<Cell> que;
                bool is_base = true;

                searched[team][posY][posX] = true;
                que.push(Cell(posY, posX));
                searched_pos.insert(Cell(posY, posX));

                // BFS
                while (!que.empty()) {
                    const Cell now = que.front();
                    que.pop();

                    for (int direction = 0; direction < kNextToEit.size(); direction++) {
                        const Cell next = now + kNextToEit[direction];

                        const int ny = next.get_y();
                        const int nx = next.get_x();

                        // 次の場所が盤面の外だった場合は、フラグを折ってスキップ
                        if (is_outside(next) == true) {
                            is_base = false;
                            continue;
                        }
                        // 探索済みだったらスキップ
                        else if (searched[team][ny][nx] == true)
                            continue;
                        // (posY, posX)が城壁だったら値を更新してスキップ
                        else if (eraseed_enemy_board_state[ny][nx] == ALLY_WALL
                                 || eraseed_enemy_board_state[ny][nx] == ENEMY_WALL) {
                            board_depth[team][ny][nx] = -2;
                            continue;
                        }

                        searched[team][ny][nx] = true;
                        searched_pos.insert(next);

                        board_depth[team][ny][nx] = board_depth[team][now.get_y()][now.get_x()] + 1;
                        que.push(next);
                    }
                }

                // 探索した範囲が陣地でなかった場合、いままで探索してきたセルの深さを-1にする。
                if (is_base == false) {
                    for (auto itr = searched_pos.begin(); itr != searched_pos.end(); itr++) {
                        const Cell pos = *itr;
                        const int y = pos.get_y();
                        const int x = pos.get_x();

                        board_depth[team][y][x] = -1;
                    }
                }
            }
        }
    }
}

int TurnInfo::calc_wall_score(const std::vector<Action>& actions) const {
    int wall_point = 0;

    std::vector<std::vector<int>> next_board_state(height, std::vector<int>(width));
    next_board_state = board_state;

    for (const Action action : actions) {
        const int b = action.get_behavior();
        const Cell& t = action.get_target();

        // 募集要項にはエージェントを設置したマスに城壁が作られるか書いていませんでしたが、たぶん作られると思います。質問の返答次第です。
        if (b == 'a' || b == 'w') {
            next_board_state[t.get_y()][t.get_x()] = ALLY_WALL;
        }
    }

    for (int posY = 0; posY < height; posY++) {
        for (int posX = 0; posX < width; posX++) {
            if (board_state[posY][posX] == ALLY_WALL)
                wall_point += get_cell_point(Cell(posY, posX));
        }
    }

    return wall_point;
}

int TurnInfo::calc_base_score(const std::vector<Action>& actions) const {
    int base_point = 0;

    // 各エージェントの行動を反映したボードを作る
    std::vector<std::vector<int>> next_board_state(height, std::vector<int>(width));

    next_board_state = board_state;

    for (const Action action : actions) {
        const int b = action.get_behavior();
        const Cell& t = action.get_target();

        if (b == 'p' || b == 'w') {
            next_board_state[t.get_y()][t.get_x()] = ALLY_WALL;
        }
        else if (b == 'e') {
            next_board_state[t.get_y()][t.get_x()] = NONE;
        }
    }

    // 陣地判定に関する詳しいアルゴリズムはREADMEを読んでください

    // BFSで得た距離を入れる配列
    // 分かりやすくするため生配列で表現すると board_depth[2][height][width] となる。0は自チーム側、1は敵チームを表す
    std::vector<std::vector<std::vector<int>>> board_depth(
        2, std::vector<std::vector<int>>(height, std::vector<int>(width)));

    BFS_for_search_base(next_board_state, board_depth);

    // 陣地ポイントの計算。-2は城壁を、-1は陣地をそれぞれ表している。
    for (int posY = 0; posY < height; posY++) {
        for (int posX = 0; posX < width; posX++) {
            int ally = board_depth[0][posY][posX];
            int enemy = board_depth[1][posY][posX];

            if (get_cell_state(Cell(posY, posX)) == ALLY_BASE)
                base_point += abs(get_cell_point(Cell(posY, posX)));
            else if (ally == -2)
                continue;
            else if (ally != -1 && enemy == -1)
                base_point += abs(get_cell_point(Cell(posY, posX)));
            else if (ally != -1 && enemy != -1)
                if (ally < enemy) base_point += abs(get_cell_point(Cell(posY, posX)));
        }
    }
    return base_point;
}

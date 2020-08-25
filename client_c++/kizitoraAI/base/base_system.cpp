#include "base_system.hpp"

#include <algorithm>
#include <iostream>
#include <queue>

bool TurnInfo::input_game_data(int h, 
                               int w, 
                               int a, 
                               int max_t, 
                               int s, 
                               std::vector<std::vector<int>> sb, 
                               int now_t, 
                               std::vector<std::vector<int>> bs, 
                               std::vector<std::vector<std::pair<int, int>>> agent_positions) {
    height = h;
    width = w;
    max_agent_num = a;
    max_turn = max_t;
    time_limist_ms = s;
    now_turn = now_t;
    score_board = sb;
    board_state = bs;
    ally_agents_pos.resize(max_agent_num);
    enemy_agents_pos.resize(max_agent_num);
    
    if (now_turn > max_turn) return false;

    ally_agent_num_on_board = 0;
    enemy_agent_num_on_board = 0;
    for (int team = 0; team <= 1; team++) {
        for (int i = 0; i < max_agent_num; i++) {
            int x = agent_positions[team][i].first;
            int y = agent_positions[team][i].second;

            // (y, x)が(-1, -1)出なかった場合はボードに配置されているので、カウントする
            if (y != -1 && x != -1) {
                if (team == 0)
                    ally_agent_num_on_board++;
                else
                    enemy_agent_num_on_board++;
            }

            if (team == 0)
                ally_agents_pos[i] = Cell(y, x);
            else
                enemy_agents_pos[i] = Cell(y, x);
        }
    }
    return true;
}

bool TurnInfo::input_game_data() {
    std::cin >> height >> width >> max_agent_num >> max_turn >> time_limist_ms;

    // 最初のターンだと各vector配列は空のため、resizeする必要がある
    if (score_board.empty()) {
        score_board.resize(height);
        for (int i = 0; i < height; ++i)
            score_board[i].resize(width);

        board_state.resize(height);
        for (int i = 0; i < height; ++i) {
            board_state[i].resize(width);
        }

        ally_agents_pos.resize(max_agent_num);
        enemy_agents_pos.resize(max_agent_num);
    }

    for (int posY = 0; posY < height; posY++) {
        for (int posX = 0; posX < width; posX++) {
            std::cin >> score_board[posY][posX];
        }
    }

    std::cin >> now_turn;
    if (now_turn > max_turn) return false;

    for (int posY = 0; posY < height; posY++) {
        for (int posX = 0; posX < width; posX++) {
            std::cin >> board_state[posY][posX];
        }
    }

    ally_agent_num_on_board = 0;
    enemy_agent_num_on_board = 0;
    for (int team = 0; team <= 1; team++) {
        for (int i = 0; i < max_agent_num; i++) {
            int y, x;
            std::cin >> y >> x;

            // (y, x)が(-1, -1)出なかった場合はボードに配置されているので、カウントする
            if (y != -1 && x != -1) {
                if (team == 0)
                    ally_agent_num_on_board++;
                else
                    enemy_agent_num_on_board++;
            }

            if (team == 0)
                ally_agents_pos[i] = Cell(y, x);
            else
                enemy_agents_pos[i] = Cell(y, x);
        }
    }
    return true;
}

// ボード上のposの位置にエージェントが存在するかどうか確かめる
bool TurnInfo::agent_existed(const Cell& pos) const {
    auto result = find(ally_agents_pos.begin(), ally_agents_pos.end(), pos);

    // もし自チーム側で見つからなかった場合は、敵チームの位置も調べる
    if (result == ally_agents_pos.end())
        result = find(enemy_agents_pos.begin(), enemy_agents_pos.end(), pos);

    // 敵チームでも見つからなかった場合は、そのマスにエージェントが存在しない。
    if (result == enemy_agents_pos.end())
        return false;
    else
        return true;
}


bool TurnInfo::is_surrounded(const Cell& pos) const {
    std::vector<std::vector<bool>> checked(height, std::vector<bool>(width));
    std::queue<Cell> que;

    checked[pos.get_y()][pos.get_x()] = true;
    que.push(pos);

    while (!que.empty()) {
        const Cell now = que.front();
        que.pop();

        for (int direction = 0; direction < kNextToEit.size(); direction++) {
            const Cell next = now + kNextToEit[direction];
            int ny = next.get_y(), nx = next.get_x();

            if (is_outside(next) == true) return false;

            if (board_state[ny][nx] == ALLY_WALL || checked[ny][nx] == true) continue;

            checked[ny][nx] = true;
            que.push(next);
        }
    }
    return true;
}

TurnInfo TurnInfo::transition(const std::vector<Action>& agents_action) const {
    TurnInfo next_turn_info = *this;

    for (int agent_id = 0; agent_id < agents_action.size(); ++agent_id) {
        const char b = agents_action[agent_id].get_behavior();
        const Cell pos = agents_action[agent_id].get_target();

        if (b == 'e') {
            if (is_surrounded(pos) == true)
                next_turn_info.board_state[pos.get_y()][pos.get_x()] = ALLY_BASE;
            else
                next_turn_info.board_state[pos.get_y()][pos.get_x()] = NONE;
        }
        else if (b == 'w') {
            next_turn_info.board_state[pos.get_y()][pos.get_x()] = ALLY_WALL;
            next_turn_info.ally_agents_pos[agent_id] = pos;
        }
        else if (b == 'a') {
            next_turn_info.board_state[pos.get_y()][pos.get_x()] = ALLY_WALL;
            next_turn_info.ally_agents_pos[agent_id] = pos;
        }
    }

    return next_turn_info;
}

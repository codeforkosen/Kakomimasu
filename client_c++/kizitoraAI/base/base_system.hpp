#pragma once

#include <array>
#include <iostream>
#include <vector>

// 募集要項より、競技ボードは最大で24×24です
constexpr int MAX_BOARD_SIZE = 24;

enum team { ALLY, ENEMY };

enum cell_state {
    NONE,
    ALLY_BASE, // ここでのbaseとは、陣地という意味です
    ALLY_WALL,
    ENEMY_BASE,
    ENEMY_WALL
};

// ボード上の位置情報を管理するクラス
class Cell {
    int y;
    int x;

public:
    Cell() : y(-1), x(-1){};

    Cell(const int y, const int x) : y(y), x(x){};

    int get_x() const { return x; }
    int get_y() const { return y; }

    Cell operator+(const Cell& another) const { return Cell(y + another.y, x + another.x); }
    Cell operator-(const Cell& another) const { return Cell(y - another.y, x - another.x); }
    bool operator==(const Cell& another) const { return y == another.y && x == another.x; }
    bool operator!=(const Cell& another) const { return y != another.y || x != another.x; }
    bool operator>(const Cell& right) const { return y == right.y ? x > right.x : y > right.y; }
    bool operator<(const Cell& right) const { return y == right.y ? x < right.x : y < right.y; }
    bool operator<=(const Cell& right) const { return y == right.y ? x <= right.x : y <= right.y; }

    friend std::ostream& operator<<(std::ostream& s, const Cell& pos) {
        return s << pos.y << " " << pos.x;
    }
};

// 各エージェントの行動情報を管理するクラス
class Action {
    // 行動の種類(a, n, w, e のいずれかが入る)
    // a → 設置, n → 停留, w → 移動, e → 除去
    char behavior;

    // エージェントの行動先
    Cell target;

public:
    Action(const char b, const Cell& t) : behavior(b), target(t){};
    Action() : behavior('n'), target(-1, -1){};

    // ゲッタ
    char get_behavior() const { return behavior; }
    Cell get_target() const { return target; }

    // 出力
    friend std::ostream& operator<<(std::ostream& s, const Action& x) {
        // visualizer/READMEのソルバの入出力に則り、停留の場合は行動の種類のみを、それ以外では行動先も出力する
        if (x.behavior == 'n')
            s << x.behavior;
        else
            s << x.behavior << " " << x.target;
        return s;
    }
};

// ターンごとのゲームの状態を管理するクラス
class TurnInfo {
    // 基本設定(固定値)
    int height;
    int width;
    int max_agent_num;
    int max_turn;
    int time_limist_ms;

    // ターンごとに変化する値
    std::vector<std::vector<int>> score_board;
    int now_turn;
    std::vector<std::vector<int>> board_state;
    std::vector<Cell> ally_agents_pos;
    std::vector<Cell> enemy_agents_pos;

    // その他
    int ally_agent_num_on_board;
    int enemy_agent_num_on_board;

public:
    // コンストラクタ
    TurnInfo(){};

    // ターンごとに更新されるデータを受け取る関数
    bool input_game_data();
    bool input_game_data(int height, 
                         int width, 
                         int max_agent_num, 
                         int max_turn, 
                         int time_limist_ms, 
                         std::vector<std::vector<int>> score_board, 
                         int now_turn, 
                         std::vector<std::vector<int>> board_state, 
                         std::vector<std::vector<std::pair<int, int>>> agent_positions);

    // 基本設定を取得するゲッタ
    int get_heigt() const { return height; }
    int get_width() const { return width; }
    int get_max_turn() const { return max_turn; }
    int get_now_turn() const { return now_turn; }

    // 各エージェントの情報を取得するゲッタ
    int get_max_agent_num() const { return max_agent_num; }
    int get_agent_num_on_board() const { return ally_agent_num_on_board; }
    bool agent_existed(const Cell& pos) const;
    Cell get_agent_pos(const int i, const int team) const {
        if (team == ALLY)
            return ally_agents_pos.at(i);
        else
            return enemy_agents_pos.at(i);
    }
    int get_non_deployed_agent_num() const {
        return std::max(max_agent_num - ally_agent_num_on_board, 0);
    }

    // セルの情報を取得するゲッタ
    int get_cell_state(const Cell& pos) const { return board_state[pos.get_y()][pos.get_x()]; }
    int get_cell_point(const Cell& pos) const { return score_board[pos.get_y()][pos.get_x()]; }

    // 遷移判定
    bool has_conflict(const std::vector<Action>& actions) const;

    // スコア計算
    int calc_wall_score(const std::vector<Action>& actions) const;
    int calc_base_score(const std::vector<Action>& actions) const;
    void BFS_for_search_base(const std::vector<std::vector<int>> next_board_state,
                             std::vector<std::vector<std::vector<int>>>& board_depth) const;
    bool is_wall_linked(const Cell& pos,
                        const std::vector<std::vector<int>> next_board_state) const;

    // 遷移
    TurnInfo transition(const std::vector<Action>& agents_action) const;
    bool is_surrounded(const Cell& pos) const;

    // util
    bool is_outside(const Cell& pos) const {
        const int y = pos.get_y(), x = pos.get_x();
        return y < 0 || y >= height || x < 0 || x >= width;
    }
};

// 八近傍
// ↑を0として、時計回り
const std::array<Cell, 8> kNextToEit = {Cell(-1, 0),
                                        Cell(-1, 1),
                                        Cell(0, 1),
                                        Cell(1, 1),
                                        Cell(1, 0),
                                        Cell(1, -1),
                                        Cell(0, -1),
                                        Cell(-1, -1)};

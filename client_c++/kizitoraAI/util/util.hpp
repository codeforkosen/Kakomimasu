#pragma once
#include <chrono>
#include <vector>

// 時間計測を行うクラス
// Timerクラスの変数を宣言した場所からタイマーがスタートする
class Timer {
private:
    std::chrono::system_clock::time_point start, end;

public:
    Timer() { stsrt(); };

    void stsrt() { start = std::chrono::system_clock::now(); };
    double elapsed_ms() {
        end = std::chrono::system_clock::now();
        return std::chrono::duration_cast<std::chrono::milliseconds>(end - start).count();
    }
};


// 相手側のBASEとWALLをNONEに置き換える
std::vector<std::vector<int>> erase_enemy_state(const std::vector<std::vector<int>> board_state,
                                                const int team_id);

#include "util.hpp"

#include "../base/base_system.hpp"

std::vector<std::vector<int>> erase_enemy_state(const std::vector<std::vector<int>> board_state,
                                                const int team_id) {
    const int height = board_state.size();
    const int width = board_state.front().size();
    std::vector<std::vector<int>> eraseed_enemy_board_state = board_state;

    for (int posY = 0; posY < height; posY++) {
        for (int posX = 0; posX < width; posX++) {
            if (team_id == 0) {
                if (board_state[posY][posX] == ENEMY_BASE
                    || board_state[posY][posX] == ENEMY_WALL) {
                    eraseed_enemy_board_state[posY][posX] = NONE;
                }
            }
            else {
                if (board_state[posY][posX] == ALLY_BASE || board_state[posY][posX] == ALLY_WALL) {
                    eraseed_enemy_board_state[posY][posX] = NONE;
                }
            }
        }
    }

    return eraseed_enemy_board_state;
}

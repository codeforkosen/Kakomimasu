#pragma once
#include "../../action/action.hpp"

#include <vector>


namespace grouping_and_greedy {
    // セルの各種情報をまとめたクラス
    class InfoAboutCell {
    public:
        int point;
        int state;
        Cell position;

        InfoAboutCell(const int p, const int s, const Cell pos)
            : point(p),
              state(s),
              position(pos){};

        // ポイントの大小で比較する
        friend bool operator<(const InfoAboutCell& lhs, const InfoAboutCell& rhs) {
            return lhs.point < rhs.point;
        }
    };

    Action get_random_action(const std::vector<InfoAboutCell>& k8);

    std::vector<InfoAboutCell> get_near_8cells_info(const TurnInfo& turn_info, const Cell& pos);

    std::vector<Action> grouping_and_greedy_search(const TurnInfo& turn_info);
}

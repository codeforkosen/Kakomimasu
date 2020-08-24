#pragma once
#include "../../action/action.hpp"
#include "../../base/base_system.hpp"
#include "../../calculation/calculation.hpp"
#include "../../util/util.hpp"

namespace hill_climbing {
    // セルのポイントとセルの位置をまとめたクラス
    class PointAndCellPos {
        int point;
        Cell position;

    public:
        PointAndCellPos(int p, Cell pos) : point(p), position(pos){};

        Cell get_position() const { return position; }

        friend bool operator<(const PointAndCellPos& l, const PointAndCellPos& r) {
            return l.point < r.point;
        }
    };


    // 山登り法を用いて最もスコアが高くなる手を探索して返す関数
    std::vector<Action> hill_climbing_search(TurnInfo& turn_info);
}
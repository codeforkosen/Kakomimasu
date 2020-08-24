#include "evalation.hpp"

namespace beam_search_and_yugeki {
    int calc_evalation(const TurnInfo& turn_info, const std::vector<Action>& agents_action) {
        // 現時点ではとりあえず擁壁ポイントだけ評価する
        //return turn_info.calc_base_score(agents_action) + turn_info.calc_wall_score(agents_action);
        return turn_info.calc_wall_score(agents_action);
    }
}
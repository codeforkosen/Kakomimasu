#include "../../base/base_system.hpp"

namespace maximize_wall_point_and_yugeki {
    struct BFS_state {
        Cell now;
        Cell root;

        BFS_state(const Cell& n, const Cell& r) : now(n), root(r){};
    };


    // ポイントの高いマスの候補をgreedyを行うエージェント×2ほどとり、その中からランダムに置くマスを決める関数
    // 候補を多めにとるのは、エージェントが一つの場所に固まりにくいようにするため
    Cell search_high_score_pos_from_board(const TurnInfo& turn_info);

    // 第二引数posの周囲八近傍を見て最もポイントの高いマスを返す関数
    Cell search_highest_score_pos_from_k8(const TurnInfo& turn_info, const Cell& pos);

    // あるマスを囲んで陣地にした場合の城壁ポイント + 陣地ポイントの合計が最も高くなる位置を見つけてそれを返す関数
    // この関数では、一つのエージェントにつき一つの陣地を囲むようにしている。つまり、一つの陣地を複数人のエージェントが囲もうとしないようにしている
    Cell search_candidate_for_base_pos(const TurnInfo& turn_info, const Cell& now_agent_pos);

    // 目標の位置の周囲を囲むための次に移動すべきマスを返す関数
    Cell search_next_pos_to_surround_target_pos(const TurnInfo& turn_info,
                                                const Cell& now_agent_pos,
                                                const Cell& target_pos);

    std::vector<Action> maximize_wall_point_and_yugeki_search(const TurnInfo& turn_info);
}
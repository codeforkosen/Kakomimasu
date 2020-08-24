#include "../../action/action.hpp"
#include "../../base/base_system.hpp"
#include "evalation.hpp"

namespace beam_search_and_yugeki {
    struct Node {
        int point;
        TurnInfo turn_info;
        std::vector<Action> first_move_pos;

        Node(const TurnInfo& info)
            : point(0),
              turn_info(info),
              first_move_pos(std::vector<Action>()){};
        Node(const int p, const TurnInfo& info) : point(p), turn_info(info){};

        bool operator<(const Node& rhs) const { return point < rhs.point; }
    };

    struct BFS_state {
        Cell now;
        Cell root;

        BFS_state(const Cell& n, const Cell& r) : now(n), root(r){};
    };

    // 各エージェントの8近傍に対しての行動候補を列挙する関数
    // エージェントが未配置の場合は、8つの配置候補を列挙する。
    std::vector<std::vector<Action>> enumrate_next_action(const TurnInfo& turn_info);

    // 各エージェントの行動の組み合わせをdo-whileで列挙する関数
    bool next_permuration(const std::vector<std::vector<Action>>& all_moves,
                          const int& change_agent,
                          std::vector<int>& move_ids,
                          std::vector<Action>& ret_moves);

    // あるマスを囲んで陣地にした場合の城壁ポイント + 陣地ポイントの合計が最も高くなる位置を見つけてそれを返す関数
    // この関数では、一つのエージェントにつき一つの陣地を囲むようにしている。つまり、一つの陣地を複数人のエージェントが囲もうとしないようにしている
    Cell search_candidate_for_base_pos(const TurnInfo& turn_info, const Cell& now_agent_pos);

    // 目標の位置の周囲を囲むための次に移動すべきマスを返す関数
    Cell search_next_pos_to_surround_target_pos(const TurnInfo& turn_info,
                                                const Cell& now_agent_pos,
                                                const Cell& target_pos);

    std::vector<Action> beam_search_and_yugeki_search(const TurnInfo& turn_info);
}
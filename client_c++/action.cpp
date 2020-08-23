#include <vector>
#include "client_util.hpp"
using namespace std;

class data_to_input_in_solver {
public:
    int height, width, each_agent_num, max_turn, max_time_limit_ms, now_turn;
    vector<vector<int>> points, tile;
    vector<pair<int, int>> agent_positions;

    data_to_input_in_solver(int h, int w, int a, int max_t, int s, vector<vector<int>> p, int now_t, vector<vector<int>> f, vector<pair<int, int>> ap) {
        height = h;
        width = w;
        each_agent_num = a;
        max_turn = max_t;
        points = p;
        now_turn = now_t;
        tile = f;
        agent_positions = ap;
    }
};

int main() {
    const string screenName = "kizitora";
    const string name = "kizitora";
    const string password = name + "-pw";
    const string spec = "AI";
    
    nlohmann::json user_info = userShow(name);
    // 指定した名前のユーザーがサーバーにいない場合は、ユーザー情報を作って登録する
    if(user_info.dump() == "{\"error\":\"Can not find user.\"}") {
        user_info = userRegist(screenName, name, password);
    }
    
    nlohmann::json match_info = match(user_info["id"], password, spec);
    const string token = match_info["accessToken"];
    const string gameId = match_info["gameId"];

    nlohmann::json game_info;
    do {
        game_info = getGameInfo(gameId);
        sleep_ms(100);
    } while (game_info["gaming"] == false);

    
}

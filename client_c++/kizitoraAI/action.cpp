#include <vector>
#include "client_util.hpp"
using namespace std;

class data_to_input_in_solver {
public:
    int height, width, each_agent_num, max_turn, max_time_limit_ms, now_turn;
    vector<vector<int>> points, tile;
    vector<vector<pair<int, int>>> agent_positions;

    data_to_input_in_solver(int h, int w, int a, int max_t, int s, vector<vector<int>> p, int now_t, vector<vector<int>> f, vector<vector<pair<int, int>>> ap) {
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

data_to_input_in_solver match_info_format_to_solver_input_format(const nlohmann::json match_info) {
    int h = match_info["board"]["height"];
    int w = match_info["board"]["width"];
    int a = match_info["board"]["nAgent"];
    int s = (int)match_info["nextTurnUnixTime"] - (int)match_info["startedAtUnixTime"];
    int max_t = match_info["totalTurn"];
    
    // 盤面の得点情報が h * w の長さの一次元配列で並べられているので、縦h、横wの二次元配列に収まるように変換する
    vector<vector<int>> p(h, vector<int>(w));
    int i = 0, j = 0;
    for (int k = 0; k < h * w; k++) {
        p[i][j] = match_info["board"]["points"][k];

        if(j == (w - 1)) i++, j = 0;
        else j++;
    }

    int now_t = match_info["turn"];

    // タイルの状態を一次元配列から二次元配列に変換し、タイルの状態を表す値もソルバーのフォーマットに変更する
    i = 0, j = 0;
    vector<vector<int>> f(h, vector<int>(w));
    for (int k = 0; k < h * w; k++) {
        int l = match_info["tiled"][k][0];
        int r = match_info["tiled"][k][1];

        if(r == -1) f[i][j] = 0;
        else if (l == 0 &&  r == 0) f[i][j] = 1;
        else if (l == 1 &&  r == 0) f[i][j] = 2;
        else if (l == 0 &&  r == 1) f[i][j] = 3;
        else if (l == 1 &&  r == 1) f[i][j] = 4;

        if(j == (w - 1)) i++, j = 0;
        else j++;
    }

    vector<vector<pair<int, int>>> ap(2, vector<pair<int, int>>(a));
    for (int team = 0; team <= 1; team++) {
        for (int i = 0; i < a; ++i) {
            //cout << match_info["players"][team]["agents"][i]["x"] << " " << match_info["players"][team]["agents"][i]["y"] << endl;
            ap[team][i] = make_pair(match_info["players"][team]["agents"][i]["x"], match_info["players"][team]["agents"][i]["y"]);
        }
    }

    data_to_input_in_solver res(h, w, a, s, max_t, p, now_t, f, ap);
    return res;
}

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
    
    data_to_input_in_solver input_datas = match_info_format_to_solver_input_format(getGameInfo(gameId));
}

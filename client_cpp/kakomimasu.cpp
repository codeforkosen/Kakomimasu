#include "kakomimasu.h"

string host = "localhost:8880/api";
void setHost(string s) {
    host = s;
}

static size_t callbackWrite(char *ptr, size_t size, size_t nmemb, string *stream) {
    int dataLength = size * nmemb;
    stream->append(ptr, dataLength);
    return dataLength;
}

string curlGet(string req, string token = "") {
    CURL *curl;
    CURLcode res;

    curl = curl_easy_init();
    string chunk;

    string url_tmp = host + req;
    const char *url = url_tmp.c_str();

    if (curl) {
        if (token != "") {
            token = "Authorization:" + token;
            struct curl_slist *headers = NULL;
            headers = curl_slist_append(headers, token.c_str());
        }
        curl_easy_setopt(curl, CURLOPT_TIMEOUT, 5);
        curl_easy_setopt(curl, CURLOPT_URL, url);
        curl_easy_setopt(curl, CURLOPT_WRITEFUNCTION, callbackWrite);
        curl_easy_setopt(curl, CURLOPT_WRITEDATA, &chunk);
        res = curl_easy_perform(curl);
        curl_easy_cleanup(curl);
    }

    if (res != CURLE_OK) {
        cerr << "curlエラー" << endl;
        exit(1);
    }
    return chunk;
}

string curlPost(string req, string post_data, string token = "") {
    CURL *curl;
    CURLcode res;

    curl = curl_easy_init();
    string chunk;

    string url_tmp = host + req;
    const char *url = url_tmp.c_str();

    if (curl) {
        struct curl_slist *headers = NULL;
        headers = curl_slist_append(headers, "Content-Type: application/json");
        if (token != "") {
            token = "Authorization:" + token;
            headers = curl_slist_append(headers, token.c_str());
        }

        curl_easy_setopt(curl, CURLOPT_TIMEOUT, 5);
        curl_easy_setopt(curl, CURLOPT_URL, url);
        curl_easy_setopt(curl, CURLOPT_POST, 1);
        curl_easy_setopt(curl, CURLOPT_POSTFIELDS, post_data.c_str());
        curl_easy_setopt(curl, CURLOPT_POSTFIELDSIZE, post_data.size());
        curl_easy_setopt(curl, CURLOPT_HTTPHEADER, headers);
        curl_easy_setopt(curl, CURLOPT_WRITEFUNCTION, callbackWrite);
        curl_easy_setopt(curl, CURLOPT_WRITEDATA, &chunk);
        res = curl_easy_perform(curl);
        curl_easy_cleanup(curl);

        curl_slist_free_all(headers);
    }

    if (res != CURLE_OK) {
        cerr << "curlエラー" << endl;
        exit(1);
    }
    return chunk;
}

void userRegist(string screenName, string name, string password) {
    picojson::object send_obj;
    send_obj.emplace(make_pair("screenName", screenName));
    send_obj.emplace(make_pair("name", name));
    send_obj.emplace(make_pair("password", password));

    string res = curlPost("/users/regist", picojson::value(send_obj).serialize());
}

string userShow(string identifier) {
    string res = curlGet("/users/show/" + identifier);
    cout << res << endl;
    return res;
}

KakomimasuClient::KakomimasuClient(string id, string name, string spec, string password) {
    string res = userShow(id);
    picojson::value val;
    picojson::parse(val, res);
    picojson::object obj = val.get<picojson::object>();

    if (!obj["error"].is<picojson::null>()) {
        userRegist(name, id, password);
        cout << "ユーザー登録しました" << endl;
    }
    m_name = id;
    m_password = password;
}

void KakomimasuClient::getGameInfo() {
    string res = curlGet("/match/" + m_game_id);

    picojson::value val;
    picojson::parse(val, res);
    picojson::object obj = val.get<picojson::object>();

    m_gameInfo = obj;
    if (!m_gameInfo["board"].is<picojson::null>())
        m_board = m_gameInfo["board"].get<picojson::object>();
}

void KakomimasuClient::waitMatching() {
    picojson::object send_obj;
    send_obj.emplace(make_pair("name", m_name));
    send_obj.emplace(make_pair("password", m_password));

    string res = curlPost("/match", picojson::value(send_obj).serialize());

    picojson::value val;
    picojson::parse(val, res);
    picojson::object obj = val.get<picojson::object>();

    //cout << res << endl;
    m_token = obj["accessToken"].get<string>();
    m_game_id = obj["gameId"].get<string>();
    m_player_no = obj["index"].get<double>();

    do {
        getGameInfo();
        this_thread::sleep_for(chrono::milliseconds(500));
    } while (m_gameInfo["board"].is<picojson::null>());
    cout << "maching!" << endl;
}

int KakomimasuClient::getWidth() {
    return (int)m_board["width"].get<double>();
};

int KakomimasuClient::getHeight() {
    return (int)m_board["height"].get<double>();
};

int KakomimasuClient::getAgentCount() {
    return (int)m_board["nAgent"].get<double>();
};

int KakomimasuClient::getPlayerNumber() {
    return m_player_no;
};

int KakomimasuClient::getNextTurnUnixTime() {
    return (int)m_gameInfo["nextTurnUnixTime"].get<double>();
};

int KakomimasuClient::getTurn() {
    return (int)m_gameInfo["turn"].get<double>();
};

int KakomimasuClient::getTotalTurn() {
    return (int)m_gameInfo["totalTurn"].get<double>();
};

vector<vector<int>> KakomimasuClient::getPoints() {
    int height = getHeight();
    int width = getWidth();
    vector<vector<int>> res(height, vector<int>(width));
    picojson::array ary = m_board["points"].get<picojson::array>();
    int i = 0, j = 0;
    for (auto &val : ary) {
        res[i][j] = val.get<double>();

        j++;
        if (j == width) j = 0, i++;
    }

    return res;
}

vector<vector<Tile>> KakomimasuClient::getFiled() {
    int height = getHeight();
    int width = getWidth();
    vector<vector<Tile>> res(height, vector<Tile>(width));
    picojson::array ary = m_board["points"].get<picojson::array>();
    int i = 0, j = 0;
    for (auto &val : ary) {
        res[i][j].point = val.get<double>();

        j++;
        if (j == width) j = 0, i++;
    }

    i = j = 0;
    ary = m_gameInfo["tiled"].get<picojson::array>();
    for (auto &val : ary) {
        int type, pid;
        sscanf(val.serialize().c_str(), "[%d %d]", &type, &pid);
        res[i][j].type = type;
        res[i][j].pid = pid;

        j++;
        if (j == width) j = 0, i++;
    }

    return res;
}

vector<Agent> KakomimasuClient::getAgent() {
    vector<Agent> res;
    picojson::array player = m_gameInfo["players"].get<picojson::array>();
    picojson::object obj = player[m_player_no].get<picojson::object>();
    picojson::array ary = obj["agents"].get<picojson::array>();
    for (int i = 0; i < ary.size(); i++) {
        picojson::object pos = ary[i].get<picojson::object>();
        res.push_back({(int)pos["x"].get<double>(), (int)pos["y"].get<double>()});
    }
    return res;
};

vector<Agent> KakomimasuClient::getEnemyAgent() {
    vector<Agent> res;
    picojson::array player = m_gameInfo["players"].get<picojson::array>();
    picojson::object obj = player[1 - m_player_no].get<picojson::object>();
    picojson::array ary = obj["agents"].get<picojson::array>();
    for (int i = 0; i < ary.size(); i++) {
        picojson::object pos = ary[i].get<picojson::object>();
        res.push_back({(int)pos["x"].get<double>(), (int)pos["y"].get<double>()});
    }
    return res;
};

void KakomimasuClient::waitNextTurn() {
    int next_time = getNextTurnUnixTime();
    while (time(NULL) < next_time) {
        this_thread::sleep_for(chrono::milliseconds(100));
    }
}

void KakomimasuClient::setAction(vector<Action> action) {
    string post_data = "{\"actions\":[";

    for (const auto &[agentId, type, x, y] : action) {
        picojson::object obj;
        obj.emplace(make_pair("agentId", picojson::value((double)agentId)));
        obj.emplace(make_pair("type", type));
        obj.emplace(make_pair("x", picojson::value((double)x)));
        obj.emplace(make_pair("y", picojson::value((double)y)));

        picojson::value val(obj);
        post_data += val.serialize() + ",";
    }
    post_data.erase(post_data.size() - 1);
    post_data += "]}";

    cout << curlPost("/match/" + m_game_id + "/action", post_data, m_token) << endl;
};

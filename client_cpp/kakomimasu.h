#include "picojson.h"
#include <chrono>
#include <curl/curl.h>
#include <iostream>
#include <random>
#include <string>
#include <thread>
using namespace std;

struct Action {
    int agentId;
    string type;
    int x;
    int y;
};
struct Tile {
    int type;
    int pid;
    int point;
};
struct Agent {
    int x;
    int y;
};

extern const int DIR[8][2];
void setHost(string s);
string userShow(string identifier);
void userRegist(string screenName, string name, string password);
static size_t callbackWrite(char *ptr, size_t size, size_t nmemb, string *stream);
string curlGet(string req, string token);
string curlPost(string req, string post_data, string token);
int rnd(int n);

class KakomimasuClient {
  public:
    KakomimasuClient(string id, string name, string spec, string password);
    bool getGameInfo();
    void waitMatching();
    int getWidth();
    int getHeight();
    int getAgentCount();
    int getPlayerNumber();
    int getNextTurnUnixTime();
    int getTurn();
    int getTotalTurn();
    vector<vector<int>> getPoints();
    vector<vector<Tile>> getFiled();
    vector<Agent> getAgent();
    vector<Agent> getEnemyAgent();
    void waitNextTurn();
    void setAction(vector<Action> action);

  private:
    string m_name;
    string m_password;
    string m_token;
    string m_game_id;
    int m_player_no;
    picojson::object m_gameInfo;
    picojson::object m_board;
};
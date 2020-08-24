#include <iostream>
#include <string>
#include <chrono>
#include <thread>

#include "json.hpp"

#define MAX_LEN_REQ (200 * 1024) // 100kbyte
#define MAX_LEN_JSON (200 * 1024) // 100kbyte
#define LEN_TOKEN 6 // TOKENの長さは固定

const std::string host = "http://localhost:8880";

namespace http_methods {
nlohmann::json post(const std::string host, const std::string path, const std::string json) {
    // 引数を元にcurlコマンドを文字列を作成
    const std::string cmd = "curl -s -H \"Content-Type:application/json\" -H \"Authorization: token1\" -X POST -d '" + json + "' " + host + path;
    std::cout << "[post req]" << std::endl << cmd << std::endl << std::endl;

    // 作成したcurlコマンドをシェルで叩く
    FILE* fp = popen(cmd.c_str(), "r");
    if (!fp) {
        fprintf(stderr, "can't popen\n");
        return "error";
    }

    // 受信したデータをfgets関数でbuf変数に入れる
    // fgets関数では第一引数が「char*」型のため、ここでは一度char配列を使う(string型で受け取ってくれる関数があるのかも)
    char buf[MAX_LEN_JSON];
    fgets(buf, MAX_LEN_JSON, fp);
    if (!feof(fp)) {
        fprintf(stderr, "too long json, check MAX_LEN_JSON\n");
        return "error";
    }

    pclose(fp);

    // 受信したデータはJSON型の文字列のため、それをjsonオブジェクトに変換する
    nlohmann::json response_json = nlohmann::json::parse(std::string(buf));

    std::cout << "[post res]" << std::endl << response_json.dump(4) << std::endl << std::endl;
  
    return response_json;
}

nlohmann::json get(const std::string host, const std::string path) {
    const std::string cmd = "curl -s -H 'Authorization: token1' -X GET " + host + path;
    std::cout << "[post req]" << std::endl << cmd << std::endl << std::endl;

    FILE* fp = popen(cmd.c_str(), "r");
    if (!fp) {
        fprintf(stderr, "can't popen\n");
        return "error";
    }
    
    char buf[MAX_LEN_JSON];
    fgets(buf, MAX_LEN_JSON, fp);
    if (!feof(fp)) {
        fprintf(stderr, "too long json, check MAX_LEN_JSON\n");
        return "error";
    }

    pclose(fp);

    nlohmann::json response_json = nlohmann::json::parse(std::string(buf));

    std::cout << "[post res]" << std::endl << response_json.dump(4) << std::endl << std::endl;
  
    return response_json;
}
}

// 指定した名前のユーザーが存在するかどうか調べる
// 存在しない場合は「{"error":"Can not find user."}」を返す
nlohmann::json userShow(const std::string name) {
    return http_methods::get(host, "/users/show/" + name);
}

// 3つの引数を元にjsonデータを作成し、サーバーに登録する
nlohmann::json userRegist(const std::string sn, const std::string n, const std::string p) {
    nlohmann::json user_info = {
        {"screenName", sn},
        {"name", n},
        {"password", p}
    };

    // dumpメソッドを使うことで、jsonインスタンスをJSON形式の文字列に変換する
    return http_methods::post(host, "/users/regist", user_info.dump());
}

// サーバーにプレイヤーを登録し、トークとゲームIDのjsonデータを返す
nlohmann::json match(const std::string id, const std::string pw, const std::string spec) {
    nlohmann::json match_info = {
        {"id", id},
        {"password", pw},
        {"spec", spec}
    };

    return http_methods::post(host, "/match", match_info.dump());
}

nlohmann::json getGameInfo(const std::string gi) {
    return http_methods::get(host, "/match/" + gi);
}

void sleep_ms(int x) { std::this_thread::sleep_for(std::chrono::milliseconds(x)); }

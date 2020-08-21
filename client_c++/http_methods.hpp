#include <iostream>
#include <string>

#define MAX_LEN_REQ (200 * 1024) // 100kbyte
#define MAX_LEN_JSON (200 * 1024) // 100kbyte
#define LEN_TOKEN 6 // TOKENの長さは固定

namespace http_methods {
std::string post(const std::string host, const std::string path, const std::string json) {
    // 引数を元にcurlコマンドを文字列を作成
    const std::string cmd = "curl -s -H 'Authorization: token1' -X POST " + host + path + " -d " + json;
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

    std::cout << "[post res]" << std::endl << std::string(buf) << std::endl << std::endl;
  
    return std::string(buf);
}

std::string get(const std::string host, const std::string path) {
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

    std::cout << "[post res]" << std::endl << std::string(buf) << std::endl << std::endl;
  
    return std::string(buf);
}
}

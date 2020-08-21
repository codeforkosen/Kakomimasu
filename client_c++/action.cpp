#include "http_methods.hpp"
#include "json.hpp"
using namespace std;
using json = nlohmann::json;

const string host = "http://localhost:8880";

// 指定した名前のユーザーが存在するかどうか調べる
// 存在しない場合は「{"error":"Can not find user."}」を返す
string userShow(const string name) {
    return http_methods::get(host, "/users/show/" + name);
}

// 3つの引数を元にjsonデータを作成し、サーバーに登録する
void userRegist(const string sn, const string n, const string p) {
    json user_info = {
        {"screenName", sn},
        {"name", n},
        {"password", p}
    };

    // dumpメソッドを使うことで、jsonインスタンスをJSON形式の文字列に変換する
    string res = http_methods::post(host, "/users/regist", user_info.dump());
}

int main() {
    const string name = "kizitora";
    const string password = name + "-pw";
    const string user = userShow(name);
    
    // 指定した名前のユーザーがサーバーにいない場合は、ユーザー情報を作って登録する
    if(user == "{\"error\":\"Can not find user.\"}") {
        userRegist("kizitora", name, password);
    }
}

#include "client_util.hpp"
using namespace std;

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
    
    //nlohmann::json match_info = match(user_info["id"], password, spec);
}

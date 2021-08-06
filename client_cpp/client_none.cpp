#include "kakomimasu.h"

int main() {
    // 自分のbearerTokenを書く
    KakomimasuClient kc("");
    kc.waitMatching();

    return 0;
}
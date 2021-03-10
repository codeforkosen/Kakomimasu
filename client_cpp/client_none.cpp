#include "kakomimasu.h"

int main() {
    KakomimasuClient kc("ai-none", "AI-NONE", "なにもしない", "ai-none-pw");
    kc.waitMatching();

    return 0;
}
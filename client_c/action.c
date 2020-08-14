#include <stdio.h>
#include <stdlib.h>
#include "clientutil.h"

#define MAX_LEN_JSON (1 * 1024 * 1024) // 1Mbyte

#define LEN_TOKEN 6 // TOKENの長さは固定

/*
-- /action (for test apiserver)
- req
curl -s -H 'Authorization: token1' -X POST http://localhost:8880/action -d '{"actions":[{"agentID": 2, "dx": 1, "dy": 1, "type": "move"}, {"agentID": 3, "dx": 1, "dy": 1, "type": "move"}]}'
- res
{"yourToken":"token1","yourPath":"/action","nActions":2}
*/

int action_test(const char* host) {
  char* buf = malloc(MAX_LEN_JSON);
  if (get(host, "/users/show/nit-taro1", buf, MAX_LEN_JSON)) {
    printf("post error!\n");
    return 1;
  }
  /*
  if (post(host, "/action", "{\"actions\":[{\"agentID\": 2, \"dx\": 1, \"dy\": 1, \"type\": \"move\"}, {\"agentID\": 3, \"dx\": 1, \"dy\": 1, \"type\": \"move\"}]}", buf, MAX_LEN_JSON)) {
    printf("post error!\n");
    return 1;
  }
  char token[LEN_TOKEN + 1];
  int nActions;
  int res = sscanf(buf, "{\"yourToken\":\"%6s\",\"yourPath\":\"/action\",\"nActions\":%d}", token, &nActions); // 6 == LEN_TOKEN
  if (!res) {
    printf("parse error!\n");
    return 1;
  }
  printf("[parsed]\n");
  printf("token (%d chars): %s\n", LEN_TOKEN, token);
  printf("nActions: %d\n", nActions);
  */
  free(buf);
  return 0;
}

int main(int argc, char** argv) {
  const char* host = "http://localhost:8880";
  return action_test(host);
}

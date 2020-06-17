#include <stdio.h>

/*
-- /action
- req
curl -s -H 'Authorization: token1' -X POST http://localhost:8880/action -d '{"actions":[{"agentID": 2, "dx": 1, "dy": 1, "type": "move"}, {"agentID": 3, "dx": 1, "dy": 1, "type": "move"}]}'
- res
{"yourToken":"token1","yourPath":"/action","nActions":2}
*/

#define MAX_LEN_REQ (1 * 1024 * 1024) // 1Mbyte

int post(const char* host, const char* path, const char* json, char* buf, int lenbuf) {
  char cmd[MAX_LEN_REQ];
  sprintf(cmd, "curl -s -H 'Authorization: token1' -X POST %s%s -d '%s'", host, path, json);
  printf("[post req]\n%s\n\n", cmd);
  // char* cmd = "curl -s -H 'Authorization: token1' -X POST http://localhost:8880/action -d '{\"actions\":[{\"agentID\": 2, \"dx\": 1, \"dy\": 1, \"type\": \"move\"}, {\"agentID\": 3, \"dx\": 1, \"dy\": 1, \"type\": \"move\"}]}'"; // for test
  FILE* fp = popen(cmd, "r");
  if (!fp) {
    fprintf(stderr, "can't popen\n");
    return 1;
  }
  fgets(buf, lenbuf, fp);
  if (!feof(fp)) {
    fprintf(stderr, "too long json, check MAX_LEN_JSON\n");
    return 1;
  }
  printf("[post res]\n%s\n\n", buf);
  pclose(fp);
  return 0;
}

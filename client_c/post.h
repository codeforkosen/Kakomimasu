#include <stdio.h>

#define MAX_LEN_REQ (200 * 1024) // 100kbyte

int post(const char* host, const char* path, const char* json, char* buf, int lenbuf) {
  char cmd[MAX_LEN_REQ];
  snprintf(cmd, MAX_LEN_REQ - 1, "curl -s -H 'Authorization: token1' -X POST %s%s -d '%s'", host, path, json);
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

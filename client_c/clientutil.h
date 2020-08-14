#include <stdio.h>
#include <string.h>
#include <stdlib.h>

int httpaccess(const char* cmd, char* buf, int lenbuf) {
  printf("[req]\n%s\n\n", cmd);
  // char* cmd = "curl -s -H 'Authorization: token1' -X POST http://localhost:8880/action -d '{\"actions\":[{\"agentID\": 2, \"dx\": 1, \"dy\": 1, \"type\": \"move\"}, {\"agentID\": 3, \"dx\": 1, \"dy\": 1, \"type\": \"move\"}]}'"; // for test
  FILE* fp = popen(cmd, "r");
  if (!fp) {
    fprintf(stderr, "can't popen\n");
    return 1;
  }
  fgets(buf, lenbuf, fp);
  if (!feof(fp)) {
    fprintf(stderr, "too long json, check lenbuf\n");
    return 1;
  }
  printf("[res]\n%s\n\n", buf);
  pclose(fp);
  return 0;
}

int post(const char* host, const char* path, const char* json, char* buf, int lenbuf) {
  int cmdlen = strlen(buf) + strlen(path) + 1024;
  char* cmd = malloc(cmdlen);
  snprintf(cmd, cmdlen - 1, "curl -s -H 'Authorization: token1' -X POST %s%s -d '%s'", host, path, json);
  int res = httpaccess(cmd, buf, lenbuf);
  free(cmd);
  return res;
}

int get(const char* host, const char* path, char* buf, int lenbuf) {
  int cmdlen = strlen(buf) + strlen(path) + 1024;
  char* cmd = malloc(cmdlen);
  snprintf(cmd, cmdlen - 1, "curl -s -H 'Authorization: token1' %s%s", host, path);
  int res = httpaccess(cmd, buf, lenbuf);
  free(cmd);
  return res;
}

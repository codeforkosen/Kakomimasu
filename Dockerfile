FROM hayd/deno:latest

COPY . .

ENTRYPOINT ["/entrypoint.sh"]
#CMD ["deno","cache", "./apiserver/apiserver.ts"]
#CMD ["nohup", "deno", "run", "-A", "./apiserver/apiserver.ts" ,"&"]
#CMD deno test -A
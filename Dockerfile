FROM hayd/deno:1.5.2

COPY . .

RUN deno cache ./apiserver/apiserver.ts
RUN nohup deno run -A ./apiserver/apiserver.ts & deno test -A
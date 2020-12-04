FROM hayd/deno:1.5.2

COPY . .

RUN deno cache ./apiserver/apiserver.ts
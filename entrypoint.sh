#!/bin/sh -l

deno -V
deno cache ./apiserver/apiserver.ts
deno cache  --no-check --import-map ./pages/import-map.json ./pages/route.tsx
deno run -A ./apiserver/apiserver.ts &
deno run -A ./apiserver/parts/wait-start.ts
deno test -A
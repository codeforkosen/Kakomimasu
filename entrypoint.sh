#!/bin/sh -l

deno -V
deno cache ./apiserver/apiserver.ts
deno run -A ./apiserver/apiserver.ts --noViewer &
deno run -A ./apiserver/parts/wait-start.ts
deno test -A
#!/bin/sh -l

deno cache ./apiserver/apiserver.ts
deno run -A ./apiserver/apiserver.ts &
deno test -A
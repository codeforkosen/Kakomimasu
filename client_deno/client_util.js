import { parse } from "https://deno.land/std@0.84.0/flags/mod.ts";
const args = parse(Deno.args);

const cl = (...param) => {
  if (!args.nolog) console.log(...param);
}

class Action {
  constructor(agentId, type, x, y) {
    this.agentId = agentId;
    this.type = type;
    this.x = x;
    this.y = y;
  }
}

function sleep(msec) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(), msec);
  });
}

function diffTime(unixTime) {
  const dt = unixTime * 1000 - new Date().getTime();
  cl("diffTime", dt);
  return dt;
}

export {
  Action,
  sleep,
  diffTime,
  cl,
  args
};

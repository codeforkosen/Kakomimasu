import { parse } from "https://deno.land/std@0.84.0/flags/mod.ts";
const args = parse(Deno.args);

const cl = (...param) => {
  if (!args.nolog) console.log(...param);
}


// const defaulthost = "http://localhost:8880/api";
const defaulthost = "https://practice.kakomimasu.website/api";
let host = defaulthost;
const setHost = (s) => {
  host = s || defaulthost;
};

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

async function userRegist(screenName, name, password) {
  const sendJson = {
    screenName: screenName,
    name: name,
    password: password,
  };
  const reqJson = await (await fetch(
    `${host}/users/regist`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(sendJson),
    },
  )).json();
  //cl(reqJson, "userRegist");
  return reqJson;
}

async function userShow(identifier) {
  const reqJson = await (await fetch(
    `${host}/users/show/${identifier}`,
  )).json();
  //cl(reqJson, "userShow");
  return reqJson;
}

async function userDelete({ name = "", id = "", password = "" }) {
  const sendJson = {
    name: name,
    id: id,
    password: password,
  };
  const res = await fetch(
    `${host}/users/delete`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(sendJson),
    },
  );
  //cl(res, "userDelete");
  return res;
}

async function match(sendJson) {
  const resJson = await (await fetch(
    `${host}/match`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(sendJson),
    },
  )).json();
  //cl(resJson, "match");
  return resJson; //[reqJson.accessToken, reqJson.roomId];
}

async function getGameInfo(roomid) {
  const res = await (await fetch(`${host}/match/${roomid}`)).json();
  if (res.error) {
    cl("error! ", res);
    Deno.exit(0);
  }
  return res;
}

async function setAction(roomid, playerid, actions) {
  cl("setAction", JSON.stringify(actions));

  const sendJson = {
    time: Math.floor(new Date().getTime() / 1000),
    actions: actions,
  };
  const resJson = await (await fetch(
    `${host}/match/${roomid}/action`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": playerid,
      },
      body: JSON.stringify(sendJson),
    },
  )).json();
  //cl(resJson, "setAction");
  return resJson;
}

function diffTime(unixTime) {
  const dt = unixTime * 1000 - new Date().getTime();
  cl("diffTime", dt);
  return dt;
}

export {
  Action,
  sleep,
  userRegist,
  userShow,
  userDelete,
  match,
  getGameInfo,
  setAction,
  diffTime,
  setHost,
  cl,
  args
};

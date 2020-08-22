const host = "http://localhost:8880";

class Action {
  public agentId: number;
  public type: string;
  public x: number;
  public y: number;

  constructor(agentId: number, type: string, x: number, y: number) {
    this.agentId = agentId;
    this.type = type;
    this.x = x;
    this.y = y;
  }
}

function sleep(msec: number) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(), msec);
  });
}

async function userRegist(screenName: string, name: string, password: string) {
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
  //console.log(reqJson, "userRegist");
  return reqJson;
}

async function userShow(identifier: string) {
  const reqJson = await (await fetch(
    `${host}/users/show/${identifier}`,
  )).json();
  //console.log(reqJson, "userShow");
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
  //console.log(res, "userDelete");
  return res;
}

async function match({ name = "", id = "", password = "", spec = "" }) {
  const sendJson = { name: name, id: id, password: password, spec: spec };
  const resJson = await (await fetch(
    `${host}/match`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(sendJson),
    },
  )).json();
  //console.log(resJson, "match");
  return resJson; //[reqJson.accessToken, reqJson.roomId];
}

async function getGameInfo(roomid: string) {
  const reqJson = await fetch(
    `${host}/match/${roomid}`,
  ).then((response) => response.json());
  return reqJson;
}

async function setAction(roomid: string, playerid: string, actions: Action[]) {
  //console.log(JSON.stringify(actions));
  const sendJson = {
    //time: Math.floor(new Date().getTime() / 1000),
    actions: actions,
  };
  const reqJson = await (await fetch(
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
  //console.log(reqJson, "setAction");
  return reqJson;
}

function diffTime(unixTime: number) {
  const dt = unixTime * 1000 - new Date().getTime();
  console.log("diffTime", dt);
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
};

//const host = "http://localhost:8880";
//const host = "http://118.27.2.240:8880";
const host = "https://kakomimasu.sabae.cc";

class Action {
  constructor(agentid, type, x, y) {
    this.agentid = agentid;
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

async function match(name, spec) {
  const sendJson = { name: name, spec: spec };
  const reqJson = await fetch(
    `${host}/match`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(sendJson),
    },
  ).then((response) => response.json());
  //console.log(reqJson);
  return [reqJson.playerId, reqJson.roomId];
}

async function getGameInfo(roomid) {
  const reqJson = await fetch(
    `${host}/match/${roomid}`,
  ).then((response) => response.json());
  return reqJson;
}

async function setAction(roomid, playerid, actions) { // Actions[]
  console.log(JSON.stringify(actions));
  const sendJson = {
    time: Math.floor(new Date().getTime() / 1000),
    actions: actions,
  };
  const reqJson = await fetch(
    `${host}/match/${roomid}/action`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": playerid,
      },
      body: JSON.stringify(sendJson),
    },
  ).then((response) => response.json());
  return reqJson;
}

function diffTime(unixTime) {
  const dt = unixTime * 1000 - new Date().getTime();
  console.log("diffTime", dt);
  return dt;
}

export { Action, sleep, match, getGameInfo, setAction, diffTime };

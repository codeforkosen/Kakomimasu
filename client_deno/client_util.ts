const host = "http://localhost:8880";

class Action {
  public agentid: number;
  public type: string;
  public x: number;
  public y: number;

  constructor(agentid: number, type: string, x: number, y: number) {
    this.agentid = agentid;
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

async function match(name: string, spec: string) {
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

async function getGameInfo(roomid: string) {
  const reqJson = await fetch(
    `${host}/match/${roomid}`,
  ).then((response) => response.json());
  return reqJson;
}

async function setAction(roomid: string, playerid: string, actions: Action[]) {
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

function diffTime(unixTime: number) {
  return unixTime - Math.floor(new Date().getTime() / 1000);
}

export { Action, sleep, match, getGameInfo, setAction, diffTime };

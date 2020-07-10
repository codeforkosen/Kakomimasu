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

const roomid: string[] = new Array(2);
const playerid: string[] = new Array(2);
for (let i = 0; i < 2; i++) {
  [playerid[i], roomid[i]] = await match(`高専太郎${i + 1}`, "ポンコツ");
}

if (roomid[0] === roomid[1]) {
  let gameInfo;
  do {
    gameInfo = await getGameInfo(roomid[0]);
  } while (gameInfo.startedAtUnixTime === null);

  console.log(
    "ゲーム開始時間：",
    new Date(gameInfo.startedAtUnixTime / 1000).toLocaleString("ja-JP"),
  );

  await sleep((diffTime(gameInfo.startedAtUnixTime) + 1) * 1000);

  // ターン1
  setAction(
    roomid[0],
    playerid[0],
    [new Action(0, "PUT", 1, 1), new Action(1, "PUT", 3, 3)],
  );
  setAction(
    roomid[0],
    playerid[1],
    [new Action(0, "PUT", 4, 4), new Action(1, "PUT", 6, 6)],
  );
  await sleep((diffTime(gameInfo.nextTurnUnixTime) + 3 + 1) * 1000);

  // ターン2
  gameInfo = await getGameInfo(roomid[0]);
  setAction(
    roomid[0],
    playerid[0],
    [new Action(0, "MOVE", 1, 2), new Action(1, "MOVE", 3, 2)],
  );
  setAction(
    roomid[0],
    playerid[1],
    [new Action(0, "MOVE", 4, 5), new Action(1, "MOVE", 6, 5)],
  );
  await sleep((diffTime(gameInfo.nextTurnUnixTime) + 3 + 1) * 1000);

  // ターン3
  gameInfo = await getGameInfo(roomid[0]);
  setAction(
    roomid[0],
    playerid[0],
    [new Action(0, "MOVE", 1, 3), new Action(1, "MOVE", 3, 1)],
  );
  setAction(
    roomid[0],
    playerid[1],
    [new Action(0, "MOVE", 4, 6), new Action(1, "MOVE", 6, 4)],
  );
  await sleep((diffTime(gameInfo.nextTurnUnixTime) + 3 + 1) * 1000);

  // ターン4
  gameInfo = await getGameInfo(roomid[0]);
  setAction(
    roomid[0],
    playerid[0],
    [new Action(0, "MOVE", 2, 3), new Action(1, "MOVE", 2, 1)],
  );
  setAction(
    roomid[0],
    playerid[1],
    [new Action(0, "MOVE", 5, 6), new Action(1, "MOVE", 5, 4)],
  );
  await sleep((diffTime(gameInfo.nextTurnUnixTime) + 3 + 1) * 1000);

  //console.log(await getGameInfo(roomid[0]));
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

function sleep(msec: number) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(), msec);
  });
}

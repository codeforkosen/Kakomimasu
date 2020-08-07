"use struct";

function rootURL() {
  return `${window.location.protocol}//${window.location.host}`;
}

function createHeader(userScreenName) {
  const headerDiv = document.getElementsByTagName("header")[0];
  headerDiv.innerHTML = `
    <a href="${rootURL()}/game"><img src="${rootURL()}/img/kakomimasu-logo.png" alt="囲みますロゴ"></a>
    <h1>${userScreenName}</h1>
  `;
}

function createFooter() {
  const footer = document.getElementsByTagName("footer")[0];
  footer.innerHTML =
    'CC BY <a href="https://codeforkosen.github.io/">Code for KOSEN</a>(<a href=https://github.com/codeforkosen/Kakomimasu>src on GitHub</a>)';
}

function getGameStatus(roomJson) {
  let status = "";
  let startTime = "";
  if (roomJson.startedAtUnixTime === null) {
    status = "プレイヤー入室待ち";
    startTime = "-";
  } else {
    startTime = new Date(roomJson.startedAtUnixTime * 1000).toLocaleString(
      "ja-JP",
    );
    if (!roomJson.gaming && !roomJson.ending) status = "ゲームスタート待ち";
    else if (roomJson.gaming && !roomJson.ending) status = "プレイ中";
    else if (roomJson.ending) status = "ゲーム終了";
  }
  return [status, startTime];
}

function getTurnText(roomJson) {
  let turnText = "-";
  if (roomJson.gaming || roomJson.ending) {
    turnText = `${roomJson.turn}/${roomJson.totalTurn}`;
  }
  return turnText;
}

function nowUnixTime() {
  return Math.floor(new Date().getTime() / 1000);
}

function diffTime(unixTime) {
  return unixTime - Math.floor(new Date().getTime() / 1000);
}

//#region API client
async function userShow(identifier) {
  const resJson = await (await fetch(
    `${rootURL()}/users/show/${identifier}`,
  )).json();
  //console.log(reqJson, "userShow");
  return resJson;
}

async function getAllGame() {
  const resJson = await (await fetch(
    `${rootURL()}/match/`,
  )).json();
  //console.log(reqJson, "getAllRoom");
  return resJson;
}

async function getGameInfo(roomid) {
  const resJson = await (await fetch(
    `${rootURL()}/match/${roomid}`,
  )).json();
  return resJson;
}
//#endregion

"use struct";

class Game {
  constructor() {
    //const [status, startTime] = Game.getGameStatus(game);
    this.gameId = "";
    this.status = "";
    this.startTime = "";
  }

  static getGameStatus(gameJson) {
    let status = "";
    let startTime = "";
    if (gameJson.startedAtUnixTime === null) {
      status = "プレイヤー入室待ち";
      startTime = "-";
    } else {
      startTime = new Date(gameJson.startedAtUnixTime * 1000).toLocaleString(
        "ja-JP",
      );
      if (!gameJson.gaming && !gameJson.ending) status = "ゲームスタート待ち";
      else if (gameJson.gaming && !gameJson.ending) status = "プレイ中";
      else if (gameJson.ending) status = "ゲーム終了";
    }
    return [status, startTime];
  }
}

function createHeader(userScreenName) {
  const headerDiv = document.getElementsByTagName("header")[0];
  headerDiv.innerHTML = `
    <a href="/game"><img src="/img/kakomimasu-logo.png" alt="囲みますロゴ"></a>
    <h1>${userScreenName}</h1>
  `;
}

function createFooter() {
  const footer = document.getElementsByTagName("footer")[0];
  footer.innerHTML =
    'CC BY <a href="https://codeforkosen.github.io/">Code for KOSEN</a>(<a href=https://github.com/codeforkosen/Kakomimasu>src on GitHub</a>)';
}

function getTurnText(game) {
  let turnText = "-";
  if (game.gaming || game.ending) {
    turnText = `${game.turn}/${game.totalTurn}`;
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
    `/users/show/${identifier}`,
  )).json();
  //console.log(reqJson, "userShow");
  return resJson;
}

async function getAllGame() {
  const resJson = await (await fetch(
    `/match/`,
  )).json();
  //console.log(reqJson, "getAllRoom");
  return resJson;
}

async function getGameInfo(roomid) {
  const resJson = await (await fetch(
    `/match/${roomid}`,
  )).json();
  return resJson;
}
//#endregion

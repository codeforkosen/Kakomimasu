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
    //console.log(gameJson);
    return [status, startTime, gameJson.board ? gameJson.board.name : null];
  }
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

function getUrlQueries() {
  const queries = {};
  const params = new URLSearchParams(window.location.search);
  params.forEach((v, k) => {
    queries[k] = v;
  });
  return queries;
}

//#region API client
async function userShow(identifier) {
  const resJson = await (await fetch(
    `/api/users/show/${identifier}`,
  )).json();
  //console.log(reqJson, "userShow");
  return resJson;
}

/*async function getAllGame() {
  const resJson = await (await fetch(
    `/api/match/`,
  )).json();
  //console.log(reqJson, "getAllRoom");
  return resJson;
}*/

async function getGameInfo(roomid) {
  const resJson = await (await fetch(
    `/api/match/${roomid}`,
  )).json();
  return resJson;
}
//#endregion

export const firebaseConfig = {
  apiKey: "AIzaSyDz0FDikVy97fFfGtnNf3UME7Zi393CXMM",
  authDomain: "kakomimasu-6a8bb.firebaseapp.com",
  projectId: "kakomimasu-6a8bb",
  storageBucket: "kakomimasu-6a8bb.appspot.com",
  messagingSenderId: "399214483363",
  appId: "1:399214483363:web:966f0b596472476725ac16",
  measurementId: "G-9E8LR1LC9W"
};

export {
  Game,
  getTurnText,
  nowUnixTime,
  diffTime,
  getUrlQueries,
  userShow,
  //getAllGame,
  getGameInfo,
};

export const getUserDetailUrl = (a) => `/user/detail.html?id=${a}`;
export const getGameDetailUrl = (a) => `/gamedetails.html?id=${a}`;

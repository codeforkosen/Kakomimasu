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
  var queryStr = window.location.search.slice(1); // 文頭?を除外
  const queries = {};

  // クエリがない場合は空のオブジェクトを返す
  if (!queryStr) {
    return queries;
  }

  // クエリ文字列を & で分割して処理
  queryStr.split("&").forEach(function (queryStr) {
    // = で分割してkey,valueをオブジェクトに格納
    var queryArr = queryStr.split("=");
    queries[queryArr[0]] = queryArr[1];
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

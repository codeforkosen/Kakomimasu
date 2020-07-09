function getRootURL() {
  return `${window.location.protocol}//${window.location.host}`;
}

function nowUnixTime() {
  return Math.floor(new Date().getTime() / 1000);
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
  if (roomJson.gaming && !roomJson.ending) {
    turnText = `${roomJson.turn}/${roomJson.totalTurn}`;
  }
  return turnText;
}

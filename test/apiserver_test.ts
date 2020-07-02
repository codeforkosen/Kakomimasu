const baseUrl = "http://localhost:8880";
const url = `${baseUrl}/match`;
const playerJson = { "name": "高専太郎", "spec": "ポンコツ" };

let roomId = "";
for (let i = 0; i < 2; i++) {
  const json = await fetch(
    url,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(playerJson),
    },
  ).then((response) => response.json());
  console.log(json);

  roomId = json.roomId;
}
//console.log(`${url}/${roomId}`);

const getGameInfo = async () => {
  const gameInfoJson = await fetch(
    `${url}/${roomId}`,
  ).then((response) => response.json());
  console.log(gameInfoJson);
};

setInterval(getGameInfo, 1000);

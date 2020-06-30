const baseUrl = "http://localhost:8880";
const url = `${baseUrl}/match?playerName=高専太郎&spec=ポンコツ`;

const data = { "playerName": "高専太郎", "spec": "ポンコツ" };

const json = await (await fetch(url, { method: "POST" }));
console.log(json);

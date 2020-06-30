const str =
  "match?playerName=%E9%AB%98%E5%B0%82%E5%A4%AA%E9%83%8E&spec=%E3%83%9D%E3%83%B3%E3%82%B3%E3%83%84";
const re = new RegExp("^match\?(.+)");
console.log(re.test(str));

const baseUrl = "http://localhost:8880";
const url = `${baseUrl}/match`; //?playerName=高専太郎&spec=ポンコツ`;

const urlObj = new URL(url);
const params = urlObj.searchParams;
params.append("playerName", "高専太郎");
params.append("spec", "ポンコツ");
console.log(urlObj.toString());
const data = { "playerName": "高専太郎", "spec": "ポンコツ" };

//const json = await fetch(url).then((response) => response.json());
const json = await fetch(
  urlObj.toString(),
  { method: "GET", headers: { "Content-Type": "application/json" }, body: "" },
).then((response) => response.json());

/*const json = await fetch(
  url,
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  },
)
  .then((response) => response.json());
*/
console.log(json);

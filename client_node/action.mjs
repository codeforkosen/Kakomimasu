import fetch from "node-fetch";

const main = async () => {
  const host = "http://localhost:8880";
  const path = "/action";
  const token = "TOKEN001";
  const url = host + path;
  const reqjson = {
    "actions": [{ "agentID": 2, "dx": 1, "dy": 1, "type": "move" }, {
      "agentID": 3,
      "dx": 1,
      "dy": 1,
      "type": "move",
    }],
  };
  const opt = {
    method: "POST",
    body: JSON.stringify(reqjson),
    headers: {
      "Authorization": token,
      "Content-Type": "application/json",
    },
  };
  const resjson = await (await fetch(url, opt)).json();
  console.log(resjson);
};
main();

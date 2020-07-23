import { createApp } from "https://servestjs.org/@v1.1.0/mod.ts"; // https://servestjs.org/

const api = (token, path, req) => {
  const res = {
    yourToken: token,
    yourPath: path,
    nActions: req.actions.length,
  };
  return res;
};

const app = createApp();
app.handle(/\/*/, async (req) => {
  try {
    const token = req.headers.get("Authorization");
    const json = await req.json();
    console.log("req", json);
    const res = api(token, req.path, json);
    console.log("res", res);
    await req.respond({
      status: 200,
      headers: new Headers({ "content-type": "application/json" }),
      body: JSON.stringify(res),
    });
  } catch (e) {
    console.log("err", e);
  }
});
app.listen({ port: 8880 });

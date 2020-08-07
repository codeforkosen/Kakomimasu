"use struct";

main();

async function main() {
  createHeader("ユーザ詳細");
  createFooter();

  const identifier = document.URL.match(new RegExp("^(.+)/user/(.+)$"))[2];
  const user = await userShow(identifier);
  if (user.hasOwnProperty("error")) {
    user.screenName = "ユーザが存在しません";
    user.name = "";
    user.id = "";
  }
  console.log(user);

  document.title = `ユーザ詳細(@${user.name}) - 囲みマス`;
  new Vue({
    el: "#basic-info",
    data: {
      screenName: user.screenName,
      name: user.name,
      id: user.id,
    },
  });
}

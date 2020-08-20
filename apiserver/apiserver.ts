import {
  ServerRequest,
  createRouter,
  contentTypeFilter,
  createApp,
} from "https://servestjs.org/@v1.1.1/mod.ts";

import * as util from "./apiserver_util.ts";

import { Account, User } from "./user.ts";
const accounts = new Account();

import { Kakomimasu, Board, Action } from "../Kakomimasu.js";
const kkmm = new Kakomimasu();

//#region ユーザアカウント登録・取得・削除
const usersRegist = async (req: ServerRequest) => {
  const reqData = ((await req.json()) as User);

  try {
    const user = accounts.registUser(
      reqData.screenName,
      reqData.name,
      reqData.password,
    );
    await req.respond({
      status: 200,
      headers: new Headers({
        "content-type": "application/json",
      }),
      body: JSON.stringify(user, ["screenName", "name", "id"]),
    });
  } catch (e) {
    await req.respond(util.ErrorResponse(e.message));
  }
};

const usersShow = async (req: ServerRequest) => {
  const identifier = req.match[1];
  if (identifier !== "") {
    try {
      const user = accounts.showUser(identifier);
      if (user !== undefined) {
        await req.respond({
          status: 200,
          headers: new Headers({
            "content-type": "application/json",
          }),
          body: JSON.stringify(user, ["screenName", "name", "id"]),
        });
      }
    } catch (e) {
      await req.respond(util.ErrorResponse(e.message));
    }
  } else {
    await req.respond({
      status: 200,
      headers: new Headers({
        "content-type": "application/json",
      }),
      body: JSON.stringify(accounts.getUsers()),
    });
  }
};

const usersDelete = async (req: ServerRequest) => {
  const reqData = ((await req.json()) as User);

  try {
    const user = accounts.deleteUser(
      { name: reqData.name, id: reqData.id, password: reqData.password },
    );
    await req.respond({ status: 200 });
  } catch (e) {
    await req.respond(util.ErrorResponse(e.message));
  }
};

//#endregion

//#region プレイヤー登録・ルームID取得API

const addPlayer = (
  name: string,
  id: string,
  password: string,
  spec: string,
) => {
  var identifier = "";
  if (id !== "") identifier = id;
  else if (name !== "") identifier = name;
  else throw Error("Invalid id or name.");

  const user = accounts.getUser(identifier, password);
  if (user !== undefined) {
    const player = kkmm.createPlayer(user.id, spec);

    const freeGame = kkmm.getFreeGames();
    if (freeGame.length == 0) {
      //freeGame.push(kkmm.createGame(createDefaultBoard()));
      freeGame.push(kkmm.createGame(readBoard("A-1")));
    }
    const playerIndex = freeGame[0].attachPlayer(player);
    if (playerIndex === false) throw Error("Can not add Player");

    return player;
  } else {
    throw Error("Can not find user.");
  }
};

export class PlayerPost {
  constructor(
    public name: string,
    public id: string,
    public password: string,
    public spec: string,
  ) {}
}

export const match = async (req: ServerRequest) => {
  //console.log(req, "newPlayer");
  const playerPost = (await req.json()) as PlayerPost;
  try {
    const player = addPlayer(
      playerPost.name,
      playerPost.id,
      playerPost.password,
      playerPost.spec,
    );
    //console.log(player);
    await req.respond({
      status: 200,
      headers: new Headers({
        "content-type": "application/json",
      }),
      body: JSON.stringify(player.getJSON()),
    });
  } catch (e) {
    await req.respond(util.ErrorResponse(e.message));
  }
};

// #endregion

//#region 全ルーム取得API
class Game {
  getFieldInfoJSON() {}
}
const getAllRooms = async (req: ServerRequest) => {
  //console.log(req, "getAllRooms");
  await req.respond({
    status: 200,
    headers: new Headers({
      "content-type": "application/json",
    }),
    body: JSON.stringify(kkmm.getGames()),
  });
};

//#endregion

//#region 試合状態取得API
export const getGameInfo = async (req: ServerRequest) => {
  //console.log(req.match, "GameInfo");
  const id = req.match[1];

  //console.log(id);
  const game = kkmm.getGames().filter((item: any) => item.uuid === id)[0];
  //console.log(game[0]);
  game.updateStatus();
  await req.respond({
    status: 200,
    headers: new Headers({
      "content-type": "application/json",
    }),
    body: JSON.stringify(game),
  });
};

//#endregion

//#region エージェント行動情報API
class ActionPost {
  constructor(
    public agentid: number,
    public type: string,
    public x: number,
    public y: number,
  ) {}

  static getType(type: string) {
    if (type === "PUT") return Action.PUT;
    else if (type === "NONE") return Action.NONE;
    else if (type === "MOVE") return Action.MOVE;
    else if (type === "REMOVE") return Action.REMOVE;
  }
}
export class SetActionPost {
  constructor(
    public time: number,
    public actions: ActionPost[],
  ) {}
}

export const setAction = async (req: ServerRequest) => {
  try {
    //console.log(req, "SetAction");
    const [, gameId] = req.match;
    const accessToken = req.headers.get("Authorization");
    const game = kkmm.getGames().find((item: any) => item.uuid === gameId);
    //console.log(accessToken, game.players);
    const player = game.players.find((p: any) => p.accessToken === accessToken);
    if (player === undefined) {
      await req.respond(util.ErrorResponse("Invalid accessToken."));
    } //console.log(game[0]);
    else {
      const r = (await req.json()) as SetActionPost;
      const actionsAry: any = [];
      r.actions.forEach((a) => {
        actionsAry.push([a.agentid, ActionPost.getType(a.type), a.x, a.y]);
      });
      //console.log(game.nextTurnUnixTime);
      if (game.nextTurnUnixTime >= r.time) {
        player.setActions(Action.fromJSON(actionsAry));
      } else {
        console.log("時間超過");
      }
      // 時間を超えてた場合にレスポンス変更する必要あり
      await req.respond({
        status: 200,
        headers: new Headers({
          "content-type": "application/json",
        }),
        body: JSON.stringify(
          actionsAry,
          //["uuid", "gaming", "ending", "turn", "startTime", "nextTurnTime"],
        ),
      });
    }
  } catch (e) {
    console.log("err", e);
  }
};

//#endregion

//#region ブラウザ表示用
const allGameWeb = async (req: ServerRequest) => {
  await req.sendFile("./web/allGame.html");
  await req.respond({ status: 200 });
};
const gameWeb = async (req: ServerRequest) => {
  const [, roomid] = req.match;
  const game = kkmm.getGames().filter((item: any) => item.uuid === roomid);
  if (game.length > 0) {
    await req.sendFile("./web/game.html");
    await req.respond({ status: 200 });
  } else {
    await req.respond({ status: 404 });
  }
};
const userWeb = async (req: ServerRequest) => {
  await req.sendFile("./web/user.html");
  await req.respond({
    status: 200,
  });
};
//#endregion

export const routes = () => {
  const router = createRouter();

  router.post(
    "users/regist",
    contentTypeFilter("application/json"),
    usersRegist,
  );
  router.get(new RegExp("^users/show/(.*)$"), usersShow);
  router.post(
    "users/delete",
    contentTypeFilter("application/json"),
    usersDelete,
  );

  router.post("match", contentTypeFilter("application/json"), match);
  router.get("match/", getAllRooms);
  router.get(new RegExp("^match/(.{8}-.{4}-.{4}-.{4}-.{12})$"), getGameInfo);
  router.post(new RegExp("^match/(.+)/action$"), setAction);

  router.get("game", allGameWeb);
  router.get(new RegExp("^game/(.{8}-.{4}-.{4}-.{4}-.{12})$"), gameWeb);
  router.get(new RegExp("^user/(.+)(?<!\.(js|css))$"), userWeb);

  router.get(new RegExp("([^/]+?)?.js$"), async (req: ServerRequest) => {
    //console.log(req.match);
    await req.sendFile(`./web/js/${req.match[1]}.js`);
    //await req.sendFile(``);
    await req.respond({ status: 200 });
  });
  router.get(new RegExp("^(.*?)img/(.+)$"), async (req: ServerRequest) => {
    //console.log(req.match);
    await req.sendFile(`../img/${req.match[2]}`);
    await req.respond({ status: 200 });
  });
  router.get(new RegExp("^(.*?)css/(.+)$"), async (req: ServerRequest) => {
    console.log(req.match);
    await req.sendFile(`./web/css/${req.match[2]}`);
    await req.respond({ status: 200 });
  });

  return router;
};

// Port Listen
const app = createApp();
app.route("/", routes());
app.listen({ port: 8880 });

const createDefaultBoard = () => {
  const w = 8;
  const h = 8;
  const points = [];
  for (let i = 0; i < w * h; i++) {
    points[i] = i;
    // points[i] = i % (16 * 2 + 1) - 16;
    // util.rnd(16 * 2 + 1) - 16;
  }
  const nagent = 6;
  return new Board(w, h, points, nagent);
};

const readBoard = (fileName: string) => {
  const boardJson = JSON.parse(
    Deno.readTextFileSync(`./board/${fileName}.json`),
  );
  /*console.log(
    boardJson.width,
    boardJson.height,
    boardJson.points,
    boardJson.nagent,
  );*/

  return new Board(
    boardJson.width,
    boardJson.height,
    boardJson.points,
    boardJson.nagent,
  );
};

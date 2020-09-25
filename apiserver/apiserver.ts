import type { WebSocket } from "https://deno.land/std/ws/mod.ts";
import {
  ServerRequest,
  createRouter,
  contentTypeFilter,
  createApp,
  serveStatic,
} from "https://servestjs.org/@v1.1.1/mod.ts";

import * as util from "./apiserver_util.ts";

import { Account, User } from "./user.ts";
const accounts = new Account();

import { Kakomimasu, Board, Action } from "../Kakomimasu.js";
const kkmm = new Kakomimasu();

import dotenv from "https://taisukef.github.io/denolib/dotenv.js";
dotenv.config();
const port = parseInt((Deno.env.get("port") || "8880").toString());
const boardname = Deno.env.get("boardname") || "E-1"; // "F-1" "A-1"

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
      body: JSON.stringify(
        accounts.getUsers().map((u) => ({
          screenName: u.screenName,
          name: u.name,
          id: u.id,
        })),
      ),
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

      const game = kkmm.createGame(readBoard(boardname));
      game.changeFuncs.push(sendAllGame);
      freeGame.push(game);
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

//#region 試合状態取得API
export const getGameInfo = async (req: ServerRequest) => {
  try {
    const id = req.match[1];
    let game = kkmm.getGames().filter((item: any) => item.uuid === id)[0];
    if (game) {
      game.updateStatus();
    } else {
      for (const dirEntry of Deno.readDirSync("./log")) {
        const gameid = dirEntry.name.split(/[_.]/)[1];
        console.log(gameid, id);
        if (gameid === id) {
          game = JSON.parse(Deno.readTextFileSync(`./log/${dirEntry.name}`));
          break;
        }
      }
    }

    if (game) {
      await req.respond({
        status: 200,
        headers: new Headers({
          "content-type": "application/json",
        }),
        body: JSON.stringify(game),
      });
    } else {
      throw Error("Invalid gameID.");
    }
  } catch (e) {
    await req.respond(util.ErrorResponse(e.message));
  }
};

//#endregion

//#region エージェント行動情報API
class ActionPost {
  constructor(
    public agentId: number,
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

  static isEnable(a: ActionPost) {
    if (
      a.agentId === undefined || a.type === undefined || a.x === undefined ||
      a.y === undefined
    ) {
      return false;
    } else return true;
  }
}
class SetActionPost {
  constructor(
    //public time: number,
    public actions: ActionPost[],
  ) {}
}

export const setAction = async (req: ServerRequest) => {
  try {
    //console.log(req, "SetAction");

    // Actionを受け取った時刻を取得
    const reqTime = new Date().getTime() / 1000;

    const gameId = req.match[1];
    const accessToken = req.headers.get("Authorization");

    const game = kkmm.getGames().find((item: any) => item.uuid === gameId);
    const player = game.players.find((p: any) => p.accessToken === accessToken);
    if (player === undefined) {
      await req.respond(util.ErrorResponse("Invalid accessToken."));
    } else {
      const actionData = (await req.json()) as SetActionPost;
      const isDisable = actionData.actions.some((a) => !ActionPost.isEnable(a));
      //console.log(actionData);
      if (isDisable) {
        await req.respond(util.ErrorResponse("Invalid action"));
      } else {
        const actionsAry: any = [];
        actionData.actions.forEach((a) => {
          actionsAry.push([a.agentId, ActionPost.getType(a.type), a.x, a.y]);
        });
        //console.log(game.nextTurnUnixTime);
        //if (game.nextTurnUnixTime >= reqTime) {
        console.log(actionsAry);
        const nowTurn = player.setActions(Action.fromJSON(actionsAry));
        await req.respond({
          status: 200,
          headers: new Headers({
            "content-type": "application/json",
          }),
          body: JSON.stringify(
            { receptionUnixTime: Math.floor(reqTime), turn: nowTurn },
          ),
        });
      }
    }
  } catch (e) {
    await req.respond(util.ErrorResponse(e.message));
  }
};

//#endregion

//#region WebSocket

const socks: WebSocket[] = [];

const ws_AllGame = async (sock: WebSocket) => {
  socks.push(sock);
  sock.send(JSON.stringify(kkmm.getGames()));

  for await (const msg of sock) {
    if (typeof msg === "string") {
      //console.log(msg);
    } else {
      //console.log("err on ws", msg);
      // ws { code: 0, reason: "" } -- close
      // ws { code: 1001, reason: "" } -- 遮断
      break;
    }
  }
};

const sendAllGame = () => {
  socks.forEach((s) => {
    if (!s.isClosed) {
      s.send(JSON.stringify(kkmm.getGames()));
    }
  });
};

//#endregion

//#region log試合情報取得API
const allPastGame = async (req: ServerRequest) => {
  try {
    const logGames = [];
    Deno.mkdirSync("./log", { recursive: true });
    for (const dirEntry of Deno.readDirSync("./log")) {
      //console.log(dirEntry.name);
      const json = JSON.parse(Deno.readTextFileSync(`./log/${dirEntry.name}`));
      logGames.push(json);
    }

    await req.respond({
      status: 200,
      headers: new Headers({
        "content-type": "application/json",
      }),
      body: JSON.stringify(logGames),
    });
  } catch (e) {
    await req.respond(util.ErrorResponse(e.message));
  }
};
const webRoutes = () => {
  const router = createRouter();

  router.get("/", async (req: ServerRequest) => {
    await req.respond(
      { headers: new Headers({ "Location": "index.html" }), status: 302 },
    );
  });

  return router;
};

const apiRoutes = () => {
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
  router.get(new RegExp("^match/(.+)$"), getGameInfo);
  router.post(new RegExp("^match/(.+)/action$"), setAction);

  router.get("allPastGame", allPastGame);
  router.ws("allGame", ws_AllGame);

  return router;
};

// Port Listen
const app = createApp();
app.use(serveStatic("../public"));
app.route("/api/", apiRoutes());
app.route("/", webRoutes());
app.listen({ port });

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
  if (boardJson.points[0] instanceof Array) {
    boardJson.points = boardJson.points.flat();
  }
  /*console.log(
    boardJson.width,
    boardJson.height,
    boardJson.points,
    boardJson.nagent,
  );*/

  return new Board(boardJson);
};

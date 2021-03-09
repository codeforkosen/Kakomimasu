//import type { WebSocket } from "https://deno.land/std@0.89.0/ws/mod.ts";
import type { WebSocket } from "./mod.ts";
import {
  contentTypeFilter,
  createApp,
  createRouter,
  ServerRequest,
  serveStatic,
} from "https://servestjs.org/@v1.1.9/mod.ts";

import { aiList } from "./parts/ai-list.ts";

import * as util from "./apiserver_util.ts";
const resolve = util.pathResolver(import.meta);

import { User, Users } from "./user.ts";
export const accounts = new Users();

import { Action, Board, Game, Kakomimasu } from "../Kakomimasu.js";
import { ExpKakomimasu } from "./parts/expKakomimasu.js";

const kkmm = new ExpKakomimasu();
const kkmm_self = new ExpKakomimasu();

import { config } from "https://deno.land/x/dotenv@v2.0.0/mod.ts";
const env = config({
  path: resolve("./.env"),
  defaults: resolve("./.env.default"),
});
const port = parseInt(env.port);
const boardname = env.boardname; // || "E-1"; // "F-1" "A-1"

import util2 from "../util.js";
import { LogFileOp } from "./parts/file_opration.ts";

import { tournamentRouter, tournaments } from "./tournament.ts";

const getRandomBoardName = async () => {
  const bd = Deno.readDir("board");
  const list = [];
  for await (const b of bd) {
    if (b.name.endsWith(".json")) {
      list.push(b.name.substring(0, b.name.length - 5));
    }
  }
  return list[util2.rnd(list.length)];
};

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
    await req.respond(util.errorResponse(e.message));
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
      await req.respond(util.errorResponse(e.message));
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
    await req.respond(util.errorResponse(e.message));
  }
};

const usersSearch = async (req: ServerRequest) => {
  try {
    const query = req.query;
    const q = query.get("q");
    if (!q) throw Error("Nothing search query");

    const matchName = accounts.getUsers().filter((e) => e.name.startsWith(q));
    const matchId = accounts.getUsers().filter((e) => e.id.startsWith(q));
    const users = [...new Set([...matchName, ...matchId])];

    await req.respond({
      status: 200,
      headers: new Headers({
        "content-type": "application/json",
      }),
      body: JSON.stringify(users, ["screenName", "name", "id"]),
    });
  } catch (e) {
    await req.respond(util.errorResponse(e.message));
  }
};

//#endregion

//#region ゲーム作成API
interface ICreateGamePost {
  name: string;
  boardName: string;
  nPlayer?: number;
  playerIdentifiers?: string[];
  tournamentId?: string;
}

const createSelfGame = async (req: ServerRequest) => {
  try {
    const reqJson = (await req.json()) as ICreateGamePost;
    //console.log(reqJson);
    const board = readBoard(reqJson.boardName);
    board.nplayer = reqJson.nPlayer || 2;

    const game = kkmm_self.createGame(
      board,
      reqJson.name,
    );

    if (reqJson.playerIdentifiers) {
      const userIds = reqJson.playerIdentifiers.map((e) =>
        accounts.find(e)?.id
      );
      userIds.forEach((userId) => {
        if (!game.addReservedUser(userId)) {
          throw Error("The user is already registered");
        }
      });
    }

    game.changeFuncs.push(sendAllGame);
    game.changeFuncs.push(sendGame);
    sendAllGame();

    if (reqJson.tournamentId) {
      tournaments.addGame(reqJson.tournamentId, game.uuid);
    }

    await req.respond(util.jsonResponse(JSON.stringify(game)));
    //console.log(kkmm_self);
  } catch (e) {
    await req.respond(util.errorResponse(e.message));
  }
};

const getAllBoards = async (req: ServerRequest) => {
  try {
    const boards = [];
    if (Deno.statSync("./board").isDirectory) {
      for (const dirEntry of Deno.readDirSync("./board")) {
        boards.push(util.readJsonFileSync(`./board/${dirEntry.name}`));
      }
    }

    await req.respond({
      status: 200,
      headers: new Headers({
        "content-type": "application/json",
      }),
      body: JSON.stringify(boards),
    });
  } catch (e) {
    await req.respond(util.errorResponse(e.message));
  }
};

//#endregion

//#region プレイヤー登録・ルームID取得API

interface IMatchRequest {
  name?: string;
  id?: string;
  password: string;
  spec?: string;
  gameId?: string;
  useAi?: boolean;
  aiOption?: {
    aiName: string;
    boardName?: string;
  };
}

export const match = async (req: ServerRequest) => {
  //console.log(req, "newPlayer");
  try {
    const reqData = (await req.json()) as IMatchRequest;
    //console.log(reqData);

    const identifier = reqData.id || reqData.name;
    if (!identifier) throw Error("Invalid id or name.");

    const user = accounts.getUser(identifier, reqData.password);

    const player = kkmm.createPlayer(user.id, reqData.spec);
    if (reqData.gameId) {
      const game = [...kkmm_self.getGames(), ...kkmm.getGames()].find((game) =>
        game.uuid === reqData.gameId
      );
      if (game) {
        if (game.attachPlayer(player) === false) {
          throw Error("Game is not free");
        }
      } else {
        throw Error("Can not find Game");
      }
    } else if (reqData.useAi) {
      const aiFolderPath = resolve("../client_deno/");
      const ai = aiList.find((e) => e.name === reqData.aiOption?.aiName);
      if (ai) {
        const bname = reqData.aiOption?.boardName || boardname ||
          await getRandomBoardName();
        const brd = readBoard(bname);
        const game = kkmm.createGame(brd);
        game.changeFuncs.push(sendAllGame);
        game.changeFuncs.push(sendGame);
        game.attachPlayer(player);
        Deno.run(
          {
            cmd: [
              "deno",
              "run",
              "-A",
              aiFolderPath + ai.filePath,
              "--local",
              "--nolog",
              "--gameId",
              game.uuid,
            ],
          },
        );
      } else {
        throw Error("Can not find AI");
      }
    } else {
      const freeGame = kkmm.getFreeGames();
      if (freeGame.length == 0) {
        const bname = boardname || await getRandomBoardName();
        const brd = readBoard(bname);
        const game = kkmm.createGame(brd);
        game.changeFuncs.push(sendAllGame);
        game.changeFuncs.push(sendGame);

        freeGame.push(game);
      }
      if (freeGame[0].attachPlayer(player) === false) {
        throw Error("Can not add Player");
      }
      //console.log(player);
    }
    await req.respond({
      status: 200,
      headers: new Headers({
        "content-type": "application/json",
      }),
      body: JSON.stringify(player.getJSON()),
    });
  } catch (e) {
    await req.respond(util.errorResponse(e.message));
  }
};

// #endregion

//#region 試合状態取得API
export const getGameInfo = async (req: ServerRequest) => {
  try {
    const id = req.match[1];
    const game = [
      ...kkmm.getGames(),
      ...kkmm_self.getGames(),
      ...LogFileOp.getLogGames(),
    ]
      .find((item) => item.uuid === id);
    if (game) {
      game.updateStatus();

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
    await req.respond(util.errorResponse(e.message));
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

    const game = [...kkmm.getGames(), ...kkmm_self.getGames()].find((
      item: any,
    ) => item.uuid === gameId);
    if (!game) throw Error("Invalid gameId");
    const player = game.players.find((p: any) => p.accessToken === accessToken);
    if (player === undefined) {
      throw Error("Invalid accessToken.");
    }
    const actionData = (await req.json()) as SetActionPost;
    const isDisable = actionData.actions.some((a) => !ActionPost.isEnable(a));
    //console.log(actionData);
    if (isDisable) {
      throw Error("Invalid action");
    }
    const actionsAry: any = [];
    actionData.actions.forEach((a) => {
      actionsAry.push([a.agentId, ActionPost.getType(a.type), a.x, a.y]);
    });
    //console.log(game.nextTurnUnixTime);
    //if (game.nextTurnUnixTime >= reqTime) {
    //console.log(actionsAry);
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
  } catch (e) {
    await req.respond(util.errorResponse(e.message));
  }
};

//#endregion

//#region WebSocket

let socks: WebSocket[] = [];

const ws_AllGame = async (sock: WebSocket) => {
  socks.push(sock);
  sock.send(
    JSON.stringify([
      kkmm.getGames(),
      kkmm_self.getGames(),
      LogFileOp.getLogGames(),
    ]),
  );

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

let sendAllGameQue = 0;

setInterval(() => {
  if (sendAllGameQue === 0) return;
  sendAllGameQue = 0;
  const games = [
    kkmm.getGames(),
    kkmm_self.getGames(),
    LogFileOp.getLogGames(),
  ];

  socks = socks.filter((s) => {
    try {
      if (!s.isClosed) {
        s.send(
          JSON.stringify(games),
        );
        return true;
      }
    } catch (e) {
      console.log(e);
    }
    return false;
  });
}, 1000);

const sendAllGame = () => {
  sendAllGameQue++;
};

let getGameSocks: { sock: WebSocket; id: string }[] = [];

const ws_getGame = async (sock: WebSocket, req: ServerRequest) => {
  const id = req.match[1];

  const game = getGame(id);
  if (game) {
    sock.send(JSON.stringify(game));
    if (!game.ending) {
      getGameSocks.push({ sock: sock, id: id });
      for await (const msg of sock) {
      }
    }
  }
  if (!sock.isClosed) {
    sock.close();
  }
};
const sendGame = (id: string) => {
  const game = getGame(id);
  if (game) {
    getGameSocks = getGameSocks.filter((e) => {
      if (e.id === id) {
        try {
          if (!e.sock.isClosed) {
            e.sock.send(JSON.stringify(game));
            return true;
          }
        } catch (e) {
          console.log(e);
        }
        return false;
      } else return true;
    });
  }
};

const getGame = (id: string): any => {
  const games = [
    kkmm.getGames(),
    kkmm_self.getGames(),
    LogFileOp.getLogGames(),
  ];
  //console.log(games);
  //console.log("getGame!!", id);
  try {
    if (id) return games.flat().find((e) => (e.uuid || e.gameId) === id);
    else return games[0].reverse()[0];
  } catch (e) {
    console.log(e);
    return undefined;
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
  router.get("users/search", usersSearch);

  router.post(
    "game/create",
    contentTypeFilter("application/json"),
    createSelfGame,
  );
  router.get("game/boards", getAllBoards);

  router.post("match", contentTypeFilter("application/json"), match);
  router.get(new RegExp("^match/(.+)$"), getGameInfo);
  router.post(new RegExp("^match/(.+)/action$"), setAction);

  //router.get("allPastGame", allPastGame);
  router.ws("allGame", ws_AllGame);
  router.ws(new RegExp("^ws/game/(.+)$"), ws_getGame);
  //router.ws("allSelfGame", ws_AllSelfGame);

  router.route("tournament", tournamentRouter());
  return router;
};

// Port Listen
const app = createApp();
app.use(serveStatic(resolve("../public")));
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
  const path = resolve(`./board/${fileName}.json`);
  if (Deno.statSync(path).isFile) {
    const boardJson = JSON.parse(
      Deno.readTextFileSync(path),
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
  } else {
    throw Error("Can not find Board");
  }
};

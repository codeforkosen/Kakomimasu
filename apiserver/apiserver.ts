//import type { WebSocket } from "./deps.ts";
import type { WebSocket } from "./mod.ts";
import { config, createApp, createRouter, ServerRequest } from "./deps.ts";

import * as util from "./apiserver_util.ts";
const resolve = util.pathResolver(import.meta);

import { Board, ExpKakomimasu } from "./parts/expKakomimasu.ts";
import { errorCodeResponse } from "./error.ts";

const env = config({
  path: resolve("./.env"),
  defaults: resolve("./.env.default"),
});
const port = parseInt(env.port);

import { LogFileOp } from "./parts/file_opration.ts";

import { tournamentRouter, tournaments } from "./tournament.ts";
import { accounts, userRouter } from "./user.ts";
import { gameRouter } from "./game.ts";
import { matchRouter } from "./match.ts";
import { viewerRoutes } from "./viewer.ts";

export const kkmm = new ExpKakomimasu();
kkmm.games.push(...LogFileOp.read());

accounts.dataCheck(kkmm.getGames());
tournaments.dataCheck(kkmm.getGames());

//#region WebSocket
let socks: WebSocket[] = [];

const wsAllGame = async (sock: WebSocket) => {
  await sock.send(
    JSON.stringify(kkmm.getGames()),
  );
  socks.push(sock);

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
  const games = kkmm.getGames();

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

export const sendAllGame = () => {
  sendAllGameQue++;
};

let getGameSocks: { sock: WebSocket; id: string }[] = [];

const wsGetGame = async (sock: WebSocket, req: ServerRequest) => {
  const id = req.match[1];

  const game = getGame(id);
  if (game) {
    await sock.send(JSON.stringify(game));
    if (!game.ending) {
      getGameSocks.push({ sock: sock, id: id });
      for await (const _msg of sock) {
        //
      }
    }
  }
  if (!sock.isClosed) {
    sock.close();
  }
};
export const sendGame = (id: string) => {
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

const getGame = (id: string) => {
  return kkmm.getGames().find((e) => e.uuid === id);
};

const apiRoutes = () => {
  const router = createRouter();

  router.ws("allGame", wsAllGame);
  router.ws(new RegExp("^ws/game/(.+)$"), wsGetGame);

  router.route("match", matchRouter());
  router.route("game", gameRouter());
  router.route("users", userRouter());
  router.route("tournament", tournamentRouter());
  router.catch(async (err, req) => {
    await req.respond(errorCodeResponse(err));
  });
  return router;
};

// Port Listen
const app = createApp();
//app.use(serveJsx(resolve("../pages"), (f) => import("file:///" + f), Layout));
app.route("/api/", apiRoutes());
app.route("/", viewerRoutes());

app.listen({ port });

export const readBoard = (fileName: string) => {
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

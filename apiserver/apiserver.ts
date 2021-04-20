//import type { WebSocket } from "https://deno.land/std@0.89.0/ws/mod.ts";
import type { WebSocket } from "./mod.ts";
import {
  createApp,
  createRouter,
  ServerRequest,
  serveStatic,
} from "https://deno.land/x/servest@v1.3.0/mod.ts";

import * as util from "./apiserver_util.ts";
const resolve = util.pathResolver(import.meta);

import { Board, ExpKakomimasu } from "./parts/expKakomimasu.ts";
import { errorCodeResponse } from "./error.ts";

import { config } from "https://deno.land/x/dotenv@v2.0.0/mod.ts";
const env = config({
  path: resolve("./.env"),
  defaults: resolve("./.env.default"),
});
const port = parseInt(env.port);

import { LogFileOp } from "./parts/file_opration.ts";

import { tournamentRouter } from "./tournament.ts";
import { accounts, userRouter } from "./user.ts";
import { gameRouter } from "./game.ts";
import { matchRouter } from "./match.ts";

export const kkmm = new ExpKakomimasu();
kkmm.games.push(...LogFileOp.read());

accounts.dataCheck(kkmm.getGames());

//#region WebSocket
let socks: WebSocket[] = [];

const ws_AllGame = async (sock: WebSocket) => {
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

const ws_getGame = async (sock: WebSocket, req: ServerRequest) => {
  const id = req.match[1];

  const game = getGame(id);
  if (game) {
    await sock.send(JSON.stringify(game));
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

const getGame = (id: string): any => {
  const games = kkmm.getGames();
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

  router.ws("allGame", ws_AllGame);
  router.ws(new RegExp("^ws/game/(.+)$"), ws_getGame);

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

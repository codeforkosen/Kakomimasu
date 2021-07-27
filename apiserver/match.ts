import { config, createRouter } from "./deps.ts";

import {
  contentTypeFilter,
  jsonParse,
  jsonResponse,
  pathResolver,
} from "./apiserver_util.ts";

const resolve = pathResolver(import.meta);

import util from "../util.js";
import { accounts } from "./user.ts";
import { sendGame } from "./ws.ts";
import { errors, ServerError } from "./error.ts";
import { kkmm } from "./apiserver.ts";
import { aiList } from "./parts/ai-list.ts";
import { Action } from "./parts/expKakomimasu.ts";
import {
  ActionPost as IActionPost,
  ActionReq,
  ActionRes,
  MatchReq,
} from "./types.ts";
import { auth } from "./middleware.ts";

const env = config({
  path: resolve("./.env"),
  defaults: resolve("./.env.default"),
});
const boardname = env.boardname; // || "E-1"; // "F-1" "A-1"
import { BoardFileOp } from "./parts/file_opration.ts";

const getRandomBoardName = async () => {
  const bd = Deno.readDir(resolve("./board"));
  const list = [];
  for await (const b of bd) {
    if (b.name.endsWith(".json")) {
      list.push(b.name.substring(0, b.name.length - 5));
    }
  }
  return list[util.rnd(list.length)];
};

class ActionPost implements IActionPost {
  constructor(
    public agentId: number,
    public type: string,
    public x: number,
    public y: number,
  ) {}

  static isEnable(a: ActionPost) {
    if (
      a.agentId === undefined || a.type === undefined || a.x === undefined ||
      a.y === undefined
    ) {
      return false;
    } else return true;
  }
}

export const matchRouter = () => {
  const router = createRouter();

  router.post(
    "/",
    contentTypeFilter("application/json"),
    auth({ bearer: true }),
    jsonParse(),
    async (req) => {
      const reqData = req.get("data") as Partial<MatchReq>;
      //console.log(reqData);
      const authedUserId = req.getString("authed_userId");

      const user = accounts.getUsers().find((user) => user.id === authedUserId);
      if (!user) throw new ServerError(errors.NOT_USER);

      const player = kkmm.createPlayer(user.id, reqData.spec);
      if (reqData.gameId) {
        const game = kkmm.getGames().find((
          game,
        ) => game.uuid === reqData.gameId);
        if (!game) throw new ServerError(errors.NOT_GAME);
        if (!reqData.option?.dryRun) {
          if (game.attachPlayer(player) === false) {
            throw new ServerError(errors.NOT_FREE_GAME);
            //throw Error("Game is not free");
          }
        }
        //accounts.addGame(user.userId, game.uuid);
      } else if (reqData.useAi) {
        const aiFolderPath = resolve("../client_deno/");
        const ai = aiList.find((e) => e.name === reqData.aiOption?.aiName);
        if (!ai) throw new ServerError(errors.NOT_AI);
        const bname = reqData.aiOption?.boardName || boardname ||
          await getRandomBoardName();
        const brd = BoardFileOp.get(bname); //readBoard(bname);
        if (!brd) throw new ServerError(errors.INVALID_BOARD_NAME);
        if (!reqData.option?.dryRun) {
          const game = kkmm.createGame(brd);
          game.name =
            `対AI戦：${user.screenName}(@${user.name}) vs AI(${ai.name})`;

          game.changeFuncs.push(sendGame(game));
          game.attachPlayer(player);
          //accounts.addGame(user.userId, game.uuid);
          Deno.run(
            {
              cmd: [
                "deno",
                "run",
                "-A",
                aiFolderPath + ai.filePath,
                "--local",
                "--aiOnly",
                "--nolog",
                "--gameId",
                game.uuid,
              ],
            },
          );
        }
      } else {
        const freeGame = kkmm.getFreeGames();
        if (!reqData.option?.dryRun) {
          if (freeGame.length === 0) {
            const bname = boardname || await getRandomBoardName();
            const brd = BoardFileOp.get(bname); //readBoard(bname);
            if (!brd) throw new ServerError(errors.INVALID_BOARD_NAME);
            const game = kkmm.createGame(brd);
            game.changeFuncs.push(sendGame(game));
            freeGame.push(game);
          }
          freeGame[0].attachPlayer(player);
          //console.log(player);
        }
      }
      await req.respond(jsonResponse(player.getJSON()));
    },
  );
  router.get(new RegExp("^/(.+)$"), async (req) => {
    const id = req.match[1];
    const game = kkmm.getGames().find((item) => item.uuid === id);
    if (!game) throw new ServerError(errors.NOT_GAME);
    await req.respond(jsonResponse(game));
  });
  router.post(
    new RegExp("^/(.+)/action$"),
    contentTypeFilter("application/json"),
    auth({ bearer: true }),
    jsonParse(),
    async (req) => {
      //console.log(req, "SetAction");

      // Actionを受け取った時刻を取得
      const reqTime = new Date().getTime() / 1000;

      const gameId = req.match[1];

      const game = kkmm.getGames().find((item) => item.uuid === gameId);
      if (!game) throw new ServerError(errors.NOT_GAME);

      const authedUserId = req.getString("authed_userId");
      const player = game.players.find((p) => p.id === authedUserId);
      if (!player) throw new ServerError(errors.INVALID_USER_AUTHORIZATION);

      const actionData = req.get("data") as ActionReq;
      if (actionData.actions.some((a) => !ActionPost.isEnable(a))) {
        throw new ServerError(errors.INVALID_ACTION);
      }

      const getType = (type: string) => {
        if (type === "PUT") return Action.PUT;
        else if (type === "NONE") return Action.NONE;
        else if (type === "MOVE") return Action.MOVE;
        else if (type === "REMOVE") return Action.REMOVE;
        return Action.NONE;
      };

      const actionsAry: [number, ReturnType<typeof getType>, number, number][] =
        actionData.actions.map((a) => [a.agentId, getType(a.type), a.x, a.y]);
      let nowTurn;
      if (!actionData.option?.dryRun) {
        nowTurn = player.setActions(Action.fromJSON(actionsAry));
      } else {
        nowTurn = game.turn;
      }

      const resData: ActionRes = {
        receptionUnixTime: Math.floor(reqTime),
        turn: nowTurn,
      };

      await req.respond(
        jsonResponse(resData),
      );
    },
  );

  return router;
};

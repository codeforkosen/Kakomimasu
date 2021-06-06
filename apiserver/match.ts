import {
  contentTypeFilter,
  createRouter,
} from "https://deno.land/x/servest@v1.3.0/mod.ts";

import { jsonResponse, pathResolver } from "./apiserver_util.ts";

const resolve = pathResolver(import.meta);

import util from "../util.js";
import { accounts } from "./user.ts";
import { ApiOption } from "./parts/interface.ts";
import { errors, ServerError } from "./error.ts";
import { kkmm, sendAllGame, sendGame } from "./apiserver.ts";
import { aiList } from "./parts/ai-list.ts";
import { Action } from "./parts/expKakomimasu.ts";

import { config } from "./deps.ts";
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

interface IMatchRequest extends ApiOption {
  name?: string;
  id?: string;
  password?: string;
  spec?: string;
  gameId?: string;
  useAi?: boolean;
  aiOption?: {
    aiName: string;
    boardName?: string;
  };
}

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

interface SetActionPost extends ApiOption {
  actions: ActionPost[];
}

export const matchRouter = () => {
  const router = createRouter();

  router.post("/", contentTypeFilter("application/json"), async (req) => {
    const reqData = await req.json() as IMatchRequest;
    //console.log(reqData);

    const identifier = reqData.id || reqData.name;
    if (!identifier) throw new ServerError(errors.INVALID_USER_IDENTIFIER);

    if (!reqData.password) throw new ServerError(errors.NOTHING_PASSWORD);
    const user = accounts.getUser(identifier, reqData.password);

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
      //accounts.addGame(user.id, game.uuid);
    } else if (reqData.useAi) {
      const aiFolderPath = resolve("../client_deno/");
      const ai = aiList.find((e) => e.name === reqData.aiOption?.aiName);
      if (!ai) throw new ServerError(errors.NOT_AI);
      const bname = reqData.aiOption?.boardName || boardname ||
        await getRandomBoardName();
      const brd = BoardFileOp.get(bname); //readBoard(bname);
      if (!reqData.option?.dryRun) {
        const game = kkmm.createGame(brd);
        game.name = `対AI戦：${user.screenName}(@${user.name}) vs AI(${ai.name})`;

        game.changeFuncs.push(sendAllGame);
        game.changeFuncs.push(sendGame);
        game.attachPlayer(player);
        //accounts.addGame(user.id, game.uuid);
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
      }
    } else {
      const freeGame = kkmm.getFreeGames();
      if (!reqData.option?.dryRun) {
        if (freeGame.length === 0) {
          const bname = boardname || await getRandomBoardName();
          const brd = BoardFileOp.get(bname); //readBoard(bname);
          const game = kkmm.createGame(brd);
          game.changeFuncs.push(sendAllGame);
          game.changeFuncs.push(sendGame);

          freeGame.push(game);
        }
        freeGame[0].attachPlayer(player);
        //console.log(player);
      }
    }
    await req.respond(jsonResponse(player.getJSON()));
  });
  router.get(new RegExp("^/(.+)$"), async (req) => {
    const id = req.match[1];
    const game = kkmm.getGames().find((item) => item.uuid === id);
    if (!game) throw new ServerError(errors.NOT_GAME);
    await req.respond(jsonResponse(game));
  });
  router.post(new RegExp("^/(.+)/action$"), async (req) => {
    //console.log(req, "SetAction");

    // Actionを受け取った時刻を取得
    const reqTime = new Date().getTime() / 1000;

    const gameId = req.match[1];
    const accessToken = req.headers.get("Authorization");

    const game = kkmm.getGames().find((item: any) => item.uuid === gameId);
    if (!game) throw new ServerError(errors.NOT_GAME);
    const player = game.players.find((p: any) => p.accessToken === accessToken);
    if (!player) throw new ServerError(errors.INVALID_ACCESSTOKEN);

    const actionData = (await req.json()) as SetActionPost;
    if (actionData.actions.some((a) => !ActionPost.isEnable(a))) {
      throw new ServerError(errors.INVALID_ACTION);
    }
    const actionsAry: any = [];
    actionData.actions.forEach((a) => {
      actionsAry.push([a.agentId, ActionPost.getType(a.type), a.x, a.y]);
    });
    let nowTurn;
    if (!actionData.option?.dryRun) {
      nowTurn = player.setActions(Action.fromJSON(actionsAry));
    } else {
      nowTurn = game.turn;
    }

    await req.respond(
      jsonResponse({ receptionUnixTime: Math.floor(reqTime), turn: nowTurn }),
    );
  });

  return router;
};

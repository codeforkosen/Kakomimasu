import {
  contentTypeFilter,
  createRouter,
} from "https://servestjs.org/@v1.1.9/mod.ts";

import {
  jsonResponse,
  pathResolver,
  readJsonFileSync,
} from "./apiserver_util.ts";

const resolve = pathResolver(import.meta);

import util from "../util.js";
import { accounts } from "./user.ts";
import { ApiOption } from "./parts/interface.ts";
import { errorCodeResponse, errors, ServerError } from "./error.ts";
import {
  kkmm,
  kkmm_self,
  readBoard,
  sendAllGame,
  sendGame,
} from "./apiserver.ts";
import { aiList } from "./parts/ai-list.ts";
import { Action } from "../Kakomimasu.js";

import { config } from "https://deno.land/x/dotenv@v2.0.0/mod.ts";
const env = config({
  path: resolve("./.env"),
  defaults: resolve("./.env.default"),
});
const boardname = env.boardname; // || "E-1"; // "F-1" "A-1"
import { LogFileOp } from "./parts/file_opration.ts";

const getRandomBoardName = async () => {
  const bd = Deno.readDir("board");
  const list = [];
  for await (const b of bd) {
    if (b.name.endsWith(".json")) {
      list.push(b.name.substring(0, b.name.length - 5));
    }
  }
  return list[util.rnd(list.length)];
};

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

export const matchRouter = () => {
  const router = createRouter();

  router.post("/", contentTypeFilter("application/json"), async (req) => {
    try {
      const reqData = (await req.json()) as IMatchRequest;
      //console.log(reqData);

      const identifier = reqData.id || reqData.name;
      if (!identifier) throw Error("Invalid id or name.");

      const user = accounts.getUser(identifier, reqData.password);

      const player = kkmm.createPlayer(user.id, reqData.spec);
      if (reqData.gameId) {
        const game = [...kkmm_self.getGames(), ...kkmm.getGames()].find((
          game,
        ) => game.uuid === reqData.gameId);
        if (game) {
          if (game.attachPlayer(player) === false) {
            throw Error("Game is not free");
          }
          accounts.addGame(user.id, game.uuid);
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
          accounts.addGame(user.id, game.uuid);
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
      await req.respond(errorCodeResponse(e));
    }
  });
  router.get(new RegExp("^/(.+)$"), async (req) => {
    try {
      //console.log(LogFileOp.getLogGames());
      const id = req.match[1];
      const game = [
        ...kkmm.getGames(),
        ...kkmm_self.getGames(),
        ...LogFileOp.getLogGames(),
      ]
        .find((item) => (item.uuid === id) || (item.gameId === id));
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
      await req.respond(errorCodeResponse(e));
    }
  });
  router.post(new RegExp("^/(.+)/action$"), async (req) => {
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
      const player = game.players.find((p: any) =>
        p.accessToken === accessToken
      );
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
      await req.respond(errorCodeResponse(e));
    }
  });

  return router;
};

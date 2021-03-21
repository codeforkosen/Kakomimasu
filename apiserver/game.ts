import {
  contentTypeFilter,
  createRouter,
} from "https://servestjs.org/@v1.1.9/mod.ts";

import {
  errorResponse,
  jsonResponse,
  readJsonFileSync,
} from "./apiserver_util.ts";
import util from "../util.js";
import { accounts } from "./user.ts";
import { ApiOption } from "./parts/interface.ts";
import { errorCodeResponse, errors, ServerError } from "./error.ts";
import { kkmm_self, readBoard, sendAllGame, sendGame } from "./apiserver.ts";
import { tournaments } from "./tournament.ts";
import { BoardFileOp } from "./parts/file_opration.ts";

import { ExpGame } from "./parts/expKakomimasu.js";

interface ICreateGameReq extends ApiOption {
  name?: string;
  boardName?: string; // 必須
  nPlayer?: number;
  playerIdentifiers?: string[];
  tournamentId?: string;
}

export const gameRouter = () => {
  const router = createRouter();

  router.post(
    "/create",
    contentTypeFilter("application/json"),
    async (req) => {
      try {
        const reqJson = (await req.json()) as ICreateGameReq;
        if (!reqJson.boardName) {
          throw new ServerError(errors.INVALID_BOARD_NAME);
        }
        const board = BoardFileOp.get(reqJson.boardName);
        board.nplayer = reqJson.nPlayer || 2;

        let game: ExpGame;
        if (!reqJson.option?.dryRun) {
          game = kkmm_self.createGame(board, reqJson.name);

          game.changeFuncs.push(sendAllGame);
          game.changeFuncs.push(sendGame);
          sendAllGame();
        } else game = new ExpGame(board, reqJson.name);

        if (reqJson.playerIdentifiers) {
          if (reqJson.playerIdentifiers.map) {
            const userIds = reqJson.playerIdentifiers.map((e) => {
              const id = accounts.find(e)?.id;
              if (!id) throw new ServerError(errors.NOT_USER);
            });
            userIds.forEach((userId) => {
              if (!game.addReservedUser(userId)) {
                throw new ServerError(errors.ALREADY_REGISTERED_USER);
              }
            });
          } else {
            throw new ServerError(errors.INVALID_PLAYER_IDENTIFIERS);
          }
        }
        if (reqJson.tournamentId) {
          const tournament = tournaments.get(reqJson.tournamentId);
          if (!tournament) throw new ServerError(errors.INVALID_TOURNAMENT_ID);

          if (!reqJson.option?.dryRun) {
            tournaments.addGame(reqJson.tournamentId, game.uuid);
          }
        }

        await req.respond(jsonResponse(game));
        //console.log(kkmm_self);
      } catch (e) {
        //console.log(e);
        await req.respond(errorCodeResponse(e));
      }
    },
  );
  router.get("/boards", async (req) => {
    try {
      const boards = BoardFileOp.getAll();
      //console.log(boards);
      await req.respond(jsonResponse(boards));
    } catch (e) {
      await req.respond(errorCodeResponse(e));
    }
  });

  return router;
};

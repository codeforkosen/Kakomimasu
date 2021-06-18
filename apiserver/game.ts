import { contentTypeFilter, createRouter } from "./deps.ts";

import { jsonResponse } from "./apiserver_util.ts";
import { accounts } from "./user.ts";
import { errors, ServerError } from "./error.ts";
import { kkmm, sendAllGame, sendGame } from "./apiserver.ts";
import { tournaments } from "./tournament.ts";
import { BoardFileOp } from "./parts/file_opration.ts";
import { GameCreateReq } from "./types.ts";

import { ExpGame } from "./parts/expKakomimasu.ts";

export const gameRouter = () => {
  const router = createRouter();

  router.post(
    "/create",
    contentTypeFilter("application/json"),
    async (req) => {
      const reqJson = (await req.json()) as GameCreateReq;
      if (!reqJson.boardName) {
        throw new ServerError(errors.INVALID_BOARD_NAME);
      }
      const board = BoardFileOp.get(reqJson.boardName);
      if (!board) throw new ServerError(errors.INVALID_BOARD_NAME);
      board.nplayer = reqJson.nPlayer || 2;

      let game: ExpGame;
      if (!reqJson.option?.dryRun) {
        game = kkmm.createGame(board, reqJson.name);
        game.type = "self";

        game.changeFuncs.push(sendAllGame);
        game.changeFuncs.push(sendGame);
        sendAllGame();
      } else game = new ExpGame(board, reqJson.name);

      if (reqJson.playerIdentifiers) {
        if (reqJson.playerIdentifiers.map) {
          const userIds = reqJson.playerIdentifiers.map((e) => {
            const id = accounts.find(e)?.id;
            if (!id) throw new ServerError(errors.NOT_USER);
            return id;
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
    },
  );
  router.get("/boards", async (req) => {
    const boards = BoardFileOp.getAll();
    //console.log(boards);
    await req.respond(jsonResponse(boards));
  });

  return router;
};

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
/*
const createSelfGame = async (req: ServerRequest) => {
  try {
    const reqJson = (await req.json()) as ICreateGameReq;
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
};*/
/*
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
};*/

interface ICreateGameReq {
  name: string; // 必須
  boardName: string; // 必須
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
        //console.log(reqJson);
        //if (!reqJson.boardName) throw new ServerError

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

        await req.respond(jsonResponse(JSON.stringify(game)));
        //console.log(kkmm_self);
      } catch (e) {
        await req.respond(errorResponse(e.message));
      }
    },
  );
  router.get("/boards", async (req) => {
    try {
      const boards = [];
      if (Deno.statSync("./board").isDirectory) {
        for (const dirEntry of Deno.readDirSync("./board")) {
          boards.push(readJsonFileSync(`./board/${dirEntry.name}`));
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
      await req.respond(errorResponse(e.message));
    }
  });

  return router;
};

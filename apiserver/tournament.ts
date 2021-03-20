import { createRouter } from "https://servestjs.org/@v1.1.9/mod.ts";

import { errorResponse, jsonResponse } from "./apiserver_util.ts";
import util from "../util.js";
import { TournamentFileOp } from "./parts/file_opration.ts";
import { accounts } from "./user.ts";
import { ApiOption } from "./parts/interface.ts";
import { errorCodeResponse, errors, ServerError } from "./error.ts";

type TournamentType = "round-robin" | "knockout";

const checkType = (type: string): boolean => {
  if (type === "round-robin") return true;
  if (type === "knockout") return true;
  return false;
};

export interface ITournamentBasic {
  name: string;
  organizer?: string;
  type: TournamentType;
  remarks?: string;
}

export interface ITournamentReq extends ITournamentBasic, ApiOption {
  participants?: string[];
}

export interface ITournament extends ITournamentBasic {
  users?: string[];
  id?: string;
  gameIds?: string[];
}

export interface ITournamentDeleteReq extends ApiOption {
  id: string;
}

export interface ITournamentAddUserReq extends ApiOption {
  user: string;
}

export class Tournament implements ITournament {
  public id: string;
  public name: string;
  public organizer: string;
  public type: TournamentType;
  public remarks: string;
  public users: string[];
  public gameIds: string[];

  constructor(a: ITournament) {
    this.name = a.name;
    this.organizer = a.organizer || "";
    this.type = a.type;
    this.remarks = a.remarks || "";
    this.id = a.id || util.uuid();
    this.users = a.users || [];
    this.gameIds = a.gameIds || [];
  }

  addUser(identifier: string) {
    const user = accounts.find(identifier);
    if (!user) throw new ServerError(errors.NOT_USER);

    const some = this.users.some((e) => e === user.id);
    if (some) throw new ServerError(errors.ALREADY_REGISTERED_USER);
    else this.users.push(user.id);
  }
}

export class Tournaments {
  private tournaments: Tournament[] = [];

  constructor() {
    this.read();
  }
  read = () => {
    this.tournaments.length = 0;
    const data = TournamentFileOp.read();
    data.forEach((e) => {
      this.tournaments.push(new Tournament(e));
    });
  };
  save = () => TournamentFileOp.save(this.tournaments);

  get = (id: string) => {
    return this.tournaments.find((e) => e.id === id);
  };

  getAll = () => {
    return this.tournaments;
  };

  add(tournament: Tournament) {
    this.tournaments.push(tournament);
    this.save();
  }
  delete(tournament: Tournament) {
    this.tournaments = this.tournaments.filter((e) => e.id !== tournament.id);
    this.save();
  }

  addUser(tournamentId: string, identifier: string) {
    const tournament = this.get(tournamentId);
    if (!tournament) throw new ServerError(errors.INVALID_TOURNAMENT_ID);

    //console.log(tournament);
    tournament.addUser(identifier);
    this.save();

    return tournament;
  }

  addGame(tournamentId: string, gameId: string) {
    const tournament = this.get(tournamentId);
    if (!tournament) throw Error("Invalid tournament id");

    tournament.gameIds.push(gameId);
    this.save();
  }
}

export const tournaments = new Tournaments();

export const tournamentRouter = () => {
  const router = createRouter();

  // 大会登録
  router.post("/create", async (req) => {
    try {
      const data = await req.json() as ITournamentReq;
      if (!data.name) throw new ServerError(errors.INVALID_TOURNAMENT_NAME);
      if (!data.type || !checkType(data.type)) {
        throw new ServerError(errors.INVALID_TYPE);
      }
      const tournament = new Tournament(data);
      if (data.participants) {
        data.participants.forEach((e) => tournament.addUser(e));
      }
      if (data.option?.dryRun !== true) {
        tournaments.add(tournament);
      }

      await req.respond(jsonResponse(tournament));
    } catch (e) {
      req.respond(errorCodeResponse(e));
    }
  });

  // 大会削除
  router.post("/delete", async (req) => {
    try {
      const data = await req.json() as ITournamentDeleteReq;
      if (!data.id) throw new ServerError(errors.INVALID_TOURNAMENT_ID);

      const tournament = tournaments.get(data.id);
      if (!tournament) throw new ServerError(errors.NOTHING_TOURNAMENT_ID);

      if (data.option?.dryRun !== true) {
        tournaments.delete(tournament);
      }

      await req.respond(jsonResponse(tournament));
    } catch (e) {
      req.respond(errorCodeResponse(e));
    }
  });

  // 大会取得
  router.get("/getAll", async (req) => {
    try {
      const query = req.query;
      const id = query.get("id");
      const resData = id ? tournaments.get(id) : tournaments.getAll();
      if (!resData) throw new ServerError(errors.NOTHING_TOURNAMENT_ID);

      await req.respond(jsonResponse(resData));
    } catch (e) {
      await req.respond(errorCodeResponse(e));
    }
  });

  // 参加者追加
  router.post("/add", async (req) => {
    try {
      const query = req.query;
      const tournamentId = query.get("id");
      console.log(tournamentId);
      if (!tournamentId) throw new ServerError(errors.INVALID_TOURNAMENT_ID);
      let tournament = tournaments.get(tournamentId);
      if (!tournament) throw new ServerError(errors.INVALID_TOURNAMENT_ID);

      const body = await req.json() as ITournamentAddUserReq;
      const identifier = body.user;
      if (!identifier) throw new ServerError(errors.INVALID_USER_IDENTIFIER);

      if (body.option?.dryRun !== true) {
        tournament = tournaments.addUser(tournamentId, identifier);
      } else {
        tournament = new Tournament(tournament);
        tournament.addUser(identifier);
      }

      await req.respond(jsonResponse(tournament));
    } catch (e) {
      req.respond(errorCodeResponse(e));
    }
  });

  return router;
};

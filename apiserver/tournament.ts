console.log("tournament.ts");

import { createRouter } from "https://servestjs.org/@v1.1.9/mod.ts";

import { errorResponse } from "./apiserver_util.ts";
import util from "../util.js";
import { TournamentFileOp } from "./parts/file_opration.ts";
import { User, Users } from "./user.ts";

import { accounts } from "./apiserver.ts";

type TournamentType = "round-robin" | "knockout";

enum Result {
  Draw,
  Win,
  Lose,
}

export interface ITournamentBasic {
  name: string;
  organizer: string;
  type: TournamentType;
  remarks: string;
}

export interface ITournamentReq extends ITournamentBasic {
  participants: string[];
}

export interface ITournament extends ITournamentBasic {
  users?: string[];
  id?: string;
  gameIds?: string[];
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
    this.organizer = a.organizer;
    this.type = a.type;
    this.remarks = a.remarks;
    this.id = a.id || util.uuid();
    this.users = a.users || [];
    this.gameIds = a.gameIds || [];
  }

  addUser(identifier: string) {
    const user = accounts.find(identifier);
    if (!user) throw Error("Invalid userId or userName");

    const some = this.users.some((e) => e === user.id);
    if (some) throw Error("User is already registered");
    else this.users.push(user.id);
  }

  static convertTournamentReq(data: ITournamentReq) {
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

  addUser(tournamentId: string, identifier: string) {
    const tournament = this.get(tournamentId);
    if (!tournament) throw Error("Invalid tournament id");

    console.log(tournament);
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

  router.post("/create", async (req) => {
    try {
      const data = await req.json() as ITournamentReq;
      const tournament = new Tournament(data);
      data.participants.forEach((e) => tournament.addUser(e));
      tournaments.add(tournament);

      await req.respond({
        status: 200,
        headers: new Headers({
          "content-type": "application/json",
        }),
        body: JSON.stringify(tournament),
      });
    } catch (e) {
      req.respond(errorResponse(e.message));
    }
  });

  router.get("/get", async (req) => {
    try {
      const query = req.query;
      const id = query.get("id");
      const resData = id ? tournaments.get(id) : tournaments.getAll();
      if (!resData) throw Error("Invalid tournament tournamentId");
      req.respond({
        status: 200,
        headers: new Headers({
          "content-type": "application/json",
        }),
        body: JSON.stringify(resData),
      });
    } catch (e) {
      req.respond(errorResponse(e.message));
    }
  });

  router.post("/add", async (req) => {
    try {
      const query = req.query;
      const tournamentId = query.get("id");
      if (!tournamentId) throw Error("Nothing tournament id");

      const body = await req.json();
      const identifier = body.user;

      const tournament = tournaments.addUser(tournamentId, identifier);

      req.respond({
        status: 200,
        headers: new Headers({
          "content-type": "application/json",
        }),
        body: JSON.stringify(tournament),
      });
    } catch (e) {
      req.respond(errorResponse(e.message));
    }
  });

  return router;
};

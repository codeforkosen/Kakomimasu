import { Board } from "../../Kakomimasu.js";

import { pathResolver } from "../apiserver_util.ts";

import { IBoard } from "./interface.ts";
import { IUser } from "../user.ts";
import { ITournament, Tournament } from "../tournament.ts";
import { ExpGame } from "./expKakomimasu.ts";

const resolve = pathResolver(import.meta);

const writeJsonFileSync = (path: string | URL, json: any) => {
  Deno.writeTextFileSync(path, JSON.stringify(json));
};
const readJsonFileSync = (path: string | URL) => {
  return JSON.parse(Deno.readTextFileSync(path));
};

export class UserFileOp {
  private static dir = resolve("../data");
  private static path = UserFileOp.dir + "/users.json";

  static staticConstructor = (() => {
    Deno.mkdirSync(UserFileOp.dir, { recursive: true });
  })();

  public static save(json: any) {
    Deno.mkdirSync(this.dir, { recursive: true });
    writeJsonFileSync(this.path, json);
  }
  public static read() {
    try {
      return readJsonFileSync(this.path) as Array<IUser>;
    } catch (e) {
      //console.log(e);
      return new Array<IUser>();
    }
  }
}

export class TournamentFileOp {
  private static dir = resolve("../data");
  private static path = TournamentFileOp.dir + "/tournaments.json";

  static staticConstructor = (() => {
    Deno.mkdirSync(TournamentFileOp.dir, { recursive: true });
  })();

  public static save(data: Tournament[]) {
    Deno.mkdirSync(this.dir, { recursive: true });
    writeJsonFileSync(this.path, data);
  }
  public static read() {
    try {
      const readData = readJsonFileSync(this.path) as ITournament[];
      return readData;
    } catch (e) {
      //console.log(e);
      return new Array<ITournament>();
    }
  }
}

export class LogFileOp {
  private static dir = resolve("../log");

  static staticConstructor = (() => {
    Deno.mkdirSync(LogFileOp.dir, { recursive: true });
  })();

  public static save(game: ExpGame) {
    const data = game.toLogJSON();
    writeJsonFileSync(
      `${this.dir}/${data.startedAtUnixTime}_${data.uuid}.log`,
      data,
    );
  }

  static read() {
    const games: ExpGame[] = [];
    for (const dirEntry of Deno.readDirSync(this.dir)) {
      const data = readJsonFileSync(`${this.dir}/${dirEntry.name}`);
      games.push(ExpGame.restore(data));
    }
    return games;
  }
}

export class BoardFileOp {
  private static dir = resolve("../board");
  private static boards: any[] = [];
  private static mtime: Date | null = null;

  static staticConstructor = (() => {
    Deno.mkdirSync(BoardFileOp.dir, { recursive: true });
    //LogFileOp.getLogGames();
  })();

  private static update() {
    const stat = Deno.statSync(this.dir);
    if (stat.isDirectory) {
      if (this.mtime?.getTime() !== stat.mtime?.getTime()) {
        this.boards.length = 0;
        for (const dirEntry of Deno.readDirSync(this.dir)) {
          const json = readJsonFileSync(`${this.dir}/${dirEntry.name}`);
          json.points = json.points.flat();
          this.boards.push(json);
        }
        this.mtime = stat.mtime;
      }
    }
    return this.boards;
  }

  public static get(boardName: string) {
    const boards = this.update();
    const board = boards.find((e) => e.name === boardName);
    return new Board(board);
    //return Object.assign({}, boards.find((e) => e.name === boardName));
  }

  public static getAll() {
    const boards = this.update();
    return boards.map((e) => new Board(e));
  }
}

const boardFolderPath = resolve("../board");

export const saveBoardFile = (board: IBoard) => {
  Deno.mkdirSync(boardFolderPath, { recursive: true });
  const filePath = `${boardFolderPath}/${board.name}.json`;

  let stat;
  try {
    stat = Deno.statSync(filePath);
  } catch (e) {
  }
  if (stat === undefined) {
    Deno.writeTextFileSync(filePath, JSON.stringify(board, null, 2));
    return true;
  } else {
    console.log("The file already exists.");
    return false;
  }
};

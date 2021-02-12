import { pathResolver } from "../apiserver_util.ts";

import { IBoard } from "./interface.ts";
import { User } from "../user.ts";

const resolve = pathResolver(import.meta);

const writeJsonFileSync = (path: string | URL, json: any) => {
  Deno.writeTextFileSync(path, JSON.stringify(json, null, 2));
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
      return readJsonFileSync(this.path) as Array<User>;
    } catch (e) {
      //console.log(e);
      return new Array<User>();
    }
  }
}

export class LogFileOp {
  private static dir = resolve("../log");
  private static logGames: any[] = [];
  private static mtime: Date | null = null;

  static staticConstructor = (() => {
    Deno.mkdirSync(LogFileOp.dir, { recursive: true });
    LogFileOp.getLogGames();
  })();

  public static save(data: any) {
    writeJsonFileSync(
      `${this.dir}/${data.startedAtUnixTime}_${data.uuid}.log`,
      data,
    );
  }

  public static getLogGames() {
    const stat = Deno.statSync(this.dir);
    if (stat.isDirectory) {
      if (this.mtime?.getTime() !== stat.mtime?.getTime()) {
        this.logGames.length = 0;
        for (const dirEntry of Deno.readDirSync(this.dir)) {
          const json = readJsonFileSync(`${this.dir}/${dirEntry.name}`);
          this.logGames.push(json);
        }
        this.mtime = stat.mtime;
        //console.log("logGames Reflesh!");
      } else {
        //console.log("logGames no change");
      }
    }
    return this.logGames;
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

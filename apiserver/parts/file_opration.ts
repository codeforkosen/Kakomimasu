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

export const userFileOp = {
  dir: resolve("../data"),
  path() {
    return this.dir + "/users.json";
  },
  save(json: any) {
    Deno.mkdirSync(this.dir, { recursive: true });
    writeJsonFileSync(this.path(), json);
  },
  read() {
    try {
      return readJsonFileSync(this.path()) as Array<User>;
    } catch (e) {
      //console.log(e);
      return new Array<User>();
    }
  },
};

export const logFileOp = {
  dir: resolve("../log"),
  save(data: any) {
    Deno.mkdirSync(this.dir, { recursive: true });
    writeJsonFileSync(
      `${this.dir}/${data.startedAtUnixTime}_${data.uuid}.log`,
      data,
    );
  },
};

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

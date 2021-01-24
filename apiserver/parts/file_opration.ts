import { solvedPath } from "../apiserver_util.ts";

import { IBoard } from "./interface.ts";

const logFolderPath = solvedPath(import.meta.url, "../log");

export const saveLogFile = (data: any) => {
  Deno.mkdirSync(logFolderPath, { recursive: true });

  Deno.writeTextFileSync(
    `${logFolderPath}/${data.startedAtUnixTime}_${data.uuid}.log`,
    JSON.stringify(data, null, 2),
  );
};

const boardFolderPath = solvedPath(import.meta.url, "../board");

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

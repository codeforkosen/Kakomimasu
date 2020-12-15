import { solvedPath } from "../apiserver_util.ts";

const logFolderPath = solvedPath(import.meta.url, "../log");

export const saveLogFile = (data: any) => {
  Deno.mkdirSync(logFolderPath, { recursive: true });

  Deno.writeTextFileSync(
    `${logFolderPath}/${data.startedAtUnixTime}_${data.uuid}.log`,
    JSON.stringify(data, null, 2),
  );
};

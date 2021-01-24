// 2019年の公開フィールドを囲みマスように変換してboardディレクトリに配置します。
// ファイルパスを引数にしてこのファイルを実行してください。

import { IBoard } from "../parts/interface.ts";
import { saveBoardFile } from "../parts/file_opration.ts";

interface IBoard2019 {
  width: number;
  height: number;
  points: number[][];
  teams: {
    agents: object[];
  }[];
}

class BoardTranslator implements IBoard {
  name: string;
  width: number;
  height: number;
  nagent: number;
  points: number[];

  constructor(boardName: string, oldBoard: IBoard2019) {
    this.name = boardName;
    this.width = oldBoard.width;
    this.height = oldBoard.height;
    this.nagent = oldBoard.teams[0].agents.length;
    this.points = oldBoard.points.flat();
  }

  getBoard(): IBoard {
    return this;
  }
}

const filePath = Deno.args[0];

console.log("loading board file...");
const content = Deno.readTextFileSync(filePath);
const oldBoard: IBoard2019 = JSON.parse(content);
console.log("=== START BOARD INFO ===");
console.log(`width\t${oldBoard.width}`);
console.log(`height\t${oldBoard.height}`);
console.log(`nagent\t${oldBoard.teams[0].agents.length}`);
console.log("points");
for (let i = 0; i < oldBoard.points.length; i++) {
  let s = "";
  for (let j = 0; j < oldBoard.points[i].length; j++) {
    s += ("   " + oldBoard.points[i][j].toString()).slice(-3) + " ";
  }
  console.log(s);
}
console.log("=== END BOARD INFO ===");

let isSaved = false;
while (isSaved === false) {
  let boardName = null;
  while (boardName === null) {
    boardName = prompt("Enter a name for the board (do not enter Japanese)...");
  }
  const newBoard = new BoardTranslator(boardName, oldBoard);
  isSaved = saveBoardFile(newBoard);
}
console.log("Save Complete");

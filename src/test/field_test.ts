import { Board, Field } from "../Kakomimasu.ts";
import { assertThrows } from "./deps.ts";

Deno.test("Field: set invalid playerid", () => {
  const [width, height] = [3, 1];
  const board = new Board({ width, height, points: new Array(width * height) });

  const field = new Field(board);

  assertThrows(() => {
    field.set(0, 0, Field.WALL, -1);
  });
});

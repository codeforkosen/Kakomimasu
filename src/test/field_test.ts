import { Board, Field } from "../Kakomimasu.ts";
import { assertThrows } from "./deps.ts";

Deno.test("Field: set invalid playerid", () => {
  const [width, height] = [3, 1];
  const board: Board = { width, height, points: new Array(width * height) };

  const field = new Field(board);

  assertThrows(() => {
    field.set(0, 0, Field.WALL, -1);
  });
});

Deno.test("Field: invalid points.length", () => {
  const fn = () => {
    new Field({
      width: 3,
      height: 3,
      points: new Array(2).fill(0),
    });
  };
  assertThrows(fn, Error, "points.length must be 9");
});

import { Board } from "../Kakomimasu.ts";
import { assertThrows } from "./deps.ts";

Deno.test("[Board] invalid points.length", () => {
  const fn = () => {
    new Board({
      width: 3,
      height: 3,
      points: new Array(2).fill(0),
    });
  };
  assertThrows(fn, Error, "points.length must be 9");
});

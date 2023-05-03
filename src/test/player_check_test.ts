import { Player } from "../Kakomimasu.ts";
import { assertThrows } from "./deps.ts";

Deno.test("Player: setActions before game attached", () => {
  const p1 = new Player("test1");
  const fn = () => p1.setActions([]);
  assertThrows(fn, Error, "game is null");
});

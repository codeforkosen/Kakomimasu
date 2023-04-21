import { Board, Field } from "../Kakomimasu.ts";
import { AssertionError } from "./deps.ts";

const cl = (...a: Parameters<Console["log"]>) => {
  a;
}; //console.log(...a);

Deno.test("fill2", () => {
  const nAgent = 6;
  const [width, height] = [3, 3];
  const board = new Board({
    width,
    height,
    points: new Array(width * height),
    nAgent,
  });
  const field = new Field(board);

  const p = () => {
    for (let i = 0; i < height; i++) {
      const s = [];
      for (let j = 0; j < width; j++) {
        const n = field.tiles[j + i * width];
        s.push(
          "_W".charAt(n.type) + (n.player === null ? "." : n.player).toString(),
        );
      }
      cl(s.join(" "));
    }
    cl();
  };
  const set = (s: string) => {
    s = s.replace(/\n/g, "");
    for (let i = 0; i < s.length; i++) {
      const c = s.charAt(i);
      if (c === "0") {
        field.tiles[i] = { type: Field.WALL, player: 0 };
      } else if (c === "1") {
        field.tiles[i] = { type: Field.WALL, player: 1 };
      }
    }
  };
  const chk = (s: string) => {
    s = s.replace(/\n/g, "");
    for (let i = 0; i < s.length; i += 2) {
      const c = s.charAt(i) === "W" ? Field.WALL : Field.AREA;
      const n = s.charAt(i + 1) === "." ? null : parseInt(s.charAt(i + 1));
      const f = field.tiles[i / 2];
      if (f.type !== c || f.player !== n) {
        throw new AssertionError("");
      }
    }
  };

  p();

  set(`
000
0.0
00.
`);

  p();

  field.fillArea();

  p();

  chk(`
W0W0W0
W0_.W0
W0W0_.
`);
});

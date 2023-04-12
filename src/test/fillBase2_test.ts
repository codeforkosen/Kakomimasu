import { Board, Field } from "../Kakomimasu.ts";

const cl = (...a: Parameters<Console["log"]>) => {
  a;
}; //console.log(...a);

Deno.test("fill2", () => {
  const nAgent = 6;
  const [width, height] = [8, 8];
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
      } else {
        field.tiles[i] = { type: Field.AREA, player: null };
      }
    }
  };
  const chk = (s: string) => {
    s = s.replace(/\n/g, "");
    for (let i = 0; i < s.length; i++) {
      const c = s.charAt(i);
      if (c !== ".") {
        const n = parseInt(c);
        const f = field.tiles[i];
        if (f.type !== Field.AREA || f.player !== n) {
          throw new Error();
        }
      }
    }
  };

  p();

  // test 1
  set(`
.00000..
00...00.
0.1..00.
0.....00
0.1...0.
0.....0.
00..000.
.00000..
`);

  p();
  field.fill();

  p();

  chk(`
........
..000...
.0.00...
.00000..
.0.000..
.00000..
..00....
........
`);

  // test2

  set(`
.00000..
00...00.
0.1..00.
0......0
0.1...0.
0.....0.
00..000.
.00000..
`);

  p();
  field.fill();
  p();

  chk(`
........
........
........
........
........
........
........
........
`);

  // test3

  set(`
.00000..
00...00.
0.11100.
0.1.1.00
0.1.1.0.
0.111.0.
00..000.
.00000..
`);

  p();
  field.fill();
  p();

  chk(`
........
..000...
.0......
.0.1.0..
.0.1.0..
.0...0..
..00....
........
`);
});

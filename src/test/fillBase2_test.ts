import { Board, Field } from "../Kakomimasu.ts";

const cl = (...a: Parameters<Console["log"]>) => {
  a;
}; //console.log(...a);

Deno.test("fillBase2", () => {
  const nagent = 6;
  const [w, h] = [8, 8];
  const board = new Board({ w, h, points: new Array(w * h), nagent });
  const field = new Field(board);

  const p = () => {
    for (let i = 0; i < h; i++) {
      const s = [];
      for (let j = 0; j < w; j++) {
        const n = field.field[j + i * w];
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
        field.field[i] = { type: Field.WALL, player: 0 };
      } else if (c === "1") {
        field.field[i] = { type: Field.WALL, player: 1 };
      } else {
        field.field[i] = { type: Field.AREA, player: null };
      }
    }
  };
  const chk = (s: string) => {
    s = s.replace(/\n/g, "");
    for (let i = 0; i < s.length; i++) {
      const c = s.charAt(i);
      if (c !== ".") {
        const n = parseInt(c);
        const f = field.field[i];
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
  field.fillBase();

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
  field.fillBase();
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
  field.fillBase();
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

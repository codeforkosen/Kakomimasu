import { Board, Field } from "../Kakomimasu.js";
import { AssertionError } from "../asserts.js";

const cl = (...a) => {
  a;
}; //console.log(...a);

Deno.test("fillBase2", () => {
  const nagent = 6;
  const [w, h] = [3, 3];
  const board = new Board(w, h, new Array(w * h), nagent);
  const field = new Field(board);

  const p = () => {
    for (let i = 0; i < h; i++) {
      const s = [];
      for (let j = 0; j < w; j++) {
        const n = field.field[j + i * w];
        s.push("_W".charAt(n[0]) + (n[1] < 0 ? "." : n[1]).toString());
      }
      cl(s.join(" "));
    }
    cl();
  };
  const set = (s) => {
    s = s.replace(/\n/g, "");
    for (let i = 0; i < s.length; i++) {
      const c = s.charAt(i);
      if (c === "0") {
        field.field[i] = [1, 0];
      } else if (c === "1") {
        field.field[i] = [1, 1];
      }
    }
  };
  const chk = (s) => {
    s = s.replace(/\n/g, "");
    for (let i = 0; i < s.length; i += 2) {
      const c = s.charAt(i) === "W" ? Field.WALL : Field.BASE;
      const n = s.charAt(i + 1) === "." ? -1 : parseInt(s.charAt(i + 1));
      const f = field.field[i / 2];
      if (f[0] !== c || f[1] !== n) {
        throw new AssertionError();
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

  field.fillBase();

  p();

  chk(`
W0W0W0
W0_.W0
W0W0_.
`);
});

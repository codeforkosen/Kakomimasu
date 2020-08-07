import { Board, Field } from "../Kakomimasu.js";

const nagent = 6;
const [ w, h ] = [ 3, 3 ];
const board = new Board(w, h, new Array(w * h), nagent);
const field = new Field(board);

const p = () => {
  for (let i = 0; i < h; i++) {
    const s = [];
    for (let j = 0; j < w; j++) {
      const n = field.field[j + i * w];
      s.push("_W".charAt(n[0]) + (n[1] < 0 ? "." : n[1]).toString());
    }
    console.log(s.join(" "));
  }
  console.log();
};
const set = s => {
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
const chk = s => {
  s = s.replace(/\n/g, "");
  for (let i = 0; i < s.length; i++) {
    const c = s.charAt(i);
    if (c !== ".") {
      const n = parseInt(c);
      const f = field.field[i];
      if (f[0] !== Field.BASE || f[1] !== n) {
        throw new AssertionError();
      }
    }
  }
}

p();

set(`
000
0.0
000
`);

p();

field.fillBase();

p();

chk(`
...
.0.
...
`);

import util from "../util.js";
const b = JSON.parse(Deno.readTextFileSync("../apiserver/board/A-1.json"));
console.log(b);
const n = 4;
b.name = "island-" + n;
b.width = 20;
b.height = 20;
b.nturn = 60;
b.nsec = 2;

b.points = [];
const len = b.width * b.height;
for (let i = 0; i < len; i++) {
  b.points[i] = util.rnd(16) + 1;
}
for (let i = 0; i < 6; i++) {
  const n = 1 + util.rnd(4);
  const x = util.rnd(b.width - 1 - n) + 1;
  const y = util.rnd(b.height - 1 - n) + 1;
  const p = -util.rnd(15) - 1;
  for (let j = 0; j < n; j++) {
    for (let k = 0; k < n; k++) {
      b.points[x + j + (y + k) * b.width] = p;
    }
  }
}
console.log(b, b.points.length);

Deno.writeTextFileSync("../apiserver/board/" + b.name + ".json", JSON.stringify(b));

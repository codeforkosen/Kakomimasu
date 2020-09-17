import util from "../util.js";
const b = JSON.parse(Deno.readTextFileSync("../apiserver/board/F-1.json"));
console.log(b);

const len = b.width * b.height;
for (let i = 0; i < len; i++) {
  b.points[i] = util.rnd(16) + 1;
  const y = Math.floor(i / b.width);
  const x = i % b.width;
  if ((x % 4 == 1 || x % 4 == 2) && (y % 4 == 1 || y % 4 == 2)) {
    b.points[i] = -16;
  }
}
console.log(b);

Deno.writeTextFileSync("../apiserver/board/Kakom-1.json", JSON.stringify(b));

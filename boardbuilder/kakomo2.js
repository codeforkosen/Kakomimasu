import util from "../util.js";
const b = JSON.parse(Deno.readTextFileSync("../apiserver/board/F-1.json"));
console.log(b);

const len = b.width * b.height;
for (let i = 0; i < len; i++) {
  b.points[i] = util.rnd(16) + 1;
  const y = Math.floor(i / b.width);
  const x = i % b.width;
  //if ((x % 4 == 1 || x % 4 == 2) && (y % 4 == 1 || y % 4 == 2)) {
  const x5 = x % 5;
  const y5 = y % 5;
  if ((x5 >= 1 && x5 <= 3) && (y5 >= 1 && y5 <= 3)) {
      b.points[i] = -16;
  }
}
console.log(b);

Deno.writeTextFileSync("../apiserver/board/Kakom-2.json", JSON.stringify(b));

import { MersenneTwister } from "https://code4sabae.github.io/js/MersenneTwister.js";
//import { MersenneTwister } from "http://127.0.0.1:8080/MersenneTwister.js";

const mt = new MersenneTwister(0);
// console.log(mt.nextInt());
// Deno.exit(0);

const util = {};

/*
let seed = 3293485835;
util.rnd = (n) => {
  seed = (seed * 5 + 380317) & 0xfffffff;
  return seed % n;;
};
*/

util.rnd = (n) => {
  return mt.nextInt() % n;
};

export default util;

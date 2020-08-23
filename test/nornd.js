const util = {};

let seed = 3293485835;
util.rnd = (n) => {
  seed = (seed * 5 + 380317) & 0xfffffff;
  return seed % n;;
};

export default util;

const util = {};

util.rnd = (n) => {
  return Math.floor(Math.random() * n); // MT is better
};

util.p = (json) => {
  console.log(JSON.stringify(json, null, 2));
};

export default util;

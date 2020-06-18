import { Kakomimasu, Board, Action } from "./Kakomimasu.mjs";

const w = 8;
const h = 8;
const points = [];
for (let i = 0; i < w * h; i++) {
  points[i] = i;
  // points[i] = i % (16 * 2 + 1) - 16;
  // util.rnd(16 * 2 + 1) - 16;
}
const nagent = 6;
const board = new Board(w, h, points);

const kkmm = new Kakomimasu();
kkmm.appendBoard(board);
const nturn = 10;
const game = kkmm.createGame(board, nturn);
const p1 = kkmm.createPlayer("test1");
const p2 = kkmm.createPlayer("test2");
const p3 = kkmm.createPlayer("test3");
game.attachPlayer(p1);
//game.attachPlayer(p2);
//game.attachPlayer(p3);
//console.log(game.players);
/*game.players.reduce(
  function (accumelator: any, currentValue: any) {
    console.log(
      accumelator,
      (currentValue) ? true : false,
      accumelator + ((currentValue) ? 1 : 0),
    );
    return accumelator + ((currentValue) ? 1 : 0);
  },
  0,
);*/
/*
game.players.reduce(
  function (p: any, a: any, b: any, c: any) {
    console.log(p, a, b, c);
  },
  0,
);*/
console.log(game.players.length);
//console.log(game.players.reduce((p: any) => p ? 1 : 0, 0));
//game.attachPlayer(p2);
//game.attachPlayer(p3);

//console.log(kkmm.getFreeGames());

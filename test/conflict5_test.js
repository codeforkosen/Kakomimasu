import { assertEquals } from "https://deno.land/std@0.67.0/testing/asserts.ts";
import { Action, Board, Field, Kakomimasu } from "../Kakomimasu.js";

const assert = (b) => {
  assertEquals(true, b);
};

/*
Deno.test("a", async () => {
  assert(true);
  assert(true);
  assert(false);
  assert(true);
});
*/
Deno.test("conflict5 test", () => {
  const nagent = 2;
  const [w, h] = [3, 1];
  const points = [1, 1, 1];
  const nturn = 20;
  const board = new Board(w, h, points, nagent, nturn);

  const kkmm = new Kakomimasu();
  kkmm.appendBoard(board);
  const game = kkmm.createGame(board);

  const field = game.field;

  const p1 = kkmm.createPlayer("test1");
  const p2 = kkmm.createPlayer("test2");
  game.attachPlayer(p1);
  game.attachPlayer(p2);
  game.start();

  const cl = (...a) => { a; };//console.log(...a);

  const showAgents = () => {
    let i = 0;
    for (const agent of game.agents) {
      let j = 0;
      for (const a of agent) {
        console.log("pid", i, "aid", j, a.x, a.y);
        j++;
      }
      i++;
    }
  };

  const isOnAgent = (p, x, y) => {
    let cnt = 0;
    for (const a of game.agents[p]) {
      if (a.x === x && a.y === y) {
        cnt++;
      }
    }
    if (cnt === 1)
      return true;
    if (cnt === 0)
      return false;
    throw new AssertionError("agent conflict!! cnt:" + cnt);
  };

  const tos = () => {
    const res = [];
    for (let i = 0; i < h; i++) {
      const s = [];
      for (let j = 0; j < w; j++) {
        const n = field.field[j + i * w];
        const a0 = isOnAgent(0, j, i);
        const a1 = isOnAgent(1, j, i);
        if (a0 && a1) {
          throw new AssertionError("agent conflict!!");
        }
        const a = a0 ? "0" : (a1 ? "1" : ".");
        s.push("_W".charAt(n[0]) + (n[1] < 0 ? "." : n[1]).toString() + a);
      }
      res.push(s.join(" "));
    }
    return res.join("\n");
  };
  const p = () => cl(tos());
  const chk = (s) => assertEquals(s.trim(), tos());

  //put 2,2
  //kc.setActions([ new Action(0, "MOVE", 4, 2),new Action(0, "MOVE", 3, 2)]); // こっちだとAgentが[3,2]に移動する。
  //kc.setActions([ new Action(0, "MOVE", 3, 2),new Action(0, "MOVE", 4, 2)]); // こっちだとAgentは移動しない。
  cl("put");
  p1.setActions(Action.fromJSON([
    [0, Action.PUT, 0, 0],
  ]));
  assert(game.nextTurn());
  p();
  chk("W00 _.. _..");
  //console.log(game.log);

  let actions;

  cl("conflict1");
  p1.setActions(Action.fromJSON([
    [0, Action.MOVE, 1, 0],
    [0, Action.MOVE, 2, 0],
  ]));
  assert(game.nextTurn());
  p();
  actions = game.log[game.log.length - 1][0].actions;
  //console.log("log", actions);
  assertEquals(actions.map((a) => a.res), [Action.ERR_ONLY_ONE_TURN, Action.ERR_ONLY_ONE_TURN]);
  chk("W00 _.. _..");

  cl("conflict2");
  p1.setActions(Action.fromJSON([
    [0, Action.MOVE, 2, 0],
    [0, Action.MOVE, 1, 0],
  ]));
  assert(game.nextTurn());
  p();
  actions = game.log[game.log.length - 1][0].actions;
  assertEquals(actions.map((a) => a.res), [Action.ERR_ONLY_ONE_TURN, Action.ERR_ONLY_ONE_TURN]);
  chk("W00 _.. _..");
  //console.log(game.log);

  cl("conflict3");
  p1.setActions(Action.fromJSON([
    [0, Action.MOVE, 2, 0],
    [0, Action.MOVE, 1, 0],
    [0, Action.MOVE, 3, 0],
  ]));
  assert(game.nextTurn());
  p();
  actions = game.log[game.log.length - 1][0].actions;
  //console.log("log", actions);
  assertEquals(actions.map((a) => a.res), [Action.ERR_ONLY_ONE_TURN, Action.ERR_ONLY_ONE_TURN, Action.ERR_ONLY_ONE_TURN]);
  chk("W00 _.. _..");
  //console.log(game.log);


  // finish
  for (let i = 0; ; i++) {
    //console.log("turn", i);
    // showAgents();
    if (!game.nextTurn()) break;
  }
  console.log("finish");
  //game.dispose();
});

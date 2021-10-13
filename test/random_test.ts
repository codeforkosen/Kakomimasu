import {
  Action,
  ActionJSON,
  ActionType,
  Board,
  Kakomimasu,
} from "../src/Kakomimasu.ts";
import { assert, AssertionError } from "./deps.ts";
//import util from "../util.js";
//import util from "./nornd.js";
import util from "./mtrnd.js";

const cl = (...a: Parameters<Console["log"]>) => {
  a;
}; //console.log(...a);

Deno.test("random", () => {
  const nagent = 6;
  const [w, h] = [nagent, nagent];
  const nturn = 10000;
  const board = new Board({ w, h, points: new Array(w * h), nagent, nturn });

  const initialput = false;

  const kkmm = new Kakomimasu();
  kkmm.appendBoard(board);
  const game = kkmm.createGame(board);

  const field = game.field;

  const nplayers = 2;
  const p1 = kkmm.createPlayer("test1");
  const p2 = kkmm.createPlayer("test2");
  game.attachPlayer(p1);
  game.attachPlayer(p2);
  game.start();

  const showAgents = () => {
    let i = 0;
    for (const agent of game.agents) {
      let j = 0;
      for (const a of agent) {
        cl("pid", i, "aid", j, a.x, a.y);
        j++;
      }
      i++;
    }
  };

  const isOnAgent = (p: number, x: number, y: number) => {
    let cnt = 0;
    for (const a of game.agents[p]) {
      if (a.x === x && a.y === y) {
        cnt++;
      }
    }
    if (cnt === 1) {
      return true;
    }
    if (cnt === 0) {
      return false;
    }
    throw new AssertionError("agent conflict!! cnt:" + cnt);
  };

  const tos = () => {
    const res = [];
    let fillfld = 0;
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
        fillfld += (n[0] === 0 && n[1] !== -1) ? 1 : 0;
      }
      res.push(s.join(" "));
    }
    //console.log("fillfld", fillfld);
    if (fillfld >= 3) {
      console.log("fillfld over 3!\n", res.join("\n"));
      // Deno.exit(0);
    }
    return res.join("\n");
  };
  const checkAgent = () => {
    for (let i = 0; i < h; i++) {
      for (let j = 0; j < w; j++) {
        const n = field.field[j + i * w];
        const a0 = isOnAgent(0, j, i);
        const a1 = isOnAgent(1, j, i);
        if (a0 && a1) {
          throw new AssertionError("agent conflict!!");
        }
        const a = a0 ? "0" : (a1 ? "1" : ".");
        if (a !== "." && n[1] >= 0 && n[1] != parseInt(a)) {
          throw new AssertionError(
            `illegal field!! ${j}x${i} ${n[1]} must be ${a}`,
          );
        }
      }
    }
  };
  const p = () => {
    const _ret = tos();
    //console.log(ret);
  };
  const chk = () => {
    p();
    checkAgent();
    // assertEquals(s.trim(), tos())
  };

  // put
  let actions: ActionType[];
  const getPutAction = (x: number) => {
    const act: ActionJSON[] = [];
    for (let i = 0; i < nagent; i++) {
      act.push([i, Action.PUT, x, i]);
    }
    return act;
  };
  game.nextTurn();
  chk();
  if (initialput) {
    p1.setActions(Action.fromJSON(getPutAction(0)));
    p2.setActions(Action.fromJSON(getPutAction(nagent - 1)));
    assert(game.nextTurn());
    chk();
    actions = [Action.MOVE, Action.REMOVE];
  } else {
    actions = [Action.PUT, Action.MOVE, Action.REMOVE];
  }
  //console.log("actions", actions);
  const getRandomAction = (n: number): ActionJSON => [
    n,
    actions[util.rnd(actions.length)],
    util.rnd(nagent),
    util.rnd(nagent),
  ];
  for (let i = 1; i <= nturn; i++) {
    const act: ActionJSON[][] = [];
    for (let k = 0; k < nplayers; k++) {
      const act2: ActionJSON[] = [];
      for (let j = 0; j < nagent; j++) {
        act2.push(getRandomAction(j));
      }
      act.push(act2);
    }
    //console.log("act", act);
    p1.setActions(Action.fromJSON(act[0]));
    p2.setActions(Action.fromJSON(act[1]));
    if (i === 9) {
      showAgents();
    }
    game.nextTurn();
    cl("turn", i);
    chk();
  }
});

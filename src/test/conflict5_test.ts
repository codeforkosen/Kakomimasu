import { Action, Board, Game, Player } from "../Kakomimasu.ts";
import { assert, assertEquals, AssertionError } from "./deps.ts";

Deno.test("conflict5 test", () => {
  const nAgent = 2;
  const [width, height] = [3, 1];
  const points = [1, 1, 1];
  const totalTurn = 20;
  const board: Board = { width, height, points, nAgent, totalTurn };

  const game = new Game(board);

  const field = game.field;

  const p1 = new Player("test1");
  const p2 = new Player("test2");
  game.attachPlayer(p1);
  game.attachPlayer(p2);
  game.start();

  const cl = (...a: Parameters<Console["log"]>) => {
    a;
  }; //console.log(...a);

  const _showAgents = () => {
    let i = 0;
    for (const player of game.players) {
      let j = 0;
      for (const a of player.agents) {
        console.log("pid", i, "aid", j, a.x, a.y);
        j++;
      }
      i++;
    }
  };

  const isOnAgent = (p: number, x: number, y: number) => {
    let cnt = 0;
    for (const a of game.players[p].agents) {
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
    for (let i = 0; i < height; i++) {
      const s = [];
      for (let j = 0; j < width; j++) {
        const n = field.tiles[j + i * width];
        const a0 = isOnAgent(0, j, i);
        const a1 = isOnAgent(1, j, i);
        if (a0 && a1) {
          throw new AssertionError("agent conflict!!");
        }
        const a = a0 ? "0" : (a1 ? "1" : ".");
        s.push(
          "_W".charAt(n.type) +
            (n.player === null ? "." : n.player).toString() +
            a,
        );
      }
      res.push(s.join(" "));
    }
    return res.join("\n");
  };
  const p = () => cl(tos());
  const chk = (s: string) => assertEquals(s.trim(), tos());

  //put 2,2
  //kc.setActions([ new Action(0, "MOVE", 4, 2),new Action(0, "MOVE", 3, 2)]); // こっちだとAgentが[3,2]に移動する。
  //kc.setActions([ new Action(0, "MOVE", 3, 2),new Action(0, "MOVE", 4, 2)]); // こっちだとAgentは移動しない。
  cl("put");
  p1.setActions(Action.fromArray([
    [0, Action.PUT, 0, 0],
  ]));
  assert(game.nextTurn());
  p();
  chk("W00 _.. _..");
  //console.log(game.log);

  let actions;

  cl("conflict1");
  p1.setActions(Action.fromArray([
    [0, Action.MOVE, 1, 0],
    [0, Action.MOVE, 2, 0],
  ]));
  assert(game.nextTurn());
  p();
  actions = game.log[game.log.length - 1].players[0].actions;
  //console.log("log", actions);
  assertEquals(actions.map((a) => a.res), [
    Action.ERR_ONLY_ONE_TURN,
    Action.ERR_ONLY_ONE_TURN,
  ]);
  chk("W00 _.. _..");

  cl("conflict2");
  p1.setActions(Action.fromArray([
    [0, Action.MOVE, 2, 0],
    [0, Action.MOVE, 1, 0],
  ]));
  assert(game.nextTurn());
  p();
  actions = game.log[game.log.length - 1].players[0].actions;
  assertEquals(actions.map((a) => a.res), [
    Action.ERR_ONLY_ONE_TURN,
    Action.ERR_ONLY_ONE_TURN,
  ]);
  chk("W00 _.. _..");
  //console.log(game.log);

  cl("conflict3");
  p1.setActions(Action.fromArray([
    [0, Action.MOVE, 2, 0],
    [0, Action.MOVE, 1, 0],
    [0, Action.MOVE, 3, 0],
  ]));
  assert(game.nextTurn());
  p();
  actions = game.log[game.log.length - 1].players[0].actions;
  //console.log("log", actions);
  assertEquals(actions.map((a) => a.res), [
    Action.ERR_ONLY_ONE_TURN,
    Action.ERR_ONLY_ONE_TURN,
    Action.ERR_ONLY_ONE_TURN,
  ]);
  chk("W00 _.. _..");
  //console.log(game.log);

  // finish
  for (let i = 0;; i++) {
    //console.log("turn", i);
    // showAgents();
    if (!game.nextTurn()) break;
  }
  console.log("finish");
  //game.dispose();
});

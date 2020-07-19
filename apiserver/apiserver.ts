import {
  ServerRequest,
  createRouter,
  contentTypeFilter,
  createApp,
} from "https://servestjs.org/@v1.1.1/mod.ts";

import { Kakomimasu, Board, Action } from "../Kakomimasu.js";
const kkmm = new Kakomimasu();

//#region プレイヤー登録・ルームID取得API

const addPlayer = (playerName: string, spec: string) => {
  const player = kkmm.createPlayer(playerName, spec);

  const freeGame = kkmm.getFreeGames();
  if (freeGame.length == 0) {
    freeGame.push(kkmm.createGame(createDefaultBoard()));
  }
  freeGame[0].attachPlayer(player);

  return player;
};

export class PlayerPost {
  constructor(public name: string, public spec: string) {}
}

export const newPlayerPost = async (req: ServerRequest) => {
  //console.log(req, "newPlayer");
  const playerPost = (await req.json()) as PlayerPost;
  const player = addPlayer(playerPost.name, playerPost.spec);
  await req.respond({
    status: 200,
    headers: new Headers({
      "content-type": "application/json",
    }),
    body: JSON.stringify(player.getJSON()),
  });
};

// #endregion

//#region 全ルーム取得API
class Game {
  getFieldInfoJSON() {}
}
const getAllRooms = async (req: ServerRequest) => {
  //console.log(req, "getAllRooms");
  const games: any = [];
  kkmm.getGames().forEach((item: Game) => {
    games.push(item.getFieldInfoJSON());
  });

  await req.respond({
    status: 200,
    headers: new Headers({
      "content-type": "application/json",
    }),
    body: JSON.stringify(games),
  });
};

//#endregion

//#region 試合状態取得API
export const getGameInfo = async (req: ServerRequest) => {
  try {
    //console.log(req.match, "GameInfo");
    const [, token] = req.match;
    const game = kkmm.getGames().filter((item: any) => item.uuid === token);
    //console.log(game[0]);
    //game[0].updateStatus();

    await req.respond({
      status: 200,
      headers: new Headers({
        "content-type": "application/json",
      }),
      body: JSON.stringify(
        game[0].getFieldInfoJSON(),
        //["uuid", "gaming", "ending", "turn", "startTime", "nextTurnTime"],
      ),
    });
  } catch (e) {
    console.log("err", e);
  }
};

//#endregion

//#region エージェント行動情報API
class ActionPost {
  constructor(
    public agentid: number,
    public type: string,
    public x: number,
    public y: number,
  ) {}

  static getType(type: string) {
    if (type === "PUT") return Action.PUT;
    else if (type === "NONE") return Action.NONE;
    else if (type === "MOVE") return Action.MOVE;
    else if (type === "REMOVE") return Action.REMOVE;
  }
}
export class SetActionPost {
  constructor(
    public time: number,
    public actions: ActionPost[],
  ) {}
}

export const setAction = async (req: ServerRequest) => {
  try {
    //console.log(req, "SetAction");
    const [, roomid] = req.match;
    const playerid = req.headers.get("Authorization");
    const game = kkmm.getGames().find((item: any) => item.uuid === roomid);
    //console.log(playerid, game.players);
    const player = game.players.find((item: any) => item.uuid === playerid);
    if (player === undefined) {
      await req.respond({
        status: 401,
        /*headers: new Headers({
          "content-type": "application/json",
        }),
        body: JSON.stringify(
          game[0].getFieldInfoJSON(),
          //["uuid", "gaming", "ending", "turn", "startTime", "nextTurnTime"],
        ),*/
      });
    } //console.log(game[0]);
    else {
      const r = (await req.json()) as SetActionPost;
      const actionsAry: any = [];
      r.actions.forEach((a) => {
        actionsAry.push([a.agentid, ActionPost.getType(a.type), a.x, a.y]);
      });
      //console.log(game.nextTurnUnixTime);
      if (game.nextTurnUnixTime >= r.time) {
        player.setActions(Action.fromJSON(actionsAry));
      } else {
        console.log("時間超過");
      }
      // 時間を超えてた場合にレスポンス変更する必要あり
      await req.respond({
        status: 200,
        headers: new Headers({
          "content-type": "application/json",
        }),
        body: JSON.stringify(
          actionsAry,
          //["uuid", "gaming", "ending", "turn", "startTime", "nextTurnTime"],
        ),
      });
    }
  } catch (e) {
    console.log("err", e);
  }
};

//#endregion

//#region ブラウザ表示用
const matchWeb = async (req: ServerRequest) => {
  await req.sendFile("./web/match.html");
  await req.respond({ status: 200 });
};
const matchRoomWeb = async (req: ServerRequest) => {
  const [, roomid] = req.match;
  const game = kkmm.getGames().filter((item: any) => item.uuid === roomid);
  if (game.length > 0) {
    await req.sendFile("./web/match_room.html");
    await req.respond({ status: 200 });
  } else {
    await req.respond({ status: 404 });
  }
};
//#endregion

export const routes = () => {
  const router = createRouter();

  router.post("match", contentTypeFilter("application/json"), newPlayerPost);
  router.get("match", getAllRooms);
  router.get(new RegExp("^match/(.{8}-.{4}-.{4}-.{4}-.{12})$"), getGameInfo);
  router.post(new RegExp("^match/(.+)/action$"), setAction);

  router.get("match.info", matchWeb);
  router.get(new RegExp("^match/(.+).info$"), matchRoomWeb);

  router.get(new RegExp("([^/]+?)?.js$"), async (req: ServerRequest) => {
    //console.log(req.match);
    await req.sendFile(`./web/${req.match[1]}.js`);
    //await req.sendFile(``);
    await req.respond({ status: 200 });
  });
  router.get(new RegExp("^(.*?)img/(.+)$"), async (req: ServerRequest) => {
    //console.log(req.match);
    await req.sendFile(`../img/${req.match[2]}`);
    await req.respond({ status: 200 });
  });

  return router;
};

// Port Listen
const app = createApp();
app.route("/", routes());
app.listen({ port: 8880 });

const createDefaultBoard = () => {
  const w = 8;
  const h = 8;
  const points = [];
  for (let i = 0; i < w * h; i++) {
    points[i] = i;
    // points[i] = i % (16 * 2 + 1) - 16;
    // util.rnd(16 * 2 + 1) - 16;
  }
  const nagent = 6;
  return new Board(w, h, points, nagent);
};

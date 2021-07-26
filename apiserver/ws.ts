import { createRouter, isWebSocketCloseEvent, WebSocket } from "./deps.ts";
import type { WsGameRes } from "./types.ts";
import { ExpGame } from "./parts/expKakomimasu.ts";

import { kkmm } from "./apiserver.ts";

type SearchOptions = { op: string; value: string }[];
type MapValue = { searchOption: SearchOptions; gameIds: string[] };
const clients = new Map<WebSocket, MapValue>();

const analyzeStringSearchOption = (q: string) => {
  const qs: SearchOptions = q.split(" ").map((s) => {
    const sp = s.split(":");
    if (sp.length === 1) {
      return { op: "match", value: sp[0] };
    } else return { op: sp[0], value: sp[1] };
  });
  console.log(qs);

  return qs;
};

const filterGame = (game: ExpGame, searchOptions: SearchOptions) => {
  let isMatched = true;
  searchOptions.forEach((so) => {
    if (so.op === "is") {
      if (so.value === "self" && game.type !== "self") {
        isMatched = false;
      }
      if (so.value === "normal" && game.type !== "normal") {
        isMatched = false;
      }
    }
    if (so.op === "id" && so.value !== game.uuid) isMatched = false;
  });
  console.log(game.type, isMatched);
  return isMatched;
};

export function sendGame(game: ExpGame) {
  return () => {
    console.log("sendGame!!");
    clients.forEach((value, ws) => {
      console.log(game, value);
      if (!value.gameIds.some((id) => id === game.uuid)) {
        if (
          value.searchOption.some((so) =>
            so.op === "is" && so.value === "newGame"
          )
        ) {
          value.gameIds.push(game.uuid);
        } else return;
      }

      if (!filterGame(game, value.searchOption)) return;
      const data: WsGameRes = {
        type: "update",
        game: game.toJSON(),
      };
      ws.send(JSON.stringify(data));
    });
  };
}

export const wsRoutes = () => {
  const router = createRouter();
  router.ws(
    "/game",
    (async (sock) => {
      console.log("ws connected.");
      const client: MapValue = { searchOption: [], gameIds: [] };
      clients.set(sock, client);

      for await (const ev of sock) {
        if (isWebSocketCloseEvent(ev)) {
          console.log(clients);
          clients.delete(sock);
          console.log(clients);
        }
        if (typeof ev !== "string") continue;

        const { q, startIndex: sIdx, endIndex: eIdx } = JSON.parse(ev);

        // check json type
        if (typeof q !== "string") continue;
        if (typeof sIdx !== "number" && typeof sIdx !== "undefined") continue;
        if (typeof eIdx !== "number" && typeof eIdx !== "undefined") continue;

        const searchOptions = analyzeStringSearchOption(q);
        client.searchOption = searchOptions;

        const games = kkmm.getGames().sort((a, b) => {
          const sort = searchOptions.find((query) => query.op === "sort");
          if (!sort) return 0;
          const v = sort.value;
          if (v === "startAtUnixTime-desc") {
            return (b.startedAtUnixTime ?? 10000000000) -
              (a.startedAtUnixTime ?? 10000000000);
          } else if (v === "startAtUnixTime-asc") {
            return (a.startedAtUnixTime ?? 10000000000) -
              (b.startedAtUnixTime ?? 10000000000);
          }
          return 0;
        }).filter((game) => filterGame(game, searchOptions));

        const gamesNum = games.length;
        const slicedGames = games.slice(sIdx, eIdx);
        client.gameIds = slicedGames.map((g) => g.uuid);
        const body: WsGameRes = {
          type: "initial",
          q,
          startIndex: sIdx,
          endIndex: eIdx,
          games: slicedGames.map((g) => g.toJSON()),
          gamesNum,
        };

        sock.send(JSON.stringify(body));
        console.log(ev);
      }
    }),
  );

  return router;
};
/*await sock.send(
            JSON.stringify(kkmm.getGames()),
          );
          socks.push(sock);

          for await (const msg of sock) {
            if (typeof msg === "string") {
              //console.log(msg);
            } else {
              //console.log("err on ws", msg);
              // ws { code: 0, reason: "" } -- close
              // ws { code: 1001, reason: "" } -- 遮断
              break;
            }
          }*/

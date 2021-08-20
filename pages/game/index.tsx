import React, { useEffect, useRef, useState } from "react";
import { ToggleButtonGroup } from "@material-ui/core";
import { ToggleButton } from "@material-ui/core";

import Content from "../../components/content.tsx";
import GameList from "../../components/gamelist.tsx";
import Clock from "../../components/clock.tsx";

import { Game, WsGameReq, WsGameRes } from "../../apiserver/types.ts";

export default function () {
  const [games, setGames] = useState<Game[]>([]);
  const [socket, setSocket] = useState<WebSocket>();
  const [gameType, setGameType] = React.useState<"normal" | "self">();
  const refGames = useRef(games);

  useEffect(() => {
    const sock = new WebSocket(
      ((window.location.protocol === "https:") ? "wss://" : "ws://") +
        window.location.host + "/api/ws/game",
    );
    sock.onopen = () => {
      setSocket(sock);
    };
    sock.onmessage = (event) => {
      const res = JSON.parse(event.data) as WsGameRes;
      //console.log(res);
      if (res.type === "initial") {
        setGames(res.games);
      } else {
        const gs = refGames.current;
        const updateGameIndex = gs.findIndex((g) =>
          g.gameId === res.game.gameId
        );
        if (updateGameIndex >= 0) gs[updateGameIndex] = res.game;
        else gs.push(res.game);
        console.log(gs);
        setGames([...gs]);
      }
    };

    return () => {
      sock.close();
      console.log("websocket close");
    };
  }, []);

  useEffect(() => {
    refGames.current = games;
  }, [games]);

  useEffect(() => {
    if (socket) setGameType("normal");
  }, [socket]);

  useEffect(() => {
    if (socket && gameType) {
      const q = ["sort:startAtUnixTime-desc", "is:newGame", `is:${gameType}`]
        .join(" ");
      console.log(q);
      const req: WsGameReq = {
        q,
        //endIndex: 0,
      };
      socket.send(JSON.stringify(req));
    }
  }, [gameType]);

  const getGames = () => {
    const games_ = games.sort((a, b) => {
      const aTime = a.startedAtUnixTime || 10000000000;
      const bTime = b.startedAtUnixTime || 10000000000;
      return bTime - aTime;
    });
    return games_;
  };

  return (
    <Content title="ゲーム一覧">
      <div style={{ textAlign: "center" }}>
        <Clock />
        <ToggleButtonGroup
          value={gameType}
          exclusive
          onChange={(_, value) => setGameType(value)}
        >
          <ToggleButton value="normal">フリーマッチ</ToggleButton>
          <ToggleButton value="self">カスタムマッチ</ToggleButton>
        </ToggleButtonGroup>
        <GameList games={getGames()} />
      </div>
    </Content>
  );
}

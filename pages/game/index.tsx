import React, { useEffect, useState } from "react";
import ToggleButtonGroup from "@material-ui/core/ToggleButtonGroup";
import ToggleButton from "@material-ui/core/ToggleButton";

import Content from "../../components/content.tsx";
import GameList from "../../components/gamelist.tsx";
import Clock from "../../components/clock.tsx";

import { Game } from "../../apiserver/types.ts";

export default function () {
  const [games, setGames] = useState<Game[]>([]);
  let socket: WebSocket;

  useEffect(() => {
    socket = new WebSocket(
      ((window.location.protocol === "https:") ? "wss://" : "ws://") +
        window.location.host + "/api/allGame",
    );
    socket.onopen = (event) => {
      console.log("websocket open");
    };
    socket.onmessage = (event) => {
      console.log("websocket onmessage");
      const games = JSON.parse(event.data) as Game[];
      setGames(games);
    };
    return () => {
      socket.close();
      console.log("websocket close");
    };
  }, []);

  const [gameType, setGameType] = React.useState<string>("normal");

  const getGames = () => {
    const games_ = games.filter((game) => game.type === gameType)
      .sort((a, b) => {
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

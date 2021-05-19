import React, { useEffect, useState } from "react";
import { RouteComponentProps } from "react-router-dom";
import Button from "@material-ui/core/Button";
import ButtonGroup from "@material-ui/core/ButtonGroup";

import Content from "../../components/content.tsx";
import GameList from "../../components/gamelist.tsx";
import Clock from "../../components/clock.tsx";

export default function (props: RouteComponentProps) {
  const [games, setGames] = useState<any[]>([]);
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
      const games = JSON.parse(event.data);
      setGames(games);
      //gameTableVue.update(games);
    };
    return () => {
      socket.close();

      console.log("websocket close");
    };
  }, []);

  const [gameType, setGameType] = React.useState<string | null>("normal");

  const handleGameType = (
    newGameType: string | null,
  ) => {
    setGameType(newGameType);
  };

  const getGames = () => {
    const games_ = games.filter((game: any) => game.type === gameType)
      .reverse();
    return games_;
  };

  return (
    <Content title="ゲーム一覧">
      <Clock />
      <ButtonGroup>
        <Button
          color="secondary"
          variant="contained"
          onClick={() => handleGameType("normal")}
          disabled={gameType === "normal"}
        >
          フリーマッチ
        </Button>
        <Button
          color="secondary"
          variant="contained"
          onClick={() => handleGameType("self")}
          disabled={gameType === "self"}
        >
          カスタムマッチ
        </Button>
      </ButtonGroup>
      <GameList games={getGames()} {...props} />
    </Content>
  );
}
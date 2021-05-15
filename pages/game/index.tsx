import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Button from "@material-ui/core/Button";
import ButtonGroup from "@material-ui/core/ButtonGroup";

import Content from "../../components/content.tsx";
import GameList from "../../components/gamelist.tsx";
import Clock from "../../components/clock.tsx";

export default function () {
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
    const games_ = games.filter((game) => game.type === gameType);
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
      <GameList games={getGames()} />
    </Content>
  );
}

/*
const Index: DFC<{ title: string }> = ({ title }) => {
  return (
    <div>
      
      <div
        className="game-table"
        dangerouslySetInnerHTML={{
          __html: `
                <button v-on:click="nowType = 0" :disabled="nowType === 0">フリーマッチ</button>
                <button v-on:click="nowType = 1" :disabled="nowType === 1">カスタムマッチ</button>

                <games-list v-bind:games="games[nowType]"> </games-list>`,
        }}
      />
      <script type="module" src="/js/game/index.js" />
      <link rel="stylesheet" href="/css/game/index.css" />
    </div>
  );
};

Index.getInitialProps = async () => {
  return { title: "ゲーム一覧" };
};

// default export are used for Server Side Rendering.
export default Index;
*/

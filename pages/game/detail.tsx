/// <reference lib="dom"/>
import React, { useEffect, useState } from "react";
import { RouteComponentProps } from "react-router-dom";
import { createStyles, makeStyles } from "@material-ui/core/styles";
import CircularProgress from "@material-ui/core/CircularProgress";
import Button from "@material-ui/core/Button";
import MenuItem from "@material-ui/core/MenuItem";

import ApiClient from "../../apiserver/api_client.js";
const apiClient = new ApiClient("");

import Content from "../../components/content.tsx";
import GameList from "../../components/gamelist.tsx";

const useStyles = makeStyles((theme) =>
  createStyles({
    content: {
      //textAlign: "center",
    },
  })
);

export default function (props: RouteComponentProps<{ id: string }>) {
  const classes = useStyles();

  const [game, setGame] = useState<any | null>(null);

  let socket: WebSocket;
  console.log("detail", props.match.params.id);

  useEffect(() => {
    const gameId = props.match.params.id;
    socket = new WebSocket(
      ((window.location.protocol === "https:") ? "wss://" : "ws://") +
        window.location.host + "/api/ws/game/" + gameId,
    );
    socket.onopen = (event) => {
      console.log("websocket open");
    };
    socket.onmessage = (event) => {
      const game = JSON.parse(event.data);
      console.log("websocket onmessage", game);
      setGame(game);
      //gameTableVue.update(games);
    };
    return () => {
      socket.close();

      console.log("websocket close");
    };
  }, []);

  return (
    <Content title="ゲーム詳細">
      <div className={classes.content}>
        {game
          ? <>
            <GameList games={[game]} />
          </>
          : <CircularProgress color="secondary" />}
      </div>
    </Content>
  );
}

/// <reference lib="dom"/>
import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import CircularProgress from "@material-ui/core/CircularProgress";
import Button from "@material-ui/core/Button";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// @deno-types=../../apiserver/api_client.d.ts
import ApiClient from "../../apiserver/api_client.js";
const apiClient = new ApiClient("");

import datas from "../../components/player_datas.ts";

import Content from "../../components/content.tsx";
import GameList from "../../components/gamelist.tsx";
import GameBoard from "../../components/gameBoard.tsx";

import { Game, User } from "../../apiserver/types.ts";

function PointsGraph(props: { game: Game }) {
  const game = props.game;
  const data: { turn: number; points: number[] }[] = [];

  game.log.forEach((turn, i) => {
    const points = turn.map((player) => {
      return player.point.basepoint + player.point.wallpoint;
    });
    data.push({ turn: i, points });
  });

  const [users, setUsers] = useState<User[]>([]);

  const getUsers = async () => {
    const users_: typeof users = [];
    for (const player of game.players) {
      if (users.some((user) => user.id === player.id)) continue;
      const res = await apiClient.usersShow(player.id);
      if (res.success) users_.push(res.data);
    }
    setUsers([...users, ...users_]);
  };

  useEffect(() => {
    getUsers();
  }, [game.gameId]);

  return <div style={{ width: "100%", height: "300px" }}>
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={data}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />

        {
          /*<XAxis dataKey="turn" />
        <YAxis />*/
        }
        <Tooltip labelFormatter={(props) => "Turn : " + props} />
        <Legend />

        {game.players.map((_, i) => {
          return <Line
            type="monotone"
            dataKey={`points[${i}]`}
            stroke={datas[i].colors[1]}
            name={users[i]?.screenName || "loading..."}
          />;
        })}
      </LineChart>
    </ResponsiveContainer>
  </div>;
}

export default function () {
  const { id } = useParams<{ id?: string }>();

  const [game, setGame] = useState<Game | null | undefined>(undefined);

  let socket: WebSocket;
  //console.log("detail", id);

  useEffect(() => {
    if (!id) {
      socket = new WebSocket(
        ((window.location.protocol === "https:") ? "wss://" : "ws://") +
          window.location.host + "/api/allGame",
      );
      socket.onmessage = (event) => {
        console.log("websocket onmessage");
        const games = JSON.parse(event.data) as Game[];
        if (games.length === 0) setGame(null);
        else setGame(games.reverse()[0]);
      };
    } else {
      socket = new WebSocket(
        ((window.location.protocol === "https:") ? "wss://" : "ws://") +
          window.location.host + "/api/ws/game/" + id,
      );
      socket.onmessage = (event) => {
        const game = JSON.parse(event.data) as Game;
        console.log("websocket onmessage", game);
        setGame(game);
      };
    }
    socket.onopen = (event) => {
      console.log("websocket open");
    };
    return () => {
      socket.close();
      console.log("websocket close");
    };
  }, [id]);

  return (
    <Content title="ゲーム詳細">
      <div>
        {game
          ? <>
            <Button
              component={Link}
              to={id ? `/vr/index?id=${id}` : "/vr/latest"}
              target="_blank"
            >
              VR版はこちら
            </Button>
            <GameList games={[game]} />
            <GameBoard game={game} />
            <PointsGraph game={game} />
          </>
          : <CircularProgress color="secondary" />}
      </div>
    </Content>
  );
}

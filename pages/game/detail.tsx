/// <reference lib="dom"/>
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { makeStyles } from "@material-ui/styles";
import CircularProgress from "@material-ui/core/CircularProgress";
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

import ApiClient from "../../apiserver/api_client.js";
const apiClient = new ApiClient("");

import datas from "../../components/player_datas.ts";

import Content from "../../components/content.tsx";
import GameList from "../../components/gamelist.tsx";
import GameBoard from "../../components/gameBoard.tsx";

const useStyles = makeStyles({
  content: {
    //textAlign: "center",
  },
});

function PointsGraph(props: { game: any }) {
  const game = props.game;
  const data: { turn: number; points: number[] }[] = [];

  (game.log as any[]).forEach((turn, i) => {
    const points = (turn as any[]).map((player) => {
      return player.point.basepoint + player.point.wallpoint;
    });
    data.push({ turn: i, points });
  });

  const [users, setUsers] = useState<any[]>([]);

  const getUsers = async () => {
    const users_ = [];
    for (const player of game.players) {
      if (users.some((user) => user.id === player.id)) continue;
      const user = (await apiClient.usersShow(player.id)).data;

      users_.push(user);
    }
    setUsers([...users, ...users_]);
  };

  useEffect(() => {
    getUsers();
  }, []);

  return <div style={{ width: "100%", height: "300px" }}>
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        width={500}
        height={300}
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

        {(game.players as any[]).map((_, i) => {
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

export default function (/*props: RouteComponentProps<{ id?: string }>*/) {
  const classes = useStyles();
  const { id } = useParams<{ id?: string }>();

  const [game, setGame] = useState<any | null>(null);
  const gameId = id; // props.match.params.id;

  let socket: WebSocket;
  console.log("detail", gameId);

  useEffect(() => {
    if (!gameId) {
      socket = new WebSocket(
        ((window.location.protocol === "https:") ? "wss://" : "ws://") +
          window.location.host + "/api/allGame",
      );
      socket.onopen = (event) => {
        console.log("websocket open");
      };
      socket.onmessage = (event) => {
        console.log("websocket onmessage");
        const games = JSON.parse(event.data) as any[];
        setGame(games.reverse()[0]);
      };
    } else {
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
      };
    }
    return () => {
      socket.close();

      console.log("websocket close");
    };
  }, []);

  return (
    <Content title="ゲーム詳細">
      {<div className={classes.content}>
        {game
          ? <>
            <a href={gameId ? `/vr/index?id=${gameId}` : "/vr/latest"}>
              VR版はこちら
            </a>
            <GameList games={[game]} />
            <GameBoard game={game} />
            <PointsGraph game={game} />
          </>
          : <CircularProgress color="secondary" />}
      </div>}
    </Content>
  );
}

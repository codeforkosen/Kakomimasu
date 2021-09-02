/// <reference lib="dom"/>
import React, { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { CircularProgress } from "@mui/material";
import { Button } from "@mui/material";
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

// @deno-types=../../client_js/api_client.d.ts
import ApiClient from "../../client_js/api_client.js";
const apiClient = new ApiClient("");

import datas from "../../components/player_datas.ts";

import Content from "../../components/content.tsx";
import GameList from "../../components/gamelist.tsx";
import GameBoard from "../../components/gameBoard.tsx";

import { Game, User, WsGameReq, WsGameRes } from "../../apiserver/types.ts";

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

  return (
    <div style={{ width: "100%", height: "300px" }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 5, right: 10, left: 5, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />

          <XAxis
            dataKey="turn"
            domain={[0, game.totalTurn - 1]}
            tickFormatter={(turn: number) => String(turn + 1)}
            type="number"
            tickCount={game.totalTurn / 2}
          />
          <YAxis />
          <Tooltip
            labelFormatter={(props: number) => "Turn : " + (props + 1)}
          />
          <Legend />

          {game.players.map((_, i) => {
            return (
              <Line
                type="monotone"
                dataKey={`points[${i}]`}
                stroke={datas[i].colors[1]}
                name={users[i]?.screenName || "loading..."}
              />
            );
          })}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function () {
  const { id } = useParams<{ id?: string }>();

  const [game, setGame] = useState<Game | null>();
  const refGame = useRef(game);

  let socket: WebSocket;

  const connect = () => {
    socket = new WebSocket(
      ((window.location.protocol === "https:") ? "wss://" : "ws://") +
        window.location.host + "/api/ws/game",
    );
    socket.onopen = () => {
      const q =
        (id
          ? [`id:${id}`]
          : ["sort:startAtUnixTime-desc", "is:newGame", `is:normal`])
          .join(
            " ",
          );
      console.log(q);
      const req: WsGameReq = {
        q,
        endIndex: 1,
      };
      socket.send(JSON.stringify(req));
    };
    socket.onmessage = (event) => {
      const res = JSON.parse(event.data) as WsGameRes;
      console.log(res);
      if (res.type === "initial") {
        if (res.games.length > 0) {
          console.log("setGame");
          setGame(res.games[0]);
        } else {
          setGame(null);
        }
      } else {
        if (res.game.gameId === refGame.current?.gameId) {
          setGame(res.game);
        } else if (
          (res.game.startedAtUnixTime ?? 10000000000) >
            (refGame.current?.startedAtUnixTime ?? 10000000000)
        ) {
          connect();
        }
      }
    };
    return () => {
      socket.close();
      console.log("websocket close");
    };
  };

  useEffect(() => {
    return connect();
  }, [id]);

  useEffect(() => {
    refGame.current = game;
  }, [game]);

  return (
    <Content title="ゲーム詳細">
      <div style={{ display: "flex", flexDirection: "column" }}>
        {game
          ? (
            <>
              <Button
                component={Link}
                to={id ? `/vr/index?id=${id}` : "/vr/latest"}
                target="_blank"
                style={{ margin: "auto" }}
              >
                VR版はこちら
              </Button>
              <GameList games={[game]} pagenation={false} hover={false} />
              <GameBoard game={game} />
              <PointsGraph game={game} />
            </>
          )
          : <CircularProgress color="secondary" />}
      </div>
    </Content>
  );
}

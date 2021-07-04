/// <reference lib="dom"/>
import React, { useEffect, useState } from "react";
import { createStyles, makeStyles } from "@material-ui/core/styles";
import { Link, Redirect, RouteComponentProps } from "react-router-dom";
import TextField from "@material-ui/core/TextField";
import MenuItem from "@material-ui/core/MenuItem";

import Content from "../../components/content.tsx";
import GameBoard from "../../components/gameBoard.tsx";

// @deno-types=../../client_js/api_client.d.ts
import ApiClient from "../../client_js/api_client.js";
const apiClient = new ApiClient("");

import { Board, Game } from "../../apiserver/types.ts";

const useStyles = makeStyles(
  createStyles({
    content: {
      display: "flex",
      alignItems: "center",
      flexDirection: "column",
    },
    pieGraph: {
      height: 300,
    },
  }),
);

type NestedPartial<T> = {
  [K in keyof T]?: T[K] extends Array<infer R> ? Array<NestedPartial<R>>
    : NestedPartial<T[K]>;
};

export default function () {
  const classes = useStyles();
  const [boards, setBoards] = useState<Board[]>();
  const [game, setGame] = useState<
    Pick<
      Game,
      | "board"
      | "tiled"
      | "players"
      | "log"
      | "startedAtUnixTime"
      | "gaming"
      | "ending"
      | "nextTurnUnixTime"
    >
  >();

  useEffect(() => {
    getBoards();
  }, []);

  async function getBoards() {
    const res = await apiClient.getBoards();
    console.log();
    if (res.success) setBoards(res.data);
  }

  const handleChange = (
    event: React.ChangeEvent<{ value: unknown }>,
  ) => {
    const value = event.target.value;
    if (!boards) return;
    const board = boards.find((b) => b.name === value);
    if (!board) return;
    const tiled = new Array(board.height * board.width);
    for (let i = 0; i < tiled.length; i++) {
      tiled[i] = [0, -1];
    }
    const game: Pick<
      Game,
      | "board"
      | "tiled"
      | "players"
      | "log"
      | "startedAtUnixTime"
      | "gaming"
      | "ending"
      | "nextTurnUnixTime"
    > = {
      board,
      tiled,
      players: [{ id: "", agents: [], point: { basepoint: 0, wallpoint: 0 } }, {
        id: "",
        agents: [],
        point: { basepoint: 0, wallpoint: 0 },
      }],
      log: [],
      startedAtUnixTime: null,
      nextTurnUnixTime: null,
      gaming: false,
      ending: false,
    };
    setGame(game);
  };

  useEffect(() => {
    if (!game) return;
    const table = document.querySelector("#game-board #field");
    if (!table) return;
    const board = game.board;
    if (!board) return;
    const tds = table.getElementsByTagName("td");

    for (let i = 0; i < tds.length; i++) {
      const [x, y] = [i % board.height, Math.floor(i / board.width)];
      const td = tds[i];
      td.oncontextmenu = () => false;
      td.onmousedown = (e) => {
        if (!game.tiled) return;
        const tiled = [...game.tiled];
        const players = [...game.players];

        const isAgent = (x: number, y: number) => {
          if (game.players) {
            const agent = game.players.map((e, i) =>
              e.agents.map((e_, j) => {
                return { agent: e_, player: i, n: j };
              })
            ).flat().find((e) => e.agent.x === x && e.agent.y === y);
            return agent;
          } else return undefined;
        };

        switch (e.button) {
          case 0: {
            let t = tiled[i];
            let a = (t[0] * 2 + t[1]) + 1;
            a = (a + 1) % 5;
            t = [Math.trunc((a - 1) / 2) as 0 | 1, (a - 1) % 2];
            tiled[i] = t;

            const agent = isAgent(x, y);
            if (agent) {
              players[agent.player].agents.splice(agent.n, 1);
            }
            break;
          }
          case 2: {
            const t = tiled[i];
            if (t[0] === 1) {
              const a = isAgent(x, y);
              if (a) players[a.player].agents.splice(a.n, 1);
              else players[t[1]].agents.push({ x, y });
            }
            break;
          }
        }
        setGame({ ...game, tiled, players });
      };
    }
  });

  return (
    <Content title="フィールド説明用エディタ">
      <div className={classes.content}>
        <TextField
          select
          label="使用ボード"
          variant="standard"
          color="secondary"
          autoComplete="off"
          style={{ width: "20em" }}
          onChange={handleChange}
        >
          {boards?.map((board) => {
            return <MenuItem value={board.name}>{board.name}</MenuItem>;
          })}
        </TextField>
        {game && <div id="game-board">
          <GameBoard game={game} />
        </div>}
      </div>
    </Content>
  );
}

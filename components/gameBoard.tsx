import React, { useEffect, useState } from "react";
import { makeStyles } from "@material-ui/styles";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import { Link, useHistory } from "react-router-dom";

import { Game, User } from "../apiserver/types.ts";

// @deno-types=../client_js/api_client.d.ts
import ApiClient from "../client_js/api_client.js";
const apiClient = new ApiClient("");

import datas from "./player_datas.ts";

type Props = {
  game: Pick<Game, "board" | "tiled" | "players" | "log">;
};

const useStyles = makeStyles({
  content: {
    display: "grid",
    height: "auto",
    "&>div": {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
  },
  table: { // table全体のcss
    borderCollapse: "collapse",
    userSelect: "none",
    "& td,& th": {
      padding: 5,
    },
    "& td": {
      border: "1px solid",
      width: 50,
      height: 50,
      textAlign: "right",
      verticalAlign: "bottom",
      whiteSpace: "pre-line",
      position: "relative",
    },
  },
  agent: { // agentがいるマスのcss
    backgroundSize: "80%",
    backgroundPosition: "0% 50%",
    backgroundRepeat: "no-repeat",
  },
  conflict: { // conflictしているマスのcss
    animation: "$flash 1s linear infinite",
  },
  "@keyframes flash": { // conflictのアニメーション
    "0%,100%": {},
    "50%": { backgroundColor: "#00ff00" },
  },
  striket: {
    textDecoration: "line-through",
    color: "red",
    fontSize: "80%",
  },
  detail: { // agentの詳細を表示するcss
    display: "none",
    position: "absolute",
    backgroundColor: "rgba(0, 0, 0, .7)",
    color: "white",
    zIndex: 1,
    top: "50%",
    left: "50%",
    textAlign: "center",
    borderRadius: "10px",
    transform: "translate(+0%, -100%)",
    padding: "1em",
    filter: "drop-shadow(0 0 5px rgba(0, 0, 0, .7))",
    width: "max-content",
    "$td:hover &": {
      display: "block",
    },
  },
  detailHistory: { // agent詳細内の履歴のスクロールcss
    width: "13em",
    height: "10em",
    overflowY: "scroll",
  },
  playerTable: {
    border: "1px solid black",
    textAlign: "center",
    borderCollapse: "collapse",
    "& td,& th": {
      border: "1px solid black",
      padding: 5,
    },
    "& td": {
      color: "black",
    },
  },
});

export default function (props: Props) {
  const classes = useStyles();
  const media = useMediaQuery("(max-width:1000px");
  const game = props.game;
  //console.log("gameBoard", game);

  const [users, setUsers] = useState<User[]>([]);

  /*const turnT = (game.gaming || game.ending)
    ? `${game.turn}/${game.totalTurn}`
    : "-";

  const points = (game.players as any[]).map(
    (player) => (player.point.basepoint + player.point.wallpoint),
  );

  const getStatusT = () => {
    if (game.startedAtUnixTime === null) return "プレイヤー入室待ち";
    else if (game.ending) return "ゲーム終了";
    else if (game.gaming) return "プレイ中";
    else return "ゲームスタート待ち";
  };*/

  const getUsers = async () => {
    const users_ = [];
    for (const player of game.players) {
      if (users.some((user) => user.id === player.id)) continue;
      const res = await apiClient.usersShow(player.id);
      if (res.success) {
        const user = res.data;

        users_.push(user);
      }
    }
    setUsers([...users, ...users_]);
  };

  const getPlacedAgentNum = (i: number) => {
    let num = 0;
    game.players[i].agents.forEach((agent) => {
      if (agent.x !== -1) num++;
    });
    return num;
  };
  const getNotPlacedAgentNum = (i: number) => {
    let num = 0;
    game.players[i].agents.forEach((agent) => {
      if (agent.x === -1) num++;
    });
    return num;
  };
  const index = (x: number, y: number) => {
    return x + y * game.board.width;
  };
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
  const agentHistory = (agent: ReturnType<typeof isAgent>) => {
    if (!agent) return [];
    const log = game.log;
    if (!log) return [];
    const pid = agent.player, aid = agent.n;

    const history = [];
    for (let i = 0; i < log.length; i++) {
      const act = Object.assign(
        {},
        log[i][pid].actions.find((e) => e.agentId === aid),
      );
      let type = "";
      if (act) {
        if (act.type === 1) type = "配置";
        else if (act.type === 3) type = "移動";
        else if (act.type === 4) type = "除去";
        else {
          type = "停留";
          //act.x = act.y = undefined;
        }
      } else {
        type = "停留";
      }
      //act.turn = i;
      history.push({ ...act, type, turn: i });
    }
    return history.reverse();
  };
  const getCell = (x: number, y: number) => {
    return {
      point: game.board.points[index(x, y)] as number,
      tiled: (game.tiled ? game.tiled[index(x, y)] : [0, -1]) as [
        number,
        number,
      ],
    };
  };
  useEffect(() => {
    console.log("useEffect gameBoard");
    getUsers();
  }, []);

  /*useEffect(() => {
    console.log("update gameBoard", game.tiled[0]);
  });*/

  return (
    <div
      className={classes.content}
      style={{ gridTemplateColumns: media ? "1fr 1fr" : "1fr auto 1fr" }}
    >
      {users.map((user, i) => (
        <div>
          <table
            className={classes.playerTable}
            style={{ color: datas[i].colors[1] }}
          >
            <tr>
              <th>プレイヤー名</th>
              <td>
                <Link to={"/user/detail/" + user.name}>
                  {user.screenName}
                </Link>
              </td>
            </tr>
            <tr>
              <th>配置済みAgent数</th>
              <td>{getPlacedAgentNum(i)}</td>
            </tr>
            <tr>
              <th>未配置Agent数</th>
              <td>{getNotPlacedAgentNum(i)}</td>
            </tr>
          </table>
        </div>
      ))}
      <div
        style={media
          ? { order: -1, gridRow: "1", gridColumn: "1/3" }
          : { gridRow: "1/-1", gridColumn: "2" }}
      >
        {
          /* GameListが同じ内容を兼ねているため削除。見にくかったら戻します。
          <div
          style={{
            position: "relative",
            height: 30,
            minWidth: "16em",
            display: "grid",
            gridTemplateColumns: "1fr auto afr",
          }}
        >
          <h4>{turnT ? turnT : "-"}</h4>
          {turnT
            ? points.map((point, i) =>
              <>
                <h4>{point}</h4>
                {i < (points.length - 1) && <h4>:</h4>}
              </>
            )
            : <h4>{getStatusT()}</h4>}
          {turnT && <h4>{getStatusT()}</h4>}
          </div>*/
        }
        {game.board && <table id="field" className={classes.table}>
          <tr>
            <th></th>
            {[...Array(game.board.width)].map((_, x) => {
              return <th>{x + 1}</th>;
            })}
            <th></th>
          </tr>
          {[...Array(game.board.height)].map((_, y) => {
            return (
              <tr>
                <th>{y}</th>
                {[...Array(game.board.width)].map((_, x) => {
                  const cell = getCell(x, y);
                  const agent = isAgent(x, y);
                  const isAbs = cell.point < 0 && cell.tiled[1] !== -1 &&
                    cell.tiled[0] === 0;
                  const isConflict = game.log
                    ? (() => {
                      const lastActLog = game.log[game.log.length - 1]?.map((
                        e,
                      ) => e.actions).flat();
                      const isConflict = lastActLog?.some(
                        (a) => ((a.res > 0 && a.res < 3) && a.x === x &&
                          a.y === y),
                      );
                      return isConflict;
                    })()
                    : false;

                  const bgColor = () => {
                    if (cell.tiled[1] !== -1) {
                      return datas[cell.tiled[1]].colors[cell.tiled[0]];
                    } else if (cell.point < 0) {
                      const l = 100 - (Math.abs(cell.point) * 50 / 16);
                      return `hsl(0,0%,${l}%)`;
                    } else if (cell.point > 0) {
                      const l = 100 - (Math.abs(cell.point) * 50 / 16);
                      return `hsl(60,100%,${l}%)`;
                    }
                  };

                  return <td
                    className={`${agent && classes.agent} ${isConflict &&
                      classes.conflict}`}
                    style={{
                      backgroundImage: agent &&
                        `url(${datas[agent.player].agentUrl})`,
                      backgroundColor: bgColor(),
                    }}
                  >
                    <span className={isAbs ? classes.striket : ""}>
                      {cell.point}
                    </span>
                    {isAbs && <>
                      <br />
                      <span>{Math.abs(cell.point)}</span>
                    </>}
                    {agent && users[agent.player] &&
                      <div
                        className={classes.detail}
                        style={{
                          border: `solid 4px ${datas[agent.player].colors[1]}`,
                        }}
                      >
                        <span>
                          {users[agent.player].screenName}:{agent.n + 1}
                        </span>
                        <br />
                        <span>行動履歴</span>
                        <div
                          className={classes.detailHistory}
                        >
                          {agentHistory(agent).map((e) => {
                            return <div
                              style={{
                                textDecoration: e.res > 0
                                  ? "line-through"
                                  : "none",
                              }}
                            >
                              T{e.turn}：{e.type !== "停留" &&
                                `x:${e.x} , y:${e.y}に`}
                              {e.type}
                            </div>;
                          })}
                        </div>
                      </div>}
                  </td>;
                })}
                <th>{y}</th>
              </tr>
            );
          })}
          <tr>
            <th></th>
            {[...Array(game.board.width)].map((_, x) => {
              return <th>{x + 1}</th>;
            })}
            <th></th>
          </tr>
        </table>}
      </div>
    </div>
  );
}

import React, { useEffect, useState } from "react";
import { createStyles, makeStyles } from "@material-ui/core";
import { Link } from "react-router-dom";

import ApiClient from "../apiserver/api_client.js";
const apiClient = new ApiClient("");

type Props = {
  children?: React.ReactNode;
  games: any[];
};

const useStyles = makeStyles((theme) =>
  createStyles({
    table: {
      borderCollapse: "separate",
      borderSpacing: "0em 0.5em",
      margin: "0 auto",
      textAlign: "center",
      "& td": {
        borderBottom: "2px solid",
        borderBottomColor: theme.palette.secondary.main,
        padding: "0 0.5em",
      },
    },
    un: {
      color: "gray",
    },
    waiting: {
      color: "yellow",
    },
    gaming: {
      color: "green",
    },
    ending: {
      color: "red",
    },
    playerDiv: {
      margin: "0 0.5em",
    },
    player: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      flexDirection: "row",
    },
    gameName: {
      textAlign: "left",
    },
    gameNameId: {
      fontSize: "0.8em",
    },
  })
);

const GameList: React.FC<Props> = (props) => {
  const classes = useStyles();
  const games = props.games;
  const [users, setUsers] = useState<any[] | null>();

  const getUsers = async () => {
    const users: any[] = [];
    console.log("getUsers", games);
    for (const game of games) {
      console.log("game", game);
      for (const player of game.players) {
        console.log("player", player);
        if (users.some((user) => user.id === player.id)) continue;
        console.log("player2", player);
        const user = await apiClient.usersShow(player.id);
        console.log("user", user);
        users.push(user);
      }
    }
    console.log("users", users);
    setUsers(users);
  };

  useEffect(() => {
    getUsers();
  }, []);

  const getStatusClass = (game: any) => {
    if (game.ending) return classes.ending;
    else if (game.gaming) return classes.gaming;
    else return classes.waiting;
  };

  const getStartTime = (game: any) => {
    if (game.startedAtUnixTime === null) {
      return "-";
    } else {
      return new Date(game.startedAtUnixTime * 1000).toLocaleString(
        "ja-JP",
      );
    }
  };

  const getPoint = (player: any) => {
    return player.point.basepoint + player.point.wallpoint;
  };

  const getUser = (id: any) => {
    if (!users) return undefined;
    return users.find((user) => user.id === id);
  };
  return (
    <div>
      <div>
        <span className={classes.waiting}>●</span>：ユーザ参加待ち
        <span className={classes.gaming}>●</span>：ゲーム中
        <span className={classes.ending}>●</span>：終了
      </div>
      <table className={classes.table}>
        <tr>
          <td>
            <div>ステータス</div>
            <div>ターン</div>
          </td>
          <td>
            <div className={classes.player}>
              <div className={classes.player}>
                <div>
                  <span>プレイヤー名</span>
                  <br />ポイント
                </div>
              </div>
            </div>
          </td>
          <td className={classes.gameName}>
            <div>ゲーム名</div>
            <div>ゲームID</div>
          </td>
          <td>開始時間</td>
        </tr>
        {games.map((game) => {
          return (
            <tr>
              <td>
                <div className={getStatusClass(game)}>●</div>
                <div>{game.turn}</div>
              </td>
              <td>
                <div className={classes.player}>
                  {(game.players as any[]).map((player, i) => {
                    return (
                      <div className={classes.player + " " + classes.playerDiv}>
                        {i !== 0 && <div className={classes.playerDiv}>vs</div>}
                        <div>
                          {getUser(player.id)
                            ? <span>
                              <Link
                                to={`/user/detail/${getUser(player.id).name}`}
                              >
                                {getUser(player.id).screenName}
                              </Link>
                            </span>
                            : <span className={classes.un}>No player</span>}

                          <br />
                          {getPoint(player)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </td>
              <td className={classes.gameName}>
                {game.gameName
                  ? <div>{game.gameName}</div>
                  : <div className={classes.un}>Untitle</div>}
                <div className={classes.gameNameId}>{game.gameId}</div>
              </td>
              <td>{getStartTime(game)} 開始</td>
            </tr>
          );
        })}
      </table>
    </div>
  );
};

export default GameList;

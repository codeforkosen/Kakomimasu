import React, { useEffect, useState } from "react";
import { Theme, useTheme } from "@material-ui/core/styles";
import { makeStyles } from "@material-ui/styles";
import { Link, useHistory } from "react-router-dom";

import { Game, Player, User } from "../apiserver/types.ts";

// @deno-types=../client_js/api_client.d.ts
import ApiClient from "../client_js/api_client.js";
const apiClient = new ApiClient("");

type Props = {
  games: Game[];
};

const useStyles = makeStyles({
  table: (theme: Theme) => ({
    borderCollapse: "separate",
    borderSpacing: "0em 0.5em",
    margin: "0 auto",
    textAlign: "center",
    "& td": {
      borderBottom: "2px solid",
      borderBottomColor: theme.palette.secondary.main,
      padding: "0 0.5em",
    },
  }),
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
  gameNameId: {
    maxWidth: "30em",
    textAlign: "left",
  },
  gameName: {
    maxWidth: "30em",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  gameId: {
    fontSize: "0.8em",
  },
});

const GameList: React.FC<Props> = (props: Props) => {
  const theme = useTheme();
  const classes = useStyles(theme);
  const history = useHistory();
  const games = props.games;
  const [users, setUsers] = useState<User[] | null>();

  const getUsers = async () => {
    const users: User[] = [];
    console.log("getUsers", games);
    for (const game of games) {
      console.log("game", game);
      for (const player of game.players) {
        console.log("player", player);
        if (users.some((user) => user.id === player.id)) continue;
        console.log("player2", player);
        const res = await apiClient.usersShow(player.id);
        if (res.success) {
          const user = res.data;
          console.log("user", user);
          users.push(user);
        }
      }
    }
    console.log("users", users);
    setUsers(users);
  };

  useEffect(() => {
    getUsers();
  }, []);

  const getStatusClass = (game: Game) => {
    if (game.ending) return classes.ending;
    else if (game.gaming) return classes.gaming;
    else return classes.waiting;
  };

  const getStartTime = (game: Game) => {
    if (game.startedAtUnixTime === null) {
      return "-";
    } else {
      return new Date(game.startedAtUnixTime * 1000).toLocaleString(
        "ja-JP",
      );
    }
  };

  const getPoint = (player: Player) => {
    return player.point.basepoint + player.point.wallpoint;
  };

  const getUser = (id: string) => {
    if (!users) return undefined;
    return users.find((user) => user.id === id);
  };

  const toGameDetail = (id: string) => {
    history.push("/game/detail/" + id);
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
          <td className={classes.gameNameId}>
            <div className={classes.gameName}>ゲーム名</div>
            <div className={classes.gameId}>ゲームID</div>
          </td>
          <td>開始時間</td>
        </tr>
        {games.map((game) => {
          return (
            <tr onClick={() => toGameDetail(game.gameId)}>
              <td>
                <div className={getStatusClass(game)}>●</div>
                <div>{game.turn}</div>
              </td>
              <td>
                <div className={classes.player}>
                  {game.players.map((player, i) => {
                    return (
                      <div className={classes.player + " " + classes.playerDiv}>
                        {i !== 0 && <div className={classes.playerDiv}>vs</div>}
                        <div>
                          {(() => {
                            const user = getUser(player.id);
                            return user
                              ? <span>
                                <Link
                                  to={`/user/detail/${user.name}`}
                                >
                                  {user.screenName}
                                </Link>
                              </span>
                              : <span className={classes.un}>No player</span>;
                          })()}
                          <br />
                          {getPoint(player)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </td>
              <td className={classes.gameNameId}>
                {game.gameName
                  ? <div className={classes.gameName}>{game.gameName}</div>
                  : <div className={`${classes.un} ${classes.gameName}`}>
                    Untitle
                  </div>}
                <div className={classes.gameId}>{game.gameId}</div>
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

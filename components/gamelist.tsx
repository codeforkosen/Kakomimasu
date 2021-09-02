import React, { useEffect, useState } from "react";
import { useTheme } from "@mui/material/styles";
import { makeStyles } from "@mui/styles";
import { Link, useHistory } from "react-router-dom";
import { Table } from "@mui/material";
import { TableContainer } from "@mui/material";
import { TableBody } from "@mui/material";
import { TableCell } from "@mui/material";
import { TableHead } from "@mui/material";
import { TableRow } from "@mui/material";
import { TableFooter } from "@mui/material";
import { TablePagination } from "@mui/material";
import { Paper } from "@mui/material";
import { Box } from "@mui/material";
import { IconButton } from "@mui/material";
import { FirstPage } from "@mui/icons-material";
import { KeyboardArrowLeft } from "@mui/icons-material";
import { KeyboardArrowRight } from "@mui/icons-material";
import { LastPage } from "@mui/icons-material";

import { Game, Player, User } from "../apiserver/types.ts";

// @deno-types=../client_js/api_client.d.ts
import ApiClient from "../client_js/api_client.js";
const apiClient = new ApiClient("");

const useStyles = makeStyles({
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
    maxWidth: "30em",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  gameId: {
    fontSize: "0.8em",
  },
});

const GameList = (props: {
  games: Game[];
  pagenation?: boolean;
  hover?: boolean;
}) => {
  const pagenation = props.pagenation ?? true;
  const hover = props.hover ?? true;
  const games = props.games;

  const classes = useStyles();
  const history = useHistory();

  type IUser = {
    u: User;
    exists: true;
  } | { u: { id: string }; exists: false };
  const [users, setUsers] = useState<IUser[]>([]);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  const getUsers = async () => {
    const u: typeof users = [];
    //console.log("getUsers", games);
    for (const game of games) {
      //console.log("game", game);
      for (const player of game.players) {
        //console.log("player", player);
        if ([...users, ...u].some((user) => user.u.id === player.id)) continue;
        //console.log("player2", player);
        const res = await apiClient.usersShow(player.id);
        if (res.success) {
          const user = res.data;
          //console.log("user", user);
          u.push({ u: user, exists: true });
        } else u.push({ exists: false, u: { id: player.id } });
      }
    }
    //console.log("u", u);
    setUsers([...users, ...u]);
  };

  useEffect(() => {
    getUsers();
  }, [games]);

  const getStatusClass = (game: Game) => {
    if (game.ending) return classes.ending;
    else if (game.gaming) return classes.gaming;
    else return classes.waiting;
  };

  const getStartTime = (startedAtUnixTime: number | null) => {
    if (startedAtUnixTime === null) return "-";
    else {
      return new Date(startedAtUnixTime * 1000).toLocaleString();
    }
  };

  const getPoint = (player: Player) => {
    return player.point.basepoint + player.point.wallpoint;
  };

  const getUser = (id: string) => {
    const user = users.find((user) => user.u.id === id);
    if (user?.exists) return user.u;
    else return undefined;
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
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell style={{ minWidth: "8em" }}>
                <div>ステータス</div>
                <div>ターン</div>
              </TableCell>
              <TableCell>
                <div>プレイヤー名</div>
                <div>ポイント</div>
              </TableCell>
              <TableCell>
                <div className={classes.gameName}>ゲーム名</div>
                <div className={classes.gameId}>ゲームID</div>
              </TableCell>
              <TableCell>開始時間</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(rowsPerPage > 0
              ? games.slice(
                page * rowsPerPage,
                page * rowsPerPage + rowsPerPage,
              )
              : games).map((game) => (
                <TableRow
                  hover={hover}
                  onClick={() => hover && toGameDetail(game.gameId)}
                >
                  <TableCell align="center">
                    <div className={getStatusClass(game)}>●</div>
                    <div>{game.turn}/{game.totalTurn}</div>
                  </TableCell>
                  <TableCell>
                    <div className={classes.player}>
                      {game.players.map((player, i) => {
                        return (
                          <div
                            className={classes.player + " " + classes.playerDiv}
                            style={{ width: "max-content" }}
                          >
                            {i !== 0 &&
                              <div className={classes.playerDiv}>vs</div>}
                            <div>
                              {(() => {
                                const user = getUser(player.id);
                                return user
                                  ? (
                                    <span>
                                      <Link
                                        to={`/user/detail/${user.name}`}
                                      >
                                        {user.screenName}
                                      </Link>
                                    </span>
                                  )
                                  : (
                                    <span className={classes.un}>
                                      No player
                                    </span>
                                  );
                              })()}
                              <br />
                              {getPoint(player)}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </TableCell>
                  <TableCell>
                    {game.gameName
                      ? <div className={classes.gameName}>{game.gameName}</div>
                      : (
                        <div className={`${classes.un} ${classes.gameName}`}>
                          Untitle
                        </div>
                      )}
                    <div className={classes.gameId}>{game.gameId}</div>
                  </TableCell>
                  <TableCell>{getStartTime(game.startedAtUnixTime)}</TableCell>
                </TableRow>
              ))}
          </TableBody>
          {pagenation && (
            <TableFooter>
              <TableRow>
                <TablePagination
                  rowsPerPageOptions={[10, 20, 30, { label: "すべて", value: -1 }]}
                  colSpan={4}
                  count={games.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  SelectProps={{
                    inputProps: {
                      "aria-label": "1ページあたりの行数",
                    },
                    native: true,
                  }}
                  onPageChange={(_, newPage) => setPage(newPage)}
                  onRowsPerPageChange={(
                    event: React.ChangeEvent<{ value: string }>,
                  ) => {
                    setRowsPerPage(parseInt(event.target.value, 10));
                    setPage(0);
                  }}
                  ActionsComponent={TablePaginationActions}
                />
              </TableRow>
            </TableFooter>
          )}
        </Table>
      </TableContainer>
    </div>
  );
};

function TablePaginationActions(props: {
  count: number;
  page: number;
  rowsPerPage: number;
  onPageChange: (
    event: React.MouseEvent<HTMLButtonElement>,
    newPage: number,
  ) => void;
}) {
  const theme = useTheme();
  const { count, page, rowsPerPage, onPageChange } = props;

  const handleFirstPageButtonClick = (
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    onPageChange(event, 0);
  };

  const handleBackButtonClick = (
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    onPageChange(event, page - 1);
  };

  const handleNextButtonClick = (
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    onPageChange(event, page + 1);
  };

  const handleLastPageButtonClick = (
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    onPageChange(event, Math.max(0, Math.ceil(count / rowsPerPage) - 1));
  };

  return (
    <Box sx={{ flexShrink: 0, ml: 2.5 }}>
      <IconButton
        onClick={handleFirstPageButtonClick}
        disabled={page === 0}
        aria-label="first page"
      >
        {theme.direction === "rtl" ? <LastPage /> : <FirstPage />}
      </IconButton>
      <IconButton
        onClick={handleBackButtonClick}
        disabled={page === 0}
        aria-label="previous page"
      >
        {theme.direction === "rtl"
          ? <KeyboardArrowRight />
          : <KeyboardArrowLeft />}
      </IconButton>
      <IconButton
        onClick={handleNextButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="next page"
      >
        {theme.direction === "rtl" ? <KeyboardArrowLeft />
        : <KeyboardArrowRight />}
      </IconButton>
      <IconButton
        onClick={handleLastPageButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="last page"
      >
        {theme.direction === "rtl" ? <FirstPage /> : <LastPage />}
      </IconButton>
    </Box>
  );
}

export default GameList;

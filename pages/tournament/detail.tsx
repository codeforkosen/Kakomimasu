/// <reference lib="dom"/>
import React, { useEffect, useState } from "react";
import { Link, RouteComponentProps, useHistory } from "react-router-dom";
import { createStyles, makeStyles } from "@material-ui/core/styles";
import CircularProgress from "@material-ui/core/CircularProgress";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";

import Autocomplete from "@material-ui/lab/Autocomplete";

// @deno-types="../../apiserver/api_client.d.ts"
import ApiClient from "../../apiserver/api_client.js";
const apiClient = new ApiClient("");

import { Game, Tournament, User } from "../../apiserver/types.ts";

import Content from "../../components/content.tsx";
import Section, { SubSection } from "../../components/section.tsx";

const useStyles = makeStyles((theme) =>
  createStyles({
    table: {
      margin: "0 auto",
      width: "90%",
      border: "1px solid",
      borderCollapse: "collapse",
      "& td,& th": {
        border: "1px solid",
      },
    },
    oblique: {
      backgroundImage: `linear-gradient(to top right,
        transparent, transparent 49%,
        black 49%, black 51%,
        transparent 51%, transparent)`,
    },
  })
);

export default function (props: RouteComponentProps<{ id: string }>) {
  const classes = useStyles();
  const history = useHistory();

  const [tournament, setTournament] = useState<Tournament | null | undefined>(
    undefined,
  );
  const [games, setGames] = useState<Game[] | null>(null);
  const [users, setUsers] = useState<(User | undefined)[] | null>(null);
  const [addUserInput, setAddUserInput] = useState<
    { value: string; helperText: string; q: any[] }
  >({ value: "", helperText: "", q: [] });
  const tournamentId = props.match.params.id;

  const getTournament = async () => {
    const res = await apiClient.tournamentsGet(tournamentId);
    if (res.success) setTournament(res.data);
    else setTournament(null);
  };

  const updateTournament = async () => {
    if (!tournament) return;
    const games_: typeof games = [];
    for await (const gameId of tournament.gameIds) {
      const res = await apiClient.getMatch(gameId);
      if (res.success) games_.push(res.data);
    }
    const users_: typeof users = [];
    for await (const userId of tournament.users) {
      const res = await apiClient.usersShow(userId);
      if (res.success) users_.push(res.data);
      else users_.push(undefined);
    }
    setGames(games_);
    setUsers(users_);
  };

  const getType = (type: string) => {
    if (type === "round-robin") return "総当たり戦";
    else if (type === "knockout") return "勝ち残り戦";
    return "";
  };

  const addHandleChange = async (
    event: React.ChangeEvent<{ value: string }>,
  ) => {
    const value = event.target.value;
    let req = await apiClient.usersSearch(value);
    let q: any[] = [];
    if (req.success) q = req.data;
    //console.log(req);
    //if (req.errorCode) req = [];
    setAddUserInput({ value, helperText: "", q });
  };

  const submit = async () => {
    const req = await apiClient.tournamentsAddUser(
      tournamentId,
      { user: addUserInput.value },
    );
    console.log({ user: addUserInput.value });
    console.log(req);
    if (req.success) setTournament(req.data);
  };

  const getResult = (m: number, o: number) => {
    if (!tournament) return;
    if (!games) return;
    //if (!users) return;
    const mUserId = tournament.users[m];
    const oUserId = tournament.users[o];

    //console.log(users, games_);

    const game = games.find((e) =>
      e.reservedUsers[0] === mUserId &&
        e.reservedUsers[1] === oUserId ||
      e.reservedUsers[0] === oUserId &&
        e.reservedUsers[1] === mUserId
    );
    if (game) {
      let url = `/game/detail/` + game.gameId;
      let pointText = "";
      let resultText = "-";
      if (game.gaming || game.ending) {
        const p = game.players;
        const mPlayer = p.find((e) => e.id === mUserId);
        const oPlayer = p.find((e) => e.id === oUserId);
        if (!mPlayer || !oPlayer) return;
        const mPoint = mPlayer.point.basepoint + mPlayer.point.wallpoint;
        const oPoint = oPlayer.point.basepoint + oPlayer.point.wallpoint;
        pointText = `${mPoint} - ${oPoint}`;
        if (mPoint > oPoint) resultText = "○";
        else if (mPoint < oPoint) resultText = "×";
        else resultText = "△";
      }
      return { pointText, resultText, url };
    } else return;
  };

  const gameCreate = (m: number, o: number) => {
    if (!users) return;
    if (!tournament) return;
    const mUser = users[m];
    const oUser = users[o];
    if (!mUser || !oUser) return;

    const params = new URLSearchParams();
    params.append(
      "name",
      `${tournament.name}:${mUser.screenName} vs ${oUser.screenName}`,
    );
    params.append("n-player", "2");
    params.append("player1", mUser.name);
    params.append("player2", oUser.name);
    params.append("tournament-id", tournament.id);
    params.append("return", "true");
    history.push("/game/create?" + params.toString());
  };

  useEffect(() => {
    getTournament();
  }, []);

  useEffect(() => {
    updateTournament();
  }, [tournament]);

  return (
    <Content title="大会詳細">
      <div>
        <Button
          onClick={() => {
            history.push("/tournament/index");
          }}
        >
          大会一覧に戻る
        </Button>
        {tournament
          ? <>
            <Section title="基本情報">
              <SubSection title="大会名">
                <div>{tournament.name}</div>
              </SubSection>
              <SubSection title="主催">
                <div>{tournament.organizer}</div>
              </SubSection>
              <SubSection title="大会ID">
                <div>{tournament.id}</div>
              </SubSection>
              <SubSection title="試合形式">
                <div>{getType(tournament.type)}</div>
              </SubSection>
              {tournament.remarks && <SubSection title="備考">
                <div>{tournament.remarks}</div>
              </SubSection>}
            </Section>

            <Section title="試合">
              <SubSection title="試合形式">
                <div>{getType(tournament.type)}</div>

                <form>
                  <Autocomplete
                    color="secondary"
                    options={addUserInput.q}
                    getOptionLabel={(option) => option.name}
                    onInputChange={(_, newValue) => {
                      setAddUserInput({ ...addUserInput, value: newValue });
                    }}
                    renderInput={(params) => {
                      console.log(params);
                      return <TextField
                        {...params}
                        label="追加ユーザ"
                        onChange={addHandleChange}
                        placeholder="id"
                      />;
                    }}
                  />
                  <Button
                    onClick={submit}
                    disabled={!Boolean(addUserInput.value)}
                  >
                    ユーザ追加
                  </Button>
                </form>

                {users && <div>
                  <table className={classes.table}>
                    <tr>
                      <th className={classes.oblique}></th>
                      {users.map((user) => {
                        return <th>{user ? user.name : "no player"}</th>;
                      })}
                    </tr>
                    {users.map((user, y) => {
                      return <tr>
                        <th>{user ? user.name : "no player"}</th>
                        {users.map((_, x) => {
                          return <td className={x === y ? classes.oblique : ""}>
                            {x !== y && (() => {
                              const result = getResult(y, x);
                              if (result) {
                                return <div>
                                  <div>{result.resultText}</div>
                                  <div>{result.pointText}</div>
                                  <Link to={result.url}>ゲーム詳細へ</Link>
                                </div>;
                              } else {
                                return <Button onClick={() => gameCreate(y, x)}>
                                  ゲーム作成
                                </Button>;
                              }
                            })()}
                          </td>;
                        })}
                      </tr>;
                    })}
                  </table>
                </div>}
              </SubSection>
            </Section>
          </>
          : <CircularProgress color="secondary" />}
      </div>
    </Content>
  );
}

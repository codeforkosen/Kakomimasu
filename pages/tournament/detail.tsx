/// <reference lib="dom"/>
import React, { useEffect, useState } from "react";
import { Link, RouteComponentProps, useHistory } from "react-router-dom";
import { createStyles, makeStyles } from "@material-ui/core/styles";
import CircularProgress from "@material-ui/core/CircularProgress";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";

import Autocomplete from "@material-ui/lab/Autocomplete";

import ApiClient from "../../apiserver/api_client.js";
const apiClient = new ApiClient("");

import Content from "../../components/content.tsx";
import GameList from "../../components/gamelist.tsx";
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

  const [tournament, setTournament] = useState<any | null>(null);
  const [games, setGames] = useState<any[] | null>(null);
  const [users, setUsers] = useState<any[] | null>(null);
  const [addUserInput, setAddUserInput] = useState<
    { value: string; helperText: string; q: any[] }
  >({ value: "", helperText: "", q: [] });
  const tournamentId = props.match.params.id;

  const getTournament = async (tournament_?: any) => {
    const tournament = tournament_ ||
      (await apiClient.tournamentsGet(tournamentId)).data;
    console.log(tournament);
    const games = [];
    for await (const gameId of tournament.gameIds) {
      const game = (await apiClient.getMatch(gameId)).data;
      games.push(game);
    }
    const users = [];
    for await (const userId of tournament.users) {
      const user = (await apiClient.usersShow(userId)).data;
      if (!user.errorCode) users.push(user);
      else users.push({ id: userId });
    }
    console.log("games", games);
    console.log("users", users);
    setTournament(tournament);
    setGames(games);
    setUsers(users);
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
    if (!req.errorCode) getTournament(req);
    /*tournament.
    const sendData = { ...data };
    sendData.playerIdentifiers = sendData.playerIdentifiers.filter((e) =>
      Boolean(e)
    );
    const req = await apiClient.gameCreate(sendData);
    setGame(req);
    console.log(req);*/
  };

  const getResult = (m: number, o: number) => {
    if (!games) return;
    if (!users) return;
    console.log(users, games);

    const game = games.find((e) =>
      e.reservedUsers[0] === users[m].id &&
        e.reservedUsers[1] === users[o].id ||
      e.reservedUsers[0] === users[o].id &&
        e.reservedUsers[1] === users[m].id
    );
    console.log(game);
    if (game) {
      let url = `/game/detail/` + game.gameId;
      let pointText = "";
      let resultText = "-";
      if (game.gaming || game.ending) {
        const p = game.players;
        const mPlayer = (p as any[]).find((e) => e.id === users[m].id);
        const oPlayer = (p as any[]).find((e) => e.id === users[o].id);

        const mPoint = mPlayer.point.basepoint + mPlayer.point.wallpoint;
        const oPoint = oPlayer.point.basepoint + oPlayer.point.wallpoint;
        pointText = `${mPoint} - ${oPoint}`;
        if (mPoint > oPoint) resultText = "○";
        else if (mPoint < oPoint) resultText = "×";
        else resultText = "△";
      }
      return { pointText, resultText, url };
    } else return null;
  };

  const gameCreate = (m: number, o: number) => {
    if (!users) return;
    console.log("gameCreate!!!");
    const params = new URLSearchParams();
    params.append(
      "name",
      `${tournament.name}:${users[m].screenName} vs ${users[o].screenName}`,
    );
    params.append("n-player", "2");
    params.append("player1", users[m].name);
    params.append("player2", users[o].name);
    params.append("tournament-id", tournament.id);
    params.append("return", "true");
    history.push("/game/create?" + params.toString());
  };

  useEffect(() => {
    getTournament();
  }, []);

  return (
    <Content title="大会詳細">
      <div>
        <Button
          style={{ width: "20em" }}
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
                    id="combo-box-demo"
                    options={addUserInput.q}
                    getOptionLabel={(option) => option.name}
                    style={{ width: 300 }}
                    onInputChange={(_, newValue) => {
                      setAddUserInput({ ...addUserInput, value: newValue });
                    }}
                    renderInput={(params) =>
                      <TextField
                        {...params}
                        label="追加ユーザ"
                        variant="standard"
                        onChange={addHandleChange}
                        color="secondary"
                        placeholder="id"
                      />}
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
                      {users.map((user: any) => {
                        return <th>{user.name}</th>;
                      })}
                    </tr>
                    {(users as any[]).map((user, y) => {
                      return <tr>
                        <th>{user.name}</th>
                        {(users as any[]).map((_, x) => {
                          return <td className={x === y ? classes.oblique : ""}>
                            {x !== y && (() => {
                              const result = getResult(y, x);
                              console.log("result", result);
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

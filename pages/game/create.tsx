/// <reference lib="dom"/>
import React, { useEffect, useState } from "react";
import { Link, useHistory, useLocation } from "react-router-dom";
import { createStyles, makeStyles } from "@material-ui/core/styles";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import MenuItem from "@material-ui/core/MenuItem";

import ApiClient from "../../apiserver/api_client.js";
const apiClient = new ApiClient("");

import Content from "../../components/content.tsx";
import GameList from "../../components/gamelist.tsx";

const useStyles = makeStyles((theme) =>
  createStyles({
    content: {
      //textAlign: "center",
    },
    form: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "0 20",
    },
    formControl: {
      margin: theme.spacing(1),
      minWidth: 120,
    },
    textField: {
      //textAlign: "left",
      marginTop: 20,
      width: "100%",
    },
    button: {
      width: "20em",
      marginTop: 20,
    },
  })
);

export default function () {
  const classes = useStyles();
  const location = useLocation();
  const history = useHistory();
  const [boards, setBoards] = useState<any[]>();

  console.log(location);
  const searchParam = new URLSearchParams(location.search);
  console.log(searchParam);

  useEffect(() => {
    getBoards();
  }, []);

  async function getBoards() {
    const boards_ = await apiClient.getBoards();
    console.log(boards_);
    setBoards(boards_);
  }

  const [data, setData] = useState({
    name: searchParam.get("name") || "",
    boardName: searchParam.get("n-player") || "",
    nPlayer: 2,
    playerIdentifiers: [
      searchParam.get("player1") || "",
      searchParam.get("player2") || "",
      "",
      "",
    ],
    tournamentId: searchParam.get("tournament-id") || "",
  });
  const [btnStatus, setBtnStatus] = useState(false);
  const [game, setGame] = useState<any | null>(null);

  const validate = (data: any) => {
    console.log(data);
    if (!data.name) return false;
    if (!data.boardName) return false;
    if (!data.nPlayer) return false;
    //else if (!data.name) return false;
    //else if (!data.password) return false;
    //else if (!checkPassword()) return false;
    return true;
  };

  const handleChange = (
    event: React.ChangeEvent<{ name?: string; value: unknown }>,
  ) => {
    const value = event.target.value;
    const name = event.target.name;
    if (!name) return;
    console.log(value, name, name.startsWith("player"));
    if (name === "nPlayer") {
      setData({
        ...data,
        nPlayer: value as number,
        //playerIdentifiers: new Array(value as number),
      });
    } else if (name.startsWith("player")) {
      const i = parseInt(name.slice(6));
      console.log(name, i);
      const data_ = { ...data };
      data_.playerIdentifiers[i] = value as string;
      setData(data_);
    } else setData({ ...data, [name]: value });
    setBtnStatus(validate({ ...data, [name]: value }));
  };

  const submit = async () => {
    const sendData = { ...data };
    sendData.playerIdentifiers = sendData.playerIdentifiers.filter((e) =>
      Boolean(e)
    );
    const req = await apiClient.gameCreate(sendData);
    console.log(req);
    if (searchParam.get("return")) {
      history.push("/tournament/detail/" + searchParam.get("tournament-id"));
    } else {
      setGame(req);
    }
  };

  return (<>
    <Content title="ゲーム作成">
      <div className={classes.content}>
        <form autoComplete="off" className={classes.form}>
          <TextField
            required
            name="name"
            label="ゲーム名"
            variant="standard"
            color="secondary"
            placeholder="〇〇大会 予選Aグループ 〇〇vs△△"
            className={classes.textField}
            autoComplete="off"
            value={data.name}
            onChange={handleChange}
            error={!Boolean(data.name)}
            helperText={Boolean(data.name) ? "" : "入力必須項目です"}
          />
          <TextField
            required
            select
            name="boardName"
            label="使用ボード"
            variant="standard"
            color="secondary"
            className={classes.textField}
            autoComplete="off"
            value={data.boardName}
            onChange={handleChange}
            error={!Boolean(data.boardName)}
            helperText={Boolean(data.boardName) ? "" : "入力必須項目です"}
          >
            {boards?.map((board) => {
              return <MenuItem value={board.name}>{board.name}</MenuItem>;
            })}
          </TextField>
          <TextField
            required
            select
            name="nPlayer"
            label="プレイヤー数"
            variant="standard"
            color="secondary"
            className={classes.textField}
            autoComplete="off"
            value={data.nPlayer}
            onChange={handleChange}
          >
            <MenuItem value={2}>2</MenuItem>;
            <MenuItem value={3}>3</MenuItem>;
          </TextField>
          {data.playerIdentifiers.map((playerIdentifier, i) => {
            console.log(playerIdentifier);
            if (i >= data.nPlayer) return;
            return (<TextField
              name={"player" + i}
              label={"プレイヤー" + (i + 1) + " ユーザネーム or ユーザID"}
              variant="standard"
              color="secondary"
              className={classes.textField}
              autoComplete="off"
              value={playerIdentifier}
              onChange={handleChange}
            />);
          })}
          <TextField
            name="boardName"
            label="所属大会ID"
            variant="standard"
            color="secondary"
            className={classes.textField}
            autoComplete="off"
            value={data.tournamentId}
            onChange={handleChange}
          />
          <Button
            className={classes.button}
            onClick={submit}
            disabled={!btnStatus}
          >
            ゲーム作成！
          </Button>
        </form>
        {game && <GameList games={[game]} />}
      </div>
    </Content>
  </>);
}

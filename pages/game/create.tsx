/// <reference lib="dom"/>
import React, { useEffect, useState } from "react";
import { Link, useHistory, useLocation } from "react-router-dom";
import { Theme, useTheme } from "@material-ui/core/styles";
import { makeStyles } from "@material-ui/styles";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import MenuItem from "@material-ui/core/MenuItem";
import Autocomplete from "@material-ui/core/Autocomplete";

// @deno-types=../../client_js/api_client.d.ts
import ApiClient from "../../client_js/api_client.js";
const apiClient = new ApiClient("");

import { Board, Game, User } from "../../apiserver/types.ts";

import Content from "../../components/content.tsx";
import GameList from "../../components/gamelist.tsx";
import GameBoard from "../../components/gameBoard.tsx";

const useStyles = makeStyles({
  content: {
    //textAlign: "center",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "0 20",
  },
  formControl: (theme: Theme) => ({
    margin: theme.spacing(1),
    minWidth: 120,
  }),
  textField: {
    //textAlign: "left",
    marginTop: 20,
    width: "100%",
  },
  button: {
    width: "20em",
    marginTop: 20,
  },
});

export default function () {
  const theme = useTheme();
  const classes = useStyles(theme);
  const location = useLocation();
  const history = useHistory();
  const [boards, setBoards] = useState<Board[]>();

  const searchParam = new URLSearchParams(location.search);
  const fixedUsers = searchParam.getAll("player");

  async function getBoards() {
    const res = await apiClient.getBoards();
    if (res.success) setBoards(res.data);
  }

  const [data, setData] = useState({
    name: searchParam.get("name") || "",
    boardName: "",
    nPlayer: parseInt(searchParam.get("n-player") || "2"),
    playerIdentifiers: fixedUsers,
    tournamentId: searchParam.get("tournament-id") || "",
  });
  const [btnStatus, setBtnStatus] = useState(false);
  const [game, setGame] = useState<Game>();

  const validate = () => {
    console.log(data);
    if (data.playerIdentifiers.length > data.nPlayer) {
      const helperText = "プレイヤー数を超えています";
      setAddUserInput({ ...addUserInput, helperText });
      return false;
    } else {
      setAddUserInput({ ...addUserInput, helperText: "" });
    }
    if (!data.name) return false;
    if (!data.boardName) return false;
    if (!data.nPlayer) return false;

    return true;
  };

  const submit = async () => {
    const sendData = { ...data };
    sendData.playerIdentifiers = sendData.playerIdentifiers.filter((e) =>
      Boolean(e)
    );
    const res = await apiClient.gameCreate(sendData);
    console.log(res);
    if (!res.success) return;
    if (searchParam.get("return")) {
      history.push("/tournament/detail/" + searchParam.get("tournament-id"));
    } else {
      setGame(res.data);
    }
  };
  useEffect(() => {
    getBoards();
  }, []);

  useEffect(() => {
    setBtnStatus(validate());
  }, [data]);

  const [addUserInput, setAddUserInput] = useState<
    { value: string; helperText: string; q: string[] }
  >({
    value: "",
    helperText: "",
    q: fixedUsers,
  });
  const addHandleChange = async (
    event: React.ChangeEvent<{ value: string }>,
  ) => {
    const value = event.target.value;
    const req = await apiClient.usersSearch(value);
    let q: typeof addUserInput.q = [];
    if (req.success) q = req.data.map((user) => user.name);
    setAddUserInput({ value, helperText: "", q });
  };

  return (<>
    <Content title="ゲーム作成">
      <div className={classes.content}>
        <form autoComplete="off" className={classes.form}>
          <TextField
            required
            name="name"
            label="ゲーム名"
            placeholder="〇〇大会 予選Aグループ 〇〇vs△△"
            className={classes.textField}
            value={data.name}
            onChange={({ target: { value } }) => {
              setData({ ...data, name: value });
            }}
            error={!data.name}
            helperText={data.name ? "" : "入力必須項目です"}
          />
          <TextField
            required
            select
            name="boardName"
            label="使用ボード"
            className={classes.textField}
            value={data.boardName}
            onChange={({ target: { value } }) => {
              setData({ ...data, boardName: value });
            }}
            error={!data.boardName}
            helperText={data.boardName ? "" : "入力必須項目です"}
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
            className={classes.textField}
            value={data.nPlayer}
            onChange={({ target: { value } }) => {
              setData({ ...data, nPlayer: parseInt(value) });
            }}
          >
            <MenuItem value={2}>2</MenuItem>;
          </TextField>
          <Autocomplete
            multiple
            id="tags-standard"
            options={addUserInput.q}
            getOptionLabel={(option) => option}
            value={data.playerIdentifiers}
            onChange={(_, newValue) => {
              console.log("onInputChange", newValue);
              setAddUserInput({ ...addUserInput, q: [] });
              setData({
                ...data,
                playerIdentifiers: newValue,
              });
            }}
            disabled={Boolean(fixedUsers.length > 0)}
            className={classes.textField}
            renderInput={(params) => (
              <TextField
                {...params}
                label="参加ユーザ"
                placeholder="name"
                onChange={addHandleChange}
                helperText={addUserInput.helperText}
                error={Boolean(addUserInput.helperText)}
              />
            )}
          />
          {data.tournamentId && <TextField
            name="boardName"
            label="所属大会ID"
            disabled
            className={classes.textField}
            value={data.tournamentId}
            onChange={({ target: { value } }) => {
              setData({ ...data, tournamentId: value });
            }}
          />}
          <Button
            className={classes.button}
            onClick={submit}
            disabled={!btnStatus}
          >
            ゲーム作成！
          </Button>
        </form>
        {game && <GameList games={[game]} />}
        {data.boardName && (() => {
          const board = boards?.find((b) => b.name === data.boardName);
          if (!board) return;
          const tiled = new Array(board.height * board.width);
          for (let i = 0; i < tiled.length; i++) tiled[i] = [0, -1];
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
            players: [{
              id: "",
              agents: [],
              point: { basepoint: 0, wallpoint: 0 },
            }, {
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
          return <div>
            <div>ボードプレビュー</div>
            <GameBoard game={game} />
          </div>;
        })()}
      </div>
    </Content>
  </>);
}

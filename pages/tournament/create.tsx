/// <reference lib="dom"/>
import React, { useEffect, useState } from "react";
import { Link, useHistory } from "react-router-dom";
import { Theme, useTheme } from "@material-ui/core/styles";
import { makeStyles } from "@material-ui/core/styles";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import MenuItem from "@material-ui/core/MenuItem";
import Autocomplete from "@material-ui/core/Autocomplete";

// @deno-types=../../client_js/api_client.d.ts
import ApiClient from "../../client_js/api_client.js";
const apiClient = new ApiClient("");

import {
  Tournament,
  TournamentCreateReq,
  TournamentType,
  User,
} from "../../apiserver/types.ts";

import Content from "../../components/content.tsx";
import TournamentCard from "../../components/tournament_card.tsx";

const useStyles = makeStyles({
  form: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "0 20",
  },
  textField: {
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

  const [data, setData] = useState<TournamentCreateReq>({
    name: "",
    organizer: "",
    type: "round-robin",
    remarks: "",
    participants: [] as string[],
  });

  const [tournament, setTournament] = useState<Tournament>();

  const [addUserInput, setAddUserInput] = useState<
    { value: string; helperText: string; q: User[] }
  >({ value: "", helperText: "", q: [] });

  const validate = () => {
    if (!data) return false;
    if (!data.name) return false;
    if (!data.type) return false;
    return true;
  };

  const submit = async () => {
    const req = await apiClient.tournamentsCreate(data);
    if (req.success) {
      setTournament(req.data);
    }
    console.log(req);
  };

  const addHandleChange = async (
    event: React.ChangeEvent<{ value: string }>,
  ) => {
    const value = event.target.value;
    const req = await apiClient.usersSearch(value);
    let q: typeof addUserInput.q = [];
    if (req.success) q = req.data;
    //console.log(req);
    //if (req.errorCode) req = [];
    setAddUserInput({ value, helperText: "", q });
  };

  return (<>
    <Content title="大会作成">
      <div style={{ display: "flex", flexDirection: "column" }}>
        <Button
          component={Link}
          to={"/tournament/index"}
          style={{ margin: "auto" }}
        >
          大会一覧に戻る
        </Button>
        <form autoComplete="off" className={classes.form}>
          <TextField
            required
            label="大会名"
            placeholder="〇〇大会"
            className={classes.textField}
            value={data.name}
            onChange={({ target: { value } }) => {
              setData({ ...data, name: value });
            }}
            error={!data.name}
            helperText={data.name ? "" : "入力必須項目です"}
          />
          <TextField
            label="主催"
            placeholder="Code for KOSEN"
            className={classes.textField}
            value={data.organizer}
            onChange={({ target: { value } }) => {
              setData({ ...data, organizer: value });
            }}
          />
          <TextField
            required
            select
            label="試合形式"
            className={classes.textField}
            value={data.type}
            onChange={({ target: { value } }) => {
              setData({ ...data, type: value as TournamentType });
            }}
            error={!data.type}
            helperText={data.type ? "" : "入力必須項目です"}
          >
            <MenuItem value="round-robin">グループトーナメント</MenuItem>
            {/*<MenuItem value="knockout">勝ち残り式トーナメント</MenuItem>;*/}
          </TextField>
          <Autocomplete
            multiple
            id="tags-standard"
            options={addUserInput.q}
            getOptionLabel={(option) => option.name}
            onChange={(_, newValue) => {
              console.log("onInputChange", newValue);
              setAddUserInput({ ...addUserInput, q: [] });
              setData({ ...data, participants: newValue.map((e) => e.id) });
            }}
            className={classes.textField}
            renderInput={(params) => (
              <TextField
                {...params}
                label="参加ユーザ"
                placeholder="name"
                onChange={addHandleChange}
              />
            )}
          />
          <TextField
            label="備考"
            className={classes.textField}
            value={data.remarks}
            onChange={({ target: { value } }) => {
              setData({ ...data, remarks: value });
            }}
          />
          <Button
            className={classes.button}
            onClick={submit}
            disabled={!validate()}
          >
            ゲーム作成！
          </Button>
        </form>
        {tournament && <TournamentCard tournament={tournament} />}
      </div>
    </Content>
  </>);
}

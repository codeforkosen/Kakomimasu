/// <reference lib="dom"/>
import React, { useEffect, useState } from "react";
import { Link, useHistory } from "react-router-dom";
import { createStyles, makeStyles } from "@material-ui/core/styles";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import MenuItem from "@material-ui/core/MenuItem";
import Autocomplete from "@material-ui/lab/Autocomplete";

import ApiClient from "../../apiserver/api_client.js";
const apiClient = new ApiClient("");

import Content from "../../components/content.tsx";
import TournamentCard from "../../components/tournament_card.tsx";

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
  const history = useHistory();
  const [addUserInput, setAddUserInput] = useState<
    { value: string; helperText: string; q: any[] }
  >({ value: "", helperText: "", q: [] });
  const [tournament, setTournament] = useState<any>();

  useEffect(() => {
  }, []);

  const [data, setData] = useState({
    name: "",
    organizer: "",
    type: "round-robin",
    remarks: "",
    participants: [] as string[],
  });
  const [btnStatus, setBtnStatus] = useState(false);

  const validate = (data: any) => {
    console.log(data);
    if (!data.name) return false;
    if (!data.type) return false;
    return true;
  };

  const handleChange = (
    event: React.ChangeEvent<{ name?: string; value: unknown }>,
  ) => {
    const value = event.target.value;
    const name = event.target.name;
    if (!name) return;
    setData({ ...data, [name]: value });
    setBtnStatus(validate({ ...data, [name]: value }));
  };

  const submit = async () => {
    const sendData = { ...data };
    console.log(sendData);

    const req = await apiClient.tournamentsCreate(data);
    if (!req.errorCode) {
      setTournament(req);
    }
    console.log(req);
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

  return (<>
    <Content title="大会作成">
      <div className={classes.content}>
        <Button
          color="secondary"
          variant="contained"
          style={{ width: "20em" }}
          onClick={() => {
            history.push("/tournament/index");
          }}
        >
          大会一覧に戻る
        </Button>
        <form autoComplete="off" className={classes.form}>
          <TextField
            required
            name="name"
            label="大会名"
            variant="standard"
            color="secondary"
            placeholder="〇〇大会"
            className={classes.textField}
            autoComplete="off"
            value={data.name}
            onChange={handleChange}
            error={!Boolean(data.name)}
            helperText={Boolean(data.name) ? "" : "入力必須項目です"}
          />
          <TextField
            required
            name="organizer"
            label="主催"
            variant="standard"
            color="secondary"
            placeholder="Code for KOSEN"
            className={classes.textField}
            autoComplete="off"
            value={data.organizer}
            onChange={handleChange}
          />
          <TextField
            required
            select
            name="type"
            label="試合形式"
            variant="standard"
            color="secondary"
            className={classes.textField}
            autoComplete="off"
            value={data.type}
            onChange={handleChange}
            error={!Boolean(data.type)}
            helperText={Boolean(data.type) ? "" : "入力必須項目です"}
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
                variant="standard"
                color="secondary"
                label="参加ユーザ"
                placeholder="ユーザネーム"
                onChange={addHandleChange}
              />
            )}
          />
          <TextField
            name="remarks"
            label="備考"
            variant="standard"
            color="secondary"
            className={classes.textField}
            autoComplete="off"
            value={data.remarks}
            onChange={handleChange}
          />
          <Button
            variant="contained"
            color="secondary"
            className={classes.button}
            onClick={submit}
            disabled={!btnStatus}
          >
            ゲーム作成！
          </Button>
        </form>
        {tournament && <TournamentCard tournament={tournament} />}
      </div>
    </Content>
  </>);
}

/// <reference lib="dom"/>
import React, { useEffect, useState } from "react";
import { Redirect, RouteComponentProps } from "react-router-dom";
import { createStyles, makeStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import CircularProgress from "@material-ui/core/CircularProgress";
import TextField from "@material-ui/core/TextField";

import firebase from "../../components/firebase.ts";
import StyledFirebaseAuth from "react-firebaseui/StyledFirebaseAuth";
import Section from "../../components/section.tsx";
import Content from "../../components/content.tsx";

import ApiClient from "../../apiserver/api_client.js";
const apiClient = new ApiClient("");

type Props = {
  children?: React.ReactNode;
  firebase: typeof firebase;
} & RouteComponentProps;

const useStyles = makeStyles((theme) =>
  createStyles({
    content: {
      textAlign: "center",
    },
    signup: {
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
  })
);

function Signup(props: { user: firebase.User }) {
  const classes = useStyles();

  const [data, setData] = useState({
    screenName: props.user.displayName || "",
    name: "",
    password: "",
    passwordVerify: "",
  });

  const [btnStatus, setBtnStatus] = useState(false);

  const checkPassword = () => data.password === data.passwordVerify;
  const validate = () => {
    if (!data.screenName) return false;
    else if (!data.name) return false;
    else if (!data.password) return false;
    else if (!checkPassword()) return false;
    return true;
  };
  const submit = async () => {
    const { passwordVerify, ...sendData } = data;
    const res = await apiClient.usersRegist(
      data,
      await props.user.getIdToken(),
    );
    console.log(res);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    const name = event.target.name;
    setData({ ...data, [name]: value });
    setBtnStatus(validate());
  };

  return (
    <Section title="新規登録">
      <form className={classes.signup} autoComplete="off">
        <TextField
          required
          name="screenName"
          label="表示名"
          variant="standard"
          color="secondary"
          placeholder="囲みマス太郎"
          className={classes.textField}
          autoComplete="off"
          value={data.screenName}
          onChange={handleChange}
          error={!Boolean(data.screenName)}
          helperText={Boolean(data.screenName) ? "" : "入力必須項目です"}
        />
        <TextField
          required
          name="name"
          label="ユーザーネーム"
          variant="standard"
          color="secondary"
          placeholder="kkmm_taro"
          className={classes.textField}
          autoComplete="off"
          value={data.name}
          onChange={handleChange}
          error={!Boolean(data.name)}
          helperText={Boolean(data.name) ? "" : "入力必須項目です"}
        />
        <TextField
          required
          name="password"
          label="パスワード"
          variant="standard"
          color="secondary"
          type="password"
          className={classes.textField}
          autoComplete="off"
          value={data.password}
          onChange={handleChange}
          error={!Boolean(data.password)}
          helperText={Boolean(data.password) ? "" : "入力必須項目です"}
        />
        <TextField
          required
          name="passwordVerify"
          label="パスワード(確認用)"
          variant="standard"
          color="secondary"
          type="password"
          className={classes.textField}
          autoComplete="off"
          value={data.passwordVerify}
          error={!checkPassword()}
          helperText={checkPassword() ? "" : "パスワードと確認用パスワードが一致しません"}
          onChange={handleChange}
        />

        <Button
          variant="contained"
          color="secondary"
          className={classes.button}
          onClick={submit}
          disabled={btnStatus}
        >
          上記の内容で登録する
        </Button>
      </form>
    </Section>
  );
}

export default function (props: Props) {
  const classes = useStyles();

  const [user, setUser] = useState<firebase.User | undefined | null>(undefined);

  useEffect(() => {
    props.firebase.auth().onAuthStateChanged(async (user) => {
      console.log("onAuthStatusChenged", user);
      if (user !== null) {
        const idToken = await user.getIdToken(true);
        //console.log(idToken);
        //console.log(res);
        if (await apiClient.usersVerify(idToken) === true) { // ユーザが登録されていたらトップに戻る
          props.history.push("/index");
          return;
        }
      }
      setUser(user);
    });
  });

  return (
    <Content title="ログイン">
      <div className={classes.content}>
        {user !== undefined
          ? <>
            {user ? <Signup user={user} /> : <StyledFirebaseAuth
              uiConfig={{
                //signInFlow: "popup",
                signInSuccessUrl: "/user/login",
                signInOptions: [
                  props.firebase.auth.GoogleAuthProvider.PROVIDER_ID,
                  //props.firebase.auth.FacebookAuthProvider.PROVIDER_ID,
                  props.firebase.auth.TwitterAuthProvider.PROVIDER_ID,
                  //props.firebase.auth.GithubAuthProvider.PROVIDER_ID,
                  props.firebase.auth.EmailAuthProvider.PROVIDER_ID,
                  props.firebase.auth.PhoneAuthProvider.PROVIDER_ID,
                  //firebase.auth.AnonymousAuthProvider.PROVIDER_ID
                ],
              }}
              firebaseAuth={props.firebase.auth()}
            />}
          </>
          : <CircularProgress color="secondary" />}
      </div>
    </Content>
  );
}

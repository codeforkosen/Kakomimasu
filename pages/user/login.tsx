/// <reference lib="dom"/>
import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { makeStyles } from "@material-ui/styles";
import Button from "@material-ui/core/Button";
import CircularProgress from "@material-ui/core/CircularProgress";
import TextField from "@material-ui/core/TextField";

import firebase from "../../components/firebase.ts";
import StyledFirebaseAuth from "react-firebaseui/StyledFirebaseAuth";
import Section from "../../components/section.tsx";
import Content from "../../components/content.tsx";

// @deno-types="../../client_js/api_client.d.ts"
import ApiClient from "../../client_js/api_client.js";
const apiClient = new ApiClient("");

const useStyles = makeStyles({
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
});

function Signup(props: { user: firebase.User }) {
  const classes = useStyles();
  const history = useHistory();

  const [data, setData] = useState({
    screenName: props.user.displayName || "",
    name: "",
    password: "",
    passwordVerify: "",
  });
  const [nameHelperText, setNameHelperText] = useState("");

  const checkName = async () => {
    console.log("checkName", data);
    if (!data.name) {
      setNameHelperText("入力必須項目です");
      return false;
    }
    const res = await apiClient.usersSearch(data.name);
    console.log(res);
    if (res.success) {
      if (res.data.some((user) => user.name === data.name)) {
        setNameHelperText("既にこのユーザネームは使用されています");
        return false;
      }
    }
    setNameHelperText("");
    return true;
  };

  const checkPassword = () => data.password === data.passwordVerify;

  const validate = () => {
    if (!data.screenName) return false;
    else if (nameHelperText) return false;
    else if (!data.password) return false;
    else if (!checkPassword()) return false;
    return true;
  };

  const submit = async () => {
    const { passwordVerify, ...sendData } = data;
    const res = await apiClient.usersRegist(
      sendData,
      await props.user.getIdToken(),
    );
    if (res.success) {
      history.push("/index");
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    const name = event.target.name;
    setData({ ...data, [name]: value });
  };

  useEffect(() => {
    checkName();
  });

  return (
    <Section title="新規登録">
      <form className={classes.signup} autoComplete="off">
        <TextField
          required
          name="screenName"
          label="表示名"
          placeholder="囲みマス太郎"
          className={classes.textField}
          value={data.screenName}
          onChange={handleChange}
          error={!Boolean(data.screenName)}
          helperText={Boolean(data.screenName) ? "" : "入力必須項目です"}
        />
        <TextField
          required
          name="name"
          label="ユーザネーム"
          placeholder="kkmm_taro"
          className={classes.textField}
          value={data.name}
          onChange={handleChange}
          error={Boolean(nameHelperText)}
          helperText={nameHelperText}
        />
        <TextField
          required
          name="password"
          label="パスワード"
          type="password"
          className={classes.textField}
          value={data.password}
          onChange={handleChange}
          error={!Boolean(data.password)}
          helperText={Boolean(data.password) ? "" : "入力必須項目です"}
        />
        <TextField
          required
          name="passwordVerify"
          label="パスワード(確認用)"
          type="password"
          className={classes.textField}
          value={data.passwordVerify}
          error={!checkPassword()}
          helperText={checkPassword() ? "" : "パスワードと確認用パスワードが一致しません"}
          onChange={handleChange}
        />

        <Button
          className={classes.button}
          onClick={submit}
          disabled={!validate()}
        >
          上記の内容で登録する
        </Button>
      </form>
    </Section>
  );
}

export default function () {
  const classes = useStyles();
  const history = useHistory();

  const [user, setUser] = useState<firebase.User | undefined | null>(
    undefined,
  );

  useEffect(() => {
    firebase.auth().onAuthStateChanged(async (user) => {
      if (user !== null) {
        const idToken = await user.getIdToken(true);
        if ((await apiClient.usersVerify(idToken)).success === true) { // ユーザが登録されていたらトップに戻る
          history.push("/index");
          return;
        }
      }
      setUser(user);
    });
  }, []);

  return (
    <Content title="ログイン">
      {<div className={classes.content}>
        {user !== undefined
          ? <>
            {(user) ? <Signup user={user} /> : <StyledFirebaseAuth
              uiConfig={{
                signInSuccessUrl: "/user/login",
                signInOptions: [
                  firebase.auth.GoogleAuthProvider.PROVIDER_ID,
                  //props.firebaseP.auth.FacebookAuthProvider.PROVIDER_ID,
                  firebase.auth.TwitterAuthProvider.PROVIDER_ID,
                  firebase.auth.GithubAuthProvider.PROVIDER_ID,
                  firebase.auth.EmailAuthProvider.PROVIDER_ID,
                  firebase.auth.PhoneAuthProvider.PROVIDER_ID,
                  //firebaseP.auth.AnonymousAuthProvider.PROVIDER_ID
                ],
              }}
              firebaseAuth={firebase.auth()}
            />}
          </>
          : <CircularProgress color="secondary" />}
      </div>}
    </Content>
  );
}

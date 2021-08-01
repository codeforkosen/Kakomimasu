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

  const [data, setData] = useState({
    screenName: props.user.displayName || "",
    name: "",
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

  const validate = () => {
    if (!data.screenName) return false;
    else if (nameHelperText) return false;
    return true;
  };

  const submit = async () => {
    const res = await apiClient.usersRegist(
      data,
      await props.user.getIdToken(),
    );
    if (res.success) {
      location.href = "/";
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
          error={!data.screenName}
          helperText={data.screenName ? "" : "入力必須項目です"}
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
  const searchParam = new URLSearchParams(location.search);

  // user : undefined=>認証待ち null=>未ログイン User=>ログイン済み
  const [user, setUser] = useState<firebase.User | undefined | null>(
    undefined,
  );

  useEffect(() => {
    console.log("useEffect");
    firebase.auth().onAuthStateChanged(async (user) => {
      console.log("onAuthStateChanged", user);
      setUser(user);
      if (user !== null) {
        const idToken = await user.getIdToken(true);
        const res = await apiClient.usersVerify(idToken);
        if (res.success === true) { // ユーザが登録されていたらトップに戻る
          history.push("/index");
          return;
        } else {
          if (!searchParam.has("signInSuccess")) {
            console.log("SignOut!");
            await firebase.auth().signOut();
          }
        }
      }
    });
  }, []);

  return (
    <Content title="ログイン">
      {<div className={classes.content}>
        {user !== undefined
          ? <>
            {(user === null)
              ? <StyledFirebaseAuth
                uiConfig={{
                  signInSuccessUrl: "/user/login?signInSuccess=true",
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
              />
              : <Signup user={user} />}
          </>
          : <CircularProgress color="secondary" />}
      </div>}
    </Content>
  );
}

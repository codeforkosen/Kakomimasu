/// <reference lib="dom"/>
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { createStyles, makeStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Avatar from "@material-ui/core/Avatar";
import Button from "@material-ui/core/Button";
import Toolbar from "@material-ui/core/Toolbar";

const useStyles = makeStyles((theme) =>
  createStyles({
    toolbar: theme.mixins.toolbar,
    logo: {
      flexGrow: 1,
    },
  })
);

import firebase from "../components/firebase.ts";

import ApiClient from "../apiserver/api_client.js";
const apiClient = new ApiClient("");

type Props = {
  children?: React.ReactNode;
  firebase: typeof firebase;
};

const Header: React.FC<Props> = (props) => {
  const location = useLocation();
  const classes = useStyles();
  const [user, setUser] = useState<firebase.User | undefined | null>(undefined);

  const logOut = async () => {
    try {
      await props.firebase.auth().signOut();
    } catch (error) {
      console.log(`ログアウト時にエラーが発生しました (${error})`);
    } finally {
      //location.reload();
    }
  };
  props.firebase.auth().onAuthStateChanged(async (user) => {
    if (user) {
      if (await apiClient.usersVerify(await user.getIdToken()) === false) {
        console.log(location);
        if (location.pathname !== "/user/login") {
          logOut();
          return;
        }
      }
    }
    setUser(user);
  });

  return (
    <AppBar>
      <Toolbar>
        <div className={classes.logo}>
          <Link to="/index">
            <img
              height={36}
              src="/img/kakomimasu-logo.png"
              alt="囲みマスロゴ"
            />
          </Link>
        </div>
        {user !== undefined &&
          <>
            {user
              ? <>
                <Button color="inherit" onClick={logOut}>
                  ログアウト
                </Button>
                <Avatar src={user.photoURL ? user.photoURL : ""} />
              </>
              : <Button color="inherit" component={Link} to="/user/login">
                ログイン・新規登録
              </Button>}
          </>}
      </Toolbar>
    </AppBar>
  );
};

export default Header;

import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { AppBar } from "@material-ui/core";
import { Avatar } from "@material-ui/core";
import { Button } from "@material-ui/core";
import { Toolbar } from "@material-ui/core";
import { Menu } from "@material-ui/core";
import { MenuItem } from "@material-ui/core";

import firebase from "../components/firebase.ts";

// @deno-types="../client_js/api_client.d.ts"
import ApiClient from "../client_js/api_client.js";
const apiClient = new ApiClient("");

type Props = { firebase: typeof firebase };

export default function (props: Props) {
  const location = useLocation();
  const [user, setUser] = useState<firebase.User | undefined | null>(undefined);
  const [verified, setVerified] = useState<boolean>(false);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const logOut = async () => {
    try {
      await props.firebase.auth().signOut();
    } catch (error) {
      console.log(`ログアウト時にエラーが発生しました (${error})`);
    }
  };

  useEffect(() => {
    props.firebase.auth().onAuthStateChanged(async (user) => {
      if (user) {
        const idToken = await user.getIdToken();
        const res = await apiClient.usersVerify(idToken);
        setVerified(res.success);
        if (res.success === false) {
          if (location.pathname !== "/user/login") {
            logOut();
            return;
          }
        }
      }
      setUser(user);
    });
  }, []);

  return (
    <AppBar position="sticky">
      <Toolbar style={{ color: "black" }}>
        <div style={{ flexGrow: 1 }}>
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
            {user && verified
              ? <>
                <Button variant="text" color="inherit" onClick={logOut}>
                  ログアウト
                </Button>
                <div
                  aria-controls="user-icon"
                  onClick={handleClick}
                  style={{ cursor: "pointer" }}
                >
                  <Avatar src={user.photoURL ? user.photoURL : ""} />
                </div>
                <Menu
                  id="user-icon"
                  anchorEl={anchorEl}
                  keepMounted
                  open={Boolean(anchorEl)}
                  onClose={handleClose}
                >
                  <MenuItem onClick={handleClose}>
                    <Link to="/user/detail" style={{ textDecoration: "none" }}>
                      マイページ
                    </Link>
                  </MenuItem>
                </Menu>
              </>
              : <Button
                variant="text"
                color="inherit"
                component={Link}
                to="/user/login"
              >
                ログイン・新規登録
              </Button>}
          </>}
      </Toolbar>
    </AppBar>
  );
}

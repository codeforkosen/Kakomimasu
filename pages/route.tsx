import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter, Redirect, Route, Switch } from "react-router-dom";
import {
  createMuiTheme,
  createStyles,
  makeStyles,
  MuiThemeProvider,
} from "@material-ui/core/styles";
import CssBaseline from "@material-ui/core/CssBaseline";

import firebase, { init } from "../components/firebase.ts";
init();

import Header from "./header.tsx";
import Footer from "./footer.tsx";
import NotFound from "../components/404.tsx";

import Index from "./index.tsx";
import Game from "./game/route.tsx";
import User from "./user/route.tsx";
import Tournament from "./tournament/route.tsx";
import Dev from "./dev/route.tsx";

const theme = createMuiTheme({
  palette: { // Material Design Color(https://material.io/resources/color/#!/?view.left=1&view.right=1&primary.color=FBD5A8&secondary.color=58AFDA)
    primary: {
      main: "#fbd5a8",
      light: "#ffffda",
      dark: "#c7a479",
      contrastText: "#000000",
    },
    secondary: {
      main: "#58afda",
      light: "#8ee1ff",
      dark: "#1280a8",
      contrastText: "#000000",
    },
  },
  props: {
    MuiTextField: {
      variant: "filled",
      color: "secondary",
    },
  },
});
const useStyles = makeStyles((theme) =>
  createStyles({
    toolbar: theme.mixins.toolbar,
    main: {
      flexGrow: 1,
      width: "90%",
      maxWidth: 1000,
      padding: "50px 0",
      display: "flex",
      flexDirection: "column",
    },
    formControl: {
      margin: theme.spacing(1),
      minWidth: 120,
    },
  })
);

function Main() {
  const classes = useStyles();

  return (
    <CssBaseline>
      <MuiThemeProvider theme={theme}>
        <BrowserRouter>
          <Header firebase={firebase} />
          <div className={classes.toolbar}></div>
          <main className={classes.main}>
            <Switch>
              <Redirect exact from="/" to="/index" />
              <Route path="/index" component={Index} />
              <Route
                path="/game"
                render={(routeProps) => <Game {...routeProps} />}
              />
              <Route
                path="/user"
                render={(routeProps) =>
                  <User firebase={firebase} {...routeProps} />}
              />
              <Route
                path="/tournament"
                render={(routeProps) => <Tournament {...routeProps} />}
              />
              <Route
                path="/dev"
                render={(routeProps) => <Dev {...routeProps} />}
              />
              <Route path="/404" component={NotFound} />
              <Redirect push={false} from="" to="/404" />
            </Switch>
          </main>
          <Footer />
        </BrowserRouter>
      </MuiThemeProvider>
    </CssBaseline>
  );
}

ReactDOM.hydrate(<Main />, document.getElementById("main"));

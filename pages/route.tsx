import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter, Redirect, Route, Switch } from "react-router-dom";
import { createTheme, ThemeProvider } from "@material-ui/core/styles";
import { CssBaseline } from "@material-ui/core";

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

const theme = createTheme({
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
  components: {
    MuiTextField: {
      defaultProps: {
        variant: "filled",
        color: "secondary",
      },
    },
    MuiButton: {
      defaultProps: {
        variant: "contained",
        color: "secondary",
      },
    },
    MuiAutocomplete: {
      defaultProps: {
        color: "secondary",
      },
    },
    MuiToggleButtonGroup: {
      defaultProps: {
        color: "secondary",
      },
    },
  },
});

function MainContents(props: { style: React.CSSProperties }) {
  console.log("main contents", firebase);
  return (<main style={props.style}>
    <Switch>
      <Redirect exact from="/" to="/index" />
      <Route path="/index" component={Index} />

      <Route
        path="/game"
        render={(routeProps) => <Game />}
      />

      <Route path="/user" component={User} />
      <Route path="/tournament" component={Tournament} />
      <Route
        path="/dev"
        render={(routeProps) => <Dev {...routeProps} />}
      />
      <Redirect push={false} from="" to="/404" />
      <Route component={NotFound} />
    </Switch>
  </main>);
}

function Layout() {
  return (<BrowserRouter>
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Header firebase={firebase} />
      <MainContents
        style={{
          flexGrow: 1,
          width: "90%",
          maxWidth: "1000px",
          padding: "3em 0",
          margin: "0 auto",
        }}
      />
      <Footer />
    </div>
  </BrowserRouter>);
}

function Main() {
  return (
    <CssBaseline>
      <ThemeProvider theme={theme}>
        <Layout />
      </ThemeProvider>
    </CssBaseline>
  );
}
ReactDOM.hydrate(<Main />, document.getElementById("main"));

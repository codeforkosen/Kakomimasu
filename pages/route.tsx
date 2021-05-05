/// <reference no-default-lib="true"/>
/// <reference lib="dom"/>
/// <reference lib="es2015"/>
import { React, ReactDOM } from "../components/react.ts";
import {
  Redirect,
  Route,
  Router,
  Switch,
} from "../components/react-router-dom.ts";
import {
  createMuiTheme,
  createStyles,
  CssBaseline,
  makeStyles,
  MuiThemeProvider,
} from "../components/material-ui.ts";

import Header from "./header.tsx";
import Footer from "./footer.tsx";
import NotFound from "../components/404.tsx";

import Index from "./index.tsx";
import Game from "./game/route.tsx";

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
});
const useStyles = makeStyles((theme) =>
  createStyles({
    toolbar: theme.mixins.toolbar,
    main: {
      flexGrow: 1,
      //overflow: "auto";
      width: "90%",
      maxWidth: 1000,
      padding: "50px 0",
      display: "flex",
      flexDirection: "column",
      //align-items: center;
    },
  })
);

function Main() {
  const classes = useStyles();
  return (
    <CssBaseline>
      <MuiThemeProvider theme={theme}>
        {/*<link rel="stylesheet" href="/css/layout.css" />*/}
        <Router>
          <Header />
          <div className={classes.toolbar}></div>
          <main className={classes.main}>
            <Switch>
              <Route exact path="/">
                <Redirect to="/index" />
              </Route>
              <Route path="/index" component={Index} />
              <Route path="/game" component={Game} />
              <Route component={NotFound} />
            </Switch>
          </main>
          <Footer />
        </Router>
      </MuiThemeProvider>
    </CssBaseline>
  );
}

ReactDOM.hydrate(<Main />, document.getElementById("main"));

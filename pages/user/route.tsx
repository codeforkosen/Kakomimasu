import React from "react";
import {
  Redirect,
  Route,
  RouteComponentProps,
  Router,
  Switch,
  useRouteMatch,
} from "react-router-dom";
import firebase from "../../components/firebase.ts";

import Login from "./login.tsx";
import Detail from "./detail.tsx";

type Props = {
  firebase: typeof firebase;
} & RouteComponentProps;

export default function (props: Props) {
  const match = useRouteMatch();
  return (
    <Router history={props.history}>
      <Switch>
        <Route
          exact
          path={`${match.path}/login`}
          component={Login}
          {...props}
        />
        <Route
          path={`${match.path}/detail/:id`}
          component={Detail}
          {...props}
        />
        <Redirect push={false} from="" to="/404" />
      </Switch>
    </Router>
  );
}

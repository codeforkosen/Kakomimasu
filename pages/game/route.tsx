import React from "react";
import {
  Redirect,
  Route,
  RouteComponentProps,
  Router,
  Switch,
  useRouteMatch,
} from "react-router-dom";

import Index from "./index.tsx";

export default function (props: RouteComponentProps) {
  const match = useRouteMatch();
  return (
    <Router history={props.history}>
      <Switch>
        <Route exact path="/">
          <Redirect to={`${match.path}/index`} />
        </Route>
        <Route
          exact
          path={`${match.path}/index`}
          component={Index}
        />
        <Redirect push={false} from="" to="/404" />
      </Switch>
    </Router>
  );
}

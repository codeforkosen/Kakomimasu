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
  children?: React.ReactNode;
  firebase: typeof firebase;
} & RouteComponentProps;

const UserRoute: React.FC<Props> = (props) => {
  const match = useRouteMatch();
  return (
    <Router history={props.history}>
      <Switch>
        {
          /*<Route exact path="/">
          <Redirect to={`${match.path}/index`} />
  </Route>*/
        }
        <Route
          exact
          path={`${match.path}/login`}
        >
          <Login {...props} />
        </Route>
        <Route
          path={`${match.path}/detail/:id`}
          component={Detail}
          {...props}
        />
        <Redirect push={false} from="" to="/404" />
      </Switch>
    </Router>
  );
};

export default UserRoute;

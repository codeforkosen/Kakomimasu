import React from "react";
import {
  Redirect,
  Route,
  RouteComponentProps,
  Router,
  Switch,
  useRouteMatch,
} from "react-router-dom";

import FieldMaker from "./field-editor.tsx";

type Props = {
  children?: React.ReactNode;
} & RouteComponentProps;

const UserRoute: React.FC<Props> = (props) => {
  const match = useRouteMatch();
  return (
    <Router history={props.history}>
      <Switch>
        <Route
          exact
          path={`${match.path}/field-editor`}
          component={FieldMaker}
        />
        <Redirect push={false} from="" to="/404" />
      </Switch>
    </Router>
  );
};

export default UserRoute;

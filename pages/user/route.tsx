import React from "react";
import { Route, Switch, useRouteMatch } from "react-router-dom";

import NotFound from "../../components/404.tsx";

import Login from "./login.tsx";
import Detail from "./detail.tsx";

export default function () {
  const match = useRouteMatch();
  return (
    <Switch>
      <Route exact path={`${match.path}/login`} component={Login} />
      <Route path={`${match.path}/detail/:id`} component={Detail} />
      <Route component={NotFound} />
    </Switch>
  );
}

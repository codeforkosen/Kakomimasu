import React from "react";
import { Redirect, Route, Switch, useRouteMatch } from "react-router-dom";

import NotFound from "../../components/404.tsx";

import Index from "./index.tsx";
import Create from "./create.tsx";
import Detail from "./detail.tsx";

export default function () {
  const match = useRouteMatch();
  return (
    <Switch>
      <Redirect exact from="/" to={`${match.path}/index`} />
      <Route
        exact
        path={`${match.path}/index`}
        component={Index}
      />
      <Route
        exact
        path={`${match.path}/create`}
        component={Create}
      />
      <Route
        exact
        path={`${match.path}/detail/:id`}
        component={Detail}
      />
      <Route component={NotFound} />
    </Switch>
  );
}

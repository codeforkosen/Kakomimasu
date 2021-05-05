import { React } from "../../components/react.ts";
import {
  Redirect,
  Route,
  Router,
  Switch,
  useRouteMatch,
} from "../../components/react-router-dom.ts";

import NotFound from "../../components/404.tsx";
import Index from "./index.tsx";

export default function () {
  const match = useRouteMatch();
  return (
    <Router>
      <Switch>
        <Route exact path="/">
          <Redirect to={`${match.path}/index`} />
        </Route>
        <Route
          exact
          path={`${match.path}/index`}
          component={Index}
        />
        <Route component={NotFound} />
      </Switch>
    </Router>
  );
}

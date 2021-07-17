import { ServeHandler } from "./deps.ts";

import { accounts } from "./user.ts";
import { getPayload } from "./parts/jwt.ts";

export const auth = (
  { basic, bearer, jwt, required = true }: {
    basic?: boolean;
    bearer?: boolean;
    jwt?: boolean;
    required?: boolean;
  },
): ServeHandler =>
  async (req) => { // AuthorizationヘッダからユーザIDを取得
    const auth = req.headers.get("Authorization");
    if (auth) {
      if (basic && auth.startsWith("Basic ")) {
        const [identifier, pass] = auth.substr("Basic ".length).split(":");
        const account = accounts.getUsers().find((user) =>
          user.password === pass &&
          (user.id === identifier || user.name === identifier)
        );
        if (account) {
          req.set<string>("authed_userId", account.id);
          req.set<string>("auth_method", "basic");
          return;
        }
      } else if (bearer && auth.startsWith("Bearer ")) {
        const bearerToken = auth.substr("Bearer ".length);
        const account = accounts.getUsers().find((u) =>
          u.bearerToken === bearerToken
        );
        if (account) {
          req.set<string>("authed_userId", account.id);
          req.set<string>("auth_method", "bearer");
          return;
        }
      } else if (jwt) {
        const payload = await getPayload(auth);
        if (payload) {
          const id = payload.user_id;
          const account = accounts.getUsers().find((user) => user.id === id);
          if (account) {
            req.set<string>("authed_userId", account.id);
            req.set<string>("auth_method", "jwt");
            return;
          }
        }
      }
    }
    if (required) {
      const headers = new Headers();
      if (basic) {
        headers.append("WWW-Authenticate", "Basic");
      }
      if (bearer) {
        headers.append("WWW-Authenticate", "Bearer");
      }
      if (jwt) {
        headers.append("WWW-Authenticate", "JWT");
      }
      req.respond({ status: 401, headers });
    }
  };

/*
  if (a[0] === "Basic") {
          const [username, password] = a[1].split(":");
          if (
            user.password === password &&
            (user.id === username || user.name === username)
          ) {
            isAuthenticated = true;
          }
        } else {
          const payload = await getPayload(auth);
          if (payload) {
            if (user.id === payload.user_id) {
              isAuthenticated = true;
            }
          }
        }

  const idToken = req.headers.get("Authorization");
      let id: string | undefined = undefined;
      if (idToken) {
        const payload = await getPayload(idToken);
        if (payload) {
          id = payload.user_id;
          if (accounts.getUsers().some((e) => e.id === id)) {
            throw new ServerError(errors.ALREADY_REGISTERED_USER);
          }
        } else throw new ServerError(errors.INVALID_USER_AUTHORIZATION);
      } else {
        if (!reqData.password) {
          throw new ServerError(errors.NOTHING_PASSWORD);
        }
      }*/

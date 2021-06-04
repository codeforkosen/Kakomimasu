import {
  contentTypeFilter,
  createRouter,
} from "https://deno.land/x/servest@v1.3.0/mod.ts";

import util from "../util.js";
import { jsonResponse } from "./apiserver_util.ts";
import { UserFileOp } from "./parts/file_opration.ts";
import { ApiOption } from "./parts/interface.ts";
import { errors, ServerError } from "./error.ts";
import { ExpGame } from "./parts/expKakomimasu.ts";
import { getPayload } from "./parts/jwt.ts";
import { UserRegistReq } from "./types.ts";

export interface IUser {
  screenName: string;
  name: string;
  id?: string;
  password?: string;
  gamesId?: string[];
}

export interface IReqDeleteUser extends ApiOption {
  id?: string;
  name?: string;
  password: string;
}

class User implements IUser {
  public screenName: string;
  public name: string;
  public readonly id: string;
  public password: string;
  public gamesId: string[];

  constructor(data: IUser) {
    this.screenName = data.screenName;
    this.name = data.name;
    this.id = data.id || util.uuid();
    this.password = data.password || "";
    this.gamesId = data.gamesId || [];
  }

  dataCheck(games: ExpGame[]) {
    this.gamesId = this.gamesId.filter((gameId) => {
      if (games.some((game) => game.uuid === gameId)) return true;
      else return false;
    });
  }
  // シリアライズする際にパスワードを返さないように
  // パスワードを返したい場合にはnoSafe()を用いる
  toJSON() {
    return Object.assign({}, this, { password: undefined });
  }

  // passwordも含めたオブジェクトにする
  noSafe() {
    return Object.assign({}, this);
  }
}

class Users {
  private users: Array<User> = [];

  constructor() {
    this.read();
  }

  read = () => {
    const usersData = UserFileOp.read();
    this.users = usersData.map((e) => new User(e));
  };
  save = () => UserFileOp.save(this.users.map((e) => e.noSafe()));

  dataCheck(games: ExpGame[]) {
    this.users.forEach((user) => user.dataCheck(games));
    this.save();
  }

  getUsers = () => this.users;

  registUser(
    data: UserRegistReq & { id?: string },
    isSecure: boolean = false,
  ): User {
    if (!data.screenName) throw new ServerError(errors.INVALID_SCREEN_NAME);
    if (!data.name) throw new ServerError(errors.INVALID_USER_NAME);
    if (!data.password) {
      throw new ServerError(errors.NOTHING_PASSWORD);
    }
    if (isSecure && this.users.some((e) => e.id === data.id)) {
      throw new ServerError(errors.ALREADY_REGISTERED_USER);
    }
    if (this.users.some((e) => e.name === data.name)) {
      throw new ServerError(errors.ALREADY_REGISTERED_NAME);
    }
    const user = new User(data);

    if (data.option?.dryRun !== true) {
      this.users.push(user);
      this.save();
    }
    return user;
  }

  deleteUser(data: IReqDeleteUser) {
    if (!data.password) throw new ServerError(errors.NOTHING_PASSWORD);

    const index = this.users.findIndex((e) => {
      return e.password === data.password &&
        (e.id === data.id || e.name === data.name);
    });
    if (index === -1) throw new ServerError(errors.NOT_USER);

    const user = new User(this.users[index]);
    if (data.option?.dryRun !== true) {
      this.users.splice(index, 1);
      this.save();
    }
    return user;
  }

  /*updateUser(
    { screenName = "", name = "", id = "", password = "" },
  ): string {
    //console.log(screenName, name, id, password);
    var u: User | undefined;
    if (password !== "") {
      if (id !== "") {
        u = this.users.find((
          e,
        ) => (e.id === id && e.password === password));
        if (u !== undefined) {
          if (screenName !== "") u.screenName = screenName;
          if (
            name !== "" && u.name !== name &&
            this.users.some((e) => e.name === name) === false
          ) {
            u.name = name;
          }
        } else {
          // idが無効
          throw new UserUpdateError("Invalid id");
        }
      } else if (name !== "") {
        u = this.users.find(
          (e) => (e.name === name && e.password === password),
        );

        if (u !== undefined) {
          if (screenName !== "") u.screenName = screenName;
        } else {
          if (screenName !== "") {
            u = new User(screenName, name, password);
            this.users.push(u);
          } else {
            // name無効
            throw new UserUpdateError("Invalid name.");
          }
        }
      } else {
        // id,nameが無効
        throw new UserUpdateError("Invalid id,mane.");
      }
    } else {
      // パスワード無効
      throw new UserUpdateError("Invalid password.");
    }

    this.write();
    return u.id;
  }*/

  showUser(identifier: string) {
    const user = this.users.find((
      e,
    ) => (e.id === identifier || e.name === identifier));
    if (user === undefined) throw new ServerError(errors.NOT_USER);
    return user;
  }

  getUser(identifier: string, password: string) {
    if (!password) throw new ServerError(errors.NOTHING_PASSWORD);
    //if (password === "") throw Error("Invalid password.");
    const user = this.users.find((
      e,
    ) => ((e.id === identifier || e.name === identifier) &&
      e.password === password)
    );
    if (!user) throw new ServerError(errors.NOT_USER);
    return user;
  }

  findById(id: string) {
    return this.users.find((e) => e.id === id);
  }

  find(identifier: string) {
    return this.users.find((e) =>
      (e.id === identifier) || (e.name === identifier)
    );
  }

  addGame(identifier: string, gameId: string) {
    const user = this.find(identifier);
    if (user) {
      user.gamesId.push(gameId);
    }
    this.save();
  }
}

export { User, Users };

export const accounts = new Users();

export const userRouter = () => {
  const router = createRouter();

  router.get("/verify", async (req) => {
    const jwt = req.headers.get("Authorization");
    if (!jwt) return;
    const payload = await getPayload(jwt);
    if (!payload) return;
    console.log(payload);
    const isUser = accounts.getUsers().some((user) =>
      user.id === payload.user_id
    );
    if (!isUser) throw new ServerError(errors.NOT_USER);
    await req.respond({ status: 200 });
  });

  // ユーザ登録
  router.post(
    "/regist",
    contentTypeFilter("application/json"),
    async (req) => {
      const reqData = ((await req.json()) as UserRegistReq);
      //console.log(reqData);
      const jwt = req.headers.get("Authorization");
      //console.log(jwt);
      let id: string | undefined = undefined;
      if (jwt) {
        const payload = await getPayload(jwt);
        //console.log(payload);
        if (payload) {
          id = payload.user_id;
          //console.log("payload userId", payload.user_id);
        }
      }
      const user = accounts.registUser({ ...reqData, id }, jwt !== null);
      await req.respond(jsonResponse(user));
    },
  );

  // ユーザ情報取得
  router.get(new RegExp("^/show/(.*)$"), async (req) => {
    const identifier = req.match[1];
    if (identifier !== "") {
      const user = accounts.showUser(identifier);
      await req.respond(jsonResponse(user));
    } else {
      await req.respond(jsonResponse(accounts.getUsers()));
    }
  });

  // ユーザ削除
  router.post(
    "/delete",
    contentTypeFilter("application/json"),
    async (req) => {
      const reqData = ((await req.json()) as User);
      const user = accounts.deleteUser(reqData);
      await req.respond(jsonResponse(user));
    },
  );

  // ユーザ検索
  router.get("/search", async (req) => {
    const query = req.query;
    const q = query.get("q");
    if (!q) {
      throw new ServerError(errors.NOTHING_SEARCH_QUERY);
    }

    const matchName = accounts.getUsers().filter((e) => e.name.startsWith(q));
    const matchId = accounts.getUsers().filter((e) => e.id.startsWith(q));
    const users = [...new Set([...matchName, ...matchId])];

    await req.respond(jsonResponse(users));
  });

  return router;
};

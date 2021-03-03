import {
  contentTypeFilter,
  createRouter,
} from "https://servestjs.org/@v1.1.9/mod.ts";

import util from "../util.js";
import { errorResponse, jsonResponse } from "./apiserver_util.ts";
import { UserFileOp } from "./parts/file_opration.ts";

export interface IUser {
  screenName: string;
  name: string;
  id?: string;
  password: string;
  gamesId?: string[];
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
    this.password = data.password;
    this.gamesId = data.gamesId || [];
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

  getUsers = () => this.users;

  registUser(screenName: string, name: string, password: string): User {
    if (password === "") throw Error("Not password");
    if (this.users.some((e) => e.name === name)) {
      throw Error("Already registered name");
    }
    const user = new User({ screenName, name, password });
    this.users.push(user);
    this.save();
    return user;
  }

  deleteUser({ name = "", id = "", password = "" }) {
    if (password === "") throw Error("Not password");
    const index = this.users.findIndex((e) =>
      e.password === password && (e.id === id || e.name === name)
    );
    if (index === -1) throw Error("Can not find users.");
    this.users.splice(index, 1);

    this.save();
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
    if (user === undefined) throw Error("Can not find users.");
    return user;
  }

  getUser(identifier: string, password: string) {
    if (password === "") throw Error("Invalid password.");
    const user = this.users.find((
      e,
    ) => ((e.id === identifier || e.name === identifier) &&
      e.password === password)
    );
    if (user === undefined) throw Error("Can not find users.");
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

  // ユーザ登録
  router.post(
    "/regist",
    contentTypeFilter("application/json"),
    async (req) => {
      try {
        const reqData = ((await req.json()) as User);
        console.log(reqData);
        const user = accounts.registUser(
          reqData.screenName,
          reqData.name,
          reqData.password,
        );
        await req.respond(jsonResponse(user));
      } catch (e) {
        console.log(e);
        await req.respond(errorResponse(e.message));
      }
    },
  );

  // ユーザ情報取得
  router.get(new RegExp("^/show/(.*)$"), async (req) => {
    try {
      const identifier = req.match[1];
      if (identifier !== "") {
        const user = accounts.showUser(identifier);
        if (user !== undefined) {
          await req.respond(jsonResponse(user));
        }
      } else {
        await req.respond(jsonResponse(
          accounts.getUsers(),
        ));
      }
    } catch (e) {
      console.log(e);
      await req.respond(errorResponse(e.message));
    }
  });

  // ユーザ削除
  router.post(
    "/delete",
    contentTypeFilter("application/json"),
    async (req) => {
      try {
        const reqData = ((await req.json()) as User);

        const user = accounts.deleteUser(
          { name: reqData.name, id: reqData.id, password: reqData.password },
        );
        await req.respond({ status: 200 });
      } catch (e) {
        console.log(e);
        await req.respond(errorResponse(e.message));
      }
    },
  );

  // ユーザ検索
  router.get("/search", async (req) => {
    try {
      const query = req.query;
      const q = query.get("q");
      if (!q) throw Error("Nothing search query");

      const matchName = accounts.getUsers().filter((e) => e.name.startsWith(q));
      const matchId = accounts.getUsers().filter((e) => e.id.startsWith(q));
      const users = [...new Set([...matchName, ...matchId])];

      await req.respond(jsonResponse(users));
    } catch (e) {
      console.log(e);
      await req.respond(errorResponse(e.message));
    }
  });

  return router;
};

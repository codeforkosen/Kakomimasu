import {
  contentTypeFilter,
  createRouter,
} from "https://servestjs.org/@v1.1.9/mod.ts";

import util from "../util.js";
import { errorResponse, jsonResponse } from "./apiserver_util.ts";
import { UserFileOp } from "./parts/file_opration.ts";
import { ApiOption } from "./parts/interface.ts";
import { errorCodeResponse, ErrorType, ServerError } from "./error.ts";

export interface IUser {
  screenName: string;
  name: string;
  id?: string;
  password: string;
  gamesId?: string[];
}

export interface IReqUser extends ApiOption {
  screenName: string;
  name: string;
  password: string;
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

  registUser(data: IReqUser): User {
    if (!data.screenName) throw new ServerError(ErrorType.INVALID_SCREEN_NAME);
    if (!data.name) throw new ServerError(ErrorType.INVALID_NAME);
    if (!data.password) throw new ServerError(ErrorType.NOT_PASSWORD);

    if (this.users.some((e) => e.name === data.name)) {
      throw new ServerError(ErrorType.ALREADY_REGISTERED_NAME);
    }
    const user = new User(data);

    if (data.option?.dryRun !== true) {
      this.users.push(user);
      this.save();
    }
    return user;
  }

  deleteUser(data: IReqDeleteUser) {
    if (!data.password) throw new ServerError(ErrorType.NOT_PASSWORD);

    const index = this.users.findIndex((e) => {
      return e.password === data.password &&
        (e.id === data.id || e.name === data.name);
    });
    if (index === -1) throw new ServerError(ErrorType.NOT_USER);

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
        const reqData = ((await req.json()) as IReqUser);
        //console.log(reqData);
        const user = accounts.registUser(reqData);
        await req.respond(jsonResponse(user));
      } catch (e) {
        await req.respond(errorCodeResponse(e));
        /*} else {
          await req.respond(errorResponse(e.message));
        }*/
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
      /*console.log(e);
      if (e instanceof ServerError) {
        console.log("Server error");
        await req.respond(errorCodeResponse(e));
      } else {*/
      await req.respond(errorResponse(e.message));
      //}
    }
  });

  // ユーザ削除
  router.post(
    "/delete",
    contentTypeFilter("application/json"),
    async (req) => {
      try {
        const reqData = ((await req.json()) as User);
        const user = accounts.deleteUser(reqData);
        await req.respond(jsonResponse(user));
      } catch (e) {
        await req.respond(errorCodeResponse(e));
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
      //console.log(e);
      await req.respond(errorResponse(e.message));
    }
  });

  return router;
};

import util from "../util.js";
import { userFileOp } from "./parts/file_opration.ts";

class User {
  public screenName: string;
  public name: string;
  public readonly id: string;
  public password: string;

  constructor(screenName: string, name: string, password: string) {
    this.screenName = screenName;
    this.name = name;
    this.id = util.uuid();
    this.password = password;
  }
}

class Account {
  private users: Array<User> = [];

  constructor() {
    this.read();
  }

  read = () => this.users = userFileOp.read();
  write = () => userFileOp.write(this.users);

  getUsers = () => this.users;

  registUser(screenName: string, name: string, password: string): User {
    if (password === "") throw Error("Not password");
    if (this.users.some((e) => e.name === name)) {
      throw Error("Already registered name");
    }
    const user = new User(screenName, name, password);
    this.users.push(user);
    this.write();
    return user;
  }

  deleteUser({ name = "", id = "", password = "" }) {
    if (password === "") throw Error("Not password");
    const index = this.users.findIndex((e) =>
      e.password === password && (e.id === id || e.name === name)
    );
    if (index === -1) throw Error("Can not find user.");
    this.users.splice(index, 1);

    this.write();
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
    if (user === undefined) throw Error("Can not find user.");
    return user;
  }

  getUser(identifier: string, password: string) {
    if (password === "") throw Error("Invalid password.");
    const user = this.users.find((
      e,
    ) => ((e.id === identifier || e.name === identifier) &&
      e.password === password)
    );
    if (user === undefined) throw Error("Can not find user.");
    return user;
  }
}

export { Account, User };

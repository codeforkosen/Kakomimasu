import { v4 } from "https://deno.land/std/uuid/mod.ts";

class UserUpdateError extends Error {
}

class User {
  public screenName: string;
  public name: string;
  public readonly id: string;
  public password: string;

  constructor(screenName: string, name: string, password: string) {
    this.screenName = screenName;
    this.name = name;
    this.id = v4.generate();
    this.password = password;
  }
}

class Account {
  public users: Array<User>;

  constructor() {
    this.users = new Array();
    this.read();
  }

  read() {
    this.users = JSON.parse(
      Deno.readTextFileSync("./data/users.json") || "[]",
    ) as Array<User>;
  }

  write() {
    Deno.writeTextFileSync(
      "./data/users.json",
      JSON.stringify(this.users),
    );
  }

  updateUser(
    { screenName = "", name = "", id = "", password = "" },
  ): string {
    console.log(screenName, name, id, password);
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
  }

  showUser(identifier: string): User | undefined {
    const user = this.users.find((
      e,
    ) => (e.id === identifier || e.name === identifier));
    if (user === undefined) throw Error("Can not find user.");
    return user;
  }
}

export { User, Account, UserUpdateError };

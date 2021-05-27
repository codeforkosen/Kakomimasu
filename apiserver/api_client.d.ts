import { Error, Game, Tournament, User, UserRegistReq } from "./types.ts";

type ApiRes<T = {}> = Promise<
  { success: true; data: T } | { success: false; data: Error }
>;

export default class ApiClient {
  constructor(host?: string);

  usersVerify(idToken: string): ApiRes;
  usersRegist(data: UserRegistReq, auth: string): ApiRes<User[]>;
  usersSearch(searchText: string): ApiRes<User[]>;
  usersShow(identifier: string): ApiRes<User>;

  getMatch(gameId: string): ApiRes<Game>;

  tournamentsGet(id: string): ApiRes<Tournament>;
  tournamentsGet(): ApiRes<Tournament[]>;
}

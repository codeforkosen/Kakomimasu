import {
  Error,
  Game,
  Tournament,
  TournamentAddUserReq,
  TournamentCreateReq,
  User,
  UserRegistReq,
} from "./types.ts";

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

  tournamentsCreate(data: TournamentCreateReq): ApiRes<Tournament>;
  tournamentsGet(id: string): ApiRes<Tournament>;
  tournamentsGet(): ApiRes<Tournament[]>;
  tournamentsAddUser(
    tournamentId: string,
    data: TournamentAddUserReq,
  ): ApiRes<Tournament>;
}

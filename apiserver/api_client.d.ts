import {
  Board,
  Error,
  Game,
  GameCreateReq,
  Tournament,
  TournamentAddUserReq,
  TournamentCreateReq,
  TournamentRes,
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

  tournamentsCreate(data: TournamentCreateReq): ApiRes<TournamentRes>;
  tournamentsGet(id: string): ApiRes<TournamentRes>;
  tournamentsGet(): ApiRes<TournamentRes[]>;
  tournamentsAddUser(
    tournamentId: string,
    data: TournamentAddUserReq,
  ): ApiRes<TournamentRes>;

  gameCreate(data: GameCreateReq): ApiRes<Game>;

  getBoards(): ApiRes<Board[]>;
}

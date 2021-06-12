import {
  ActionPost,
  ActionReq,
  ActionRes,
  Board,
  Error,
  Game,
  GameCreateReq,
  MatchReq,
  MatchRes,
  Tournament,
  TournamentAddUserReq,
  TournamentCreateReq,
  TournamentDeleteReq,
  TournamentRes,
  User,
  UserDeleteReq,
  UserRegistReq,
} from "../apiserver/types.ts";

type ApiRes<T = {}> = Promise<
  { success: true; data: T } | { success: false; data: Error }
>;

export default class ApiClient {
  constructor(host?: string);

  usersVerify(idToken: string): ApiRes;
  usersRegist(data: UserRegistReq, auth: string): ApiRes<User[]>;
  usersSearch(searchText: string): ApiRes<User[]>;
  usersShow(identifier: string, idToken?: string): ApiRes<User>;
  usersDelete(data: UserDeleteReq): ApiRes<User>;

  getMatch(gameId: string): ApiRes<Game>;
  match(data: MatchReq): ApiRes<MatchRes>;

  setAction(gameId: string, data: ActionReq, auth: string): ApiRes<ActionRes>;

  tournamentsCreate(data: TournamentCreateReq): ApiRes<TournamentRes>;
  tournamentsGet(id: string): ApiRes<TournamentRes>;
  tournamentsGet(): ApiRes<TournamentRes[]>;
  tournamentsAddUser(
    tournamentId: string,
    data: TournamentAddUserReq,
  ): ApiRes<TournamentRes>;
  tournamentsDelete(data: TournamentDeleteReq): ApiRes<TournamentRes>;

  gameCreate(data: GameCreateReq): ApiRes<Game>;

  getBoards(): ApiRes<Board[]>;
}

import {
  ActionReq,
  ActionRes,
  Board,
  Error,
  Game,
  GameCreateReq,
  MatchReq,
  MatchRes,
  TournamentAddUserReq,
  TournamentCreateReq,
  TournamentDeleteReq,
  TournamentRes,
  User,
  UserDeleteReq,
  UserRegistReq,
} from "../apiserver/types.ts";

type ApiRes<T> = Promise<
  { success: true; data: T; res: Response } | {
    success: false;
    data: Error;
    res: Response;
  }
>;

export default class ApiClient {
  constructor(host?: string);

  usersVerify(idToken: string): ApiRes<never>;
  usersRegist(data: UserRegistReq, auth?: string): ApiRes<Required<User>>;
  usersRegist(data: UserRegistReq): ApiRes<Required<User>>;
  usersRegist(
    data: Omit<UserRegistReq, "password">,
    auth: string,
  ): ApiRes<Required<User>>;
  usersSearch(searchText: string): ApiRes<User[]>;
  usersShow(identifier: string, idToken?: string): ApiRes<User>;
  usersDelete(data: UserDeleteReq, auth: string): ApiRes<User>;

  getMatch(gameId: string): ApiRes<Game>;
  match(data: MatchReq, auth: string): ApiRes<MatchRes>;

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

import { ApiOption } from "./parts/interface.ts";

export interface Error {
  message: string;
  errorCode: number;
}

interface UserBase {
  screenName: string;
  name: string;
}

export interface User extends UserBase {
  id: string;
  gamesId: string[];
  bearerToken?: string;
}

export interface UserRegistReq extends ApiOption, UserBase {
  password: string;
}

export interface UserDeleteReq extends ApiOption {
  name?: string;
  id?: string;
  password: string;
}

export type TournamentRes = Required<Tournament>;

export interface TournamentAddUserReq extends ApiOption {
  user: string;
}

export interface TournamentCreateReq extends TournamentBasic, ApiOption {
  participants?: string[];
}

export interface TournamentDeleteReq extends ApiOption {
  id: string;
}

export interface GameCreateReq extends ApiOption {
  name?: string;
  boardName?: string; // 必須
  nPlayer?: number;
  playerIdentifiers?: string[];
  tournamentId?: string;
}

export interface MatchReq extends ApiOption {
  spec?: string;
  gameId?: string;
  useAi?: boolean;
  aiOption?: {
    aiName: string;
    boardName?: string;
  };
}

export interface MatchRes {
  userId: string;
  spec: string;
  gameId: string;
  index: number;
}

export interface ActionPost {
  agentId: number;
  type: string;
  x: number;
  y: number;
}

export interface ActionReq extends ApiOption {
  actions: ActionPost[];
}

export interface ActionRes {
  receptionUnixTime: number;
  turn: number;
}

export interface Game {
  gameId: string;
  gaming: boolean;
  ending: boolean;
  board: Board;
  turn: number;
  tiled: Array<[0 | 1, number]>;
  players: Player[];
  log: {
    point: { basepoint: number; wallpoint: number };
    actions: {
      agentId: number;
      type: number;
      x: number;
      y: number;
      res: number;
    }[];
  }[][];
  gameName: string;
  startedAtUnixTime: number;
  nextTurnUnixTime: number;
  reservedUsers: string[];
  type: string;
}

export interface Board {
  name: string;
  width: number;
  height: number;
  nAgent: number;
  nPlayer: number;
  nTurn: number;
  nSec: number;
  points: number[];
}

export interface Player {
  id: string;
  agents: { x: number; y: number }[];
  point: { basepoint: number; wallpoint: number };
}

export type TournamentType = "round-robin" | "knockout";

interface TournamentBasic {
  name: string;
  organizer?: string;
  type: TournamentType;
  remarks?: string;
}

export interface Tournament extends TournamentBasic {
  users?: string[];
  id?: string;
  gameIds?: string[];
}

/*export interface Tournament {
  name: string;
  organizer: string;
  type: "round-robin" | "knockout";
  remarks: string;
  id: string;
  users: string[];
  gameIds: string[];
}*/

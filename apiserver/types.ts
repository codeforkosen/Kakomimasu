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
}

export interface UserRegistReq extends ApiOption, UserBase {
  password: string;
}

export interface Game {
  gameId: string;
  gaming: boolean;
  ending: boolean;
  board: Board;
  turn: number;
  tiled: Array<[0 | 1, number]>;
  players: Player[];
  log: [];
  gameName: string;
  startedAtUnixTime: number;
  nextTurnUnixTime: number;
  reservedUsers: string[];
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

export interface Tournament {
  name: string;
  organizer: string;
  type: "round-robin" | "knockout";
  remarts: string;
  id: string;
  users: string[];
  gameIds: string[];
}

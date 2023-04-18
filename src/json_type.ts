import type { ActionRes, ActionType, FieldTile, Game } from "./Kakomimasu.ts";

export interface BoardJson {
  width: number;
  height: number;
  points: number[];
  nAgent: number;
  nPlayer: number;
  totalTurn: number;
}

export interface AgentJson {
  x: number;
  y: number;
}

export interface ActionJson {
  agentIdx: number;
  type: ActionType;
  x: number;
  y: number;
  res: ActionRes;
}

export type FieldJson = {
  tiles: FieldTile[];
};

export interface PlayerJson {
  id: string;
  spec: string;
  actions: ActionJson[];
  index: number;
  agents: AgentJson[];
}

export interface GameJson {
  nAgent: number;
  nPlayer: number;
  turn: number;
  totalTurn: number;
  field: {
    width: number;
    height: number;
    points: number[];
    tiles: FieldTile[];
  };
  players: PlayerJson[];
  log: typeof Game.prototype.log;
}

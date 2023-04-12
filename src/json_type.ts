import type { ActionRes, ActionType, FieldTile } from "./Kakomimasu.ts";

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

export type FieldJson = FieldTile[];

export interface GameJson {
  /** ボード名 */
  width: number;
  /** ボードの高さ */
  height: number;
  /** ポイントの配列 */
  points: number[];
  /** エージェント数 */
  nAgent: number;
  /** プレイヤー数 */
  nPlayer: number;
  /** 総ターン数 */
  totalTurn: number;
}

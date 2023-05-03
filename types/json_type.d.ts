import type { ActionRes, ActionType, FieldInit, FieldTile, Point } from "./Kakomimasu.js";
export interface AgentJson {
    x: number;
    y: number;
}
export interface ActionJson {
    agentId: number;
    type: ActionType;
    x: number;
    y: number;
    res: ActionRes;
}
export declare type FieldJson = Required<FieldInit> & {
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
    turn: number;
    totalTurn: number;
    field: FieldJson;
    players: PlayerJson[];
    log: {
        players: {
            point: Point;
            actions: ActionJson[];
        }[];
    }[];
}

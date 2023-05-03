import type { ActionJson, AgentJson, FieldJson, GameJson, PlayerJson } from "./json_type.js";
export declare type Point = {
    areaPoint: number;
    wallPoint: number;
};
export interface Board {
    width: number;
    height: number;
    points: number[];
    nAgent?: number;
    nPlayer?: number;
    totalTurn?: number;
}
declare class Agent {
    #private;
    field: Field;
    playerIdx: number;
    x: number;
    y: number;
    bkx: number;
    bky: number;
    constructor(field: Field, playeridx: number);
    static fromJSON(data: AgentJson, playerIdx: number, field: Field): Agent;
    toJSON(): AgentJson;
    check(act: Action): boolean;
    isValidAction(): Action | undefined;
    putOrMove(): boolean;
    remove(): boolean;
    commit(): void;
    revert(): void;
}
export declare type ActionType = 1 | 2 | 3 | 4;
export declare type ActionRes = 0 | 1 | 2 | 3 | 4 | 5;
export declare type ActionArray = [number, ActionType, number, number];
declare class Action {
    agentId: number;
    type: ActionType;
    x: number;
    y: number;
    res: ActionRes;
    static readonly PUT = 1;
    static readonly NONE = 2;
    static readonly MOVE = 3;
    static readonly REMOVE = 4;
    static readonly SUCCESS = 0;
    static readonly CONFLICT = 1;
    static readonly REVERT = 2;
    static readonly ERR_ONLY_ONE_TURN = 3;
    static readonly ERR_ILLEGAL_AGENT = 4;
    static readonly ERR_ILLEGAL_ACTION = 5;
    constructor(agentid: number, type: ActionType, x: number, y: number);
    static fromJSON(data: ActionJson): Action;
    static getMessage(res: ActionRes): string;
    static fromArray: (array: ActionArray[]) => Action[];
}
declare type FieldType = typeof Field.AREA | typeof Field.WALL;
export declare type FieldTile = {
    type: FieldType;
    player: null | number;
};
export declare type FieldInit = Omit<Board, "totalTurn">;
declare class Field {
    width: number;
    height: number;
    nAgent: number;
    nPlayer: number;
    points: number[];
    tiles: FieldTile[];
    static readonly AREA = 0;
    static readonly WALL = 1;
    constructor({ width, height, points, nAgent, nPlayer }: FieldInit);
    static fromJSON(data: FieldJson): Field;
    set(x: number, y: number, att: FieldType, playerid: number | null): void;
    get(x: number, y: number): FieldTile;
    setAgent(playerid: number, x: number, y: number): boolean;
    fillArea(): void;
    getPoints(): Point[];
}
export declare type GameInit = Board;
declare class Game {
    #private;
    totalTurn: number;
    players: Player[];
    field: Field;
    log: {
        players: {
            point: Point;
            actions: Action[];
        }[];
    }[];
    turn: number;
    constructor(gameInit: GameInit);
    static fromJSON(data: GameJson): Game;
    attachPlayer(player: Player): boolean;
    getStatus(): "ended" | "free" | "ready" | "gaming";
    isFree(): boolean;
    isReady(): boolean;
    isGaming(): boolean;
    isEnded(): boolean;
    start(): void;
    nextTurn(): boolean;
}
declare class Player<T extends Game = Game> {
    id: string;
    spec: string;
    game: T | null;
    actions: Action[];
    index: number;
    agents: Agent[];
    constructor(id: string, spec?: string);
    static fromJSON(data: PlayerJson, game?: Game): Player;
    toJSON(): PlayerJson;
    setGame(game: T): void;
    setActions(actions: Action[]): typeof Game.prototype.turn;
    getActions(): typeof Player.prototype.actions;
    clearActions(): void;
}
export { Action, Agent, Field, Game, Player };

declare class Board {
    w: number;
    h: number;
    points: number[];
    nagent: number;
    nturn: number;
    nsec: number;
    nplayer: number;
    name: string;
    constructor({ w, h, points, nagent, nturn, nsec, nplayer, name }: {
        w: number;
        h: number;
        points: number[];
        nagent: number;
        nturn?: number;
        nsec?: number;
        nplayer?: number;
        name?: string;
    });
    static restore(data: Board): Board;
    toLogJSON(): Board;
    getJSON(): {
        name: string;
        w: number;
        h: number;
        points: number[];
        nagents: number;
        nturn: number;
        nsec: number;
        nplayer: number;
    };
    toJSON(): {
        name: string;
        width: number;
        height: number;
        nAgent: number;
        nPlayer: number;
        nTurn: number;
        nSec: number;
        points: number[];
    };
}
declare class Agent {
    board: Board;
    field: Field;
    playerid: number;
    x: number;
    y: number;
    bkx: number;
    bky: number;
    lastaction: Action | null;
    constructor(board: Board, field: Field, playerid: number);
    static restore(data: Agent, board: Board, field: Field): Agent;
    toLogJSON(): Agent & {
        board: null;
        field: null;
    };
    isOnBoard(): boolean;
    checkOnBoard(x: number, y: number): boolean;
    checkDir(x: number, y: number): boolean;
    check(act: Action): boolean;
    checkPut(x: number, y: number): boolean;
    checkNone(_x: number, _y: number): boolean;
    checkMove(x: number, y: number): boolean;
    checkRemove(x: number, y: number): boolean;
    isValidAction(): boolean;
    putOrMove(): boolean;
    put(x: number, y: number): boolean;
    none(x: number, y: number): boolean;
    move(x: number, y: number): boolean;
    remove(): boolean;
    commit(): void;
    revert(): void;
    getJSON(): {
        x: number;
        y: number;
    };
}
export declare type ActionType = 1 | 2 | 3 | 4;
declare type ActionRes = 0 | 1 | 2 | 3 | 4 | 5;
export declare type ActionJSON = [number, ActionType, number, number];
declare class Action {
    agentid: number;
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
    getJSON(): {
        agentId: number;
        type: ActionType;
        x: number;
        y: number;
        res: ActionRes;
    };
    static getMessage(res: ActionRes): string;
    static fromJSON: (array: ActionJSON[]) => Action[];
}
declare type FieldType = typeof Field.BASE | typeof Field.WALL;
declare type FieldCell = {
    type: FieldType;
    player: null | number;
};
declare class Field {
    board: Board;
    field: FieldCell[];
    static readonly BASE = 0;
    static readonly WALL = 1;
    constructor(board: Board);
    toLogJSON(): Field & {
        board: null;
    };
    set(x: number, y: number, att: FieldType, playerid: number | null): void;
    get(x: number, y: number): FieldCell;
    setAgent(playerid: number, x: number, y: number): boolean;
    fillBase(): void;
    getPoints(): {
        basepoint: number;
        wallpoint: number;
    }[];
    getJSON(): FieldCell[];
}
declare class Game {
    board: Board;
    players: Player[];
    nturn: number;
    nsec: number;
    gaming: boolean;
    ending: boolean;
    field: Field;
    log: {
        players: {
            point: {
                basepoint: number;
                wallpoint: number;
            };
            actions: ReturnType<typeof Action.prototype.getJSON>[];
        }[];
    }[];
    turn: number;
    constructor(board: Board);
    static restore(data: Game): Game;
    toLogJSON(): Game;
    attachPlayer(player: Player): boolean;
    isReady(): boolean;
    isFree(): boolean;
    isGaming(): boolean;
    start(): void;
    nextTurn(): boolean;
    checkActions(actions: Action[][]): void;
    checkConflict(actions: Action[][]): void;
    checkAgentConflict(): void;
    putOrMove(): void;
    revertOverlap(): void;
    removeOrNot(): void;
    revertNotOwnerWall(): void;
    commit(): void;
    getStatusJSON(): {
        players: ReturnType<typeof Player.prototype.getJSON>[];
        board: ReturnType<typeof Board.prototype.getJSON>;
        field: ReturnType<typeof Field.prototype.getJSON>;
        agents: ReturnType<typeof Agent.prototype.getJSON>[][];
        points: ReturnType<typeof Field.prototype.getPoints>;
        log: typeof Game.prototype.log;
    };
    toJSON(): {
        gaming: typeof Game.prototype.gaming;
        ending: typeof Game.prototype.ending;
        board: ReturnType<Board["toJSON"]> | null;
        turn: typeof Game.prototype.turn;
        totalTurn: typeof Game.prototype.nturn;
        tiled: typeof Game.prototype.field.field | null;
        players: {
            id: string;
            agents: {
                x: number;
                y: number;
            }[];
            point: ReturnType<typeof Field.prototype.getPoints>[0];
        }[];
        log: typeof Game.prototype.log;
    };
}
declare class Player<T extends Game = Game> {
    id: string;
    spec: string;
    game: T | null;
    actions: Action[];
    index: number;
    agents: Agent[];
    constructor(id: string, spec?: string);
    static restore(data: Player, game?: Game): Player;
    toLogJSON(): Player;
    setGame(game: T): void;
    noticeStart(): void;
    setActions(actions: Action[]): typeof Game.prototype.turn;
    getActions(): typeof Player.prototype.actions;
    clearActions(): void;
    getJSON(): {
        userId: typeof Player.prototype.id;
        spec: typeof Player.prototype.spec;
        index: typeof Player.prototype.index;
    };
}
declare class Kakomimasu<T extends Game = Game> {
    games: T[];
    boards: Board[];
    constructor();
    appendBoard(board: Board): void;
    getBoards(): typeof Kakomimasu.prototype.boards;
    /**
     * @deprecated use addGame
     */
    createGame(...param: ConstructorParameters<typeof Game>): Game;
    addGame(game: T): T;
    getGames(): T[];
    getFreeGames(): T[];
    /**
     * @deprecated use Player class
     */
    createPlayer(playername: string, spec?: string): Player;
}
export { Action, Agent, Board, Field, Game, Kakomimasu, Player };

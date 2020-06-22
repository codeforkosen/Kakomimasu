// 未使用

import { addPlayer } from "./room.ts";

export class PlayerPost {
  constructor(public playerName: string, public spec: string) {
    this.playerName = playerName;
    this.spec = spec;
  }
}

export class Player extends PlayerPost {
  public playerToken: string;
  public roomId: string;

  constructor(playerName: string, spec: string) {
    super(playerName, spec);

    const [roomid_, token_] = addPlayer();
    this.playerToken = token_;
    this.roomId = roomid_;
  }
}

export const players = [] as Player[];

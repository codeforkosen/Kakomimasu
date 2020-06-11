import { v4 } from "https://deno.land/std/uuid/mod.ts";

export class Room {
  public id: string;
  public player1: string;
  public player2: string;

  addPlayer = () => {
    if (!this.player1) {
      this.player1 = v4.generate();
      return this.player1;
    } else if (!this.player2) {
      this.player2 = v4.generate();
      return this.player2;
    } else {
      return null;
    }
  };

  constructor() {
    this.id = v4.generate();
    this.player1 = this.player2 = "";
    this.addPlayer();
  }
}

export const rooms = [] as Room[];

export const addPlayer = () => {
  if (rooms.length != 0) {
    const newToken = rooms.slice(-1)[0].addPlayer();
    if (newToken != null) {
      return [rooms.slice(-1)[0].id, newToken];
    }
  }
  rooms.push(new Room());
  return [rooms.slice(-1)[0].id, rooms.slice(-1)[0].player1];
};

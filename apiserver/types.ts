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

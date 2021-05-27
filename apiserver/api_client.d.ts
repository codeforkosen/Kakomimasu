import { Error, User, UserRegistReq } from "./types.ts";

type ApiRes<T = {}> = Promise<
  { success: true; data: T } | { success: false; data: Error }
>;

export default class ApiClient {
  constructor(host: string);

  usersVerify(idToken: string): ApiRes;
  usersRegist(data: UserRegistReq, auth: string): ApiRes<User[]>;
  usersSearch(searchText: string): ApiRes<User[]>;
}

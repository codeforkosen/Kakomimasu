export default class ApiClient {
  constructor(host: string);

  usersVerify(idToken: string): Promise<boolean>;
}

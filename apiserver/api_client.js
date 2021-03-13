export default class ApiClient {
  constructor(host = "http://localhost:8880") {
    this.baseUrl = host + "/api";
  }

  async _fetchJson(path, data) {
    const reqJson = await (await fetch(
      this.baseUrl + path,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      },
    )).json();
    return reqJson;
  }

  async usersRegist(data) {
    return await this._fetchJson("/users/regist", data);
  }
}

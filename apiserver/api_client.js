export default class ApiClient {
  constructor(host = "http://localhost:8880") {
    this.baseUrl = host + "/api";
  }

  async _fetchJson(path, data) {
    const res = await fetch(
      this.baseUrl + path,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      },
    )
    return res;
  }

  async _fetchJsonToJson(path, data) {
    const resJson = await (await this._fetchJson(path, data)).json();
    return resJson;
  }

  async usersRegist(data) {
    return await this._fetchJsonToJson("/users/regist", data);
  }

  async usersDelete(data) {
    const res = await this._fetchJsonToJson("/users/delete", data);
    //await res.body?.cancel();
    return res;
  }
}

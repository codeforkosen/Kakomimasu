export default class ApiClient {
  constructor(host = "http://localhost:8880") {
    this.baseUrl = host + "/api";
  }

  async _fetchToJson(path) {
    const resJson = await (await fetch(this.baseUrl + path)).json();
    return resJson;
  }

  async _fetchPostJson(path, data) {
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

  async _fetchPostJsonToJson(path, data) {
    const resJson = await (await this._fetchPostJson(path, data)).json();
    return resJson;
  }

  async usersRegist(data) {
    return await this._fetchPostJsonToJson("/users/regist", data);
  }

  async usersDelete(data) {
    const resJson = await this._fetchPostJsonToJson("/users/delete", data);
    return resJson;
  }

  async usersShow(identifier) {
    const resJson = await this._fetchToJson(`/users/show/${identifier}`);
    return resJson;
  }
}

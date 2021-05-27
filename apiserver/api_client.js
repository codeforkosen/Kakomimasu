export default class ApiClient {
  constructor(host = "http://localhost:8880") {
    this.baseUrl = host + "/api";
  }

  async _fetchToJson(path) {
    const resJson = await (await fetch(this.baseUrl + path)).json();
    return resJson;
  }

  async _fetchPostJson(path, data, auth) {
    const headers = new Headers();
    headers.append("Content-Type", "application/json");
    if (auth) headers.append("Authorization", auth);
    const res = await fetch(
      this.baseUrl + path,
      {
        method: "POST",
        headers,
        body: JSON.stringify(data),
      },
    )
    return res;
  }

  async _fetch(path, init) {
    const res = await fetch(this.baseUrl + path, init);
    return res;
  }

  async _fetchPostJsonToJson(path, data, auth) {
    const resJson = await (await this._fetchPostJson(path, data, auth)).json();
    return resJson;
  }

  async _fetchPostJsonToJsonWithAuth(path, data, auth) {
    const headers = new Headers();
    headers.append("Content-Type", "application/json");
    if (auth) headers.append("Authorization", auth);
    const resJson = await (await fetch(
      this.baseUrl + path,
      {
        method: "POST",
        headers,
        body: JSON.stringify(data),
      },
    )).json();
    return resJson;
  }

  async usersVerify(idToken) {
    const res = await this._fetch("/users/verify", {
      headers: new Headers({
        Authorization: idToken
      })
    });
    if (res.status === 200) return { success: true };
    else return { success: false, data: res };
  }
  async usersRegist(data, auth) {
    const res = await this._fetchPostJson("/users/regist", data, auth);
    return { success: res.status === 200, data: await res.json() };
  }

  async usersDelete(data) {
    const resJson = await this._fetchPostJsonToJson("/users/delete", data);
    return resJson;
  }

  async usersShow(identifier) {
    const resJson = await this._fetchToJson(`/users/show/${identifier}`);
    return resJson;
  }

  async usersSearch(searchText) {
    const res = await this._fetch(`/users/search?q=${searchText}`);
    console.log(res.status);
    return { success: res.status === 200, data: await res.json() };
  }

  async tournamentsCreate(data) {
    const resJson = await this._fetchPostJsonToJson("/tournament/create", data);
    return resJson;
  }
  async tournamentsGet(id = "") {
    const resJson = await this._fetchToJson(`/tournament/get?id=${id}`);
    return resJson;
  }
  async tournamentsDelete(data) {
    const resJson = await this._fetchPostJsonToJson("/tournament/delete", data);
    return resJson;
  }
  async tournamentsAddUser(tournamentId, data) {
    const resJson = await this._fetchPostJsonToJson(`/tournament/add?id=${tournamentId}`, data);
    return resJson;
  }

  async gameCreate(data) {
    const resJson = await this._fetchPostJsonToJson("/game/create", data);
    return resJson;
  }

  async getBoards() {
    const resJson = await this._fetchToJson("/game/boards");
    return resJson;
  }

  async match(data) {
    const resJson = await this._fetchPostJsonToJson("/match", data);
    return resJson;
  }

  async getMatch(gameId) {
    const resJson = await this._fetchToJson(`/match/${gameId}`);
    return resJson;
  }

  async setAction(gameId, data, auth) {
    const resJson = await this._fetchPostJsonToJsonWithAuth(`/match/${gameId}/action`, data, auth);
    return resJson;
  }
}

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
    const res = await this._fetchPostJson("/users/delete", data);
    return { success: res.status === 200, data: await res.json() };
  }

  async usersShow(identifier) {
    const res = await this._fetch(`/users/show/${identifier}`);
    return { success: res.status === 200, data: await res.json() };
  }

  async usersSearch(searchText) {
    const res = await this._fetch(`/users/search?q=${searchText}`);
    return { success: res.status === 200, data: await res.json() };
  }

  async tournamentsCreate(data) {
    const res = await this._fetchPostJson("/tournament/create", data);
    return { success: res.status === 200, data: await res.json() };
  }
  async tournamentsGet(id = "") {
    const res = await this._fetch(`/tournament/get?id=${id}`);
    return { success: res.status === 200, data: await res.json() };
  }
  async tournamentsDelete(data) {
    const res = await this._fetchPostJson("/tournament/delete", data);
    return { success: res.status === 200, data: await res.json() };
  }
  async tournamentsAddUser(tournamentId, data) {
    const res = await this._fetchPostJson(`/tournament/add?id=${tournamentId}`, data);
    return { success: res.status === 200, data: await res.json() };
  }

  async gameCreate(data) {
    const res = await this._fetchPostJson("/game/create", data);
    return { success: res.status === 200, data: await res.json() };
  }

  async getBoards() {
    const res = await this._fetch("/game/boards");
    return { success: res.status === 200, data: await res.json() };
  }

  async match(data) {
    const res = await this._fetchPostJson("/match", data);
    return { success: res.status === 200, data: await res.json() };
  }

  async getMatch(gameId) {
    const res = await this._fetch(`/match/${gameId}`);
    return { success: res.status === 200, data: await res.json() };
  }

  async setAction(gameId, data, auth) {
    const res = await this._fetchPostJson(`/match/${gameId}/action`, data, auth);
    return { success: res.status === 200, data: await res.json() };
  }
}

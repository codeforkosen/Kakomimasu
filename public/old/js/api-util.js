export const getAllBoards = async () => {
    return await (await fetch("/api/game/boards")).json();
}

export async function getGame(gameId) {
    const resJson = await (await fetch(
        `/api/match/${gameId}`,
    )).json();
    if (resJson.error)
        console.log(resJson);
    return resJson;
}

export async function registUser(data, idToken) {
    const resJson = await (await fetch(
        `/api/users/regist`, {
        method: "POST",
        headers: new Headers({ "Content-Type": "application/json", Authorization: idToken }),
        body: JSON.stringify(data),
    }
    )).json();
    //console.log(reqJson, "userShow");
    return resJson;
}

export async function getUser(identifier) {
    const resJson = await (await fetch(
        `/api/users/show/${identifier}`,
    )).json();
    //console.log(reqJson, "userShow");
    return resJson;
}

export async function searchUser(identifier) {
    const resJson = await (await fetch(
        `/api/users/search?q=${identifier}`,
    )).json();
    //console.log(reqJson, "userShow");
    return resJson;
}

export const createGame = async (data) => {
    const req = await (await fetch(`/api/game/create`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        })).json();
    return req;
}

export const createTournament = async (data) => {
    const req = await (await fetch(`/api/tournament/create`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        })).json();
    return req;
}

export const getTournament = async (id) => {
    let url = "/api/tournament/get";
    if (id) {
        const param = new URLSearchParams();
        param.append("id", id);
        url += "?" + param.toString();
    }
    const req = await (await fetch(url)).json();
    return req;
}

export const addTournamentUser = async (tournamentId, identifier) => {
    let url = "/api/tournament/add";
    if (tournamentId) {
        const param = new URLSearchParams();
        param.append("id", tournamentId);
        url += "?" + param.toString();
    }
    const req = await (await fetch(
        url,
        {
            method: "POST",
            headers: new Headers({ "contents-type": "application/json" }),
            body: JSON.stringify({ user: identifier })
        })).json();
    return req;
}
export const getAllBoards = async () => {
    return await (await fetch("/api/game/boards")).json();
}

export const createGame = async (gameName, boardName) => {
    const req = JSON.parse(await (await fetch(`/api/game/create`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                gameName: gameName,
                boardName: boardName
            }),
        })).json());
    return req;
}
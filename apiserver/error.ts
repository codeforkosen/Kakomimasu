export const errors = {
  NOTHING_SEARCH_QUERY: {
    errorCode: 1,
    message: "nothing search query",
  },
  INVALID_CONTENT_TYPE: {
    errorCode: 2,
    message: "invalid content-type",
  },
  INVALID_SYNTAX: {
    errorCode: 3,
    message: "invalid syntax",
  },
  UNAUTHORIZED: {
    errorCode: 4,
    message: "unauthorized",
  },
  NOT_GAME: {
    errorCode: 100,
    message: "can not find game",
  },

  NOT_FREE_GAME: {
    errorCode: 101,
    message: "game is not free",
  },
  NOT_AI: {
    errorCode: 102,
    message: "can not find ai",
  },
  INVALID_ACTION: {
    errorCode: 104,
    message: "invalid action",
  },
  NOTHING_PASSWORD: {
    errorCode: 200,
    message: "nothing password",
  },
  INVALID_SCREEN_NAME: {
    errorCode: 201,
    message: "invalid screenName",
  },
  INVALID_USER_NAME: {
    errorCode: 202,
    message: "invalid name",
  },
  ALREADY_REGISTERED_NAME: {
    errorCode: 203,
    message: "already registered name",
  },
  NOT_USER: {
    errorCode: 204,
    message: "can not find user",
  },
  INVALID_USER_IDENTIFIER: {
    errorCode: 205,
    message: "invalid id or name",
  },
  ALREADY_REGISTERED_USER: {
    errorCode: 206,
    message: "already registered user",
  },
  INVALID_USER_AUTHORIZATION: {
    errorCode: 207,
    message: "invalid user authorization",
  },
  INVALID_TOURNAMENT_NAME: {
    errorCode: 300,
    message: "invalid name",
  },
  INVALID_TYPE: {
    errorCode: 301,
    message: "invalid type",
  },
  INVALID_TOURNAMENT_ID: {
    errorCode: 302,
    message: "invalid id",
  },
  NOTHING_TOURNAMENT_ID: {
    errorCode: 303,
    message: "nothing id",
  },

  INVALID_BOARD_NAME: {
    errorCode: 400,
    message: "invalid board name",
  },
  INVALID_PLAYER_IDENTIFIERS: {
    errorCode: 401,
    message: "invalid player identifiers",
  },
};

interface IError {
  errorCode: number;
  message: string;
}

export class ServerError extends Error {
  public errorCode: number;

  constructor(error: IError) {
    super();
    this.message = error.message;
    this.errorCode = error.errorCode;
  }
}

export const errorCodeResponse = (error: Error) => {
  const message = error.message;
  if (error instanceof ServerError) {
    return {
      status: 400,
      headers: new Headers({ "content-type": "application/json" }),
      body: JSON.stringify({ message, errorCode: error.errorCode }),
    };
  } else {
    console.error(error);
    return {
      status: 500,
      headers: new Headers({ "content-type": "application/json" }),
      body: JSON.stringify({ message, errorCode: 0 }),
    };
  }
};

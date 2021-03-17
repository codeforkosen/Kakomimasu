export const errors = {
  NOTHING_SEARCH_QUERY: {
    errorCode: 1,
    message: "nothing search query",
  },
  NOTHING_PASSWORD: {
    errorCode: 200,
    message: "nothing password",
  },
  INVALID_SCREEN_NAME: {
    errorCode: 201,
    message: "invalid screenName",
  },
  INVALID_NAME: {
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
  let message = "";
  let errorCode = 0;
  message = error.message;
  if (error instanceof ServerError) {
    errorCode = error.errorCode;
  } else {
    errorCode = 0;
  }

  const res = {
    status: 400,
    headers: new Headers({
      "content-type": "application/json",
    }),
    body: JSON.stringify({ message, errorCode }),
  };
  return res;
};

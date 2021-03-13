const errors = [
  {
    code: 200,
    message: "not password",
  },
  {
    code: 201,
    message: "invalid screenName",
  },
  {
    code: 202,
    message: "invalid name",
  },
  {
    code: 203,
    message: "already registered name",
  },
];

export enum ErrorType {
  NOT_PASSWORD = 200,
  INVALID_SCREEN_NAME = 201,
  INVALID_NAME = 202,
  ALREADY_REGISTERED_NAME = 203,
}

export class ServerError extends Error {
  public message: string = "";
  public code: number = 0;

  constructor(errortype: ErrorType) {
    super();
    const error = errors.find((e) => e.code === errortype);
    if (error) {
      this.message = error.message;
      this.code = error.code;
    }
  }
}

export const errorCodeResponse = (error: ServerError) => {
  return {
    status: 400,
    headers: new Headers({
      "content-type": "application/json",
    }),
    body: JSON.stringify({ message: error.message, errorCode: error.code }),
  };
};

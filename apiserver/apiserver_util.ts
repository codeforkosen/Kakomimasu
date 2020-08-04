export const ErrorResponse = (message: string) => {
  return {
    status: 400,
    headers: new Headers({
      "content-type": "application/json",
    }),
    body: JSON.stringify({ error: message }),
  };
};

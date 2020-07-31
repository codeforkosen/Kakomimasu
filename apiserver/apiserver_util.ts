export const ErrorResponse = (message: string) => {
  return {
    status: 500,
    headers: new Headers({
      "content-type": "application/json",
    }),
    body: JSON.stringify({ error: message }),
  };
};

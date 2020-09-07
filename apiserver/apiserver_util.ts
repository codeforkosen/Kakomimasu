export const ErrorResponse = (message: string) => {
  return {
    status: 400,
    headers: new Headers({
      "content-type": "application/json",
    }),
    body: JSON.stringify({ error: message }),
  };
};

export const getSafePath = (fn: string) => {
  console.log("safepath", fn, fn.indexOf(".."));
  if (fn.indexOf("..") >= 0) {
    throw new Error("unsafe path");
  }
  return fn;
};

export const jsonResponse = (json: any) => {
  return {
    status: 200,
    headers: new Headers({
      "content-type": "application/json",
    }),
    body: JSON.stringify(json),
  };
};

export const errorResponse = (message: string) => {
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

export const readJsonFileSync = (path: string | URL) => {
  return JSON.parse(Deno.readTextFileSync(path));
};

export const solvedPath = (metaUrl: string, path: string) => {
  let cwd = metaUrl.substring(8, metaUrl.lastIndexOf("/")); // Deno.cwd();

  if (path.startsWith("./")) {
    return cwd + path.substr(1, path.length);
  } else if (path.startsWith("../")) {
    cwd = cwd.substring(0, cwd.lastIndexOf("/"));
    return cwd + path.substr(2, path.length);
  } else {
    return cwd + path;
  }
};

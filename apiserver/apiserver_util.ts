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

export function pathResolver(meta: ImportMeta): (p: string) => string {
  return (p) => {
    let cwd = meta.url.substring(8, meta.url.lastIndexOf("/")); // Deno.cwd();
    if (p.startsWith("./")) {
      return cwd + p.substr(1, p.length);
    } else if (p.startsWith("../")) {
      cwd = cwd.substring(0, cwd.lastIndexOf("/"));
      return cwd + p.substr(2, p.length);
    } else {
      return cwd + p;
    }
  };
}

export const solvedPath = (metaUrl: string, path: string) => {
  //return new URL(path, metaUrl).pathname;
  console.log("非推奨(solvedPath)");
  //console.log(metaUrl);
  let cwd = metaUrl.substring(8, metaUrl.lastIndexOf("/")); // Deno.cwd();
  //console.log(cwd);
  if (path.startsWith("./")) {
    return cwd + path.substr(1, path.length);
  } else if (path.startsWith("../")) {
    cwd = cwd.substring(0, cwd.lastIndexOf("/"));
    return cwd + path.substr(2, path.length);
  } else {
    return cwd + path;
  }
};

import { fromFileUrl, ServeHandler } from "./deps.ts";
import { errors, ServerError } from "./error.ts";

export const jsonResponse = <T>(json: T) => {
  return {
    status: 200,
    headers: new Headers({
      "content-type": "application/json",
    }),
    body: JSON.stringify(json),
  };
};

export const readJsonFileSync = (path: string | URL) => {
  return JSON.parse(Deno.readTextFileSync(path));
};

export function pathResolver(meta: ImportMeta): (p: string) => string {
  return (p) => fromFileUrl(new URL(p, meta.url));
}

export const contentTypeFilter = (
  ...types: (string | RegExp)[]
): ServeHandler =>
  (req) => {
    if (types.some((v) => req.headers.get("content-type")?.match(v))) {
      return;
    }
    throw new ServerError(errors.INVALID_CONTENT_TYPE);
    //throw new RoutingError(400, "Invalid content-type");
  };

export const jsonParse = (): ServeHandler =>
  async (req) => {
    try {
      const reqJson = await req.json();
      req.set("data", reqJson);
    } catch (e) {
      throw new ServerError(errors.INVALID_SYNTAX);
    }
  };

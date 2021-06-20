import { fromFileUrl } from "./deps.ts";

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

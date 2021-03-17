import { fromFileUrl } from "https://deno.land/std@0.79.0/path/mod.ts";

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
  return (p) => fromFileUrl(new URL(p, meta.url));
}

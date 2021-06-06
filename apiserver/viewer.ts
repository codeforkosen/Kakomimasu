import { parse } from "https://deno.land/std@0.84.0/flags/mod.ts";
const args = parse(Deno.args);
import {
  createRouter,
  serveStatic,
} from "https://deno.land/x/servest@v1.3.0/mod.ts";

import * as util from "./apiserver_util.ts";
const resolve = util.pathResolver(import.meta);

import * as esbuild from "https://deno.land/x/esbuild@v0.11.17/mod.js";
import { denoPlugin } from "https://raw.githubusercontent.com/lucacasonato/esbuild_deno_loader/fa2219c3df9494da6c33e3e4dffb1a33b5cc0345/mod.ts";

if (!args.noViewer) {
  const bundle = await esbuild.build({
    entryPoints: ["file:///" + resolve("../pages/route.tsx")],
    plugins: [
      denoPlugin({ importMapFile: resolve("../pages/import-map.json") }),
    ],
    bundle: true,
    outfile: resolve("../public/app.bundle.js"),
    minify: true,
  });
}

export const viewerRoutes = () => {
  const router = createRouter();

  router.use(serveStatic(resolve("../public")));

  router.get(new RegExp(".*"), async (req) => {
    await req.sendFile(resolve("../pages/layout.html"));
  });

  return router;
};

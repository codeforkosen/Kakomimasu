import { parse } from "./deps.ts";
const args = parse(Deno.args);
import { createRouter, serveStatic } from "./deps.ts";

import * as util from "./apiserver_util.ts";
const resolve = util.pathResolver(import.meta);

import { denoPlugin, esbuild } from "./deps.ts";

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

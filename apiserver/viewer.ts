import {
  createRouter,
  serveStatic,
} from "https://deno.land/x/servest@v1.3.0/mod.ts";

import * as util from "./apiserver_util.ts";
const resolve = util.pathResolver(import.meta);

import * as esbuild from "https://deno.land/x/esbuild@v0.11.17/mod.js";
import { denoPlugin } from "https://raw.githubusercontent.com/lucacasonato/esbuild_deno_loader/fa2219c3df9494da6c33e3e4dffb1a33b5cc0345/mod.ts";

const bundle = await esbuild.build({
  entryPoints: ["file:///" + resolve("../pages/route.tsx")],
  plugins: [denoPlugin({ importMapFile: "../pages/import-map.json" })],
  bundle: true,
  outfile: "../public/app.bundle.js",
  minify: true,
});
console.log(bundle);

export const viewerRoutes = () => {
  const router = createRouter();

  router.use(serveStatic(resolve("../public")));

  /*router.get("app.bundle.js", async (req) => {
    await req.respond(
      {
        status: 200,
        headers: new Headers({ "Content-Type": "text/javascript" }),
        body: bundleJs,
      },
    );
  });*/
  router.get(new RegExp(".*"), async (req) => {
    await req.sendFile(resolve("../pages/layout.html"));
  });
  /*router.catch(async (e, req) => {
    if (e instanceof RoutingError) {
      await req.respond(
        { headers: new Headers({ "Location": "404" }), status: 302 },
      );
    }
  });*/

  return router;
};

import {
  createRouter,
  serveStatic,
} from "https://deno.land/x/servest@v1.3.0/mod.ts";

import * as util from "./apiserver_util.ts";
const resolve = util.pathResolver(import.meta);

const emit = await Deno.emit("file:///" + resolve("../pages/route.tsx"), {
  bundle: "module",
  importMapPath: "../pages/import-map.json",
  compilerOptions: {
    lib: ["dom", "esnext"],
  },
  //check: false,
});
if (emit.diagnostics.length) {
  // there is something that impacted the emit
  console.warn(Deno.formatDiagnostics(emit.diagnostics));
}
console.log(emit.stats);
let bundleJs = emit.files["deno:///bundle.js"];
Deno.writeTextFileSync(resolve("../public/app.bundle.js"), bundleJs);

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

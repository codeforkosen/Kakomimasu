import {
  createRouter,
  serveStatic,
} from "https://deno.land/x/servest@v1.3.0/mod.ts";

import * as util from "./apiserver_util.ts";
const resolve = util.pathResolver(import.meta);

const emit = await Deno.emit("file:///" + resolve("../pages/route.tsx"), {
  bundle: "esm",
  check: false,
});
console.log(emit);
let bundleJs = emit.files["deno:///bundle.js"];
//Deno.writeTextFileSync(resolve("../pages/app.bundle.js"), bundleJs);

async function bundle() {
  const watcher = Deno.watchFs(resolve("../pages"));
  for await (const event of watcher) {
    //console.log(">>>> event", event);
    console.log("bundle...");
    const emit = await Deno.emit("file:///" + resolve("../pages/route.tsx"), {
      bundle: "esm",
    });
    console.log(emit);
    bundleJs = emit.files["deno:///bundle.js"];
    console.log("bundled");
  }
}
//bundle();

export const viewerRoutes = () => {
  const router = createRouter();

  router.use(serveStatic(resolve("../public")));

  router.get("app.bundle.js", async (req) => {
    await req.respond(
      {
        status: 200,
        headers: new Headers({ "Content-Type": "text/javascript" }),
        body: bundleJs,
      },
    );
  });
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

import { createRouter, denoPlugin, esbuild, serveStatic } from "./deps.ts";

import * as util from "./apiserver_util.ts";
const resolve = util.pathResolver(import.meta);

const latestMtime = (path: string) => {
  let latest = new Date(0);
  for (const dirEntry of Deno.readDirSync(path)) {
    let mtime: Date;
    if (dirEntry.isDirectory) {
      mtime = latestMtime(path + "/" + dirEntry.name);
    } else {
      const stat = Deno.statSync(path + "/" + dirEntry.name);
      if (stat.mtime) mtime = stat.mtime;
      else continue;
    }
    if (mtime > latest) latest = mtime;
  }
  return latest;
};

async function createBundleJsFile() {
  const sourceMtimes = [
    latestMtime(resolve("../pages")),
    latestMtime(resolve("../components")),
  ];
  const sourceMtime = sourceMtimes.sort((a, b) => b.getTime() - a.getTime())[0];

  try {
    const bundleJsMtime =
      Deno.statSync(resolve("../public/app.bundle.js")).mtime;

    console.log(sourceMtime, bundleJsMtime);
    if (bundleJsMtime && bundleJsMtime >= sourceMtime) {
      console.log("app.bundle.js is up to date.");
      console.log("viewer started.");
      return;
    }
  } catch (e) {
    if (!(e instanceof Deno.errors.NotFound)) {
      console.log(e);
    }
  }

  console.log("app.bundle.js is bundling.");
  const _bundle = await esbuild.build({
    entryPoints: ["file:///" + resolve("../pages/route.tsx")],
    plugins: [
      denoPlugin({ importMapFile: resolve("../pages/import-map.json") }),
    ],
    bundle: true,
    outfile: resolve("../public/app.bundle.js"),
    minify: true,
  });
  console.log("viewer started.");
}
createBundleJsFile();

export const viewerRoutes = () => {
  const router = createRouter();

  router.use(serveStatic(resolve("../public")));

  router.get(new RegExp(".*"), async (req) => {
    await req.sendFile(resolve("../pages/layout.html"));
  });

  return router;
};

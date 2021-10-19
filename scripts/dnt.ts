// Deno to Node transform program
import { build } from "https://deno.land/x/dnt@0.0.9/mod.ts";

const version = Deno.args[0];
if (!version) {
  throw Error("Version args need.");
}

await build({
  entryPoint: "./src/Kakomimasu.ts",
  outDir: ".",
  typeCheck: true,
  package: {
    // package.json properties
    name: "@kakomimasu/core",
    version,
    description: "Kakomimasu core module for js/ts(browser/deno/node)",
    license: "MIT",
    repository: {
      type: "git",
      url: "git+https://github.com/codeforkosen/Kakomimasu",
    },
    bugs: {
      url: "https://github.com/codeforkosen/Kakomimasu/issues",
    },
  },
});

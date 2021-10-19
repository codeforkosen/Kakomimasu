// Deno to Node transform program
import { build } from "https://deno.land/x/dnt@0.0.9/mod.ts";

await build({
  entryPoint: "./src/Kakomimasu.ts",
  outDir: ".",
  typeCheck: true,
  package: {
    // package.json properties
    name: "Kakomimasu-core",
    version: Deno.args[0],
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

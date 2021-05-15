const emit = await Deno.emit("./recharts.ts", {
  bundle: "esm",
  importMapPath: "../pages/import-map.json",
  compilerOptions: {
    lib: ["dom", "esnext"],
  },
});

console.log(emit);

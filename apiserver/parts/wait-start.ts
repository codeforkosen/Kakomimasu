const sleep = (msec: number) =>
  new Promise((resolve) => setTimeout(resolve, msec));

while (true) {
  try {
    await Deno.connectTls({ port: 8880, hostname: "localhost" });
    break;
  } catch (_e) {
    console.log(".");
    await sleep(1000);
  }
}

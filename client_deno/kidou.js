const num = 15;

let loopNum = 0;

while (true) {
  console.log("num:", loopNum, "total", loopNum * num);
  loopNum++;
  const subProcesses = [];

  for (let i = 0; i < num; i++) {
    subProcesses.push(
      Deno.run(
        {
          cmd: [
            "deno",
            "run",
            "-A",
            "client_a5.js",
            "--local",
            "--useAi",
            "a1",
            "--aiBoard",
            "A-1",
            "--nolog",
          ],
        },
      ),
    );
  }

  for (const sp of subProcesses) {
    await sp.status();
  }
}

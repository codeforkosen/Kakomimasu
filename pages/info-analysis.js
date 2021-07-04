const text = Deno.readTextFileSync("./info.json");
const data = JSON.parse(text);

const codes = [];

function object(data) {
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === "object") {
      object(value);
    } else if (typeof value === "string") {
      if (key === "code") {
        //console.log(key, value);
        if (value.startsWith("file")) continue;
        if (!codes.some((c) => c === value)) {
          codes.push(value);
        }
      }
    }
    //console.log(key + ": " + value);
  }
}

object(data);

codes.sort();
console.log(codes);
Deno.writeTextFileSync("analysed-info.json", JSON.stringify(codes));

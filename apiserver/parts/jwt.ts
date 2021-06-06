import { decode } from "../deps.ts";

export async function getPayload(jwt: string) {
  const [header, payload, signature] = decode(jwt);

  //console.log(payload, signature, header);
  if (header && typeof header === "object") {
    const pKey = await getPublicKey();
    const a = pKey[(header as any).kid];
    //console.log(a);
    if (a) return payload as any;
  }
  return undefined;
}

async function getPublicKey() {
  const res = await fetch(
    "	https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com",
  );
  const data = await res.json();
  //console.log("getPublicKey", data);
  return data;
}

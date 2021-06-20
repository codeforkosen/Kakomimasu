import { decode } from "../deps.ts";

export async function getPayload(jwt: string) {
  const [header, payload] = decode(jwt);

  const kid = (header as { kid: string }).kid;

  if (kid) {
    const pKey = await getPublicKey();
    const a = pKey[kid];
    //console.log(a);
    if (a) return payload as { user_id: string };
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

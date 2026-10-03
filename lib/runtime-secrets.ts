import { sql } from "@/lib/db";

type RuntimeSecrets={
  rsvpSigningSecret:string;
  storageInternalSecret:string;
};

let cached:Promise<RuntimeSecrets>|null=null;
let cachedAt=0;

async function loadSecrets():Promise<RuntimeSecrets>{
  const db=sql();
  const rows=await db`SELECT secret_key,secret_value FROM app_secrets
    WHERE secret_key IN ('rsvp_signing_secret','storage_internal_secret')`;
  const map=new Map((rows as any[]).map(r=>[String(r.secret_key),String(r.secret_value)]));
  const rsvpSigningSecret=map.get("rsvp_signing_secret")||"";
  const storageInternalSecret=map.get("storage_internal_secret")||"";
  if(rsvpSigningSecret.length<64||storageInternalSecret.length<64)throw new Error("Runtime secret store belum siap");
  return{rsvpSigningSecret,storageInternalSecret};
}

export async function getRuntimeSecrets(){
  if(cached&&Date.now()-cachedAt<60_000)return cached;
  cachedAt=Date.now();
  cached=loadSecrets().catch(error=>{cached=null;throw error});
  return cached;
}

export async function getRsvpSigningSecret(){return (await getRuntimeSecrets()).rsvpSigningSecret}
export async function getStorageInternalSecret(){return (await getRuntimeSecrets()).storageInternalSecret}

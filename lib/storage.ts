import { getStorageInternalSecret } from "@/lib/runtime-secrets";

export const MAX_FILE_BYTES=5*1024*1024;
export const MAX_WORKSPACE_BYTES=15*1024*1024;
export const ALLOWED_FILE_TYPES=new Set(["application/pdf","image/jpeg","image/png","image/webp"]);
export const STORAGE_BRIDGE_URL=process.env.STORAGE_BRIDGE_URL||"https://br-bitter-waterfall-b5jea6qo-storagebridge.compute.c-7.us-east-2.aws.neon.tech/";

async function bridge(op:string,key:string){
  const secret=await getStorageInternalSecret();
  const res=await fetch(STORAGE_BRIDGE_URL,{
    method:"POST",
    headers:{"content-type":"application/json","authorization":`Bearer ${secret}`},
    body:JSON.stringify({op,key}),
    cache:"no-store"
  });
  const data=await res.json().catch(()=>({})) as any;
  if(!res.ok)throw new Error(data?.error||`Storage bridge error ${res.status}`);
  return data;
}

export async function presignStorageUpload(key:string){return String((await bridge("presign-upload",key)).url||"")}
export async function presignStorageDownload(key:string){return String((await bridge("presign-download",key)).url||"")}
export async function headStorageObject(key:string){return Number((await bridge("head",key)).size||0)}
export async function deleteStorageObject(key:string){await bridge("delete",key)}

export async function storageBridgeHealth(){
  const res=await fetch(new URL("/health",STORAGE_BRIDGE_URL),{cache:"no-store"});
  const data=await res.json().catch(()=>({})) as any;
  return{ok:res.ok&&Boolean(data?.ok),storageEnv:Boolean(data?.storageEnv),database:Boolean(data?.database)};
}

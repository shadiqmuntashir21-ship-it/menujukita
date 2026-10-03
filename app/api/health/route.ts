import { sql } from "@/lib/db";
import { storageBridgeHealth } from "@/lib/storage";

export const dynamic="force-dynamic";

export async function GET(){
  if(!process.env.DATABASE_URL)return Response.json({ok:false,checks:{database:false}},{status:503});
  try{
    const db=sql();
    const rows=await db`SELECT secret_key FROM app_secrets WHERE secret_key IN ('rsvp_signing_secret','storage_internal_secret')`;
    const keys=new Set((rows as any[]).map(r=>String(r.secret_key)));
    const bridge=await storageBridgeHealth().catch(()=>({ok:false,storageEnv:false,database:false}));
    const checks={database:true,rsvpSecret:keys.has("rsvp_signing_secret"),storageSecret:keys.has("storage_internal_secret"),storageBridge:bridge.ok&&bridge.storageEnv};
    const ready=Object.values(checks).every(Boolean);
    return Response.json({ok:ready,checks,bridge:{storageEnv:bridge.storageEnv,database:bridge.database}},{status:ready?200:503});
  }catch(error){
    return Response.json({ok:false,checks:{database:false},error:"backend_unavailable"},{status:503});
  }
}
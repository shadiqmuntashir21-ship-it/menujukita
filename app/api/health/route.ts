import { sql } from "@/lib/db";
import { storageBridgeHealth } from "@/lib/storage";

export const dynamic="force-dynamic";

export async function GET(){
  try{
    const db=sql();
    const [ping,secrets]=await Promise.all([
      db`SELECT 1::int ok`,
      db`SELECT secret_key FROM app_secrets WHERE secret_key IN ('rsvp_signing_secret','storage_internal_secret')`
    ]);
    const keys=new Set((secrets as any[]).map(r=>String(r.secret_key)));
    const bridge=await storageBridgeHealth().catch(()=>({ok:false,storageEnv:false,database:false}));
    const checks={
      database:Number((ping as any[])[0]?.ok||0)===1,
      dbBridge:process.env.VERCEL==="1",
      rsvpSecret:keys.has("rsvp_signing_secret"),
      storageSecret:keys.has("storage_internal_secret"),
      storageBridge:bridge.ok&&bridge.storageEnv
    };
    const ready=Object.values(checks).every(Boolean);
    return Response.json({ok:ready,checks,bridge:{storageEnv:bridge.storageEnv,database:bridge.database}},{status:ready?200:503});
  }catch(error){
    console.error("health_backend",error instanceof Error?error.message:String(error));
    return Response.json({ok:false,checks:{database:false,dbBridge:process.env.VERCEL==="1"},error:"backend_unavailable"},{status:503});
  }
}

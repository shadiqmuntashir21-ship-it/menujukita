"use server";
import { redirect } from "next/navigation";
import { sql } from "@/lib/db";
import { createAdminSession,logAccess,rateLimit,verifyPin } from "@/lib/session";
type State={error?:string};
export async function adminLogin(_prev:State|null,f:FormData):Promise<State>{
 const pin=String(f.get("pin")||"").trim();
 if(!/^[0-9]{6}$/.test(pin))return{error:"PIN admin harus 6 digit."};
 if(!process.env.DATABASE_URL)return{error:"Database belum terhubung."};
 if(!await rateLimit("admin-login",6))return{error:"Terlalu banyak percobaan. Coba lagi sekitar 15 menit."};
 const db=sql(),rows=await db`SELECT admin_pin_hash,admin_pin_salt FROM app_settings WHERE id=1 LIMIT 1`;
 const ok=rows[0]?.admin_pin_hash&&rows[0]?.admin_pin_salt&&verifyPin(pin,String(rows[0].admin_pin_salt),String(rows[0].admin_pin_hash));
 if(!ok){await logAccess({actorType:"admin",event:"admin_login_failed",success:false});return{error:"PIN admin tidak sesuai."}}
 await createAdminSession();await logAccess({actorType:"admin",event:"admin_login_success"});redirect("/admin");
}

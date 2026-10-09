"use server";
import { redirect } from "next/navigation";
import { sql } from "@/lib/db";
import { createLicenseSession,logAccess,rateLimit,sha256,verifyPin } from "@/lib/session";
type State={error?:string};
export async function signIn(_prev:State|null,f:FormData):Promise<State>{
  const code=String(f.get("license")||"").trim().toUpperCase().replace(/\s+/g,""),pin=String(f.get("pin")||"").trim();
  if(!/^MK-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(code)||!/^[0-9]{4,8}$/.test(pin))return{error:"Periksa kembali Kode Lisensi dan PIN."};
  if(!process.env.DATABASE_URL)return{error:"Server MenujuKita belum terhubung ke database."};
  if(!await rateLimit("license-login:"+sha256(code),8))return{error:"Terlalu banyak percobaan. Coba lagi sekitar 15 menit."};
  const db=sql(),rows=await db`SELECT id,status,wedding_id,pin_hash,pin_salt,pending_pin_hash,pending_pin_salt,pending_pin_expires_at FROM licenses WHERE code_hash=${sha256(code)} LIMIT 1`,license:any=rows[0];
  const ownerValid=license?.pin_hash&&license?.pin_salt&&verifyPin(pin,String(license.pin_salt),String(license.pin_hash));
  const pendingValid=!ownerValid&&license?.pending_pin_hash&&license?.pending_pin_salt&&license?.pending_pin_expires_at&&new Date(license.pending_pin_expires_at).getTime()>Date.now()&&verifyPin(pin,String(license.pending_pin_salt),String(license.pending_pin_hash));
  let partner:any=null;
  if(license&&!ownerValid&&!pendingValid){
    const found=await db`SELECT id,pin_hash,pin_salt FROM wedding_partner_access
      WHERE license_id=${license.id} AND status='active' AND pin_hash IS NOT NULL LIMIT 1`;
    const candidate:any=found[0];
    if(candidate&&verifyPin(pin,String(candidate.pin_salt),String(candidate.pin_hash)))partner=candidate;
  }
  if(!ownerValid&&!pendingValid&&!partner){await logAccess({actorType:"license",licenseId:license?.id||null,event:"login_failed",success:false});return{error:license&&!license.pin_hash?"PIN lisensi belum dibuat. Hubungi Admin MenujuKita.":"Kode Lisensi atau PIN tidak cocok."}}
  if(["revoked","expired"].includes(String(license.status)))return{error:"Lisensi ini sudah tidak aktif. Hubungi Teman Digital."};
  if(license.status==="suspended")return{error:"Lisensi sedang ditangguhkan. Hubungi Teman Digital."};

  if(pendingValid){
    // Atomically activate the replacement only when successfully claimed.
    const promoted=await db`WITH switched AS (
      UPDATE licenses SET pin_hash=pending_pin_hash,pin_salt=pending_pin_salt,pin_hint=pending_pin_hint,pin_updated_at=now(),
        pending_pin_hash=NULL,pending_pin_salt=NULL,pending_pin_hint=NULL,pending_pin_expires_at=NULL,updated_at=now()
      WHERE id=${license.id} AND pending_pin_hash=${license.pending_pin_hash} AND pending_pin_expires_at>now()
      RETURNING id
    ), revoked AS (
      UPDATE license_sessions SET revoked_at=now() WHERE license_id IN (SELECT id FROM switched)
        AND partner_id IS NULL AND revoked_at IS NULL RETURNING id
    ) SELECT id FROM switched`;
    if(!promoted[0])return{error:"PIN pengganti telah berubah atau kedaluwarsa. Gunakan PIN lama atau hubungi admin."};
  }
  await createLicenseSession(String(license.id),partner?.id||null);await db`UPDATE licenses SET last_login_at=now() WHERE id=${license.id}`;
  await logAccess({actorType:"license",licenseId:String(license.id),event:"login_success",metadata:{actor:partner?"partner":"owner"}});redirect(license.wedding_id?"/app":"/onboarding");
}

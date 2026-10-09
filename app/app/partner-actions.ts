"use server";
import crypto from "node:crypto";
import {revalidatePath} from "next/cache";
import {redirect} from "next/navigation";
import {requireWorkspace} from "@/lib/workspace";
import {sql} from "@/lib/db";
import {createLicenseSession,hashPin,logAccess,newPinSalt,rateLimit,sha256,verifyPin} from "@/lib/session";
import {recordActivity} from "@/lib/activity";
import {APP_URL} from "@/lib/email";
type InviteState={error?:string;link?:string};
export async function createPartnerInvite(_prev:InviteState|null):Promise<InviteState>{
 const {db,wedding,session,license,admin}=await requireWorkspace();
 if(admin||wedding.role!=="owner"||!license?.license_id)return{error:"Hanya pengelola utama yang dapat mengundang pasangan."};
 const exists=await db`SELECT id,status FROM wedding_partner_access WHERE wedding_id=${wedding.id} LIMIT 1`;
 if(exists[0]?.status==="active")return{error:"Pasangan sudah bergabung. Cabut aksesnya terlebih dahulu jika ingin mengganti pasangan."};
 if(!await rateLimit("partner-invite:"+String(wedding.id),5))return{error:"Terlalu banyak undangan dibuat. Coba kembali dalam 15 menit."};
 const token=crypto.randomBytes(24).toString("base64url"),tokenHash=sha256(token);
 const rows=await db`INSERT INTO wedding_partner_access(wedding_id,license_id,status,invite_token_hash,invite_expires_at)
 VALUES(${wedding.id},${license.license_id},'invited',${tokenHash},now()+interval '48 hours')
 ON CONFLICT(wedding_id) DO UPDATE SET license_id=EXCLUDED.license_id,status='invited',invite_token_hash=EXCLUDED.invite_token_hash,invite_expires_at=EXCLUDED.invite_expires_at,updated_at=now()
 WHERE wedding_partner_access.status<>'active'
 RETURNING id`;
 if(!rows[0])return{error:"Undangan belum bisa dibuat. Periksa status akses pasangan."};
 await recordActivity(db,wedding.id,session.user.id,"partner_invited","partner",String(rows[0].id),{expires:"48 hours"});
 revalidatePath("/app");
 return{link:APP_URL.replace(/\/$/,"")+"/join-partner/"+token};
}
export async function revokePartnerAccess(form:FormData){
 const {db,wedding,session,admin}=await requireWorkspace();
 if(admin||wedding.role!=="owner")throw new Error("Hanya pengelola utama yang boleh mencabut akses.");
 const target=await db`SELECT id,status FROM wedding_partner_access WHERE wedding_id=${wedding.id} LIMIT 1`;
 if(!target[0])return;
 const id=String(target[0].id);
 await db.transaction([
   db`UPDATE wedding_partner_access SET status='revoked',invite_token_hash=NULL,invite_expires_at=NULL,updated_at=now() WHERE wedding_id=${wedding.id} AND id=${id}`,
   db`UPDATE license_sessions SET revoked_at=now() WHERE partner_id=${id} AND revoked_at IS NULL`,
   db`UPDATE wedding_members SET status='revoked' WHERE wedding_id=${wedding.id} AND auth_user_id=${"partner:"+id}`
 ],{isolationLevel:"Serializable"});
 await recordActivity(db,wedding.id,session.user.id,"partner_access_revoked","partner",id,{});
 revalidatePath("/app");
}
export async function acceptPartnerInvite(token:string,form:FormData){
 const name=String(form.get("name")||"").trim().slice(0,80),pin=String(form.get("pin")||"").trim();
 const target="/join-partner/"+encodeURIComponent(token);
 if(name.length<2||!/^[0-9]{6}$/.test(pin)||pin!==String(form.get("confirm_pin")||"").trim())redirect(target+"?error=data");
 if(!await rateLimit("partner-claim:"+sha256(token),6))redirect(target+"?error=limit");
 const db=sql();
 const rows=await db`SELECT p.id,p.wedding_id,p.license_id,l.pin_hash owner_pin_hash,l.pin_salt owner_pin_salt
 FROM wedding_partner_access p JOIN licenses l ON l.id=p.license_id JOIN weddings w ON w.id=p.wedding_id
 WHERE p.invite_token_hash=${sha256(token)} AND p.status='invited' AND p.invite_expires_at>now()
 AND l.status='active' AND w.status='active' LIMIT 1`;
 const partner:any=rows[0];
 if(!partner)redirect(target+"?error=expired");
 if(verifyPin(pin,String(partner.owner_pin_salt),String(partner.owner_pin_hash)))redirect(target+"?error=duplicate");
 const salt=newPinSalt(),hashed=hashPin(pin,salt);
 const claimed=await db`WITH activated AS (
  UPDATE wedding_partner_access SET display_name=${name},pin_hash=${hashed},pin_salt=${salt},pin_hint=${pin.slice(-2)},status='active',invite_token_hash=NULL,invite_expires_at=NULL,joined_at=now(),updated_at=now()
  WHERE id=${partner.id} AND wedding_id=${partner.wedding_id} AND invite_token_hash=${sha256(token)} AND status='invited' AND invite_expires_at>now()
  RETURNING id,wedding_id,license_id,display_name
 ), joined AS (
  INSERT INTO wedding_members(wedding_id,auth_user_id,display_name,role,can_view_budget,status,joined_at)
  SELECT wedding_id, 'partner:' || id::text, display_name, 'partner',true,'active',now() FROM activated
  ON CONFLICT(wedding_id,auth_user_id) DO UPDATE SET display_name=EXCLUDED.display_name,role='partner',can_view_budget=true,status='active',joined_at=now()
  RETURNING id
 ) SELECT id,wedding_id,license_id FROM activated`;
 if(!claimed[0])redirect(target+"?error=expired");
 await createLicenseSession(String(claimed[0].license_id),String(claimed[0].id));
 await logAccess({actorType:"license",licenseId:String(claimed[0].license_id),event:"partner_joined",metadata:{weddingId:claimed[0].wedding_id}});
 redirect("/app");
}

"use server";
import crypto from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { hashPin,logAccess,newPinSalt,revokeAdminSession,setAdminWorkspace,sha256 } from "@/lib/session";

type Credential={code:string;pin:string};
type State={error?:string;credentials?:Credential[]};
const alphabet="ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const chunk=()=>Array.from({length:4},()=>alphabet[crypto.randomInt(0,alphabet.length)]).join("");
const makeCode=()=>`MK-${chunk()}-${chunk()}`;
const makePin=()=>crypto.randomInt(0,1000000).toString().padStart(6,"0");

export async function generateLicenses(_prev:State|null,f:FormData):Promise<State>{
  const {db}=await requireAdmin();
  const requested=Math.max(1,Math.min(250,Number(f.get("count")||1)));
  const [cap]=await db`SELECT s.max_active_weddings,
    count(l.id) FILTER(WHERE l.status IN('active','unused','suspended'))::int allocated
    FROM app_settings s LEFT JOIN licenses l ON true WHERE s.id=1 GROUP BY s.max_active_weddings`;
  const remaining=Math.max(0,Number(cap.max_active_weddings)-Number(cap.allocated||0));
  if(remaining<=0)return{error:"Seluruh 250 slot pilot sudah dialokasikan."};
  const count=Math.min(requested,remaining),credentials:Credential[]=[];
  for(let i=0;i<count;i++){credentials.push({code:makeCode(),pin:makePin()})}
  await db.transaction(credentials.map(x=>{const salt=newPinSalt();return db`INSERT INTO licenses(code_hash,code_hint,pin_hash,pin_salt,pin_hint,pin_updated_at,status)
    VALUES(${sha256(x.code)},${x.code.slice(-4)},${hashPin(x.pin,salt)},${salt},${x.pin.slice(-2)},now(),'unused')`}));
  await logAccess({actorType:"admin",event:"licenses_generated",metadata:{count}});
  revalidatePath("/admin");return{credentials};
}

export async function resetLicensePin(_prev:{error?:string;pin?:string}|null,f:FormData){
  const {db}=await requireAdmin(),id=String(f.get("id")||""),pin=makePin(),salt=newPinSalt();
  const rows=await db`UPDATE licenses SET pin_hash=${hashPin(pin,salt)},pin_salt=${salt},pin_hint=${pin.slice(-2)},pin_updated_at=now(),updated_at=now() WHERE id=${id} RETURNING id`;
  if(!rows[0])return{error:"Lisensi tidak ditemukan."};
  await db`UPDATE license_sessions SET revoked_at=now() WHERE license_id=${id} AND revoked_at IS NULL`;
  await logAccess({actorType:"admin",licenseId:id,event:"pin_reset"});revalidatePath("/admin");return{pin};
}

export async function changeLicenseStatus(f:FormData){
  const {db}=await requireAdmin(),id=String(f.get("id")||""),status=String(f.get("status")||"");
  if(!["active","suspended","revoked","unused"].includes(status))return;
  if(status==="active")await db`UPDATE licenses SET status='active',updated_at=now() WHERE id=${id} AND wedding_id IS NOT NULL AND status='suspended'`;
  else if(status==="unused")await db`UPDATE licenses SET status='unused',wedding_id=NULL,activated_by_auth_user_id=NULL,activated_at=NULL,updated_at=now() WHERE id=${id} AND status!='active'`;
  else await db`UPDATE licenses SET status=${status},updated_at=now() WHERE id=${id}`;
  if(["suspended","revoked"].includes(status))await db`UPDATE license_sessions SET revoked_at=now() WHERE license_id=${id} AND revoked_at IS NULL`;
  await logAccess({actorType:"admin",licenseId:id,event:"license_status_changed",metadata:{status}});revalidatePath("/admin");
}
export async function revokeLicenseSessions(f:FormData){const {db}=await requireAdmin(),id=String(f.get("id")||"");await db`UPDATE license_sessions SET revoked_at=now() WHERE license_id=${id} AND revoked_at IS NULL`;await logAccess({actorType:"admin",licenseId:id,event:"sessions_revoked"});revalidatePath("/admin")}
export async function openWeddingAsAdmin(f:FormData){await requireAdmin();const weddingId=String(f.get("wedding_id")||"");if(!weddingId)return;await setAdminWorkspace(weddingId);await logAccess({actorType:"admin",event:"admin_opened_workspace",metadata:{weddingId}});redirect("/app")}
export async function adminLogout(){await revokeAdminSession();redirect("/admin/login")}

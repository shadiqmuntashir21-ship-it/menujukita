import crypto from "node:crypto";
import { cookies,headers } from "next/headers";
import { sql } from "@/lib/db";

const LICENSE_COOKIE="mk_license_session";
const ADMIN_COOKIE="mk_admin_session";
const ADMIN_WORKSPACE_COOKIE="mk_admin_workspace";

export const sha256=(value:string)=>crypto.createHash("sha256").update(value).digest("hex");
export const newPinSalt=()=>crypto.randomBytes(16).toString("hex");
export const hashPin=(pin:string,salt:string)=>crypto.scryptSync(pin,salt,32).toString("hex");
export const secureEqual=(a:string,b:string)=>{try{return crypto.timingSafeEqual(Buffer.from(a),Buffer.from(b))}catch{return false}};
export const verifyPin=(pin:string,salt:string,expected:string)=>Boolean(salt&&expected)&&secureEqual(hashPin(pin,salt),expected);
const token=()=>crypto.randomBytes(32).toString("base64url");
const cookieOptions=(maxAge:number)=>({httpOnly:true,secure:process.env.NODE_ENV==="production",sameSite:"lax" as const,path:"/",maxAge});

export async function requestMeta(){
  const h=await headers();
  const ip=(h.get("x-forwarded-for")||h.get("x-real-ip")||"unknown").split(",")[0].trim();
  return {ipHash:sha256(ip),userAgent:(h.get("user-agent")||"unknown").slice(0,400)};
}
export async function getLicenseSession(){
  if(!process.env.DATABASE_URL)return null;
  const raw=(await cookies()).get(LICENSE_COOKIE)?.value;
  if(!raw)return null;
  const db=sql();
  const rows=await db`SELECT s.id session_id,s.license_id,s.expires_at,l.status,l.wedding_id,l.code_hint,l.pin_hint
    FROM license_sessions s JOIN licenses l ON l.id=s.license_id
    WHERE s.token_hash=${sha256(raw)} AND s.revoked_at IS NULL AND s.expires_at>now() LIMIT 1`;
  if(!rows[0])return null;
  await db`UPDATE license_sessions SET last_seen_at=now() WHERE id=${rows[0].session_id}`;
  return rows[0] as any;
}
export async function createLicenseSession(licenseId:string){
  const db=sql(),raw=token(),meta=await requestMeta();
  await db`INSERT INTO license_sessions(license_id,token_hash,user_agent,ip_hash,expires_at)
    VALUES(${licenseId},${sha256(raw)},${meta.userAgent},${meta.ipHash},now()+interval '30 days')`;
  (await cookies()).set(LICENSE_COOKIE,raw,cookieOptions(60*60*24*30));
}
export async function revokeLicenseSession(){
  const jar=await cookies(),raw=jar.get(LICENSE_COOKIE)?.value;
  if(raw&&process.env.DATABASE_URL)await sql()`UPDATE license_sessions SET revoked_at=now() WHERE token_hash=${sha256(raw)} AND revoked_at IS NULL`;
  jar.delete(LICENSE_COOKIE);
}
export async function getAdminSession(){
  if(!process.env.DATABASE_URL)return null;
  const raw=(await cookies()).get(ADMIN_COOKIE)?.value;
  if(!raw)return null;
  const db=sql(),rows=await db`SELECT id,expires_at FROM admin_sessions WHERE token_hash=${sha256(raw)} AND revoked_at IS NULL AND expires_at>now() LIMIT 1`;
  if(!rows[0])return null;
  await db`UPDATE admin_sessions SET last_seen_at=now() WHERE id=${rows[0].id}`;
  return rows[0] as any;
}
export async function createAdminSession(){
  const db=sql(),raw=token(),meta=await requestMeta();
  await db`INSERT INTO admin_sessions(token_hash,user_agent,ip_hash,expires_at) VALUES(${sha256(raw)},${meta.userAgent},${meta.ipHash},now()+interval '12 hours')`;
  (await cookies()).set(ADMIN_COOKIE,raw,cookieOptions(60*60*12));
}
export async function revokeAdminSession(){
  const jar=await cookies(),raw=jar.get(ADMIN_COOKIE)?.value;
  if(raw&&process.env.DATABASE_URL)await sql()`UPDATE admin_sessions SET revoked_at=now() WHERE token_hash=${sha256(raw)} AND revoked_at IS NULL`;
  jar.delete(ADMIN_COOKIE);jar.delete(ADMIN_WORKSPACE_COOKIE);
}
export async function setAdminWorkspace(weddingId:string){(await cookies()).set(ADMIN_WORKSPACE_COOKIE,weddingId,cookieOptions(60*60*4))}
export async function clearAdminWorkspace(){(await cookies()).delete(ADMIN_WORKSPACE_COOKIE)}
export async function getAdminWorkspace(){return (await cookies()).get(ADMIN_WORKSPACE_COOKIE)?.value||""}
export async function logAccess(input:{actorType:"license"|"admin"|"system";licenseId?:string|null;event:string;success?:boolean;metadata?:Record<string,unknown>}){
  if(!process.env.DATABASE_URL)return;
  const db=sql(),meta=await requestMeta();
  await db`INSERT INTO access_logs(actor_type,license_id,event,success,ip_hash,user_agent,metadata)
    VALUES(${input.actorType},${input.licenseId||null},${input.event},${input.success!==false},${meta.ipHash},${meta.userAgent},${JSON.stringify(input.metadata||{})}::jsonb)`;
}
export async function rateLimit(key:string,limit=10){
  const db=sql(),meta=await requestMeta(),bucket=Math.floor(Date.now()/(15*60*1000));
  const rateKey=sha256(`${key}|${meta.ipHash}|${bucket}`);
  const rows=await db`INSERT INTO public_rate_limits(rate_key,hit_count,window_start,updated_at) VALUES(${rateKey},1,now(),now())
    ON CONFLICT(rate_key) DO UPDATE SET hit_count=public_rate_limits.hit_count+1,updated_at=now() RETURNING hit_count`;
  return Number(rows[0]?.hit_count||0)<=limit;
}

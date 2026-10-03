"use server";

import crypto from "node:crypto";
import { revalidatePath } from "next/cache";
import { requireWorkspace } from "@/lib/workspace";
import { recordActivity } from "@/lib/activity";

type InviteState={error?:string;link?:string};
const hash=(v:string)=>crypto.createHash("sha256").update(v).digest("hex");

export async function createMemberInvite(_prev:InviteState|null,formData:FormData):Promise<InviteState>{
  const {db,session,wedding}=await requireWorkspace();
  if(!["owner","partner"].includes(String(wedding.role))) return{error:"Hanya owner/partner yang dapat mengundang member."};
  const role=String(formData.get("role")||"collaborator");
  if(!["partner","collaborator","viewer"].includes(role))return{error:"Role tidak valid."};
  const invitedEmail=String(formData.get("email")||"").trim().toLowerCase();
  const [quota]=await db`SELECT
    (SELECT count(*) FROM wedding_members WHERE wedding_id=${wedding.id} AND status='active')+
    (SELECT count(*) FROM member_invites WHERE wedding_id=${wedding.id} AND status='pending' AND expires_at>now()) AS count`;
  if(Number(quota.count)>=10)return{error:"Maksimal 10 anggota/invite aktif per wedding."};
  const canViewBudget=formData.get("can_view_budget")==="on";
  const token=crypto.randomBytes(24).toString("base64url");
  const rows=await db`INSERT INTO member_invites(wedding_id,invited_email,role,can_view_budget,token_hash,status,created_by_auth_user_id)
    VALUES(${wedding.id},${invitedEmail||null},${role},${canViewBudget},${hash(token)},'pending',${session.user.id}) RETURNING id`;
  await recordActivity(db,wedding.id,session.user.id,"member_invited","member",String(rows[0]?.id||""),{email:invitedEmail||null,role,canViewBudget});
  revalidatePath("/app");
  return{link:`/join/${token}`};
}

export async function revokeInvite(formData:FormData){
  const {db,session,wedding}=await requireWorkspace();
  if(!["owner","partner"].includes(String(wedding.role)))return;
  const id=String(formData.get("id")||"");
  const rows=await db`UPDATE member_invites SET status='revoked' WHERE id=${id} AND wedding_id=${wedding.id} AND status='pending' RETURNING invited_email,role`;
  if(rows[0])await recordActivity(db,wedding.id,session.user.id,"invite_revoked","member",id,{email:rows[0].invited_email,role:rows[0].role});
  revalidatePath("/app");
}

export async function removeMember(formData:FormData){
  const {db,session,wedding}=await requireWorkspace();
  if(String(wedding.role)!=="owner")return;
  const id=String(formData.get("id")||"");
  const rows=await db`SELECT role,auth_user_id,display_name,invited_email FROM wedding_members WHERE id=${id} AND wedding_id=${wedding.id} LIMIT 1`;
  if(!rows[0]||rows[0].role==="owner"||rows[0].auth_user_id===session.user.id)return;
  await db`UPDATE wedding_members SET status='revoked' WHERE id=${id} AND wedding_id=${wedding.id}`;
  await recordActivity(db,wedding.id,session.user.id,"member_removed","member",id,{name:rows[0].display_name,email:rows[0].invited_email,role:rows[0].role});
  revalidatePath("/app");
}

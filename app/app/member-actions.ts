"use server";

import crypto from "node:crypto";
import { revalidatePath } from "next/cache";
import { requireWorkspace } from "@/lib/workspace";

type InviteState={error?:string;link?:string};
const hash=(v:string)=>crypto.createHash("sha256").update(v).digest("hex");

export async function createMemberInvite(_prev:InviteState|null,formData:FormData):Promise<InviteState>{
  const {db,session,wedding}=await requireWorkspace();
  if(!["owner","partner"].includes(String(wedding.role))) return{error:"Hanya owner/partner yang dapat mengundang member."};
  const role=String(formData.get("role")||"collaborator");
  if(!["partner","collaborator","viewer"].includes(role))return{error:"Role tidak valid."};
  const invitedEmail=String(formData.get("email")||"").trim().toLowerCase();
  const canViewBudget=formData.get("can_view_budget")==="on";
  const token=crypto.randomBytes(24).toString("base64url");
  await db`INSERT INTO member_invites(wedding_id,invited_email,role,can_view_budget,token_hash,status,created_by_auth_user_id)
    VALUES(${wedding.id},${invitedEmail||null},${role},${canViewBudget},${hash(token)},'pending',${session.user.id})`;
  revalidatePath("/app");
  return{link:`/join/${token}`};
}

export async function revokeInvite(formData:FormData){
  const {db,wedding}=await requireWorkspace();
  if(!["owner","partner"].includes(String(wedding.role)))return;
  await db`UPDATE member_invites SET status='revoked' WHERE id=${String(formData.get("id")||"")} AND wedding_id=${wedding.id} AND status='pending'`;
  revalidatePath("/app");
}

export async function removeMember(formData:FormData){
  const {db,session,wedding}=await requireWorkspace();
  if(String(wedding.role)!=="owner")return;
  const id=String(formData.get("id")||"");
  const rows=await db`SELECT role,auth_user_id FROM wedding_members WHERE id=${id} AND wedding_id=${wedding.id} LIMIT 1`;
  if(!rows[0]||rows[0].role==="owner"||rows[0].auth_user_id===session.user.id)return;
  await db`UPDATE wedding_members SET status='revoked' WHERE id=${id} AND wedding_id=${wedding.id}`;
  revalidatePath("/app");
}

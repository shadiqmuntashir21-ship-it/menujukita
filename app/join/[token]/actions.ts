"use server";

import crypto from "node:crypto";
import { auth } from "@/lib/auth/server";
import { sql } from "@/lib/db";
import { redirect } from "next/navigation";

const hash=(v:string)=>crypto.createHash("sha256").update(v).digest("hex");

export async function acceptInvite(token:string){
  const {data:session}=await auth.getSession();
  if(!session?.user)redirect("/auth/sign-in?next="+encodeURIComponent("/join/"+token));
  const db=sql();
  const rows=await db`SELECT i.*,w.status wedding_status,l.status license_status
    FROM member_invites i JOIN weddings w ON w.id=i.wedding_id JOIN licenses l ON l.wedding_id=w.id
    WHERE i.token_hash=${hash(token)} AND i.status='pending' AND i.expires_at>now() LIMIT 1`;
  if(!rows[0])redirect("/join/"+token+"?error=invalid");
  const x:any=rows[0];
  if(x.wedding_status!=="active"||x.license_status!=="active")redirect("/join/"+token+"?error=inactive");
  await db.transaction([
    db`INSERT INTO wedding_members(wedding_id,auth_user_id,invited_email,display_name,role,can_view_budget,status,joined_at)
      VALUES(${x.wedding_id},${session.user.id},${x.invited_email||session.user.email||null},${session.user.name||session.user.email||"Member"},${x.role},${x.can_view_budget},'active',now())
      ON CONFLICT(wedding_id,auth_user_id) DO UPDATE SET role=EXCLUDED.role,can_view_budget=EXCLUDED.can_view_budget,status='active',joined_at=coalesce(wedding_members.joined_at,now())`,
    db`UPDATE member_invites SET status='accepted',accepted_by_auth_user_id=${session.user.id},accepted_at=now() WHERE id=${x.id} AND status='pending'`,
    db`INSERT INTO activity_logs(wedding_id,auth_user_id,action,entity_type,entity_id,metadata) VALUES(${x.wedding_id},${session.user.id},'member_joined','member',${session.user.id},'{}'::jsonb)`
  ],{isolationLevel:"Serializable"});
  redirect("/app");
}

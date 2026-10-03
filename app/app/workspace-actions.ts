"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/server";
import { sql } from "@/lib/db";

export async function switchWorkspace(formData:FormData){
  const {data:session}=await auth.getSession();
  if(!session?.user)redirect("/auth/sign-in");
  const weddingId=String(formData.get("wedding_id")||"");
  const db=sql();
  const rows=await db`SELECT w.id FROM weddings w
    JOIN wedding_members m ON m.wedding_id=w.id
    JOIN licenses l ON l.wedding_id=w.id
    WHERE w.id=${weddingId}
      AND m.auth_user_id=${session.user.id}
      AND m.status='active'
      AND w.status='active'
      AND l.status='active'
    LIMIT 1`;
  if(!rows[0])redirect("/app");
  const jar=await cookies();
  jar.set("menujukita_active_wedding",weddingId,{httpOnly:true,sameSite:"lax",secure:process.env.NODE_ENV==="production",path:"/",maxAge:60*60*24*365});
  redirect("/app");
}

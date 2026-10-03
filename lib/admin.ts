import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/server";
import { sql } from "@/lib/db";

export async function requireAdmin(){
  const {data:session}=await auth.getSession();
  if(!session?.user) redirect("/auth/sign-in");
  const allowed=(process.env.ADMIN_EMAILS||"").split(",").map(x=>x.trim().toLowerCase()).filter(Boolean);
  if(!session.user.email||!allowed.includes(session.user.email.toLowerCase())) redirect("/app");
  return {session,db:sql()};
}

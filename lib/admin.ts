import { redirect } from "next/navigation";
import { sql } from "@/lib/db";
import { getAdminSession } from "@/lib/session";
export async function requireAdmin(){
  const session=await getAdminSession();
  if(!session)redirect("/admin/login");
  return {session:{user:{id:"admin",name:"MenujuKita Admin"}},db:sql()};
}

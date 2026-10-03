import { redirect } from "next/navigation";
import { sql } from "@/lib/db";
import { getAdminSession,getAdminWorkspace,getLicenseSession } from "@/lib/session";

export async function getWorkspaceContext(){
  if(!process.env.DATABASE_URL)return null;
  const db=sql(),admin=await getAdminSession();
  if(admin){
    const id=await getAdminWorkspace();
    if(id){
      const rows=await db`SELECT w.*,l.status license_status,'owner'::text role,true can_view_budget
        FROM weddings w LEFT JOIN licenses l ON l.wedding_id=w.id WHERE w.id=${id} AND w.status='active' LIMIT 1`;
      if(rows[0])return {db,wedding:rows[0] as any,session:{user:{id:"admin",name:"MenujuKita Admin",email:null}},admin:true,license:null};
    }
  }
  const license=await getLicenseSession();
  if(!license)return null;
  const actor=`license:${license.license_id}`;
  if(!license.wedding_id)return {db,wedding:null,session:{user:{id:actor,name:"MenujuKita User",email:null}},admin:false,license};
  const rows=await db`SELECT w.*,l.status license_status,'owner'::text role,true can_view_budget
    FROM weddings w JOIN licenses l ON l.wedding_id=w.id WHERE w.id=${license.wedding_id} AND l.id=${license.license_id} AND w.status='active' LIMIT 1`;
  return {db,wedding:(rows[0]||null) as any,session:{user:{id:actor,name:rows[0]?`${rows[0].couple_one_name} & ${rows[0].couple_two_name}`:"MenujuKita User",email:null}},admin:false,license};
}
export async function requireWorkspace(){
  const ctx:any=await getWorkspaceContext();
  if(!ctx)redirect("/auth/sign-in");
  if(!ctx.wedding){
    if(["suspended","expired","revoked"].includes(String(ctx.license?.status)))redirect("/license-status");
    redirect("/onboarding");
  }
  if(!ctx.admin&&ctx.license?.status!=="active")redirect("/license-status");
  return ctx;
}
export function canViewBudget(_wedding:any){return true}
export async function requireEditor(){return requireWorkspace()}
export async function requireBudgetAccess(){return requireWorkspace()}

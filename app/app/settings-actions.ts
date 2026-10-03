"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireWorkspace } from "@/lib/workspace";
import { clearAdminWorkspace,getAdminSession,revokeLicenseSession } from "@/lib/session";
import { recordActivity } from "@/lib/activity";
const text=(f:FormData,k:string)=>String(f.get(k)||"").trim();const num=(f:FormData,k:string)=>Math.max(0,Number(f.get(k)||0));
export async function updateWeddingSettings(f:FormData){
 const{db,wedding,session}=await requireWorkspace();const one=text(f,"couple_one_name"),two=text(f,"couple_two_name"),date=text(f,"wedding_date");if(!one||!two||!date)return;
 const style=text(f,"planning_style");if(!["couple","family","couple_wo","wo"].includes(style))return;
 await db`UPDATE weddings SET couple_one_name=${one},couple_two_name=${two},wedding_date=${date},city=${text(f,"city")||null},guest_target=${Math.min(5000,num(f,"guest_target"))},planning_style=${style},updated_at=now() WHERE id=${wedding.id}`;
 await recordActivity(db,wedding.id,session.user.id,"wedding_settings_updated","wedding",wedding.id,{coupleOne:one,coupleTwo:two,date});revalidatePath("/app");
}
export async function signOut(){
 if(await getAdminSession()){await clearAdminWorkspace();redirect("/admin")}
 await revokeLicenseSession();redirect("/");
}

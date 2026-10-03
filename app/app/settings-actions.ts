"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireWorkspace } from "@/lib/workspace";
import { clearAdminWorkspace,getAdminSession,revokeLicenseSession } from "@/lib/session";
import { recordActivity } from "@/lib/activity";
import { deleteStorageObject,headStorageObject,MAX_FILE_BYTES } from "@/lib/storage";

const text=(f:FormData,k:string)=>String(f.get(k)||"").trim();
const num=(f:FormData,k:string)=>Math.max(0,Number(f.get(k)||0));
const clamp=(n:number,min:number,max:number)=>Math.min(max,Math.max(min,n));

export async function updateWeddingSettings(f:FormData){
 const{db,wedding,session}=await requireWorkspace();const one=text(f,"couple_one_name"),two=text(f,"couple_two_name"),date=text(f,"wedding_date");if(!one||!two||!date)return;
 const style=text(f,"planning_style");if(!["couple","family","couple_wo","wo"].includes(style))return;
 const coverStyle=text(f,"cover_style")||"full",coverPositionY=clamp(Number(f.get("cover_position_y")||50),0,100),coverOverlay=clamp(Number(f.get("cover_overlay")||0.48),0.18,0.78);
 const safeCoverStyle=["full","soft","minimal"].includes(coverStyle)?coverStyle:"full";
 await db`UPDATE weddings SET couple_one_name=${one},couple_two_name=${two},wedding_date=${date},city=${text(f,"city")||null},guest_target=${Math.min(5000,num(f,"guest_target"))},planning_style=${style},cover_position_y=${coverPositionY},cover_overlay=${coverOverlay},cover_style=${safeCoverStyle},updated_at=now() WHERE id=${wedding.id}`;
 await recordActivity(db,wedding.id,session.user.id,"wedding_settings_updated","wedding",wedding.id,{coupleOne:one,coupleTwo:two,date,coverPositionY,coverOverlay,safeCoverStyle});revalidatePath("/app");
}

export async function registerCoverPhoto(input:{objectKey:string;contentType:string;size:number}){
 const{db,wedding,session}=await requireWorkspace();
 const key=String(input.objectKey||""),type=String(input.contentType||""),size=Number(input.size||0);
 if(!key.startsWith(`weddings/${wedding.id}/cover/`)||!["image/jpeg","image/png","image/webp"].includes(type)||size<=0||size>MAX_FILE_BYTES)throw new Error("Invalid cover");
 const actual=await headStorageObject(key);if(actual!==size)throw new Error("Uploaded cover mismatch");
 const rows=await db`SELECT cover_object_key FROM weddings WHERE id=${wedding.id} LIMIT 1`,old=String(rows[0]?.cover_object_key||"");
 await db`UPDATE weddings SET cover_object_key=${key},updated_at=now() WHERE id=${wedding.id}`;
 if(old&&old!==key)await deleteStorageObject(old).catch(()=>{});
 await recordActivity(db,wedding.id,session.user.id,"cover_photo_updated","wedding",wedding.id,{contentType:type,size});
 revalidatePath("/app");
}

export async function removeCoverPhoto(){
 const{db,wedding,session}=await requireWorkspace();
 const rows=await db`SELECT cover_object_key FROM weddings WHERE id=${wedding.id} LIMIT 1`,old=String(rows[0]?.cover_object_key||"");
 await db`UPDATE weddings SET cover_object_key=null,updated_at=now() WHERE id=${wedding.id}`;
 if(old)await deleteStorageObject(old).catch(()=>{});
 await recordActivity(db,wedding.id,session.user.id,"cover_photo_removed","wedding",wedding.id,{});
 revalidatePath("/app");
}

export async function signOut(){
 if(await getAdminSession()){await clearAdminWorkspace();redirect("/admin")}
 await revokeLicenseSession();redirect("/");
}

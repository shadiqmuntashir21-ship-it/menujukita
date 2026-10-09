"use server";
import {revalidatePath} from "next/cache";
import {requireEditor} from "@/lib/workspace";
import {recordActivity} from "@/lib/activity";
const val=(f:FormData,k:string,n=200)=>String(f.get(k)||"").trim().slice(0,n);
function fields(f:FormData){
 const title=val(f,"title",160),date=val(f,"happens_on",10),time=val(f,"starts_at",5),kind=val(f,"kind",20);
 if(!title||!/^(20\d{2})-\d{2}-\d{2}$/.test(date)||!Number.isFinite(Date.parse(date)))throw new Error("Judul dan tanggal agenda harus valid.");
 if(time&&!/^([01]\d|2[0-3]):[0-5]\d$/.test(time))throw new Error("Jam agenda tidak valid.");
 if(!["meeting","appointment","family","other"].includes(kind))throw new Error("Jenis agenda tidak valid.");
 return {title,date,time:time||null,kind,location:val(f,"location",160)||null,note:val(f,"note",500)||null};
}
export async function createAgendaEntry(f:FormData){
 const {db,wedding,session}=await requireEditor();const x=fields(f);
 const rows=await db`INSERT INTO wedding_agenda_entries(wedding_id,title,kind,happens_on,starts_at,location,note,created_by)
 VALUES(${wedding.id},${x.title},${x.kind},${x.date},${x.time},${x.location},${x.note},${session.user.id}) RETURNING id`;
 await recordActivity(db,wedding.id,session.user.id,"agenda_created","agenda",String(rows[0].id),{title:x.title,date:x.date});
 revalidatePath("/app");
}
export async function editAgendaEntry(f:FormData){
 const {db,wedding,session}=await requireEditor();const x=fields(f),id=val(f,"id",50);
 const rows=await db`UPDATE wedding_agenda_entries SET title=${x.title},kind=${x.kind},happens_on=${x.date},starts_at=${x.time},location=${x.location},note=${x.note},updated_at=now()
 WHERE id=${id} AND wedding_id=${wedding.id} RETURNING id`;
 if(rows[0])await recordActivity(db,wedding.id,session.user.id,"agenda_updated","agenda",id,{title:x.title});
 revalidatePath("/app");
}
export async function removeAgendaEntry(f:FormData){
 const {db,wedding,session}=await requireEditor(),id=val(f,"id",50);
 const rows=await db`DELETE FROM wedding_agenda_entries WHERE id=${id} AND wedding_id=${wedding.id} RETURNING title`;
 if(rows[0])await recordActivity(db,wedding.id,session.user.id,"agenda_removed","agenda",id,{title:rows[0].title});
 revalidatePath("/app");
}

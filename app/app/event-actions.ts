"use server";
import {revalidatePath} from "next/cache";
import {requireEditor} from "@/lib/workspace";
import {recordActivity} from "@/lib/activity";
const field=(f:FormData,k:string,max=180)=>String(f.get(k)||"").trim().slice(0,max);
const isDate=(v:string)=>!v||(/^\d{4}-\d{2}-\d{2}$/.test(v)&&Number.isFinite(Date.parse(v)));
const isTime=(v:string)=>!v||/^([01]\d|2[0-3]):[0-5]\d$/.test(v);
export async function saveWeddingEvent(f:FormData){
 const{db,wedding,session}=await requireEditor();
 const id=field(f,"id",60),type=field(f,"event_type",30),name=field(f,"name",160),date=field(f,"event_date",10),start=field(f,"start_time",5),end=field(f,"end_time",5),location=field(f,"location",220),map=field(f,"map_url",900),publicFlag=field(f,"is_public",5)==="yes";
 if(!name||!isDate(date)||!isTime(start)||!isTime(end)||!["ceremony","reception","other"].includes(type))throw Error("Periksa nama dan waktu acara.");
 if(map){try{const url=new URL(map);if(url.protocol!=="https:")throw Error()}catch{throw Error("Tautan peta harus HTTPS.")}}
 if(id){
  const result=await db`UPDATE wedding_events SET event_type=${type},name=${name},event_date=${date||null},start_time=${start||null},end_time=${end||null},location=${location||null},map_url=${map||null},is_public=${publicFlag},updated_at=now()
 WHERE wedding_id=${wedding.id} AND id=${id} RETURNING id`;
  if(!result[0])throw Error("Acara tidak ditemukan.");
  await recordActivity(db,wedding.id,session.user.id,"wedding_event_updated","event",id,{name});
 }else{
  const [ct]=await db`SELECT COUNT(*)::int count FROM wedding_events WHERE wedding_id=${wedding.id}`;if(Number(ct.count)>=12)throw Error("Maksimal 12 acara.");
  const result=await db`INSERT INTO wedding_events(wedding_id,event_type,name,event_date,start_time,end_time,location,map_url,is_public,sort_order)
 VALUES(${wedding.id},${type},${name},${date||null},${start||null},${end||null},${location||null},${map||null},${publicFlag},${Number(ct.count)}) RETURNING id`;
  await recordActivity(db,wedding.id,session.user.id,"wedding_event_added","event",String(result[0].id),{name});
 }
 revalidatePath("/app");
}
export async function deleteWeddingEvent(f:FormData){
 const{db,wedding,session}=await requireEditor(),id=field(f,"id",60);
 const rows=await db`DELETE FROM wedding_events WHERE wedding_id=${wedding.id} AND id=${id} RETURNING name`;
 if(rows[0])await recordActivity(db,wedding.id,session.user.id,"wedding_event_deleted","event",id,{name:rows[0].name});
 revalidatePath("/app");
}

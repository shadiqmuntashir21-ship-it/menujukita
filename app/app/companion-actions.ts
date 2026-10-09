"use server";
import {revalidatePath} from "next/cache";
import {requireEditor} from "@/lib/workspace";
import {recordActivity} from "@/lib/activity";
const s=(f:FormData,k:string,max=500)=>String(f.get(k)||"").trim().slice(0,max);
const money=(f:FormData,k:string)=>{const raw=s(f,k,50).replace(/[^0-9]/g,"");const v=Number(raw||0);if(!Number.isSafeInteger(v)||v<0||v>1000000000000)throw Error("Nominal tidak valid");return v};
const qty=(f:FormData)=>Math.max(1,Math.min(1000,Math.trunc(Number(s(f,"quantity",6))||1)));
const allowedUrl=(x:string)=>{if(!x)return null;try{const u=new URL(x);if(u.protocol!=="https:")throw Error();return u.toString()}catch{throw Error("Gunakan tautan HTTPS yang valid.")}};
export async function saveWeddingConcept(f:FormData){
 const{db,wedding,session}=await requireEditor();
 const theme=s(f,"theme_name",120),palette=s(f,"palette",120),dress=s(f,"dress_code",120),notes=s(f,"notes",1200);
 await db`INSERT INTO wedding_concepts(wedding_id,theme_name,palette,dress_code,notes,updated_by)
 VALUES(${wedding.id},${theme},${palette},${dress},${notes},${session.user.id})
 ON CONFLICT(wedding_id) DO UPDATE SET theme_name=EXCLUDED.theme_name,palette=EXCLUDED.palette,dress_code=EXCLUDED.dress_code,notes=EXCLUDED.notes,updated_by=EXCLUDED.updated_by,updated_at=now()`;
 await recordActivity(db,wedding.id,session.user.id,"concept_updated","concept",wedding.id,{theme});
 revalidatePath("/app");
}
export async function addWeddingInspiration(f:FormData){
 const{db,wedding,session}=await requireEditor(),title=s(f,"title",150);if(!title)throw Error("Nama inspirasi wajib diisi.");
 const image=allowedUrl(s(f,"image_url",800)),reference=allowedUrl(s(f,"reference_url",800));
 const [count]=await db`SELECT COUNT(*)::int count FROM wedding_inspirations WHERE wedding_id=${wedding.id}`;
 if(Number(count.count)>=60)throw Error("Maksimal 60 inspirasi.");
 const rows=await db`INSERT INTO wedding_inspirations(wedding_id,title,image_url,reference_url,note,created_by) VALUES(${wedding.id},${title},${image},${reference},${s(f,"note",500)||null},${session.user.id}) RETURNING id`;
 await recordActivity(db,wedding.id,session.user.id,"inspiration_added","inspiration",String(rows[0].id),{title});revalidatePath("/app");
}
export async function deleteWeddingInspiration(f:FormData){
 const{db,wedding,session}=await requireEditor(),id=s(f,"id",60);
 const rows=await db`DELETE FROM wedding_inspirations WHERE id=${id} AND wedding_id=${wedding.id} RETURNING title`;
 if(rows[0])await recordActivity(db,wedding.id,session.user.id,"inspiration_deleted","inspiration",id,{title:rows[0].title});
 revalidatePath("/app");
}
export async function saveWeddingGift(f:FormData){
 const{db,wedding,session}=await requireEditor(),id=s(f,"id",60),name=s(f,"name",160);
 if(!name)throw Error("Nama barang wajib diisi.");
 const quantity=qty(f),estimated=money(f,"estimated_amount"),actual=money(f,"actual_amount"),store=s(f,"store",160),notes=s(f,"notes",500),purchased=s(f,"purchased")==="yes";
 if(id){
  const rows=await db`UPDATE wedding_gifts SET name=${name},quantity=${quantity},estimated_amount=${estimated},actual_amount=${actual},store=${store||null},notes=${notes||null},purchased=${purchased},updated_at=now() WHERE id=${id} AND wedding_id=${wedding.id} RETURNING id`;
  if(!rows[0])throw Error("Barang tidak ditemukan.");
  await recordActivity(db,wedding.id,session.user.id,"gift_updated","gift",id,{name,purchased});
 }else{
  const [count]=await db`SELECT COUNT(*)::int count FROM wedding_gifts WHERE wedding_id=${wedding.id}`;if(Number(count.count)>=150)throw Error("Daftar seserahan maksimal 150 item.");
  const rows=await db`INSERT INTO wedding_gifts(wedding_id,name,quantity,estimated_amount,actual_amount,purchased,store,notes,created_by)
  VALUES(${wedding.id},${name},${quantity},${estimated},${actual},${purchased},${store||null},${notes||null},${session.user.id}) RETURNING id`;
  await recordActivity(db,wedding.id,session.user.id,"gift_created","gift",String(rows[0].id),{name});
 }
 revalidatePath("/app");
}
export async function deleteWeddingGift(f:FormData){
 const{db,wedding,session}=await requireEditor(),id=s(f,"id",60);
 const rows=await db`DELETE FROM wedding_gifts WHERE id=${id} AND wedding_id=${wedding.id} RETURNING name`;
 if(rows[0])await recordActivity(db,wedding.id,session.user.id,"gift_deleted","gift",id,{name:rows[0].name});
 revalidatePath("/app");
}
export async function saveWeddingDecision(f:FormData){
 const{db,wedding,session}=await requireEditor(),id=s(f,"id",60),title=s(f,"title",160),context=s(f,"context",1000),resolution=s(f,"resolution",500),status=s(f,"status",20)||"discussing";
 if(!title||!["discussing","waiting_partner","agreed","cancelled"].includes(status))throw Error("Keputusan tidak valid.");
 if(id){
  const rows=await db`UPDATE wedding_decisions SET title=${title},context=${context||null},resolution=${resolution||null},status=${status},decided_by=CASE WHEN ${status}='agreed' THEN ${session.user.id} ELSE NULL END,updated_at=now() WHERE id=${id} AND wedding_id=${wedding.id} RETURNING id`;
  if(!rows[0])throw Error("Topik diskusi tidak ditemukan.");
  await recordActivity(db,wedding.id,session.user.id,"decision_updated","decision",id,{title,status});
 }else{
  const [count]=await db`SELECT COUNT(*)::int count FROM wedding_decisions WHERE wedding_id=${wedding.id}`;if(Number(count.count)>=100)throw Error("Maksimal 100 topik diskusi.");
  const rows=await db`INSERT INTO wedding_decisions(wedding_id,title,context,status,resolution,created_by,decided_by)
 VALUES(${wedding.id},${title},${context||null},${status},${resolution||null},${session.user.id},${status==='agreed'?session.user.id:null}) RETURNING id`;
  await recordActivity(db,wedding.id,session.user.id,"decision_created","decision",String(rows[0].id),{title});
 }
 revalidatePath("/app");
}
export async function addWeddingDecisionComment(f:FormData){
 const{db,wedding,session}=await requireEditor(),id=s(f,"decision_id",60),body=s(f,"body",1000);
 if(!body)throw Error("Isi komentar belum ditulis.");
 const rows=await db`INSERT INTO wedding_decision_comments(wedding_id,decision_id,author_id,author_name,body)
 SELECT ${wedding.id},d.id,${session.user.id},${session.user.name||"Pasangan"},${body}
 FROM wedding_decisions d WHERE d.id=${id} AND d.wedding_id=${wedding.id} RETURNING id`;
 if(!rows[0])throw Error("Diskusi tidak ditemukan.");
 await recordActivity(db,wedding.id,session.user.id,"decision_comment_added","decision",id,{});
 revalidatePath("/app");
}
export async function deleteWeddingDecision(f:FormData){
 const{db,wedding,session}=await requireEditor(),id=s(f,"id",60);
 const rows=await db`DELETE FROM wedding_decisions WHERE id=${id} AND wedding_id=${wedding.id} RETURNING title`;
 if(rows[0])await recordActivity(db,wedding.id,session.user.id,"decision_deleted","decision",id,{title:rows[0].title});
 revalidatePath("/app");
}

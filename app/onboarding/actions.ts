"use server";
import crypto from "node:crypto";
import { redirect } from "next/navigation";
import { sql } from "@/lib/db";
import { getLicenseSession,logAccess } from "@/lib/session";
import { ensureCommerceSchema } from "@/lib/commerce";
import {templateTasks} from "@/lib/wedding-guides";

const slugify=(v:string)=>v.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,45);

export async function activateWedding(f:FormData){
 const lic:any=await getLicenseSession();if(!lic)redirect("/auth/sign-in");if(lic.wedding_id)redirect("/app");if(lic.status!=="unused")redirect("/license-status");
 const one=String(f.get("one")||"").trim(),two=String(f.get("two")||"").trim();
 const dateInput=String(f.get("date")||"").trim();
 const weddingDate=/^\d{4}-\d{2}-\d{2}$/.test(dateInput)&&Number.isFinite(Date.parse(dateInput))?dateInput:null;
 if(!one||!two)redirect("/onboarding?error=data");
 const budget=Math.max(0,Number(f.get("budget")||0)),guests=Math.max(0,Math.min(5000,Number(f.get("guests")||0))),city=String(f.get("city")||"").trim(),planningStyle=String(f.get("planning_style")||"couple");
 const db=sql();await ensureCommerceSchema(db);
 const weddingId=crypto.randomUUID(),actorId=`license:${lic.license_id}`,slug=slugify(one+"-"+two)+"-"+weddingId.slice(0,6);
 const taskTemplates=templateTasks(planningStyle,weddingDate);
 const categories=["Venue","Catering","Decoration","Documentation","Attire","Makeup","Wedding Organizer","Entertainment","Invitation","Souvenir","Transportation","Accommodation","Ceremony / Adat","Miscellaneous"];
 const tx:any[]=[
  db`INSERT INTO weddings(id,owner_auth_user_id,couple_one_name,couple_two_name,wedding_date,city,budget_total,available_funds,reserve_buffer,guest_target,planning_style,slug) VALUES(${weddingId},${actorId},${one},${two},${weddingDate},${city||null},${budget},0,${Math.round(budget*0.05)},${guests},${planningStyle},${slug})`,
  db`INSERT INTO wedding_members(wedding_id,auth_user_id,display_name,role,can_view_budget,status,joined_at) VALUES(${weddingId},${actorId},${one+" & "+two},'owner',true,'active',now())`,
  db`UPDATE licenses SET status='active',wedding_id=${weddingId},activated_by_auth_user_id=${actorId},activated_at=now(),updated_at=now() WHERE id=${lic.license_id} AND status='unused' AND wedding_id IS NULL`,
  db`INSERT INTO wedding_events(wedding_id,event_type,name,event_date,start_time,sort_order) VALUES(${weddingId},'ceremony',${String(f.get("ceremony_name")||"Akad / Pemberkatan")},${weddingDate},'09:00',0)`,
  db`INSERT INTO wedding_events(wedding_id,event_type,name,event_date,start_time,sort_order) VALUES(${weddingId},'reception',${String(f.get("reception_name")||"Resepsi")},${weddingDate},'12:00',1)`,
  db`INSERT INTO activity_logs(wedding_id,auth_user_id,action,entity_type,entity_id,metadata) VALUES(${weddingId},${actorId},'workspace_activated','wedding',${weddingId},'{"source":"license_onboarding"}'::jsonb)`,
  db`UPDATE orders SET status='completed',completed_at=now(),updated_at=now() WHERE license_id=${lic.license_id}`
 ];
 taskTemplates.forEach((task,i)=>tx.push(db`INSERT INTO tasks(wedding_id,title,description,category,due_date,priority,status,sort_order) VALUES(${weddingId},${task.title},${'Panduan: '+task.guideId},${task.category},${task.dueDate},${task.priority},'todo',${i})`));
 categories.forEach((name,i)=>tx.push(db`INSERT INTO budget_categories(wedding_id,name,sort_order) VALUES(${weddingId},${name},${i})`));
 try{
  await db.transaction(tx,{isolationLevel:"Serializable"});
  const orderRows=await db`SELECT id FROM orders WHERE license_id=${lic.license_id} LIMIT 1`;
  if(orderRows[0])await db`INSERT INTO order_activity(order_id,event,metadata) VALUES(${orderRows[0].id},'order_completed',${JSON.stringify({weddingId})}::jsonb)`;
  await logAccess({actorType:"license",licenseId:String(lic.license_id),event:"workspace_activated",metadata:{weddingId}});
 }catch(e){
  console.error("activation failed",e);redirect("/onboarding?error=activation")
 }
 redirect("/app");
}

"use server";

import crypto from "node:crypto";
import { auth } from "@/lib/auth/server";
import { sql } from "@/lib/db";
import { redirect } from "next/navigation";

const hash=(v:string)=>crypto.createHash("sha256").update(v.trim().toUpperCase()).digest("hex");
const slugify=(v:string)=>v.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,45);
const iso=(d:Date)=>d.toISOString().slice(0,10);
const minusDays=(base:string,days:number)=>{const d=new Date(base+"T12:00:00Z");d.setUTCDate(d.getUTCDate()-days);return iso(d)};

export async function activateWedding(f:FormData){
  const {data:s}=await auth.getSession(); if(!s?.user) redirect("/auth/sign-in");
  const code=String(f.get("license")||""),one=String(f.get("one")||"").trim(),two=String(f.get("two")||"").trim();
  const weddingDate=String(f.get("date")||""),budget=Math.max(0,Number(f.get("budget")||0)),guests=Math.max(0,Number(f.get("guests")||0));
  const city=String(f.get("city")||"").trim(),planningStyle=String(f.get("planning_style")||"couple");
  if(!one||!two||!weddingDate) redirect("/onboarding?error=data");
  const db=sql();

  const existing=await db`SELECT w.id FROM weddings w JOIN wedding_members m ON m.wedding_id=w.id WHERE m.auth_user_id=${s.user.id} AND w.status='active' AND m.status='active' LIMIT 1`;
  if(existing[0]) redirect("/app");

  const lic=await db`SELECT id,status FROM licenses WHERE code_hash=${hash(code)} LIMIT 1`;
  if(!lic[0]||lic[0].status!=="unused") redirect("/onboarding?error=license");

  const weddingId=crypto.randomUUID(),slug=slugify(one+"-"+two)+"-"+weddingId.slice(0,6);
  const taskTemplates=[
    ["Tentukan estimasi tamu awal","Guest",240,"high"],
    ["Booking venue","Venue",210,"critical"],
    ["Booking catering","Catering",180,"critical"],
    ["Booking fotografer/videografer","Documentation",180,"high"],
    ["Finalisasi konsep dekorasi","Decoration",120,"high"],
    ["Finalisasi busana & fitting","Attire",90,"high"],
    ["Finalisasi desain undangan","Invitation",75,"medium"],
    ["Mulai konfirmasi guest list","Guest",60,"high"],
    ["Finalisasi jumlah tamu ke catering","Guest",21,"critical"],
    ["Konfirmasi seluruh vendor","Vendor",7,"critical"],
    ["Siapkan emergency kit & dokumen penting","Day-H",2,"high"],
    ["Briefing final hari H","Day-H",1,"critical"]
  ] as const;
  const budgetCategories=["Venue","Catering","Decoration","Documentation","Attire","Makeup","Wedding Organizer","Entertainment","Invitation","Souvenir","Transportation","Accommodation","Ceremony / Adat","Miscellaneous"];

  const tx:any[]=[
    db`UPDATE licenses SET status='active',activated_by_auth_user_id=${s.user.id},activated_at=now(),updated_at=now()
       WHERE id=${lic[0].id} AND status='unused'`,
    db`INSERT INTO weddings(id,owner_auth_user_id,couple_one_name,couple_two_name,wedding_date,city,budget_total,available_funds,reserve_buffer,guest_target,planning_style,slug)
       SELECT ${weddingId},${s.user.id},${one},${two},${weddingDate},${city||null},${budget},${budget},${Math.round(budget*0.05)},${guests},${planningStyle},${slug}
       FROM licenses WHERE id=${lic[0].id} AND status='active' AND activated_by_auth_user_id=${s.user.id} AND wedding_id IS NULL`,
    db`INSERT INTO wedding_members(wedding_id,auth_user_id,display_name,role,can_view_budget,status,joined_at)
       VALUES(${weddingId},${s.user.id},${s.user.name||one},'owner',true,'active',now())`,
    db`UPDATE licenses SET wedding_id=${weddingId},updated_at=now()
       WHERE id=${lic[0].id} AND activated_by_auth_user_id=${s.user.id} AND wedding_id IS NULL`,
    db`INSERT INTO wedding_events(wedding_id,event_type,name,event_date,start_time,sort_order)
       VALUES(${weddingId},'ceremony',${String(f.get("ceremony_name")||"Akad / Pemberkatan")},${weddingDate},'09:00',0)`,
    db`INSERT INTO wedding_events(wedding_id,event_type,name,event_date,start_time,sort_order)
       VALUES(${weddingId},'reception',${String(f.get("reception_name")||"Resepsi")},${weddingDate},'12:00',1)`,
    db`INSERT INTO activity_logs(wedding_id,auth_user_id,action,entity_type,entity_id,metadata)
       VALUES(${weddingId},${s.user.id},'workspace_activated','wedding',${weddingId},'{"source":"onboarding"}'::jsonb)`
  ];
  taskTemplates.forEach(([title,category,days,priority],i)=>tx.push(db`INSERT INTO tasks(wedding_id,title,category,due_date,priority,status,sort_order)
    VALUES(${weddingId},${title},${category},${minusDays(weddingDate,days)},${priority},'todo',${i})`));
  budgetCategories.forEach((name,i)=>tx.push(db`INSERT INTO budget_categories(wedding_id,name,sort_order) VALUES(${weddingId},${name},${i})`));

  try{await db.transaction(tx,{isolationLevel:"Serializable"});}catch(e){console.error("activation failed",e);redirect("/onboarding?error=activation")}
  redirect("/app");
}

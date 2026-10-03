"use server";
import crypto from "node:crypto";
import { auth } from "@/lib/auth/server";
import { sql } from "@/lib/db";
import { redirect } from "next/navigation";

const hash=(v:string)=>crypto.createHash("sha256").update(v.trim().toUpperCase()).digest("hex");
const slugify=(v:string)=>v.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,45);
const isoBefore=(date:string,days:number)=>{const d=new Date(date+"T00:00:00Z");d.setUTCDate(d.getUTCDate()-days);return d.toISOString().slice(0,10)};

export async function activateWedding(f:FormData){
  const {data:s}=await auth.getSession();
  if(!s?.user) redirect("/auth/sign-in");
  const code=String(f.get("license")||"");
  const one=String(f.get("one")||"").trim();
  const two=String(f.get("two")||"").trim();
  const date=String(f.get("date")||"");
  const budget=Math.max(0,Number(f.get("budget")||0));
  const guests=Math.max(0,Number(f.get("guests")||0));
  const db=sql();

  const existing=await db`SELECT w.id FROM weddings w JOIN wedding_members m ON m.wedding_id=w.id WHERE m.auth_user_id=${s.user.id} AND w.status='active' AND m.status='active' LIMIT 1`;
  if(existing[0]) redirect("/app");

  const lic=await db`SELECT id,status FROM licenses WHERE code_hash=${hash(code)} LIMIT 1`;
  if(!lic[0]||lic[0].status!=="unused") redirect("/onboarding?error=license");

  const weddingId=crypto.randomUUID();
  const slug=slugify(one+"-"+two)+"-"+weddingId.slice(0,6);
  const categories=["Venue","Catering","Decoration","Documentation","Attire","Makeup","Invitation","Souvenir"];
  const tasks=[
    ["Tentukan konsep dan skala wedding","planning",180,"high"],
    ["Finalisasi estimasi budget","money",170,"high"],
    ["Susun draft guest list","guest",160,"high"],
    ["Booking venue","vendor",150,"critical"],
    ["Booking catering","vendor",120,"critical"],
    ["Booking dokumentasi","vendor",105,"high"],
    ["Finalisasi dekorasi","vendor",75,"high"],
    ["Finalisasi undangan","guest",60,"medium"],
    ["Konfirmasi jumlah tamu","guest",21,"high"],
    ["Technical meeting semua vendor","vendor",7,"critical"],
    ["Final check pembayaran vendor","money",3,"critical"],
    ["Siapkan rundown hari H","planning",2,"critical"]
  ] as const;

  const statements:any[]=[
    db`INSERT INTO weddings(id,owner_auth_user_id,couple_one_name,couple_two_name,wedding_date,budget_total,available_funds,reserve_buffer,guest_target,slug)
       VALUES(${weddingId},${s.user.id},${one},${two},${date},${budget},${budget},${Math.round(budget*0.05)},${guests},${slug})`,
    db`INSERT INTO wedding_members(wedding_id,auth_user_id,display_name,role,can_view_budget,status,joined_at)
       VALUES(${weddingId},${s.user.id},${s.user.name||one},'owner',true,'active',now())`,
    db`INSERT INTO wedding_events(wedding_id,event_type,name,event_date,sort_order) VALUES(${weddingId},'ceremony','Akad / Pemberkatan',${date},1)`,
    db`INSERT INTO wedding_events(wedding_id,event_type,name,event_date,sort_order) VALUES(${weddingId},'reception','Resepsi',${date},2)`
  ];
  categories.forEach((name,i)=>statements.push(db`INSERT INTO budget_categories(wedding_id,name,sort_order) VALUES(${weddingId},${name},${i+1})`));
  tasks.forEach(([title,category,before,priority],i)=>statements.push(db`INSERT INTO tasks(wedding_id,title,category,due_date,priority,status,sort_order) VALUES(${weddingId},${title},${category},${isoBefore(date,before)},${priority},'todo',${i+1})`));
  statements.push(db`UPDATE licenses SET status='active',wedding_id=${weddingId},activated_by_auth_user_id=${s.user.id},activated_at=now(),updated_at=now() WHERE id=${lic[0].id}`);
  statements.push(db`INSERT INTO activity_logs(wedding_id,auth_user_id,action,entity_type,entity_id,metadata) VALUES(${weddingId},${s.user.id},'workspace_activated','wedding',${weddingId},'{"source":"onboarding"}'::jsonb)`);

  await db.transaction(statements);
  redirect("/app");
}
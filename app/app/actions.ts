"use server";

import crypto from "node:crypto";
import { revalidatePath } from "next/cache";
import { requireBudgetAccess, requireEditor } from "@/lib/workspace";
import { recordActivity } from "@/lib/activity";

const text=(f:FormData,key:string)=>String(f.get(key)||"").trim();
const num=(f:FormData,key:string)=>Math.max(0,Number(f.get(key)||0));

export async function addTask(f:FormData){
  const{db,wedding,session}=await requireEditor();const title=text(f,"title");if(!title)return;
  const [quota]=await db`SELECT count(*)::int count FROM tasks WHERE wedding_id=${wedding.id}`;if(Number(quota.count)>=500)throw new Error("Task limit reached");
  const assignee=text(f,"assignee_member_id")||null;
  const rows=await db`INSERT INTO tasks(wedding_id,title,category,due_date,priority,status,assignee_member_id)
    VALUES(${wedding.id},${title},${text(f,"category")||"general"},${text(f,"due_date")||null},${text(f,"priority")||"medium"},'todo',${assignee}) RETURNING id`;
  await recordActivity(db,wedding.id,session.user.id,"task_created","task",String(rows[0]?.id||""),{title});
  revalidatePath("/app");
}
export async function toggleTask(f:FormData){
  const{db,wedding,session}=await requireEditor();const id=text(f,"id");
  const rows=await db`UPDATE tasks SET status=CASE WHEN status='done' THEN 'todo' ELSE 'done' END,
    completed_at=CASE WHEN status='done' THEN NULL ELSE now() END,updated_at=now()
    WHERE id=${id} AND wedding_id=${wedding.id} RETURNING title,status`;
  if(rows[0])await recordActivity(db,wedding.id,session.user.id,"task_toggled","task",id,{title:rows[0].title,status:rows[0].status});
  revalidatePath("/app");
}
export async function assignTask(f:FormData){
  const{db,wedding,session}=await requireEditor();
  const id=text(f,"id"),memberId=text(f,"assignee_member_id")||null;
  if(memberId){
    const ok=await db`SELECT display_name FROM wedding_members WHERE id=${memberId} AND wedding_id=${wedding.id} AND status='active' LIMIT 1`;
    if(!ok[0])throw new Error("Invalid assignee");
  }
  const rows=await db`UPDATE tasks SET assignee_member_id=${memberId},updated_at=now() WHERE id=${id} AND wedding_id=${wedding.id} RETURNING title`;
  if(rows[0])await recordActivity(db,wedding.id,session.user.id,"task_assigned","task",id,{title:rows[0].title,memberId});
  revalidatePath("/app");
}

export async function deleteTask(f:FormData){
  const{db,wedding,session}=await requireEditor();const id=text(f,"id");
  const rows=await db`DELETE FROM tasks WHERE id=${id} AND wedding_id=${wedding.id} RETURNING title`;
  if(rows[0])await recordActivity(db,wedding.id,session.user.id,"task_deleted","task",id,{title:rows[0].title});
  revalidatePath("/app");
}

export async function addVendor(f:FormData){
  const{db,wedding,session}=await requireEditor();const name=text(f,"name");if(!name)return;
  const [quota]=await db`SELECT count(*)::int count FROM vendors WHERE wedding_id=${wedding.id}`;if(Number(quota.count)>=100)throw new Error("Vendor limit reached");
  const rows=await db`INSERT INTO vendors(wedding_id,category,name,pic_name,whatsapp,instagram,quoted_price,agreed_price,status,notes)
    VALUES(${wedding.id},${text(f,"category")||"Other"},${name},${text(f,"pic_name")||null},${text(f,"whatsapp")||null},${text(f,"instagram")||null},${num(f,"quoted_price")},${num(f,"agreed_price")},${text(f,"status")||"searching"},${text(f,"notes")||null}) RETURNING id,status`;
  await recordActivity(db,wedding.id,session.user.id,"vendor_created","vendor",String(rows[0]?.id||""),{name,status:rows[0]?.status});
  revalidatePath("/app");
}
export async function updateVendorStatus(f:FormData){
  const{db,wedding,session}=await requireEditor();const status=text(f,"status"),id=text(f,"id");
  if(!["searching","shortlisted","contacted","negotiating","booked","completed","cancelled"].includes(status))return;
  const rows=await db`UPDATE vendors SET status=${status},updated_at=now() WHERE id=${id} AND wedding_id=${wedding.id} RETURNING name,status`;
  if(rows[0])await recordActivity(db,wedding.id,session.user.id,"vendor_status_changed","vendor",id,{name:rows[0].name,status});
  revalidatePath("/app");
}
export async function deleteVendor(f:FormData){
  const{db,wedding,session}=await requireEditor();const id=text(f,"id");
  const rows=await db`DELETE FROM vendors WHERE id=${id} AND wedding_id=${wedding.id} RETURNING name`;
  if(rows[0])await recordActivity(db,wedding.id,session.user.id,"vendor_deleted","vendor",id,{name:rows[0].name});
  revalidatePath("/app");
}

export async function addBudgetItem(f:FormData){
  const{db,wedding,session}=await requireBudgetAccess();const name=text(f,"name");if(!name)return;
  const vendorId=text(f,"vendor_id")||null;
  const rows=await db`INSERT INTO budget_items(wedding_id,vendor_id,name,planned_amount,actual_amount,paid_amount,due_date,notes)
    VALUES(${wedding.id},${vendorId},${name},${num(f,"planned_amount")},${num(f,"actual_amount")},${num(f,"paid_amount")},${text(f,"due_date")||null},${text(f,"notes")||null}) RETURNING id`;
  await recordActivity(db,wedding.id,session.user.id,"budget_item_created","budget",String(rows[0]?.id||""),{name});
  revalidatePath("/app");
}
export async function deleteBudgetItem(f:FormData){
  const{db,wedding,session}=await requireBudgetAccess();const id=text(f,"id");
  const rows=await db`DELETE FROM budget_items WHERE id=${id} AND wedding_id=${wedding.id} RETURNING name`;
  if(rows[0])await recordActivity(db,wedding.id,session.user.id,"budget_item_deleted","budget",id,{name:rows[0].name});
  revalidatePath("/app");
}
export async function updateFunds(f:FormData){
  const{db,wedding,session}=await requireBudgetAccess();
  const budgetTotal=num(f,"budget_total"),availableFunds=num(f,"available_funds"),reserveBuffer=num(f,"reserve_buffer");
  await db`UPDATE weddings SET budget_total=${budgetTotal},available_funds=${availableFunds},reserve_buffer=${reserveBuffer},updated_at=now() WHERE id=${wedding.id}`;
  await recordActivity(db,wedding.id,session.user.id,"funds_updated","budget",wedding.id,{budgetTotal,availableFunds,reserveBuffer});
  revalidatePath("/app");
}

export async function addPayment(f:FormData){
  const{db,wedding,session}=await requireBudgetAccess();const description=text(f,"description");if(!description)return;
  const amount=Math.max(1,num(f,"amount"));
  const rows=await db`INSERT INTO payments(wedding_id,vendor_id,description,amount,due_date,status,notes)
    VALUES(${wedding.id},${text(f,"vendor_id")||null},${description},${amount},${text(f,"due_date")||null},'upcoming',${text(f,"notes")||null}) RETURNING id`;
  await recordActivity(db,wedding.id,session.user.id,"payment_created","payment",String(rows[0]?.id||""),{description,amount});
  revalidatePath("/app");
}
export async function markPaymentPaid(f:FormData){
  const{db,wedding,session}=await requireBudgetAccess();const id=text(f,"id");
  const rows=await db`UPDATE payments SET status=CASE WHEN status='paid' THEN 'upcoming' ELSE 'paid' END,
    paid_at=CASE WHEN status='paid' THEN NULL ELSE now() END,updated_at=now()
    WHERE id=${id} AND wedding_id=${wedding.id} RETURNING description,status`;
  if(rows[0])await recordActivity(db,wedding.id,session.user.id,"payment_toggled","payment",id,{description:rows[0].description,status:rows[0].status});
  revalidatePath("/app");
}
export async function deletePayment(f:FormData){
  const{db,wedding,session}=await requireBudgetAccess();const id=text(f,"id");
  const rows=await db`DELETE FROM payments WHERE id=${id} AND wedding_id=${wedding.id} RETURNING description`;
  if(rows[0])await recordActivity(db,wedding.id,session.user.id,"payment_deleted","payment",id,{description:rows[0].description});
  revalidatePath("/app");
}

export async function addGuest(f:FormData){
  const{db,wedding,session}=await requireEditor();const name=text(f,"name");if(!name)return;
  const [quota]=await db`SELECT count(*)::int count FROM guests WHERE wedding_id=${wedding.id}`;if(Number(quota.count)>=1500)throw new Error("Guest limit reached");
  const partyId=crypto.randomUUID(),guestId=crypto.randomUUID(),maxPax=Math.max(1,Math.min(20,num(f,"max_pax")||1));
  await db.transaction([
    db`INSERT INTO guest_parties(id,wedding_id,party_name,side,group_name,max_pax)
      VALUES(${partyId},${wedding.id},${name},${text(f,"side")||"other"},${text(f,"group_name")||"Other"},${maxPax})`,
    db`INSERT INTO guests(id,wedding_id,party_id,name,phone,invitation_quantity,expected_pax,rsvp_status)
      VALUES(${guestId},${wedding.id},${partyId},${name},${text(f,"phone")||null},${maxPax},${maxPax},'waiting')`
  ]);
  await recordActivity(db,wedding.id,session.user.id,"guest_created","guest",guestId,{name,maxPax});
  revalidatePath("/app");
}
export async function importGuests(rows:{name:string;phone?:string;group?:string;pax?:number}[]){
  const{db,wedding,session}=await requireEditor();
  const clean=rows.slice(0,500).map(r=>({
    name:String(r.name||"").trim().slice(0,160),
    phone:String(r.phone||"").trim().slice(0,40),
    group:String(r.group||"Other").trim().slice(0,80)||"Other",
    pax:Math.max(1,Math.min(20,Number(r.pax||1)))
  })).filter(r=>r.name);
  if(!clean.length)return{imported:0};
  const [quota]=await db`SELECT count(*)::int count FROM guests WHERE wedding_id=${wedding.id}`;
  if(Number(quota.count)+clean.length>1500)throw new Error("Guest limit reached");
  const statements:any[]=[];
  for(const r of clean){
    const partyId=crypto.randomUUID(),guestId=crypto.randomUUID();
    statements.push(db`INSERT INTO guest_parties(id,wedding_id,party_name,side,group_name,max_pax)
      VALUES(${partyId},${wedding.id},${r.name},'other',${r.group},${r.pax})`);
    statements.push(db`INSERT INTO guests(id,wedding_id,party_id,name,phone,invitation_quantity,expected_pax,rsvp_status)
      VALUES(${guestId},${wedding.id},${partyId},${r.name},${r.phone||null},${r.pax},${r.pax},'waiting')`);
  }
  await db.transaction(statements);
  await recordActivity(db,wedding.id,session.user.id,"guest_csv_imported","guest",null,{count:clean.length});
  revalidatePath("/app");
  return{imported:clean.length};
}

export async function setGuestRsvp(f:FormData){
  const{db,wedding,session}=await requireEditor();const status=text(f,"status"),id=text(f,"id");
  if(!["waiting","attending","not_attending","maybe"].includes(status))return;
  const rows=await db`UPDATE guests SET rsvp_status=${status},actual_pax=CASE WHEN ${status}='attending' THEN GREATEST(1,COALESCE(actual_pax,expected_pax,1)) ELSE CASE WHEN ${status}='not_attending' THEN 0 ELSE actual_pax END END,updated_at=now() WHERE id=${id} AND wedding_id=${wedding.id} RETURNING name`;
  if(rows[0])await recordActivity(db,wedding.id,session.user.id,"guest_status_changed","guest",id,{name:rows[0].name,status});
  revalidatePath("/app");
}
export async function deleteGuest(f:FormData){
  const{db,wedding,session}=await requireEditor();const id=text(f,"id");
  const rows=await db`SELECT party_id,name FROM guests WHERE id=${id} AND wedding_id=${wedding.id} LIMIT 1`;
  await db`DELETE FROM guests WHERE id=${id} AND wedding_id=${wedding.id}`;
  if(rows[0]?.party_id)await db`DELETE FROM guest_parties WHERE id=${rows[0].party_id} AND wedding_id=${wedding.id} AND NOT EXISTS(SELECT 1 FROM guests WHERE party_id=${rows[0].party_id})`;
  if(rows[0])await recordActivity(db,wedding.id,session.user.id,"guest_deleted","guest",id,{name:rows[0].name});
  revalidatePath("/app");
}

export async function addRundownItem(f:FormData){
  const{db,wedding,session}=await requireEditor();const activity=text(f,"activity"),starts=text(f,"starts_at");if(!activity||!starts)return;
  const rows=await db`INSERT INTO rundown_items(wedding_id,starts_at,activity,location,status,notes)
    VALUES(${wedding.id},${starts},${activity},${text(f,"location")||null},'upcoming',${text(f,"notes")||null}) RETURNING id`;
  await recordActivity(db,wedding.id,session.user.id,"rundown_created","rundown",String(rows[0]?.id||""),{activity});
  revalidatePath("/app");
}
export async function updateRundownStatus(f:FormData){
  const{db,wedding,session}=await requireEditor();const status=text(f,"status"),id=text(f,"id");
  if(!["upcoming","ready","in_progress","done","delayed","cancelled"].includes(status))return;
  const rows=await db`UPDATE rundown_items SET status=${status},updated_at=now() WHERE id=${id} AND wedding_id=${wedding.id} RETURNING activity`;
  if(rows[0])await recordActivity(db,wedding.id,session.user.id,"rundown_status_changed","rundown",id,{activity:rows[0].activity,status});
  revalidatePath("/app");
}
export async function deleteRundownItem(f:FormData){
  const{db,wedding,session}=await requireEditor();const id=text(f,"id");
  const rows=await db`DELETE FROM rundown_items WHERE id=${id} AND wedding_id=${wedding.id} RETURNING activity`;
  if(rows[0])await recordActivity(db,wedding.id,session.user.id,"rundown_deleted","rundown",id,{activity:rows[0].activity});
  revalidatePath("/app");
}

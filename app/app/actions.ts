"use server";

import crypto from "node:crypto";
import { revalidatePath } from "next/cache";
import { requireBudgetAccess, requireWorkspace } from "@/lib/workspace";

const text = (f: FormData, key: string) => String(f.get(key) || "").trim();
const num = (f: FormData, key: string) => Math.max(0, Number(f.get(key) || 0));

export async function addTask(f: FormData) {
  const { db, wedding } = await requireWorkspace();
  const title = text(f, "title");
  if (!title) return;
  await db`INSERT INTO tasks(wedding_id,title,category,due_date,priority,status)
    VALUES(${wedding.id},${title},${text(f,"category") || "general"},${text(f,"due_date") || null},${text(f,"priority") || "medium"},'todo')`;
  revalidatePath("/app");
}
export async function toggleTask(f: FormData) {
  const { db, wedding } = await requireWorkspace();
  const id = text(f, "id");
  await db`UPDATE tasks SET status=CASE WHEN status='done' THEN 'todo' ELSE 'done' END,
    completed_at=CASE WHEN status='done' THEN NULL ELSE now() END,updated_at=now()
    WHERE id=${id} AND wedding_id=${wedding.id}`;
  revalidatePath("/app");
}
export async function deleteTask(f: FormData) {
  const { db, wedding } = await requireWorkspace();
  await db`DELETE FROM tasks WHERE id=${text(f,"id")} AND wedding_id=${wedding.id}`;
  revalidatePath("/app");
}

export async function addVendor(f: FormData) {
  const { db, wedding } = await requireWorkspace();
  const name = text(f,"name"); if (!name) return;
  await db`INSERT INTO vendors(wedding_id,category,name,pic_name,whatsapp,instagram,quoted_price,agreed_price,status,notes)
    VALUES(${wedding.id},${text(f,"category")||"Other"},${name},${text(f,"pic_name")||null},${text(f,"whatsapp")||null},${text(f,"instagram")||null},${num(f,"quoted_price")},${num(f,"agreed_price")},${text(f,"status")||"searching"},${text(f,"notes")||null})`;
  revalidatePath("/app");
}
export async function updateVendorStatus(f: FormData) {
  const { db, wedding } = await requireWorkspace();
  const status=text(f,"status");
  if(!["searching","shortlisted","contacted","negotiating","booked","completed","cancelled"].includes(status)) return;
  await db`UPDATE vendors SET status=${status},updated_at=now() WHERE id=${text(f,"id")} AND wedding_id=${wedding.id}`;
  revalidatePath("/app");
}
export async function deleteVendor(f: FormData) {
  const { db, wedding } = await requireWorkspace();
  await db`DELETE FROM vendors WHERE id=${text(f,"id")} AND wedding_id=${wedding.id}`;
  revalidatePath("/app");
}

export async function addBudgetItem(f: FormData) {
  const { db, wedding } = await requireBudgetAccess();
  const name=text(f,"name"); if(!name)return;
  await db`INSERT INTO budget_items(wedding_id,name,planned_amount,actual_amount,paid_amount,due_date,notes)
    VALUES(${wedding.id},${name},${num(f,"planned_amount")},${num(f,"actual_amount")},${num(f,"paid_amount")},${text(f,"due_date")||null},${text(f,"notes")||null})`;
  revalidatePath("/app");
}
export async function deleteBudgetItem(f: FormData) {
  const { db, wedding } = await requireBudgetAccess();
  await db`DELETE FROM budget_items WHERE id=${text(f,"id")} AND wedding_id=${wedding.id}`;
  revalidatePath("/app");
}
export async function updateFunds(f: FormData) {
  const { db, wedding } = await requireBudgetAccess();
  await db`UPDATE weddings SET budget_total=${num(f,"budget_total")},available_funds=${num(f,"available_funds")},reserve_buffer=${num(f,"reserve_buffer")},updated_at=now() WHERE id=${wedding.id}`;
  revalidatePath("/app");
}

export async function addPayment(f: FormData) {
  const { db, wedding } = await requireBudgetAccess();
  const description=text(f,"description"); if(!description)return;
  await db`INSERT INTO payments(wedding_id,vendor_id,description,amount,due_date,status,notes)
    VALUES(${wedding.id},${text(f,"vendor_id")||null},${description},${Math.max(1,num(f,"amount"))},${text(f,"due_date")||null},'upcoming',${text(f,"notes")||null})`;
  revalidatePath("/app");
}
export async function markPaymentPaid(f: FormData) {
  const { db, wedding } = await requireBudgetAccess();
  await db`UPDATE payments SET status=CASE WHEN status='paid' THEN 'upcoming' ELSE 'paid' END,
    paid_at=CASE WHEN status='paid' THEN NULL ELSE now() END,updated_at=now()
    WHERE id=${text(f,"id")} AND wedding_id=${wedding.id}`;
  revalidatePath("/app");
}
export async function deletePayment(f: FormData) {
  const { db, wedding } = await requireBudgetAccess();
  await db`DELETE FROM payments WHERE id=${text(f,"id")} AND wedding_id=${wedding.id}`;
  revalidatePath("/app");
}

export async function addGuest(f: FormData) {
  const { db, wedding } = await requireWorkspace();
  const name=text(f,"name"); if(!name)return;
  const partyId=crypto.randomUUID();
  await db.transaction([
    db`INSERT INTO guest_parties(id,wedding_id,party_name,side,group_name,max_pax)
      VALUES(${partyId},${wedding.id},${name},${text(f,"side")||"other"},${text(f,"group_name")||"Other"},${Math.max(1,Math.min(20,num(f,"max_pax")||1))})`,
    db`INSERT INTO guests(wedding_id,party_id,name,phone,invitation_quantity,expected_pax,rsvp_status)
      VALUES(${wedding.id},${partyId},${name},${text(f,"phone")||null},${Math.max(1,Math.min(20,num(f,"max_pax")||1))},${Math.max(1,Math.min(20,num(f,"max_pax")||1))},'waiting')`
  ]);
  revalidatePath("/app");
}
export async function setGuestRsvp(f: FormData) {
  const { db, wedding } = await requireWorkspace();
  const status=text(f,"status");
  if(!["waiting","attending","not_attending","maybe"].includes(status))return;
  await db`UPDATE guests SET rsvp_status=${status},actual_pax=CASE WHEN ${status}='attending' THEN GREATEST(1,COALESCE(actual_pax,expected_pax,1)) ELSE CASE WHEN ${status}='not_attending' THEN 0 ELSE actual_pax END END,updated_at=now() WHERE id=${text(f,"id")} AND wedding_id=${wedding.id}`;
  revalidatePath("/app");
}
export async function deleteGuest(f: FormData) {
  const { db, wedding } = await requireWorkspace();
  const id=text(f,"id");
  const rows=await db`SELECT party_id FROM guests WHERE id=${id} AND wedding_id=${wedding.id} LIMIT 1`;
  await db`DELETE FROM guests WHERE id=${id} AND wedding_id=${wedding.id}`;
  if(rows[0]?.party_id) await db`DELETE FROM guest_parties WHERE id=${rows[0].party_id} AND wedding_id=${wedding.id} AND NOT EXISTS(SELECT 1 FROM guests WHERE party_id=${rows[0].party_id})`;
  revalidatePath("/app");
}

export async function addRundownItem(f: FormData) {
  const { db, wedding } = await requireWorkspace();
  const activity=text(f,"activity"),starts=text(f,"starts_at"); if(!activity||!starts)return;
  await db`INSERT INTO rundown_items(wedding_id,starts_at,activity,location,status,notes)
    VALUES(${wedding.id},${starts},${activity},${text(f,"location")||null},'upcoming',${text(f,"notes")||null})`;
  revalidatePath("/app");
}
export async function updateRundownStatus(f: FormData) {
  const { db, wedding } = await requireWorkspace();
  const status=text(f,"status");
  if(!["upcoming","ready","in_progress","done","delayed","cancelled"].includes(status)) return;
  await db`UPDATE rundown_items SET status=${status},updated_at=now() WHERE id=${text(f,"id")} AND wedding_id=${wedding.id}`;
  revalidatePath("/app");
}
export async function deleteRundownItem(f: FormData) {
  const { db, wedding } = await requireWorkspace();
  await db`DELETE FROM rundown_items WHERE id=${text(f,"id")} AND wedding_id=${wedding.id}`;
  revalidatePath("/app");
}

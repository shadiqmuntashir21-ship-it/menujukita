"use server";

import { revalidatePath } from "next/cache";
import { requireEditor } from "@/lib/workspace";
import { recordActivity } from "@/lib/activity";

const text=(f:FormData,k:string)=>String(f.get(k)||"").trim();
const int=(f:FormData,k:string)=>Math.max(0,Number.parseInt(String(f.get(k)||"0"),10)||0);

export async function addSeatingTable(f:FormData){
  const{db,wedding,session}=await requireEditor();
  const name=text(f,"name");if(!name)return;
  const capacity=Math.max(1,Math.min(100,int(f,"capacity")||10));
  const eventId=text(f,"event_id")||null;
  if(eventId){
    const ok=await db`SELECT 1 FROM wedding_events WHERE id=${eventId} AND wedding_id=${wedding.id}`;
    if(!ok[0])return;
  }
  const rows=await db`INSERT INTO seating_tables(wedding_id,event_id,name,capacity) VALUES(${wedding.id},${eventId},${name},${capacity}) RETURNING id`;
  await recordActivity(db,wedding.id,session.user.id,"seating_table_created","seating",String(rows[0]?.id||""),{name,capacity});
  revalidatePath("/app");
}

export async function deleteSeatingTable(f:FormData){
  const{db,wedding,session}=await requireEditor();const id=text(f,"id");
  const rows=await db`DELETE FROM seating_tables WHERE id=${id} AND wedding_id=${wedding.id} RETURNING name`;
  if(rows[0])await recordActivity(db,wedding.id,session.user.id,"seating_table_deleted","seating",id,{name:rows[0].name});
  revalidatePath("/app");
}

export async function assignGuestToTable(f:FormData){
  const{db,wedding,session}=await requireEditor();
  const guestId=text(f,"guest_id"),tableId=text(f,"table_id");
  if(!guestId||!tableId)return;
  const rows=await db`SELECT st.id,st.name,st.capacity,st.event_id,g.id guest_id,g.name guest_name,
    COALESCE((SELECT sum(sa.seats) FROM seating_assignments sa WHERE sa.table_id=st.id),0)::int occupied
    FROM seating_tables st JOIN guests g ON g.wedding_id=st.wedding_id
    WHERE st.id=${tableId} AND st.wedding_id=${wedding.id} AND g.id=${guestId} LIMIT 1`;
  if(!rows[0])return;
  const seats=Math.max(1,Math.min(20,int(f,"seats")||1));
  if(Number(rows[0].occupied)+seats>Number(rows[0].capacity))throw new Error("Kapasitas meja tidak cukup");
  const eventId=rows[0].event_id;
  if(eventId){
    await db`DELETE FROM seating_assignments sa USING seating_tables st
      WHERE sa.table_id=st.id AND sa.guest_id=${guestId} AND st.wedding_id=${wedding.id} AND st.event_id=${eventId}`;
  }else{
    await db`DELETE FROM seating_assignments sa USING seating_tables st
      WHERE sa.table_id=st.id AND sa.guest_id=${guestId} AND st.wedding_id=${wedding.id} AND st.event_id IS NULL`;
  }
  const assigned=await db`INSERT INTO seating_assignments(wedding_id,table_id,guest_id,seats) VALUES(${wedding.id},${tableId},${guestId},${seats}) RETURNING id`;
  await recordActivity(db,wedding.id,session.user.id,"seating_assigned","seating",String(assigned[0]?.id||""),{guest:rows[0].guest_name,table:rows[0].name,seats});
  revalidatePath("/app");
}

export async function removeSeatAssignment(f:FormData){
  const{db,wedding,session}=await requireEditor();const id=text(f,"id");
  const rows=await db`DELETE FROM seating_assignments sa USING guests g,seating_tables st
    WHERE sa.id=${id} AND sa.wedding_id=${wedding.id} AND g.id=sa.guest_id AND st.id=sa.table_id
    RETURNING g.name guest_name,st.name table_name`;
  if(rows[0])await recordActivity(db,wedding.id,session.user.id,"seating_removed","seating",id,{guest:rows[0].guest_name,table:rows[0].table_name});
  revalidatePath("/app");
}

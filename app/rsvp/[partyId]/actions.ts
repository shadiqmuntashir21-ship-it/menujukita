"use server";

import { revalidatePath } from "next/cache";
import { sql } from "@/lib/db";
import { verifyRsvpParty } from "@/lib/rsvp";

export async function submitRsvp(formData:FormData){
  const partyId=String(formData.get("party_id")||"");
  const signature=String(formData.get("sig")||"");
  if(!partyId||!verifyRsvpParty(partyId,signature)) throw new Error("Invalid RSVP token");
  const status=String(formData.get("status")||"");
  if(!["attending","not_attending","maybe"].includes(status)) return;
  const pax=Math.max(0,Math.min(20,Number(formData.get("pax")||0)));
  const dietary=String(formData.get("dietary_note")||"").trim();
  const eventIds=formData.getAll("event").map(String);
  const db=sql();
  const parties=await db`SELECT gp.*,g.id guest_id,g.wedding_id FROM guest_parties gp JOIN guests g ON g.party_id=gp.id WHERE gp.id=${partyId} LIMIT 1`;
  if(!parties[0]) throw new Error("Invitation not found");
  const p:any=parties[0];
  const finalPax=status==="attending"?Math.max(1,Math.min(p.max_pax,pax||1)):0;
  const tx:any[]=[
    db`UPDATE guests SET rsvp_status=${status},actual_pax=${finalPax},dietary_note=${dietary||null},updated_at=now() WHERE party_id=${partyId} AND wedding_id=${p.wedding_id}`
  ];
  const events=await db`SELECT id FROM wedding_events WHERE wedding_id=${p.wedding_id}`;
  for(const ev of events as any[]){
    const evStatus=status==="attending"?(eventIds.includes(ev.id)?"attending":"not_attending"):status;
    tx.push(db`INSERT INTO rsvps(wedding_id,guest_id,party_id,event_id,status,pax,dietary_note,responded_at)
      VALUES(${p.wedding_id},${p.guest_id},${partyId},${ev.id},${evStatus},${evStatus==="attending"?finalPax:0},${dietary||null},now())
      ON CONFLICT(guest_id,event_id) DO UPDATE SET status=EXCLUDED.status,pax=EXCLUDED.pax,dietary_note=EXCLUDED.dietary_note,responded_at=now()`);
  }
  await db.transaction(tx);
  revalidatePath(`/rsvp/${partyId}`);
  revalidatePath("/app");
}

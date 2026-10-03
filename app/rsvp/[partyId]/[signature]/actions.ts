"use server";
import{sql}from"@/lib/db";
import{verifyRsvpParty}from"@/lib/rsvp";
import{redirect}from"next/navigation";

export async function submitRsvp(partyId:string,signature:string,f:FormData){
  if(!verifyRsvpParty(partyId,signature))redirect("/rsvp/invalid");
  const status=String(f.get("status")||"");
  if(!["attending","not_attending","maybe"].includes(status))redirect("/rsvp/invalid");
  const db=sql();
  const rows=await db`SELECT gp.id,gp.max_pax,g.id guest_id,g.wedding_id
    FROM guest_parties gp JOIN guests g ON g.party_id=gp.id
    WHERE gp.id=${partyId} LIMIT 1`;
  if(!rows[0])redirect("/rsvp/invalid");
  const party:any=rows[0];
  const max=Number(party.max_pax||1);
  const pax=Math.max(0,Math.min(max,Number(f.get("pax")||0)));
  const actual=status==="attending"?Math.max(1,pax||1):0;
  const dietary=String(f.get("dietary_note")||"").trim();
  const selectedEvents=new Set(f.getAll("events").map(String));
  const events=await db`SELECT id FROM wedding_events WHERE wedding_id=${party.wedding_id}`;
  const tx:any[]=[
    db`UPDATE guests SET rsvp_status=${status},actual_pax=${actual},dietary_note=${dietary||null},updated_at=now()
       WHERE party_id=${partyId} AND wedding_id=${party.wedding_id}`
  ];
  for(const event of events as any[]){
    const eventStatus=status==="attending"?(selectedEvents.has(String(event.id))?"attending":"not_attending"):status;
    tx.push(db`INSERT INTO rsvps(wedding_id,guest_id,party_id,event_id,status,pax,dietary_note,responded_at)
      VALUES(${party.wedding_id},${party.guest_id},${partyId},${event.id},${eventStatus},${eventStatus==="attending"?actual:0},${dietary||null},now())
      ON CONFLICT(guest_id,event_id) DO UPDATE SET status=EXCLUDED.status,pax=EXCLUDED.pax,dietary_note=EXCLUDED.dietary_note,responded_at=now()`);
  }
  await db.transaction(tx);
  redirect("/rsvp/"+partyId+"/"+signature+"?saved=1");
}

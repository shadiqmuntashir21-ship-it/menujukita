"use server";
import{sql}from"@/lib/db";
import{verifyRsvpParty}from"@/lib/rsvp";
import{redirect}from"next/navigation";

export async function submitRsvp(partyId:string,signature:string,f:FormData){
  if(!verifyRsvpParty(partyId,signature))redirect("/rsvp/invalid");
  const status=String(f.get("status")||"");
  if(!["attending","not_attending","maybe"].includes(status))redirect("/rsvp/invalid");
  const db=sql();
  const party=await db`SELECT id,max_pax FROM guest_parties WHERE id=${partyId} LIMIT 1`;
  if(!party[0])redirect("/rsvp/invalid");
  const max=Number(party[0].max_pax||1);
  const pax=Math.max(0,Math.min(max,Number(f.get("pax")||0)));
  const actual=status==="attending"?Math.max(1,pax||1):0;
  const dietary=String(f.get("dietary_note")||"").trim();
  await db`UPDATE guests SET rsvp_status=${status},actual_pax=${actual},dietary_note=${dietary||null},updated_at=now() WHERE party_id=${partyId}`;
  redirect("/rsvp/"+partyId+"/"+signature+"?saved=1");
}
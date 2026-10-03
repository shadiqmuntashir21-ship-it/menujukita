"use server";
import crypto from"node:crypto";
import{headers}from"next/headers";
import{sql}from"@/lib/db";
import{verifyRsvpParty}from"@/lib/rsvp";
import{redirect}from"next/navigation";

const hash=(v:string)=>crypto.createHash("sha256").update(v).digest("hex");

export async function submitRsvp(partyId:string,signature:string,f:FormData){
  if(!(await verifyRsvpParty(partyId,signature)))redirect("/rsvp/invalid");
  const status=String(f.get("status")||"");
  if(!["attending","not_attending","maybe"].includes(status))redirect("/rsvp/invalid");
  const db=sql();

  const h=await headers();
  const forwarded=h.get("x-forwarded-for")||h.get("x-real-ip")||"unknown";
  const ip=forwarded.split(",")[0].trim();
  const hour=new Date().toISOString().slice(0,13);
  const rateKey=hash("rsvp|"+partyId+"|"+ip+"|"+hour);
  await db`DELETE FROM public_rate_limits WHERE window_start<now()-interval '48 hours'`;
  const rate=await db`INSERT INTO public_rate_limits(rate_key,hit_count,window_start,updated_at)
    VALUES(${rateKey},1,date_trunc('hour',now()),now())
    ON CONFLICT(rate_key) DO UPDATE SET hit_count=public_rate_limits.hit_count+1,updated_at=now()
    RETURNING hit_count`;
  if(Number(rate[0]?.hit_count||0)>30)redirect("/rsvp/"+partyId+"/"+signature+"?error=rate");

  const rows=await db`SELECT gp.id,gp.max_pax,g.id guest_id,g.wedding_id
    FROM guest_parties gp
    JOIN guests g ON g.party_id=gp.id
    JOIN weddings w ON w.id=g.wedding_id AND w.status='active'
    JOIN licenses l ON l.wedding_id=w.id AND l.status='active'
    WHERE gp.id=${partyId} AND gp.wedding_id=w.id LIMIT 1`;
  if(!rows[0])redirect("/rsvp/invalid");
  const party:any=rows[0],max=Number(party.max_pax||1),pax=Math.max(0,Math.min(max,Number(f.get("pax")||0))),actual=status==="attending"?Math.max(1,pax||1):0,dietary=String(f.get("dietary_note")||"").trim().slice(0,500);
  const selectedEvents=new Set(f.getAll("events").map(String));
  const events=await db`SELECT id FROM wedding_events WHERE wedding_id=${party.wedding_id}`;
  if(status==="attending"&&events.length>0&&selectedEvents.size===0)redirect("/rsvp/"+partyId+"/"+signature+"?error=event");
  const tx:any[]=[db`UPDATE guests SET rsvp_status=${status},actual_pax=${actual},dietary_note=${dietary||null},updated_at=now()
       WHERE party_id=${partyId} AND wedding_id=${party.wedding_id}`];
  for(const event of events as any[]){
    const eventStatus=status==="attending"?(selectedEvents.has(String(event.id))?"attending":"not_attending"):status;
    tx.push(db`INSERT INTO rsvps(wedding_id,guest_id,party_id,event_id,status,pax,dietary_note,responded_at)
      VALUES(${party.wedding_id},${party.guest_id},${partyId},${event.id},${eventStatus},${eventStatus==="attending"?actual:0},${dietary||null},now())
      ON CONFLICT(guest_id,event_id) DO UPDATE SET status=EXCLUDED.status,pax=EXCLUDED.pax,dietary_note=EXCLUDED.dietary_note,responded_at=now()`);
  }
  tx.push(db`INSERT INTO activity_logs(wedding_id,auth_user_id,action,entity_type,entity_id,metadata)
    VALUES(${party.wedding_id},NULL,'guest_rsvp_updated','guest',${party.guest_id},jsonb_build_object('status',${status},'pax',${actual}))`);
  await db.transaction(tx);
  redirect("/rsvp/"+partyId+"/"+signature+"?saved=1");
}
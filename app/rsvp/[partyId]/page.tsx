import { notFound } from "next/navigation";
import { sql } from "@/lib/db";
import { verifyRsvpParty } from "@/lib/rsvp";
import { submitRsvp } from "./actions";

export const dynamic="force-dynamic";

export default async function Page({params,searchParams}:{params:Promise<{partyId:string}>,searchParams:Promise<{sig?:string}>}){
  const {partyId}=await params; const {sig=""}=await searchParams;
  if(!verifyRsvpParty(partyId,sig)) notFound();
  const db=sql();
  const rows=await db`SELECT gp.*,g.name guest_name,g.rsvp_status,g.actual_pax,g.dietary_note,w.couple_one_name,w.couple_two_name,w.wedding_date,w.city,w.id wedding_id
    FROM guest_parties gp JOIN guests g ON g.party_id=gp.id JOIN weddings w ON w.id=gp.wedding_id WHERE gp.id=${partyId} LIMIT 1`;
  if(!rows[0]) notFound();
  const inv:any=rows[0];
  const events=await db`SELECT * FROM wedding_events WHERE wedding_id=${inv.wedding_id} ORDER BY sort_order,event_date,start_time`;
  const existing=await db`SELECT event_id,status FROM rsvps WHERE party_id=${partyId}`;
  const attendingEvents=new Set((existing as any[]).filter(x=>x.status==="attending").map(x=>x.event_id));
  const formatted=new Intl.DateTimeFormat("id-ID",{weekday:"long",day:"numeric",month:"long",year:"numeric"}).format(new Date(inv.wedding_date));
  return <main className="rsvp-page"><section className="rsvp-card">
    <div className="rsvp-brand"><span className="brand-mark">M</span><span>MenujuKita</span></div>
    <div className="rsvp-hero"><small>YOU'RE INVITED</small><h1 className="serif">{inv.couple_one_name} <em>&</em> {inv.couple_two_name}</h1><p>{formatted}{inv.city?" · "+inv.city:""}</p></div>
    <div className="invitee"><small>Undangan untuk</small><h2>{inv.party_name}</h2><span>Maksimal {inv.max_pax} orang</span></div>
    <form action={submitRsvp} className="stack">
      <input type="hidden" name="party_id" value={partyId}/><input type="hidden" name="sig" value={sig}/>
      <div className="field"><label>Apakah Anda dapat hadir?</label><div className="choice-grid">
        <label className="choice"><input type="radio" name="status" value="attending" defaultChecked={inv.rsvp_status==="attending"||inv.rsvp_status==="waiting"}/> Hadir</label>
        <label className="choice"><input type="radio" name="status" value="not_attending" defaultChecked={inv.rsvp_status==="not_attending"}/> Tidak hadir</label>
        <label className="choice"><input type="radio" name="status" value="maybe" defaultChecked={inv.rsvp_status==="maybe"}/> Belum pasti</label>
      </div></div>
      <div className="field"><label>Jumlah yang hadir</label><input className="input" type="number" name="pax" min="1" max={inv.max_pax} defaultValue={inv.actual_pax||inv.max_pax||1}/></div>
      <div className="field"><label>Acara yang dihadiri</label><div className="event-choices">{(events as any[]).map((e:any)=><label className="event-choice" key={e.id}><input type="checkbox" name="event" value={e.id} defaultChecked={attendingEvents.size?attendingEvents.has(e.id):true}/><span><b>{e.name}</b><small>{e.start_time?String(e.start_time).slice(0,5):""}</small></span></label>)}</div></div>
      <div className="field"><label>Catatan makanan / kebutuhan khusus</label><textarea className="input" name="dietary_note" defaultValue={inv.dietary_note||""} placeholder="Opsional"/></div>
      <button className="btn btn-primary">Kirim RSVP</button>
      {inv.rsvp_status!=="waiting"&&<div className="success-note">Respons terakhir: <b>{inv.rsvp_status}</b>. Anda masih bisa mengubahnya.</div>}
    </form>
    <p className="rsvp-footer">Plan the journey. Enjoy the day.</p>
  </section></main>
}

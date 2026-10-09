import{sql}from"@/lib/db";
import{verifyRsvpParty}from"@/lib/rsvp";
import{notFound}from"next/navigation";
import{submitRsvp}from"./actions";
import {BrandLogo} from "@/components/brand";

export const dynamic="force-dynamic";

export default async function Page({params,searchParams}:{params:Promise<{partyId:string;signature:string}>;searchParams:Promise<{saved?:string;error?:string}>}){
  const{partyId,signature}=await params;const q=await searchParams;
  if(!(await verifyRsvpParty(partyId,signature)))notFound();
  const db=sql();
  const rows=await db`SELECT gp.party_name,gp.max_pax,w.id wedding_id,w.couple_one_name,w.couple_two_name,w.wedding_date,w.city,g.id guest_id,g.rsvp_status,g.actual_pax,g.dietary_note
    FROM guest_parties gp
    JOIN weddings w ON w.id=gp.wedding_id AND w.status='active'
    JOIN licenses l ON l.wedding_id=w.id AND l.status='active'
    LEFT JOIN guests g ON g.party_id=gp.id AND g.wedding_id=w.id
    WHERE gp.id=${partyId} LIMIT 1`;
  if(!rows[0])notFound();
  const x:any=rows[0];
  const [events,responses]=await Promise.all([
    db`SELECT id,name,event_type,event_date,start_time,location FROM wedding_events WHERE wedding_id=${x.wedding_id} ORDER BY sort_order,event_date,start_time`,
    db`SELECT event_id,status FROM rsvps WHERE party_id=${partyId}`
  ]);
  const selected=new Set((responses as any[]).filter(r=>r.status==="attending").map(r=>String(r.event_id)));
  const hasSavedEvents=responses.length>0;
  const action=submitRsvp.bind(null,partyId,signature);
  return <main className="rsvp-page"><section className="rsvp-card">
    <div className="brand"><BrandLogo className="auth-logo"/></div>
    <div className="rsvp-hero"><small>KONFIRMASI KEHADIRAN</small><h1 className="serif">{x.couple_one_name} & {x.couple_two_name}</h1><p>{x.wedding_date?new Intl.DateTimeFormat("id-ID",{dateStyle:"full"}).format(new Date(x.wedding_date)):"Tanggal belum ditentukan"}{x.city?" · "+x.city:""}</p></div>
    {q.saved==="1"&&<div className="success-box">Terima kasih. Konfirmasi kehadiran sudah tersimpan.</div>}{q.error==="event"&&<div className="notice">Pilih minimal satu acara jika Anda akan hadir.</div>}{q.error==="rate"&&<div className="notice">Terlalu banyak percobaan RSVP. Coba lagi beberapa saat nanti.</div>}
    <form action={action} className="stack">
      <div className="invitee"><small>Konfirmasi untuk</small><h2>{x.party_name}</h2><span>Hingga {x.max_pax} orang</span></div>
      <label className="field"><span>Konfirmasi kehadiran</span><select className="input" name="status" defaultValue={x.rsvp_status==="attending"?"attending":x.rsvp_status==="not_attending"?"not_attending":"maybe"}><option value="attending">Ya, kami hadir</option><option value="not_attending">Tidak dapat hadir</option><option value="maybe">Belum pasti</option></select></label>
      <label className="field"><span>Jumlah yang hadir</span><input className="input" name="pax" type="number" min="0" max={Number(x.max_pax)} defaultValue={Number(x.actual_pax||x.max_pax||1)}/></label>
      {(events as any[]).length>0&&<div className="field"><span>Acara yang akan dihadiri</span><div className="event-choices">{(events as any[]).map(e=><label className="event-choice" key={e.id}><input type="checkbox" name="events" value={e.id} defaultChecked={hasSavedEvents?selected.has(String(e.id)):true}/><span><b>{e.name}</b><small>{e.start_time?String(e.start_time).slice(0,5):""}{e.location?" · "+e.location:""}</small></span></label>)}</div></div>}
      <label className="field"><span>Catatan makanan (opsional)</span><textarea className="input" name="dietary_note" rows={3} defaultValue={x.dietary_note||""}/></label>
      <button className="btn btn-primary">Kirim RSVP</button>
    </form>
    <p className="rsvp-footer">MenujuKita · Wedding Planner</p>
  </section></main>
}
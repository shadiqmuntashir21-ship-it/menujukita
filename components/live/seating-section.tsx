import { Armchair,Plus,Trash2,X } from "lucide-react";
import { addSeatingTable,assignGuestToTable,deleteSeatingTable,removeSeatAssignment } from "@/app/app/seating-actions";

export default function SeatingSection({tables,assignments,guests,events,canEdit}:{tables:any[];assignments:any[];guests:any[];events:any[];canEdit:boolean}){
  const assignedByTable=new Map<string,any[]>();
  assignments.forEach(a=>{const list=assignedByTable.get(String(a.table_id))||[];list.push(a);assignedByTable.set(String(a.table_id),list)});
  return <section id="seating" className="module-stack"><div className="panel">
    <div className="module-head"><div><small className="muted">SEATING PLAN</small><h3>Susunan meja</h3></div><span className="badge">{tables.length} meja</span></div>
    {canEdit&&<form action={addSeatingTable} className="quick-form"><input className="input" name="name" placeholder="Nama meja, mis. Meja 01" required/><input className="input compact" name="capacity" type="number" min="1" max="100" defaultValue="10"/><select className="input compact" name="event_id" defaultValue=""><option value="">Umum / tanpa event</option>{events.map(e=><option key={e.id} value={e.id}>{e.name}</option>)}</select><button className="btn btn-primary btn-sm"><Plus size={15}/>Tambah Meja</button></form>}
    <div className="seating-grid">{tables.length?tables.map(t=>{const items=assignedByTable.get(String(t.id))||[];const occupied=items.reduce((s,a)=>s+Number(a.seats||1),0);return <article className="seat-card" key={t.id}>
      <div className="seat-head"><div><Armchair size={19}/><b>{t.name}</b><small>{t.event_name||"General"}</small></div><span className={"badge "+(occupied>Number(t.capacity)?"badge-danger":"")}>{occupied}/{t.capacity}</span></div>
      <div className="seat-people">{items.length?items.map(a=><div className="seat-person" key={a.id}><span>{a.guest_name}</span><small>{a.seats} seat</small>{canEdit&&<form action={removeSeatAssignment}><input type="hidden" name="id" value={a.id}/><button className="icon-button danger"><X size={13}/></button></form>}</div>):<div className="empty-mini">Belum ada tamu di meja ini.</div>}</div>
      {canEdit&&<><form action={assignGuestToTable} className="seat-assign"><input type="hidden" name="table_id" value={t.id}/><select className="input compact" name="guest_id" required defaultValue=""><option value="" disabled>Pilih tamu</option>{guests.filter(g=>g.rsvp_status!=="not_attending").map(g=><option key={g.id} value={g.id}>{g.name}</option>)}</select><input className="input compact" name="seats" type="number" min="1" max="20" defaultValue="1"/><button className="btn btn-sm">Tempatkan</button></form><form action={deleteSeatingTable} className="seat-delete"><input type="hidden" name="id" value={t.id}/><button className="mini-link danger-link"><Trash2 size={13}/>Hapus meja</button></form></>}
    </article>}):<div className="empty-state seating-empty"><Armchair size={28}/><b>Belum ada meja.</b><span className="muted">Buat seating plan ketika guest list sudah mulai final.</span></div>}</div>
  </div></section>
}

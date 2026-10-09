import {CalendarDays,Plus} from "lucide-react";
import {saveWeddingEvent,deleteWeddingEvent} from "@/app/app/event-actions";
import ConfirmSubmit from "@/components/confirm-submit";
export default function EventsEditor({events}:{events:any[]}){
 return <section className="studio-panel" style={{padding:19,borderRadius:20,display:"grid",gap:12}}>
 <div style={{display:"flex",gap:9,alignItems:"center"}}><CalendarDays size={19}/><div><h3 style={{margin:0}}>Jadwal & tempat acara</h3><p className="muted" style={{fontSize:13,margin:0}}>Kelola waktu dan lokasi akad, resepsi, atau acara keluarga untuk kalender, RSVP, dan rundown.</p></div></div>
 {events.map(e=><details className="studio-item" key={e.id}><summary><div className="item-main"><b>{e.name}</b><span>{e.event_date?String(e.event_date).slice(0,10):"Tanggal belum ditentukan"} · {e.location||"Tempat belum diisi"}</span></div></summary><div className="item-editor"><EventForm e={e}/><form action={deleteWeddingEvent}><input type="hidden" name="id" value={e.id}/><ConfirmSubmit message={"Hapus acara "+e.name+"? Hapus permanen hanya jika tidak digunakan pada rundown atau RSVP."}>Hapus acara</ConfirmSubmit></form></div></details>)}
 <details className="inline-composer"><summary><Plus size={16}/> Tambah acara lainnya</summary><EventForm/></details>
 </section>;
}
function EventForm({e}:{e?:any}){
 return <form action={saveWeddingEvent} className="editor-form">{e&&<input type="hidden" name="id" value={e.id}/>}
 <label className="field"><span>Jenis acara</span><select className="input" name="event_type" defaultValue={["ceremony","reception","other"].includes(e?.event_type)?e.event_type:"other"}><option value="ceremony">Akad / pemberkatan</option><option value="reception">Resepsi</option><option value="other">Acara lainnya</option></select></label>
 <label className="field span-2"><span>Nama acara</span><input className="input" name="name" maxLength={160} defaultValue={e?.name||""} placeholder="Misalnya: acara keluarga" required/></label>
 <label className="field"><span>Tanggal</span><input className="input" type="date" name="event_date" defaultValue={e?.event_date?String(e.event_date).slice(0,10):""}/></label>
 <label className="field"><span>Jam mulai</span><input className="input" type="time" name="start_time" defaultValue={e?.start_time?String(e.start_time).slice(0,5):""}/></label>
 <label className="field"><span>Jam selesai</span><input className="input" type="time" name="end_time" defaultValue={e?.end_time?String(e.end_time).slice(0,5):""}/></label>
 <label className="field span-2"><span>Lokasi</span><input className="input" name="location" maxLength={220} defaultValue={e?.location||""} placeholder="Gedung atau alamat acara"/></label>
 <label className="field span-2"><span>Tautan peta HTTPS (opsional)</span><input className="input" name="map_url" type="url" defaultValue={e?.map_url||""}/></label>

 <button className="btn btn-primary span-2">{e?"Simpan acara":"Tambah acara"}</button></form>
}

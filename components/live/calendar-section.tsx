"use client";
import {useMemo,useState} from "react";
import {CalendarDays,ChevronLeft,ChevronRight,Plus} from "lucide-react";
import {createAgendaEntry,editAgendaEntry,removeAgendaEntry} from "@/app/app/agenda-actions";
import ConfirmSubmit from "@/components/confirm-submit";
export type CalendarEvent={id:string;title:string;date:string;time?:string|null;source:"agenda"|"task"|"payment"|"wedding"|"rundown";note?:string|null;location?:string|null;kind?:string|null;view:"calendar"|"plan"|"money"|"guests"|"vendors"};
const sourceLabel:Record<string,string>={agenda:"Agenda bersama",task:"Checklist",payment:"Pembayaran",wedding:"Acara pernikahan",rundown:"Rundown"};
const dateOnly=(v:string)=>String(v||"").slice(0,10);
const displayDate=(v:string)=>new Date(v+"T12:00:00Z").toLocaleDateString("id-ID",{timeZone:"UTC",weekday:"long",day:"numeric",month:"long",year:"numeric"});
function formatMonth(value:string){
 const [year,month]=value.split("-").map(Number);
 return new Date(Date.UTC(year,month-1,1)).toLocaleDateString("id-ID",{timeZone:"UTC",month:"long",year:"numeric"});
}
export default function CalendarSection({events,currentMonth}:{events:CalendarEvent[];currentMonth:string}){
 const[month,setMonth]=useState(currentMonth),[selectedDay,setSelectedDay]=useState<string|null>(null),[kind,setKind]=useState("all"),[adding,setAdding]=useState(false);
 const[year,mon]=month.split("-").map(Number);
 const move=(n:number)=>{const d=new Date(Date.UTC(year,mon-1+n,1));setMonth(d.toISOString().slice(0,7));setSelectedDay(null)};
 const offset=(new Date(Date.UTC(year,mon-1,1)).getUTCDay()+6)%7,days=new Date(Date.UTC(year,mon,0)).getUTCDate();
 const cells=Array.from({length:offset+days},(_,i)=>i<offset?null:String(year)+"-"+String(mon).padStart(2,"0")+"-"+String(i-offset+1).padStart(2,"0"));
 const shown=useMemo(()=>events.filter(e=>e.date.startsWith(month)&&(kind==="all"||e.source===kind)&&(selectedDay===null||e.date===selectedDay)).sort((a,b)=>a.date.localeCompare(b.date)||(a.time||"").localeCompare(b.time||"")),[events,month,kind,selectedDay]);
 const label=(event:CalendarEvent)=>({agenda:"Agenda bersama",task:"Checklist",payment:"Jadwal pembayaran",wedding:"Acara utama",rundown:"Hari-H"}[event.source]);
 const handleOpen=(event:CalendarEvent)=>{if(event.view!=="calendar")window.dispatchEvent(new CustomEvent("menujukita:navigate",{detail:event.view}))};
 return <section className="module-stack">
  <header className="module-editorial-head"><div><span className="micro-label">KALENDER BERSAMA</span><h2 className="serif">Setiap rencana punya waktunya.</h2><p>Lihat tugas, pembayaran, janji temu, dan acara dalam satu kalender. Jadwal tambahan dapat kalian buat dan ubah bersama.</p></div><CalendarDays size={30}/></header>
  <div className="studio-panel" style={{padding:"clamp(12px,3vw,24px)",borderRadius:22,display:"grid",gap:15}}>
   <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:12}}>
    <button className="btn" type="button" aria-label="Bulan sebelumnya" onClick={()=>move(-1)}><ChevronLeft size={17}/></button>
    <h3 style={{textTransform:"capitalize",fontSize:"clamp(19px,3vw,25px)",margin:0,textAlign:"center"}}>{formatMonth(month)}</h3>
    <button className="btn" type="button" aria-label="Bulan berikutnya" onClick={()=>move(1)}><ChevronRight size={17}/></button>
   </div>
   <div style={{display:"grid",gridTemplateColumns:"repeat(7,minmax(0,1fr))",gap:5,textAlign:"center"}}>
    {["Sen","Sel","Rab","Kam","Jum","Sab","Min"].map(d=><span key={d} style={{fontSize:11,fontWeight:700,color:"#667269",padding:"7px 0"}}>{d}</span>)}
    {cells.map((date,i)=>!date?<span key={"empty-"+i}/>:<button key={date} type="button" aria-pressed={selectedDay===date} onClick={()=>setSelectedDay(d=>d===date?null:date)} style={{minHeight:46,padding:"8px 2px",borderRadius:12,border:selectedDay===date?"2px solid #42654d":"1px solid #e7e8e3",background:selectedDay===date?"#eaf2e9":"#fff",display:"grid",justifyItems:"center",alignContent:"center",gap:4,cursor:"pointer",fontWeight:selectedDay===date?800:500,color:"#344839",fontSize:13}}>
     <span>{Number(date.slice(8))}</span>{events.some(e=>e.date===date)&&<span style={{height:5,width:5,borderRadius:"50%",background:"#8da88e"}}/>}
    </button>)}
   </div>
   <div style={{display:"flex",justifyContent:"space-between",gap:10,flexWrap:"wrap",alignItems:"center"}}>
    <select className="input" style={{maxWidth:230}} aria-label="Filter kalender" value={kind} onChange={e=>setKind(e.target.value)}><option value="all">Semua kegiatan</option><option value="agenda">Agenda buatan kalian</option><option value="task">Checklist</option><option value="payment">Pembayaran</option><option value="wedding">Acara</option><option value="rundown">Rundown</option></select>
    <button type="button" className="btn btn-primary" onClick={()=>setAdding(v=>!v)}><Plus size={16}/> Tambah agenda</button>
   </div>
  </div>
  {adding&&<section className="studio-panel" style={{padding:18,borderRadius:20}}><h3>Agenda baru</h3><form className="editor-form" action={createAgendaEntry}>
   <label className="field span-2"><span>Judul</span><input className="input" name="title" maxLength={160} required placeholder="Misalnya: survei gedung atau rapat keluarga"/></label>
   <label className="field"><span>Tanggal</span><input className="input" type="date" name="happens_on" defaultValue={selectedDay||month+"-01"} required/></label>
   <label className="field"><span>Jam (opsional)</span><input className="input" type="time" name="starts_at"/></label>
   <label className="field"><span>Jenis</span><select className="input" name="kind"><option value="meeting">Rapat / diskusi</option><option value="appointment">Janji temu vendor</option><option value="family">Keluarga</option><option value="other">Lainnya</option></select></label>
   <label className="field"><span>Lokasi</span><input className="input" name="location" placeholder="Opsional"/></label>
   <label className="field span-2"><span>Catatan</span><textarea className="input" name="note" placeholder="Hal yang perlu dibahas atau dibawa"/></label>
   <button className="btn btn-primary span-2">Simpan agenda</button>
  </form></section>}
  <section className="studio-panel" style={{padding:20,borderRadius:20,display:"grid",gap:10}}>
   <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:10,flexWrap:"wrap"}}><h3 style={{fontSize:20,margin:0}}>{selectedDay?displayDate(selectedDay):"Agenda bulan ini"}</h3>{selectedDay&&<button className="btn" onClick={()=>setSelectedDay(null)}>Lihat semua</button>}</div>
   {shown.length===0?<p className="muted" style={{fontSize:14}}>Belum ada agenda pada tanggal atau kategori yang dipilih. Tambahkan janji temu, atau lihat bulan lain.</p>:
   shown.map(e=><details key={e.source+"-"+e.id} style={{border:"1px solid #e8e7e2",borderRadius:16,padding:14}}><summary style={{cursor:"pointer",display:"flex",gap:12,alignItems:"center",listStyle:"none"}}><span style={{display:"grid",justifyItems:"center",minWidth:46}}><b style={{fontSize:20}}>{Number(e.date.slice(8))}</b><small>{new Date(e.date+"T12:00:00Z").toLocaleDateString("id-ID",{timeZone:"UTC",month:"short"})}</small></span><span style={{display:"grid",gap:4,flex:1}}><b>{e.title}</b><small className="muted">{label(e)}{e.time?" · "+e.time.slice(0,5):""}</small></span><ChevronRight size={16}/></summary>
    <div style={{paddingTop:16,display:"grid",gap:10}}>{e.location&&<p style={{margin:0}}>Lokasi: {e.location}</p>}{e.note&&<p style={{margin:0}}>{e.note}</p>}{e.source!=="agenda"?<button className="btn" type="button" style={{justifySelf:"start"}} onClick={()=>handleOpen(e)}>Buka {label(e)}</button>:<div style={{display:"grid",gap:13}}><form className="editor-form" action={editAgendaEntry}>
     <input type="hidden" name="id" value={e.id}/><label className="field span-2"><span>Judul</span><input className="input" name="title" defaultValue={e.title} required/></label><label className="field"><span>Tanggal</span><input className="input" type="date" name="happens_on" defaultValue={e.date} required/></label><label className="field"><span>Jam</span><input className="input" type="time" name="starts_at" defaultValue={e.time||""}/></label><label className="field"><span>Jenis</span><select className="input" name="kind" defaultValue={e.kind||"meeting"}><option value="meeting">Rapat</option><option value="appointment">Janji vendor</option><option value="family">Keluarga</option><option value="other">Lainnya</option></select></label><label className="field"><span>Lokasi</span><input className="input" name="location" defaultValue={e.location||""}/></label><label className="field span-2"><span>Catatan</span><textarea className="input" name="note" defaultValue={e.note||""}/></label><button className="btn btn-primary">Simpan perubahan</button>
     </form><form action={removeAgendaEntry}><input type="hidden" name="id" value={e.id}/><ConfirmSubmit message={"Hapus agenda "+e.title+"? Agenda ini tidak akan muncul lagi."}>Hapus agenda</ConfirmSubmit></form></div>}</div>
   </details>)}
  </section>
  <div style={{display:"flex",gap:9,padding:15,background:"#f0f3eb",borderRadius:16,color:"#4c6354",fontSize:13,lineHeight:1.6}}><CalendarDays size={19}/> Tenggat checklist dan pembayaran mengikuti data aslinya. Mengubah jadwal agenda pribadi tidak otomatis mengubah kontrak atau jatuh tempo vendor.</div>
 </section>;
}

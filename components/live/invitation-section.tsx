import {BookOpen,ExternalLink,Heart,Link2} from "lucide-react";
import {saveInvitationSettings} from "@/app/app/invitation-actions";
import EventsEditor from "@/components/live/events-editor";
export default function InvitationSection({invitation,events,couple}:{invitation:any;events:any[];couple:string}){
 const publicUrl=invitation?.public_id?"/undangan/"+invitation.public_id:null;
 const published=Boolean(invitation?.published);
 return <section className="module-stack">
 <header className="module-editorial-head"><div><span className="micro-label">UNDANGAN MINI</span><h2 className="serif">Sampaikan kabar bahagia kalian.</h2><p>Satu halaman undangan yang elegan, berisi nama pasangan dan jadwal acara. Data baru terlihat publik setelah kalian mengaktifkan publikasi.</p></div><Heart size={27}/></header>
 <details className="composer-card"><summary><span><BookOpen size={17}/> Panduan membagikan undangan</span><small>Periksa dahulu sebelum membagikan</small></summary><div style={{padding:16,lineHeight:1.7}}><ol><li>Pastikan nama pasangan, tanggal dan tempat sudah benar.</li><li>Periksa acara publik pada Pengaturan Wedding.</li><li>Pilih nuansa visual serta isi pesan singkat.</li><li>Aktifkan publikasi, lalu bagikan tautan hanya kepada penerima yang diinginkan.</li></ol><p>Halaman undangan bersifat publik bagi siapa pun yang memiliki tautan. Untuk RSVP, kirim tautan pribadi dari modul Tamu agar data responden tidak tertukar.</p></div></details>
 <div className="studio-panel" style={{padding:20,borderRadius:20,background:"#f1f4eb",display:"grid",gap:12}}>
 <small className="micro-label">PRATINJAU ISI</small>
 <div style={{border:"1px solid #dce4d8",borderRadius:20,padding:22,background:"#fff",textAlign:"center",display:"grid",gap:12}}>
 <Heart size={23} style={{margin:"0 auto",color:"#657d66"}}/>
 <span style={{fontSize:13}}>{invitation?.headline||"Dengan penuh kebahagiaan, kami mengundang Anda"}</span>
 <h3 className="serif" style={{fontSize:"clamp(28px,5vw,38px)",margin:0}}>{couple}</h3>
 {events.filter(e=>e.is_public&&e.event_date).slice(0,3).map(e=><div key={e.id}><b>{e.name}</b><div style={{fontSize:13,color:"#5d695d"}}>{String(e.event_date).slice(0,10)}{e.location?" · "+e.location:""}</div></div>)}
 {invitation?.story&&<p style={{whiteSpace:"pre-wrap",fontSize:14}}>{invitation.story}</p>}
 </div>
 <div style={{display:"flex",gap:10,alignItems:"center",flexWrap:"wrap"}}><span className={"status-dot status-"+(published?"done":"todo")}>{published?"Sudah dipublikasikan":"Belum publik"}</span>{published&&publicUrl&&<a href={publicUrl} target="_blank" rel="noopener noreferrer" className="btn"><ExternalLink size={16}/> Buka undangan</a>}</div>
 </div>
 <EventsEditor events={events}/>
 <details className="composer-card" open={!invitation}><summary><span>Atur isi dan publikasi</span><small>Persetujuan publikasi ada di tangan kalian</small></summary>
 <form action={saveInvitationSettings} className="editor-form">
 <label className="field"><span>Nuansa visual</span><select className="input" name="theme" defaultValue={invitation?.theme||"sage"}><option value="sage">Sage hijau lembut</option><option value="ivory">Ivory klasik</option><option value="rose">Rose hangat</option></select></label>
 <label className="field span-2"><span>Kalimat pembuka</span><input className="input" name="headline" maxLength={180} defaultValue={invitation?.headline||"Dengan penuh kebahagiaan, kami mengundang Anda"}/></label>
 <label className="field span-2"><span>Cerita singkat (opsional)</span><textarea className="input" name="story" maxLength={1000} defaultValue={invitation?.story||""}/></label>
 <label className="field span-2"><span>Catatan untuk tamu</span><textarea className="input" name="note" maxLength={700} defaultValue={invitation?.note||""} placeholder="Misalnya: mohon konfirmasi sebelum tanggal tertentu."/></label>
 <label className="field span-2"><span>Status undangan</span><select className="input" name="published" defaultValue={published?"yes":"no"}><option value="no">Privat — jangan tampilkan ke publik</option><option value="yes">Publik — bisa dibuka siapa pun yang mendapat tautan</option></select></label>
 <button type="submit" className="btn btn-primary span-2">Simpan undangan</button></form></details>
 {published&&publicUrl&&<div style={{border:"1px solid #dde4d9",borderRadius:16,padding:16,display:"flex",alignItems:"center",gap:10}}><Link2 size={18}/><span style={{fontSize:13,overflowWrap:"anywhere"}}>{publicUrl}</span></div>}
 <p className="muted" style={{fontSize:13}}>Undangan ini tidak otomatis mengirim pesan atau meminta kehadiran. Gunakan tautan RSVP pribadi pada modul Tamu untuk menghubungkan jawaban dengan penerima yang tepat.</p>
 </section>
}

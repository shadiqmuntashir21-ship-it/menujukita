import {BookOpen,Images,Plus,Palette} from "lucide-react";
import {saveWeddingConcept,addWeddingInspiration,deleteWeddingInspiration} from "@/app/app/companion-actions";
import ConfirmSubmit from "@/components/confirm-submit";
export default function ConceptSection({concept,inspirations}:{concept:any;inspirations:any[]}){
 return <section className="module-stack" id="concept">
  <header className="module-editorial-head"><div><span className="micro-label">KONSEP PERNIKAHAN</span><h2 className="serif">Bayangkan hari bahagia kalian.</h2><p>Satukan inspirasi, warna, dan prioritas sebelum memutuskan dekorasi bersama vendor.</p></div><Palette size={28}/></header>
  <details className="composer-card"><summary><span><BookOpen size={18}/> Panduan menentukan konsep</span><small>Langkah sederhana untuk memulai</small></summary><div style={{padding:16,lineHeight:1.7}}><p>Konsep membantu keputusan tentang lokasi, busana, dan dekorasi terasa selaras. Tidak perlu mengikuti tren atau menambah biaya di luar kemampuan.</p><ol><li>Pilih tiga hal yang paling penting untuk kedua pasangan.</li><li>Bandingkan inspirasi dengan kebutuhan keluarga dan tempat acara.</li><li>Periksa apakah konsep sesuai dengan anggaran.</li><li>Simpan kesepakatan sebagai panduan saat memilih vendor.</li></ol></div></details>
  <details className="composer-card" open={!concept?.theme_name}><summary><span><Plus size={18}/> Atur konsep</span><small>Catatan bersama yang selalu bisa diubah</small></summary><form action={saveWeddingConcept} className="editor-form">
   <label className="field span-2"><span>Tema acara</span><input className="input" name="theme_name" defaultValue={concept?.theme_name||""} maxLength={120} placeholder="Misalnya: taman hangat, tradisional"/></label>
   <label className="field"><span>Palet warna</span><input className="input" name="palette" defaultValue={concept?.palette||""} maxLength={120} placeholder="Sage, ivory, champagne"/></label>
   <label className="field"><span>Busana / dress code</span><input className="input" name="dress_code" defaultValue={concept?.dress_code||""} maxLength={120}/></label>
   <label className="field span-2"><span>Keinginan dan batasan</span><textarea className="input" name="notes" defaultValue={concept?.notes||""} maxLength={1200} placeholder="Mana yang wajib dan mana yang bisa menyesuaikan budget?"/></label>
   <button className="btn btn-primary span-2">Simpan konsep kami</button>
  </form></details>
  <section className="studio-panel" style={{borderRadius:20,padding:18,display:"grid",gap:14}}>
   <div style={{display:"flex",alignItems:"center",gap:10}}><Images size={22}/><div><h3 style={{margin:0}}>Mood Board</h3><small className="muted">{inspirations.length} inspirasi disimpan</small></div></div>
   <details className="inline-composer"><summary><Plus size={16}/> Tambah inspirasi</summary><form action={addWeddingInspiration} className="editor-form">
    <label className="field span-2"><span>Judul</span><input className="input" name="title" required maxLength={150} placeholder="Misalnya: dekorasi pelaminan"/></label>
    <label className="field span-2"><span>Link gambar HTTPS (opsional)</span><input className="input" name="image_url" type="url" placeholder="https://..."/></label>
    <label className="field span-2"><span>Link sumber (opsional)</span><input className="input" name="reference_url" type="url" placeholder="https://..."/></label>
    <label className="field span-2"><span>Catatan yang disukai</span><textarea className="input" name="note" maxLength={500}/></label><button className="btn btn-primary span-2">Simpan inspirasi</button>
   </form></details>
   {inspirations.length?<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,210px),1fr))",gap:12}}>{inspirations.map(i=><article key={i.id} style={{border:"1px solid #eeece7",borderRadius:16,overflow:"hidden",background:"#fff"}}>
   {i.image_url?<img alt={i.title} src={i.image_url} loading="lazy" referrerPolicy="no-referrer" style={{width:"100%",aspectRatio:"4 / 3",objectFit:"cover",display:"block"}}/>:<div style={{display:"grid",placeItems:"center",height:90,background:"#f1f3ee"}}><Images size={24}/></div>}
   <div style={{padding:13,display:"grid",gap:8}}><b>{i.title}</b>{i.note&&<small className="muted">{i.note}</small>}{i.reference_url&&<a target="_blank" rel="noopener noreferrer" href={i.reference_url}>Lihat sumber ↗</a>}<form action={deleteWeddingInspiration}><input type="hidden" name="id" value={i.id}/><ConfirmSubmit message="Hapus inspirasi ini?">Hapus</ConfirmSubmit></form></div></article>)}</div>:<p className="muted">Belum ada inspirasi. Simpan ide dekorasi, busana atau lokasi berikut catatan mengapa kalian menyukainya.</p>}
  </section>
 </section>
}

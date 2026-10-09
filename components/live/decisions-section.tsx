import {BookOpen,MessageCircle,Plus,HeartHandshake} from "lucide-react";
import {saveWeddingDecision,addWeddingDecisionComment,deleteWeddingDecision} from "@/app/app/companion-actions";
import ConfirmSubmit from "@/components/confirm-submit";
const status:Record<string,string>={discussing:"Dipertimbangkan",waiting_partner:"Menunggu pasangan",agreed:"Disepakati",cancelled:"Dibatalkan"};
export default function DecisionsSection({decisions,comments}:{decisions:any[];comments:any[]}){
 return <section className="module-stack" id="decisions">
 <header className="module-editorial-head"><div><span className="micro-label">DISKUSI BERDUA</span><h2 className="serif">Keputusan kalian, tercatat.</h2><p>Catat pilihan, baca pertimbangan masing-masing, lalu simpan kesepakatan. Keduanya tetap bekerja dalam satu wedding.</p></div><HeartHandshake size={28}/></header>
 <details className="composer-card"><summary><span><BookOpen size={17}/> Panduan mengambil keputusan berdua</span><small>Lebih mudah ketika pilihan tertulis</small></summary><div style={{padding:16,lineHeight:1.7}}><ol><li>Tuliskan topik dan pilihan yang sedang dipertimbangkan.</li><li>Sampaikan alasan serta kekhawatiran dari masing-masing.</li><li>Gunakan komentar untuk merangkum hasil perbandingan.</li><li>Ketika sepakat, tulis hasil final dan ubah statusnya.</li></ol><p>Tidak setiap tugas perlu persetujuan formal; gunakan fitur ini untuk keputusan yang memang memengaruhi rencana bersama.</p></div></details>
 <details className="composer-card"><summary><span><Plus size={18}/> Buat topik diskusi</span><small>Lokasi, konsep, vendor, keuangan atau lainnya</small></summary><DecisionForm/></details>
 <div className="studio-list">{decisions.length?decisions.map(d=><details className="studio-item" key={d.id}>
 <summary><div className="item-main"><b>{d.title}</b><span>{d.context||"Klik untuk membuka diskusi"}</span></div><span className="status-dot">{status[d.status]||d.status}</span></summary>
 <div className="item-editor" style={{display:"grid",gap:14}}><DecisionForm row={d}/>
 <div style={{display:"grid",gap:10,borderTop:"1px solid #e9e9e5",paddingTop:15}}><h4 style={{display:"flex",gap:8,alignItems:"center",margin:0}}><MessageCircle size={17}/> Pendapat & catatan</h4>
 {comments.filter(c=>c.decision_id===d.id).map(c=><div key={c.id} style={{background:"#f5f6f2",borderRadius:13,padding:13}}>
 <small className="muted">{c.author_name} · {String(c.created_at).slice(0,10)}</small><p style={{whiteSpace:"pre-wrap",margin:"7px 0 0",lineHeight:1.6}}>{c.body}</p></div>)}
 <form action={addWeddingDecisionComment} className="editor-form"><input type="hidden" name="decision_id" value={d.id}/><label className="field span-2"><span>Tambah tanggapan</span><textarea className="input" name="body" maxLength={1000} required placeholder="Tuliskan pendapat atau pertanyaan kalian."/></label><button className="btn btn-primary">Kirim tanggapan</button></form>
 </div>
 <form action={deleteWeddingDecision} className="danger-zone"><input type="hidden" name="id" value={d.id}/><ConfirmSubmit message="Hapus topik dan seluruh tanggapan?">Hapus topik</ConfirmSubmit></form></div>
 </details>):<div className="calm-empty actionable"><b>Belum ada topik diskusi.</b><span>Mulai dari keputusan yang perlu dibicarakan berdua, misalnya lokasi atau paket katering.</span></div>}</div>
 </section>;
}
function DecisionForm({row}:{row?:any}){
 return <form action={saveWeddingDecision} className="editor-form">{row&&<input type="hidden" name="id" value={row.id}/>}
 <label className="field span-2"><span>Topik</span><input className="input" name="title" required maxLength={160} defaultValue={row?.title||""} placeholder="Misalnya: menentukan venue"/></label>
 <label className="field span-2"><span>Pertimbangan awal</span><textarea className="input" name="context" maxLength={1000} defaultValue={row?.context||""}/></label>
 <label className="field"><span>Status</span><select className="input" name="status" defaultValue={row?.status||"discussing"}>{Object.entries(status).map(([v,label])=><option value={v} key={v}>{label}</option>)}</select></label>
 <label className="field span-2"><span>Hasil kesepakatan</span><textarea className="input" name="resolution" maxLength={500} defaultValue={row?.resolution||""} placeholder="Isi saat kalian mencapai keputusan bersama"/></label>
 <button className="btn btn-primary span-2">{row?"Simpan perubahan":"Buat topik"}</button>
 </form>
}

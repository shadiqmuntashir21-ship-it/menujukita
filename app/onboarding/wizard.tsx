"use client";
import {useState} from "react";
import {ArrowLeft,ArrowRight,CheckCircle2,HeartHandshake,Lightbulb} from "lucide-react";
import CurrencyInput from "@/components/currency-input";
import {BrandLogo} from "@/components/brand";
import {activateWedding} from "./actions";

const steps=[{title:"Kenalan dengan kalian",description:"Nama pasangan menjadi identitas ruang wedding."},
 {title:"Cerita tentang acaranya",description:"Tanggal belum pasti? Tidak masalah, bisa dilengkapi nanti."},
 {title:"Tamu dan keuangan awal",description:"Isikan perkiraan saja. Semua dapat disesuaikan kemudian."},
 {title:"Bagaimana kalian bekerja?",description:"Pilih cara merencanakan agar tugas yang disarankan lebih relevan."},
 {title:"Siapkan ruang wedding",description:"Kami akan menyusun langkah persiapan dan panduan yang dapat langsung kalian coba."}];
export default function WeddingOnboarding({error}:{error?:string}){
 const[step,setStep]=useState(0);
 const[one,setOne]=useState("");
 const[two,setTwo]=useState("");
 const[date,setDate]=useState("");
 const[style,setStyle]=useState("couple");
 const[notice,setNotice]=useState("");
 const next=()=>{
  if(step===0&&(!one.trim()||!two.trim())){setNotice("Isi nama kedua pasangan untuk melanjutkan.");return}
  setNotice("");setStep(v=>Math.min(4,v+1));
 };
 const active=steps[step];
 return <main className="auth-page onboarding-page">
  <form action={activateWedding} className="auth-card stack onboarding-card" style={{maxWidth:680}}>
   <div className="brand"><BrandLogo className="auth-logo"/></div>
   <div style={{display:"flex",justifyContent:"space-between",gap:10,alignItems:"center"}}><span className="eyebrow">SIAPKAN WEDDING KALIAN</span><span style={{fontSize:12,color:"#68766b",fontWeight:700}}>{step+1} dari 5</span></div>
   <div aria-label="Progres pengaturan" style={{height:7,borderRadius:99,background:"#e8eae6",overflow:"hidden"}}><div style={{height:"100%",width:((step+1)/5*100)+"%",background:"#496958",borderRadius:99,transition:"width .2s"}}/></div>
   <div><h1 className="serif onboarding-title" style={{marginBottom:10}}>{active.title}</h1><p className="muted">{active.description}</p></div>
   {(error||notice)&&<div className="notice" role="alert">{notice|| (error==="activation"?"Pengaturan belum berhasil disimpan. Coba kembali.":"Periksa data yang diisi lalu coba lagi.")}</div>}
   <div style={{display:step===0?"grid":"none",gap:15}}>
    <label className="field"><span>Nama pasangan pertama</span><input className="input" name="one" value={one} onChange={e=>setOne(e.target.value)} placeholder="Contoh: Alya" required/></label>
    <label className="field"><span>Nama pasangan kedua</span><input className="input" name="two" value={two} onChange={e=>setTwo(e.target.value)} placeholder="Contoh: Raka" required/></label>
    <div style={{display:"flex",alignItems:"flex-start",gap:9,fontSize:13,color:"#5d695e",lineHeight:1.6}}><HeartHandshake size={19}/><span>Satu wedding akan menjadi ruang bersama kalian. Pasangan kedua dapat diajak bergabung ketika fitur akses pribadi sudah tersedia.</span></div>
   </div>
   <div style={{display:step===1?"grid":"none",gap:15}}>
    <label className="field"><span>Tanggal pernikahan (jika sudah tahu)</span><input className="input" type="date" name="date" value={date} onChange={e=>setDate(e.target.value)}/><small>Belum pasti? Boleh kosong. Nanti kalian bisa mengisinya lewat Pengaturan.</small></label>
    <label className="field"><span>Kota / lokasi acara</span><input className="input" name="city" placeholder="Misalnya: Palu"/></label>
    <div className="split"><label className="field"><span>Nama acara utama</span><input className="input" name="ceremony_name" defaultValue="Akad / Pemberkatan"/></label><label className="field"><span>Nama acara berikutnya (opsional)</span><input className="input" name="reception_name" defaultValue="Resepsi"/></label></div>
   </div>
   <div style={{display:step===2?"grid":"none",gap:15}}>
    <label className="field"><span>Target jumlah tamu (perkiraan)</span><input className="input" type="number" min="0" max="5000" name="guests" placeholder="Misalnya: 300"/><small>Jumlah tamu menentukan kebutuhan tempat, konsumsi dan biaya.</small></label>
    <label className="field"><span>Perkiraan anggaran keseluruhan</span><CurrencyInput name="budget" placeholder="Misalnya: 75.000.000"/><small>Anggaran adalah rencana biaya, bukan jumlah saldo uang yang sudah kalian miliki.</small></label>
    <div style={{display:"flex",gap:10,background:"#f0f4ed",borderRadius:14,padding:13,fontSize:13,lineHeight:1.6}}><Lightbulb size={18} style={{flexShrink:0}}/><span>Belum mengetahui anggaran? Biarkan kosong dan gunakan Panduan Keuangan setelah masuk.</span></div>
   </div>
   <div style={{display:step===3?"grid":"none",gap:15}}>
    <label className="field"><span>Cara kalian merencanakan pernikahan</span><select className="input" name="planning_style" value={style} onChange={e=>setStyle(e.target.value)}><option value="couple">Berdua secara mandiri</option><option value="family">Berdua dibantu keluarga</option><option value="couple_wo">Berdua dengan Wedding Organizer</option><option value="wo">Sebagian besar dikelola Wedding Organizer</option></select></label>
    <p className="muted" style={{fontSize:13}}>Pilihan ini membantu menentukan checklist awal. Semua fitur tetap dapat digunakan kapan saja.</p>
   </div>
   {step===4&&<section style={{display:"grid",gap:15,background:"#f4f5f1",borderRadius:18,padding:18}}>
    <b style={{fontSize:18}}>Ruang {one||"Pasangan A"} & {two||"Pasangan B"}</b>
    <div style={{display:"flex",gap:8,alignItems:"center"}}><CheckCircle2 size={18}/> {date?new Date(date+"T12:00:00").toLocaleDateString("id-ID",{day:"numeric",month:"long",year:"numeric"}):"Tanggal akan ditentukan kemudian"}</div>
    <div style={{display:"flex",gap:8,alignItems:"center"}}><CheckCircle2 size={18}/> {style==="couple"?"Direncanakan berdua":style==="family"?"Berdua dan keluarga":"Dengan bantuan Wedding Organizer"}</div>
    <p style={{fontSize:13,lineHeight:1.65,margin:0}}>Setelah diaktifkan, MenujuKita menyiapkan daftar tugas personal, tahapan perjalanan, panduan praktis, dan fitur wedding lainnya. Semua bisa diedit nanti.</p>
   </section>}
   <div style={{display:"flex",gap:10,justifyContent:"space-between",alignItems:"center",marginTop:5}}>
    {step>0?<button type="button" className="btn" onClick={()=>{setNotice("");setStep(v=>v-1)}}><ArrowLeft size={17}/> Kembali</button>:<span/>}
    {step<4?<button type="button" className="btn btn-primary" onClick={next}>Lanjut <ArrowRight size={17}/></button>:<button type="submit" className="btn btn-primary">Siapkan Wedding Studio <ArrowRight size={17}/></button>}
   </div>
  </form>
 </main>
}

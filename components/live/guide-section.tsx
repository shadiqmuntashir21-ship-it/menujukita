"use client";
import {useEffect,useMemo,useState} from "react";
import {ArrowRight,BookOpen,CalendarDays,ChevronDown,ClipboardCheck,HelpCircle,Lightbulb,Search,UsersRound} from "lucide-react";
import {WEDDING_GUIDES,WEDDING_PHASES,guideById,guideForTask,type WeddingGuide,type WeddingPhase} from "@/lib/wedding-guides";

function navigate(view:string){
 window.dispatchEvent(new CustomEvent("menujukita:navigate",{detail:view}));
}
export function GuideInline({title,category}:{title:string;category?:string}){
 const g=guideForTask(title,category);
 return <details className="mk-task-guide" style={{marginTop:14,border:"1px solid var(--line, #e4e5e1)",borderRadius:16,padding:"12px 14px",background:"#f8f8f5"}}>
  <summary style={{cursor:"pointer",fontWeight:650,display:"flex",gap:8,alignItems:"center",listStyle:"none"}}><BookOpen size={16}/> Pelajari cara mengerjakan tugas ini <ChevronDown size={15} style={{marginLeft:"auto"}}/></summary>
  <div style={{display:"grid",gap:12,paddingTop:13,fontSize:14,lineHeight:1.65}}>
   <p style={{margin:0}}><b>Mengapa penting?</b> {g.why}</p>
   <p style={{margin:0}}><b>Kapan?</b> {g.when}</p>
   <ol style={{paddingLeft:21,margin:0}}>{g.steps.map((step,i)=><li key={i}>{step}</li>)}</ol>
   {g.questions.length>0&&<div><b>Pertanyaan yang perlu dipikirkan</b><ul style={{paddingLeft:21,margin:"6px 0 0"}}>{g.questions.map(q=><li key={q}>{q}</li>)}</ul></div>}
   <p style={{margin:0}}><b>Berikutnya:</b> {g.next}</p>
   <button type="button" className="btn" style={{justifySelf:"start"}} onClick={()=>{window.dispatchEvent(new CustomEvent("menujukita:open-guide",{detail:g.id}));navigate("guide")}}>Baca panduan lengkap <ArrowRight size={15}/></button>
  </div>
 </details>
}
export default function GuideSection(){
 const[category,setCategory]=useState<WeddingPhase|"Semua">("Semua");
 const[query,setQuery]=useState("");
 const[chosen,setChosen]=useState<string|null>(null);
 useEffect(()=>{
  const open=(e:Event)=>{const id=String((e as CustomEvent).detail||"");if(WEDDING_GUIDES.some(g=>g.id===id)){setChosen(id);setQuery("");setCategory("Semua")}};
  window.addEventListener("menujukita:open-guide",open);
  return()=>window.removeEventListener("menujukita:open-guide",open);
 },[]);
 const filtered=useMemo(()=>WEDDING_GUIDES.filter(g=>(category==="Semua"||g.phase===category)&&(!query||[g.title,g.why,...g.keywords].join(" ").toLowerCase().includes(query.trim().toLowerCase()))),[category,query]);
 const selected=chosen?guideById(chosen):null;
 const panel:React.CSSProperties={border:"1px solid rgba(73,87,76,.13)",borderRadius:22,padding:20,background:"#fff"};
 return <section id="guide" className="module-stack" aria-labelledby="guide-heading">
   <header className="module-editorial-head"><div><span className="micro-label">PUSAT PANDUAN</span><h2 id="guide-heading" className="serif">Belajar sambil menyiapkan wedding.</h2><p>Pilih topik, pahami alasan dan langkahnya, lalu langsung kerjakan di ruang wedding kalian. Semua materi dapat dibuka ulang kapan saja.</p></div><BookOpen size={30}/></header>
   {selected?<article style={{...panel,display:"grid",gap:18}}>
     <button className="btn" style={{justifySelf:"start"}} onClick={()=>setChosen(null)}>← Semua panduan</button>
     <div><span className="micro-label">{selected.phase.toUpperCase()} · PANDUAN PRAKTIS</span><h3 className="serif" style={{fontSize:"clamp(27px,4vw,40px)",margin:"10px 0"}}>{selected.title}</h3></div>
     <div style={{background:"#f1f5ef",borderRadius:17,padding:17,display:"flex",gap:12}}><Lightbulb size={21} style={{flexShrink:0}}/><div><b>Mengapa penting?</b><p style={{margin:"6px 0 0",lineHeight:1.7}}>{selected.why}</p></div></div>
     <div style={{display:"flex",gap:10,alignItems:"flex-start"}}><CalendarDays size={19}/><div><b>Kapan dilakukan?</b><p style={{margin:"6px 0 0"}}>{selected.when}</p></div></div>
     <section style={{display:"grid",gap:12}}><h4 style={{fontSize:18,margin:0}}>Langkah praktis</h4>{selected.steps.map((step,i)=><div key={i} style={{display:"flex",gap:13,alignItems:"flex-start",borderBottom:"1px solid #eeece8",paddingBottom:12}}><span style={{flexShrink:0,background:"#edf1ec",padding:"5px 10px",borderRadius:99,fontWeight:700,fontSize:12}}>{i+1}</span><span style={{lineHeight:1.7}}>{step}</span></div>)}</section>
     <div style={{background:"#fbf7f3",padding:18,borderRadius:17}}><div style={{display:"flex",gap:9,alignItems:"center",marginBottom:8}}><HelpCircle size={18}/><b>Pertanyaan sebelum memutuskan</b></div><ul style={{paddingLeft:22,margin:0,lineHeight:1.8}}>{selected.questions.map(q=><li key={q}>{q}</li>)}</ul></div>
     <div style={{background:"#f2f5f0",padding:18,borderRadius:17}}><b>Langkah berikutnya</b><p style={{margin:"7px 0 12px",lineHeight:1.65}}>{selected.next}</p><button className="btn btn-primary" type="button" onClick={()=>navigate(selected.view)}>Buka fitur terkait <ArrowRight size={17}/></button></div>
     <small style={{color:"#64645c"}}>Rekomendasi umum. Kebutuhan adat, hukum, vendor dan jadwal dapat berbeda untuk setiap pasangan; konfirmasikan persyaratan resmi setempat.</small>
   </article>:<>
     <label style={{display:"flex",alignItems:"center",gap:9,...panel,padding:"11px 16px"}}><Search size={19}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Cari panduan: vendor, tabungan, tamu..." aria-label="Cari panduan" style={{border:0,outline:0,flex:1,font:"inherit",minWidth:0}}/></label>
     <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
      {(["Semua",...WEDDING_PHASES] as const).map(p=><button key={p} type="button" aria-pressed={category===p} onClick={()=>setCategory(p)} style={{border:"1px solid #dedbd6",borderRadius:99,padding:"8px 12px",background:category===p?"#29473d":"#fff",color:category===p?"#fff":"#465249",fontSize:13,fontWeight:600,cursor:"pointer"}}>{p}</button>)}
     </div>
     <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,270px),1fr))",gap:13}}>{filtered.map(g=><button key={g.id} type="button" onClick={()=>setChosen(g.id)} style={{...panel,textAlign:"left",cursor:"pointer",display:"grid",gap:10,color:"inherit",font:"inherit"}}>
      <span style={{display:"flex",gap:8,alignItems:"center",fontSize:12,color:"#66766a",fontWeight:700}}><ClipboardCheck size={16}/>{g.phase}</span>
      <b style={{fontSize:19,fontWeight:650,lineHeight:1.25}}>{g.title}</b>
      <span style={{color:"#626a62",fontSize:13,lineHeight:1.55}}>{g.why}</span>
      <span style={{fontSize:13,fontWeight:700,color:"#3f6653",display:"inline-flex",alignItems:"center",gap:5}}>Buka panduan <ArrowRight size={15}/></span>
     </button>)}</div>
     {filtered.length===0&&<div style={{...panel,textAlign:"center"}}>Belum ada panduan yang cocok. Coba kata kunci lain.</div>}
   </>}
   <aside style={{display:"flex",alignItems:"flex-start",gap:10,background:"#f1f2ed",padding:17,borderRadius:18,fontSize:13,lineHeight:1.6}}><UsersRound size={18}/><span>Kalian boleh mengikuti panduan sesuai kebutuhan. Tugas dapat dibagi dengan pasangan; keputusan besar sebaiknya didiskusikan bersama.</span></aside>
 </section>;
}

"use client";
import { CheckCircle2,HeartPulse,ImagePlus,Sparkles } from "lucide-react";
import { money,dateLabel } from "./shared";

const FALLBACK_COVER="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1800&q=88";

export default function HomeSection({wedding,metrics,priorities,payments,coverUrl}:{wedding:any;metrics:any;priorities:any[];payments:any[];coverUrl?:string}){
 const first=priorities.slice(0,4);
 const position=`${Number(wedding.cover_position_x??50)}% ${Number(wedding.cover_position_y??50)}%`;
 const overlay=Math.max(.18,Math.min(.78,Number(wedding.cover_overlay??.48)));
 const openSettings=()=>window.dispatchEvent(new CustomEvent("menujukita:navigate",{detail:"settings"}));
 return <section id="home" className="studio-home premium-home">
  <div className="couple-cover-hero" style={{backgroundImage:`linear-gradient(rgba(18,25,22,${overlay*.28}),rgba(18,25,22,${Math.min(.88,overlay+.2)})),url("${coverUrl||FALLBACK_COVER}")`,backgroundPosition:position}}>
   <div className="cover-top"><span className="micro-label light-label">RUANG WEDDING KALIAN</span><button className="cover-edit" onClick={openSettings}><ImagePlus size={15}/>Ganti foto</button></div>
   <div className="cover-content"><div><small>{wedding.city||"Menuju hari kalian"} · {dateLabel(wedding.wedding_date)}</small><h1 className="serif">{wedding.couple_one_name} <em>&</em> {wedding.couple_two_name}</h1><p>{metrics.days===0?"Hari yang kalian tunggu akhirnya tiba.":<><strong>{metrics.days} hari lagi</strong> menuju hari kalian.</>}</p><div className="cover-progress"><span><i style={{width:metrics.progress+"%"}}/></span><b>{metrics.progress}% siap</b></div></div>
    <div className="health-orbit cover-health" style={{"--health":metrics.health} as any}><div><b>{metrics.health}</b><span>Wedding Health</span><small>{metrics.healthLabel}</small></div></div>
   </div>
  </div>

  <div className="attention-layout premium-attention">
   <section className="attention-card"><div className="section-kicker"><Sparkles size={17}/><span>PRIORITAS MINGGU INI</span></div>
    {first.length?<div className="attention-list">{first.map((p,i)=><div className="attention-row" key={p.title+i}><span className="attention-index">{String(i+1).padStart(2,"0")}</span><span className="attention-copy"><b>{p.title}</b><small>{p.meta}</small></span><span className={"attention-kind kind-"+String(p.kind).toLowerCase()}>{p.kind}</span></div>)}</div>:<div className="calm-empty"><CheckCircle2 size={27}/><div><b>Semuanya terlihat terkendali.</b><span>Tidak ada hal mendesak yang perlu perhatian sekarang.</span></div></div>}
   </section>
   <aside className="today-stack">
    <div className="studio-stat safe-focus"><small>SAFE TO SPEND</small><strong>{money(metrics.safeToSpend)}</strong><span>setelah terbayar, komitmen & buffer</span></div>
    <div className="studio-stat"><small>PROGRES</small><strong>{metrics.progress}%</strong><div className="studio-progress"><span style={{width:metrics.progress+"%"}}/></div><span>{metrics.bookedVendors} vendor terkunci · {metrics.confirmedPax} pax terkonfirmasi</span></div>
    <div className="studio-stat compact-stat"><div><HeartPulse size={17}/><small>PEMBAYARAN TERDEKAT</small></div>{payments.filter((p:any)=>p.status!=="paid"&&p.status!=="cancelled").slice(0,2).map((p:any)=><p key={p.id}><b>{p.description}</b><span>{money(p.amount)} · {dateLabel(p.due_date)}</span></p>)}</div>
   </aside>
  </div>

  <div className="journey-glance premium-journey"><div><small>FONDASI</small><b>Setup wedding</b></div><span/><div><small>SEKARANG</small><b>Perencanaan</b></div><span/><div><small>BERIKUTNYA</small><b>Tamu & vendor</b></div><span/><div><small>AKHIR</small><b>Day-H</b></div></div>
 </section>
}

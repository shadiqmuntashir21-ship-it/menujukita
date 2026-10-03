import { CheckCircle2,HeartPulse,Sparkles } from "lucide-react";
import { money,dateLabel } from "./shared";
export default function HomeSection({wedding,metrics,priorities,payments}:{wedding:any;metrics:any;priorities:any[];payments:any[]}){
 const first=priorities.slice(0,4);
 return <section id="home" className="studio-home">
  <div className="home-editorial">
   <div><span className="micro-label">GOOD TO SEE YOU</span><h1 className="serif">{wedding.couple_one_name} <em>&</em> {wedding.couple_two_name}</h1><p>{metrics.days===0?"Hari yang kalian tunggu akhirnya tiba.":<><strong>{metrics.days} hari</strong> menuju hari kalian. Fokuskan energi ke hal yang benar-benar perlu dibereskan sekarang.</>}</p></div>
   <div className="health-orbit" style={{"--health":metrics.health} as any}><div><b>{metrics.health}</b><span>Wedding Health</span><small>{metrics.healthLabel}</small></div></div>
  </div>

  <div className="attention-layout">
   <section className="attention-card"><div className="section-kicker"><Sparkles size={17}/><span>WHAT NEEDS YOUR ATTENTION</span></div>
    {first.length?<div className="attention-list">{first.map((p,i)=><div className="attention-row" key={p.title+i}><span className="attention-index">{String(i+1).padStart(2,"0")}</span><span className="attention-copy"><b>{p.title}</b><small>{p.meta}</small></span><span className={"attention-kind kind-"+String(p.kind).toLowerCase()}>{p.kind}</span></div>)}</div>:<div className="calm-empty"><CheckCircle2 size={27}/><div><b>Semuanya terlihat terkendali.</b><span>Tidak ada hal mendesak yang perlu perhatian sekarang.</span></div></div>}
   </section>
   <aside className="today-stack">
    <div className="studio-stat safe-focus"><small>SAFE TO SPEND</small><strong>{money(metrics.safeToSpend)}</strong><span>setelah paid, committed & buffer</span></div>
    <div className="studio-stat"><small>PROGRESS</small><strong>{metrics.progress}%</strong><div className="studio-progress"><span style={{width:metrics.progress+"%"}}/></div><span>{metrics.bookedVendors} vendor secured · {metrics.confirmedPax} pax confirmed</span></div>
    <div className="studio-stat compact-stat"><div><HeartPulse size={17}/><small>PAYMENT TERDEKAT</small></div>{payments.filter((p:any)=>p.status!=="paid"&&p.status!=="cancelled").slice(0,2).map((p:any)=><p key={p.id}><b>{p.description}</b><span>{money(p.amount)} · {dateLabel(p.due_date)}</span></p>)}</div>
   </aside>
  </div>

  <div className="journey-glance"><div><small>YOUR JOURNEY</small><b>Foundation</b></div><span/><div><small>NOW</small><b>Planning</b></div><span/><div><small>NEXT</small><b>Guests</b></div><span/><div><small>FINISH</small><b>Day-H</b></div></div>
 </section>
}

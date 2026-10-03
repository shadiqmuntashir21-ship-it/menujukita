"use client";

import { useEffect,useMemo,useState } from "react";
import Link from "next/link";
import { Armchair,CalendarClock,CircleDollarSign,Home,ListChecks,RotateCcw,Store,UserRoundPlus,UsersRound } from "lucide-react";
import { demoSeed,type DemoState } from "@/lib/demo-data";

const money=(n:number)=>new Intl.NumberFormat("id-ID",{style:"currency",currency:"IDR",maximumFractionDigits:0}).format(n);
type Tab="home"|"plan"|"guests"|"money"|"vendors"|"seating"|"team"|"dayh";

export default function Demo(){
  const[tab,setTab]=useState<Tab>("home");
  const[data,setData]=useState<DemoState>(demoSeed);
  const[ready,setReady]=useState(false);
  useEffect(()=>{
    const saved=localStorage.getItem("menujukita_demo_v2");
    if(saved){try{setData(JSON.parse(saved))}catch{}}
    setReady(true);
  },[]);
  useEffect(()=>{if(ready)localStorage.setItem("menujukita_demo_v2",JSON.stringify(data))},[data,ready]);

  const done=data.tasks.filter(t=>t.status==="done").length;
  const progress=Math.round(done/data.tasks.length*100);
  const outstanding=data.payments.filter(p=>p.status!=="Paid").reduce((s,p)=>s+p.amount,0);
  const safe=Math.max(0,(data.budget-data.paid)-outstanding-6000000);
  const booked=data.vendors.filter(v=>v.status==="Booked").length;
  const liveHealth=Math.max(55,Math.min(96,Math.round(58+progress*.25+booked/data.vendors.length*15-(data.payments.some(p=>p.status==="Overdue")?8:0))));
  const nav:[Tab,any,string][]=[
    ["home",Home,"Home"],["plan",ListChecks,"Plan"],["guests",UsersRound,"Guests"],["money",CircleDollarSign,"Money"],
    ["vendors",Store,"Vendor"],["seating",Armchair,"Seating"],["team",UserRoundPlus,"Team"],["dayh",CalendarClock,"Day-H"]
  ];
  const reset=()=>{localStorage.removeItem("menujukita_demo_v2");setData(demoSeed);setTab("home")};
  const simulate=()=>setData(d=>({...d,days:Math.max(0,d.days-30),health:Math.max(55,d.health-8),payments:d.payments.map((p,i)=>i===0?{...p,due:"Overdue 2 hari",status:"Overdue"}:p)}));

  return <div className="demo-shell">
    <aside className="sidebar">
      <Link className="brand" href="/"><span className="brand-mark">M</span><span className="brand-copy"><strong>MenujuKita</strong><small>Demo Wedding</small></span></Link>
      <div className="side-menu">{nav.map(([id,I,label])=><button key={id} onClick={()=>setTab(id)} className={"side-link "+(tab===id?"active":"")}><I size={18}/>{label}</button>)}</div>
      <button className="side-link" onClick={reset}><RotateCcw size={18}/>Reset Demo</button>
    </aside>
    <main className="main">
      <div className="topline">
        <div><small className="muted">DEMO WEDDING · {data.date}</small><h2 style={{margin:"4px 0 0"}}>{data.couple}</h2></div>
        <Link className="btn btn-primary btn-sm" href="/auth/sign-up">Buat Wedding Saya</Link>
      </div>
      <div className="demo-banner"><span><b>Mode Demo</b> · bebas diutak-atik. Semua perubahan hanya tersimpan di browser ini.</span><div style={{display:"flex",gap:8,flexWrap:"wrap"}}><button className="btn btn-sm" onClick={simulate}>Simulasikan 30 Hari</button><button className="btn btn-sm" onClick={reset}>Reset</button></div></div>

      {tab==="home"&&<HomeTab data={data} progress={progress} health={liveHealth} safe={safe} booked={booked} setTab={setTab}/>}
      {tab==="plan"&&<PlanTab data={data} setData={setData}/>}
      {tab==="guests"&&<GuestsTab data={data} setData={setData} setTab={setTab}/>}
      {tab==="money"&&<MoneyTab data={data} setData={setData} safe={safe} outstanding={outstanding}/>}
      {tab==="vendors"&&<VendorsTab data={data}/>}
      {tab==="seating"&&<SeatingTab data={data}/>}
      {tab==="team"&&<TeamTab data={data}/>}
      {tab==="dayh"&&<DayHTab data={data}/>}
    </main>
    <nav className="mobile-nav">{nav.slice(0,5).map(([id,I,label])=><button key={id} onClick={()=>setTab(id)} className={tab===id?"active":""}><I size={18}/><br/>{label}</button>)}</nav>
  </div>
}

function HomeTab({data,progress,health,safe,booked,setTab}:{data:DemoState;progress:number;health:number;safe:number;booked:number;setTab:(v:Tab)=>void}){
  return <>
    <section className="dashboard-hero"><div><small>WEDDING COUNTDOWN</small><h2>{data.days} hari menuju hari kalian</h2><p style={{opacity:.82}}>{data.city} · Persiapan bergerak baik. Ada beberapa hal yang perlu perhatian minggu ini.</p></div><div className="health"><div><b>{health}</b><br/><small>{health>=75?"On Track":"Needs Attention"}</small></div></div></section>
    <div className="dashboard-grid">
      <div className="panel"><small className="muted">Progress</small><div className="big">{progress}%</div><div className="progress"><span style={{width:progress+"%"}}/></div></div>
      <div className="panel"><small className="muted">Budget Paid</small><div className="big">{money(data.paid)}</div><small className="muted">dari {money(data.budget)}</small></div>
      <div className="panel"><small className="muted">Guests</small><div className="big">{data.rsvp.attending}</div><small className="muted">confirmed pax</small></div>
      <div className="panel"><small className="muted">Vendors</small><div className="big">{booked}/{data.vendors.length}</div><small className="muted">secured</small></div>
    </div>
    <div className="content-grid">
      <section className="panel"><div className="module-head"><div><small className="muted">WHAT SHOULD I DO NEXT?</small><h3>Prioritas berikutnya</h3></div></div><div className="list">{data.tasks.filter(t=>t.status==="todo").slice(0,5).map((t,i)=><div className="row" key={t.id}><span className="priority-number">{String(i+1).padStart(2,"0")}</span><div className="row-grow"><div className="row-title">{t.title}</div><small>{t.category} · {t.due}</small></div><span className={"badge "+(t.priority==="critical"?"badge-danger":"")}>{t.priority}</span></div>)}</div><button className="btn btn-sm" style={{marginTop:12}} onClick={()=>setTab("plan")}>Buka Checklist</button></section>
      <aside className="stack">
        <section className="panel safe-card"><small>Wedding Safe to Spend</small><div className="big">{money(safe)}</div><p style={{opacity:.8}}>Setelah payment commitment dan buffer simulasi.</p></section>
        <section className="panel"><h3>Coba Demo dalam 2 menit</h3><div className="demo-guide"><button onClick={()=>setTab("plan")}>1 · Centang checklist</button><button onClick={()=>setTab("money")}>2 · Ubah budget</button><button onClick={()=>setTab("guests")}>3 · Simulasikan RSVP</button><button onClick={()=>setTab("seating")}>4 · Lihat seating</button><button onClick={()=>setTab("team")}>5 · Lihat collaboration</button><button onClick={()=>setTab("dayh")}>6 · Masuk Day-H Mode</button></div></section>
      </aside>
    </div>
  </>
}

function PlanTab({data,setData}:{data:DemoState;setData:React.Dispatch<React.SetStateAction<DemoState>>}){
  return <div className="workspace-grid"><section className="panel"><div className="module-head"><div><small className="muted">SMART CHECKLIST</small><h3>Persiapan kalian</h3></div><span className="badge">{data.tasks.filter(t=>t.status==="done").length}/{data.tasks.length} selesai</span></div><div className="list">{data.tasks.map(t=><button key={t.id} className={"row demo-task "+(t.status==="done"?"row-done":"")} onClick={()=>setData(d=>({...d,tasks:d.tasks.map(x=>x.id===t.id?{...x,status:x.status==="done"?"todo":"done"}:x)}))}><span className={"check-button "+(t.status==="done"?"checked":"")}>{t.status==="done"?"✓":""}</span><div className="row-grow" style={{textAlign:"left"}}><div className="row-title">{t.title}</div><small>{t.category} · {t.due}</small></div><span className="badge">{t.priority}</span></button>)}</div></section>
  <aside className="panel"><h3>Timeline wedding</h3><div className="timeline-list"><div className="timeline-item"><div className="time-box">H-134</div><div><b>Sekarang</b><small>Finalisasi vendor dan pembayaran utama.</small></div></div><div className="timeline-item"><div className="time-box">H-60</div><div><b>Guest confirmation</b><small>Mulai follow-up RSVP secara aktif.</small></div></div><div className="timeline-item"><div className="time-box">H-21</div><div><b>Final guest count</b><small>Kunci jumlah ke catering dan seating.</small></div></div><div className="timeline-item"><div className="time-box">H-7</div><div><b>Vendor confirmation</b><small>Final briefing dan rundown.</small></div></div></div></aside></div>
}

function GuestsTab({data,setData,setTab}:{data:DemoState;setData:React.Dispatch<React.SetStateAction<DemoState>>;setTab:(v:Tab)=>void}){
  return <><div className="dashboard-grid"><div className="panel"><small className="muted">Target</small><div className="big">{data.targetGuests}</div></div><div className="panel"><small className="muted">Hadir</small><div className="big">{data.rsvp.attending}</div></div><div className="panel"><small className="muted">Tidak hadir</small><div className="big">{data.rsvp.declined}</div></div><div className="panel"><small className="muted">Menunggu</small><div className="big">{data.rsvp.waiting}</div></div></div>
  <div className="content-grid"><section className="panel"><h3>Preview RSVP publik</h3><p className="muted">Simulasikan satu keluarga membuka link RSVP dan mengonfirmasi dua orang hadir.</p><div className="invitee"><small>Undangan untuk</small><h2>Keluarga Bapak Ahmad</h2><span>Maksimal 4 orang</span></div><button className="btn btn-primary" onClick={()=>setData(d=>({...d,rsvp:{...d.rsvp,attending:d.rsvp.attending+2,waiting:Math.max(0,d.rsvp.waiting-1)}}))}>Konfirmasi Hadir · 2 Orang</button></section><aside className="panel"><h3>Setelah RSVP</h3><p className="muted">Counter dashboard langsung berubah. Pada workspace live, respons disimpan ke Neon dan dapat berbeda per event.</p><button className="btn btn-sm" onClick={()=>setTab("seating")}>Lihat Seating Plan</button></aside></div></>
}

function MoneyTab({data,setData,safe,outstanding}:{data:DemoState;setData:React.Dispatch<React.SetStateAction<DemoState>>;safe:number;outstanding:number}){
 return <><div className="dashboard-grid"><div className="panel"><small className="muted">Total Budget</small><div className="big">{money(data.budget)}</div></div><div className="panel"><small className="muted">Paid</small><div className="big">{money(data.paid)}</div></div><div className="panel"><small className="muted">Committed</small><div className="big">{money(outstanding)}</div></div><div className="panel safe-card"><small>Safe to Spend</small><div className="big">{money(safe)}</div></div></div><div className="content-grid"><section className="panel stack"><h3>Uji Budget</h3><div className="split"><div className="field"><label>Total Budget</label><input className="input" type="number" value={data.budget} onChange={e=>setData(d=>({...d,budget:Number(e.target.value)}))}/></div><div className="field"><label>Sudah Dibayar</label><input className="input" type="number" value={data.paid} onChange={e=>setData(d=>({...d,paid:Number(e.target.value)}))}/></div></div><div className="formula-box"><span>{money(data.budget-data.paid)}</span><b>− {money(outstanding)} committed</b><b>− {money(6000000)} buffer</b><strong>= {money(safe)}</strong></div></section><aside className="panel"><h3>Payment Tracker</h3><div className="list">{data.payments.map(p=><div className="row" key={p.title}><div className="row-grow"><b>{p.title}</b><small>{p.due}</small></div><div><b>{money(p.amount)}</b><br/><span className={"badge "+(p.status==="Overdue"?"badge-danger":"")}>{p.status}</span></div></div>)}</div></aside></div></>
}

function VendorsTab({data}:{data:DemoState}){
 return <section className="panel"><div className="module-head"><div><small className="muted">VENDOR COMMAND CENTER</small><h3>Vendor wedding</h3></div><span className="badge">{data.vendors.filter(v=>v.status==="Booked").length} booked</span></div><div className="list">{data.vendors.map(v=><div className="row" key={v.name}><div className="row-grow"><div className="row-title">{v.name}</div><small>{v.category} · {v.contact}</small></div><b>{money(v.price)}</b><span className="badge">{v.status}</span></div>)}</div></section>
}

function SeatingTab({data}:{data:DemoState}){
 return <section className="panel"><div className="module-head"><div><small className="muted">SEATING PLAN</small><h3>Susunan meja</h3></div><span className="badge">{data.seating.length} meja contoh</span></div><div className="seating-grid">{data.seating.map(t=><article className="seat-card" key={t.name}><div className="seat-head"><div><Armchair size={19}/><b>{t.name}</b><small>Resepsi</small></div><span className="badge">{t.guests.length}/{t.capacity}</span></div><div className="seat-people">{t.guests.map(g=><div className="seat-person" key={g}><span>{g}</span><small>1 party</small></div>)}</div></article>)}</div></section>
}

function TeamTab({data}:{data:DemoState}){
 return <div className="content-grid"><section className="panel"><div className="module-head"><div><small className="muted">COLLABORATION</small><h3>Wedding Team</h3></div><span className="badge">{data.members.length} member</span></div><div className="list">{data.members.map(m=><div className="row" key={m.name}><div className="member-avatar">{m.name.slice(0,1)}</div><div className="row-grow"><b>{m.name}</b><small>{m.role} · {m.access}</small></div></div>)}</div></section><aside className="panel"><h3>Permission demo</h3><p className="muted">Owner memiliki akses penuh. Partner dapat mengatur planning. Collaborator/WO fokus operasional. Viewer hanya melihat. Budget dapat diberi izin terpisah.</p><div className="empty-mini">Pada workspace live, undangan member memakai secure invite link.</div></aside></div>
}

function DayHTab({data}:{data:DemoState}){
 const next=data.rundown.find(r=>r.status==="next")||data.rundown.find(r=>r.status==="upcoming");
 return <div className="dayh-demo"><section className="dayh-now"><small>NEXT UP</small><div className="dayh-time">{next?.time||"--:--"}</div><h2>{next?.activity||"Rundown selesai"}</h2><p>{next?.location}</p></section><div className="content-grid"><section className="panel"><h3>Rundown hari H</h3><div className="timeline-list">{data.rundown.map(r=><div className="timeline-item" key={r.time+r.activity}><div className="time-box">{r.time}</div><div className="row-grow"><b>{r.activity}</b><small>{r.location}</small></div><span className="badge">{r.status}</span></div>)}</div></section><aside className="panel"><h3>Quick Access</h3><div className="stat-line"><span>Vendor booked</span><b>{data.vendors.filter(v=>v.status==="Booked").length}</b></div><div className="stat-line"><span>Confirmed pax</span><b>{data.rsvp.attending}</b></div><div className="stat-line"><span>Outstanding payments</span><b>{data.payments.filter(p=>p.status!=="Paid").length}</b></div><p className="muted">Mode ini sengaja menyederhanakan UI agar pasangan/WO fokus pada eksekusi saat hari H.</p></aside></div></div>
}

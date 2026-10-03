"use client";

import { useState } from "react";
import {
  CalendarClock, Check, CircleDollarSign, ClipboardList, CreditCard, Home,
  Plus, Store, Trash2, UsersRound, WalletCards
} from "lucide-react";
import {
  addBudgetItem, addGuest, addPayment, addRundownItem, addTask, addVendor,
  deleteBudgetItem, deleteGuest, deletePayment, deleteRundownItem, deleteTask, deleteVendor,
  markPaymentPaid, setGuestRsvp, toggleTask, updateFunds, updateRundownStatus, updateVendorStatus
} from "./actions";

type Props = {
  wedding:any; summary:any; tasks:any[]; vendors:any[]; budgetItems:any[]; payments:any[];
  guests:any[]; rundown:any[]; priorities:any[]; health:number; healthLabel:string; safeToSpend:number; days:number;
};

const money=(n:number)=>new Intl.NumberFormat("id-ID",{style:"currency",currency:"IDR",maximumFractionDigits:0}).format(Number(n||0));
const date=(v:string)=>v?new Intl.DateTimeFormat("id-ID",{day:"2-digit",month:"short",year:"numeric"}).format(new Date(v)):"—";

export default function LiveWorkspace(p:Props){
  const [tab,setTab]=useState("home");
  const [dayMode,setDayMode]=useState(false);
  const nav=[
    ["home",Home,"Home"],["plan",ClipboardList,"Plan"],["money",CircleDollarSign,"Money"],
    ["vendors",Store,"Vendor"],["guests",UsersRound,"Guests"],["rundown",CalendarClock,"Rundown"]
  ];
  if(dayMode) return <DayMode {...p} onExit={()=>setDayMode(false)}/>;
  return <div className="demo-shell">
    <aside className="sidebar">
      <a className="brand" href="/"><span className="brand-mark">M</span><span className="brand-copy"><strong>MenujuKita</strong><small>Live Workspace</small></span></a>
      <div className="side-menu">{nav.map(([id,I,label]:any)=><button key={id} onClick={()=>setTab(id)} className={"side-link "+(tab===id?"active":"")}><I size={18}/>{label}</button>)}</div>
      <button className="side-link dayh-entry" onClick={()=>setDayMode(true)}><CalendarClock size={18}/>Day-H Mode</button>
    </aside>
    <main className="main">
      <div className="topline"><div><small className="muted">LIVE WEDDING</small><h2 style={{margin:"4px 0 0"}}>{p.wedding.couple_one_name} & {p.wedding.couple_two_name}</h2></div><span className="badge">Cloud · Neon</span></div>
      {tab==="home"&&<Dashboard {...p} setTab={setTab}/>}
      {tab==="plan"&&<Plan tasks={p.tasks}/>}
      {tab==="money"&&<Money wedding={p.wedding} items={p.budgetItems} payments={p.payments} vendors={p.vendors} safe={p.safeToSpend}/>}
      {tab==="vendors"&&<Vendors vendors={p.vendors}/>}
      {tab==="guests"&&<Guests guests={p.guests}/>}
      {tab==="rundown"&&<Rundown items={p.rundown} wedding={p.wedding}/>}
    </main>
    <nav className="mobile-nav">{nav.slice(0,5).map(([id,I,label]:any)=><button key={id} onClick={()=>setTab(id)} className={tab===id?"active":""}><I size={18}/><br/>{label}</button>)}</nav>
  </div>
}

function Dashboard(p:Props&{setTab:(v:string)=>void}){
  return <>
    <section className="dashboard-hero"><div><small>WEDDING COUNTDOWN</small><h2>{p.days} hari menuju hari kalian</h2><p style={{opacity:.82}}>Fokus pada hal yang paling penting. MenujuKita menghitung prioritas dari data wedding kalian.</p></div><div className="health"><div><b>{p.health}</b><br/><small>{p.healthLabel}</small></div></div></section>
    <div className="dashboard-grid">
      <div className="panel"><small className="muted">Progress</small><div className="big">{p.summary.progress}%</div><div className="progress"><span style={{width:p.summary.progress+"%"}}/></div></div>
      <div className="panel"><small className="muted">Safe to Spend</small><div className="big">{money(p.safeToSpend)}</div><small className="muted">setelah komitmen + buffer</small></div>
      <div className="panel"><small className="muted">Guests</small><div className="big">{p.summary.attending}</div><small className="muted">{p.summary.waiting} menunggu RSVP</small></div>
      <div className="panel"><small className="muted">Vendors</small><div className="big">{p.summary.bookedVendors}</div><small className="muted">booked dari {p.summary.vendorTotal}</small></div>
    </div>
    <div className="content-grid">
      <section className="panel"><div className="panel-title"><div><h3>What should I do next?</h3><p className="muted compact">Prioritas otomatis dari deadline, pembayaran, vendor, dan RSVP.</p></div></div>
        <div className="list">{p.priorities.length?p.priorities.slice(0,5).map((x:any,i)=><div className="priority-row" key={i}><span className={"priority-dot "+x.level}/><div><b>{x.title}</b><small>{x.meta}</small></div></div>):<div className="empty-mini">Semua aman. Belum ada prioritas mendesak.</div>}</div>
        <button className="btn btn-sm" style={{marginTop:14}} onClick={()=>p.setTab("plan")}>Buka Checklist</button>
      </section>
      <aside className="panel"><h3>Wedding Health</h3><div className="health-breakdown">
        <Metric label="Tasks" value={p.summary.taskScore}/>
        <Metric label="Budget" value={p.summary.budgetScore}/>
        <Metric label="Vendors" value={p.summary.vendorScore}/>
        <Metric label="Payments" value={p.summary.paymentScore}/>
        <Metric label="Guests" value={p.summary.guestScore}/>
      </div></aside>
    </div>
  </>
}
function Metric({label,value}:{label:string,value:number}){return <div className="metric"><div><b>{label}</b><span>{value}/100</span></div><div className="progress"><span style={{width:value+"%"}}/></div></div>}

function Plan({tasks}:{tasks:any[]}){
 return <div className="workspace-grid"><section className="panel">
   <div className="panel-title"><div><h3>Smart Checklist</h3><p className="muted compact">{tasks.filter(x=>x.status==="done").length} dari {tasks.length} selesai</p></div></div>
   <div className="list">{tasks.length?tasks.map(t=><div className="row" key={t.id}><form action={toggleTask}><input type="hidden" name="id" value={t.id}/><button className={"check-btn "+(t.status==="done"?"done":"")} aria-label="toggle"><Check size={15}/></button></form><div className="row-grow"><div className="row-title" style={{textDecoration:t.status==="done"?"line-through":"none"}}>{t.title}</div><small>{t.category} · {t.due_date?date(t.due_date):"Tanpa deadline"} · {t.priority}</small></div><form action={deleteTask}><input type="hidden" name="id" value={t.id}/><button className="icon-btn danger" aria-label="hapus"><Trash2 size={16}/></button></form></div>):<div className="empty-mini">Belum ada task.</div>}</div>
 </section><aside className="panel"><h3>Tambah Task</h3><form action={addTask} className="stack"><input className="input" name="title" placeholder="Contoh: Finalisasi menu catering" required/><div className="split"><input className="input" name="category" placeholder="Kategori"/><select className="input" name="priority" defaultValue="medium"><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="critical">Critical</option></select></div><input className="input" type="date" name="due_date"/><button className="btn btn-primary"><Plus size={16}/>Tambah Task</button></form></aside></div>
}

function Money({wedding,items,payments,vendors,safe}:{wedding:any,items:any[],payments:any[],vendors:any[],safe:number}){
 const paid=payments.filter(x=>x.status==="paid").reduce((s,x)=>s+Number(x.amount||0),0);
 const planned=items.reduce((s,x)=>s+Number(x.planned_amount||0),0);
 return <><div className="dashboard-grid">
  <div className="panel"><small className="muted">Total Budget</small><div className="big">{money(wedding.budget_total)}</div></div>
  <div className="panel"><small className="muted">Planned</small><div className="big">{money(planned)}</div></div>
  <div className="panel"><small className="muted">Paid</small><div className="big">{money(paid)}</div></div>
  <div className="panel"><small className="muted">Safe to Spend</small><div className="big">{money(safe)}</div></div>
 </div>
 <div className="workspace-grid">
  <section className="panel"><h3>Budget Items</h3><div className="list">{items.length?items.map(x=><div className="row" key={x.id}><div className="row-grow"><b>{x.name}</b><small>Planned {money(x.planned_amount)} · Actual {money(x.actual_amount)} · Paid {money(x.paid_amount)}</small></div><form action={deleteBudgetItem}><input type="hidden" name="id" value={x.id}/><button className="icon-btn danger"><Trash2 size={16}/></button></form></div>):<div className="empty-mini">Belum ada budget item.</div>}</div>
    <h3 className="subhead">Payments</h3><div className="list">{payments.length?payments.map(x=><div className="row" key={x.id}><form action={markPaymentPaid}><input type="hidden" name="id" value={x.id}/><button className={"check-btn "+(x.status==="paid"?"done":"")}><Check size={15}/></button></form><div className="row-grow"><b>{x.description}</b><small>{money(x.amount)} · {x.due_date?date(x.due_date):"Tanpa jatuh tempo"} · {x.status}</small></div><form action={deletePayment}><input type="hidden" name="id" value={x.id}/><button className="icon-btn danger"><Trash2 size={16}/></button></form></div>):<div className="empty-mini">Belum ada pembayaran.</div>}</div>
  </section>
  <aside className="stack">
   <section className="panel"><h3>Dana Wedding</h3><form action={updateFunds} className="stack"><input className="input" name="budget_total" type="number" defaultValue={Number(wedding.budget_total||0)} placeholder="Total budget"/><input className="input" name="available_funds" type="number" defaultValue={Number(wedding.available_funds||0)} placeholder="Dana tersedia"/><input className="input" name="reserve_buffer" type="number" defaultValue={Number(wedding.reserve_buffer||0)} placeholder="Buffer"/><button className="btn btn-primary">Simpan Dana</button></form></section>
   <section className="panel"><h3>Tambah Budget Item</h3><form action={addBudgetItem} className="stack"><input className="input" name="name" placeholder="Contoh: Catering" required/><input className="input" name="planned_amount" type="number" placeholder="Planned"/><input className="input" name="actual_amount" type="number" placeholder="Actual"/><input className="input" name="paid_amount" type="number" placeholder="Paid"/><input className="input" name="due_date" type="date"/><button className="btn"><Plus size={16}/>Tambah</button></form></section>
   <section className="panel"><h3>Tambah Payment</h3><form action={addPayment} className="stack"><input className="input" name="description" placeholder="Contoh: DP dekorasi" required/><input className="input" name="amount" type="number" min="1" placeholder="Nominal" required/><input className="input" name="due_date" type="date"/><select className="input" name="vendor_id" defaultValue=""><option value="">Tanpa vendor</option>{vendors.map(v=><option value={v.id} key={v.id}>{v.name}</option>)}</select><button className="btn"><CreditCard size={16}/>Tambah Payment</button></form></section>
  </aside>
 </div></>
}

function Vendors({vendors}:{vendors:any[]}){
 return <div className="workspace-grid"><section className="panel"><h3>Vendor Manager</h3><div className="list">{vendors.length?vendors.map(v=><div className="row" key={v.id}><div className="row-grow"><b>{v.name}</b><small>{v.category} · {money(v.agreed_price||v.quoted_price)} {v.whatsapp?"· WA "+v.whatsapp:""}</small></div><form action={updateVendorStatus} className="inline-form"><input type="hidden" name="id" value={v.id}/><select className="mini-select" name="status" defaultValue={v.status} onChange={e=>e.currentTarget.form?.requestSubmit()}><option value="searching">Searching</option><option value="shortlisted">Shortlisted</option><option value="contacted">Contacted</option><option value="negotiating">Negotiating</option><option value="booked">Booked</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option></select></form><form action={deleteVendor}><input type="hidden" name="id" value={v.id}/><button className="icon-btn danger"><Trash2 size={16}/></button></form></div>):<div className="empty-mini">Belum ada vendor.</div>}</div></section>
 <aside className="panel"><h3>Tambah Vendor</h3><form action={addVendor} className="stack"><input className="input" name="name" placeholder="Nama vendor" required/><input className="input" name="category" placeholder="Kategori (Venue, Catering...)"/><div className="split"><input className="input" name="pic_name" placeholder="PIC"/><input className="input" name="whatsapp" placeholder="WhatsApp"/></div><input className="input" name="instagram" placeholder="Instagram"/><div className="split"><input className="input" type="number" name="quoted_price" placeholder="Harga penawaran"/><input className="input" type="number" name="agreed_price" placeholder="Harga deal"/></div><select className="input" name="status" defaultValue="searching"><option value="searching">Searching</option><option value="shortlisted">Shortlisted</option><option value="contacted">Contacted</option><option value="negotiating">Negotiating</option><option value="booked">Booked</option></select><textarea className="input" name="notes" placeholder="Catatan"/><button className="btn btn-primary"><Plus size={16}/>Tambah Vendor</button></form></aside></div>
}

function Guests({guests}:{guests:any[]}){
 return <div className="workspace-grid"><section className="panel"><h3>Guest & RSVP</h3><div className="list">{guests.length?guests.map(g=><div className="row" key={g.id}><div className="row-grow"><b>{g.name}</b><small>{g.group_name} · max {g.max_pax} pax · {g.rsvp_status}</small><code className="rsvp-link">{g.rsvp_path}</code></div><form action={setGuestRsvp} className="inline-form"><input type="hidden" name="id" value={g.id}/><select className="mini-select" name="status" defaultValue={g.rsvp_status} onChange={e=>e.currentTarget.form?.requestSubmit()}><option value="waiting">Waiting</option><option value="attending">Attending</option><option value="not_attending">Not attending</option><option value="maybe">Maybe</option></select></form><form action={deleteGuest}><input type="hidden" name="id" value={g.id}/><button className="icon-btn danger"><Trash2 size={16}/></button></form></div>):<div className="empty-mini">Belum ada tamu.</div>}</div></section>
 <aside className="panel"><h3>Tambah Tamu</h3><form action={addGuest} className="stack"><input className="input" name="name" placeholder="Nama / keluarga" required/><input className="input" name="phone" placeholder="WhatsApp"/><div className="split"><select className="input" name="side"><option value="partner_one">Keluarga Pasangan 1</option><option value="partner_two">Keluarga Pasangan 2</option><option value="shared">Bersama</option><option value="other">Lainnya</option></select><input className="input" name="group_name" placeholder="Family / Friends / Work"/></div><input className="input" name="max_pax" type="number" min="1" max="20" defaultValue="2"/><button className="btn btn-primary"><Plus size={16}/>Tambah Tamu</button></form></aside></div>
}

function Rundown({items,wedding}:{items:any[],wedding:any}){
 return <div className="workspace-grid"><section className="panel"><h3>Wedding Day Rundown</h3><div className="timeline-list">{items.length?items.map(x=><div className="timeline-item" key={x.id}><div className="time-box">{new Intl.DateTimeFormat("id-ID",{hour:"2-digit",minute:"2-digit"}).format(new Date(x.starts_at))}</div><div className="row-grow"><b>{x.activity}</b><small>{x.location||"Lokasi belum diisi"} · {x.status}</small></div><form action={updateRundownStatus}><input type="hidden" name="id" value={x.id}/><select className="mini-select" name="status" defaultValue={x.status} onChange={e=>e.currentTarget.form?.requestSubmit()}><option value="upcoming">Upcoming</option><option value="ready">Ready</option><option value="in_progress">In progress</option><option value="done">Done</option><option value="delayed">Delayed</option></select></form><form action={deleteRundownItem}><input type="hidden" name="id" value={x.id}/><button className="icon-btn danger"><Trash2 size={16}/></button></form></div>):<div className="empty-mini">Belum ada rundown.</div>}</div></section>
 <aside className="panel"><h3>Tambah Rundown</h3><form action={addRundownItem} className="stack"><input className="input" name="activity" placeholder="Aktivitas" required/><input className="input" name="starts_at" type="datetime-local" required/><input className="input" name="location" placeholder="Lokasi"/><textarea className="input" name="notes" placeholder="Catatan"/><button className="btn btn-primary"><Plus size={16}/>Tambah Rundown</button></form></aside></div>
}

function DayMode(p:Props&{onExit:()=>void}){
 const now=Date.now(); const sorted=[...p.rundown].sort((a,b)=>new Date(a.starts_at).getTime()-new Date(b.starts_at).getTime());
 const next=sorted.find(x=>new Date(x.starts_at).getTime()>=now)||sorted[sorted.length-1];
 return <main className="dayh"><div className="dayh-top"><div><small>DAY-H MODE</small><h1 className="serif">{p.wedding.couple_one_name} & {p.wedding.couple_two_name}</h1></div><button className="btn" onClick={p.onExit}>Kembali ke Planner</button></div><section className="dayh-focus"><span>NEXT</span><h2>{next?.activity||"Rundown belum diisi"}</h2><p>{next?new Intl.DateTimeFormat("id-ID",{hour:"2-digit",minute:"2-digit"}).format(new Date(next.starts_at)):""} {next?.location?"· "+next.location:""}</p></section><div className="dayh-grid"><section className="panel"><h3>Rundown</h3><div className="timeline-list">{sorted.map(x=><div className="timeline-item" key={x.id}><div className="time-box">{new Intl.DateTimeFormat("id-ID",{hour:"2-digit",minute:"2-digit"}).format(new Date(x.starts_at))}</div><div className="row-grow"><b>{x.activity}</b><small>{x.status}</small></div></div>)}</div></section><aside className="panel"><h3>Quick Status</h3><div className="stat-line"><span>Vendor booked</span><b>{p.summary.bookedVendors}/{p.summary.vendorTotal}</b></div><div className="stat-line"><span>Guest confirmed</span><b>{p.summary.attending}</b></div><div className="stat-line"><span>Safe to Spend</span><b>{money(p.safeToSpend)}</b></div></aside></div></main>
}

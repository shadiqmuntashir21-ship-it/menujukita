import Link from "next/link";
import { CalendarClock, CircleDollarSign, Home, ListChecks, Store, UsersRound } from "lucide-react";
import { requireWorkspace } from "@/lib/workspace";
import HomeSection from "@/components/live/home-section";
import PlanSection from "@/components/live/plan-section";
import MoneySection from "@/components/live/money-section";
import GuestsSection from "@/components/live/guests-section";
import VendorsSection from "@/components/live/vendors-section";

export const dynamic="force-dynamic";

const n=(v:any)=>Number(v||0);
const diffDays=(v:any)=>{if(!v)return 9999;const d=new Date(v);return Math.ceil((d.getTime()-Date.now())/86400000)};

export default async function Page(){
  const {db,wedding}=await requireWorkspace();
  const [tasks,vendors,budgetItems,paymentsRaw,guests,rundown]=await Promise.all([
    db`SELECT * FROM tasks WHERE wedding_id=${wedding.id} ORDER BY (status='done') ASC,due_date NULLS LAST,sort_order,created_at`,
    db`SELECT * FROM vendors WHERE wedding_id=${wedding.id} ORDER BY CASE status WHEN 'booked' THEN 1 WHEN 'negotiating' THEN 2 WHEN 'shortlisted' THEN 3 ELSE 4 END,created_at DESC`,
    db`SELECT * FROM budget_items WHERE wedding_id=${wedding.id} ORDER BY created_at DESC`,
    db`SELECT p.*,CASE WHEN p.status='upcoming' AND p.due_date<CURRENT_DATE THEN 'overdue' ELSE p.status END AS display_status FROM payments p WHERE wedding_id=${wedding.id} ORDER BY (p.status='paid') ASC,p.due_date NULLS LAST,p.created_at DESC`,
    db`SELECT * FROM guests WHERE wedding_id=${wedding.id} ORDER BY created_at DESC`,
    db`SELECT * FROM rundown_items WHERE wedding_id=${wedding.id} ORDER BY starts_at,sort_order`
  ]);

  const payments=(paymentsRaw as any[]).map(p=>({...p,status:p.display_status||p.status}));
  const total=tasks.length;
  const done=tasks.filter((t:any)=>t.status==="done").length;
  const progress=total?Math.round(done/total*100):0;
  const days=wedding.wedding_date?Math.max(0,diffDays(wedding.wedding_date)):0;
  const planned=budgetItems.reduce((s:any,b:any)=>s+n(b.planned_amount),0);
  const actual=budgetItems.reduce((s:any,b:any)=>s+n(b.actual_amount||b.planned_amount),0);
  const budgetPaid=budgetItems.reduce((s:any,b:any)=>s+n(b.paid_amount),0);
  const paymentPaid=payments.filter((p:any)=>p.status==="paid").reduce((s:any,p:any)=>s+n(p.amount),0);
  const paid=payments.length?paymentPaid:budgetPaid;
  const committed=payments.filter((p:any)=>p.status!=="paid"&&p.status!=="cancelled").reduce((s:any,p:any)=>s+n(p.amount),0);
  const moneyBase=n(wedding.available_funds)>0?n(wedding.available_funds):n(wedding.budget_total);
  const safeToSpend=Math.max(0,moneyBase-committed-n(wedding.reserve_buffer));
  const bookedVendors=vendors.filter((v:any)=>["booked","completed"].includes(v.status)).length;
  const confirmedPax=guests.filter((g:any)=>g.rsvp_status==="attending").reduce((s:any,g:any)=>s+n(g.actual_pax||g.expected_pax||1),0);
  const overduePayments=payments.filter((p:any)=>p.status==="overdue").length;

  const taskScore=total?done/total*100:70;
  const budgetTotal=n(wedding.budget_total);
  const projection=actual||planned;
  const budgetScore=!budgetTotal?80:projection<=budgetTotal?100:Math.max(20,100-((projection-budgetTotal)/budgetTotal*100));
  const vendorScore=vendors.length?bookedVendors/vendors.length*100:(days>120?80:60);
  const paymentScore=Math.max(20,100-overduePayments*25);
  const guestRaw=n(wedding.guest_target)?Math.min(100,confirmedPax/n(wedding.guest_target)*100):80;
  const guestScore=days>60?Math.max(70,guestRaw):Math.max(40,guestRaw);
  const health=Math.round(taskScore*.35+budgetScore*.25+vendorScore*.20+paymentScore*.10+guestScore*.10);
  const healthLabel=health>=90?"Excellent":health>=75?"On Track":health>=60?"Needs Attention":"At Risk";

  const priorities:{title:string;meta:string;kind:string;score:number}[]=[];
  (tasks as any[]).filter(t=>t.status!=="done"&&t.due_date).forEach(t=>{
    const d=diffDays(t.due_date);
    if(d<0)priorities.push({title:t.title,meta:`Terlambat ${Math.abs(d)} hari`,kind:"Task",score:100+Math.abs(d)});
    else if(d<=14)priorities.push({title:t.title,meta:d===0?"Deadline hari ini":`Deadline ${d} hari lagi`,kind:"Task",score:80-d});
  });
  payments.filter((p:any)=>p.status!=="paid"&&p.status!=="cancelled"&&p.due_date).forEach((p:any)=>{
    const d=diffDays(p.due_date);
    if(d<0)priorities.push({title:`Bayar ${p.description}`,meta:`Pembayaran terlambat ${Math.abs(d)} hari`,kind:"Payment",score:120});
    else if(d<=14)priorities.push({title:`Bayar ${p.description}`,meta:d===0?"Jatuh tempo hari ini":`Jatuh tempo ${d} hari lagi`,kind:"Payment",score:90-d});
  });
  (vendors as any[]).filter(v=>["negotiating","contacted"].includes(v.status)).slice(0,2).forEach(v=>priorities.push({title:`Finalisasi ${v.name}`,meta:`${v.category} masih ${v.status}`,kind:"Vendor",score:55}));
  priorities.sort((a,b)=>b.score-a.score);

  const metrics={days,health,healthLabel,progress,bookedVendors,confirmedPax,safeToSpend,planned,actual,paid,committed,overduePayments};

  return <div className="demo-shell live-shell">
    <aside className="sidebar">
      <Link className="brand" href="/"><span className="brand-mark">M</span><span className="brand-copy"><strong>MenujuKita</strong><small>Live Workspace</small></span></Link>
      <div className="side-menu">
        <a className="side-link active" href="#home"><Home size={18}/>Home</a>
        <a className="side-link" href="#plan"><ListChecks size={18}/>Plan</a>
        <a className="side-link" href="#money"><CircleDollarSign size={18}/>Money</a>
        <a className="side-link" href="#guests"><UsersRound size={18}/>Guests</a>
        <a className="side-link" href="#vendors"><Store size={18}/>Vendor</a>
        <a className="side-link" href="#rundown"><CalendarClock size={18}/>Rundown</a>
      </div>
    </aside>
    <main className="main live-main">
      <div className="topline"><div><small className="muted">LIVE WEDDING</small><h2 style={{margin:"4px 0 0"}}>{wedding.couple_one_name} & {wedding.couple_two_name}</h2></div><span className="badge">Cloud · Neon</span></div>
      <HomeSection wedding={wedding} metrics={metrics} priorities={priorities} payments={payments}/>
      <PlanSection tasks={tasks as any[]} rundown={rundown as any[]}/>
      <MoneySection wedding={wedding} metrics={metrics} budgetItems={budgetItems as any[]} payments={payments}/>
      <GuestsSection guests={guests as any[]} wedding={wedding}/>
      <VendorsSection vendors={vendors as any[]}/>
    </main>
    <nav className="mobile-nav live-mobile-nav">
      <a href="#home"><Home size={18}/><small>Home</small></a>
      <a href="#plan"><ListChecks size={18}/><small>Plan</small></a>
      <a href="#money"><CircleDollarSign size={18}/><small>Money</small></a>
      <a href="#guests"><UsersRound size={18}/><small>Guests</small></a>
      <a href="#vendors"><Store size={18}/><small>Vendor</small></a>
    </nav>
  </div>;
}
import Link from "next/link";
import { Armchair, CalendarClock, CircleDollarSign, FileText, Home, ListChecks, Store, UserRoundPlus, UsersRound } from "lucide-react";
import { canViewBudget, requireWorkspace } from "@/lib/workspace";
import HomeSection from "@/components/live/home-section";
import PlanSection from "@/components/live/plan-section";
import MoneySection from "@/components/live/money-section";
import GuestsSection from "@/components/live/guests-section";
import VendorsSection from "@/components/live/vendors-section";
import DocumentsSection from "@/components/live/documents-section";
import MembersSection from "@/components/live/members-section";
import SeatingSection from "@/components/live/seating-section";

export const dynamic="force-dynamic";

const n=(v:any)=>Number(v||0);
const diffDays=(v:any)=>{if(!v)return 9999;const d=new Date(v);return Math.ceil((d.getTime()-Date.now())/86400000)};

export default async function Page(){
  const {db,wedding}=await requireWorkspace();
  const canBudget=canViewBudget(wedding);
  const canEdit=String(wedding.role)!=="viewer";
  const canManageTeam=["owner","partner"].includes(String(wedding.role));

  const [tasks,vendors,budgetItems,paymentsRaw,guests,rundown,documents,members,invites,events,seatingTables,seatingAssignments]=await Promise.all([
    db`SELECT * FROM tasks WHERE wedding_id=${wedding.id} ORDER BY (status='done') ASC,due_date NULLS LAST,sort_order,created_at`,
    db`SELECT * FROM vendors WHERE wedding_id=${wedding.id} ORDER BY CASE status WHEN 'booked' THEN 1 WHEN 'negotiating' THEN 2 WHEN 'shortlisted' THEN 3 ELSE 4 END,created_at DESC`,
    canBudget?db`SELECT * FROM budget_items WHERE wedding_id=${wedding.id} ORDER BY created_at DESC`:Promise.resolve([]),
    canBudget?db`SELECT p.*,CASE WHEN p.status='upcoming' AND p.due_date<CURRENT_DATE THEN 'overdue' ELSE p.status END AS display_status FROM payments p WHERE wedding_id=${wedding.id} ORDER BY (p.status='paid') ASC,p.due_date NULLS LAST,p.created_at DESC`:Promise.resolve([]),
    db`SELECT * FROM guests WHERE wedding_id=${wedding.id} ORDER BY created_at DESC`,
    db`SELECT * FROM rundown_items WHERE wedding_id=${wedding.id} ORDER BY starts_at,sort_order`,
    db`SELECT * FROM documents WHERE wedding_id=${wedding.id} ORDER BY created_at DESC`,
    db`SELECT id,display_name,invited_email,role,can_view_budget,status,joined_at FROM wedding_members WHERE wedding_id=${wedding.id} AND status<>'revoked' ORDER BY CASE role WHEN 'owner' THEN 0 WHEN 'partner' THEN 1 WHEN 'collaborator' THEN 2 ELSE 3 END,created_at`,
    canManageTeam?db`SELECT id,invited_email,role,can_view_budget,status,expires_at,created_at FROM member_invites WHERE wedding_id=${wedding.id} AND status='pending' AND expires_at>now() ORDER BY created_at DESC`:Promise.resolve([]),
    db`SELECT id,name,event_type,event_date,start_time FROM wedding_events WHERE wedding_id=${wedding.id} ORDER BY sort_order,event_date,start_time`,
    db`SELECT st.*,we.name event_name FROM seating_tables st LEFT JOIN wedding_events we ON we.id=st.event_id WHERE st.wedding_id=${wedding.id} ORDER BY st.sort_order,st.created_at`,
    db`SELECT sa.*,g.name guest_name FROM seating_assignments sa JOIN guests g ON g.id=sa.guest_id WHERE sa.wedding_id=${wedding.id} ORDER BY sa.id`
  ]);

  const payments=(paymentsRaw as any[]).map(p=>({...p,status:p.display_status||p.status}));
  const total=tasks.length;
  const done=tasks.filter((t:any)=>t.status==="done").length;
  const progress=total?Math.round(done/total*100):0;
  const days=wedding.wedding_date?Math.max(0,diffDays(wedding.wedding_date)):0;
  const planned=(budgetItems as any[]).reduce((s,b)=>s+n(b.planned_amount),0);
  const actual=(budgetItems as any[]).reduce((s,b)=>s+n(b.actual_amount||b.planned_amount),0);
  const budgetPaid=(budgetItems as any[]).reduce((s,b)=>s+n(b.paid_amount),0);
  const paymentPaid=payments.filter((p:any)=>p.status==="paid").reduce((s:any,p:any)=>s+n(p.amount),0);
  const paid=payments.length?paymentPaid:budgetPaid;
  const committed=payments.filter((p:any)=>p.status!=="paid"&&p.status!=="cancelled").reduce((s:any,p:any)=>s+n(p.amount),0);
  const moneyBase=canBudget?(n(wedding.available_funds)>0?n(wedding.available_funds):n(wedding.budget_total)):0;
  const safeToSpend=canBudget?Math.max(0,moneyBase-committed-n(wedding.reserve_buffer)):0;
  const bookedVendors=vendors.filter((v:any)=>["booked","completed"].includes(v.status)).length;
  const confirmedPax=guests.filter((g:any)=>g.rsvp_status==="attending").reduce((s:any,g:any)=>s+n(g.actual_pax||g.expected_pax||1),0);
  const overduePayments=payments.filter((p:any)=>p.status==="overdue").length;
  const usedDocumentBytes=(documents as any[]).reduce((s,d)=>s+n(d.size_bytes),0);

  const taskScore=total?done/total*100:70;
  const budgetTotal=canBudget?n(wedding.budget_total):0;
  const projection=actual||planned;
  const budgetScore=canBudget?(!budgetTotal?80:projection<=budgetTotal?100:Math.max(20,100-((projection-budgetTotal)/budgetTotal*100))):80;
  const vendorScore=vendors.length?bookedVendors/vendors.length*100:(days>120?80:60);
  const paymentScore=canBudget?Math.max(20,100-overduePayments*25):80;
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
  if(canBudget)payments.filter((p:any)=>p.status!=="paid"&&p.status!=="cancelled"&&p.due_date).forEach((p:any)=>{
    const d=diffDays(p.due_date);
    if(d<0)priorities.push({title:`Bayar ${p.description}`,meta:`Pembayaran terlambat ${Math.abs(d)} hari`,kind:"Payment",score:120});
    else if(d<=14)priorities.push({title:`Bayar ${p.description}`,meta:d===0?"Jatuh tempo hari ini":`Jatuh tempo ${d} hari lagi`,kind:"Payment",score:90-d});
  });
  (vendors as any[]).filter(v=>["negotiating","contacted"].includes(v.status)).slice(0,2).forEach(v=>priorities.push({title:`Finalisasi ${v.name}`,meta:`${v.category} masih ${v.status}`,kind:"Vendor",score:55}));
  priorities.sort((a,b)=>b.score-a.score);

  const metrics={days,health,healthLabel,progress,bookedVendors,confirmedPax,safeToSpend,planned,actual,paid,committed,overduePayments};

  return <div className="demo-shell live-shell">
    <aside className="sidebar">
      <Link className="brand" href="/"><span className="brand-mark">M</span><span className="brand-copy"><strong>MenujuKita</strong><small>{wedding.role} workspace</small></span></Link>
      <div className="side-menu">
        <a className="side-link active" href="#home"><Home size={18}/>Home</a>
        <a className="side-link" href="#plan"><ListChecks size={18}/>Plan</a>
        {canBudget&&<a className="side-link" href="#money"><CircleDollarSign size={18}/>Money</a>}
        <a className="side-link" href="#guests"><UsersRound size={18}/>Guests</a>
        <a className="side-link" href="#seating"><Armchair size={18}/>Seating</a>
        <a className="side-link" href="#vendors"><Store size={18}/>Vendor</a>
        <a className="side-link" href="#documents"><FileText size={18}/>Documents</a>
        <a className="side-link" href="#team"><UserRoundPlus size={18}/>Wedding Team</a>
        <Link className="side-link" href="/app/day-h"><CalendarClock size={18}/>Day-H Mode</Link>
      </div>
    </aside>
    <main className="main live-main">
      <div className="topline"><div><small className="muted">LIVE WEDDING · {String(wedding.role).toUpperCase()}</small><h2 style={{margin:"4px 0 0"}}>{wedding.couple_one_name} & {wedding.couple_two_name}</h2></div><span className="badge">{canEdit?"Can edit":"Read only"} · Neon</span></div>
      <HomeSection wedding={wedding} metrics={metrics} priorities={priorities} payments={payments} canBudget={canBudget}/>
      <PlanSection tasks={tasks as any[]} rundown={rundown as any[]} canEdit={canEdit}/>
      {canBudget&&<MoneySection wedding={wedding} metrics={metrics} budgetItems={budgetItems as any[]} payments={payments} canEdit={canEdit}/>}
      <GuestsSection guests={guests as any[]} wedding={wedding} canEdit={canEdit}/>
      <SeatingSection tables={seatingTables as any[]} assignments={seatingAssignments as any[]} guests={guests as any[]} events={events as any[]} canEdit={canEdit}/>
      <VendorsSection vendors={vendors as any[]} canEdit={canEdit}/>
      <DocumentsSection documents={documents as any[]} usedBytes={usedDocumentBytes} canEdit={canEdit}/>
      <MembersSection members={members as any[]} invites={invites as any[]} role={String(wedding.role)}/>
    </main>
    <nav className="mobile-nav live-mobile-nav">
      <a href="#home"><Home size={18}/><small>Home</small></a>
      <a href="#plan"><ListChecks size={18}/><small>Plan</small></a>
      {canBudget?<a href="#money"><CircleDollarSign size={18}/><small>Money</small></a>:<a href="#documents"><FileText size={18}/><small>Docs</small></a>}
      <a href="#guests"><UsersRound size={18}/><small>Guests</small></a>
      <a href="#vendors"><Store size={18}/><small>Vendor</small></a>
    </nav>
  </div>;
}
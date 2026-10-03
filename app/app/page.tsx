import LiveWorkspace from "./live-workspace";
import { requireWorkspace } from "@/lib/workspace";
import { signRsvpParty } from "@/lib/rsvp";

export const dynamic = "force-dynamic";

const clamp=(n:number,min=0,max=100)=>Math.max(min,Math.min(max,n));
const toNum=(v:any)=>Number(v||0);

export default async function Page(){
  const {db,wedding}=await requireWorkspace();

  const [tasks,vendors,budgetItems,payments,guestRows,rundown]=await Promise.all([
    db`SELECT * FROM tasks WHERE wedding_id=${wedding.id} ORDER BY CASE WHEN status='done' THEN 1 ELSE 0 END,due_date NULLS LAST,created_at`,
    db`SELECT * FROM vendors WHERE wedding_id=${wedding.id} ORDER BY CASE status WHEN 'booked' THEN 0 WHEN 'negotiating' THEN 1 ELSE 2 END,created_at DESC`,
    db`SELECT * FROM budget_items WHERE wedding_id=${wedding.id} ORDER BY created_at DESC`,
    db`SELECT p.*,v.name vendor_name FROM payments p LEFT JOIN vendors v ON v.id=p.vendor_id WHERE p.wedding_id=${wedding.id} ORDER BY CASE WHEN p.status='overdue' THEN 0 WHEN p.status='upcoming' THEN 1 ELSE 2 END,p.due_date NULLS LAST,p.created_at DESC`,
    db`SELECT g.*,gp.group_name,gp.side,gp.max_pax,gp.id party_id FROM guests g LEFT JOIN guest_parties gp ON gp.id=g.party_id WHERE g.wedding_id=${wedding.id} ORDER BY g.created_at DESC`,
    db`SELECT * FROM rundown_items WHERE wedding_id=${wedding.id} ORDER BY starts_at`
  ]);

  const now=new Date();
  const in7=new Date(now.getTime()+7*86400000);
  const liveTasks=tasks as any[], liveVendors=vendors as any[], liveBudget=budgetItems as any[], livePayments=payments as any[], liveGuests=guestRows as any[], liveRundown=rundown as any[];

  const taskTotal=liveTasks.length;
  const taskDone=liveTasks.filter(x=>x.status==="done").length;
  const overdueTasks=liveTasks.filter(x=>x.status!=="done"&&x.due_date&&new Date(x.due_date)<now);
  const progress=taskTotal?Math.round(taskDone/taskTotal*100):0;
  const taskScore=taskTotal?clamp(Math.round(progress-overdueTasks.length*5)):60;

  const budgetTotal=toNum(wedding.budget_total);
  const projected=liveBudget.reduce((s,x)=>s+Math.max(toNum(x.actual_amount),toNum(x.planned_amount)),0);
  const budgetScore=budgetTotal<=0?60:projected<=budgetTotal?100:clamp(Math.round(100-((projected-budgetTotal)/budgetTotal)*100),25,100);

  const vendorTotal=liveVendors.length;
  const bookedVendors=liveVendors.filter(x=>["booked","completed"].includes(x.status)).length;
  const vendorScore=vendorTotal?clamp(Math.round(bookedVendors/vendorTotal*100)):50;

  const overduePayments=livePayments.filter(x=>x.status!=="paid"&&x.due_date&&new Date(x.due_date)<now);
  const paymentScore=clamp(100-overduePayments.length*20,35,100);

  const attending=liveGuests.filter(x=>x.rsvp_status==="attending").reduce((s,x)=>s+Math.max(1,toNum(x.actual_pax||x.expected_pax||1)),0);
  const waiting=liveGuests.filter(x=>["waiting","not_sent"].includes(x.rsvp_status)).length;
  const responded=liveGuests.filter(x=>!["waiting","not_sent"].includes(x.rsvp_status)).length;
  const guestScore=liveGuests.length?clamp(Math.round(responded/liveGuests.length*100)):50;

  const health=clamp(Math.round(taskScore*.35+budgetScore*.25+vendorScore*.20+paymentScore*.10+guestScore*.10));
  const healthLabel=health>=90?"Excellent":health>=75?"On Track":health>=60?"Needs Attention":"At Risk";

  const paidPayments=livePayments.filter(x=>x.status==="paid").reduce((s,x)=>s+toNum(x.amount),0);
  const outstanding=livePayments.filter(x=>x.status!=="paid"&&x.status!=="cancelled").reduce((s,x)=>s+toNum(x.amount),0);
  const available=toNum(wedding.available_funds)>0?toNum(wedding.available_funds):Math.max(0,budgetTotal-paidPayments);
  const safeToSpend=Math.max(0,available-outstanding-toNum(wedding.reserve_buffer));

  const priorities:any[]=[];
  overdueTasks.slice(0,3).forEach(x=>priorities.push({level:"critical",title:x.title,meta:`Task overdue · ${new Intl.DateTimeFormat("id-ID",{day:"2-digit",month:"short"}).format(new Date(x.due_date))}`}));
  livePayments.filter(x=>x.status!=="paid"&&x.due_date&&new Date(x.due_date)<now).slice(0,2).forEach(x=>priorities.push({level:"critical",title:`Bayar ${x.description}`,meta:`Overdue · Rp ${new Intl.NumberFormat("id-ID").format(toNum(x.amount))}`}));
  liveTasks.filter(x=>x.status!=="done"&&x.due_date&&new Date(x.due_date)>=now&&new Date(x.due_date)<=in7).slice(0,3).forEach(x=>priorities.push({level:"important",title:x.title,meta:"Deadline dalam 7 hari"}));
  livePayments.filter(x=>x.status==="upcoming"&&x.due_date&&new Date(x.due_date)>=now&&new Date(x.due_date)<=in7).slice(0,2).forEach(x=>priorities.push({level:"important",title:`Siapkan ${x.description}`,meta:`Jatuh tempo ≤7 hari · Rp ${new Intl.NumberFormat("id-ID").format(toNum(x.amount))}`}));
  const vendorAttention=liveVendors.filter(x=>["searching","negotiating","contacted"].includes(x.status));
  if(vendorAttention.length) priorities.push({level:"info",title:`${vendorAttention.length} vendor masih perlu keputusan`,meta:"Buka Vendor Manager untuk lanjutkan"});
  if(waiting) priorities.push({level:"info",title:`${waiting} undangan belum memberi RSVP`,meta:"Follow-up guest list"});

  const days=wedding.wedding_date?Math.max(0,Math.ceil((new Date(wedding.wedding_date).getTime()-Date.now())/86400000)):0;
  const guests=liveGuests.map(g=>({...g,rsvp_path:g.party_id?`/rsvp/${g.party_id}?sig=${signRsvpParty(g.party_id)}`:""}));

  const summary={
    progress,taskScore,budgetScore,vendorScore,paymentScore,guestScore,
    attending,waiting,bookedVendors,vendorTotal,paidPayments,outstanding
  };

  return <LiveWorkspace
    wedding={wedding}
    summary={summary}
    tasks={liveTasks}
    vendors={liveVendors}
    budgetItems={liveBudget}
    payments={livePayments}
    guests={guests}
    rundown={liveRundown}
    priorities={priorities}
    health={health}
    healthLabel={healthLabel}
    safeToSpend={safeToSpend}
    days={days}
  />;
}

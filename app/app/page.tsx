import { requireWorkspace } from "@/lib/workspace";
import { presignStorageDownload } from "@/lib/storage";
import HomeSection from "@/components/live/home-section";
import PlanSection from "@/components/live/plan-section";
import MoneySection from "@/components/live/money-section";
import GuestsSection from "@/components/live/guests-section";
import VendorsSection from "@/components/live/vendors-section";
import DocumentsSection from "@/components/live/documents-section";
import MembersSection from "@/components/live/members-section";
import SeatingSection from "@/components/live/seating-section";
import ActivitySection from "@/components/live/activity-section";
import NotificationsSection from "@/components/live/notifications-section";
import SettingsSection from "@/components/live/settings-section";
import GlobalSearch from "@/components/live/global-search";
import WeddingStudio from "@/components/live/wedding-studio";
import GuideSection from "@/components/live/guide-section";
import {loadWeddingFinance} from "@/lib/finance";

export const dynamic="force-dynamic";
const n=(v:any)=>Number(v||0);
const diffDays=(v:any)=>{if(!v)return 9999;const d=new Date(v);return Math.ceil((d.getTime()-Date.now())/86400000)};

export default async function Page(){
 const {db,wedding,admin,license}=await requireWorkspace();
 const coverUrl=wedding.cover_object_key?await presignStorageDownload(String(wedding.cover_object_key)).catch(()=>""):"";
 const canEdit=true,canBudget=true;
 const[tasks,vendors,budgetItems,paymentsRaw,guests,rundown,documents,members,events,seatingTables,seatingAssignments,activity]=await Promise.all([
  db`SELECT * FROM tasks WHERE wedding_id=${wedding.id} ORDER BY (status='done') ASC,due_date NULLS LAST,sort_order,created_at`,
  db`SELECT * FROM vendors WHERE wedding_id=${wedding.id} ORDER BY CASE status WHEN 'booked' THEN 1 WHEN 'negotiating' THEN 2 WHEN 'shortlisted' THEN 3 ELSE 4 END,created_at DESC`,
  db`SELECT b.*,v.name vendor_name FROM budget_items b LEFT JOIN vendors v ON v.id=b.vendor_id WHERE b.wedding_id=${wedding.id} ORDER BY b.created_at DESC`,
  db`SELECT p.*,v.name vendor_name,CASE WHEN p.status='upcoming' AND p.due_date<CURRENT_DATE THEN 'overdue' ELSE p.status END AS display_status FROM payments p LEFT JOIN vendors v ON v.id=p.vendor_id WHERE p.wedding_id=${wedding.id} ORDER BY (p.status='paid') ASC,p.due_date NULLS LAST,p.created_at DESC`,
  db`SELECT g.*,gp.side,gp.group_name,gp.max_pax FROM guests g LEFT JOIN guest_parties gp ON gp.id=g.party_id WHERE g.wedding_id=${wedding.id} ORDER BY g.created_at DESC`,
  db`SELECT r.*,m.display_name pic_name,v.name vendor_name FROM rundown_items r LEFT JOIN wedding_members m ON m.id=r.pic_member_id LEFT JOIN vendors v ON v.id=r.vendor_id WHERE r.wedding_id=${wedding.id} ORDER BY r.starts_at,r.sort_order`,
  db`SELECT * FROM documents WHERE wedding_id=${wedding.id} ORDER BY created_at DESC`,
  db`SELECT id,display_name,invited_email,role,can_view_budget,status,joined_at FROM wedding_members WHERE wedding_id=${wedding.id} AND status<>'revoked' ORDER BY created_at`,
  db`SELECT id,name,event_type,event_date,start_time FROM wedding_events WHERE wedding_id=${wedding.id} ORDER BY sort_order,event_date,start_time`,
  db`SELECT st.*,we.name event_name FROM seating_tables st LEFT JOIN wedding_events we ON we.id=st.event_id WHERE st.wedding_id=${wedding.id} ORDER BY st.sort_order,st.created_at`,
  db`SELECT sa.*,g.name guest_name FROM seating_assignments sa JOIN guests g ON g.id=sa.guest_id WHERE sa.wedding_id=${wedding.id} ORDER BY sa.id`,
  db`SELECT a.*,COALESCE(m.display_name,m.invited_email,CASE WHEN a.auth_user_id='admin' THEN 'MenujuKita Admin' ELSE 'Wedding access' END) actor_name FROM activity_logs a LEFT JOIN wedding_members m ON m.wedding_id=a.wedding_id AND m.auth_user_id=a.auth_user_id WHERE a.wedding_id=${wedding.id} ORDER BY a.created_at DESC LIMIT 40`
 ]);
 const {entries:cashEntries,summary:finance}=await loadWeddingFinance(db,String(wedding.id),n(wedding.budget_total),n(wedding.reserve_buffer));
 const partnerAccess=await db`SELECT status,display_name FROM wedding_partner_access WHERE wedding_id=${wedding.id} LIMIT 1`;
 const payments=(paymentsRaw as any[]).map(p=>({...p,status:p.display_status||p.status})),total=tasks.length,done=tasks.filter((t:any)=>t.status==="done").length,progress=total?Math.round(done/total*100):0;
 const days=wedding.wedding_date?Math.max(0,diffDays(wedding.wedding_date)):null,planned=(budgetItems as any[]).reduce((s,b)=>s+n(b.planned_amount),0),actual=(budgetItems as any[]).reduce((s,b)=>s+n(b.actual_amount||b.planned_amount),0);
 const paid=finance.vendorPayments;
 const committed=finance.commitments,safeToSpend=finance.safeToSpend;
 const bookedVendors=vendors.filter((v:any)=>["booked","completed"].includes(v.status)).length,confirmedPax=guests.filter((g:any)=>g.rsvp_status==="attending").reduce((s:any,g:any)=>s+n(g.actual_pax||g.expected_pax||1),0),overduePayments=payments.filter((p:any)=>p.status==="overdue").length,usedDocumentBytes=(documents as any[]).reduce((s,d)=>s+n(d.size_bytes),0);
 const taskScore=total?done/total*100:70,budgetTotal=n(wedding.budget_total),projection=actual||planned,budgetScore=!budgetTotal?80:projection<=budgetTotal?100:Math.max(20,100-((projection-budgetTotal)/budgetTotal*100)),vendorScore=vendors.length?bookedVendors/vendors.length*100:((days===null||days>120)?80:60),paymentScore=Math.max(20,100-overduePayments*25),guestRaw=n(wedding.guest_target)?Math.min(100,confirmedPax/n(wedding.guest_target)*100):80,guestScore=(days===null||days>60)?Math.max(70,guestRaw):Math.max(40,guestRaw);
 const health=Math.round(taskScore*.35+budgetScore*.25+vendorScore*.20+paymentScore*.10+guestScore*.10),healthLabel=health>=90?"Sangat Baik":health>=75?"Terkendali":health>=60?"Perlu Perhatian":"Berisiko";
 const priorities:{title:string;meta:string;kind:string;score:number}[]=[];
 (tasks as any[]).filter(t=>t.status!=="done"&&t.due_date).forEach(t=>{const d=diffDays(t.due_date);if(d<0)priorities.push({title:t.title,meta:`Terlambat ${Math.abs(d)} hari`,kind:"Task",score:100+Math.abs(d)});else if(d<=14)priorities.push({title:t.title,meta:d===0?"Deadline hari ini":`Deadline ${d} hari lagi`,kind:"Task",score:80-d})});
 payments.filter((p:any)=>p.status!=="paid"&&p.status!=="cancelled"&&p.due_date).forEach((p:any)=>{const d=diffDays(p.due_date);if(d<0)priorities.push({title:`Bayar ${p.description}`,meta:`Terlambat ${Math.abs(d)} hari`,kind:"Pembayaran",score:120});else if(d<=14)priorities.push({title:`Bayar ${p.description}`,meta:d===0?"Jatuh tempo hari ini":`Jatuh tempo ${d} hari lagi`,kind:"Payment",score:90-d})});
 (vendors as any[]).filter(v=>["negotiating","contacted"].includes(v.status)).slice(0,2).forEach(v=>priorities.push({title:`Finalisasi ${v.name}`,meta:`${v.category} masih ${v.status}`,kind:"Vendor",score:55}));priorities.sort((a,b)=>b.score-a.score);
 const waitingGuests=(guests as any[]).filter(g=>["waiting","not_sent","maybe"].includes(g.rsvp_status)).length,notifications:any[]=priorities.slice(0,8).map(p=>({title:p.title,meta:p.meta,kind:p.kind,level:p.score>=100?"critical":p.score>=70?"important":"info"}));
 if(waitingGuests>0&&days!==null&&days<=60)notifications.push({title:`${waitingGuests} undangan belum final RSVP`,meta:"Follow-up guest list sebelum jumlah tamu dikunci.",kind:"Tamu",level:days<=21?"important":"info"});
 const searchItems=[...(tasks as any[]).map(t=>({type:"Task",title:String(t.title),meta:[t.category,t.status].join(" · "),target:"plan"})),...(vendors as any[]).map(v=>({type:"Vendor",title:String(v.name),meta:[v.category,v.status].join(" · "),target:"vendors"})),...(guests as any[]).map(g=>({type:"Tamu",title:String(g.name),meta:[g.rsvp_status,g.phone].filter(Boolean).join(" · "),target:"guests"})),...(rundown as any[]).map(r=>({type:"Rundown",title:String(r.activity),meta:[r.location,r.vendor_name].filter(Boolean).join(" · "),target:"plan"})),...(documents as any[]).map(d=>({type:"Dokumen",title:String(d.name),meta:String(d.category||""),target:"vault"})),...payments.map((p:any)=>({type:"Pembayaran",title:String(p.description),meta:[p.vendor_name,p.status].filter(Boolean).join(" · "),target:"money"}))];
 const metrics={days,health,healthLabel,progress,bookedVendors,confirmedPax,safeToSpend,planned,actual,paid,committed,overduePayments};
 return <WeddingStudio couple={wedding.couple_one_name+" & "+wedding.couple_two_name} days={days} admin={Boolean(admin)} search={<GlobalSearch items={searchItems}/>}
  home={<HomeSection wedding={wedding} metrics={metrics} priorities={priorities} payments={payments} coverUrl={coverUrl}/>}
  plan={<PlanSection tasks={tasks as any[]} rundown={rundown as any[]} members={members as any[]} vendors={vendors as any[]} canEdit weddingDate={wedding.wedding_date}/>}
  money={<MoneySection wedding={wedding} metrics={metrics} budgetItems={budgetItems as any[]} payments={payments} vendors={vendors as any[]} cashEntries={cashEntries} financeSummary={finance} canEdit/>}
  guests={<GuestsSection guests={guests as any[]} wedding={wedding} canEdit/>}
  vendors={<VendorsSection vendors={vendors as any[]} canEdit/>}
  seating={<SeatingSection tables={seatingTables as any[]} assignments={seatingAssignments as any[]} guests={guests as any[]} events={events as any[]} canEdit/>}
  vault={<DocumentsSection documents={documents as any[]} usedBytes={usedDocumentBytes} canEdit canBudget weddingId={String(wedding.id)}/>}
  team={<MembersSection members={members as any[]} invites={[]} role={admin?"owner":license?.partner_id?"partner":"owner"} partnerStatus={partnerAccess[0]?.status} partnerName={partnerAccess[0]?.display_name}/>}
  notifications={<NotificationsSection items={notifications}/>}
  activity={<ActivitySection items={activity as any[]}/>}
  settings={<SettingsSection wedding={wedding} licenseHint={license?.code_hint} admin={Boolean(admin)} coverUrl={coverUrl}/>}
  guide={<GuideSection/>}
 />
}

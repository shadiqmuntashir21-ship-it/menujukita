import Link from "next/link";
import { ArrowLeft,Clock3,MapPin,Phone,WalletCards } from "lucide-react";
import { requireWorkspace } from "@/lib/workspace";
import { money,timeLabel } from "@/components/live/shared";
export const dynamic="force-dynamic";
export default async function Page(){
 const{db,wedding}=await requireWorkspace();
 const[rundown,vendors,payments]=await Promise.all([
  db`SELECT r.*,m.display_name pic_name,v.name vendor_name FROM rundown_items r LEFT JOIN wedding_members m ON m.id=r.pic_member_id LEFT JOIN vendors v ON v.id=r.vendor_id WHERE r.wedding_id=${wedding.id} AND r.status NOT IN ('cancelled') ORDER BY r.starts_at LIMIT 20`,
  db`SELECT * FROM vendors WHERE wedding_id=${wedding.id} AND status IN ('booked','completed') ORDER BY category`,
  db`SELECT * FROM payments WHERE wedding_id=${wedding.id} AND status<>'paid' AND status<>'cancelled' ORDER BY due_date NULLS LAST LIMIT 8`
 ]);
 const active=(rundown as any[]).find(r=>r.status==="in_progress")||(rundown as any[]).find(r=>["ready","upcoming","delayed"].includes(r.status)),idx=Math.max(0,(rundown as any[]).findIndex(r=>r.id===active?.id)),next=(rundown as any[])[idx+1];
 return <main className="dayh-command"><header className="dayh-command-top"><Link href="/app" className="dayh-back"><ArrowLeft size={18}/>Studio</Link><div><small>DAY-H MODE</small><b>{wedding.couple_one_name} & {wedding.couple_two_name}</b></div><span className="live-indicator"><i/> LIVE PLAN</span></header>
  <section className="dayh-focus-grid"><article className="dayh-current"><span className="dayh-label">NOW</span><div className="dayh-clock">{active?timeLabel(active.starts_at):"--:--"}</div><h1>{active?.activity||"Belum ada agenda aktif"}</h1><div className="dayh-meta">{active?.location&&<span><MapPin size={16}/>{active.location}</span>}{active?.pic_name&&<span><Clock3 size={16}/>PIC {active.pic_name}</span>}</div>{active?.vendor_name&&<p>Vendor · <b>{active.vendor_name}</b></p>}</article>
  <article className="dayh-next"><span className="dayh-label">NEXT</span>{next?<><b>{timeLabel(next.starts_at)}</b><h2>{next.activity}</h2><p>{next.location||"Lokasi belum diisi"}</p></>:<><h2>Rundown selesai setelah ini.</h2><p>Nikmati harinya.</p></>}</article></section>
  <div className="dayh-support-grid"><section className="dayh-list-card"><div className="dayh-section-title"><Clock3 size={18}/><h3>Timeline hari ini</h3></div><div className="dayh-timeline">{(rundown as any[]).map(r=><div className={"dayh-row "+(r.id===active?.id?"active":"")} key={r.id}><time>{timeLabel(r.starts_at)}</time><div><b>{r.activity}</b><span>{r.location||"—"}{r.pic_name?" · "+r.pic_name:""}</span></div><em>{r.status}</em></div>)}</div></section>
  <aside className="dayh-side-stack"><section className="dayh-list-card"><div className="dayh-section-title"><Phone size={18}/><h3>Quick contacts</h3></div>{(vendors as any[]).slice(0,6).map(v=><div className="dayh-contact" key={v.id}><div><b>{v.name}</b><span>{v.category}</span></div>{v.whatsapp?<a href={"https://wa.me/"+String(v.whatsapp).replace(/\D/g,"")} target="_blank">WhatsApp</a>:<small>—</small>}</div>)}</section><section className="dayh-list-card"><div className="dayh-section-title"><WalletCards size={18}/><h3>Outstanding</h3></div>{(payments as any[]).length?(payments as any[]).map(p=><div className="dayh-contact" key={p.id}><div><b>{p.description}</b><span>{p.status}</span></div><strong>{money(p.amount)}</strong></div>):<p className="muted">Tidak ada pembayaran tersisa.</p>}</section></aside></div>
 </main>
}

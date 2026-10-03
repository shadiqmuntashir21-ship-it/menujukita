import Link from "next/link";
import { canViewBudget,requireWorkspace } from "@/lib/workspace";
import { timeLabel,money } from "@/components/live/shared";

export const dynamic="force-dynamic";

export default async function Page(){
  const{db,wedding}=await requireWorkspace();
  const canBudget=canViewBudget(wedding);
  const[rundown,vendors,payments]=await Promise.all([
    db`SELECT r.*,m.display_name pic_name,v.name vendor_name FROM rundown_items r LEFT JOIN wedding_members m ON m.id=r.pic_member_id LEFT JOIN vendors v ON v.id=r.vendor_id WHERE r.wedding_id=${wedding.id} AND r.status NOT IN ('done','cancelled') ORDER BY r.starts_at LIMIT 12`,
    db`SELECT * FROM vendors WHERE wedding_id=${wedding.id} AND status IN ('booked','completed') ORDER BY category`,
    canBudget?db`SELECT * FROM payments WHERE wedding_id=${wedding.id} AND status<>'paid' ORDER BY due_date NULLS LAST LIMIT 8`:Promise.resolve([])
  ]);
  const next:any=rundown[0];
  return <main className="dayh-screen">
    <div className="dayh-top"><div><span className="eyebrow">DAY-H MODE</span><h1 className="serif dayh-title">{wedding.couple_one_name} & {wedding.couple_two_name}</h1><p className="muted">Fokus pada eksekusi, kontak penting{canBudget?", dan pembayaran tersisa":""}.</p></div><Link className="btn" href="/app">Kembali ke Dashboard</Link></div>
    <div className="dayh-grid"><section className="dayh-now"><small>NEXT UP</small>{next?<><div className="dayh-time">{timeLabel(next.starts_at)}</div><h2>{next.activity}</h2><p>{next.location||"Lokasi belum diisi"}{next.pic_name?" · PIC "+next.pic_name:""}{next.vendor_name?" · "+next.vendor_name:""}</p></>:<h2>Belum ada rundown aktif.</h2>}</section><section className="panel"><h3>Rundown berikutnya</h3><div className="list">{(rundown as any[]).length?(rundown as any[]).map(r=><div className="row" key={r.id}><b>{timeLabel(r.starts_at)}</b><div style={{flex:1}}><div className="row-title">{r.activity}</div><small>{r.location||"—"}{r.pic_name?" · PIC "+r.pic_name:""}{r.vendor_name?" · "+r.vendor_name:""}</small></div><span className="badge">{r.status}</span></div>):<div className="empty-mini">Belum ada rundown aktif.</div>}</div></section></div>
    <div className={canBudget?"content-grid":"module-stack"}><section className="panel"><h3>Kontak vendor</h3><div className="list">{(vendors as any[]).length?(vendors as any[]).map(v=><div className="row" key={v.id}><div><b>{v.name}</b><br/><small>{v.category}</small></div>{v.whatsapp?<a className="btn btn-sm" href={"https://wa.me/"+String(v.whatsapp).replace(/\D/g,"")} target="_blank" rel="noreferrer">WhatsApp</a>:<span className="muted">No contact</span>}</div>):<div className="empty-mini">Belum ada vendor booked.</div>}</div></section>{canBudget&&<section className="panel"><h3>Pembayaran tersisa</h3><div className="list">{(payments as any[]).length?(payments as any[]).map(p=><div className="row" key={p.id}><span>{p.description}</span><b>{money(p.amount)}</b></div>):<div className="empty-mini">Tidak ada pembayaran tersisa.</div>}</div></section>}</div>
  </main>
}
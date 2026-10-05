import Link from "next/link";
import { ArrowLeft,CheckCircle2,Mail,RefreshCcw,ShieldAlert,XCircle } from "lucide-react";
import { requireAdmin } from "@/lib/admin";
import { ensureCommerceSchema } from "@/lib/commerce";
import { cancelOrder,confirmPayment,markNeedsConfirmation,rejectPayment,resendAccess } from "../../order-actions";

export const dynamic="force-dynamic";
const money=(n:any)=>new Intl.NumberFormat("id-ID",{style:"currency",currency:"IDR",maximumFractionDigits:0}).format(Number(n||0));
const dt=(v:any)=>v?new Intl.DateTimeFormat("id-ID",{dateStyle:"medium",timeStyle:"short"}).format(new Date(v)):"—";
const label:Record<string,string>={pending_payment:"Menunggu Pembayaran",awaiting_verification:"Menunggu Verifikasi",needs_confirmation:"Perlu Konfirmasi",payment_rejected:"Ditolak",payment_verified:"Terverifikasi",access_sent:"Akses Dikirim",completed:"Selesai",cancelled:"Dibatalkan"};
export default async function OrderDetail({params}:{params:Promise<{id:string}>}){
 const{id}=await params,{db}=await requireAdmin();await ensureCommerceSchema(db);
 const rows=await db`SELECT o.*,pm.label payment_label,l.status license_status,l.code_hint,l.pin_hint,l.activated_at FROM orders o LEFT JOIN payment_methods pm ON pm.code=o.payment_method_code LEFT JOIN licenses l ON l.id=o.license_id WHERE o.id=${id} LIMIT 1`,order:any=rows[0];
 if(!order)return <main className="admin-orders-page"><Link href="/admin/orders">Kembali</Link><div className="calm-empty">Order tidak ditemukan.</div></main>;
 const[activity,emails,claims]=await Promise.all([
  db`SELECT * FROM order_activity WHERE order_id=${id} ORDER BY created_at DESC`,
  db`SELECT * FROM email_events WHERE order_id=${id} ORDER BY created_at DESC`,
  db`SELECT * FROM payment_claims WHERE order_id=${id} ORDER BY claimed_at DESC`
 ]);
 return <main className="admin-order-detail">
  <header className="admin-orders-top"><Link href="/admin/orders"><ArrowLeft size={16}/>Orders</Link><div><small>ORDER DETAIL</small><h1>{order.order_no}</h1></div><span className={"status-pill "+order.status}>{label[order.status]||order.status}</span></header>
  <div className="admin-order-columns">
   <section className="admin-card"><div className="admin-card-head"><div><small>PEMBELI</small><h3>Informasi customer</h3></div></div><div className="detail-pairs"><p><span>Nama</span><b>{order.customer_name}</b></p><p><span>Email</span><b>{order.customer_email}</b></p><p><span>WhatsApp</span><b>{order.customer_whatsapp}</b></p><p><span>Pasangan</span><b>{order.couple_names||"—"}</b></p><p><span>Tanggal wedding</span><b>{order.wedding_date?String(order.wedding_date).slice(0,10):"—"}</b></p></div></section>
   <section className="admin-card"><div className="admin-card-head"><div><small>PEMBAYARAN</small><h3>{order.payment_label||order.payment_method_code}</h3></div><strong>{money(order.amount)}</strong></div><div className="detail-pairs"><p><span>Order dibuat</span><b>{dt(order.created_at)}</b></p><p><span>Klaim bayar</span><b>{dt(order.claimed_at)}</b></p><p><span>Diverifikasi</span><b>{dt(order.verified_at)}</b></p><p><span>Metode</span><b>{order.payment_label||order.payment_method_code}</b></p><p><span>Jumlah klaim</span><b>{(claims as any[]).length}</b></p></div></section>
   <section className="admin-card"><div className="admin-card-head"><div><small>LISENSI</small><h3>{order.license_code||"Belum diterbitkan"}</h3></div></div><div className="detail-pairs"><p><span>Status</span><b>{order.license_status||"—"}</b></p><p><span>Code hint</span><b>{order.code_hint?"••••-"+order.code_hint:"—"}</b></p><p><span>PIN hint</span><b>{order.pin_hint?"••••"+order.pin_hint:"—"}</b></p><p><span>Aktivasi</span><b>{dt(order.activated_at)}</b></p></div></section>
  </div>
  <section className="admin-card order-admin-actions"><div className="admin-card-head"><div><small>OWNER VERIFICATION</small><h3>Aksi pembayaran</h3></div><ShieldAlert size={20}/></div>
   <div className="admin-action-grid">
    {["awaiting_verification","needs_confirmation","payment_verified"].includes(order.status)&&<form action={confirmPayment}><input type="hidden" name="id" value={id}/><button className="admin-confirm"><CheckCircle2 size={17}/>Konfirmasi Pembayaran</button></form>}
    {["awaiting_verification","needs_confirmation"].includes(order.status)&&<form action={markNeedsConfirmation}><input type="hidden" name="id" value={id}/><button><Mail size={17}/>Perlu Konfirmasi</button></form>}
    {["awaiting_verification","needs_confirmation"].includes(order.status)&&<form action={rejectPayment}><input type="hidden" name="id" value={id}/><button className="danger"><XCircle size={17}/>Tolak Pembayaran</button></form>}
    {order.license_id&&<form action={resendAccess}><input type="hidden" name="id" value={id}/><button><RefreshCcw size={17}/>Kirim Ulang Akses + Reset PIN</button></form>}
    {!order.license_id&&!["completed","cancelled"].includes(order.status)&&<form action={cancelOrder}><input type="hidden" name="id" value={id}/><button className="danger">Batalkan Order</button></form>}
   </div>
   <p className="muted">Konfirmasi Pembayaran hanya ditekan setelah uang benar-benar terlihat masuk di rekening/QRIS. Sistem baru kemudian menerbitkan lisensi.</p>
  </section>
  <div className="admin-order-columns lower">
   <section className="admin-card"><div className="admin-card-head"><div><small>RIWAYAT</small><h3>Aktivitas order</h3></div></div><div className="order-timeline">{(activity as any[]).map(a=><div key={a.id}><span/><p><b>{String(a.event).replaceAll("_"," ")}</b><small>{dt(a.created_at)}</small></p></div>)}</div></section>
   <section className="admin-card"><div className="admin-card-head"><div><small>EMAIL LOG</small><h3>Email transactional</h3></div></div><div className="email-log">{(emails as any[]).map(e=><div key={e.id}><span className={e.status}/><p><b>{String(e.kind).replaceAll("_"," ")}</b><small>{e.recipient} · {e.status} · {dt(e.created_at)}</small></p></div>)}{!(emails as any[]).length&&<div className="calm-empty">Belum ada email.</div>}</div></section>
  </div>
 </main>
}

import Link from "next/link";
import { ArrowLeft,Search,ShoppingBag } from "lucide-react";
import { requireAdmin } from "@/lib/admin";
import { ensureCommerceSchema } from "@/lib/commerce";

export const dynamic="force-dynamic";
const money=(n:any)=>new Intl.NumberFormat("id-ID",{style:"currency",currency:"IDR",maximumFractionDigits:0}).format(Number(n||0));
const dt=(v:any)=>v?new Intl.DateTimeFormat("id-ID",{dateStyle:"medium",timeStyle:"short"}).format(new Date(v)):"—";
const label:Record<string,string>={pending_payment:"Menunggu Pembayaran",awaiting_verification:"Menunggu Verifikasi",needs_confirmation:"Perlu Konfirmasi",payment_rejected:"Ditolak",payment_verified:"Terverifikasi",access_sent:"Akses Dikirim",completed:"Selesai",cancelled:"Dibatalkan"};
export default async function OrdersPage({searchParams}:{searchParams:Promise<{q?:string;status?:string;method?:string;from?:string;to?:string}>}){
 const{db}=await requireAdmin();await ensureCommerceSchema(db);const p=await searchParams;
 const rows=await db`SELECT o.*,pm.label payment_label FROM orders o LEFT JOIN payment_methods pm ON pm.code=o.payment_method_code ORDER BY o.created_at DESC LIMIT 500`;
 const q=(p.q||"").trim().toLowerCase(),from=p.from?new Date(p.from+"T00:00:00"):null,to=p.to?new Date(p.to+"T23:59:59"):null;
 const orders=(rows as any[]).filter(o=>{
  if(p.status&&o.status!==p.status)return false;if(p.method&&o.payment_method_code!==p.method)return false;
  const d=new Date(o.created_at);if(from&&d<from)return false;if(to&&d>to)return false;
  if(q&&!([o.order_no,o.customer_name,o.customer_email,o.customer_whatsapp,o.license_code].filter(Boolean).join(" ").toLowerCase().includes(q)))return false;
  return true;
 });
 const methods=await db`SELECT code,label FROM payment_methods ORDER BY sort_order,label`;
 return <main className="admin-orders-page">
  <header className="admin-orders-top"><Link href="/admin"><ArrowLeft size={16}/>Control Center</Link><div><small>MENUJUKITA ADMIN</small><h1>Orders & Payments</h1></div><span>{orders.length} hasil</span></header>
  <form className="order-filters">
   <label><Search size={15}/><input name="q" defaultValue={p.q||""} placeholder="Nama, email, WA, Order ID, lisensi"/></label>
   <select name="status" defaultValue={p.status||""}><option value="">Semua status</option>{Object.entries(label).map(([v,l])=><option key={v} value={v}>{l}</option>)}</select>
   <select name="method" defaultValue={p.method||""}><option value="">Semua metode</option>{(methods as any[]).map(m=><option key={m.code} value={m.code}>{m.label}</option>)}</select>
   <input type="date" name="from" defaultValue={p.from||""}/><input type="date" name="to" defaultValue={p.to||""}/><button>Cari</button>
  </form>
  <section className="order-admin-list">{orders.length?orders.map(o=><Link className={"admin-order-row status-"+o.status} href={"/admin/orders/"+o.id} key={o.id}>
   <span className="admin-order-icon"><ShoppingBag size={18}/></span><div className="admin-order-main"><b>{o.order_no}</b><span>{o.customer_name} · {o.customer_email}</span><small>{dt(o.created_at)} · {o.payment_label||o.payment_method_code}</small></div><div className="admin-order-money"><b>{money(o.amount)}</b><span>{label[o.status]||o.status}</span></div>
  </Link>):<div className="calm-empty">Tidak ada order yang cocok dengan filter.</div>}</section>
 </main>
}

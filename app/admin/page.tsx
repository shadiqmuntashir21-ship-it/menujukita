import Link from "next/link";
import {BrandLogo} from "@/components/brand";
import { Activity,CreditCard,Database,LogOut,ShoppingBag,ShieldCheck,Smartphone,UsersRound } from "lucide-react";
import LicenseGenerator from "./license-generator";
import PinResetButton from "./pin-reset-button";
import { adminLogout,changeLicenseStatus,openWeddingAsAdmin,revokeLicenseSessions } from "./actions";
import { requireAdmin } from "@/lib/admin";
import { ensureCommerceSchema } from "@/lib/commerce";

export const dynamic="force-dynamic";
const fmtBytes=(n:number)=>n<1024*1024?`${Math.max(0,Math.round(n/1024))} KB`:`${(n/1024/1024).toFixed(2)} MB`;
const money=(n:any)=>new Intl.NumberFormat("id-ID",{style:"currency",currency:"IDR",maximumFractionDigits:0}).format(Number(n||0));
const date=(v:any)=>v?new Intl.DateTimeFormat("id-ID",{day:"2-digit",month:"short",year:"numeric"}).format(new Date(v)):"—";
const orderLabel:Record<string,string>={pending_payment:"Menunggu Pembayaran",awaiting_verification:"Menunggu Verifikasi",needs_confirmation:"Perlu Konfirmasi",payment_rejected:"Ditolak",payment_verified:"Terverifikasi",access_sent:"Akses Dikirim",completed:"Selesai",cancelled:"Dibatalkan"};

export default async function Page(){
 const{db}=await requireAdmin();await ensureCommerceSchema(db);
 const[[cap],[usage],[orderStats],licenses,logs,recentOrders]=await Promise.all([
  db`SELECT s.max_active_weddings,count(l.id) FILTER(WHERE l.status='active')::int active,count(l.id) FILTER(WHERE l.status='unused')::int unused,count(l.id) FILTER(WHERE l.status='suspended')::int suspended,count(l.id) FILTER(WHERE l.status='revoked')::int revoked FROM app_settings s LEFT JOIN licenses l ON true WHERE s.id=1 GROUP BY s.max_active_weddings`,
  db`SELECT (SELECT count(*)::int FROM license_sessions WHERE revoked_at IS NULL AND expires_at>now()) active_sessions,(SELECT count(*)::int FROM weddings WHERE status='active') active_weddings,(SELECT coalesce(sum(size_bytes),0)::bigint FROM documents) document_bytes,pg_database_size(current_database())::bigint database_bytes`,
  db`SELECT count(*)::int total,
     count(*) FILTER(WHERE status='pending_payment')::int pending_payment,
     count(*) FILTER(WHERE status='awaiting_verification')::int awaiting_verification,
     count(*) FILTER(WHERE status='needs_confirmation')::int needs_confirmation,
     count(*) FILTER(WHERE status IN('payment_verified','access_sent','completed'))::int paid,
     count(*) FILTER(WHERE status='access_sent')::int access_sent,
     count(*) FILTER(WHERE status='completed')::int completed,
     coalesce(sum(amount) FILTER(WHERE status IN('payment_verified','access_sent','completed')),0)::numeric sales
     FROM orders`,
  db`SELECT l.id,l.code_hint,l.pin_hint,l.status,l.wedding_id,l.activated_at,l.last_login_at,l.created_at,l.expires_at,w.couple_one_name,w.couple_two_name,w.wedding_date,(SELECT count(*)::int FROM license_sessions s WHERE s.license_id=l.id AND s.revoked_at IS NULL AND s.expires_at>now()) active_sessions FROM licenses l LEFT JOIN weddings w ON w.id=l.wedding_id ORDER BY CASE l.status WHEN 'active' THEN 0 WHEN 'unused' THEN 1 WHEN 'suspended' THEN 2 ELSE 3 END,l.created_at DESC LIMIT 250`,
  db`SELECT * FROM access_logs ORDER BY created_at DESC LIMIT 20`,
  db`SELECT o.id,o.order_no,o.customer_name,o.customer_email,o.amount,o.status,o.created_at,pm.label payment_label FROM orders o LEFT JOIN payment_methods pm ON pm.code=o.payment_method_code ORDER BY o.created_at DESC LIMIT 8`
 ]);
 const active=Number(cap?.active||0),max=Number(cap?.max_active_weddings||250),pct=Math.min(100,Math.round(active/max*100));
 return <main className="control-center">
  <header className="control-top"><div className="control-brand"><BrandLogo className="control-brand-logo"/><div><small>TEMAN DIGITAL</small><strong>Pusat Kontrol</strong></div></div><div className="control-top-actions"><Link href="/admin/orders"><ShoppingBag size={16}/>Orders</Link><Link href="/admin/payments"><CreditCard size={16}/>Pembayaran</Link><form action={adminLogout}><button className="control-logout"><LogOut size={16}/>Keluar</button></form></div></header>

  <section className="control-hero"><div><span className="micro-label">SUPER ADMIN</span><h1 className="serif">Order, pembayaran,<br/>lisensi & wedding.</h1><p>Satu kanal untuk memeriksa pembayaran, mengirim akses, membantu customer, dan menjaga kapasitas 250 wedding.</p></div><div className="capacity-orbit" style={{"--capacity":pct} as any}><div><b>{active}</b><span>of {max}</span><small>active wedding</small></div></div></section>

  <section className="commerce-admin-glance">
   <Link href="/admin/orders?status=awaiting_verification"><small>MENUNGGU VERIFIKASI</small><b>{orderStats?.awaiting_verification||0}</b><span>perlu cek mutasi sekarang</span></Link>
   <Link href="/admin/orders"><small>TOTAL ORDER</small><b>{orderStats?.total||0}</b><span>{orderStats?.pending_payment||0} belum klaim bayar</span></Link>
   <Link href="/admin/orders?status=completed"><small>ORDER SELESAI</small><b>{orderStats?.completed||0}</b><span>{orderStats?.access_sent||0} akses baru dikirim</span></Link>
   <article><small>TOTAL PENJUALAN</small><b>{money(orderStats?.sales||0)}</b><span>{orderStats?.paid||0} pembayaran terverifikasi</span></article>
  </section>

  <section className="control-glance"><article><ShieldCheck size={19}/><div><small>LICENSE</small><b>{cap?.unused||0} siap dipakai</b><span>{cap?.suspended||0} suspended · {cap?.revoked||0} revoked</span></div></article><article><Smartphone size={19}/><div><small>SESSIONS</small><b>{usage?.active_sessions||0} device session</b><span>login customer aktif</span></div></article><article><Database size={19}/><div><small>DATABASE</small><b>{fmtBytes(Number(usage?.database_bytes||0))}</b><span>{fmtBytes(Number(usage?.document_bytes||0))} dokumen</span></div></article><article><UsersRound size={19}/><div><small>WORKSPACES</small><b>{usage?.active_weddings||0} wedding</b><span>workspace telah dibuat</span></div></article></section>

  <section className="admin-card recent-orders-card"><div className="admin-card-head"><div><span className="micro-label">ORDER TERBARU</span><h3>Yang perlu diperhatikan</h3></div><Link className="action-link strong" href="/admin/orders">Lihat semua</Link></div>
   <div className="recent-order-list">{(recentOrders as any[]).length?(recentOrders as any[]).map(o=><Link href={"/admin/orders/"+o.id} key={o.id}><div><b>{o.order_no}</b><span>{o.customer_name} · {o.payment_label||"Pembayaran"}</span></div><div><strong>{money(o.amount)}</strong><small className={"status-pill "+o.status}>{orderLabel[o.status]||o.status}</small></div></Link>):<div className="calm-empty">Belum ada order MenujuKita.</div>}</div>
  </section>

  <div className="control-split"><LicenseGenerator/><section className="admin-card"><div className="admin-card-head"><div><span className="micro-label">PILOT POLICY</span><h3>Guardrails</h3></div><ShieldCheck size={20}/></div><div className="control-rules"><p><span>Wedding aktif</span><b>{max} max</b></p><p><span>Harga</span><b>Rp49.000</b></p><p><span>Login customer</span><b>MK Code + PIN</b></p><p><span>Payment</span><b>Verifikasi owner</b></p><p><span>Email admin</span><b>temandigital26@gmail.com</b></p><p><span>Demo</span><b>lokal saja</b></p></div></section></div>

  <section className="registry-section"><div className="registry-head"><div><span className="micro-label">REGISTRI AKSES</span><h2 className="serif">250 slot lisensi</h2><p>Kode customer berbentuk MK-XXXX-XXXX. PIN dapat di-reset kapan saja.</p></div><span className="registry-count">{licenses.length} diterbitkan</span></div>
   <div className="license-registry">{(licenses as any[]).map(l=><article className={"license-card status-"+l.status} key={l.id}>
    <div className="license-card-top"><div><small>LICENSE</small><code>MK-••••-{l.code_hint}</code></div><span className={"status-pill "+l.status}>{l.status}</span></div>
    <div className="license-wedding">{l.couple_one_name?<><b>{l.couple_one_name} & {l.couple_two_name}</b><span>{date(l.wedding_date)} · PIN ••••{l.pin_hint||"—"}</span></>:<><b>Belum diaktivasi</b><span>Dibuat {date(l.created_at)} · PIN ••••{l.pin_hint||"—"}</span></>}</div>
    <div className="license-meta"><span><Smartphone size={13}/>{l.active_sessions||0} session</span><span><Activity size={13}/>last login {date(l.last_login_at)}</span></div>
    <div className="license-actions"><PinResetButton id={String(l.id)}/>{Number(l.active_sessions)>0&&<form action={revokeLicenseSessions}><input type="hidden" name="id" value={l.id}/><button className="action-link">Force logout</button></form>}{l.wedding_id&&<form action={openWeddingAsAdmin}><input type="hidden" name="wedding_id" value={l.wedding_id}/><button className="action-link strong">Open Wedding</button></form>}
     {l.status==="active"&&<form action={changeLicenseStatus}><input type="hidden" name="id" value={l.id}/><button className="action-link danger" name="status" value="suspended">Suspend</button></form>}
     {l.status==="suspended"&&<form action={changeLicenseStatus}><input type="hidden" name="id" value={l.id}/><button className="action-link strong" name="status" value="active">Reactivate</button></form>}
     {l.status==="unused"&&<form action={changeLicenseStatus}><input type="hidden" name="id" value={l.id}/><button className="action-link danger" name="status" value="revoked">Revoke</button></form>}
    </div>
   </article>)}</div>
  </section>

  <section className="admin-card audit-card"><div className="admin-card-head"><div><span className="micro-label">LOG AUDIT</span><h3>Aktivitas akses</h3></div><Activity size={20}/></div><div className="audit-list">{(logs as any[]).map(x=><div className="audit-row" key={x.id}><span className={"audit-status "+(x.success?"ok":"fail")}/><div><b>{x.event.replaceAll("_"," ")}</b><small>{x.actor_type} · {date(x.created_at)}</small></div></div>)}</div></section>
 </main>
}

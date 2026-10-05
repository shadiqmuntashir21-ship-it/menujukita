import Link from "next/link";
import { ArrowLeft,CheckCircle2,Clock3,Mail,ShieldCheck } from "lucide-react";
import { sql } from "@/lib/db";
import { ensureCommerceSchema } from "@/lib/commerce";
import { claimPayment,changePaymentMethod,updateBuyerDetails } from "./actions";
import CopyButton from "@/components/commerce/copy-button";

export const dynamic="force-dynamic";
const money=(n:any)=>new Intl.NumberFormat("id-ID",{style:"currency",currency:"IDR",maximumFractionDigits:0}).format(Number(n||0));
const statusLabel:Record<string,string>={
 pending_payment:"Menunggu Pembayaran",
 awaiting_verification:"Menunggu Verifikasi",
 needs_confirmation:"Perlu Konfirmasi",
 payment_rejected:"Pembayaran Ditolak",
 payment_verified:"Pembayaran Terverifikasi",
 access_sent:"Akses/Lisensi Dikirim",
 completed:"Selesai",
 cancelled:"Dibatalkan"
};
export default async function OrderPage({params,searchParams}:{params:Promise<{token:string}>;searchParams:Promise<{claimed?:string;updated?:string;error?:string}>}){
 const{token}=await params,q=await searchParams,db=sql();await ensureCommerceSchema(db);
 const rows=await db`SELECT o.*,pm.label payment_label FROM orders o LEFT JOIN payment_methods pm ON pm.code=o.payment_method_code WHERE o.public_token=${token} LIMIT 1`,order:any=rows[0];
 if(!order)return <main className="order-page"><div className="order-missing"><h1>Pesanan tidak ditemukan.</h1><Link href="/">Kembali ke MenujuKita</Link></div></main>;
 const payment=order.payment_snapshot||{},methods=order.status==="pending_payment"?await db`SELECT code,label FROM payment_methods WHERE is_active=true ORDER BY sort_order,label`:[];
 return <main className="order-page">
  <header className="order-top"><Link href="/"><ArrowLeft size={16}/>MenujuKita</Link><span>Order {order.order_no}</span></header>
  <section className="order-wrap">
   <div className="order-status-card">
    <span className={"order-status-icon status-"+order.status}>{["access_sent","completed","payment_verified"].includes(order.status)?<CheckCircle2 size={24}/>:<Clock3 size={24}/>}</span>
    <div><small>STATUS PESANAN</small><h1>{statusLabel[order.status]||order.status}</h1><p>{order.status==="pending_payment"?"Selesaikan pembayaran menggunakan metode yang dipilih, lalu beri tahu kami.":order.status==="awaiting_verification"?"Konfirmasi sudah diterima. Tim Teman Digital sedang mengecek pembayaran secara manual.":order.status==="needs_confirmation"?"Pembayaran belum berhasil kami cocokkan. Periksa detail transaksi dan hubungi Teman Digital bila perlu.":order.status==="payment_verified"?"Pembayaran sudah terverifikasi. Lisensi sedang disiapkan/dikirim.":order.status==="access_sent"?"Kode Lisensi + PIN sudah dikirim ke email Anda. Silakan cek inbox dan spam.":order.status==="completed"?"Pesanan selesai dan akses wedding sudah aktif.":"Silakan ikuti petunjuk pada email atau hubungi Teman Digital."}</p></div>
   </div>
   {q.claimed&&<div className="order-email-note"><Mail size={17}/><div><b>Email konfirmasi sudah diproses.</b><span>Anda dan admin Teman Digital mendapat notifikasi bahwa pembayaran menunggu verifikasi.</span></div></div>}
   <div className="order-grid">
    <section className="order-card-premium">
     <div className="order-section-title"><small>DETAIL PESANAN</small><h2>MenujuKita</h2></div>
     <div className="order-detail-list"><p><span>Order ID</span><b>{order.order_no}</b></p><p><span>Nama</span><b>{order.customer_name}</b></p><p><span>Email</span><b>{order.customer_email}</b></p><p><span>WhatsApp</span><b>{order.customer_whatsapp}</b></p><p><span>Total</span><b>{money(order.amount)}</b></p></div>
     {order.status==="pending_payment"&&<details className="edit-order-buyer"><summary>Edit data pembeli</summary><form action={updateBuyerDetails} className="editor-form"><input type="hidden" name="token" value={token}/><input className="input span-2" name="name" defaultValue={order.customer_name} required/><input className="input" name="email" type="email" defaultValue={order.customer_email} required/><input className="input" name="whatsapp" defaultValue={order.customer_whatsapp} required/><input className="input" name="couple_names" defaultValue={order.couple_names||""} placeholder="Nama pasangan (opsional)"/><input className="input" name="wedding_date" type="date" defaultValue={order.wedding_date?String(order.wedding_date).slice(0,10):""}/><button className="btn btn-primary span-2">Simpan data pembeli</button></form></details>}
     {q.updated&&<div className="success-box">Data pembeli berhasil diperbarui.</div>}{q.error&&<div className="notice">Periksa kembali nama, email, dan WhatsApp.</div>}
    </section>
    <section className="order-card-premium payment-order-card">
     <div className="order-section-title"><small>PEMBAYARAN</small><h2>{payment.label||order.payment_label}</h2></div>
     {order.status==="pending_payment"&&<>
      {payment.type==="qris"?<div className="order-qris"><img src={payment.qr_image_path||"/qris-teman-digital.svg"} alt="QRIS Teman Digital"/><div><span>Merchant</span><b>{payment.account_name||"TEMAN DIGITAL"}</b><small>ID QRIS {payment.merchant_id||payment.account_no}</small></div></div>:<div className="order-bank"><small>{payment.type==="ewallet"?"NOMOR GOPAY":"NOMOR REKENING"}</small><b>{payment.account_no}</b><CopyButton value={String(payment.account_no||"")}/><span>Atas Nama</span><strong>{payment.account_name}</strong></div>}
      <p className="payment-warning">{payment.instructions}</p>
      <details className="change-method"><summary>Ganti metode pembayaran</summary><form action={changePaymentMethod}><input type="hidden" name="token" value={token}/><select className="input" name="payment_method" defaultValue={order.payment_method_code}>{(methods as any[]).map(m=><option key={m.code} value={m.code}>{m.label}</option>)}</select><button className="btn">Simpan metode</button></form></details>
     </>}
     {order.status!=="pending_payment"&&<div className="payment-locked"><ShieldCheck size={21}/><p>Metode pembayaran dikunci setelah Anda menekan <b>Saya Sudah Membayar</b>.</p></div>}
    </section>
   </div>
   {order.status==="pending_payment"&&<form action={claimPayment} className="claim-payment-box"><input type="hidden" name="token" value={token}/><div><small>SUDAH TRANSFER?</small><h2>Beritahu kami setelah pembayaran dilakukan.</h2><p>Tombol ini <b>tidak langsung mengaktifkan lisensi</b>. Owner tetap akan mengecek rekening/QRIS lebih dulu.</p></div><button>Saya Sudah Membayar</button></form>}
   {order.status==="awaiting_verification"&&<section className="waiting-box"><Clock3 size={26}/><div><h2>Sedang diperiksa.</h2><p>Tidak perlu melakukan pembayaran kedua kali. Setelah owner menekan Konfirmasi Pembayaran, sistem otomatis membuat lisensi dan PIN lalu mengirimkannya ke <b>{order.customer_email}</b>.</p></div></section>}
   {["access_sent","completed"].includes(order.status)&&<section className="waiting-box success"><CheckCircle2 size={26}/><div><h2>Akses sudah dikirim.</h2><p>Cek email <b>{order.customer_email}</b>. Setelah login pertama, Anda dapat menyiapkan wedding workspace dan mengatur seluruh data sendiri.</p><Link className="btn btn-primary" href="/auth/sign-in">Masuk ke MenujuKita</Link></div></section>}
  </section>
 </main>
}

import Link from "next/link";
import { ArrowLeft,CheckCircle2,LockKeyhole,Sparkles } from "lucide-react";
import { createOrder } from "./actions";
import { sql } from "@/lib/db";
import { ensureCommerceSchema,MENUJUKITA_PRICE } from "@/lib/commerce";
import PaymentMethods from "@/components/commerce/payment-methods";

export const dynamic="force-dynamic";
const rupiah=(n:number)=>new Intl.NumberFormat("id-ID",{style:"currency",currency:"IDR",maximumFractionDigits:0}).format(n);

export default async function Checkout({searchParams}:{searchParams:Promise<{error?:string}>}){
 const db=sql();await ensureCommerceSchema(db);
 const methods=await db`SELECT code,label,type,account_no,account_name,merchant_id,instructions,qr_image_path FROM payment_methods WHERE is_active=true ORDER BY sort_order,label`;
 const q=await searchParams;
 return <main className="checkout-page">
  <header className="checkout-top"><Link href="/"><ArrowLeft size={17}/>Kembali</Link><div className="brand"><span className="brand-mark">M</span><span className="brand-copy"><strong>MenujuKita</strong><small>Checkout · Teman Digital</small></span></div><span className="checkout-secure"><LockKeyhole size={14}/>Verifikasi manual</span></header>
  <section className="checkout-layout">
   <aside className="checkout-summary">
    <span className="micro-label">MENUJUKITA PILOT</span><h1 className="serif">Satu workspace untuk seluruh perjalanan wedding.</h1><p>Setelah pembayaran diverifikasi, Kode Lisensi + PIN dikirim otomatis ke email kalian.</p>
    <div className="checkout-price"><small>TOTAL PEMBAYARAN</small><strong>{rupiah(MENUJUKITA_PRICE)}</strong><span>sekali bayar · 1 wedding workspace</span></div>
    <div className="checkout-points"><span><CheckCircle2 size={16}/>Checklist & timeline lengkap</span><span><CheckCircle2 size={16}/>Budget + Safe to Spend</span><span><CheckCircle2 size={16}/>Guest, RSVP & seating</span><span><CheckCircle2 size={16}/>Vendor, payment & documents</span><span><CheckCircle2 size={16}/>Wedding Health + Day-H Mode</span></div>
    <div className="checkout-note"><Sparkles size={17}/><p><b>Pembayaran tidak aktif otomatis.</b> Tim Teman Digital akan mengecek pembayaran terlebih dahulu sebelum lisensi diterbitkan.</p></div>
   </aside>
   <form action={createOrder} className="checkout-form">
    <div className="checkout-section-head"><small>01 · DATA PEMBELI</small><h2>Siapa yang membeli?</h2><p>Pastikan email aktif karena lisensi dan PIN dikirim ke alamat ini.</p></div>
    <div className="form-grid">
     <label className="field"><span>Nama lengkap</span><input className="input" name="name" autoComplete="name" required placeholder="Nama pembeli"/></label>
     <label className="field"><span>Nomor WhatsApp</span><input className="input" name="whatsapp" inputMode="tel" autoComplete="tel" required placeholder="08xxxxxxxxxx"/></label>
     <label className="field span-2"><span>Email aktif</span><input className="input" name="email" type="email" autoComplete="email" required placeholder="nama@email.com"/></label>
     <label className="field"><span>Nama pasangan <small>(opsional)</small></span><input className="input" name="couple_names" placeholder="Alya & Raka"/></label>
     <label className="field"><span>Tanggal wedding <small>(opsional)</small></span><input className="input" type="date" name="wedding_date"/></label>
    </div>
    <div className="checkout-section-head payment-head"><small>02 · PEMBAYARAN</small><h2>Pilih cara bayar.</h2><p>Semua metode diverifikasi manual oleh owner Teman Digital.</p></div>
    <PaymentMethods methods={methods as any[]}/>
    {q.error&&<div className="notice">{q.error==="payment"?"Metode pembayaran tidak tersedia. Pilih metode lain.":q.error==="limit"?"Terlalu banyak order dibuat. Coba lagi sekitar 15 menit.":"Periksa kembali nama, email, dan WhatsApp."}</div>}
    <button className="checkout-submit">Lanjut ke pembayaran · {rupiah(MENUJUKITA_PRICE)}</button>
    <p className="checkout-privacy">Dengan melanjutkan, data digunakan hanya untuk pemrosesan order, verifikasi pembayaran, pengiriman lisensi, dan dukungan transaksi MenujuKita.</p>
   </form>
  </section>
 </main>
}

import Link from "next/link";
import { ArrowRight, CalendarClock, Check, CircleDollarSign, HeartPulse, ListChecks, Sparkles, Store, UsersRound } from "lucide-react";

const features=[
  [ListChecks,"Checklist & Timeline","Tahu apa yang harus dilakukan sekarang, bukan tenggelam dalam daftar panjang."],
  [CircleDollarSign,"Budget & Safe to Spend","Lihat uang yang benar-benar masih aman digunakan setelah seluruh komitmen pembayaran."],
  [UsersRound,"Guest & RSVP","Kelola undangan, pax, RSVP, kelompok tamu, sampai seating dengan lebih tenang."],
  [Store,"Vendor Partners","Simpan kandidat, status deal, harga, kontak, pembayaran, dan catatan penting vendor."],
  [HeartPulse,"Wedding Health","Satu ringkasan yang menunjukkan bagian persiapan yang aman dan yang perlu perhatian."],
  [CalendarClock,"Day-H Mode","Saat hari H tiba, MenujuKita berubah menjadi pusat kendali rundown yang simpel."]
] as const;

export default function Home(){
 return <main className="mk-landing">
  <section className="mk-hero" style={{backgroundImage:"url('https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=2200&q=88')"}}>
   <div className="mk-hero-shade"/>
   <nav className="mk-nav">
    <Link className="mk-brand" href="/"><span>M</span><div><b>MenujuKita</b><small>Plan the journey. Enjoy the day.</small></div></Link>
    <div className="mk-nav-links"><a href="#fitur">Fitur</a><a href="#cara-kerja">Cara Kerja</a><a href="#harga">Harga</a><Link href="/auth/sign-in">Masuk</Link></div>
    <Link className="mk-nav-cta" href="/demo">Coba Demo <ArrowRight size={15}/></Link>
   </nav>

   <div className="mk-hero-content">
    <span className="mk-kicker">WEDDING PLANNING, BUT CALMER.</span>
    <h1>Semua detail menuju<br/><em>hari kalian.</em></h1>
    <p>Checklist, budget, tamu, vendor, timeline, dokumen, sampai Hari-H—dirapikan dalam satu ruang yang terasa personal, bukan seperti dashboard kantor.</p>
    <div className="mk-hero-actions"><Link className="mk-button mk-button-light" href="/demo">Coba Demo Tanpa Daftar <ArrowRight size={17}/></Link><Link className="mk-button mk-button-glass" href="/checkout">Beli Rp49.000</Link></div>
   </div>

   <div className="mk-feature-ribbon">
    <button type="button"><ListChecks size={18}/><span><small>PLAN</small>Checklist</span></button>
    <button type="button"><CircleDollarSign size={18}/><span><small>MONEY</small>Budget</span></button>
    <button type="button"><UsersRound size={18}/><span><small>PEOPLE</small>Guests</span></button>
    <button type="button"><Store size={18}/><span><small>PARTNERS</small>Vendors</span></button>
    <button type="button"><CalendarClock size={18}/><span><small>THE DAY</small>Day-H</span></button>
   </div>
  </section>

  <section className="mk-intro">
   <span className="mk-kicker dark">BUKAN SEKADAR CHECKLIST</span>
   <h2>Ruang persiapan wedding yang<br/><em>terasa seperti milik kalian sendiri.</em></h2>
   <p>Foto pasangan menjadi wajah utama workspace. Setiap wedding punya cover, countdown, progres, prioritas, dan data sendiri—semuanya bisa dikelola dari HP maupun laptop.</p>
  </section>

  <section className="mk-feature-section" id="fitur">
   <div className="mk-section-head"><div><span className="mk-kicker dark">THE WEDDING STUDIO</span><h2>Satu perjalanan.<br/>Semua yang penting.</h2></div><p>MenujuKita sengaja tidak dibuat seperti software bisnis. Data tetap kuat, tetapi pengalaman tetap hangat dan mudah dibaca.</p></div>
   <div className="mk-feature-grid">{features.map(([Icon,title,copy],i)=><article key={title}><span className="mk-feature-no">{String(i+1).padStart(2,"0")}</span><div className="mk-feature-icon"><Icon size={20}/></div><h3>{title}</h3><p>{copy}</p></article>)}</div>
  </section>

  <section className="mk-product-story">
   <div className="mk-product-copy"><span className="mk-kicker">PERSONAL BY DEFAULT</span><h2>Begitu dibuka,<br/>yang terlihat adalah <em>kalian.</em></h2><p>Setiap user dapat mengganti foto cover wedding sendiri. Foto itu menjadi hero utama dashboard, dengan overlay otomatis agar countdown, nama pasangan, dan status persiapan tetap terbaca.</p><ul><li><Check size={16}/>Upload JPG, PNG, atau WEBP</li><li><Check size={16}/>Atur posisi foto dan tingkat overlay</li><li><Check size={16}/>Bisa diganti kapan saja dari Settings</li></ul></div>
   <div className="mk-product-card" style={{backgroundImage:"url('https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&w=1400&q=88')"}}><div className="mk-product-overlay"/><div className="mk-product-ui"><small>NADIA & ARGA</small><strong>128 hari lagi</strong><span>Persiapan 68% selesai</span><div><b>Wedding Health</b><em>82 · On Track</em></div></div></div>
  </section>

  <section className="mk-how" id="cara-kerja">
   <div className="mk-section-head"><div><span className="mk-kicker dark">SIMPLE FLOW</span><h2>Dari beli akses sampai Hari-H.</h2></div></div>
   <div className="mk-steps"><article><b>01</b><h3>Checkout & bayar</h3><p>Pilih QRIS, BRI, Mandiri, BSI, Bank Sulteng, atau GoPay.</p></article><article><b>02</b><h3>Owner verifikasi</h3><p>Setelah transfer, klik Saya Sudah Membayar. Owner mengecek dana masuk secara manual.</p></article><article><b>03</b><h3>Terima akses</h3><p>Kode Lisensi MK-XXXX-XXXX + PIN dikirim otomatis ke email setelah pembayaran terverifikasi.</p></article><article><b>04</b><h3>Plan & enjoy</h3><p>Setup wedding workspace, rencanakan semuanya, lalu gunakan Day-H Mode.</p></article></div>
  </section>

  <section className="mk-pricing" id="harga">
   <div><span className="mk-kicker">PILOT OFFER</span><h2>Satu harga.<br/>Satu wedding workspace.</h2><p>Seluruh fitur inti tersedia dalam satu lisensi pilot. Tidak ada tier yang bikin bingung.</p></div>
   <article><small>PROMO PILOT</small><div className="mk-price"><span>Rp</span><strong>49.000</strong></div><p>Satu kali bayar untuk satu wedding workspace.</p><div className="mk-price-list">{["Checklist & Timeline","Budget + Safe to Spend","Guest & RSVP","Vendor & Payments","Visual Seating","Private Vault","Wedding Health","Day-H Mode"].map(x=><span key={x}><Check size={14}/>{x}</span>)}</div><Link className="mk-button mk-button-dark" href="/checkout">Beli MenujuKita — Rp49.000 <ArrowRight size={16}/></Link><Link className="mk-login-under-price" href="/auth/sign-in">Sudah punya akses? Masuk di sini</Link><small>Maksimal 250 wedding aktif pada fase pilot.</small></article>
  </section>

  <section className="mk-final-cta"><Sparkles size={22}/><h2>Persiapannya serius.<br/><em>Rasanya tetap harus menyenangkan.</em></h2><Link className="mk-button mk-button-dark" href="/demo">Masuk Demo Pro <ArrowRight size={16}/></Link></section>
  <footer className="mk-footer"><div className="mk-brand dark"><span>M</span><div><b>MenujuKita</b><small>Plan the journey. Enjoy the day.</small></div></div><p>Created by <b>Teman Digital</b></p></footer>
 </main>
}

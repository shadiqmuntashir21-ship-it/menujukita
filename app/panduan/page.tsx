import Link from "next/link";
import PrintGuide from "@/components/print-guide";
export const metadata={title:"Panduan Aktivasi MenujuKita"};
export default function Guide(){
 return <main className="guide-page">
  <header className="guide-head"><Link href="/" className="brand"><span className="brand-mark">M</span><span className="brand-copy"><strong>MenujuKita</strong><small>Teman Digital</small></span></Link><PrintGuide/></header>
  <article className="guide-paper">
   <span className="micro-label">PANDUAN AKTIVASI & PENGGUNAAN</span><h1 className="serif">Selamat datang di MenujuKita.</h1><p className="guide-lead">Panduan singkat untuk masuk pertama kali, menyiapkan wedding workspace, menginstal PWA, dan mulai memakai fitur inti.</p>
   <section><h2>1. Masuk dengan Kode Lisensi + PIN</h2><p>Buka halaman login MenujuKita. Masukkan Kode Lisensi dengan format <b>MK-XXXX-XXXX</b> dan PIN 6 digit yang dikirim lewat email setelah pembayaran terverifikasi.</p><p><Link href="/auth/sign-in">Buka halaman login →</Link></p></section>
   <section><h2>2. Setup wedding pertama</h2><p>Isi nama pasangan, tanggal wedding, kota, budget awal, target tamu, dan tipe perencanaan. Sistem akan membuat workspace dan checklist dasar otomatis.</p></section>
   <section><h2>3. Ganti foto cover</h2><p>Buka Settings. Upload foto pasangan JPG/PNG/WEBP, atur posisi fokus dan overlay agar wajah dan teks tetap terbaca.</p></section>
   <section><h2>4. Pakai fitur inti</h2><ul><li><b>Wedding Journey:</b> tambah, edit, centang, assign PIC, dan hapus task.</li><li><b>Wedding Wallet:</b> atur budget, alokasi, payment, committed cost, dan Safe to Spend.</li><li><b>Guest Book:</b> kelola tamu, pax, RSVP, grup, side keluarga, dan dietary notes.</li><li><b>Vendor Partners:</b> simpan kandidat, harga, status, PIC, dan notes.</li><li><b>Seating:</b> buat meja dan tempatkan tamu.</li><li><b>Vault:</b> simpan kontrak, invoice, floorplan, rundown, dan dokumen penting.</li><li><b>Day-H Mode:</b> jalankan rundown dan lihat agenda sekarang/berikutnya.</li></ul></section>
   <section><h2>5. Instal sebagai aplikasi</h2><p>Gunakan tombol install yang muncul di browser yang mendukung PWA. Setelah terpasang, MenujuKita dapat dibuka seperti aplikasi dari HP atau laptop.</p></section>
   <section><h2>6. Keamanan akses</h2><p>Jangan membagikan Kode Lisensi + PIN ke pihak yang tidak dipercaya. Jika PIN perlu direset, hubungi Teman Digital.</p></section>
   <section><h2>7. Bantuan & garansi</h2><p>Teman Digital memberikan garansi untuk bug/error pada fitur yang termasuk scope produk. Penambahan fitur atau perubahan scope baru tidak termasuk garansi bug.</p><p><b>Email operasional:</b> temandigital26@gmail.com</p></section>
   <footer><b>Teman Digital</b><br/>Bangun Lebih Baik. Tumbuh Lebih Cepat.</footer>
  </article>
 </main>
}
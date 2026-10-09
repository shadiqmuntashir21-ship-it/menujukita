import Link from "next/link";
import {BookOpen,Download,FileSpreadsheet,Printer,ShieldCheck} from "lucide-react";
const formats=[
 {slug:"checklist",title:"Checklist dan tugas",about:"Tugas, status, prioritas dan tenggat"},
 {slug:"keuangan",title:"Riwayat keuangan",about:"Setoran, penarikan, refund dan pembayaran vendor"},
 {slug:"vendor",title:"Daftar vendor",about:"Penawaran, status, harga dan kontak"},
 {slug:"tamu",title:"Daftar tamu",about:"Grup, telepon, RSVP dan estimasi hadir"},
 {slug:"seserahan",title:"Seserahan",about:"Barang, harga satuan dan status pembelian"},
 {slug:"rundown",title:"Rundown Hari-H",about:"Agenda, PIC, jam dan lokasi"}
];
export default function ReportsSection(){
 return <section className="module-stack" id="reports">
 <header className="module-editorial-head"><div><span className="micro-label">LAPORAN & EKSPOR</span><h2 className="serif">Semua rencana bisa kalian bawa.</h2><p>Unduh data dalam CSV untuk Excel atau Google Sheets, atau cetak ringkasan wedding dan simpan sebagai PDF.</p></div><FileSpreadsheet size={28}/></header>
 <div className="studio-panel" style={{padding:20,borderRadius:20,display:"grid",gap:12}}>
 <h3 style={{margin:0}}>Ringkasan wedding</h3><p className="muted" style={{fontSize:14}}>Termasuk status checklist, saldo aktual, vendor, tamu dan rundown dalam tampilan siap cetak.</p>
 <Link className="btn btn-primary" href="/app/cetak" target="_blank"><Printer size={17}/> Buka laporan siap cetak / PDF</Link>
 </div>
 <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,275px),1fr))",gap:12}}>
 {formats.map(f=><div key={f.slug} className="studio-panel" style={{padding:18,borderRadius:18,display:"grid",gap:10}}>
 <div style={{display:"flex",gap:10,alignItems:"center"}}><FileSpreadsheet size={20}/><b>{f.title}</b></div>
 <p className="muted" style={{fontSize:13,margin:0,lineHeight:1.6}}>{f.about}</p>
 <a className="btn" href={"/api/exports/"+f.slug} download><Download size={16}/> Unduh CSV</a>
 </div>)}
 </div>
 <aside style={{background:"#eef2ea",padding:16,borderRadius:16,display:"flex",gap:10,fontSize:13,lineHeight:1.6}}>
 <ShieldCheck size={19}/><span>Ekspor hanya tersedia setelah login pada wedding yang berhak diakses. File mungkin berisi nomor tamu dan catatan keuangan pribadi—simpan dan bagikan secara hati-hati.</span>
 </aside>
 <details className="composer-card"><summary><span><BookOpen size={17}/> Cara menggunakan file laporan</span><small>CSV, Excel dan PDF</small></summary>
 <div style={{padding:15,lineHeight:1.7}}><ol><li>Pilih jenis data yang dibutuhkan.</li><li>Unduh CSV dan buka di Excel atau Google Sheets untuk menyortir dan memfilter.</li><li>Untuk ringkasan acara, buka halaman siap cetak lalu gunakan pilihan Simpan sebagai PDF pada browser.</li><li>Periksa informasi pribadi sebelum membagikannya kepada pihak lain.</li></ol></div></details>
 </section>;
}

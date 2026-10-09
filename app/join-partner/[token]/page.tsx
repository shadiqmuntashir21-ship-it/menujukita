import Link from "next/link";
import {sql} from "@/lib/db";
import {sha256} from "@/lib/session";
import {BrandLogo} from "@/components/brand";
import {acceptPartnerInvite} from "@/app/app/partner-actions";
export const dynamic="force-dynamic";
export default async function JoinPartnerPage({params,searchParams}:{params:Promise<{token:string}>;searchParams:Promise<{error?:string}>}){
 const {token}=await params,q=await searchParams;
 const rows=await sql()`SELECT w.couple_one_name,w.couple_two_name,p.invite_expires_at
  FROM wedding_partner_access p JOIN weddings w ON w.id=p.wedding_id JOIN licenses l ON l.id=p.license_id
  WHERE p.invite_token_hash=${sha256(token)} AND p.status='invited' AND p.invite_expires_at>now()
   AND w.status='active' AND l.status='active' LIMIT 1`;
 const item:any=rows[0];
 const messages:Record<string,string>={data:"Isi nama dan dua kolom PIN 6 angka yang sama.",limit:"Terlalu banyak percobaan. Coba lagi sekitar 15 menit.",duplicate:"Gunakan PIN yang berbeda dari PIN utama.",expired:"Tautan undangan telah digunakan atau kedaluwarsa."};
 return <main className="auth-page"><section className="auth-card stack" style={{maxWidth:560}}>
  <Link href="/" className="brand"><BrandLogo className="auth-logo"/></Link>
  {!item?<><span className="eyebrow">UNDANGAN TIDAK AKTIF</span><h1 className="serif" style={{fontSize:36}}>Tautan ini sudah tidak berlaku.</h1><p className="muted">Minta pengelola wedding membuat tautan undangan baru. Jangan bagikan kode dan PIN melalui halaman publik.</p><Link className="btn" href="/">Kembali ke MenujuKita</Link></>:
  <><span className="eyebrow">UNDANGAN PRIBADI</span><h1 className="serif" style={{fontSize:36}}>Bergabung dengan {item.couple_one_name} & {item.couple_two_name}</h1>
   <p className="muted">Kalian akan bekerja pada satu ruang wedding bersama. Atur PIN pribadi agar tidak perlu saling membagikan PIN utama. Tautan ini hanya dapat digunakan sekali.</p>
   {q.error&&<div className="notice" role="alert">{messages[q.error]||"Permintaan belum berhasil. Coba kembali."}</div>}
   <form action={acceptPartnerInvite.bind(null,token)} className="stack">
    <label className="field"><span>Nama atau panggilan Anda</span><input className="input" name="name" minLength={2} maxLength={80} autoComplete="name" placeholder="Nama pasangan kedua" required/></label>
    <label className="field"><span>Buat PIN pribadi (6 angka)</span><input className="input" name="pin" inputMode="numeric" type="password" pattern="[0-9]{6}" minLength={6} maxLength={6} autoComplete="new-password" placeholder="••••••" required/></label>
    <label className="field"><span>Ulangi PIN pribadi</span><input className="input" name="confirm_pin" inputMode="numeric" type="password" pattern="[0-9]{6}" minLength={6} maxLength={6} autoComplete="new-password" placeholder="••••••" required/></label>
    <small className="muted">Selanjutnya, masuk menggunakan Kode Lisensi wedding yang sama dan PIN pribadi Anda. Hindari PIN mudah ditebak seperti tanggal lahir atau 123456.</small>
    <button className="btn btn-primary btn-large" type="submit">Aktifkan akses saya</button>
   </form></>}
 </section></main>;
}

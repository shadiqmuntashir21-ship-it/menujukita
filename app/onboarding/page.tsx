import { auth } from "@/lib/auth/server";
import { redirect } from "next/navigation";
import { activateWedding } from "./actions";

export const dynamic="force-dynamic";
export default async function Page({searchParams}:{searchParams:Promise<{error?:string}>}){
  const {data:s}=await auth.getSession(); if(!s?.user) redirect("/auth/sign-in");
  const q=await searchParams;
  const errors:any={license:"Kode lisensi tidak valid atau sudah digunakan.",activation:"Aktivasi gagal. Kode mungkin baru saja digunakan atau kapasitas pilot sudah penuh.",data:"Lengkapi nama pasangan dan tanggal wedding."};
  return <main className="auth-page"><form action={activateWedding} className="auth-card stack onboarding-card">
    <div className="brand"><span className="brand-mark">M</span><span className="brand-copy"><strong>MenujuKita</strong><small>Aktivasi wedding workspace</small></span></div>
    <div><h1 className="serif" style={{fontSize:38,marginBottom:8}}>Mulai perjalanan kalian.</h1><p className="muted">Isi yang penting saja. Checklist, kategori budget, dan event awal dibuat otomatis.</p></div>
    {q.error&&<div className="notice">{errors[q.error]||"Terjadi kendala saat aktivasi."}</div>}
    <div className="field"><label>Activation Code</label><input className="input" name="license" placeholder="MK-XXXX-XXXX" required/></div>
    <div className="split"><div className="field"><label>Nama Pasangan 1</label><input className="input" name="one" required/></div><div className="field"><label>Nama Pasangan 2</label><input className="input" name="two" required/></div></div>
    <div className="split"><div className="field"><label>Tanggal Wedding</label><input className="input" type="date" name="date" required/></div><div className="field"><label>Kota</label><input className="input" name="city" placeholder="Contoh: Palu"/></div></div>
    <div className="split"><div className="field"><label>Budget Awal</label><input className="input" type="number" min="0" name="budget" placeholder="75000000"/></div><div className="field"><label>Target Tamu</label><input className="input" type="number" min="0" max="5000" name="guests" placeholder="350"/></div></div>
    <div className="field"><label>Cara Merencanakan</label><select className="input" name="planning_style" defaultValue="couple"><option value="couple">Kami sendiri</option><option value="family">Kami + keluarga</option><option value="couple_wo">Kami + WO</option><option value="wo">WO dominan</option></select></div>
    <div className="split"><div className="field"><label>Acara Utama</label><input className="input" name="ceremony_name" defaultValue="Akad / Pemberkatan"/></div><div className="field"><label>Acara Kedua</label><input className="input" name="reception_name" defaultValue="Resepsi"/></div></div>
    <button className="btn btn-primary">Aktifkan & Siapkan Workspace</button>
  </form></main>
}

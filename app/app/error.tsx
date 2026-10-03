"use client";

import Link from "next/link";
import { AlertTriangle,RefreshCw } from "lucide-react";

export default function Error({reset}:{error:Error&{digest?:string};reset:()=>void}){
  return <main className="auth-page"><section className="auth-card stack">
    <div className="brand"><span className="brand-mark">M</span><span className="brand-copy"><strong>MenujuKita</strong><small>Workspace recovery</small></span></div>
    <div className="error-icon"><AlertTriangle size={24}/></div>
    <div><h1 className="serif" style={{fontSize:38,marginBottom:8}}>Workspace belum berhasil dimuat.</h1><p className="muted">Data kalian tetap aman. Coba muat ulang bagian ini; jika koneksi sedang offline, MenujuKita akan kembali setelah internet tersedia.</p></div>
    <button className="btn btn-primary" onClick={reset}><RefreshCw size={16}/>Coba Lagi</button>
    <Link className="btn" href="/">Kembali ke MenujuKita</Link>
  </section></main>;
}

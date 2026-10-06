"use client";
import Link from "next/link";
import {BrandLogo} from "@/components/brand";
import { useActionState } from "react";
import { KeyRound,LockKeyhole } from "lucide-react";
import { signIn } from "./actions";
export default function SignInForm(){
 const[s,a,p]=useActionState(signIn,null);
 return <main className="auth-page license-auth-page">
  <section className="auth-visual"><Link className="brand brand-light" href="/" aria-label="MenujuKita"><BrandLogo className="auth-logo"/></Link><div><span className="eyebrow dark-chip">PRIVATE WEDDING SPACE</span><h1 className="serif">Kembali ke perjalanan kalian.</h1><p>Semua checklist, tamu, vendor, budget, dan hari H menunggu di satu ruang yang sama.</p></div><div className="auth-proof"><span>1 lisensi</span><span>1 wedding</span><span>bisa dipakai bersama pasangan</span></div></section>
  <form action={a} className="auth-card stack auth-card-premium"><div><span className="eyebrow">MASUK KE WEDDING</span><h2 className="serif auth-title">Kode + PIN. Selesai.</h2><p className="muted">Gunakan akses dari Teman Digital. Tidak perlu email atau membuat akun.</p></div>
  <label className="field premium-field"><span><KeyRound size={16}/>Kode Lisensi</span><input className="input" name="license" autoCapitalize="characters" placeholder="MK-ABCD-EFGH" required/></label>
  <label className="field premium-field"><span><LockKeyhole size={16}/>PIN</span><input className="input pin-input" name="pin" inputMode="numeric" type="password" placeholder="••••••" minLength={4} maxLength={8} required/></label>
  {s?.error&&<div className="notice">{s.error}</div>}<button className="btn btn-primary btn-large" disabled={p}>{p?"Membuka wedding...":"Masuk ke Wedding Saya"}</button>
  <div className="auth-links"><Link href="/demo">Coba Demo dulu</Link><span>·</span><Link href="/#pricing">Promo Rp49.000</Link></div><small className="muted auth-help">Belum menerima kode? Hubungi Teman Digital setelah pembelian.</small></form>
 </main>
}

"use client";
import Link from "next/link";
import { useActionState } from "react";
import { signIn } from "./actions";
export default function SignInForm({next="/app"}:{next?:string}){
  const[s,a,p]=useActionState(signIn,null);
  return <main className="auth-page"><form action={a} className="auth-card stack"><input type="hidden" name="next" value={next}/><Link className="brand" href="/"><span className="brand-mark">M</span><span className="brand-copy"><strong>MenujuKita</strong><small>Plan the journey. Enjoy the day.</small></span></Link><div><h1 className="serif" style={{fontSize:40,marginBottom:8}}>Selamat datang kembali.</h1><p className="muted">Masuk untuk melanjutkan persiapan kalian.</p></div><div className="field"><label>Email</label><input className="input" name="email" type="email" required/></div><div className="field"><label>Password</label><input className="input" name="password" type="password" required minLength={8}/></div>{s?.error&&<div className="notice">{s.error}</div>}<button className="btn btn-primary" disabled={p}>{p?"Memproses...":"Masuk"}</button><p className="muted" style={{textAlign:"center"}}>Belum punya akun? <Link href={"/auth/sign-up?next="+encodeURIComponent(next)} style={{fontWeight:800}}>Daftar</Link></p></form></main>
}
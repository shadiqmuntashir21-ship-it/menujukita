"use client";
import Link from "next/link";
import {BrandLogo} from "@/components/brand";
import { useActionState } from "react";
import { signUp } from "./actions";
export default function SignUpForm({next="/onboarding"}:{next?:string}){
  const[s,a,p]=useActionState(signUp,null);
  return <main className="auth-page"><form action={a} className="auth-card stack"><input type="hidden" name="next" value={next}/><Link className="brand" href="/" aria-label="MenujuKita"><BrandLogo className="auth-logo"/></Link><div><h1 className="serif" style={{fontSize:40,marginBottom:8}}>Mulai perjalanan kalian.</h1><p className="muted">{next.startsWith("/join/")?"Buat akun untuk menerima undangan wedding.":"Workspace utama dibuat setelah lisensi diaktifkan."}</p></div><div className="field"><label>Nama</label><input className="input" name="name" required/></div><div className="field"><label>Email</label><input className="input" name="email" type="email" required/></div><div className="field"><label>Password</label><input className="input" name="password" type="password" required minLength={8}/></div>{s?.error&&<div className="notice">{s.error}</div>}<button className="btn btn-primary" disabled={p}>{p?"Membuat akun...":"Buat Akun"}</button><p className="muted" style={{textAlign:"center"}}>Sudah punya akun? <Link href={"/auth/sign-in?next="+encodeURIComponent(next)} style={{fontWeight:800}}>Masuk</Link></p></form></main>
}
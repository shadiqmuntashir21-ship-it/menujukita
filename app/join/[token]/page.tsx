import Link from "next/link";
import crypto from "node:crypto";
import { auth } from "@/lib/auth/server";
import { sql } from "@/lib/db";
import { acceptInvite } from "./actions";

export const dynamic="force-dynamic";
const hash=(v:string)=>crypto.createHash("sha256").update(v).digest("hex");

export default async function Page({params,searchParams}:{params:Promise<{token:string}>;searchParams:Promise<{error?:string}>}){
  const {token}=await params;const q=await searchParams;
  const db=sql();
  const rows=await db`SELECT i.role,i.can_view_budget,i.expires_at,i.status,w.couple_one_name,w.couple_two_name
    FROM member_invites i JOIN weddings w ON w.id=i.wedding_id
    WHERE i.token_hash=${hash(token)} LIMIT 1`;
  const invite:any=rows[0];
  const {data:session}=await auth.getSession();
  const valid=invite&&invite.status==="pending"&&new Date(invite.expires_at)>new Date();
  return <main className="auth-page"><section className="auth-card stack">
    <div className="brand"><span className="brand-mark">M</span><span className="brand-copy"><strong>MenujuKita</strong><small>Wedding Collaboration</small></span></div>
    {!valid?<div><span className="eyebrow">INVITE TIDAK AKTIF</span><h1 className="serif" style={{fontSize:38}}>Link ini sudah tidak berlaku.</h1><p className="muted">Minta owner wedding membuat invite link baru.</p></div>:<><div><span className="eyebrow">YOU'RE INVITED</span><h1 className="serif" style={{fontSize:38}}>{invite.couple_one_name} & {invite.couple_two_name}</h1><p className="muted">Anda diundang sebagai <b>{invite.role}</b>{invite.can_view_budget?" dengan akses budget":""}.</p></div>{q.error&&<div className="notice">Invitation tidak dapat diterima.</div>}{session?.user?<form action={acceptInvite.bind(null,token)}><button className="btn btn-primary" style={{width:"100%"}}>Gabung ke Wedding</button></form>:<div className="stack"><Link className="btn btn-primary" href={"/auth/sign-in?next="+encodeURIComponent("/join/"+token)}>Masuk untuk menerima</Link><Link className="btn" href={"/auth/sign-up?next="+encodeURIComponent("/join/"+token)}>Buat akun</Link></div>}</>}
  </section></main>
}

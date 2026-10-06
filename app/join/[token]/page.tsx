import Link from "next/link";
import crypto from "node:crypto";
import { auth,authConfigured } from "@/lib/auth/server";
import { sql } from "@/lib/db";
import { acceptUndangan } from "./actions";
import {BrandLogo} from "@/components/brand";

export const dynamic="force-dynamic";
const hash=(v:string)=>crypto.createHash("sha256").update(v).digest("hex");

export default async function Page({params,searchParams}:{params:Promise<{token:string}>;searchParams:Promise<{error?:string}>}){
  const {token}=await params;const q=await searchParams;
  const db=sql();
  const rows=await db`SELECT i.role,i.can_view_budget,i.expires_at,i.status,w.couple_one_name,w.couple_two_name
    FROM member_invites i JOIN weddings w ON w.id=i.wedding_id
    WHERE i.token_hash=${hash(token)} LIMIT 1`;
  const invite:any=rows[0];
  const session=authConfigured?(await auth.getSession()).data:null;
  const valid=invite&&invite.status==="pending"&&new Date(invite.expires_at)>new Date();

  return <main className="auth-page"><section className="auth-card stack">
    <div className="brand"><BrandLogo className="auth-logo"/></div>
    {!authConfigured?<div className="notice">Server authentication belum dikonfigurasi. Undangan tetap aman dan dapat digunakan setelah setup production selesai.</div>:null}
    {!valid?<div><span className="eyebrow">INVITE TIDAK AKTIF</span><h1 className="serif" style={{fontSize:38}}>Link ini sudah tidak berlaku.</h1><p className="muted">Minta owner wedding membuat link undangan baru.</p></div>:<><div><span className="eyebrow">UNDANGAN UNTUK ANDA</span><h1 className="serif" style={{fontSize:38}}>{invite.couple_one_name} & {invite.couple_two_name}</h1><p className="muted">Anda diundang sebagai <b>{invite.role}</b>{invite.can_view_budget?" dengan akses budget":""}.</p></div>{q.error&&<div className="notice">{q.error==="email"?"Undangan ini ditujukan untuk email lain. Masuk dengan email yang menerima undangan.":"Undangan tidak dapat diterima."}</div>}{session?.user?<form action={acceptUndangan.bind(null,token)}><button className="btn btn-primary" style={{width:"100%"}}>Gabung ke Wedding</button></form>:<div className="stack"><Link className="btn btn-primary" href={"/auth/sign-in?next="+encodeURIComponent("/join/"+token)}>Masuk untuk menerima</Link><Link className="btn" href={"/auth/sign-up?next="+encodeURIComponent("/join/"+token)}>Buat akun</Link></div>}</>}
  </section></main>;
}

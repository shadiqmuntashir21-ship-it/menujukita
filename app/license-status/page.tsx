import { auth } from "@/lib/auth/server";
import { sql } from "@/lib/db";
import { redirect } from "next/navigation";

export const dynamic="force-dynamic";

export default async function Page(){
  const {data:session}=await auth.getSession();
  if(!session?.user) redirect("/auth/sign-in");
  const db=sql();
  const rows=await db`SELECT w.couple_one_name,w.couple_two_name,l.status
    FROM weddings w JOIN wedding_members m ON m.wedding_id=w.id LEFT JOIN licenses l ON l.wedding_id=w.id
    WHERE m.auth_user_id=${session.user.id} AND m.status='active' AND w.status='active'
    ORDER BY w.created_at DESC LIMIT 1`;
  if(!rows[0]) redirect("/onboarding");
  const x:any=rows[0];
  if(x.status==="active") redirect("/app");
  const copy=x.status==="suspended"?"Lisensi wedding ini sedang ditangguhkan. Data kalian tetap tersimpan dan akan kembali dapat diakses setelah lisensi diaktifkan kembali.":"Lisensi wedding ini sudah tidak aktif. Hubungi Teman Digital jika Anda membutuhkan bantuan akses.";
  return <main className="auth-page"><section className="auth-card stack">
    <div className="brand"><span className="brand-mark">M</span><span className="brand-copy"><strong>MenujuKita</strong><small>License Status</small></span></div>
    <div><span className="eyebrow">{String(x.status).toUpperCase()}</span><h1 className="serif" style={{fontSize:40}}>{x.couple_one_name} & {x.couple_two_name}</h1><p className="lead" style={{fontSize:16}}>{copy}</p></div>
    <a className="btn" href="/">Kembali ke MenujuKita</a>
  </section></main>
}

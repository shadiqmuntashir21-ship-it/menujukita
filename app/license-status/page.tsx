import { redirect } from "next/navigation";
import { getLicenseSession } from "@/lib/session";
import { sql } from "@/lib/db";
export const dynamic="force-dynamic";
export default async function Page(){
 const session:any=await getLicenseSession();if(!session)redirect("/auth/sign-in");
 if(session.status==="unused"&&!session.wedding_id)redirect("/onboarding");if(session.status==="active")redirect("/app");
 const db=sql(),rows=session.wedding_id?await db`SELECT couple_one_name,couple_two_name FROM weddings WHERE id=${session.wedding_id} LIMIT 1`:[];
 const w:any=rows[0],copy=session.status==="suspended"?"Lisensi wedding ini sedang ditangguhkan. Data tetap aman dan dapat digunakan lagi setelah diaktifkan oleh Teman Digital.":"Lisensi wedding ini sudah tidak aktif. Hubungi Teman Digital untuk bantuan akses.";
 return <main className="auth-page"><section className="auth-card stack"><div className="brand"><span className="brand-mark">M</span><span className="brand-copy"><strong>MenujuKita</strong><small>License Status</small></span></div><div><span className="eyebrow">{String(session.status).toUpperCase()}</span><h1 className="serif" style={{fontSize:40}}>{w?`${w.couple_one_name} & ${w.couple_two_name}`:"Wedding Access"}</h1><p className="lead" style={{fontSize:16}}>{copy}</p></div><a className="btn" href="/">Kembali</a></section></main>
}

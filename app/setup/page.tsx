import Link from "next/link";
import {BrandLogo} from "@/components/brand";
export const dynamic="force-dynamic";
export default function SetupPage(){
 const ready=Boolean(process.env.DATABASE_URL);
 return <main className="auth-page"><section className="auth-card stack"><div className="brand"><BrandLogo className="auth-logo"/></div><div><span className="eyebrow">{ready?"SERVER TERHUBUNG":"SETUP DIPERLUKAN"}</span><h1 className="serif" style={{fontSize:40,marginBottom:8}}>{ready?"Database connection tersedia.":"DATABASE_URL belum tersedia."}</h1><p className="muted">RSVP signing dan Object Storage dikelola server-side melalui Neon runtime, bukan secret di browser atau repository.</p></div><div className="stack">{ready?<Link className="btn btn-primary" href="/auth/sign-in">Masuk MenujuKita</Link>:<Link className="btn btn-primary" href="/demo">Buka Demo</Link>}<Link className="btn" href="/">Halaman Utama</Link></div></section></main>
}
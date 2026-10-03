import Link from "next/link";
export const dynamic="force-dynamic";
export default function SetupPage(){
 const ready=Boolean(process.env.DATABASE_URL);
 return <main className="auth-page"><section className="auth-card stack"><div className="brand"><span className="brand-mark">M</span><span className="brand-copy"><strong>MenujuKita</strong><small>Production Setup</small></span></div><div><span className="eyebrow">{ready?"SERVER CONNECTED":"SETUP REQUIRED"}</span><h1 className="serif" style={{fontSize:40,marginBottom:8}}>{ready?"Database connection tersedia.":"DATABASE_URL belum tersedia."}</h1><p className="muted">RSVP signing dan Object Storage dikelola server-side melalui Neon runtime, bukan secret di browser atau repository.</p></div><div className="stack">{ready?<Link className="btn btn-primary" href="/auth/sign-in">Masuk MenujuKita</Link>:<Link className="btn btn-primary" href="/demo">Buka Demo</Link>}<Link className="btn" href="/">Landing Page</Link></div></section></main>
}
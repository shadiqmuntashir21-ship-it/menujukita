import Link from "next/link";

const required=[
  "DATABASE_URL","NEON_AUTH_BASE_URL","NEON_AUTH_COOKIE_SECRET","RSVP_SIGNING_SECRET",
  "AWS_ACCESS_KEY_ID","AWS_SECRET_ACCESS_KEY","AWS_ENDPOINT_URL_S3","AWS_REGION","NEON_STORAGE_BUCKET"
] as const;

export const dynamic="force-dynamic";

export default function SetupPage(){
  const missing=required.filter(key=>!process.env[key]);
  const ready=missing.length===0;
  return <main className="auth-page"><section className="auth-card stack">
    <div className="brand"><span className="brand-mark">M</span><span className="brand-copy"><strong>MenujuKita</strong><small>Production Setup</small></span></div>
    <div>
      <span className="eyebrow">{ready?"SERVER READY":"SETUP REQUIRED"}</span>
      <h1 className="serif" style={{fontSize:40,marginBottom:8}}>{ready?"Konfigurasi server sudah siap.":"Environment production belum lengkap."}</h1>
      <p className="muted">{ready?"MenujuKita dapat menggunakan Neon Auth, database, RSVP signing, dan private storage.":"Landing dan Demo tetap dapat dibangun tanpa membuat Neon baru. Fitur live baru aktif setelah env existing-Neon dipasang di Vercel."}</p>
    </div>
    {!ready?<div className="notice"><b>Environment yang belum tersedia:</b><div style={{marginTop:8}}>{missing.map(k=><code key={k} style={{display:"block",margin:"4px 0"}}>{k}</code>)}</div></div>:null}
    <div className="stack">
      <Link className="btn btn-primary" href="/demo">Buka Demo</Link>
      <Link className="btn" href="/">Kembali ke Landing</Link>
    </div>
  </section></main>;
}

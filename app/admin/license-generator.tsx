"use client";
import { useActionState } from "react";
import { Copy } from "lucide-react";
import { generateLicenses } from "./actions";
export default function LicenseGenerator(){
  const[state,action,pending]=useActionState(generateLicenses,null);
  const csv=(state?.credentials||[]).map(x=>`${x.code},${x.pin}`).join("\n");
  return <section className="admin-card license-generator">
    <div className="admin-card-head"><div><span className="micro-label">ISSUE ACCESS</span><h3>Buat Kode + PIN</h3></div></div>
    <p className="muted">Buat lisensi pilot. PIN hanya tampil sekali setelah dibuat.</p>
    <form action={action} className="inline-generate"><input className="input" name="count" type="number" min="1" max="250" defaultValue="5"/><button className="btn btn-primary" disabled={pending}>{pending?"Membuat...":"Generate Access"}</button></form>
    {state?.error&&<div className="notice" style={{marginTop:12}}>{state.error}</div>}
    {state?.credentials?.length?<div className="license-output">
      <div className="license-output-head"><small>Simpan sekarang — PIN tidak dapat dilihat lagi.</small><button type="button" className="btn btn-sm" onClick={()=>navigator.clipboard.writeText(csv)}><Copy size={14}/>Copy CSV</button></div>
      {state.credentials.map(x=><div className="credential-row" key={x.code}><code>{x.code}</code><strong>PIN {x.pin}</strong></div>)}
    </div>:null}
  </section>
}

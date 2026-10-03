"use client";
import { useActionState } from "react";
import { generateLicenses } from "./actions";

export default function LicenseGenerator(){
  const [state,action,pending]=useActionState(generateLicenses,null);
  return <section className="panel"><h3>Generate Activation Code</h3><form action={action} className="inline-generate"><input className="input" name="count" type="number" min="1" max="25" defaultValue="5"/><button className="btn btn-primary" disabled={pending}>{pending?"Membuat...":"Generate"}</button></form>
  {state?.error&&<div className="notice" style={{marginTop:12}}>{state.error}</div>}
  {state?.codes?.length?<div className="license-output"><small>Simpan kode ini sekarang. Database hanya menyimpan hash.</small>{state.codes.map(c=><code key={c}>{c}</code>)}</div>:null}</section>
}

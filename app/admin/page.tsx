import { Activity,Database,KeyRound,LogOut,ShieldCheck,Smartphone,UsersRound } from "lucide-react";
import LicenseGenerator from "./license-generator";
import PinResetButton from "./pin-reset-button";
import { adminLogout,changeLicenseStatus,openWeddingAsAdmin,revokeLicenseSessions } from "./actions";
import { requireAdmin } from "@/lib/admin";
export const dynamic="force-dynamic";
const fmtBytes=(n:number)=>n<1024*1024?`${Math.max(0,Math.round(n/1024))} KB`:`${(n/1024/1024).toFixed(2)} MB`;
const date=(v:any)=>v?new Intl.DateTimeFormat("id-ID",{day:"2-digit",month:"short",year:"numeric"}).format(new Date(v)):"—";
export default async function Page(){
 const{db}=await requireAdmin();
 const[[cap],[usage],licenses,logs]=await Promise.all([
  db`SELECT s.max_active_weddings,count(l.id) FILTER(WHERE l.status='active')::int active,count(l.id) FILTER(WHERE l.status='unused')::int unused,count(l.id) FILTER(WHERE l.status='suspended')::int suspended,count(l.id) FILTER(WHERE l.status='revoked')::int revoked FROM app_settings s LEFT JOIN licenses l ON true WHERE s.id=1 GROUP BY s.max_active_weddings`,
  db`SELECT (SELECT count(*)::int FROM license_sessions WHERE revoked_at IS NULL AND expires_at>now()) active_sessions,(SELECT count(*)::int FROM weddings WHERE status='active') active_weddings,(SELECT coalesce(sum(size_bytes),0)::bigint FROM documents) document_bytes,pg_database_size(current_database())::bigint database_bytes`,
  db`SELECT l.id,l.code_hint,l.pin_hint,l.status,l.wedding_id,l.activated_at,l.last_login_at,l.created_at,l.expires_at,w.couple_one_name,w.couple_two_name,w.wedding_date,(SELECT count(*)::int FROM license_sessions s WHERE s.license_id=l.id AND s.revoked_at IS NULL AND s.expires_at>now()) active_sessions FROM licenses l LEFT JOIN weddings w ON w.id=l.wedding_id ORDER BY CASE l.status WHEN 'active' THEN 0 WHEN 'unused' THEN 1 WHEN 'suspended' THEN 2 ELSE 3 END,l.created_at DESC LIMIT 250`,
  db`SELECT * FROM access_logs ORDER BY created_at DESC LIMIT 20`
 ]);
 const active=Number(cap?.active||0),max=Number(cap?.max_active_weddings||250),pct=Math.min(100,Math.round(active/max*100));
 return <main className="control-center">
  <header className="control-top"><div className="control-brand"><span className="brand-mark">M</span><div><small>TEMAN DIGITAL</small><strong>MenujuKita Control Center</strong></div></div><form action={adminLogout}><button className="control-logout"><LogOut size={16}/>Keluar</button></form></header>
  <section className="control-hero"><div><span className="micro-label">SUPER ADMIN</span><h1 className="serif">Pilot operations,<br/>without the noise.</h1><p>Issue access, bantu customer, putus session, dan jaga kapasitas 250 wedding dari satu tempat.</p></div><div className="capacity-orbit" style={{"--capacity":pct} as any}><div><b>{active}</b><span>of {max}</span><small>active wedding</small></div></div></section>
  <section className="control-glance"><article><ShieldCheck size={19}/><div><small>LICENSE</small><b>{cap?.unused||0} siap dijual</b><span>{cap?.suspended||0} suspended · {cap?.revoked||0} revoked</span></div></article><article><Smartphone size={19}/><div><small>SESSIONS</small><b>{usage?.active_sessions||0} device session</b><span>login customer aktif</span></div></article><article><Database size={19}/><div><small>DATABASE</small><b>{fmtBytes(Number(usage?.database_bytes||0))}</b><span>{fmtBytes(Number(usage?.document_bytes||0))} metadata dokumen</span></div></article><article><UsersRound size={19}/><div><small>WORKSPACES</small><b>{usage?.active_weddings||0} wedding</b><span>pilot currently created</span></div></article></section>
  <div className="control-split"><LicenseGenerator/><section className="admin-card"><div className="admin-card-head"><div><span className="micro-label">PILOT POLICY</span><h3>Guardrails</h3></div><ShieldCheck size={20}/></div><div className="control-rules"><p><span>Active wedding</span><b>{max} max</b></p><p><span>Demo</span><b>local only</b></p><p><span>Customer login</span><b>Code + PIN</b></p><p><span>PIN storage</span><b>hash only</b></p><p><span>Document / workspace</span><b>15 MB</b></p></div></section></div>

  <section className="registry-section"><div className="registry-head"><div><span className="micro-label">ACCESS REGISTRY</span><h2 className="serif">250 license slots</h2><p>Credential penuh tidak pernah ditampilkan kembali. PIN dapat di-reset kapan saja.</p></div><span className="registry-count">{licenses.length} issued</span></div>
   <div className="license-registry">{(licenses as any[]).map(l=><article className={"license-card status-"+l.status} key={l.id}>
    <div className="license-card-top"><div><small>LICENSE</small><code>MK-••••-{l.code_hint}</code></div><span className={"status-pill "+l.status}>{l.status}</span></div>
    <div className="license-wedding">{l.couple_one_name?<><b>{l.couple_one_name} & {l.couple_two_name}</b><span>{date(l.wedding_date)} · PIN ••••{l.pin_hint||"—"}</span></>:<><b>Belum diaktivasi</b><span>Dibuat {date(l.created_at)} · PIN ••••{l.pin_hint||"—"}</span></>}</div>
    <div className="license-meta"><span><Smartphone size={13}/>{l.active_sessions||0} session</span><span><Activity size={13}/>last login {date(l.last_login_at)}</span></div>
    <div className="license-actions"><PinResetButton id={String(l.id)}/>{Number(l.active_sessions)>0&&<form action={revokeLicenseSessions}><input type="hidden" name="id" value={l.id}/><button className="action-link">Force logout</button></form>}{l.wedding_id&&<form action={openWeddingAsAdmin}><input type="hidden" name="wedding_id" value={l.wedding_id}/><button className="action-link strong">Open Wedding</button></form>}
     {l.status==="active"&&<form action={changeLicenseStatus}><input type="hidden" name="id" value={l.id}/><button className="action-link danger" name="status" value="suspended">Suspend</button></form>}
     {l.status==="suspended"&&<form action={changeLicenseStatus}><input type="hidden" name="id" value={l.id}/><button className="action-link strong" name="status" value="active">Reactivate</button></form>}
     {l.status==="unused"&&<form action={changeLicenseStatus}><input type="hidden" name="id" value={l.id}/><button className="action-link danger" name="status" value="revoked">Revoke</button></form>}
    </div>
   </article>)}</div>
  </section>

  <section className="admin-card audit-card"><div className="admin-card-head"><div><span className="micro-label">AUDIT TRAIL</span><h3>Access activity</h3></div><Activity size={20}/></div><div className="audit-list">{(logs as any[]).map(x=><div className="audit-row" key={x.id}><span className={"audit-status "+(x.success?"ok":"fail")}/><div><b>{x.event.replaceAll("_"," ")}</b><small>{x.actor_type} · {date(x.created_at)}</small></div></div>)}</div></section>
 </main>
}

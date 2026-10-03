import LicenseGenerator from "./license-generator";
import { changeLicenseStatus } from "./actions";
import { requireAdmin } from "@/lib/admin";

export const dynamic="force-dynamic";
const fmtBytes=(n:number)=>n<1024*1024?`${Math.max(0,Math.round(n/1024))} KB`:`${(n/1024/1024).toFixed(2)} MB`;

export default async function Page(){
  const {db}=await requireAdmin();
  const [[cap],[usage],licenses,topStorage]=await Promise.all([
    db`SELECT s.max_active_weddings,
      count(l.id) FILTER(WHERE l.status='active')::int active,
      count(l.id) FILTER(WHERE l.status='unused')::int unused,
      count(l.id) FILTER(WHERE l.status='suspended')::int suspended,
      count(l.id) FILTER(WHERE l.status='revoked')::int revoked
      FROM app_settings s LEFT JOIN licenses l ON true WHERE s.id=1 GROUP BY s.max_active_weddings`,
    db`SELECT
      (SELECT count(*)::int FROM weddings WHERE status='active') active_weddings,
      (SELECT count(DISTINCT auth_user_id)::int FROM wedding_members WHERE status='active' AND auth_user_id IS NOT NULL) members,
      (SELECT coalesce(sum(size_bytes),0)::bigint FROM documents) document_bytes,
      pg_database_size(current_database())::bigint database_bytes`,
    db`SELECT l.id,l.code_hint,l.status,l.activated_at,l.created_at,l.expires_at,
      w.couple_one_name,w.couple_two_name,w.wedding_date
      FROM licenses l LEFT JOIN weddings w ON w.id=l.wedding_id
      ORDER BY CASE l.status WHEN 'active' THEN 0 WHEN 'unused' THEN 1 WHEN 'suspended' THEN 2 ELSE 3 END,l.created_at DESC LIMIT 100`,
    db`SELECT w.id,w.couple_one_name,w.couple_two_name,coalesce(sum(d.size_bytes),0)::bigint bytes
      FROM weddings w LEFT JOIN documents d ON d.wedding_id=w.id
      WHERE w.status='active'
      GROUP BY w.id,w.couple_one_name,w.couple_two_name
      ORDER BY bytes DESC LIMIT 8`
  ]);

  const used=Number(cap?.active||0),max=Number(cap?.max_active_weddings||250);
  const licensePct=Math.round(used/max*100);
  const dbBytes=Number(usage?.database_bytes||0),docBytes=Number(usage?.document_bytes||0);
  const dbPct=Math.min(100,Math.round(dbBytes/(1024*1024*1024)*100));
  const objectPct=Math.min(100,Math.round(docBytes/(5*1024*1024*1024)*100));
  const alert=licensePct>=70||dbPct>=70||objectPct>=70;

  return <main className="container section admin-page">
    <div className="brand"><span className="brand-mark">M</span><span className="brand-copy"><strong>MenujuKita Admin</strong><small>Teman Digital · Pilot Control</small></span></div>
    <div className="admin-heading"><div><h1 className="serif" style={{fontSize:52}}>Pilot Control Center</h1><p className="lead">Kelola lisensi dan pantau headroom pilot sebelum kapasitas memengaruhi pengguna.</p></div>{alert&&<span className="status-pill suspended">Usage warning ≥70%</span>}</div>

    <div className="dashboard-grid">
      <div className="panel"><small className="muted">Active licenses</small><div className="big">{used} / {max}</div><div className="progress"><span style={{width:licensePct+"%"}}/></div><small className="muted">{licensePct}% pilot capacity</small></div>
      <div className="panel"><small className="muted">Live members</small><div className="big">{usage?.members||0}</div><small className="muted">{usage?.active_weddings||0} active workspace</small></div>
      <div className="panel"><small className="muted">Postgres size</small><div className="big">{fmtBytes(dbBytes)}</div><div className="progress"><span style={{width:dbPct+"%"}}/></div><small className="muted">≈ {dbPct}% dari guardrail 1 GB</small></div>
      <div className="panel"><small className="muted">Document metadata usage</small><div className="big">{fmtBytes(docBytes)}</div><div className="progress"><span style={{width:objectPct+"%"}}/></div><small className="muted">≈ {objectPct}% dari 5 GB storage plan</small></div>
    </div>

    <div className="admin-grid">
      <LicenseGenerator/>
      <section className="panel"><h3>Aturan Pilot</h3>
        <div className="stat-line"><span>Hard limit active wedding</span><b>{max}</b></div>
        <div className="stat-line"><span>Demo</span><b>Tidak dihitung</b></div>
        <div className="stat-line"><span>Activation code</span><b>Hash-only storage</b></div>
        <div className="stat-line"><span>Warning threshold</span><b>70%</b></div>
        <div className="stat-line"><span>Document quota/workspace</span><b>15 MB</b></div>
      </section>
    </div>

    <div className="admin-grid">
      <section className="panel"><h3>License Status</h3><div className="stat-line"><span>Unused</span><b>{cap?.unused||0}</b></div><div className="stat-line"><span>Suspended</span><b>{cap?.suspended||0}</b></div><div className="stat-line"><span>Revoked</span><b>{cap?.revoked||0}</b></div></section>
      <section className="panel"><h3>Top Document Usage</h3>{(topStorage as any[]).length?<div className="list">{(topStorage as any[]).map(w=><div className="stat-line" key={w.id}><span>{w.couple_one_name} & {w.couple_two_name}</span><b>{fmtBytes(Number(w.bytes||0))}</b></div>)}</div>:<div className="empty-mini">Belum ada workspace live.</div>}</section>
    </div>

    <section className="panel" style={{marginTop:14}}><div className="panel-title"><div><h3>License Registry</h3><p className="muted compact">100 lisensi terbaru. Kode penuh hanya tampil sekali saat generate.</p></div></div>
      <div className="table-wrap"><table className="admin-table"><thead><tr><th>Kode</th><th>Status</th><th>Wedding</th><th>Aktivasi</th><th>Aksi</th></tr></thead><tbody>{(licenses as any[]).map(l=><tr key={l.id}>
        <td><code>••••-{l.code_hint}</code></td>
        <td><span className={"status-pill "+l.status}>{l.status}</span></td>
        <td>{l.couple_one_name?<><b>{l.couple_one_name} & {l.couple_two_name}</b><small>{l.wedding_date?new Intl.DateTimeFormat("id-ID",{day:"2-digit",month:"short",year:"numeric"}).format(new Date(l.wedding_date)):""}</small></>:"—"}</td>
        <td>{l.activated_at?new Intl.DateTimeFormat("id-ID",{day:"2-digit",month:"short",year:"numeric"}).format(new Date(l.activated_at)):"—"}</td>
        <td>
          {l.status==="active"&&<form action={changeLicenseStatus}><input type="hidden" name="id" value={l.id}/><button className="btn btn-sm" name="status" value="suspended">Suspend</button></form>}
          {l.status==="suspended"&&<form action={changeLicenseStatus}><input type="hidden" name="id" value={l.id}/><button className="btn btn-primary btn-sm" name="status" value="active">Activate</button></form>}
          {l.status==="unused"&&<form action={changeLicenseStatus}><input type="hidden" name="id" value={l.id}/><button className="btn btn-sm" name="status" value="revoked">Revoke</button></form>}
          {l.status==="revoked"&&<span className="muted">Final</span>}
        </td>
      </tr>)}</tbody></table></div>
    </section>
  </main>;
}
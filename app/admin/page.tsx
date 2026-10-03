import LicenseGenerator from "./license-generator";
import { changeLicenseStatus } from "./actions";
import { requireAdmin } from "@/lib/admin";

export const dynamic="force-dynamic";

export default async function Page(){
  const {db}=await requireAdmin();
  const [cap]=await db`SELECT s.max_active_weddings,
    count(l.id) FILTER(WHERE l.status='active')::int active,
    count(l.id) FILTER(WHERE l.status='unused')::int unused,
    count(l.id) FILTER(WHERE l.status='suspended')::int suspended,
    count(l.id) FILTER(WHERE l.status='revoked')::int revoked
    FROM app_settings s LEFT JOIN licenses l ON true WHERE s.id=1 GROUP BY s.max_active_weddings`;
  const licenses=await db`SELECT l.id,l.code_hint,l.status,l.activated_at,l.created_at,l.expires_at,
    w.couple_one_name,w.couple_two_name,w.wedding_date
    FROM licenses l LEFT JOIN weddings w ON w.id=l.wedding_id
    ORDER BY CASE l.status WHEN 'active' THEN 0 WHEN 'unused' THEN 1 ELSE 2 END,l.created_at DESC LIMIT 100`;
  const used=Number(cap?.active||0),max=Number(cap?.max_active_weddings||250);
  return <main className="container section admin-page">
    <div className="brand"><span className="brand-mark">M</span><span className="brand-copy"><strong>MenujuKita Admin</strong><small>Teman Digital · Pilot Control</small></span></div>
    <div className="admin-heading"><div><h1 className="serif" style={{fontSize:52}}>Pilot Control Center</h1><p className="lead">Kelola lisensi dan jaga kapasitas resmi pilot tetap maksimum 250 wedding aktif.</p></div></div>
    <div className="dashboard-grid">
      <div className="panel"><small className="muted">Active</small><div className="big">{used} / {max}</div><div className="progress"><span style={{width:Math.round(used/max*100)+"%"}}/></div></div>
      <div className="panel"><small className="muted">Unused</small><div className="big">{cap?.unused||0}</div><small className="muted">siap diaktivasi</small></div>
      <div className="panel"><small className="muted">Suspended</small><div className="big">{cap?.suspended||0}</div></div>
      <div className="panel"><small className="muted">Revoked</small><div className="big">{cap?.revoked||0}</div></div>
    </div>
    <div className="admin-grid">
      <LicenseGenerator/>
      <section className="panel"><h3>Aturan Pilot</h3><div className="stat-line"><span>Hard limit active wedding</span><b>{max}</b></div><div className="stat-line"><span>Demo</span><b>Tidak dihitung</b></div><div className="stat-line"><span>Activation code</span><b>Hash-only storage</b></div></section>
    </div>
    <section className="panel" style={{marginTop:14}}><div className="panel-title"><div><h3>License Registry</h3><p className="muted compact">100 lisensi terbaru. Kode penuh hanya tampil sekali saat generate.</p></div></div>
      <div className="table-wrap"><table className="admin-table"><thead><tr><th>Kode</th><th>Status</th><th>Wedding</th><th>Aktivasi</th><th>Aksi</th></tr></thead><tbody>{(licenses as any[]).map(l=><tr key={l.id}><td><code>••••-{l.code_hint}</code></td><td><span className={"status-pill "+l.status}>{l.status}</span></td><td>{l.couple_one_name?<><b>{l.couple_one_name} & {l.couple_two_name}</b><small>{l.wedding_date?new Intl.DateTimeFormat("id-ID",{day:"2-digit",month:"short",year:"numeric"}).format(new Date(l.wedding_date)):""}</small></>:"—"}</td><td>{l.activated_at?new Intl.DateTimeFormat("id-ID",{day:"2-digit",month:"short",year:"numeric"}).format(new Date(l.activated_at)):"—"}</td><td>{l.status==="active"?<form action={changeLicenseStatus}><input type="hidden" name="id" value={l.id}/><button className="btn btn-sm" name="status" value="suspended">Suspend</button></form>:l.status==="unused"?<form action={changeLicenseStatus}><input type="hidden" name="id" value={l.id}/><button className="btn btn-sm" name="status" value="revoked">Revoke</button></form>:<span className="muted">—</span>}</td></tr>)}</tbody></table></div>
    </section>
  </main>
}
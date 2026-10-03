import { LogOut,Settings } from "lucide-react";
import { signOut,updateWeddingSettings } from "@/app/app/settings-actions";

export default function SettingsSection({wedding,email}:{wedding:any;email:string}){
  const canEdit=["owner","partner"].includes(String(wedding.role));
  return <section id="settings" className="module-stack"><div className="content-grid">
    <section className="panel"><div className="module-head"><div><small className="muted">SETTINGS</small><h3>Wedding details</h3></div><Settings size={20}/></div>
      {canEdit?<form action={updateWeddingSettings} className="form-grid">
        <div className="split"><label className="field"><span>Nama pasangan 1</span><input className="input" name="couple_one_name" defaultValue={wedding.couple_one_name} required/></label><label className="field"><span>Nama pasangan 2</span><input className="input" name="couple_two_name" defaultValue={wedding.couple_two_name} required/></label></div>
        <div className="split"><label className="field"><span>Tanggal wedding</span><input className="input" type="date" name="wedding_date" defaultValue={String(wedding.wedding_date||"").slice(0,10)} required/></label><label className="field"><span>Kota</span><input className="input" name="city" defaultValue={wedding.city||""}/></label></div>
        <div className="split"><label className="field"><span>Target tamu</span><input className="input" type="number" name="guest_target" min="0" max="5000" defaultValue={Number(wedding.guest_target||0)}/></label><label className="field"><span>Planning style</span><select className="input" name="planning_style" defaultValue={wedding.planning_style||"couple"}><option value="couple">Kami sendiri</option><option value="family">Kami + keluarga</option><option value="couple_wo">Kami + WO</option><option value="wo">WO dominan</option></select></label></div>
        <button className="btn btn-primary">Simpan Settings</button>
      </form>:<div className="empty-state"><b>Read-only settings</b><span className="muted">Owner atau partner dapat mengubah detail wedding.</span></div>}
    </section>
    <aside className="panel account-card"><small className="muted">ACCOUNT</small><h3>{email}</h3><p className="muted">Role di workspace ini: <b>{wedding.role}</b>.</p><div className="stack"><a className="btn btn-soft" href="/onboarding">Aktifkan Wedding Lain</a><form action={signOut}><button className="btn" style={{width:"100%"}}><LogOut size={16}/>Keluar dari MenujuKita</button></form></div></aside>
  </div></section>
}

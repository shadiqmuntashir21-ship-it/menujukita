import { LogOut,Settings,ShieldCheck } from "lucide-react";
import { signOut,updateWeddingSettings } from "@/app/app/settings-actions";
export default function SettingsSection({wedding,licenseHint,admin}:{wedding:any;licenseHint?:string;admin?:boolean}){
 return <section id="settings" className="module-stack"><div className="content-grid">
   <section className="panel studio-panel"><div className="module-head"><div><small className="muted">WEDDING SETTINGS</small><h3>Detail wedding</h3></div><Settings size={20}/></div>
   <form action={updateWeddingSettings} className="form-grid">
    <div className="split"><label className="field"><span>Nama pasangan 1</span><input className="input" name="couple_one_name" defaultValue={wedding.couple_one_name} required/></label><label className="field"><span>Nama pasangan 2</span><input className="input" name="couple_two_name" defaultValue={wedding.couple_two_name} required/></label></div>
    <div className="split"><label className="field"><span>Tanggal wedding</span><input className="input" type="date" name="wedding_date" defaultValue={String(wedding.wedding_date||"").slice(0,10)} required/></label><label className="field"><span>Kota</span><input className="input" name="city" defaultValue={wedding.city||""}/></label></div>
    <div className="split"><label className="field"><span>Target tamu</span><input className="input" type="number" name="guest_target" min="0" max="5000" defaultValue={Number(wedding.guest_target||0)}/></label><label className="field"><span>Planning style</span><select className="input" name="planning_style" defaultValue={wedding.planning_style||"couple"}><option value="couple">Kami sendiri</option><option value="family">Kami + keluarga</option><option value="couple_wo">Kami + WO</option><option value="wo">WO dominan</option></select></label></div>
    <button className="btn btn-primary">Simpan Perubahan</button>
   </form></section>
   <aside className="panel studio-panel access-card"><ShieldCheck size={22}/><small className="muted">{admin?"ADMIN SUPPORT MODE":"WEDDING ACCESS"}</small><h3>{admin?"Super Admin":"Lisensi ••••-"+(licenseHint||"----")}</h3><p className="muted">{admin?"Anda sedang membantu workspace customer. Semua perubahan tercatat di audit log.":"Akses wedding ini memakai Kode Lisensi + PIN. Tidak ada email/password yang perlu dikelola."}</p><form action={signOut}><button className="btn" style={{width:"100%"}}><LogOut size={16}/>{admin?"Kembali ke Admin":"Keluar dari MenujuKita"}</button></form></aside>
 </div></section>
}

"use client";
import { useRef,useState } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus,LogOut,Settings,ShieldCheck,Trash2 } from "lucide-react";
import { registerCoverPhoto,removeCoverPhoto,signOut,updateWeddingSettings } from "@/app/app/settings-actions";

const FALLBACK="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1500&q=86";

export default function SettingsSection({wedding,licenseHint,admin,coverUrl}:{wedding:any;licenseHint?:string;admin?:boolean;coverUrl?:string}){
 const router=useRouter(),fileRef=useRef<HTMLInputElement>(null),[busy,setBusy]=useState(false),[error,setError]=useState("");
 async function uploadCover(){
  const file=fileRef.current?.files?.[0];if(!file)return;
  setBusy(true);setError("");
  try{
   const res=await fetch("/api/storage/presign",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({name:file.name,type:file.type,size:file.size,purpose:"cover",weddingId:String(wedding.id)})});
   const data=await res.json();if(!res.ok)throw new Error("Foto harus JPG, PNG, atau WEBP dan maksimal 5 MB.");
   const put=await fetch(data.url,{method:"PUT",headers:{"content-type":file.type},body:file});if(!put.ok)throw new Error("Upload foto gagal.");
   await registerCoverPhoto({objectKey:data.key,contentType:file.type,size:file.size});router.refresh();
  }catch(e:any){setError(e?.message||"Foto belum bisa disimpan.")}finally{setBusy(false);if(fileRef.current)fileRef.current.value=""}
 }
 async function resetCover(){setBusy(true);setError("");try{await removeCoverPhoto();router.refresh()}catch{setError("Foto belum bisa dihapus.")}finally{setBusy(false)}}
 return <section id="settings" className="module-stack settings-premium">
  <header className="module-editorial-head"><div><span className="micro-label">YOUR WEDDING SPACE</span><h2 className="serif">Buat ruang ini terasa seperti kalian.</h2><p>Foto cover, posisi, dan detail wedding dapat diubah kapan saja.</p></div></header>
  <section className="cover-settings-card">
   <div className="settings-cover-preview" style={{backgroundImage:`linear-gradient(rgba(20,27,24,.18),rgba(20,27,24,.55)),url("${coverUrl||FALLBACK}")`,backgroundPosition:`50% ${Number(wedding.cover_position_y??50)}%`}}><div><small>COVER WEDDING</small><strong>{wedding.couple_one_name} & {wedding.couple_two_name}</strong></div></div>
   <div className="cover-settings-copy"><span className="micro-label">FOTO UTAMA</span><h3>Foto yang menyambut kalian setiap kali membuka MenujuKita.</h3><p>Gunakan foto landscape berkualitas baik. Posisi fokus dan tingkat gelap overlay bisa diatur di bawah.</p><input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={uploadCover}/><div className="cover-actions"><button className="btn btn-primary" type="button" disabled={busy} onClick={()=>fileRef.current?.click()}><ImagePlus size={16}/>{busy?"Menyimpan...":coverUrl?"Ganti Foto":"Upload Foto"}</button>{coverUrl&&<button className="btn" type="button" disabled={busy} onClick={resetCover}><Trash2 size={15}/>Reset</button>}</div>{error&&<div className="notice">{error}</div>}</div>
  </section>

  <div className="content-grid settings-grid">
   <section className="panel studio-panel"><div className="module-head"><div><small className="muted">WEDDING SETTINGS</small><h3>Detail wedding</h3></div><Settings size={20}/></div>
   <form action={updateWeddingSettings} className="form-grid">
    <div className="split"><label className="field"><span>Nama pasangan 1</span><input className="input" name="couple_one_name" defaultValue={wedding.couple_one_name} required/></label><label className="field"><span>Nama pasangan 2</span><input className="input" name="couple_two_name" defaultValue={wedding.couple_two_name} required/></label></div>
    <div className="split"><label className="field"><span>Tanggal wedding</span><input className="input" type="date" name="wedding_date" defaultValue={String(wedding.wedding_date||"").slice(0,10)} required/></label><label className="field"><span>Kota</span><input className="input" name="city" defaultValue={wedding.city||""}/></label></div>
    <div className="split"><label className="field"><span>Target tamu</span><input className="input" type="number" name="guest_target" min="0" max="5000" defaultValue={Number(wedding.guest_target||0)}/></label><label className="field"><span>Planning style</span><select className="input" name="planning_style" defaultValue={wedding.planning_style||"couple"}><option value="couple">Kami sendiri</option><option value="family">Kami + keluarga</option><option value="couple_wo">Kami + WO</option><option value="wo">WO dominan</option></select></label></div>
    <div className="split"><label className="field"><span>Posisi fokus foto</span><input name="cover_position_y" type="range" min="0" max="100" defaultValue={Number(wedding.cover_position_y??50)}/><small className="muted">Geser sampai wajah berada di posisi yang nyaman.</small></label><label className="field"><span>Overlay foto</span><input name="cover_overlay" type="range" min=".18" max=".78" step=".05" defaultValue={Number(wedding.cover_overlay??.48)}/><small className="muted">Atur keterbacaan teks di atas foto.</small></label></div>
    <input type="hidden" name="cover_style" value={wedding.cover_style||"full"}/>
    <button className="btn btn-primary">Simpan Perubahan</button>
   </form></section>
   <aside className="panel studio-panel access-card"><ShieldCheck size={22}/><small className="muted">{admin?"ADMIN SUPPORT MODE":"WEDDING ACCESS"}</small><h3>{admin?"Super Admin":"Lisensi ••••-"+(licenseHint||"----")}</h3><p className="muted">{admin?"Anda sedang membantu workspace customer. Semua perubahan tercatat di audit log.":"Akses wedding ini memakai Kode Lisensi + PIN. Tidak ada email/password yang perlu dikelola."}</p><form action={signOut}><button className="btn" style={{width:"100%"}}><LogOut size={16}/>{admin?"Kembali ke Admin":"Keluar dari MenujuKita"}</button></form></aside>
  </div>
 </section>
}

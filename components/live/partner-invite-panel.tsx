"use client";
import {useActionState,useState} from "react";
import {Check,Copy,KeyRound,ShieldCheck,UsersRound} from "lucide-react";
import {createPartnerInvite,revokePartnerAccess} from "@/app/app/partner-actions";
export default function PartnerInvitePanel({role,status,name}:{role:string;status?:string|null;name?:string|null}){
 const[state,action,pending]=useActionState(createPartnerInvite,null);
 const[copied,setCopied]=useState(false);
 if(role!=="owner")return <div className="studio-panel" style={{padding:18,borderRadius:18}}><UsersRound size={22}/><p>Anda memakai akses pasangan kedua. Data rencana, tugas, dan keuangan tersinkronisasi dengan wedding yang sama.</p></div>;
 const active=status==="active";
 return <section className="studio-panel" style={{display:"grid",gap:14,padding:20,borderRadius:20}}>
  <div style={{display:"flex",gap:11,alignItems:"center"}}><KeyRound size={22}/><div><h3 style={{margin:0}}>Akses pasangan kedua</h3><small className="muted">Satu lisensi untuk dua pasangan dengan PIN masing-masing</small></div></div>
  {active?<><p style={{margin:0}}><ShieldCheck size={17} style={{verticalAlign:"middle",marginRight:6}}/> {name||"Pasangan kedua"} sudah bergabung dan dapat masuk dengan Kode Lisensi bersama + PIN pribadinya.</p><form action={revokePartnerAccess}><button type="submit" className="btn" onClick={e=>{if(!window.confirm("Cabut akses pasangan kedua? Sesi aktif akan diputus, tetapi data wedding tetap tersimpan."))e.preventDefault()}}>Cabut akses pasangan</button></form></>:
  <><p style={{fontSize:13,lineHeight:1.7,margin:0}}>Buat satu tautan undangan pribadi. Kirim hanya kepada pasangan melalui saluran tepercaya. Tautan berlaku 48 jam dan hanya bisa dipakai sekali. Pasangan menetapkan PIN sendiri tanpa perlu membuat akun email.</p>
   <form action={action}><button className="btn btn-primary" type="submit" disabled={pending}>{pending?"Membuat undangan...":status==="invited"?"Buat ulang tautan undangan":"Undang pasangan kedua"}</button></form>
   {state?.error&&<p className="notice" role="alert">{state.error}</p>}
   {state?.link&&<div style={{display:"grid",gap:9,borderRadius:14,padding:12,background:"#f2f5ee"}}><small>Salin tautan dan kirim kepada pasangan. Jangan bagikan secara publik.</small><input className="input" aria-label="Tautan undangan pasangan" readOnly value={state.link} onFocus={e=>e.target.select()}/><button className="btn" type="button" onClick={async()=>{try{await navigator.clipboard.writeText(state.link||"");setCopied(true)}catch{setCopied(false)}}}>{copied?<Check size={17}/>:<Copy size={17}/>} {copied?"Tersalin":"Salin tautan"}</button></div>}
  </>}
 </section>;
}

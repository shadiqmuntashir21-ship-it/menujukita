"use client";
import {ReactNode,useEffect,useState} from "react";
import Link from "next/link";
import {Activity,Armchair,Bell,CalendarClock,CircleDollarSign,FileText,FileDown,Gift,HeartHandshake,Palette,Home,BookOpen,ListChecks,Menu,Settings,Store,UsersRound,X} from "lucide-react";
import {BrandIcon} from "@/components/brand";
type View="reports"|"concept"|"gifts"|"decisions"|"calendar"|"guide"|"home"|"plan"|"money"|"guests"|"vendors"|"seating"|"vault"|"team"|"notifications"|"activity"|"settings";
const primary:[View,any,string][]=[["home",Home,"Beranda"],["plan",ListChecks,"Rencana"],["money",CircleDollarSign,"Dana"],["guests",UsersRound,"Tamu"]];
const more:[View,any,string][]=[["vendors",Store,"Vendor"],["concept",Palette,"Konsep"],["gifts",Gift,"Seserahan"],["decisions",HeartHandshake,"Diskusi Berdua"],["calendar",CalendarClock,"Kalender"],["seating",Armchair,"Meja"],["vault",FileText,"Vault"],["reports",FileDown,"Laporan"],["team",UsersRound,"Tim"],["notifications",Bell,"Perhatian"],["activity",Activity,"Aktivitas"],["settings",Settings,"Pengaturan"],["guide",BookOpen,"Panduan"]];
export default function WeddingStudio({couple,days,admin,search,home,plan,money,guests,vendors,seating,vault,team,notifications,activity,settings,guide,calendar,concept,gifts,decisions,reports}:{couple:string;days:number|null;admin:boolean;search:ReactNode;home:ReactNode;plan:ReactNode;money:ReactNode;guests:ReactNode;vendors:ReactNode;seating:ReactNode;vault:ReactNode;team:ReactNode;notifications:ReactNode;activity:ReactNode;settings:ReactNode;guide:ReactNode;calendar:ReactNode;concept:ReactNode;gifts:ReactNode;decisions:ReactNode;reports:ReactNode}){
 const[view,setView]=useState<View>("home"),[open,setOpen]=useState(false);
 useEffect(()=>{const handler=(e:Event)=>{const v=(e as CustomEvent).detail as View;if(v)setView(v);setOpen(false)};window.addEventListener("menujukita:navigate",handler);return()=>window.removeEventListener("menujukita:navigate",handler)},[]);
 const render=()=>({home,plan,money,guests,vendors,seating,vault,team,notifications,activity,settings,guide,calendar,concept,gifts,decisions,reports}[view]);
 const go=(v:View)=>{setView(v);setOpen(false);window.scrollTo({top:0,behavior:"smooth"})};
 return <div className="studio-shell">
   <aside className="studio-rail">
     <button className="studio-logo" onClick={()=>go("home")} aria-label="MenujuKita"><BrandIcon/></button>
     <div className="rail-primary">{primary.map(([id,I,label])=><button key={id} className={view===id?"active":""} onClick={()=>go(id)} title={label}><I size={21}/><span>{label}</span></button>)}</div>
     <div className="rail-spacer"/>
     {more.slice(0,4).map(([id,I,label])=><button key={id} className={view===id?"active":""} onClick={()=>go(id)} title={label}><I size={20}/><span>{label}</span></button>)}
     <button className="rail-more" onClick={()=>setOpen(v=>!v)}><Menu size={20}/><span>Lainnya</span></button>
   </aside>
   <div className="studio-frame">
     <header className="studio-topbar">
       <div className="studio-title"><small>{admin?"MODE BANTUAN ADMIN · WEDDING STUDIO":"WEDDING STUDIO"}</small><strong>{couple}</strong><span>{days===null?"Tanggal belum ditentukan":days===0?"Hari ini adalah hari kalian":days+" hari menuju hari kalian"}</span></div>
       <div className="studio-top-actions">{search}<Link className="dayh-pill" href="/app/day-h"><CalendarClock size={17}/><span>Day-H</span></Link></div>
     </header>
     {admin&&<div className="support-banner"><strong>Mode Bantuan</strong><span>Anda membuka workspace customer sebagai Super Admin. Perubahan tercatat di log aktivitas.</span></div>}
     <main className={"studio-view view-"+view} key={view}>{render()}</main>
   </div>
   {open&&<><button className="studio-sheet-backdrop" onClick={()=>setOpen(false)} aria-label="Tutup"/><aside className="studio-more-sheet">
     <div className="sheet-head"><div><small>MENUJUKITA</small><h3>Ruang kerja lainnya</h3></div><button className="icon-button" onClick={()=>setOpen(false)} aria-label="Tutup"><X size={18}/></button></div>
     <div className="more-grid">{more.map(([id,I,label])=><button key={id} className={view===id?"active":""} onClick={()=>go(id)}><I size={20}/><span>{label}</span></button>)}<Link href="/app/day-h"><CalendarClock size={20}/><span>Mode Day-H</span></Link></div>
   </aside></>}
   <nav className="studio-mobile-nav">
     {primary.map(([id,I,label])=><button key={id} className={view===id?"active":""} onClick={()=>go(id)}><I size={20}/><small>{label}</small></button>)}
     <button className={open?"active":""} onClick={()=>setOpen(v=>!v)}><Menu size={20}/><small>Lainnya</small></button>
   </nav>
 </div>
}

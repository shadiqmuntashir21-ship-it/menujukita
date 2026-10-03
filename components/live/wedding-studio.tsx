"use client";
import { ReactNode,useEffect,useState } from "react";
import Link from "next/link";
import { Activity,Armchair,Bell,CalendarClock,CircleDollarSign,FileText,Home,ListChecks,Menu,Settings,Store,UsersRound,X } from "lucide-react";
type View="home"|"plan"|"money"|"guests"|"vendors"|"seating"|"vault"|"team"|"notifications"|"activity"|"settings";
const primary:[View,any,string][]=[["home",Home,"Home"],["plan",ListChecks,"Plan"],["money",CircleDollarSign,"Money"],["guests",UsersRound,"Guests"]];
const more:[View,any,string][]=[["vendors",Store,"Vendors"],["seating",Armchair,"Seating"],["vault",FileText,"Vault"],["team",UsersRound,"Team"],["notifications",Bell,"Alerts"],["activity",Activity,"Activity"],["settings",Settings,"Settings"]];
export default function WeddingStudio({couple,days,admin,search,home,plan,money,guests,vendors,seating,vault,team,notifications,activity,settings}:{couple:string;days:number;admin:boolean;search:ReactNode;home:ReactNode;plan:ReactNode;money:ReactNode;guests:ReactNode;vendors:ReactNode;seating:ReactNode;vault:ReactNode;team:ReactNode;notifications:ReactNode;activity:ReactNode;settings:ReactNode}){
 const[view,setView]=useState<View>("home"),[open,setOpen]=useState(false);
 useEffect(()=>{const handler=(e:Event)=>{const v=(e as CustomEvent).detail as View;if(v)setView(v);setOpen(false)};window.addEventListener("menujukita:navigate",handler);return()=>window.removeEventListener("menujukita:navigate",handler)},[]);
 const render=()=>({home,plan,money,guests,vendors,seating,vault,team,notifications,activity,settings}[view]);
 const go=(v:View)=>{setView(v);setOpen(false);window.scrollTo({top:0,behavior:"smooth"})};
 return <div className="studio-shell">
   <aside className="studio-rail">
     <button className="studio-logo" onClick={()=>go("home")} aria-label="MenujuKita">M</button>
     <div className="rail-primary">{primary.map(([id,I,label])=><button key={id} className={view===id?"active":""} onClick={()=>go(id)} title={label}><I size={21}/><span>{label}</span></button>)}</div>
     <div className="rail-spacer"/>
     {more.slice(0,4).map(([id,I,label])=><button key={id} className={view===id?"active":""} onClick={()=>go(id)} title={label}><I size={20}/><span>{label}</span></button>)}
     <button className="rail-more" onClick={()=>setOpen(v=>!v)}><Menu size={20}/><span>More</span></button>
   </aside>

   <div className="studio-frame">
     <header className="studio-topbar">
       <div className="studio-title"><small>{admin?"ADMIN SUPPORT · WEDDING STUDIO":"WEDDING STUDIO"}</small><strong>{couple}</strong><span>{days===0?"Hari ini adalah hari kalian":days+" hari menuju hari kalian"}</span></div>
       <div className="studio-top-actions">{search}<Link className="dayh-pill" href="/app/day-h"><CalendarClock size={17}/><span>Day-H</span></Link></div>
     </header>
     {admin&&<div className="support-banner"><strong>Support Mode</strong><span>Anda sedang membuka workspace customer sebagai Super Admin. Perubahan tercatat di audit log.</span></div>}
     <main className={"studio-view view-"+view} key={view}>{render()}</main>
   </div>

   {open&&<><button className="studio-sheet-backdrop" onClick={()=>setOpen(false)} aria-label="Tutup"/><aside className="studio-more-sheet">
     <div className="sheet-head"><div><small>MENUJUKITA</small><h3>Ruang kerja lainnya</h3></div><button className="icon-button" onClick={()=>setOpen(false)}><X size={18}/></button></div>
     <div className="more-grid">{more.map(([id,I,label])=><button key={id} className={view===id?"active":""} onClick={()=>go(id)}><I size={20}/><span>{label}</span></button>)}<Link href="/app/day-h"><CalendarClock size={20}/><span>Day-H Mode</span></Link></div>
   </aside></>}

   <nav className="studio-mobile-nav">
     {primary.map(([id,I,label])=><button key={id} className={view===id?"active":""} onClick={()=>go(id)}><I size={20}/><small>{label}</small></button>)}
     <button className={open?"active":""} onClick={()=>setOpen(v=>!v)}><Menu size={20}/><small>More</small></button>
   </nav>
 </div>
}

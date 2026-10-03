"use client";

import { useState } from "react";
import { Bell,CalendarClock,CircleDollarSign,FileText,Home,ListChecks,Menu,Settings,Store,UserRoundPlus,UsersRound,Armchair,Activity,X } from "lucide-react";

export default function MobileWorkspaceNav({canBudget}:{canBudget:boolean}){
  const[open,setOpen]=useState(false);
  const go=(id:string)=>{setOpen(false);requestAnimationFrame(()=>document.getElementById(id)?.scrollIntoView({behavior:"smooth",block:"start"}))};
  return <>
    {open&&<div className="mobile-more-sheet">
      <div className="mobile-more-head"><div><small className="muted">MENUJUKITA</small><b>Fitur lainnya</b></div><button className="icon-button" onClick={()=>setOpen(false)} aria-label="Tutup"><X size={17}/></button></div>
      <div className="mobile-more-grid">
        <button onClick={()=>go("vendors")}><Store size={19}/><span>Vendor</span></button>
        <button onClick={()=>go("seating")}><Armchair size={19}/><span>Seating</span></button>
        <button onClick={()=>go("documents")}><FileText size={19}/><span>Documents</span></button>
        <button onClick={()=>go("team")}><UserRoundPlus size={19}/><span>Wedding Team</span></button>
        <button onClick={()=>go("notifications")}><Bell size={19}/><span>Notifications</span></button>
        <button onClick={()=>go("activity")}><Activity size={19}/><span>Activity</span></button>
        <button onClick={()=>go("settings")}><Settings size={19}/><span>Settings</span></button>
        <a href="/app/day-h"><CalendarClock size={19}/><span>Day-H Mode</span></a>
      </div>
    </div>}
    <nav className="mobile-nav live-mobile-nav">
      <button onClick={()=>go("home")}><Home size={18}/><small>Home</small></button>
      <button onClick={()=>go("plan")}><ListChecks size={18}/><small>Plan</small></button>
      {canBudget?<button onClick={()=>go("money")}><CircleDollarSign size={18}/><small>Money</small></button>:<button onClick={()=>go("documents")}><FileText size={18}/><small>Docs</small></button>}
      <button onClick={()=>go("guests")}><UsersRound size={18}/><small>Guests</small></button>
      <button onClick={()=>setOpen(v=>!v)} className={open?"active":""}><Menu size={18}/><small>More</small></button>
    </nav>
  </>;
}

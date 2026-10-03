"use client";

import { useEffect,useRef,useState } from "react";
import { usePathname } from "next/navigation";
import { Download,X } from "lucide-react";

type InstallEvent=Event&{prompt:()=>Promise<void>;userChoice:Promise<{outcome:"accepted"|"dismissed";platform:string}>};
const DISMISS_MS=7*24*60*60*1000;

export function InstallPrompt(){
  const pathname=usePathname();
  const[event,setEvent]=useState<InstallEvent|null>(null);
  const[visible,setVisible]=useState(false);
  const eligible=useRef(false);

  useEffect(()=>{
    if(window.matchMedia("(display-mode: standalone)").matches||localStorage.getItem("menujukita_installed")==="1")return;
    const dismissedAt=Number(localStorage.getItem("menujukita_install_dismissed_at")||0);
    if(dismissedAt&&Date.now()-dismissedAt<DISMISS_MS)return;

    let interactions=0;
    const delay=pathname.startsWith("/demo")||pathname.startsWith("/app")?18000:35000;
    const timer=window.setTimeout(()=>{eligible.current=true;if(event)setVisible(true)},delay);
    const interact=()=>{
      interactions+=1;
      if(interactions>=3){eligible.current=true;if(event)setVisible(true)}
    };
    const before=(e:Event)=>{
      e.preventDefault();
      const installEvent=e as InstallEvent;
      setEvent(installEvent);
      if(eligible.current)setVisible(true);
    };
    const installed=()=>{
      setVisible(false);
      setEvent(null);
      localStorage.setItem("menujukita_installed","1");
      localStorage.removeItem("menujukita_install_dismissed_at");
    };

    window.addEventListener("click",interact,{passive:true});
    window.addEventListener("beforeinstallprompt",before);
    window.addEventListener("appinstalled",installed);
    return()=>{
      window.clearTimeout(timer);
      window.removeEventListener("click",interact);
      window.removeEventListener("beforeinstallprompt",before);
      window.removeEventListener("appinstalled",installed);
    };
  },[pathname,event]);

  if(!visible||!event)return null;

  async function install(){
    await event!.prompt();
    const choice=await event!.userChoice;
    if(choice.outcome==="accepted"){
      setVisible(false);
    }else{
      localStorage.setItem("menujukita_install_dismissed_at",String(Date.now()));
      setVisible(false);
    }
  }

  function dismiss(){
    localStorage.setItem("menujukita_install_dismissed_at",String(Date.now()));
    setVisible(false);
  }

  return <aside className="install-prompt">
    <div className="brand-mark">M</div>
    <div className="install-copy"><b>Install MenujuKita</b><small>Akses lebih cepat seperti aplikasi.</small></div>
    <button className="btn btn-primary btn-sm" onClick={install}><Download size={15}/>Install</button>
    <button className="icon-button" onClick={dismiss} aria-label="Tutup"><X size={15}/></button>
  </aside>;
}

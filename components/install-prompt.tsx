"use client";
import { useEffect,useState } from "react";
import { Download,X } from "lucide-react";

type InstallEvent=Event&{prompt:()=>Promise<void>;userChoice:Promise<{outcome:"accepted"|"dismissed";platform:string}>};

export function InstallPrompt(){
  const[event,setEvent]=useState<InstallEvent|null>(null);
  const[visible,setVisible]=useState(false);
  useEffect(()=>{
    if(window.matchMedia("(display-mode: standalone)").matches)return;
    if(localStorage.getItem("menujukita_install_dismissed")==="1")return;
    const before=(e:Event)=>{e.preventDefault();setEvent(e as InstallEvent);setVisible(true)};
    const installed=()=>{setVisible(false);setEvent(null);localStorage.setItem("menujukita_installed","1")};
    window.addEventListener("beforeinstallprompt",before);
    window.addEventListener("appinstalled",installed);
    return()=>{window.removeEventListener("beforeinstallprompt",before);window.removeEventListener("appinstalled",installed)}
  },[]);
  if(!visible||!event)return null;
  async function install(){await event!.prompt();const choice=await event!.userChoice;if(choice.outcome==="accepted"){setVisible(false)}else{localStorage.setItem("menujukita_install_dismissed","1");setVisible(false)}}
  function dismiss(){localStorage.setItem("menujukita_install_dismissed","1");setVisible(false)}
  return <aside className="install-prompt"><div className="brand-mark">M</div><div className="install-copy"><b>Install MenujuKita</b><small>Akses lebih cepat seperti aplikasi.</small></div><button className="btn btn-primary btn-sm" onClick={install}><Download size={15}/>Install</button><button className="icon-button" onClick={dismiss} aria-label="Tutup"><X size={15}/></button></aside>
}

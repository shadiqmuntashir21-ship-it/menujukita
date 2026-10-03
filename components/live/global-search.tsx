"use client";
import { useMemo,useState } from "react";
import { Search,X } from "lucide-react";
export type SearchItem={type:string;title:string;meta:string;target:string};
export default function GlobalSearch({items}:{items:SearchItem[]}){
 const[q,setQ]=useState(""),[open,setOpen]=useState(false);
 const results=useMemo(()=>{const term=q.trim().toLowerCase();if(term.length<2)return[];return items.filter(x=>(x.title+" "+x.meta+" "+x.type).toLowerCase().includes(term)).slice(0,10)},[q,items]);
 function go(target:string){setOpen(false);setQ("");window.dispatchEvent(new CustomEvent("menujukita:navigate",{detail:target}))}
 return <div className={"global-search "+(open?"open":"")}><div className="global-search-box"><Search size={16}/><input value={q} onFocus={()=>setOpen(true)} onChange={e=>{setQ(e.target.value);setOpen(true)}} placeholder="Cari task, vendor, tamu..."/>{q&&<button onClick={()=>setQ("")} aria-label="Hapus pencarian"><X size={14}/></button>}</div>{open&&q.trim().length>=2&&<div className="global-search-results">{results.length?results.map((x,i)=><button key={x.type+x.title+i} onClick={()=>go(x.target)}><span className="search-type">{x.type}</span><span className="search-copy"><b>{x.title}</b><small>{x.meta}</small></span></button>):<div className="search-empty">Tidak ada hasil untuk “{q}”.</div>}</div>}{open&&<button className="search-backdrop" aria-label="Tutup pencarian" onClick={()=>setOpen(false)}/>}</div>
}

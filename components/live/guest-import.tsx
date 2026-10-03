"use client";

import { useRef,useState } from "react";
import { useRouter } from "next/navigation";
import { FileSpreadsheet,Upload } from "lucide-react";
import { importGuests } from "@/app/app/actions";

type Row={name:string;phone?:string;group?:string;pax?:number};

function parseCsvLine(line:string){
  const out:string[]=[];let current="";let quoted=false;
  for(let i=0;i<line.length;i++){
    const ch=line[i];
    if(ch==='"'){
      if(quoted&&line[i+1]==='"'){current+='"';i++}else quoted=!quoted;
    }else if(ch===","&&!quoted){out.push(current.trim());current=""}
    else current+=ch;
  }
  out.push(current.trim());
  return out;
}

function parseCsv(text:string):Row[]{
  const lines=text.replace(/\r/g,"").split("\n").filter(Boolean);
  if(!lines.length)return[];
  const header=parseCsvLine(lines[0]).map(x=>x.toLowerCase().trim());
  const index=(...names:string[])=>header.findIndex(h=>names.includes(h));
  const ni=index("name","nama","guest","guest name");
  const pi=index("phone","whatsapp","wa","telepon","no hp","nomor");
  const gi=index("group","grup","kategori","category");
  const xi=index("pax","jumlah","qty","quantity");
  if(ni<0)throw new Error("CSV harus memiliki kolom Name atau Nama.");
  return lines.slice(1,501).map(line=>{
    const cols=parseCsvLine(line);
    return{name:cols[ni]||"",phone:pi>=0?cols[pi]:"",group:gi>=0?cols[gi]:"Other",pax:xi>=0?Number(cols[xi]||1):1};
  }).filter(r=>r.name);
}

export default function GuestImport(){
  const input=useRef<HTMLInputElement>(null);
  const router=useRouter();
  const[rows,setRows]=useState<Row[]>([]);
  const[busy,setBusy]=useState(false);
  const[message,setMessage]=useState("");

  async function pick(){
    const file=input.current?.files?.[0];if(!file)return;
    setMessage("");
    try{setRows(parseCsv(await file.text()))}catch(e:any){setRows([]);setMessage(e.message||"CSV tidak dapat dibaca.")}
  }

  async function submit(){
    if(!rows.length)return;
    setBusy(true);setMessage("");
    try{
      const result=await importGuests(rows);
      setMessage(`${result.imported} tamu berhasil diimport.`);
      setRows([]);
      if(input.current)input.current.value="";
      router.refresh();
    }catch(e:any){setMessage(e.message||"Import gagal.");}
    finally{setBusy(false)}
  }

  return <div className="csv-import">
    <div className="module-head"><div><small className="muted">CSV IMPORT</small><h3>Import guest list</h3></div><FileSpreadsheet size={19}/></div>
    <p className="muted compact">Kolom yang dikenali: <b>Name/Nama</b>, Phone/WhatsApp, Group/Kategori, Pax/Jumlah. Maksimal 500 baris sekali import.</p>
    <div className="csv-controls"><input ref={input} className="input" type="file" accept=".csv,text/csv" onChange={pick}/><button className="btn btn-primary" type="button" onClick={submit} disabled={!rows.length||busy}><Upload size={15}/>{busy?"Mengimport...":rows.length?`Import ${rows.length} Tamu`:"Pilih CSV"}</button></div>
    {rows.length>0&&<div className="csv-preview"><b>Preview</b>{rows.slice(0,4).map((r,i)=><span key={i}>{r.name} · {r.group||"Other"} · {r.pax||1} pax</span>)}{rows.length>4&&<small>+ {rows.length-4} baris lainnya</small>}</div>}
    {message&&<div className="success-note" style={{marginTop:10}}>{message}</div>}
  </div>;
}

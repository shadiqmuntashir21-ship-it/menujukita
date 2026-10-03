"use client";
import { useRef,useState } from "react";
import { useRouter } from "next/navigation";
import { FileText,Trash2,UploadCloud } from "lucide-react";
import { deleteDocument,registerDocument } from "@/app/app/document-actions";

const fmt=(n:number)=>n<1024*1024?`${Math.ceil(n/1024)} KB`:`${(n/1024/1024).toFixed(1)} MB`;

export default function DocumentsSection({documents,usedBytes}:{documents:any[];usedBytes:number}){
  const router=useRouter(),input=useRef<HTMLInputElement>(null);
  const[busy,setBusy]=useState(false);const[error,setError]=useState("");
  async function upload(formData:FormData){
    const file=input.current?.files?.[0]; if(!file)return;
    setBusy(true);setError("");
    try{
      const presign=await fetch("/api/storage/presign",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({name:file.name,type:file.type,size:file.size})});
      const data=await presign.json();
      if(!presign.ok)throw new Error(data.error==="workspace_quota"?"Kuota dokumen 15 MB sudah penuh.":"File tidak dapat diupload.");
      const put=await fetch(data.url,{method:"PUT",headers:{"content-type":file.type},body:file});
      if(!put.ok)throw new Error("Upload ke storage gagal.");
      await registerDocument({objectKey:data.key,name:file.name,contentType:file.type,size:file.size,category:String(formData.get("category")||"other")});
      if(input.current)input.current.value="";
      router.refresh();
    }catch(e:any){setError(e.message||"Upload gagal.");}finally{setBusy(false)}
  }
  return <section id="documents" className="module-stack"><div className="panel">
    <div className="module-head"><div><small className="muted">PRIVATE DOCUMENT VAULT</small><h3>Dokumen wedding</h3></div><span className="badge">{fmt(usedBytes)} / 15 MB</span></div>
    <form action={upload} className="document-upload"><input ref={input} className="input" type="file" accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp" required/><select className="input" name="category" defaultValue="vendor"><option value="vendor">Vendor Contract</option><option value="invoice">Invoice</option><option value="receipt">Receipt</option><option value="rundown">Rundown</option><option value="floorplan">Floorplan</option><option value="other">Other</option></select><button className="btn btn-primary" disabled={busy}><UploadCloud size={16}/>{busy?"Mengupload...":"Upload"}</button></form>
    {error&&<div className="notice" style={{marginTop:12}}>{error}</div>}
    <div className="list document-list">{documents.length?documents.map(d=><div className="row" key={d.id}><FileText size={18}/><div className="row-grow"><b>{d.name}</b><small>{d.category} · {fmt(Number(d.size_bytes||0))}</small></div><a className="btn btn-sm" href={"/api/documents/"+d.id} target="_blank">Buka</a><form action={deleteDocument}><input type="hidden" name="id" value={d.id}/><button className="icon-button danger"><Trash2 size={15}/></button></form></div>):<div className="empty-state"><FileText size={26}/><b>Belum ada dokumen.</b><span className="muted">Simpan kontrak, invoice, receipt, rundown, atau floorplan di sini.</span></div>}</div>
  </div></section>
}

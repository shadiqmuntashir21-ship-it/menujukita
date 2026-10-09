"use client";
import {PiggyBank,Plus} from "lucide-react";
import {useMemo} from "react";
import type {DemoState} from "@/lib/demo-data";
import CurrencyInput from "@/components/currency-input";
const rupiah=(n:number)=>new Intl.NumberFormat("id-ID",{style:"currency",currency:"IDR",maximumFractionDigits:0}).format(n);
export default function DemoSavings({data,setData,paid,committed}:{data:DemoState;setData:React.Dispatch<React.SetStateAction<DemoState>>;paid:number;committed:number}){
 const entries=data.cashEntries||[];
 const totalIn=entries.filter(e=>e.kind==="deposit"||e.kind==="refund").reduce((a,e)=>a+e.amount,0);
 const extraOut=entries.filter(e=>e.kind==="withdrawal").reduce((a,e)=>a+e.amount,0);
 const cash=totalIn-extraOut-paid;
 const safe=cash-committed-data.reserve;
 const history=useMemo(()=>entries.slice().sort((a,b)=>b.id-a.id),[entries]);
 const add=(form:FormData)=>{
  const amount=Number(String(form.get("amount")||"").replace(/[^0-9]/g,""));
  const kind=String(form.get("kind")||"deposit") as "deposit"|"withdrawal"|"refund";
  const contributor=String(form.get("contributor")||"Bersama").slice(0,50);
  const date=String(form.get("date")||new Date().toISOString().slice(0,10));
  const note=String(form.get("note")||"").slice(0,200);
  if(!Number.isSafeInteger(amount)||amount<=0)return;
  setData(d=>({...d,cashEntries:[...(d.cashEntries||[]),{id:Math.max(0,...(d.cashEntries||[]).map(x=>x.id))+1,amount,kind,contributor,date,note}]}));
 };
 return <section className="module-stack">
  <div className="studio-panel" style={{padding:19,borderRadius:20,background:"#f3f5ef",display:"grid",gap:12}}>
   <div style={{display:"flex",alignItems:"center",gap:10}}><PiggyBank size={23}/><div><small className="micro-label">TABUNGAN · SIMULASI</small><h3 style={{margin:0,fontSize:23}}>Uang benar-benar terkumpul</h3></div></div>
   <strong style={{fontSize:"clamp(28px,5vw,38px)"}}>{rupiah(cash)}</strong>
   <div style={{display:"grid",gridTemplateColumns:"repeat(2,minmax(0,1fr))",gap:10}}>
    {[["Dana masuk",totalIn],["Pembayaran vendor",paid],["Penarikan lain",extraOut],["Sisa kewajiban",committed]].map(([k,v])=><div key={String(k)} style={{padding:12,borderRadius:12,background:"#fff"}}><small>{k}</small><strong style={{display:"block"}}>{rupiah(Number(v))}</strong></div>)}
   </div>
   <div style={{padding:12,borderRadius:12,background:safe<0?"#ffede6":"#e4eee2"}}><b>{safe<0?"Dana masih perlu ditambah":"Dana aman setelah kewajiban dan cadangan"}: {rupiah(safe)}</b><p style={{fontSize:12,margin:"5px 0 0"}}>Saldo kas − sisa kewajiban − dana cadangan {rupiah(data.reserve)}. Anggaran {rupiah(data.budget)} adalah rencana biaya, bukan saldo.</p></div>
  </div>
  <details className="composer-card"><summary><span><Plus size={18}/> Coba mencatat setoran / penarikan</span><small>Perubahan hanya disimpan di browser demo</small></summary><form action={add} className="editor-form">
   <label className="field"><span>Jenis</span><select className="input" name="kind"><option value="deposit">Setoran masuk</option><option value="withdrawal">Penarikan</option><option value="refund">Pengembalian dana</option></select></label>
   <label className="field"><span>Oleh</span><select className="input" name="contributor"><option>Alya</option><option>Raka</option><option>Keluarga</option><option>Bersama</option></select></label>
   <label className="field"><span>Jumlah rupiah</span><CurrencyInput name="amount" required/></label>
   <label className="field"><span>Tanggal</span><input type="date" className="input" name="date"/></label>
   <label className="field span-2"><span>Catatan</span><input className="input" name="note" maxLength={200}/></label>
   <button className="btn btn-primary span-2">Simpan simulasi</button>
  </form></details>
  <div className="studio-panel" style={{padding:16,borderRadius:20}}><h3>Mutasi tabungan</h3>
  <div className="studio-list">{history.map(e=><div className="studio-item" style={{display:"flex",gap:12,justifyContent:"space-between",alignItems:"center",padding:13}} key={e.id}>
  <div className="item-main"><b>{e.kind==="deposit"?"Setoran":e.kind==="refund"?"Refund":"Penarikan"} · {e.contributor}</b><span>{e.date} · {e.note}</span></div><div style={{display:"grid",gap:4,justifyItems:"end"}}><strong>{e.kind==="withdrawal"?"−":"+"}{rupiah(e.amount)}</strong><button type="button" className="btn btn-sm" onClick={()=>{if(window.confirm("Hapus simulasi mutasi ini?"))setData(d=>({...d,cashEntries:(d.cashEntries||[]).filter(x=>x.id!==e.id)}))}}>Hapus</button></div>
  </div>)}</div></div>
 </section>;
}

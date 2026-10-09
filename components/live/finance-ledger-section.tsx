"use client";
import {useMemo,useState} from "react";
import {BookOpen,ChevronDown,Plus,PiggyBank,ReceiptText,TrendingUp,WalletCards} from "lucide-react";
import CurrencyInput from "@/components/currency-input";
import ConfirmSubmit from "@/components/confirm-submit";
import {addCashEntry,voidCashEntry} from "@/app/app/finance-actions";
import type {CashEntry,FinanceSummary} from "@/lib/finance";
const money=(v:number)=>new Intl.NumberFormat("id-ID",{style:"currency",currency:"IDR",maximumFractionDigits:0}).format(v);
const contributor:Record<string,string>={partner_one:"Pasangan A",partner_two:"Pasangan B",family:"Keluarga",shared:"Bersama",other:"Lainnya"};
const kindLabel:Record<string,string>={deposit:"Setoran",withdrawal:"Penarikan",vendor_payment:"Pembayaran vendor",refund:"Pengembalian dana"};
export default function FinanceLedgerSection({entries,summary}:{entries:CashEntry[];summary:FinanceSummary}){
 const[filter,setFilter]=useState("all");
 const filtered=useMemo(()=>entries.filter(x=>filter==="all"||x.kind===filter).slice(0,60),[entries,filter]);
 const saved=Math.max(0,Math.min(100,summary.fundingPercent));
 return <div className="module-stack">
  <section className="studio-panel" style={{display:"grid",gap:15,background:"#f5f7f3",borderRadius:24,padding:20}}>
   <div style={{display:"flex",justifyContent:"space-between",gap:12,alignItems:"center"}}><div><span className="micro-label">TABUNGAN & KAS BERSAMA</span><h3 className="serif" style={{fontSize:30,margin:"6px 0"}}>Uang yang benar-benar tersedia</h3></div><PiggyBank size={27}/></div>
   <div style={{fontSize:"clamp(30px,6vw,44px)",fontWeight:700,lineHeight:1.1}}>{money(summary.cashBalance)}</div>
   <p style={{fontSize:13,lineHeight:1.6,margin:0}}>Saldo kas = seluruh setoran dan pengembalian dana dikurangi penarikan serta pembayaran vendor yang sudah terjadi. Anggaran adalah rencana biaya, bukan saldo.</p>
   <div style={{height:8,borderRadius:99,background:"#e0e6de",overflow:"hidden"}}><div style={{width:saved+"%",height:"100%",borderRadius:99,background:"#648a70"}}/></div>
   <div style={{display:"flex",justifyContent:"space-between",gap:12,flexWrap:"wrap",fontSize:13}}><span>{summary.target>0?money(summary.deposits)+" dari target "+money(summary.target):"Target pendanaan belum diatur"}</span><strong>{summary.target>0?summary.fundingPercent+"% dana disetor":"—"}</strong></div>
   <div style={{display:"grid",gridTemplateColumns:"repeat(2,minmax(0,1fr))",gap:10}}>
    {[["Total setoran",summary.deposits],["Pembayaran vendor",summary.vendorPayments],["Penarikan lain",summary.withdrawals],["Sisa kewajiban",summary.commitments]].map(([name,value])=><div key={String(name)} style={{padding:13,borderRadius:15,background:"#fff"}}><small style={{display:"block",color:"#73766f"}}>{name}</small><b style={{fontSize:17,display:"block",overflowWrap:"anywhere"}}>{money(Number(value))}</b></div>)}
   </div>
   <div style={{padding:13,borderRadius:14,background:summary.safeToSpend<0?"#fff2e9":"#e9f0e7",fontSize:14}}><strong>{summary.safeToSpend<0?"Kebutuhan pendanaan belum tercukupi":"Dana aman setelah komitmen dan cadangan"}: {money(summary.safeToSpend)}</strong><p style={{margin:"5px 0 0",fontSize:12}}>Perhitungan: saldo saat ini − kewajiban yang belum dibayar − dana cadangan {money(summary.buffer)}.</p></div>
  </section>
  <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,280px),1fr))",gap:15}}>
   <details className="composer-card"><summary><span><Plus size={18}/> Catat setoran atau mutasi</span><small>Setoran pasangan, bantuan keluarga, penarikan, dan refund</small></summary>
    <form action={addCashEntry} className="editor-form">
     <label className="field"><span>Jenis transaksi</span><select className="input" name="kind" required><option value="deposit">Setoran dana masuk</option><option value="withdrawal">Penarikan dana</option><option value="refund">Pengembalian dana</option></select></label>
     <label className="field"><span>Dari / oleh</span><select className="input" name="contributor"><option value="partner_one">Pasangan A</option><option value="partner_two">Pasangan B</option><option value="family">Keluarga</option><option value="shared">Dana bersama</option><option value="other">Lainnya</option></select></label>
     <label className="field span-2"><span>Nominal rupiah</span><CurrencyInput name="amount" min={1} required/></label>
     <label className="field"><span>Tanggal transaksi</span><input className="input" name="happened_on" type="date"/></label>
     <label className="field span-2"><span>Catatan opsional</span><input className="input" name="note" maxLength={300} placeholder="Misalnya: setoran tabungan bulan ini"/></label>
     <button className="btn btn-primary span-2" type="submit">Simpan transaksi</button>
    </form>
   </details>
   <div className="studio-panel" style={{padding:20,borderRadius:20,display:"grid",gap:9,alignContent:"start"}}>
    <div style={{display:"flex",alignItems:"center",gap:8}}><BookOpen size={19}/><b>Apa beda anggaran dan tabungan?</b></div>
    <p style={{fontSize:13,lineHeight:1.7,margin:0}}><b>Anggaran</b> adalah rencana biaya. <b>Tabungan</b> adalah dana yang benar-benar disetor. <b>Saldo</b> ialah dana tersisa sesudah transaksi. Pembayaran vendor harus dicatat pada Jadwal Pembayaran—bukan sebagai penarikan manual kedua kalinya.</p>
    <button type="button" className="btn" style={{justifySelf:"start"}} onClick={()=>window.dispatchEvent(new CustomEvent("menujukita:open-guide",{detail:"tabungan"}))||window.dispatchEvent(new CustomEvent("menujukita:navigate",{detail:"guide"}))}>Baca panduan tabungan <ChevronDown size={15}/></button>
   </div>
  </div>
  <section className="studio-panel" style={{padding:20,borderRadius:20}}>
   <div style={{display:"flex",justifyContent:"space-between",gap:12,alignItems:"center",flexWrap:"wrap"}}><h3 style={{fontSize:21,margin:0}}>Riwayat kas</h3><select className="input" aria-label="Filter jenis transaksi" style={{maxWidth:200}} value={filter} onChange={e=>setFilter(e.target.value)}><option value="all">Semua transaksi</option><option value="deposit">Setoran</option><option value="withdrawal">Penarikan</option><option value="vendor_payment">Pembayaran vendor</option><option value="refund">Pengembalian dana</option></select></div>
   {filtered.length===0?<p className="muted" style={{marginTop:15}}>Belum ada transaksi. Catat setoran pertama agar saldo bisa dihitung berdasarkan uang nyata.</p>:<div style={{display:"grid",gap:11,marginTop:16}}>{filtered.map(e=><div key={e.id} style={{padding:"12px 0",borderTop:"1px solid #eeeee8",display:"flex",gap:10,alignItems:"center",justifyContent:"space-between"}}>
    <div style={{display:"grid",gap:4}}><b>{kindLabel[e.kind]||e.kind}</b><small className="muted">{contributor[e.contributor]} · {String(e.happened_on).slice(0,10)}{e.note?" · "+e.note:""}</small></div>
    <div style={{display:"grid",gap:6,justifyItems:"end"}}><strong style={{color:["deposit","refund"].includes(e.kind)?"#447451":"#965b50"}}>{["deposit","refund"].includes(e.kind)?"+":"−"}{money(Number(e.amount))}</strong>
    {e.kind!=="vendor_payment"&&<form action={voidCashEntry}><input name="id" type="hidden" value={e.id}/><ConfirmSubmit message="Batalkan transaksi ini? Riwayat koreksinya tetap tersimpan.">Batalkan</ConfirmSubmit></form>}
    </div>
   </div>)}</div>}
   {entries.length>60&&<p className="muted">Menampilkan 60 transaksi terbaru. Rekap saldo tetap menghitung seluruh transaksi valid.</p>}
  </section>
 </div>;
}

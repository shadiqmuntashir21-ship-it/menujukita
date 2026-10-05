"use client";
import { useState } from "react";
import { Check,Copy } from "lucide-react";

type Method={code:string;label:string;type:string;account_no?:string;account_name?:string;merchant_id?:string;instructions?:string;qr_image_path?:string};
export default function PaymentMethods({methods}:{methods:Method[]}){
 const[first]=methods,[selected,setSelected]=useState(first?.code||""),[copied,setCopied]=useState("");
 const current=methods.find(m=>m.code===selected)||first;
 const copy=async(v:string,label:string)=>{try{await navigator.clipboard.writeText(v);setCopied(label);setTimeout(()=>setCopied(""),1600)}catch{}};
 return <div className="checkout-payment-block">
  <div className="checkout-method-grid">{methods.map(m=><label className={"checkout-method "+(selected===m.code?"selected":"")} key={m.code}><input type="radio" name="payment_method" value={m.code} checked={selected===m.code} onChange={()=>setSelected(m.code)} required/><span className="method-dot">{selected===m.code?<Check size={14}/>:null}</span><div><b>{m.label}</b><small>{m.type==="qris"?"Scan QRIS":m.type==="ewallet"?"E-Wallet":"Transfer Bank"}</small></div></label>)}</div>
  {current&&<section className="checkout-payment-preview">
   <div className="payment-preview-head"><div><small>METODE DIPILIH</small><h3>{current.label}</h3></div><span>{current.type==="qris"?"QRIS":"Manual verification"}</span></div>
   {current.type==="qris"?<div className="qris-live-card"><img src={current.qr_image_path||"/qris-teman-digital.svg"} alt="QRIS Teman Digital"/><div><small>MERCHANT</small><b>{current.account_name||"TEMAN DIGITAL"}</b><p>ID QRIS: {current.merchant_id||current.account_no}</p><strong>Sebelum melakukan pembayaran, pastikan nama merchant yang muncul adalah TEMAN DIGITAL.</strong></div></div>:<div className="bank-live-card"><div><small>{current.type==="ewallet"?"NOMOR GOPAY":"NOMOR REKENING"}</small><b>{current.account_no}</b><button type="button" onClick={()=>copy(current.account_no||"","Nomor")}><Copy size={14}/>{copied==="Nomor"?"Disalin":"Salin nomor"}</button></div><div><small>ATAS NAMA</small><b>{current.account_name}</b></div></div>}
   {current.instructions&&<p className="payment-instruction">{current.instructions}</p>}
  </section>}
 </div>
}

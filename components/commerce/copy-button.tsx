"use client";
import { useState } from "react";
import { Copy,Check } from "lucide-react";
export default function CopyButton({value,label="Salin"}:{value:string;label?:string}){
 const[copied,setCopied]=useState(false);
 return <button type="button" className="copy-payment-button" onClick={async()=>{try{await navigator.clipboard.writeText(value);setCopied(true);setTimeout(()=>setCopied(false),1600)}catch{}}}>{copied?<Check size={14}/>:<Copy size={14}/>} {copied?"Disalin":label}</button>
}

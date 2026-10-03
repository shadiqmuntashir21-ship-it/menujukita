"use client";
import { useActionState } from "react";
import { Copy,KeyRound } from "lucide-react";
import { resetLicensePin } from "./actions";
export default function PinResetButton({id}:{id:string}){
 const[state,action,pending]=useActionState(resetLicensePin,null);
 return <div className="pin-reset"><form action={action}><input type="hidden" name="id" value={id}/><button className="action-link" disabled={pending}><KeyRound size={14}/>{pending?"Resetting...":"Reset PIN"}</button></form>{state?.pin&&<div className="one-time-pin"><span>PIN baru</span><strong>{state.pin}</strong><button type="button" onClick={()=>navigator.clipboard.writeText(state.pin!)}><Copy size={13}/></button></div>}{state?.error&&<small className="danger-text">{state.error}</small>}</div>
}

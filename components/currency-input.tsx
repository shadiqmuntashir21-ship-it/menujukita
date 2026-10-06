"use client";
import {useEffect,useMemo,useState} from "react";

type Props={
  name?:string;
  value?:number;
  defaultValue?:number;
  onValueChange?:(value:number)=>void;
  className?:string;
  placeholder?:string;
  required?:boolean;
  disabled?:boolean;
  min?:number;
  id?:string;
  "aria-label"?:string;
};

const clean=(v:string)=>Math.max(0,Number(v.replace(/\D/g,"")||0));
const fmt=(v:number)=>new Intl.NumberFormat("id-ID",{maximumFractionDigits:0}).format(Math.max(0,Number(v||0)));

export default function CurrencyInput({name,value,defaultValue=0,onValueChange,className="",placeholder="0",required,disabled,min=0,id,...rest}:Props){
  const controlled=value!==undefined;
  const [internal,setInternal]=useState(Math.max(min,Number(defaultValue||0)));
  useEffect(()=>{if(controlled)setInternal(Math.max(min,Number(value||0)))},[controlled,value,min]);
  const numeric=controlled?Math.max(min,Number(value||0)):internal;
  const display=useMemo(()=>numeric?fmt(numeric):"",[numeric]);
  return <span className={`currency-input ${className}`.trim()}>
    <span className="currency-prefix">Rp</span>
    <input id={id} type="text" inputMode="numeric" autoComplete="off" value={display}
      placeholder={placeholder} required={required} disabled={disabled} {...rest}
      onChange={e=>{const next=Math.max(min,clean(e.target.value));if(!controlled)setInternal(next);onValueChange?.(next)}}/>
    {name?<input type="hidden" name={name} value={numeric}/>:null}
  </span>;
}

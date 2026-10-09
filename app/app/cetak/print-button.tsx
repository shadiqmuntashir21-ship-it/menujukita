"use client";
import {Printer} from "lucide-react";
export default function PrintPageButton(){return <button type="button" className="btn btn-primary" onClick={()=>window.print()}><Printer size={16}/> Cetak / Simpan sebagai PDF</button>}

import Link from "next/link";
import {requireWorkspace} from "@/lib/workspace";
import {loadWeddingFinance} from "@/lib/finance";
import PrintPageButton from "./print-button";
export const dynamic="force-dynamic";
const money=(n:any)=>new Intl.NumberFormat("id-ID",{style:"currency",currency:"IDR",maximumFractionDigits:0}).format(Number(n||0));
export default async function PrintPage(){
 const {db,wedding}=await requireWorkspace(),id=String(wedding.id);
 const [tasks,guests,vendors,rundown,finance]=await Promise.all([
  db`SELECT title,status,due_date FROM tasks WHERE wedding_id=${id} ORDER BY due_date NULLS LAST LIMIT 500`,
  db`SELECT name,rsvp_status,expected_pax FROM guests WHERE wedding_id=${id} ORDER BY name LIMIT 1600`,
  db`SELECT name,category,status,agreed_price FROM vendors WHERE wedding_id=${id} ORDER BY category LIMIT 200`,
  db`SELECT activity,starts_at,location,status FROM rundown_items WHERE wedding_id=${id} ORDER BY starts_at LIMIT 200`,
  loadWeddingFinance(db,id,Number(wedding.budget_total||0),Number(wedding.reserve_buffer||0))
 ]);
 const table=(headers:string[],rows:any[][])=><table style={{borderCollapse:"collapse",width:"100%",fontSize:12}}><thead><tr>{headers.map(h=><th key={h} style={{textAlign:"left",borderBottom:"1px solid #aeb8ab",padding:8}}>{h}</th>)}</tr></thead><tbody>{rows.map((r,i)=><tr key={i}>{r.map((cell,j)=><td key={j} style={{padding:8,borderBottom:"1px solid #e8eae5",overflowWrap:"anywhere"}}>{cell===null||cell===undefined?"—":String(cell)}</td>)}</tr>)}</tbody></table>;
 const section=(label:string,body:React.ReactNode)=><section style={{marginTop:34,breakInside:"avoid-page"}}><h2 style={{fontSize:23,fontWeight:500,borderBottom:"2px solid #3e6754",paddingBottom:8}}>{label}</h2>{body}</section>;
 return <main style={{background:"#f2f5f0",minHeight:"100vh",padding:"clamp(14px,4vw,35px)",color:"#24382d"}}>
 <style>{'@media print {body{background:white!important} .no-print{display:none!important} @page{size:A4;margin:16mm} .paper{box-shadow:none!important;padding:0!important;max-width:100%!important} table{break-inside:auto} tr{break-inside:avoid}}'}</style>
 <div className="no-print" style={{maxWidth:900,margin:"0 auto 16px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,flexWrap:"wrap"}}><Link href="/app">← Kembali ke Wedding Studio</Link><PrintPageButton/></div>
 <article className="paper" style={{maxWidth:900,margin:"0 auto",background:"#fff",padding:"clamp(20px,5vw,50px)",borderRadius:16,boxShadow:"0 20px 60px #0000000d",fontFamily:"Georgia,serif"}}>
 <small style={{letterSpacing:3}}>MENUJUKITA · RINGKASAN PERNIKAHAN</small>
 <h1 style={{fontSize:40,margin:"15px 0 5px"}}>{wedding.couple_one_name} & {wedding.couple_two_name}</h1>
 <p>{String(wedding.wedding_date||"Tanggal belum ditentukan").slice(0,10)} · {wedding.city||"Lokasi belum diisi"}</p>
 {section("Ringkasan",<div style={{display:"grid",gridTemplateColumns:"repeat(2,minmax(0,1fr))",gap:12,fontFamily:"sans-serif",fontSize:13}}>
 {[
 ["Tugas selesai",tasks.filter((t:any)=>t.status==="done").length+" / "+tasks.length],
 ["Target anggaran",money(wedding.budget_total)],
 ["Saldo kas",money(finance.summary.cashBalance)],
 ["Sisa kewajiban",money(finance.summary.commitments)],
 ["Vendor terkonfirmasi",vendors.filter((v:any)=>["booked","completed"].includes(v.status)).length],
 ["Tamu hadir",guests.filter((g:any)=>g.rsvp_status==="attending").reduce((sum:number,g:any)=>sum+Number(g.expected_pax||0),0)]
 ].map(([k,v])=><div key={k} style={{padding:14,background:"#f4f6f1",borderRadius:12}}><div style={{color:"#5b6b5d"}}>{k}</div><b style={{fontSize:17}}>{v}</b></div>)}</div>)}
 {section("Checklist Persiapan",table(["Tugas","Status","Tenggat"],tasks.map((x:any)=>[x.title,x.status,x.due_date?String(x.due_date).slice(0,10):"Belum ditetapkan"])))}
 {section("Vendor",table(["Nama","Kategori","Status","Harga deal"],vendors.map((v:any)=>[v.name,v.category,v.status,money(v.agreed_price)])))}
 {section("Rundown Hari-H",table(["Waktu","Kegiatan","Lokasi","Status"],rundown.map((r:any)=>[String(r.starts_at||"").slice(0,16),r.activity,r.location,r.status])))}
 <p style={{fontFamily:"sans-serif",fontSize:11,marginTop:30,color:"#637268"}}>Ringkasan privat untuk keperluan pasangan. Dicetak dari data MenujuKita yang dapat berubah; pastikan memeriksa versi terbaru sebelum membagikan kepada keluarga atau vendor.</p>
 </article></main>;
}

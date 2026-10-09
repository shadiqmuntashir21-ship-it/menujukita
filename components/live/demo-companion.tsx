"use client";
import {useEffect,useState} from "react";
import {HeartHandshake,Palette,Gift,Mail,Plus} from "lucide-react";
type Kind="concept"|"gifts"|"decisions"|"invitation";
type Item={id:number;title:string;note:string;amount:number;quantity:number;purchased:boolean;status:string;imageUrl:string;comments:string[]};
type DemoExtras={theme:string;palette:string;story:string;publish:boolean;visual:string;items:Record<Kind,Item[]>};
const defaults:DemoExtras={theme:"Modern Garden",palette:"Ivory, sage, champagne",story:"Dengan penuh kebahagiaan, kami mengundang Anda.",publish:false,visual:"sage",
 items:{concept:[{id:1,title:"Pelaminan taman minimalis",note:"Bunga putih dan daun hijau",amount:0,quantity:1,purchased:false,status:"",imageUrl:"",comments:[]}],
 gifts:[{id:1,title:"Perlengkapan ibadah",note:"Periksa pilihan warna",amount:750000,quantity:1,purchased:false,status:"",imageUrl:"",comments:[]},{id:2,title:"Busana seserahan",note:"Sudah dipilih bersama",amount:1200000,quantity:1,purchased:true,status:"",imageUrl:"",comments:[]}],
 decisions:[{id:1,title:"Pilih venue acara",note:"Bandingkan lokasi dan kapasitas",amount:0,quantity:1,purchased:false,status:"discussing",imageUrl:"",comments:["Alya: suka lokasi dekat keluarga","Raka: cek rincian biaya dulu"]}],
 invitation:[]}};
const caption:Record<Kind,string>={concept:"Konsep & Mood Board",gifts:"Daftar Seserahan",decisions:"Diskusi Berdua",invitation:"Undangan Mini"};
export default function DemoCompanion({view,couple,date}:{view:Kind;couple:string;date:string}){
 const[state,setState]=useState<DemoExtras>(defaults),[ready,setReady]=useState(false);
 useEffect(()=>{try{const s=localStorage.getItem("menujukita_demo_extra_v2");if(s){const p=JSON.parse(s);setState({...defaults,...p,items:{...defaults.items,...p.items}})}}catch{}setReady(true)},[]);
 useEffect(()=>{if(ready)localStorage.setItem("menujukita_demo_extra_v2",JSON.stringify(state))},[ready,state]);
 const items=state.items[view]||[];
 const update=(key:keyof DemoExtras,v:any)=>setState(s=>({...s,[key]:v}));
 const patch=(id:number,obj:Partial<Item>)=>setState(s=>({...s,items:{...s.items,[view]:s.items[view].map(x=>x.id===id?{...x,...obj}:x)}}));
 const remove=(id:number)=>{if(window.confirm("Hapus data simulasi ini?"))setState(s=>({...s,items:{...s.items,[view]:s.items[view].filter(x=>x.id!==id)}}))};
 const add=(f:FormData)=>{const title=String(f.get("title")||"").trim();if(!title)return;setState(s=>({...s,items:{...s.items,[view]:[...s.items[view],{id:Math.max(0,...s.items[view].map(x=>x.id))+1,title,note:String(f.get("note")||""),amount:Number(String(f.get("amount")||"0").replace(/[^0-9]/g,""))||0,quantity:Math.max(1,Number(f.get("quantity")||1)),purchased:false,status:"discussing",imageUrl:String(f.get("imageUrl")||""),comments:[]}]}}))};
 const shell={padding:18,border:"1px solid #e5e9e1",borderRadius:20,background:"#fff"} as const;
 return <section className="module-stack">
 <header className="module-editorial-head"><div><span className="micro-label">DEMO PRO · {caption[view].toUpperCase()}</span><h2 className="serif">{caption[view]}</h2><p>Semua tindakan di halaman ini adalah simulasi lokal di browser dan tidak mengubah data pasangan sungguhan.</p></div>{view==="concept"?<Palette/>:view==="gifts"?<Gift/>:view==="decisions"?<HeartHandshake/>:<Mail/>}</header>
 {view==="invitation"?<div style={{display:"grid",gap:14,...shell}}>
 <h3>Undangan {couple}</h3><div style={{textAlign:"center",padding:25,borderRadius:17,background:state.visual==="rose"?"#f5e9e7":state.visual==="ivory"?"#f7f3ec":"#eaf0e7"}}>
 <small>UNDANGAN PERNIKAHAN</small><h2 className="serif" style={{fontSize:38}}>{couple}</h2><p>{date}</p><p>{state.story}</p></div>
 <label className="field"><span>Tema</span><select className="input" value={state.visual} onChange={e=>update("visual",e.target.value)}><option value="sage">Sage</option><option value="ivory">Ivory</option><option value="rose">Rose</option></select></label>
 <label className="field"><span>Kalimat undangan</span><textarea className="input" value={state.story} onChange={e=>update("story",e.target.value)}/></label>
 <label className="field"><span>Simulasi status publikasi</span><select className="input" value={state.publish?"yes":"no"} onChange={e=>update("publish",e.target.value==="yes")}><option value="no">Privat</option><option value="yes">Publik dalam simulasi</option></select></label>
 <p className="muted">Dalam demo, undangan tidak membuat tautan publik. Pada aplikasi berlisensi, halaman baru bisa dibagikan setelah diaktifkan pasangan.</p>
 </div>:<>
 {view==="concept"&&<div style={{...shell,display:"grid",gap:12}}><label className="field"><span>Tema wedding</span><input className="input" value={state.theme} onChange={e=>update("theme",e.target.value)}/></label><label className="field"><span>Warna dominan</span><input className="input" value={state.palette} onChange={e=>update("palette",e.target.value)}/></label><p className="muted">Simpan berbagai inspirasi dan catat alasan kalian menyukainya. Diskusikan sebelum menentukan konsep final.</p></div>}
 {view==="gifts"&&<div className="guest-overview"><div><small>Total barang</small><b>{items.length}</b></div><div><small>Sudah dibeli</small><b>{items.filter(x=>x.purchased).length}</b></div><div><small>Estimasi biaya</small><b>{new Intl.NumberFormat("id-ID",{style:"currency",currency:"IDR",maximumFractionDigits:0}).format(items.reduce((sum,x)=>sum+x.amount*x.quantity,0))}</b></div></div>}
 <details className="composer-card"><summary><span><Plus size={18}/> Tambah {view==="concept"?"inspirasi":view==="gifts"?"barang":"topik diskusi"}</span><small>Tindakan akan tersimpan lokal di browser</small></summary>
 <form action={add} className="editor-form"><label className="field span-2"><span>Judul / nama</span><input className="input" name="title" required/></label><label className="field span-2"><span>Catatan</span><textarea className="input" name="note"/></label>
 {view==="concept"&&<label className="field span-2"><span>Link gambar inspirasi (opsional)</span><input className="input" type="url" name="imageUrl"/></label>}
 {view==="gifts"&&<><label className="field"><span>Jumlah</span><input className="input" type="number" name="quantity" min="1" defaultValue="1"/></label><label className="field"><span>Estimasi harga</span><input className="input" type="number" name="amount" min="0" defaultValue="0"/></label></>}
 <button className="btn btn-primary span-2">Tambahkan</button></form></details>
 <div style={{display:"grid",gap:12}}>{items.map(x=><article key={x.id} style={{...shell,display:"grid",gap:9}}>
 <b>{x.title}</b><p className="muted" style={{margin:0,fontSize:13}}>{x.note}</p>
 {view==="gifts"&&<label className="field"><span>Status barang</span><select className="input" value={x.purchased?"yes":"no"} onChange={e=>patch(x.id,{purchased:e.target.value==="yes"})}><option value="no">Belum dibeli</option><option value="yes">Sudah dibeli</option></select></label>}
 {view==="gifts"&&<div className="muted">Jumlah {x.quantity}, estimasi Rp {x.amount.toLocaleString("id-ID")} per unit</div>}
 {view==="concept"&&x.imageUrl&&/^https:\/\//.test(x.imageUrl)&&<img alt={x.title} src={x.imageUrl} referrerPolicy="no-referrer" style={{maxHeight:220,maxWidth:"100%",objectFit:"cover",borderRadius:13}}/>}
 {view==="decisions"&&<><select className="input" value={x.status} onChange={e=>patch(x.id,{status:e.target.value})}><option value="discussing">Diskusi</option><option value="waiting_partner">Menunggu pasangan</option><option value="agreed">Disepakati</option><option value="cancelled">Dibatalkan</option></select>
 {x.comments.map((c,i)=><p key={i} style={{padding:10,background:"#f2f4ef",borderRadius:11,margin:0}}>{c}</p>)}
 <form action={f=>{const value=String(f.get("comment")||"").trim();if(value)patch(x.id,{comments:[...x.comments,value]})}} style={{display:"flex",gap:8}}><input className="input" name="comment" placeholder="Tanggapan pasangan" required/><button className="btn">Kirim</button></form></>}
 <button type="button" className="btn" onClick={()=>remove(x.id)} style={{justifySelf:"start"}}>Hapus simulasi</button>
 </article>)}</div>
 </>}
 </section>;
}

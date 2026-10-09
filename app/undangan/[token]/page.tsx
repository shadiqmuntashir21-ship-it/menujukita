import Link from "next/link";
import {notFound} from "next/navigation";
import {Heart,MapPin,CalendarDays} from "lucide-react";
import {sql} from "@/lib/db";
export const dynamic="force-dynamic";
const day=(v:any)=>v?new Intl.DateTimeFormat("id-ID",{timeZone:"UTC",day:"numeric",month:"long",year:"numeric"}).format(new Date(String(v).slice(0,10)+"T12:00:00Z")):"Jadwal menyusul";
export default async function PublicInvitationPage({params}:{params:Promise<{token:string}>}){
 const{token}=await params;
 if(!/^[a-f0-9-]{36}$/i.test(token))notFound();
 const db=sql();
 const pages=await db`SELECT i.wedding_id,i.theme,i.headline,i.story,i.note,w.couple_one_name,w.couple_two_name,w.city
 FROM wedding_invitation_pages i JOIN weddings w ON w.id=i.wedding_id
 WHERE i.public_id::text=${token} AND i.published=true AND w.status='active' LIMIT 1`;
 const inv:any=pages[0];if(!inv)notFound();
 const events=await db`SELECT name,event_date,start_time,end_time,location,map_url FROM wedding_events
 WHERE wedding_id=${inv.wedding_id} AND is_public=true AND event_date IS NOT NULL ORDER BY event_date,start_time,sort_order LIMIT 8`;
 const palette:Record<string,{bg:string,ink:string,shade:string}>={sage:{bg:"#edf1e8",ink:"#27473a",shade:"#dde8da"},ivory:{bg:"#f8f3eb",ink:"#544a3e",shade:"#ebe1d6"},rose:{bg:"#f7ece9",ink:"#79494b",shade:"#eddcd7"}};
 const color=palette[inv.theme]||palette.sage;
 return <main style={{minHeight:"100vh",background:color.bg,color:color.ink,padding:"clamp(24px,4vw,70px) 15px",fontFamily:"Georgia,serif"}}>
 <article style={{maxWidth:760,margin:"0 auto",background:"#ffffffd8",borderRadius:30,padding:"clamp(25px,6vw,65px)",border:"1px solid "+color.shade,boxShadow:"0 25px 90px #33333310",textAlign:"center"}}>
  <Heart size={30} style={{margin:"0 auto 22px"}}/>
  <p style={{textTransform:"uppercase",letterSpacing:3,fontFamily:"sans-serif",fontSize:11}}>Undangan pernikahan</p>
  <p style={{fontSize:17,lineHeight:1.7,whiteSpace:"pre-wrap"}}>{inv.headline||"Dengan penuh kebahagiaan, kami mengundang Anda"}</p>
  <h1 style={{fontSize:"clamp(40px,8vw,65px)",fontWeight:400,lineHeight:1.1,margin:"32px 0"}}>{inv.couple_one_name}<div style={{fontStyle:"italic",fontSize:35,margin:12}}>&</div>{inv.couple_two_name}</h1>
  {inv.story&&<p style={{lineHeight:1.9,whiteSpace:"pre-wrap",maxWidth:490,margin:"28px auto",fontSize:17}}>{inv.story}</p>}
  <div style={{height:1,background:color.shade,margin:"38px auto",maxWidth:260}}/>
  {events.map((e:any,i:number)=><section key={i} style={{padding:"20px 0",display:"grid",gap:11}}>
   <h2 style={{fontWeight:400,fontSize:30,margin:0}}>{e.name}</h2>
   <div style={{display:"flex",gap:9,justifyContent:"center",alignItems:"center",fontFamily:"sans-serif",fontSize:14}}><CalendarDays size={16}/>{day(e.event_date)}</div>
   {e.start_time&&<p style={{fontFamily:"sans-serif",fontSize:14,margin:0}}>Pukul {String(e.start_time).slice(0,5)}{e.end_time?" – "+String(e.end_time).slice(0,5):""}</p>}
   {e.location&&<p style={{fontFamily:"sans-serif",fontSize:14,margin:0}}><MapPin size={15} style={{display:"inline",verticalAlign:"middle"}}/> {e.location}</p>}
   {e.map_url&&/^https:\/\//.test(String(e.map_url))&&<a href={String(e.map_url)} target="_blank" rel="noopener noreferrer" style={{color:color.ink,fontFamily:"sans-serif",fontSize:13,textDecoration:"underline"}}>Lihat petunjuk lokasi ↗</a>}
  </section>)}
  {inv.note&&<p style={{background:color.bg,padding:18,borderRadius:15,fontFamily:"sans-serif",fontSize:13,lineHeight:1.8,whiteSpace:"pre-wrap"}}>{inv.note}</p>}
  <p style={{fontFamily:"sans-serif",fontSize:13,lineHeight:1.7,marginTop:28}}>Jika menerima tautan RSVP pribadi, gunakan tautan tersebut untuk mengonfirmasi kehadiran kepada pasangan.</p>
  <div style={{height:1,background:color.shade,margin:"35px auto",maxWidth:200}}/>
  <p style={{fontSize:15}}>Terima kasih atas doa dan perhatian Anda.</p>
  <Link href="/" style={{fontFamily:"sans-serif",fontSize:12,color:color.ink}}>Dibuat dengan MenujuKita</Link>
 </article></main>;
}

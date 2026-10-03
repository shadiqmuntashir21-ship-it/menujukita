import { AlertTriangle,Bell,CalendarClock,CircleDollarSign,Store,UsersRound } from "lucide-react";

const icons:any={Task:CalendarClock,Payment:CircleDollarSign,Vendor:Store,Guest:UsersRound};
export default function NotificationsSection({items}:{items:any[]}){
  const critical=items.filter(x=>x.level==="critical").length;
  return <section id="notifications" className="module-stack"><div className="panel">
    <div className="module-head"><div><small className="muted">NOTIFICATION CENTER</small><h3>Yang perlu perhatian</h3></div><span className={"badge "+(critical?"badge-danger":"")}><Bell size={14}/>{items.length} alert</span></div>
    <div className="notification-list">{items.length?items.map((x:any,i:number)=>{const Icon=icons[x.kind]||AlertTriangle;return <div className={"notification-row "+x.level} key={x.kind+x.title+i}><div className="notification-icon"><Icon size={17}/></div><div className="row-grow"><b>{x.title}</b><small>{x.meta}</small></div><span className="status-pill">{x.level}</span></div>}):<div className="empty-state"><Bell size={26}/><b>Tidak ada alert penting.</b><span className="muted">MenujuKita akan menampilkan deadline dan risiko penting di sini.</span></div>}</div>
  </div></section>
}

import type {CalendarEvent} from "@/components/live/calendar-section";
const day=(value:any):string=>{
 if(!value)return"";
 if(value instanceof Date)return value.toISOString().slice(0,10);
 const v=String(value);
 return /^\d{4}-\d{2}-\d{2}/.test(v)?v.slice(0,10):"";
};
const clock=(value:any):string|null=>{
 if(value===null||value===undefined)return null;
 const v=String(value);
 return /^\d{2}:\d{2}/.test(v)?v.slice(0,5):null;
};
export function assembleWeddingCalendar(input:{tasks:any[];payments:any[];events:any[];rundown:any[];agenda:any[]}):CalendarEvent[]{
 const {tasks,payments,events,rundown,agenda}=input;
 const records:CalendarEvent[]=[
  ...tasks.filter(t=>day(t.due_date)).map(t=>({id:String(t.id),date:day(t.due_date),title:String(t.title),source:"task" as const,view:"plan" as const,note:String(t.description||"")})),
  ...payments.filter(p=>day(p.due_date)&&p.status!=="cancelled").map(p=>({id:String(p.id),date:day(p.due_date),title:"Pembayaran: "+p.description,source:"payment" as const,view:"money" as const,note:String(p.status||"")})),
  ...events.filter(e=>day(e.event_date)).map(e=>({id:String(e.id),date:day(e.event_date),title:String(e.name),source:"wedding" as const,view:"plan" as const,location:String(e.location||""),time:clock(e.start_time)})),
  ...rundown.filter(r=>day(r.starts_at)).map(r=>({id:String(r.id),date:day(r.starts_at),title:String(r.activity),source:"rundown" as const,view:"plan" as const,location:String(r.location||"")})),
  ...agenda.filter(a=>day(a.happens_on)).map(a=>({id:String(a.id),date:day(a.happens_on),title:String(a.title),source:"agenda" as const,view:"calendar" as const,kind:String(a.kind||"meeting"),location:a.location||null,note:a.note||null,time:clock(a.starts_at)}))
 ];
 return records.sort((a,b)=>a.date.localeCompare(b.date)||(a.time||"").localeCompare(b.time||""));
}

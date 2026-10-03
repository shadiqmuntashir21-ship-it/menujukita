import { CalendarRange,Clock3,UserRound,X } from "lucide-react";
import { addTask,assignTask,toggleTask,deleteTask,addRundownItem,assignRundown,updateRundownStatus,deleteRundownItem } from "@/app/app/actions";
import { dateLabel,timeLabel,labels } from "./shared";

export default function PlanSection({tasks,rundown,members,vendors,canEdit}:{tasks:any[];rundown:any[];members:any[];vendors:any[];canEdit:boolean}){
  const memberMap=new Map(members.map(m=>[String(m.id),m.display_name||m.invited_email||m.role]));
  const milestones=tasks.filter(t=>t.due_date&&t.status!=="skipped").slice().sort((a,b)=>String(a.due_date).localeCompare(String(b.due_date))).slice(0,12);
  return <section id="plan" className="module-stack">
    <div className="panel">
      <div className="module-head"><div><small className="muted">SMART CHECKLIST</small><h3>Persiapan kalian</h3></div><span className="badge">{tasks.filter(t=>t.status==="done").length}/{tasks.length} selesai</span></div>
      {canEdit&&<form action={addTask} className="task-create-form">
        <input className="input" name="title" placeholder="Tambah tugas baru..." required/>
        <select className="input compact" name="category" defaultValue="general"><option value="general">General</option><option value="vendor">Vendor</option><option value="guest">Guest</option><option value="attire">Busana</option><option value="document">Dokumen</option><option value="money">Budget</option></select>
        <input className="input compact" type="date" name="due_date"/>
        <select className="input compact" name="priority" defaultValue="medium"><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="critical">Critical</option></select>
        <select className="input compact" name="assignee_member_id" defaultValue=""><option value="">Belum di-assign</option>{members.map(m=><option value={m.id} key={m.id}>{m.display_name||m.invited_email||m.role}</option>)}</select>
        <button className="btn btn-primary btn-sm">Tambah</button>
      </form>}
      <div className="list task-list">{tasks.length?tasks.map(t=><div className={"row "+(t.status==="done"?"row-done":"")} key={t.id}>
        {canEdit&&<form action={toggleTask}><input type="hidden" name="id" value={t.id}/><button className={"check-button "+(t.status==="done"?"checked":"")} aria-label="Toggle task">{t.status==="done"?"✓":""}</button></form>}
        <div className="row-grow"><div className="row-title">{t.title}</div><small>{t.category} · {dateLabel(t.due_date)} · {t.priority}{t.assignee_member_id?" · "+(memberMap.get(String(t.assignee_member_id))||"Assigned"):""}</small></div>
        {canEdit&&<form action={assignTask} className="task-assignee"><input type="hidden" name="id" value={t.id}/><UserRound size={14}/><select name="assignee_member_id" defaultValue={t.assignee_member_id||""}><option value="">Unassigned</option>{members.map(m=><option value={m.id} key={m.id}>{m.display_name||m.invited_email||m.role}</option>)}</select><button className="btn btn-sm">Set</button></form>}
        {!canEdit&&<span className="badge">{labels[t.status]||t.status}</span>}
        {canEdit&&<form action={deleteTask}><input type="hidden" name="id" value={t.id}/><button className="icon-button danger" aria-label="Hapus task"><X size={16}/></button></form>}
      </div>):<div className="empty-state"><ListEmpty/></div>}</div>
    </div>

    <div className="panel">
      <div className="module-head"><div><small className="muted">TIMELINE</small><h3>Milestone menuju hari H</h3></div><CalendarRange size={20}/></div>
      <div className="prep-timeline">{milestones.length?milestones.map(t=><div className="prep-timeline-row" key={t.id}><div className={"timeline-node "+(t.status==="done"?"done":"")}/><div><b>{dateLabel(t.due_date)}</b><span>{t.title}</span><small>{t.status==="done"?"Selesai":t.priority}</small></div></div>):<div className="empty-mini">Tambahkan deadline pada checklist untuk membentuk timeline.</div>}</div>
    </div>

    <div className="panel">
      <div className="module-head"><div><small className="muted">DAY-H</small><h3>Rundown acara</h3></div><Clock3 size={20}/></div>
      {canEdit&&<form action={addRundownItem} className="rundown-create-form">
        <input className="input" name="activity" placeholder="Aktivitas, mis. Akad" required/>
        <input className="input compact" type="datetime-local" name="starts_at" required/>
        <input className="input compact" name="location" placeholder="Lokasi"/>
        <select className="input compact" name="pic_member_id" defaultValue=""><option value="">Tanpa PIC</option>{members.map(m=><option value={m.id} key={m.id}>{m.display_name||m.invited_email||m.role}</option>)}</select>
        <select className="input compact" name="vendor_id" defaultValue=""><option value="">Tanpa vendor</option>{vendors.map(v=><option value={v.id} key={v.id}>{v.name}</option>)}</select>
        <button className="btn btn-primary btn-sm">Tambah</button>
      </form>}
      <div className="list">{rundown.length?rundown.map(r=><div className="row" key={r.id}>
        <div style={{minWidth:82}}><b>{timeLabel(r.starts_at)}</b><br/><small>{dateLabel(r.starts_at)}</small></div>
        <div className="row-grow"><div className="row-title">{r.activity}</div><small>{r.location||"Lokasi belum diisi"}{r.pic_name?" · PIC "+r.pic_name:""}{r.vendor_name?" · "+r.vendor_name:""}</small></div>
        {canEdit&&<form action={assignRundown} className="rundown-assignee"><input type="hidden" name="id" value={r.id}/><select name="pic_member_id" defaultValue={r.pic_member_id||""}><option value="">PIC</option>{members.map(m=><option value={m.id} key={m.id}>{m.display_name||m.invited_email||m.role}</option>)}</select><select name="vendor_id" defaultValue={r.vendor_id||""}><option value="">Vendor</option>{vendors.map(v=><option value={v.id} key={v.id}>{v.name}</option>)}</select><button className="btn btn-sm">Set</button></form>}
        {canEdit?<><form action={updateRundownStatus} className="inline-form"><input type="hidden" name="id" value={r.id}/><select className="input compact" name="status" defaultValue={r.status}><option value="upcoming">Upcoming</option><option value="ready">Ready</option><option value="in_progress">Berjalan</option><option value="done">Done</option><option value="delayed">Delayed</option></select><button className="btn btn-sm">Simpan</button></form><form action={deleteRundownItem}><input type="hidden" name="id" value={r.id}/><button className="icon-button danger"><X size={16}/></button></form></>:<span className="badge">{labels[r.status]||r.status}</span>}
      </div>):<div className="empty-mini">Belum ada rundown.</div>}</div>
    </div>
  </section>;
}

function ListEmpty(){return <><span>Belum ada checklist.</span><small className="muted">Tambahkan task pertama untuk mulai planning.</small></>}

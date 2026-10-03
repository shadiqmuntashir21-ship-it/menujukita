"use client";
import { useActionState } from "react";
import { Copy,Link2,Trash2,UserPlus } from "lucide-react";
import { createMemberInvite,removeMember,revokeInvite } from "@/app/app/member-actions";

export default function MembersSection({members,invites,role}:{members:any[];invites:any[];role:string}){
  const[state,action,pending]=useActionState(createMemberInvite,null);
  const canInvite=["owner","partner"].includes(role);
  return <section id="team" className="module-stack"><div className="content-grid">
    <section className="panel"><div className="module-head"><div><small className="muted">COLLABORATION</small><h3>Wedding Team</h3></div><span className="badge">{members.filter(m=>m.status==="active").length} member</span></div>
      <div className="list">{members.map(m=><div className="row" key={m.id}><div className="member-avatar">{(m.display_name||m.invited_email||"?").slice(0,1).toUpperCase()}</div><div className="row-grow"><b>{m.display_name||m.invited_email||"Member"}</b><small>{m.role}{m.can_view_budget?" · budget access":""}</small></div>{role==="owner"&&m.role!=="owner"&&<form action={removeMember}><input type="hidden" name="id" value={m.id}/><button className="icon-button danger"><Trash2 size={15}/></button></form>}</div>)}</div>
      {invites.length>0&&<><hr className="divider"/><h3>Pending invites</h3><div className="list">{invites.map(i=><div className="row" key={i.id}><div className="row-grow"><b>{i.invited_email||"Invite link"}</b><small>{i.role} · berlaku sampai {new Intl.DateTimeFormat("id-ID",{day:"2-digit",month:"short"}).format(new Date(i.expires_at))}</small></div>{canInvite&&<form action={revokeInvite}><input type="hidden" name="id" value={i.id}/><button className="btn btn-sm">Revoke</button></form>}</div>)}</div></>}
    </section>
    <aside className="panel"><div className="module-head"><h3>Undang Member</h3><UserPlus size={20}/></div>{canInvite?<form action={action} className="stack"><input className="input" name="email" type="email" placeholder="Email (opsional, sebagai label)"/><select className="input" name="role" defaultValue="collaborator"><option value="partner">Partner</option><option value="collaborator">Collaborator / WO</option><option value="viewer">Viewer</option></select><label className="choice"><input type="checkbox" name="can_view_budget"/> Boleh melihat budget</label><button className="btn btn-primary" disabled={pending}>{pending?"Membuat link...":"Buat Invite Link"}</button>{state?.error&&<div className="notice">{state.error}</div>}{state?.link&&<div className="invite-link-box"><Link2 size={16}/><code>{state.link}</code><button type="button" className="icon-button" onClick={()=>navigator.clipboard.writeText(location.origin+state.link!)}><Copy size={15}/></button></div>}</form>:<div className="empty-state"><b>Read-only member</b><span className="muted">Hanya owner/partner yang dapat membuat invitation.</span></div>}</aside>
  </div></section>
}

import { Activity,CheckCircle2,CircleDollarSign,FileText,Store,UsersRound,UserRoundPlus,Armchair } from "lucide-react";

const icons:any={task:CheckCircle2,payment:CircleDollarSign,budget:CircleDollarSign,vendor:Store,guest:UsersRound,document:FileText,member:UserRoundPlus,seating:Armchair};
const labels:Record<string,string>={
  workspace_activated:"Workspace diaktifkan",
  task_created:"Task ditambahkan",task_toggled:"Status task diubah",task_deleted:"Task dihapus",
  vendor_created:"Vendor ditambahkan",vendor_status_changed:"Status vendor diubah",vendor_deleted:"Vendor dihapus",
  budget_item_created:"Budget item ditambahkan",budget_item_deleted:"Budget item dihapus",funds_updated:"Dana wedding diperbarui",
  payment_created:"Payment ditambahkan",payment_toggled:"Status payment diubah",payment_deleted:"Payment dihapus",
  guest_created:"Tamu ditambahkan",guest_status_changed:"RSVP tamu diubah",guest_deleted:"Tamu dihapus",guest_rsvp_updated:"Tamu mengirim RSVP",
  rundown_created:"Rundown ditambahkan",rundown_status_changed:"Status rundown diubah",rundown_deleted:"Rundown dihapus",
  member_invited:"Member diundang",member_joined:"Member bergabung",member_removed:"Member dihapus",invite_revoked:"Invite dibatalkan",
  seating_table_created:"Meja dibuat",seating_assigned:"Tamu ditempatkan",seating_removed:"Tamu dipindahkan",seating_table_deleted:"Meja dihapus",
  document_uploaded:"Dokumen diupload",document_deleted:"Dokumen dihapus",wedding_settings_updated:"Pengaturan wedding diperbarui"
};

export default function ActivitySection({items}:{items:any[]}){
  return <section id="activity" className="module-stack"><div className="panel">
    <div className="module-head"><div><small className="muted">ACTIVITY</small><h3>Perubahan terbaru</h3></div><Activity size={20}/></div>
    <div className="activity-list">{items.length?items.map(x=>{const Icon=icons[x.entity_type]||Activity;return <div className="activity-row" key={x.id}>
      <div className="activity-icon"><Icon size={16}/></div>
      <div className="row-grow"><b>{labels[x.action]||x.action}</b><small>{x.actor_name||"Guest / system"} · {new Intl.DateTimeFormat("id-ID",{day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit"}).format(new Date(x.created_at))}</small></div>
    </div>}):<div className="empty-state"><Activity size={26}/><b>Belum ada aktivitas.</b><span className="muted">Perubahan penting akan dicatat di sini.</span></div>}</div>
  </div></section>
}

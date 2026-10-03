import { X } from "lucide-react";
import { addBudgetItem,deleteBudgetItem,updateFunds,addPayment,markPaymentPaid,deletePayment } from "@/app/app/actions";
import { money,dateLabel,labels } from "./shared";

export default function MoneySection({wedding,metrics,budgetItems,payments,vendors,canEdit}:{wedding:any;metrics:any;budgetItems:any[];payments:any[];vendors:any[];canEdit:boolean}){
  return <section id="money" className="module-stack">
    <div className="dashboard-grid">
      <div className="panel"><small className="muted">Total Budget</small><div className="big">{money(wedding.budget_total)}</div></div>
      <div className="panel"><small className="muted">Planned</small><div className="big">{money(metrics.planned)}</div></div>
      <div className="panel"><small className="muted">Paid</small><div className="big">{money(metrics.paid)}</div></div>
      <div className="panel safe-card"><small>Safe to Spend</small><div className="big">{money(metrics.safeToSpend)}</div></div>
    </div>

    <div className="content-grid">
      <div className="panel"><h3>Pengaturan dana wedding</h3>{canEdit?<form action={updateFunds} className="form-grid">
        <label className="field"><span>Total budget</span><input className="input" name="budget_total" type="number" min="0" defaultValue={Number(wedding.budget_total||0)}/></label>
        <label className="field"><span>Dana wedding yang dialokasikan</span><input className="input" name="available_funds" type="number" min="0" defaultValue={Number(wedding.available_funds||0)}/></label>
        <label className="field"><span>Buffer yang dijaga</span><input className="input" name="reserve_buffer" type="number" min="0" defaultValue={Number(wedding.reserve_buffer||0)}/></label>
        <button className="btn btn-primary">Simpan Dana</button>
      </form>:<div className="formula-box"><span>Total budget</span><strong>{money(wedding.budget_total)}</strong><span>Dana dialokasikan: {money(wedding.available_funds)}</span><span>Buffer: {money(wedding.reserve_buffer)}</span></div>}</div>
      <aside className="panel"><h3>Cara Safe to Spend dihitung</h3><p className="muted">Dana wedding yang dialokasikan dikurangi pembayaran yang sudah dibayar, komitmen yang belum lunas, dan buffer.</p><div className="formula-box"><span>{money(wedding.available_funds||wedding.budget_total)}</span><b>− {money(metrics.paid)} sudah dibayar</b><b>− {money(metrics.committed)} committed</b><b>− {money(wedding.reserve_buffer)} buffer</b><strong>= {money(metrics.safeToSpend)}</strong></div></aside>
    </div>

    <div className="panel">
      <div className="module-head"><div><small className="muted">CONNECTED BUDGET</small><h3>Budget items</h3></div><span className="badge">{budgetItems.length} item</span></div>
      {canEdit&&<form action={addBudgetItem} className="money-create-form">
        <input className="input" name="name" placeholder="Mis. Paket catering" required/>
        <select className="input" name="vendor_id" defaultValue=""><option value="">Tanpa vendor</option>{vendors.map(v=><option key={v.id} value={v.id}>{v.name}</option>)}</select>
        <input className="input compact" name="planned_amount" type="number" min="0" placeholder="Rencana"/>
        <input className="input compact" name="actual_amount" type="number" min="0" placeholder="Aktual"/>
        <input className="input compact" name="paid_amount" type="number" min="0" placeholder="Terbayar"/>
        <button className="btn btn-primary btn-sm">Tambah</button>
      </form>}
      <div className="table-wrap"><table className="clean-table"><thead><tr><th>Item</th><th>Vendor</th><th>Rencana</th><th>Aktual</th><th>Terbayar</th>{canEdit&&<th></th>}</tr></thead><tbody>{budgetItems.length?budgetItems.map(b=><tr key={b.id}><td>{b.name}</td><td>{b.vendor_name||"—"}</td><td>{money(b.planned_amount)}</td><td>{money(b.actual_amount)}</td><td>{money(b.paid_amount)}</td>{canEdit&&<td><form action={deleteBudgetItem}><input type="hidden" name="id" value={b.id}/><button className="icon-button danger"><X size={15}/></button></form></td>}</tr>):<tr><td colSpan={canEdit?6:5} className="muted">Belum ada budget item.</td></tr>}</tbody></table></div>
    </div>

    <div className="panel">
      <div className="module-head"><div><small className="muted">PAYMENT TRACKER</small><h3>Jadwal pembayaran</h3></div>{metrics.overduePayments>0&&<span className="badge badge-danger">{metrics.overduePayments} overdue</span>}</div>
      {canEdit&&<form action={addPayment} className="payment-create-form">
        <input className="input" name="description" placeholder="Mis. DP Fotografer" required/>
        <select className="input" name="vendor_id" defaultValue=""><option value="">Tanpa vendor</option>{vendors.map(v=><option key={v.id} value={v.id}>{v.name}</option>)}</select>
        <input className="input compact" name="amount" type="number" min="1" placeholder="Nominal" required/>
        <input className="input compact" name="due_date" type="date"/>
        <button className="btn btn-primary btn-sm">Tambah</button>
      </form>}
      <div className="list">{payments.length?payments.map(p=><div className="row" key={p.id}><div className="row-grow"><div className="row-title">{p.description}</div><small>{p.vendor_name?p.vendor_name+" · ":""}{money(p.amount)} · {dateLabel(p.due_date)}</small></div><span className={"badge "+(p.status==="overdue"?"badge-danger":"")}>{labels[p.status]||p.status}</span>{canEdit&&<><form action={markPaymentPaid}><input type="hidden" name="id" value={p.id}/><button className="btn btn-sm">{p.status==="paid"?"Batalkan Lunas":"Tandai Lunas"}</button></form><form action={deletePayment}><input type="hidden" name="id" value={p.id}/><button className="icon-button danger"><X size={16}/></button></form></>}</div>):<div className="empty-state"><b>Belum ada payment.</b><span className="muted">Hubungkan pembayaran ke vendor agar prioritas otomatis lebih akurat.</span></div>}</div>
    </div>
  </section>;
}

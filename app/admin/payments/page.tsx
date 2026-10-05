import Link from "next/link";
import { ArrowLeft,CreditCard,QrCode } from "lucide-react";
import { requireAdmin } from "@/lib/admin";
import { ensureCommerceSchema } from "@/lib/commerce";
import { updatePaymentMethod } from "../order-actions";
export const dynamic="force-dynamic";
export default async function PaymentSettings(){
 const{db}=await requireAdmin();await ensureCommerceSchema(db);
 const methods=await db`SELECT * FROM payment_methods ORDER BY sort_order,label`;
 return <main className="admin-orders-page">
  <header className="admin-orders-top"><Link href="/admin"><ArrowLeft size={16}/>Control Center</Link><div><small>PAYMENT SETTINGS</small><h1>Metode Pembayaran</h1></div><span>{(methods as any[]).filter(m=>m.is_active).length} aktif</span></header>
  <section className="payment-admin-grid">{(methods as any[]).map(m=><form action={updatePaymentMethod} className="admin-card payment-admin-card" key={m.code}>
   <input type="hidden" name="code" value={m.code}/>
   <div className="admin-card-head"><div><small>{m.type.toUpperCase()}</small><h3>{m.label}</h3></div>{m.type==="qris"?<QrCode size={21}/>:<CreditCard size={21}/>}</div>
   <label className="field"><span>Nama metode</span><input className="input" name="label" defaultValue={m.label}/></label>
   <label className="field"><span>{m.type==="qris"?"ID QRIS":m.type==="ewallet"?"Nomor":"Nomor rekening"}</span><input className="input" name="account_no" defaultValue={m.account_no||""}/></label>
   <label className="field"><span>Atas nama / Merchant</span><input className="input" name="account_name" defaultValue={m.account_name||""}/></label>
   <label className="field"><span>Merchant ID</span><input className="input" name="merchant_id" defaultValue={m.merchant_id||""}/></label>
   <label className="field"><span>Instruksi</span><textarea className="input" name="instructions" defaultValue={m.instructions||""}/></label>
   <label className="payment-toggle"><input type="checkbox" name="is_active" defaultChecked={Boolean(m.is_active)}/><span>Aktif di checkout</span></label>
   {m.type==="qris"&&<div className="payment-qris-admin"><img src={m.qr_image_path||"/qris-teman-digital.svg"} alt="QRIS"/><small>QRIS Teman Digital yang sama dengan standar Dailyn.</small></div>}
   <button className="btn btn-primary">Simpan Metode</button>
  </form>)}</section>
 </main>
}

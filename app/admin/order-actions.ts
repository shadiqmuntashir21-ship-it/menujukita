"use server";
import crypto from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { hashPin,logAccess,newPinSalt,sha256 } from "@/lib/session";
import { addOrderActivity,ensureCommerceSchema,newCustomerPin,newLicenseCode,sendAccessEmail,sendNeedsConfirmationEmail } from "@/lib/commerce";

const refresh=(id?:string)=>{revalidatePath("/admin");revalidatePath("/admin/orders");if(id)revalidatePath("/admin/orders/"+id)};
export async function confirmPayment(formData:FormData){
 const{db}=await requireAdmin();await ensureCommerceSchema(db);const id=String(formData.get("id")||"");
 const orders=await db`SELECT o.*,pm.label payment_label FROM orders o LEFT JOIN payment_methods pm ON pm.code=o.payment_method_code WHERE o.id=${id} LIMIT 1`,order:any=orders[0];if(!order)return;
 if(["access_sent","completed"].includes(order.status)){refresh(id);return}
 if(order.license_id&&order.license_code){
  const pin=newCustomerPin(),salt=newPinSalt();await db`UPDATE licenses SET pin_hash=${hashPin(pin,salt)},pin_salt=${salt},pin_hint=${pin.slice(-2)},pin_updated_at=now(),updated_at=now() WHERE id=${order.license_id}`;
  await db`UPDATE license_sessions SET revoked_at=now() WHERE license_id=${order.license_id} AND revoked_at IS NULL`;
  const sent=await sendAccessEmail(db,order,order.license_code,pin,true);if(sent)await db`UPDATE orders SET status='access_sent',access_sent_at=now(),updated_at=now() WHERE id=${id}`;
  refresh(id);return;
 }
 if(!["awaiting_verification","needs_confirmation","payment_verified"].includes(order.status))return;
 const[cap]=await db`SELECT s.max_active_weddings,count(l.id) FILTER(WHERE l.status IN('active','unused','suspended'))::int allocated FROM app_settings s LEFT JOIN licenses l ON true WHERE s.id=1 GROUP BY s.max_active_weddings`;
 if(Number(cap?.allocated||0)>=Number(cap?.max_active_weddings||250))throw new Error("Kapasitas 250 lisensi sudah penuh.");
 const code=newLicenseCode(),pin=newCustomerPin(),salt=newPinSalt(),licenseId=crypto.randomUUID();
 const rows=await db`WITH target AS (
   SELECT id FROM orders WHERE id=${id} AND status IN('awaiting_verification','needs_confirmation','payment_verified') AND license_id IS NULL FOR UPDATE
  ), made AS (
   INSERT INTO licenses(id,code_hash,code_hint,pin_hash,pin_salt,pin_hint,pin_updated_at,status)
   SELECT ${licenseId},${sha256(code)},${code.slice(-4)},${hashPin(pin,salt)},${salt},${pin.slice(-2)},now(),'unused' FROM target RETURNING id
  )
  UPDATE orders o SET status='payment_verified',verified_at=now(),license_id=(SELECT id FROM made),license_code=${code},updated_at=now()
  WHERE o.id IN(SELECT id FROM target) RETURNING o.*`;
 const final:any=rows[0];
 if(!final){refresh(id);return}
 await addOrderActivity(db,id,"payment_verified",{licenseId:final.license_id||licenseId});
 await logAccess({actorType:"admin",licenseId:String(final.license_id||licenseId),event:"order_payment_verified",metadata:{orderId:id}});
 const sent=await sendAccessEmail(db,{...order,...final},final.license_code||code,pin,false);
 if(sent){await db`UPDATE orders SET status='access_sent',access_sent_at=now(),updated_at=now() WHERE id=${id}`;await addOrderActivity(db,id,"access_sent",{email:order.customer_email})}
 refresh(id);
}

export async function markNeedsConfirmation(formData:FormData){
 const{db}=await requireAdmin();await ensureCommerceSchema(db);const id=String(formData.get("id")||"");
 const rows=await db`UPDATE orders SET status='needs_confirmation',updated_at=now() WHERE id=${id} AND status IN('awaiting_verification','needs_confirmation') RETURNING *`,order:any=rows[0];
 if(order){await addOrderActivity(db,id,"needs_confirmation",{});await sendNeedsConfirmationEmail(db,order)}
 refresh(id);
}

export async function rejectPayment(formData:FormData){
 const{db}=await requireAdmin();await ensureCommerceSchema(db);const id=String(formData.get("id")||"");
 const rows=await db`UPDATE orders SET status='payment_rejected',updated_at=now() WHERE id=${id} AND status IN('awaiting_verification','needs_confirmation') RETURNING *`,order:any=rows[0];
 if(order){await addOrderActivity(db,id,"payment_rejected",{});await sendNeedsConfirmationEmail(db,order)}
 refresh(id);
}

export async function resendAccess(formData:FormData){
 const{db}=await requireAdmin();await ensureCommerceSchema(db);const id=String(formData.get("id")||"");
 const rows=await db`SELECT o.*,l.id actual_license_id FROM orders o JOIN licenses l ON l.id=o.license_id WHERE o.id=${id} AND o.license_code IS NOT NULL LIMIT 1`,order:any=rows[0];if(!order)return;
 const pin=newCustomerPin(),salt=newPinSalt();await db`UPDATE licenses SET pin_hash=${hashPin(pin,salt)},pin_salt=${salt},pin_hint=${pin.slice(-2)},pin_updated_at=now(),updated_at=now() WHERE id=${order.actual_license_id}`;
 await db`UPDATE license_sessions SET revoked_at=now() WHERE license_id=${order.actual_license_id} AND revoked_at IS NULL`;
 const sent=await sendAccessEmail(db,order,order.license_code,pin,true);if(sent){await db`UPDATE orders SET status='access_sent',access_sent_at=now(),updated_at=now() WHERE id=${id}`;await addOrderActivity(db,id,"access_resent",{resetPin:true})}
 refresh(id);
}

export async function cancelOrder(formData:FormData){
 const{db}=await requireAdmin();await ensureCommerceSchema(db);const id=String(formData.get("id")||"");
 await db`UPDATE orders SET status='cancelled',updated_at=now() WHERE id=${id} AND license_id IS NULL`;await addOrderActivity(db,id,"order_cancelled",{}).catch(()=>{});refresh(id);
}

export async function updatePaymentMethod(formData:FormData){
 const{db}=await requireAdmin();await ensureCommerceSchema(db);
 const code=String(formData.get("code")||""),label=String(formData.get("label")||"").trim(),accountNo=String(formData.get("account_no")||"").trim(),accountName=String(formData.get("account_name")||"").trim(),instructions=String(formData.get("instructions")||"").trim(),merchantId=String(formData.get("merchant_id")||"").trim(),active=formData.get("is_active")==="on";
 if(!code||!label)return;
 await db`UPDATE payment_methods SET label=${label},account_no=${accountNo||null},account_name=${accountName||null},merchant_id=${merchantId||null},instructions=${instructions||null},is_active=${active},updated_at=now() WHERE code=${code}`;
 revalidatePath("/admin");revalidatePath("/checkout");
}

"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { sql } from "@/lib/db";
import { addOrderActivity,ensureCommerceSchema,sendClaimEmails } from "@/lib/commerce";

export async function claimPayment(formData:FormData){
 const token=String(formData.get("token")||"");
 if(!token)redirect("/");
 const db=sql();await ensureCommerceSchema(db);
 const rows=await db`SELECT o.*,pm.label payment_label FROM orders o LEFT JOIN payment_methods pm ON pm.code=o.payment_method_code WHERE o.public_token=${token} LIMIT 1`;
 const order:any=rows[0];if(!order)redirect("/");
 if(order.status==="pending_payment"){
  await db.transaction([
   db`UPDATE orders SET status='awaiting_verification',claimed_at=now(),updated_at=now() WHERE id=${order.id} AND status='pending_payment'`,
   db`INSERT INTO payment_claims(order_id,method_code) VALUES(${order.id},${order.payment_method_code})`,
   db`INSERT INTO order_activity(order_id,event,metadata) VALUES(${order.id},'payment_claimed',${JSON.stringify({method:order.payment_method_code})}::jsonb)`
  ]);
  const updated=(await db`SELECT o.*,pm.label payment_label FROM orders o LEFT JOIN payment_methods pm ON pm.code=o.payment_method_code WHERE o.id=${order.id} LIMIT 1`)[0];
  await sendClaimEmails(db,updated);
 }
 revalidatePath("/order/"+token);
 redirect("/order/"+token+"?claimed=1");
}

export async function changePaymentMethod(formData:FormData){
 const token=String(formData.get("token")||""),method=String(formData.get("payment_method")||"");
 const db=sql();await ensureCommerceSchema(db);
 const rows=await db`SELECT id,status FROM orders WHERE public_token=${token} LIMIT 1`,order:any=rows[0];
 if(!order||order.status!=="pending_payment")redirect("/order/"+token);
 const methods=await db`SELECT * FROM payment_methods WHERE code=${method} AND is_active=true LIMIT 1`,pm:any=methods[0];
 if(pm){
  const snapshot={code:pm.code,label:pm.label,type:pm.type,account_no:pm.account_no,account_name:pm.account_name,merchant_id:pm.merchant_id,instructions:pm.instructions,qr_image_path:pm.qr_image_path};
  await db`UPDATE orders SET payment_method_code=${pm.code},payment_snapshot=${JSON.stringify(snapshot)}::jsonb,updated_at=now() WHERE id=${order.id}`;
  await addOrderActivity(db,order.id,"payment_method_changed",{method:pm.code});
 }
 revalidatePath("/order/"+token);redirect("/order/"+token);
}

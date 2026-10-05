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

export async function updateBuyerDetails(formData:FormData){
 const token=String(formData.get("token")||""),name=String(formData.get("name")||"").trim().slice(0,180),email=String(formData.get("email")||"").trim().toLowerCase().slice(0,180),whatsapp=String(formData.get("whatsapp")||"").trim().slice(0,40),couple=String(formData.get("couple_names")||"").trim().slice(0,180),weddingDate=String(formData.get("wedding_date")||"").trim()||null;
 if(!token||name.length<2||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||!/^\+?[0-9\s-]{8,20}$/.test(whatsapp))redirect("/order/"+token+"?error=data");
 const db=sql();await ensureCommerceSchema(db);
 const rows=await db`UPDATE orders SET customer_name=${name},customer_email=${email},customer_whatsapp=${whatsapp},couple_names=${couple||null},wedding_date=${weddingDate},updated_at=now() WHERE public_token=${token} AND status='pending_payment' RETURNING id`;
 if(rows[0])await addOrderActivity(db,String(rows[0].id),"buyer_details_updated",{});
 revalidatePath("/order/"+token);redirect("/order/"+token+"?updated=1");
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

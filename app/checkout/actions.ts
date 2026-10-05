"use server";
import { redirect } from "next/navigation";
import { sql } from "@/lib/db";
import { addOrderActivity,ensureCommerceSchema,MENUJUKITA_PRICE,newOrderNo,newPublicToken } from "@/lib/commerce";
import { rateLimit } from "@/lib/session";

const clean=(f:FormData,k:string,max=180)=>String(f.get(k)||"").trim().slice(0,max);
export async function createOrder(formData:FormData){
 const name=clean(formData,"name"),email=clean(formData,"email").toLowerCase(),whatsapp=clean(formData,"whatsapp",40),method=clean(formData,"payment_method",40),couple=clean(formData,"couple_names"),weddingDate=clean(formData,"wedding_date",20)||null;
 if(name.length<2||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||!/^\+?[0-9\s-]{8,20}$/.test(whatsapp))redirect("/checkout?error=data");
 if(!await rateLimit("menujukita-checkout",10))redirect("/checkout?error=limit");
 const db=sql();await ensureCommerceSchema(db);
 const methods=await db`SELECT * FROM payment_methods WHERE code=${method} AND is_active=true LIMIT 1`;
 const pm:any=methods[0];if(!pm)redirect("/checkout?error=payment");
 const token=newPublicToken(),orderNo=newOrderNo();
 const snapshot={code:pm.code,label:pm.label,type:pm.type,account_no:pm.account_no,account_name:pm.account_name,merchant_id:pm.merchant_id,instructions:pm.instructions,qr_image_path:pm.qr_image_path};
 const rows=await db`INSERT INTO orders(public_token,order_no,customer_name,customer_email,customer_whatsapp,couple_names,wedding_date,amount,payment_method_code,payment_snapshot,status)
   VALUES(${token},${orderNo},${name},${email},${whatsapp},${couple||null},${weddingDate},${MENUJUKITA_PRICE},${pm.code},${JSON.stringify(snapshot)}::jsonb,'pending_payment') RETURNING id`;
 await addOrderActivity(db,String(rows[0].id),"order_created",{paymentMethod:pm.code,amount:MENUJUKITA_PRICE});
 redirect("/order/"+token);
}

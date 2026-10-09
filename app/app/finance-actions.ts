"use server";
import {revalidatePath} from "next/cache";
import {requireBudgetAccess} from "@/lib/workspace";
import {recordActivity} from "@/lib/activity";

const validKinds=["deposit","withdrawal","refund"] as const;
const contributors=["partner_one","partner_two","family","shared","other"] as const;
function parseAmount(raw:FormDataEntryValue|null){
 const n=Number(String(raw||"0").replace(/[^\d.-]/g,""));
 if(!Number.isFinite(n)||n<=0||n>1000000000000)throw new Error("Masukkan nominal transaksi yang valid.");
 return Math.round(n);
}
export async function addCashEntry(form:FormData){
 const{db,wedding,session}=await requireBudgetAccess();
 const kind=String(form.get("kind")||"");
 const contributor=String(form.get("contributor")||"shared");
 if(!validKinds.includes(kind as any)||!contributors.includes(contributor as any))throw new Error("Jenis transaksi tidak valid.");
 const amount=parseAmount(form.get("amount"));
 const date=String(form.get("happened_on")||"").trim();
 if(date&&!/^\d{4}-\d{2}-\d{2}$/.test(date))throw new Error("Tanggal transaksi tidak valid.");
 const note=String(form.get("note")||"").trim().slice(0,300);
 const rows=await db`INSERT INTO wedding_cash_entries(wedding_id,kind,contributor,amount,happened_on,note,created_by)
 VALUES(${wedding.id},${kind},${contributor},${amount},${date||new Date().toISOString().slice(0,10)},${note||null},${session.user.id}) RETURNING id`;
 await recordActivity(db,wedding.id,session.user.id,"cash_entry_created","finance",String(rows[0].id),{kind,amount,contributor});
 revalidatePath("/app");
}
export async function voidCashEntry(form:FormData){
 const{db,wedding,session}=await requireBudgetAccess();
 const id=String(form.get("id")||"");
 // Only manual entries can be corrected here; vendor payments follow their invoices.
 const rows=await db`UPDATE wedding_cash_entries SET voided_at=now(),voided_by=${session.user.id},void_reason='corrected_by_user'
 WHERE id=${id} AND wedding_id=${wedding.id} AND payment_id IS NULL AND voided_at IS NULL
 RETURNING kind,amount`;
 if(rows[0])await recordActivity(db,wedding.id,session.user.id,"cash_entry_voided","finance",id,{kind:rows[0].kind,amount:String(rows[0].amount)});
 revalidatePath("/app");
}
// Vendor payments are synchronized atomically by the database trigger in the ledger migration.

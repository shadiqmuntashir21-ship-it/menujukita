/** Cash entries are the only source of truth for cash on hand. Budgets are planned costs, not cash. */
export type CashEntry={
 id:string; wedding_id:string; kind:"deposit"|"withdrawal"|"vendor_payment"|"refund";
 contributor:"partner_one"|"partner_two"|"family"|"shared"|"other";
 amount:string|number; happened_on:string;note:string|null;payment_id:string|null;created_at:string
};
export type FinanceSummary={
 deposits:number;withdrawals:number;vendorPayments:number;refunds:number;cashBalance:number;
 commitments:number;buffer:number;safeToSpend:number;target:number;fundingPercent:number;
};
export async function loadWeddingFinance(db:any,weddingId:string,plannedTarget:number,buffer:number):Promise<{entries:CashEntry[];summary:FinanceSummary}>{
 const [rows,commitmentRows]=await Promise.all([
  db`SELECT id,wedding_id,kind,contributor,amount,happened_on,note,payment_id,created_at
      FROM wedding_cash_entries WHERE wedding_id=${weddingId} AND voided_at IS NULL
      ORDER BY happened_on DESC,created_at DESC LIMIT 400`,
  db`SELECT COALESCE(sum(amount),0)::numeric AS total FROM payments
      WHERE wedding_id=${weddingId} AND status IN ('upcoming','overdue')`
 ]);
 // Ledger totals require all valid entries, not just the first 400 rendered in history.
 const [totals]=await db`SELECT
   COALESCE(sum(amount) FILTER(WHERE kind='deposit'),0)::numeric deposits,
   COALESCE(sum(amount) FILTER(WHERE kind='withdrawal'),0)::numeric withdrawals,
   COALESCE(sum(amount) FILTER(WHERE kind='vendor_payment'),0)::numeric vendor_payments,
   COALESCE(sum(amount) FILTER(WHERE kind='refund'),0)::numeric refunds
   FROM wedding_cash_entries WHERE wedding_id=${weddingId} AND voided_at IS NULL`;
 const deposits=Number(totals?.deposits||0),withdrawals=Number(totals?.withdrawals||0),vendorPayments=Number(totals?.vendor_payments||0),refunds=Number(totals?.refunds||0);
 const cashBalance=deposits-withdrawals-vendorPayments+refunds;
 const commitments=Number(commitmentRows[0]?.total||0);
 const safeToSpend=cashBalance-commitments-Number(buffer||0);
 const target=Number(plannedTarget||0);
 return{entries:rows as CashEntry[],summary:{deposits,withdrawals,vendorPayments,refunds,cashBalance,commitments,buffer:Number(buffer||0),safeToSpend,target,fundingPercent:target>0?Math.round(deposits/target*100):0}};
}

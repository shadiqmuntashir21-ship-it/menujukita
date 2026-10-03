"use server";

import crypto from "node:crypto";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";

type State={error?:string;codes?:string[]};
const alphabet="ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const chunk=()=>Array.from({length:4},()=>alphabet[crypto.randomInt(0,alphabet.length)]).join("");
const makeCode=()=>`MK-${chunk()}-${chunk()}`;
const hash=(v:string)=>crypto.createHash("sha256").update(v.toUpperCase()).digest("hex");

export async function generateLicenses(_prev:State|null,f:FormData):Promise<State>{
  const {db}=await requireAdmin();
  const requested=Math.max(1,Math.min(25,Number(f.get("count")||1)));
  const [cap]=await db`SELECT s.max_active_weddings,
    count(l.id) FILTER(WHERE l.status='active')::int active,
    count(l.id) FILTER(WHERE l.status='unused')::int unused
    FROM app_settings s LEFT JOIN licenses l ON true WHERE s.id=1 GROUP BY s.max_active_weddings`;
  const remaining=Math.max(0,Number(cap.max_active_weddings)-(Number(cap.active)+Number(cap.unused)));
  if(remaining<=0)return{error:"Seluruh slot pilot sudah dialokasikan."};
  const count=Math.min(requested,remaining);
  const codes=Array.from({length:count},makeCode);
  await db.transaction(codes.map(code=>db`INSERT INTO licenses(code_hash,code_hint,status) VALUES(${hash(code)},${code.slice(-4)},'unused')`));
  revalidatePath("/admin");
  return{codes};
}

export async function changeLicenseStatus(f:FormData){
  const {db}=await requireAdmin();
  const id=String(f.get("id")||""),status=String(f.get("status")||"");
  if(!["active","suspended","revoked","unused"].includes(status))return;

  if(status==="active"){
    await db`UPDATE licenses SET status='active',updated_at=now() WHERE id=${id} AND wedding_id IS NOT NULL AND status='suspended'`;
  }else if(status==="unused"){
    await db`UPDATE licenses SET status='unused',wedding_id=NULL,activated_by_auth_user_id=NULL,activated_at=NULL,updated_at=now() WHERE id=${id} AND status!='active'`;
  }else{
    await db`UPDATE licenses SET status=${status},updated_at=now() WHERE id=${id}`;
  }
  revalidatePath("/admin");
}

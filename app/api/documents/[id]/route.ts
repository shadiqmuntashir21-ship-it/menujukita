import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { auth,authConfigured } from "@/lib/auth/server";
import { sql } from "@/lib/db";
import { STORAGE_BUCKET,storageClient } from "@/lib/storage";

export async function GET(_req:Request,{params}:{params:Promise<{id:string}>}){
  if(!authConfigured)return Response.json({error:"server_not_configured"},{status:503});
  const {data:session}=await auth.getSession();
  if(!session?.user)return new Response("Unauthorized",{status:401});
  const {id}=await params;
  const db=sql();
  const rows=await db`SELECT d.object_key,d.category,m.role,m.can_view_budget
    FROM documents d
    JOIN wedding_members m ON m.wedding_id=d.wedding_id
    JOIN licenses l ON l.wedding_id=d.wedding_id
    JOIN weddings w ON w.id=d.wedding_id
    WHERE d.id=${id}
      AND m.auth_user_id=${session.user.id}
      AND m.status='active'
      AND l.status='active'
      AND w.status='active'
    LIMIT 1`;
  if(!rows[0])return new Response("Not found",{status:404});
  const row:any=rows[0];
  const canBudget=["owner","partner"].includes(String(row.role))||Boolean(row.can_view_budget);
  if(["invoice","receipt"].includes(String(row.category))&&!canBudget)return new Response("Forbidden",{status:403});
  const url=await getSignedUrl(storageClient(),new GetObjectCommand({Bucket:STORAGE_BUCKET,Key:String(row.object_key)}),{expiresIn:120});
  return Response.redirect(url,302);
}

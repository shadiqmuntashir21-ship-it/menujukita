import crypto from "node:crypto";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { auth } from "@/lib/auth/server";
import { sql } from "@/lib/db";
import { ALLOWED_FILE_TYPES,MAX_FILE_BYTES,MAX_WORKSPACE_BYTES,STORAGE_BUCKET,storageClient } from "@/lib/storage";

export async function POST(req:Request){
  const {data:session}=await auth.getSession();
  if(!session?.user) return Response.json({error:"unauthorized"},{status:401});
  const db=sql();
  const rows=await db`SELECT w.id FROM weddings w
    JOIN wedding_members m ON m.wedding_id=w.id
    JOIN licenses l ON l.wedding_id=w.id
    WHERE m.auth_user_id=${session.user.id} AND m.status='active' AND w.status='active' AND l.status='active'
    LIMIT 1`;
  if(!rows[0]) return Response.json({error:"workspace_not_found"},{status:403});
  const weddingId=String(rows[0].id);
  const body=await req.json().catch(()=>null) as any;
  const name=String(body?.name||"").trim(),type=String(body?.type||""),size=Number(body?.size||0);
  if(!name||!ALLOWED_FILE_TYPES.has(type)||size<=0||size>MAX_FILE_BYTES) return Response.json({error:"invalid_file"},{status:400});
  const [usage]=await db`SELECT coalesce(sum(size_bytes),0)::bigint used FROM documents WHERE wedding_id=${weddingId}`;
  if(Number(usage.used)+size>MAX_WORKSPACE_BYTES) return Response.json({error:"workspace_quota"},{status:413});
  const safe=name.replace(/[^a-zA-Z0-9._-]+/g,"-").slice(-90)||"file";
  const key=`weddings/${weddingId}/${crypto.randomUUID()}-${safe}`;
  const command=new PutObjectCommand({Bucket:STORAGE_BUCKET,Key:key,ContentType:type,ContentLength:size});
  const url=await getSignedUrl(storageClient(),command,{expiresIn:300});
  return Response.json({url,key});
}

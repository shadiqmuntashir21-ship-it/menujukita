import crypto from "node:crypto";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getWorkspaceContext } from "@/lib/workspace";
import { ALLOWED_FILE_TYPES,MAX_FILE_BYTES,MAX_WORKSPACE_BYTES,STORAGE_BUCKET,storageClient } from "@/lib/storage";
export async function POST(req:Request){
 const ctx:any=await getWorkspaceContext();if(!ctx?.wedding)return Response.json({error:"unauthorized"},{status:401});
 const body=await req.json().catch(()=>null) as any,name=String(body?.name||"").trim(),type=String(body?.type||""),size=Number(body?.size||0),category=String(body?.category||"other");
 if(String(body?.weddingId||"")!==String(ctx.wedding.id))return Response.json({error:"workspace_not_found"},{status:403});
 if(!name||!ALLOWED_FILE_TYPES.has(type)||size<=0||size>MAX_FILE_BYTES)return Response.json({error:"invalid_file"},{status:400});
 const[usage]=await ctx.db`SELECT coalesce(sum(size_bytes),0)::bigint used FROM documents WHERE wedding_id=${ctx.wedding.id}`;if(Number(usage.used)+size>MAX_WORKSPACE_BYTES)return Response.json({error:"workspace_quota"},{status:413});
 const safe=name.replace(/[^a-zA-Z0-9._-]+/g,"-").slice(-90)||"file",key=`weddings/${ctx.wedding.id}/${crypto.randomUUID()}-${safe}`;
 const url=await getSignedUrl(storageClient(),new PutObjectCommand({Bucket:STORAGE_BUCKET,Key:key,ContentType:type,ContentLength:size}),{expiresIn:300});
 return Response.json({url,key,category});
}

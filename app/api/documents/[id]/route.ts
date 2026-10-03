import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getWorkspaceContext } from "@/lib/workspace";
import { STORAGE_BUCKET,storageClient } from "@/lib/storage";
export async function GET(_req:Request,{params}:{params:Promise<{id:string}>}){
 const ctx:any=await getWorkspaceContext();if(!ctx?.wedding)return new Response("Unauthorized",{status:401});const{id}=await params;
 const rows=await ctx.db`SELECT object_key,category FROM documents WHERE id=${id} AND wedding_id=${ctx.wedding.id} LIMIT 1`;if(!rows[0])return new Response("Not found",{status:404});
 const url=await getSignedUrl(storageClient(),new GetObjectCommand({Bucket:STORAGE_BUCKET,Key:String(rows[0].object_key)}),{expiresIn:120});return Response.redirect(url,302);
}

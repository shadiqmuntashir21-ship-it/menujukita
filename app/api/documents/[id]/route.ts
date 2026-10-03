import { getWorkspaceContext } from "@/lib/workspace";
import { presignStorageDownload } from "@/lib/storage";
export async function GET(_req:Request,{params}:{params:Promise<{id:string}>}){
 const ctx:any=await getWorkspaceContext();if(!ctx?.wedding)return new Response("Unauthorized",{status:401});const{id}=await params;
 const rows=await ctx.db`SELECT object_key,category FROM documents WHERE id=${id} AND wedding_id=${ctx.wedding.id} LIMIT 1`;if(!rows[0])return new Response("Not found",{status:404});
 const url=await presignStorageDownload(String(rows[0].object_key));return Response.redirect(url,302);
}
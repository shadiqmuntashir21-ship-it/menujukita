"use server";

import { DeleteObjectCommand,HeadObjectCommand } from "@aws-sdk/client-s3";
import { revalidatePath } from "next/cache";
import { canViewBudget,requireEditor } from "@/lib/workspace";
import { recordActivity } from "@/lib/activity";
import { ALLOWED_FILE_TYPES,MAX_FILE_BYTES,MAX_WORKSPACE_BYTES,STORAGE_BUCKET,storageClient } from "@/lib/storage";

export async function registerDocument(input:{objectKey:string;name:string;contentType:string;size:number;category:string}){
  const {db,session,wedding}=await requireEditor();
  const objectKey=String(input.objectKey||"");
  const name=String(input.name||"").slice(0,180);
  const type=String(input.contentType||"");
  const size=Number(input.size||0);
  const category=String(input.category||"other").slice(0,40);
  if(["invoice","receipt"].includes(category)&&!canViewBudget(wedding))throw new Error("Budget access denied");
  if(!objectKey.startsWith(`weddings/${wedding.id}/`)||!name||!ALLOWED_FILE_TYPES.has(type)||size<=0||size>MAX_FILE_BYTES)throw new Error("Invalid document");

  const [usage]=await db`SELECT coalesce(sum(size_bytes),0)::bigint used FROM documents WHERE wedding_id=${wedding.id}`;
  if(Number(usage.used)+size>MAX_WORKSPACE_BYTES)throw new Error("Document quota exceeded");

  const head=await storageClient().send(new HeadObjectCommand({Bucket:STORAGE_BUCKET,Key:objectKey}));
  if(Number(head.ContentLength||0)!==size)throw new Error("Uploaded file size mismatch");

  const rows=await db`INSERT INTO documents(wedding_id,category,name,object_key,content_type,size_bytes,uploaded_by_auth_user_id)
    VALUES(${wedding.id},${category},${name},${objectKey},${type},${size},${session.user.id}) RETURNING id`;
  await recordActivity(db,wedding.id,session.user.id,"document_uploaded","document",String(rows[0]?.id||""),{name,category,size});
  revalidatePath("/app");
}

export async function deleteDocument(formData:FormData){
  const {db,session,wedding}=await requireEditor();
  const id=String(formData.get("id")||"");
  const rows=await db`SELECT object_key,name,category FROM documents WHERE id=${id} AND wedding_id=${wedding.id} LIMIT 1`;
  if(!rows[0])return;
  if(["invoice","receipt"].includes(String(rows[0].category))&&!canViewBudget(wedding))throw new Error("Budget access denied");

  await storageClient().send(new DeleteObjectCommand({Bucket:STORAGE_BUCKET,Key:String(rows[0].object_key)}));
  await db`DELETE FROM documents WHERE id=${id} AND wedding_id=${wedding.id}`;
  await recordActivity(db,wedding.id,session.user.id,"document_deleted","document",id,{name:rows[0].name,category:rows[0].category});
  revalidatePath("/app");
}

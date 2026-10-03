export async function recordActivity(db:any,weddingId:string,userId:string|null,action:string,entityType:string,entityId?:string|null,metadata:Record<string,unknown>={}){
  await db`INSERT INTO activity_logs(wedding_id,auth_user_id,action,entity_type,entity_id,metadata)
    VALUES(${weddingId},${userId},${action},${entityType},${entityId||null},${JSON.stringify(metadata)}::jsonb)`;
}

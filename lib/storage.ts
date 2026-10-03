import { S3Client } from "@aws-sdk/client-s3";

export const STORAGE_BUCKET=process.env.NEON_STORAGE_BUCKET||"menujukita-private";
export const MAX_FILE_BYTES=5*1024*1024;
export const MAX_WORKSPACE_BYTES=15*1024*1024;
export const ALLOWED_FILE_TYPES=new Set(["application/pdf","image/jpeg","image/png","image/webp"]);

export function storageClient(){
  const endpoint=process.env.AWS_ENDPOINT_URL_S3;
  const region=process.env.AWS_REGION;
  const accessKeyId=process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey=process.env.AWS_SECRET_ACCESS_KEY;
  if(!endpoint||!region||!accessKeyId||!secretAccessKey) throw new Error("Neon Object Storage environment belum lengkap");
  return new S3Client({
    endpoint,region,forcePathStyle:true,
    credentials:{accessKeyId,secretAccessKey}
  });
}

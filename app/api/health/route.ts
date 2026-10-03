const keys={
  database:"DATABASE_URL",
  authBase:"NEON_AUTH_BASE_URL",
  authCookie:"NEON_AUTH_COOKIE_SECRET",
  rsvp:"RSVP_SIGNING_SECRET",
  storageKey:"AWS_ACCESS_KEY_ID",
  storageSecret:"AWS_SECRET_ACCESS_KEY",
  storageEndpoint:"AWS_ENDPOINT_URL_S3",
  storageRegion:"AWS_REGION",
  storageBucket:"NEON_STORAGE_BUCKET"
} as const;

export const dynamic="force-dynamic";

export async function GET(){
  const checks=Object.fromEntries(Object.entries(keys).map(([name,key])=>[name,Boolean(process.env[key])]));
  const ready=Object.values(checks).every(Boolean);
  return Response.json({ok:true,ready,checks},{status:ready?200:503});
}

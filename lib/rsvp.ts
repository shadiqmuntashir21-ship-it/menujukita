import crypto from "node:crypto";
import { getRsvpSigningSecret } from "@/lib/runtime-secrets";

export async function signRsvpParty(partyId:string){
  const secret=await getRsvpSigningSecret();
  return crypto.createHmac("sha256",secret).update(partyId).digest("hex").slice(0,32);
}

export async function verifyRsvpParty(partyId:string,signature:string){
  const expected=await signRsvpParty(partyId);
  const a=Buffer.from(expected),b=Buffer.from(signature||"");
  return a.length===b.length&&crypto.timingSafeEqual(a,b);
}

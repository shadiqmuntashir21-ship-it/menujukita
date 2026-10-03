import crypto from "node:crypto";

function secret() {
  const value = process.env.RSVP_SIGNING_SECRET;
  if (!value || value.length < 32) throw new Error("RSVP_SIGNING_SECRET belum dikonfigurasi dengan aman");
  return value;
}

export function signRsvpParty(partyId: string) {
  return crypto.createHmac("sha256", secret()).update(partyId).digest("hex").slice(0, 32);
}

export function verifyRsvpParty(partyId: string, signature: string) {
  const expected = signRsvpParty(partyId);
  const a = Buffer.from(expected);
  const b = Buffer.from(signature || "");
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

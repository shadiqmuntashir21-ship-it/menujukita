import { createNeonAuth } from "@neondatabase/auth/next/server";

export const authConfigured=Boolean(
  process.env.NEON_AUTH_BASE_URL &&
  process.env.NEON_AUTH_COOKIE_SECRET &&
  process.env.NEON_AUTH_COOKIE_SECRET.length>=32
);

// Build-safe placeholders prevent Vercel/Next from failing while compiling public routes.
// Protected/auth routes explicitly check authConfigured before serving requests.
const baseUrl=process.env.NEON_AUTH_BASE_URL||"https://auth-not-configured.invalid/neondb/auth";
const cookieSecret=process.env.NEON_AUTH_COOKIE_SECRET||"menujukita-build-placeholder-secret-32chars";

export const auth=createNeonAuth({
  baseUrl,
  cookies:{secret:cookieSecret}
});

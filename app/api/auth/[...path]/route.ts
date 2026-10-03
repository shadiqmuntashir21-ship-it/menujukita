import { auth,authConfigured } from "@/lib/auth/server";

const handlers=auth.handler();
const unavailable=async()=>Response.json(
  {error:"auth_not_configured",message:"MenujuKita authentication environment is not configured."},
  {status:503}
);

export const GET=authConfigured?handlers.GET:unavailable;
export const POST=authConfigured?handlers.POST:unavailable;

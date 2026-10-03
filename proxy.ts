import { NextRequest,NextResponse } from "next/server";
import { auth,authConfigured } from "@/lib/auth/server";

const protectedMiddleware:any=authConfigured?auth.middleware({loginUrl:"/auth/sign-in"}):null;

export default function proxy(request:NextRequest){
  if(!protectedMiddleware){
    const url=request.nextUrl.clone();
    url.pathname="/setup";
    url.searchParams.set("reason","server-config");
    return NextResponse.redirect(url);
  }
  return protectedMiddleware(request);
}

export const config={
  matcher:["/app/:path*","/onboarding/:path*","/admin/:path*","/license-status/:path*"]
};

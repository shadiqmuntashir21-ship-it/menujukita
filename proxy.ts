import { NextRequest,NextResponse } from "next/server";
export default function proxy(request:NextRequest){
 if(!process.env.DATABASE_URL){const url=request.nextUrl.clone();url.pathname="/setup";url.searchParams.set("reason","database");return NextResponse.redirect(url)}
 return NextResponse.next();
}
export const config={matcher:["/app/:path*","/onboarding/:path*","/admin/:path*","/license-status/:path*"]};

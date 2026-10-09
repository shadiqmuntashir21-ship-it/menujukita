import {redirect} from "next/navigation";
import {getLicenseSession} from "@/lib/session";
import WeddingOnboarding from "./wizard";
export const dynamic="force-dynamic";
export default async function Page({searchParams}:{searchParams:Promise<{error?:string}>}){
 const license:any=await getLicenseSession();
 if(!license)redirect("/auth/sign-in");
 if(license.wedding_id)redirect("/app");
 const q=await searchParams;
 return <WeddingOnboarding error={q.error}/>;
}

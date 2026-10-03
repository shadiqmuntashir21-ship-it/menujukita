"use server";
import { auth } from "@/lib/auth/server";
import { redirect } from "next/navigation";

const safeNext=(v:string)=>v.startsWith("/join/")||v==="/app"?v:"/app";
export async function signIn(_:{error:string}|null,f:FormData){
  const {error}=await auth.signIn.email({email:String(f.get("email")||""),password:String(f.get("password")||"")});
  if(error)return{error:error.message||"Gagal masuk"};
  redirect(safeNext(String(f.get("next")||"/app")));
}
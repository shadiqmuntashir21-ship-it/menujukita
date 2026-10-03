"use server";
import { auth,authConfigured } from "@/lib/auth/server";
import { redirect } from "next/navigation";

const safeNext=(v:string)=>v.startsWith("/join/")?v:"/onboarding";

export async function signUp(_:{error:string}|null,f:FormData){
  if(!authConfigured)return{error:"Server MenujuKita belum selesai dikonfigurasi. Coba lagi setelah environment production aktif."};
  const password=String(f.get("password")||"");
  if(password.length<8)return{error:"Password minimal 8 karakter."};
  const{error}=await auth.signUp.email({
    email:String(f.get("email")||""),
    name:String(f.get("name")||""),
    password
  });
  if(error)return{error:error.message||"Gagal membuat akun"};
  redirect(safeNext(String(f.get("next")||"/onboarding")));
}

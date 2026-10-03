import type {Metadata,Viewport} from "next";
import "./globals.css";
import {PwaRegister} from "@/components/pwa-register";
import {InstallPrompt} from "@/components/install-prompt";

export const metadata:Metadata={
  title:"MenujuKita — Plan the journey. Enjoy the day.",
  description:"Wedding planning command center untuk timeline, budget, vendor, tamu, RSVP, dan hari H.",
  applicationName:"MenujuKita",
  manifest:"/manifest.webmanifest",
  icons:{
    icon:[{url:"/icon-192.png",sizes:"192x192",type:"image/png"},{url:"/icon-512.png",sizes:"512x512",type:"image/png"}],
    apple:[{url:"/icon-192.png",sizes:"192x192",type:"image/png"}]
  },
  appleWebApp:{capable:true,title:"MenujuKita",statusBarStyle:"default"}
};

export const viewport:Viewport={themeColor:"#535E57",viewportFit:"cover"};

export default function RootLayout({children}:{children:React.ReactNode}){
  return <html lang="id"><body><PwaRegister/><InstallPrompt/>{children}</body></html>
}

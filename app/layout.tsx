import type {Metadata,Viewport} from "next";
import "./globals.css";
import {PwaRegister} from "@/components/pwa-register";
import {InstallPrompt} from "@/components/install-prompt";
export const metadata:Metadata={
  title:"MenujuKita — Wedding Planner",
  description:"Wedding planning studio untuk checklist, budget, vendor, tamu, RSVP, seating, dokumen, dan hari H.",
  applicationName:"MenujuKita",manifest:"/manifest.webmanifest",
  icons:{
    icon:[{url:"/icon-192.png",sizes:"192x192",type:"image/png"},{url:"/icon-512.png",sizes:"512x512",type:"image/png"}],
    shortcut:"/icon-192.png",
    apple:[{url:"/icon-192.png",sizes:"192x192",type:"image/png"}]
  },
  appleWebApp:{capable:true,title:"MenujuKita",statusBarStyle:"default"}
};
export const viewport:Viewport={themeColor:"#FAF8F4",viewportFit:"cover"};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="id"><body><PwaRegister/><InstallPrompt/>{children}</body></html>}

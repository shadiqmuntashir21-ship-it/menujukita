import type {MetadataRoute} from "next";
export default function manifest():MetadataRoute.Manifest{return{
 name:"MenujuKita Wedding Planner",short_name:"MenujuKita",description:"Wedding planning studio — Plan the journey. Enjoy the day.",
 start_url:"/",scope:"/",display:"standalone",orientation:"any",background_color:"#FAF8F4",theme_color:"#FAF8F4",
 categories:["lifestyle","productivity"],
 icons:[{src:"/icon-192.png",sizes:"192x192",type:"image/png",purpose:"any"},{src:"/app-icon.svg",sizes:"any",type:"image/svg+xml",purpose:"any"},{src:"/app-icon.svg",sizes:"any",type:"image/svg+xml",purpose:"maskable"}]
}}

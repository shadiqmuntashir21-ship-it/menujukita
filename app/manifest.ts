import type {MetadataRoute} from "next";
export default function manifest():MetadataRoute.Manifest{return{
 name:"MenujuKita",short_name:"MenujuKita",description:"Wedding planning studio — Plan the journey. Enjoy the day.",
 start_url:"/",scope:"/",display:"standalone",orientation:"any",background_color:"#FAF8F4",theme_color:"#33473E",
 categories:["lifestyle","productivity"],
 icons:[{src:"/icon-192.png",sizes:"192x192",type:"image/png",purpose:"any"},{src:"/icon-512.png",sizes:"512x512",type:"image/png",purpose:"any"},{src:"/icon-512.png",sizes:"512x512",type:"image/png",purpose:"maskable"}]
}}
const CACHE="menujukita-v4";
const CORE=["/","/demo","/offline","/icon.svg","/icon-192.png","/icon-512.png"];
self.addEventListener("install",event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(CORE)));self.skipWaiting()});
self.addEventListener("activate",event=>event.waitUntil(Promise.all([caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))),self.clients.claim()])));
self.addEventListener("fetch",event=>{
 const request=event.request;if(request.method!=="GET")return;const url=new URL(request.url);if(url.origin!==self.location.origin)return;
 if(request.mode==="navigate"){
  if(url.pathname==="/demo"){event.respondWith(fetch(request).then(response=>{const copy=response.clone();caches.open(CACHE).then(c=>c.put("/demo",copy));return response}).catch(()=>caches.match("/demo")));return}
  if(url.pathname.startsWith("/app")||url.pathname.startsWith("/admin")||url.pathname.startsWith("/auth")||url.pathname.startsWith("/onboarding")||url.pathname.startsWith("/license-status")||url.pathname.startsWith("/join/")){event.respondWith(fetch(request).catch(()=>caches.match("/offline")));return}
  event.respondWith(fetch(request).then(response=>{const copy=response.clone();caches.open(CACHE).then(c=>c.put(request,copy));return response}).catch(()=>caches.match(request).then(r=>r||caches.match("/offline"))));return
 }
 if(["script","style","font","image"].includes(request.destination)){event.respondWith(caches.match(request).then(cached=>cached||fetch(request).then(response=>{if(response.ok){const copy=response.clone();caches.open(CACHE).then(c=>c.put(request,copy))}return response})))}
});
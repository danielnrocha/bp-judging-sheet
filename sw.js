// Offline support: the app keeps opening without internet after the first visit.
const CACHE='bp-v5';
const SHELL=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./css/app.css','./js/axes.js','./js/boot.js','./js/consultas.js','./js/delib.js','./js/drag.js','./js/events.js','./js/flow.js','./js/home.js','./js/i18n-extra.js','./js/i18n.js','./js/lenses.js','./js/model.js','./js/pending.js','./js/poi.js','./js/results.js','./js/router.js','./js/save.js','./js/shortcuts.js','./js/state.js','./js/store.js','./js/tabby.js','./js/teams.js','./js/theme.js','./js/timer.js','./js/tour.js','./js/ui.js','./fonts/archivo-latin-standard-normal.woff2','./fonts/inter-latin-wght-normal.woff2'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET')return;
  const u=new URL(r.url);
  if(u.hostname.endsWith('supabase.co'))return; // data and auth always go to the network
  if(r.mode==='navigate'){
    e.respondWith(fetch(r).then(res=>{const cp=res.clone();caches.open(CACHE).then(c=>c.put('./index.html',cp));return res}).catch(()=>caches.match('./index.html')));
    return;
  }
  // The app's own code goes network-first too, so a deploy never mixes old and new modules.
  if(u.origin===self.location.origin&&/\.(js|css)$/.test(u.pathname)){
    e.respondWith(fetch(r).then(res=>{if(res&&res.ok){const cp=res.clone();caches.open(CACHE).then(c=>c.put(r,cp))}return res}).catch(()=>caches.match(r)));
    return;
  }
  e.respondWith(caches.match(r).then(hit=>{
    const net=fetch(r).then(res=>{if(res&&(res.ok||res.type==='opaque')){const cp=res.clone();caches.open(CACHE).then(c=>c.put(r,cp))}return res}).catch(()=>hit);
    return hit||net;
  }));
});

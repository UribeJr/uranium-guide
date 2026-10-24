/* Vercel Web Analytics + Speed Insights for a static site.
   The queue stubs are always defined so calls are no-ops when offline or on file://.
   The real scripts are only injected on http(s) (they 404 until the features are enabled in Vercel). */
(function(){
  window.va = window.va || function(){ (window.vaq = window.vaq || []).push(arguments); };
  window.si = window.si || function(){ (window.siq = window.siq || []).push(arguments); };
  var web = /^https?:$/.test(location.protocol) && !/^(localhost|127\.|0\.0\.0\.0)/.test(location.hostname);
  if(web && window.GUIDE_INSIGHTS){ /* set window.GUIDE_INSIGHTS=true after enabling Analytics/Speed Insights in Vercel */
    ['/_vercel/insights/script.js','/_vercel/speed-insights/script.js'].forEach(function(src){
      var s=document.createElement('script'); s.src=src; s.defer=true; document.head.appendChild(s);
    });
  }
  /* custom events: max 1 per name every 4s (2s for map/catch toggles), 40 per page load */
  var last={}, sent=0, GAP={caught_toggle:2000,map_lightbox:2000,chapter_jump:2000,professor_ask:3000};
  window.track=function(name,data){
    try{
      if(!web) return;
      var now=Date.now(), gap=GAP[name]||4000;
      if(sent>=40 || (last[name] && now-last[name]<gap)) return;
      last[name]=now; sent++;
      var d={}; if(data) for(var k in data){ var v=data[k]; if(v!=null) d[k]=typeof v==='number'||typeof v==='boolean'?v:String(v).slice(0,60); }
      window.va('event',{name:name,data:d});
    }catch(e){}
  };
})();

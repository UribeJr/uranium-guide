/* Flat binder cover intro (no 3D). Click / Enter opens the binder; reduced motion = instant fade. */
(function(){
const G=window.__guide; if(!G) return;
const S=G.state, gs=window.gsap;
const el=document.getElementById('intro'), flat=document.getElementById('introFlat');
const RM=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
let opened=false;
function landing(){ const p=S.page||0; G.gotoPage(p===0?1:p); }
function close(){ if(el.hidden) return; const fin=()=>{ el.hidden=true; el.style.opacity=''; G.annotateVisible&&G.annotateVisible(); };
  if(RM){ fin(); return; } el.style.transition='opacity .45s'; el.style.opacity=0; setTimeout(fin,470); }
function go(){ if(opened) return; opened=true; window.track&&track('intro_open',{mode:'flat'}); landing(); close(); }
function skip(){ window.track&&track('intro_skip'); S.intro=false; G.save(); document.querySelectorAll('input[data-set="intro"]').forEach(x=>x.checked=false); go(); }
document.getElementById('introSkip').addEventListener('click',e=>{e.stopPropagation(); skip();});
flat.addEventListener('click',go); flat.addEventListener('keydown',e=>{ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); go(); } });
document.addEventListener('keydown',e=>{ if(el.hidden) return; if(e.key==='Escape'){ e.stopPropagation(); go(); } },true);
function play(force){ if(!force && S.intro===false) return; opened=false; el.hidden=false; el.style.opacity=''; flat.focus&&flat.focus({preventScroll:true}); }
window.__intro={play};
play(false);
})();

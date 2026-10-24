/* Professor Bamb'o — AI help chat inside the PokéPod (uses /api/professor; needs the hosted site). */
(function(){
  var WEB = /^https?:$/.test(location.protocol);
  var log = []; // {who:'you'|'prof', text, sources, resting}
  var busy = false;
  var CHIPS = ['Next gym team?', 'What changed in 1.4.1?', 'Where do I catch ___?'];
  function esc(s){ return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];}); }
  function G(){ return window.__guide; }
  function progress(){
    var g=G(), S=(g&&g.state)||{}; var bd=S.badges||{}; var badges=(window.BADGES||[]).filter(function(b){return bd[b.id];}).length;
    var next=Math.min(badges+1,8);
    return { badges: badges, diff: (S.diff&&S.diff[next])||'Standard', page: S.page|0 };
  }

  // Original 16x16 pixel-art professor bust (not based on any official sprite).
  var OAK='img/prof/bambo.png'; // Bamb'o sprite sheet 81x155 (top half = face)
  function avatar(sz,cls){ return '<span class="'+(cls||'pav')+' bface" style="width:'+sz+'px;height:'+sz+'px;background-size:'+sz+'px '+Math.round(sz*155/81)+'px" aria-hidden="true"></span>'; }
  function fmt(t,sources){
    var max=(G()&&G().N)||960, am={}; (sources||[]).forEach(function(s){ if(s.a) am[s.p]=s.a; });
    return esc(t).replace(/\*\*(.+?)\*\*/g,'<b>$1</b>')
      .replace(/\[?\b[pP]\.\s?(\d{1,3})\]?/g,function(m,n){ n=+n; return n<max?'<a class="pcite" href="#" data-goto="'+n+'"'+(am[n]?' data-anchor="'+am[n]+'"':'')+' title="Jump to page '+n+'">p.'+n+'</a>':m; })
      .replace(/\n/g,'<br>');
  }
  function srcs(list){
    if(!list||!list.length) return '';
    return '<div class="psrc">'+list.map(function(s){return '<a class="pcite" href="#" data-goto="'+s.p+'"'+(s.a?' data-anchor="'+esc(s.a)+'"':'')+' title="'+esc(s.t)+'">p.'+s.p+'</a>';}).join(' ')+'</div>';
  }
  function bubbles(){
    if(!log.length) return '<div class="pmsg prof"><b>'+avatar(18)+'PROF.</b>Hello, trainer! Ask me anything this binder covers — routes, gyms, trainers, items or where to catch a Pokémon. I\'ll point you to the right page.</div>';
    return log.map(function(m){
      return '<div class="pmsg '+m.who+(m.resting?' resting':'')+'"><b>'+(m.who==='you'?'YOU':avatar(18)+'BAMB\'O')+'</b>'+(m.who==='you'?esc(m.text):fmt(m.text,m.sources))+(m.who==='prof'?srcs(m.sources):'')+'</div>';
    }).join('')+(busy?'<div class="pmsg prof typing"><b>'+avatar(18)+'PROF.</b><span class="dots"><i></i><i></i><i></i></span></div>':'');
  }
  function html(){
    if(!WEB) return '<div class="empty">PROF. BAMB&#39;O NEEDS<br>THE HOSTED BINDER</div><p class="gdisc">The AI help chat only works on the hosted site. Open the hosted binder to ask the Professor.</p>';
    var p=progress();
    return '<div class="prof"><div class="pfhead"><img class="bamfull" src="'+OAK+'" width="162" height="310" alt="Professor Bamb\'o"><div><b>PROFESSOR BAMB\'O</b><span>● LINKED TO FIELD BINDER DATA</span></div></div><div class="plog" id="plog" aria-live="polite">'+bubbles()+'</div>'+
      '<div class="pchips">'+CHIPS.map(function(c){return '<button type="button" class="pchip" data-pchip="'+esc(c)+'">'+esc(c)+'</button>';}).join('')+'</div>'+
      '<form class="pform" id="pform" autocomplete="off"><input id="pq" maxlength="300" placeholder="Ask Prof. Bamb&#39;o…" aria-label="Ask Professor Bamb\'o"'+(busy?' disabled':'')+'><button class="chk" type="submit"'+(busy?' disabled':'')+'>SEND</button></form>'+
      '<p class="pnote">'+p.badges+' BADGE'+(p.badges===1?'':'S')+' · GUIDE-ONLY ANSWERS · AI CAN ERR</p></div>';
  }
  function refresh(){ var b=document.getElementById('gbody'); if(!b||!b.querySelector('.prof')) return; b.innerHTML=html(); mount(); }
  function mount(){
    var l=document.getElementById('plog'); if(l) l.scrollTop=l.scrollHeight;
    var f=document.getElementById('pform'); if(!f) return;
    f.onsubmit=function(e){ e.preventDefault(); ask(document.getElementById('pq').value); };
  }
  function ask(q){
    q=String(q||'').trim(); if(!q||busy) return;
    if(q.indexOf('___')>=0){ var i=document.getElementById('pq'); if(i){ i.value=q.replace('___?',''); i.focus(); } return; }
    var p=progress(); log.push({who:'you',text:q}); busy=true; refresh();
    window.track&&track('professor_ask',{badges:p.badges,chip:CHIPS.indexOf(q)>=0,len:q.length});
    fetch('/api/professor',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({q:q,badges:p.badges,diff:p.diff,page:p.page})})
      .then(function(r){ return r.json().catch(function(){ return {ok:false,resting:true,answer:"Prof. Bamb'o is resting right now. Try again in a bit!"}; }); })
      .then(function(j){ log.push({who:'prof',text:j.answer||j.error||'Hmm, something went wrong.',sources:j.sources||[],resting:!!j.resting}); })
      .catch(function(){ log.push({who:'prof',text:"Prof. Bamb'o is resting (no connection). Try again in a bit!",sources:[],resting:true}); })
      .then(function(){ busy=false; if(log.length>40) log=log.slice(-40); refresh(); var i=document.getElementById('pq'); if(i&&!document.body.classList.contains('mobile')) i.focus(); });
  }
  document.addEventListener('click',function(e){
    var c=e.target.closest&&e.target.closest('[data-pchip]'); if(c){ e.preventDefault(); return ask(c.dataset.pchip); }
    var a=e.target.closest&&e.target.closest('.pcite'); if(a){ e.preventDefault(); if(document.body.classList.contains('mobile')) G().openGear(false); }
    if(e.target.closest&&e.target.closest('#profFab')){ e.preventDefault(); openProf(); }
    if(e.target.closest&&e.target.closest('#gearClose,#gearBtn')){ var gg=document.getElementById('gear'); if(gg&&gg.classList.contains('pforce')){ gg.classList.remove('pforce'); gg.style.transform=gg.style.visibility=gg.style.opacity=''; } }
  },true);
  var lastOpen=0;
  function gearShown(g){ if(!g||!g.classList.contains('open')) return false; var r=g.getBoundingClientRect(), cs=getComputedStyle(g);
    return cs.display!=='none'&&cs.visibility!=='hidden'&&+cs.opacity>0.05&&r.width>40&&r.left<innerWidth-40&&r.top<innerHeight-40&&r.bottom>40; }
  function openProf(){ var now=Date.now(); if(now-lastOpen<400) return; lastOpen=now;
    var gear=document.getElementById('gear'), g=G();
    try{ if(g&&g.openGear){ g.state.tab='prof'; try{g.save&&g.save();}catch(_){} g.openGear(true); g.renderGear&&g.renderGear(); } }catch(err){ window.console&&console.warn('Professor open failed, using fallback',err); }
    // Safe fallback: if the PokéGear did not open or is still off-screen, force it open with inline styles.
    setTimeout(function(){ if(!gear) return; if(!gearShown(gear)){ gear.classList.add('open','pforce'); gear.style.transform='none'; gear.style.visibility='visible'; gear.style.opacity='1';
        } var b=document.getElementById('gbody'); if(b&&!document.getElementById('pq')){ if(g&&g.state){ g.state.tab='prof'; } b.innerHTML=html(); b.classList.add('pchat'); mount(); var tb=document.querySelectorAll('.gtabs button'); for(var k=0;k<tb.length;k++) tb[k].classList.toggle('on',tb[k].getAttribute('data-tab')==='prof'); }
      var i=document.getElementById('pq'); if(i&&!document.body.classList.contains('mobile')) try{i.focus({preventScroll:true});}catch(_){ i.focus(); } },480);
    window.track&&track('professor_open',{});
  }
  var fillFab=function(){
    var f=document.getElementById('profFab'); if(!f||f.dataset.av) return; f.dataset.av=1;
    // Top-level fixed layer, last child of <body>, outside every transformed / 3D ancestor.
    var layer=document.getElementById('profLayer'); if(!layer){ layer=document.createElement('div'); layer.id='profLayer'; document.body.appendChild(layer); }
    layer.appendChild(f);
    f.innerHTML='<span class="face" aria-hidden="true"></span><span class="pftip" role="tooltip">Ask Prof. Bamb\'o</span>'; f.setAttribute('aria-label','Ask Professor Bamb\'o');
    // Direct binding on the button itself (pointerup + click, deduped), independent of document handlers.
    f.addEventListener('pointerup',function(e){ if(e.button===0||e.pointerType!=='mouse'){ openProf(); } });
    f.addEventListener('click',function(e){ e.preventDefault(); openProf(); });
  };
  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',fillFab):fillFab();
  if(!WEB){ var hideFab=function(){ var f=document.getElementById('profFab'); if(f) f.hidden=true; }; document.readyState==='loading'?document.addEventListener('DOMContentLoaded',hideFab):hideFab(); }
  window.Professor={html:html,mount:mount,ask:ask};
})();

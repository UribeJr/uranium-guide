/* Renderers for generated guide pages (Parts 2–40, gym spreads, contents).
   Used by the app AND by the build-time measuring step, so layout stays identical. */
(function(){
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const TBD='<span class="tbd">TBD</span>';
const img=(src,cls='',alt='')=>src?`<img src="${src}" alt="${esc(alt)}" loading="lazy" decoding="async" class="${cls}">`:`<div class="noimg ${cls}">NO IMAGE</div>`;
const lvTxt=lv=> lv==='scales' ? '<i>Lv. scales</i>' : lv ? `<i>Lv.${lv}</i>` : `<i>Lv.</i>${TBD}`;
function chip(m, alt){
  return `<div class="tm">${m.img&&m.img[0]?img(m.img[0]):''}<div><b>${esc(m.n.join(' / '))}</b>${m.x&&m.x.length?`<small>${esc(m.x.join(' · '))}</small>`:''}${lvTxt(m.lv)}</div></div>`;
}
const R={};
R.unit=function(u,part){
  switch(u.k){
  case 'sec': return `<div class="u u-sec"><span>${esc(u.title)}</span></div>`;
  case 'h3': return `<div class="u u-h3"><h3 class="bar">${esc(u.text)}</h3></div>`;
  case 'step': return u.ps.length
     ? `<div class="u u-step"><figure class="shot"><span class="n">${u.n}</span>${img(u.img,'',u.cap)}<figcaption>${esc(u.cap)}</figcaption></figure><div class="u-txt">${u.ps.map(p=>`<p>${p}</p>`).join('')}</div></div>`
     : `<div class="u u-step solo"><figure class="shot"><span class="n">${u.n}</span>${img(u.img,'',u.cap)}<figcaption>${esc(u.cap)}</figcaption></figure></div>`;
  case 'shot2': return `<div class="u cols">${[u.a,u.b].map(s=>`<figure class="shot"><span class="n">${s.n}</span>${img(s.img,'',s.cap)}<figcaption>${esc(s.cap)}</figcaption></figure>`).join('')}</div>`;
  case 'text': return `<div class="u u-text">${u.ps.map(p=>`<p>${p}</p>`).join('')}</div>`;
  case 'callout': return `<div class="u"><div class="box tip">${u.html}</div></div>`;
  case 'list': return `<div class="u"><${u.ordered?'ol':'ul'} class="u-list">${u.items.map(i=>`<li>${i}</li>`).join('')}</${u.ordered?'ol':'ul'}></div>`;
  case 'map': {
    const nl=(u.poi||[]).length+(u.exit||[]).length, ar=u.h/u.w;
    const tall= ar>0.8 || (nl>12 && ar>0.55), ratio=`${u.w}/${u.h}`;
    const W = tall ? Math.min(ar>1.6?290:320, Math.round(560*u.w/u.h)) : Math.min(500, Math.round(470*u.w/u.h));
    const leg=legend(u);
    return `<div class="u u-map ${tall?'tall':''}"><div class="map" data-full="${u.full||u.img}" style="aspect-ratio:${ratio};width:${W}px">${img(u.img,'',u.cap)}<span class="zoom">CLICK TO ENLARGE</span></div>${leg?`<div class="u-leg">${leg}</div>`:''}</div>`;
  }
  case 'legend': return `<div class="u u-leg box">${legend(u)}</div>`;
  case 'items': return `<div class="u u-items"><div class="u-hd">${esc(u.title)}</div><div class="igrid">${u.rows.map(r=>`<button class="icard" data-item="${r.id}" title="Mark as found">${r.img?img(r.img):''}<span class="nm">${r.name}${r.sub?`<small>${esc(r.sub)}</small>`:''}</span><span class="got"></span></button>`).join('')}</div></div>`;
  case 'wild': return `<div class="u u-wild"><div class="u-hd">${esc(u.title)}${u.label?` · <span>${esc(u.label)}</span>`:''}${u.mons.every(m=>m.lv)?`<em>Lv. · Rate</em>`:`<em>Rate / Lv. ${TBD}</em>`}</div><div class="wgrid">${u.mons.map(m=>`<div class="wcard"${m.src?` title="Lv./rate: ${esc(m.src.from)} – ${esc(m.src.page)}"`:''}>${m.img[0]?img(m.img[0]):''}<b>${esc(m.n.join(' / '))}</b>${m.x.length?`<small>${esc(m.x.join(' · '))}</small>`:''}${m.lv?`<small class="wlv">Lv. ${esc(String(m.lv))}${m.rate?` · ${esc(String(m.rate))}`:''}</small>`:''}<button class="ball" data-caught="${m.key}" title="Caught?"></button></div>`).join('')}</div></div>`;
  case 'trainer': return `<div class="u"><div class="tcard ${u.portrait?'':'np'}">${u.portrait?`<div class="por">${img(u.portrait,'',u.name)}</div>`:''}<div class="tb"><div class="tn"><span>${esc(u.name)}</span><button class="tdone" data-trainer="${u.id}" title="Mark defeated">WIN?</button></div>${u.notes.length?`<div class="tnote">${esc(u.notes.join(' · '))}</div>`:''}${u.prize?`<div class="tnote" title="${u.src?esc('Prize: '+u.src.from+' – '+u.src.page):''}">Prize: ${esc(u.prize)}</div>`:''}<div class="team">${u.team.map(m=>chip(m)).join('')}</div></div></div></div>`;
  case 'enc': return `<div class="u"><div class="box enc"><div class="u-hd small">${esc(u.title)}</div><div class="team">${u.team.map(m=>`<div class="tm">${m.img&&m.img[0]?img(m.img[0]):''}<div><b>${esc(m.n.join(' / '))}</b>${m.x.length?`<small>${esc(m.x.join(' · '))}</small>`:''}${m.lv?lvTxt(m.lv):''}</div><button class="ball sm" data-caught="${m.key}" title="Caught?"></button></div>`).join('')}</div>${u.notes.length?`<div class="tnote">${esc(u.notes.join(' · '))}</div>`:''}${u.prize?`<div class="tnote" title="${u.src?esc('Prize: '+u.src.from+' – '+u.src.page):''}">Prize: ${esc(u.prize)}</div>`:''}</div></div>`;
  case 'table': return `<div class="u"><table class="gt gen">${u.title?`<thead><tr><th colspan="9">${esc(u.title)}</th></tr></thead>`:''}<tbody>${u.rows.map(r=>r.sub?`<tr><td colspan="9" class="sub">${esc(r.sub)}</td></tr>`:`<tr>${r.cells.map(c=>`<td>${c.img.filter(Boolean).map(s=>img(s,'timg')).join('')}${c.h}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
  }
  return '';
};
function legend(u){
  const L=(rows)=>`<ul class="legend">${rows.map(r=>`<li>${r.ic?img(r.ic):'<span class="lt">•</span>'}<span>${esc(r.t)}</span></li>`).join('')}</ul>`;
  let h='';
  if(u.poi&&u.poi.length) h+=`<div><h3>Points of Interest</h3>${L(u.poi)}</div>`;
  if(u.exit&&u.exit.length) h+=`<div><h3>Exits</h3>${L(u.exit)}</div>`;
  return h;
}
R.opener=function(part,ch){
  return `<div class="phead opener"><div class="kicker">${esc(ch.name)} · Part ${part.n} of 13</div><h2>${esc(part.title)}</h2><div class="num">${part.n}</div></div>
  ${part.quick&&part.quick.length?`<div class="u quick"><h3 class="bar">Quick Guide</h3><ol class="steps">${part.quick.map(q=>`<li>${q}</li>`).join('')}</ol></div>`:''}`;
};
R.runhead=function(part,ch,secTitle){
  return `<div class="rhead"><span class="rp">PART ${part.n}</span><span class="rt">${esc(part.title)}</span>${secTitle?`<span class="rs">${esc(secTitle)}</span>`:''}</div>`;
};
R.folio=(n,label)=>`<div class="folio"><span>TANDOR FIELD BINDER · ${esc(label)}</span><b>${n}</b></div>`;
R.flowPage=function(desc,part,ch,pageNo){
  const first=part.units[desc.u[0]];
  const sec = first && part.sections[first.s] ? part.sections[first.s].title : '';
  if(!desc.u.length) return `<div class="pin-in gen">${R.opener(part,ch)}<div class="flow"><div class="u box warn">Part ${part.n} continues overleaf.</div></div>${R.folio(pageNo,'PART '+part.n)}</div>`;
  return `<div class="pin-in gen">${desc.open?R.opener(part,ch):R.runhead(part,ch,sec)}<div class="flow"${desc.z?` style="zoom:${desc.z}"`:''}>${desc.u.map(i=>R.unit(part.units[i],part)).join('')}</div>${R.folio(pageNo,'PART '+part.n)}</div>`;
};
/* gym spread */
R.gymLeft=function(g,ch,pageNo){
  const rew=g.sections.find(s=>/reward/i.test(s.title)), puz=g.sections.find(s=>/puzzle/i.test(s.title));
  return `<div class="pin-in gym gcol"><div class="phead"><div class="kicker">Gym ${g.no} of 8 · ${esc(g.badgeName)}</div><h2>${esc(g.leader)}</h2><div class="num">${g.no}</div></div>
   <div class="gymhero">${g.hero?img(g.hero,'',g.title):''}<div class="gtype">${esc(g.type)}</div></div>
   ${R.badgeCase(g)}
   <div class="gclamp">
   ${g.intro.slice(0,2).map(p=>`<p>${p}</p>`).join('')}
   ${rew?`<div class="box tip"><b>Rewards:</b> ${rew.paras.join(' ')}</div>`:''}
   ${puz&&puz.paras.length?`<div class="box warn puz"><div class="pt"><b>The puzzle:</b> ${puz.paras.join(' ')}</div><span class="more">→ Full step-by-step walkthrough in Part ${g.part}.</span></div>`:''}
   </div>
   ${R.folio(pageNo,'GYM '+g.no)}</div>`;
};
R.gymRight=function(g,ch,pageNo,diff){
  const t=g.teams.find(x=>x.diff===diff)||g.teams[0];
  const tips=g.sections.find(s=>/tips/i.test(s.title));
  return `<div class="pin-in gym gcol"><div class="phead"><div class="kicker">${esc(g.title)}</div><h2>Leader's Team</h2></div>
   <div class="diffs">${g.teams.map(x=>`<button data-gym="${g.no}" data-diff="${esc(x.diff)}" class="${x===t?'on':''}">${esc(x.diff)}</button>`).join('')}</div>
   <div class="gteam n${t.mons.length}">${t.mons.map(m=>`<div class="gmon">${m.img?img(m.img):''}<div class="gm"><b>${esc(m.name)}</b> <i>Lv.${m.lv||'TBD'}</i><div>${(m.type||'').split('/').map(x=>x.trim()).filter(Boolean).map(x=>`<span class="ty" style="background:${(window.TYPE_COLORS||{})[x]||'#777'}">${esc(x)}</span>`).join('')}</div>
     <small><b>Item:</b> ${esc(m.item||'TBD')} · <b>Ability:</b> ${esc(m.ability||'—')}</small><small><b>Moves:</b> ${esc(m.moves||'TBD')}</small></div></div>`).join('')}</div>
   ${g.prize?`<p class="credit" style="margin:6px 0 0">Prize money: <b>${esc(g.prize)}</b> (per pokemon-uranium.fandom.com)</p>`:''}
   ${g.note?`<div class="box warn" style="margin-top:10px;font-size:11.5px">${g.note}</div>`:''}
   <div class="gclamp gtips">${tips?`<h3 class="bar" style="margin-top:12px">${esc(tips.title)}</h3>${tips.paras.map(p=>`<p>${p}</p>`).join('')}`:''}</div>
   <p class="credit" style="margin:4px 0 0">Team &amp; tips: <a href="${g.url}" target="_blank" rel="noopener">${esc(g.url.replace('https://',''))}</a> · CC BY-SA 3.0</p>
   ${R.folio(pageNo,'GYM '+g.no)}</div>`;
};
R.badgeCase=function(g){
  const BS=window.BADGES||[], b=BS[g.no-1]; if(!b||!window.badgeSVG) return '';
  const ring=`<svg viewBox="0 0 100 100" aria-hidden="true"><defs><path id="stp${g.no}" d="M50,50 m-39,0 a39,39 0 1,1 78,0 a39,39 0 1,1 -78,0"/></defs>
    <circle cx="50" cy="50" r="47" fill="none" stroke="currentColor" stroke-width="3.2"/><circle cx="50" cy="50" r="32" fill="none" stroke="currentColor" stroke-width="1.6"/>
    <text fill="currentColor"><textPath href="#stp${g.no}">★ BADGE EARNED ★ GYM ${g.no} ★ ${esc(b.name.toUpperCase())} ★</textPath></text></svg>`;
  return `<div class="bcase" data-bcase="${b.id}" style="--bc:${b.color}"><div class="slot">${badgeSVG(b.id,54,'dim').replace('class="pxb"','class="pxb ghost"')}<span class="bfull">${badgeSVG(b.id,54)}</span><div class="stamp">${ring}</div></div>
    <div class="info"><b>${esc(b.name)}</b><small>Beat ${esc(g.leader)}, then stamp it into your case</small><button class="stampbtn" data-stamp="${b.id}">Stamp it in!</button>
    <div class="minis">${BS.map(x=>`<span data-mini="${x.id}" title="${esc(x.name)}">${badgeSVG(x.id,15,'dim')}<i>${badgeSVG(x.id,15)}</i></span>`).join('')}</div></div></div>`;
};
R.notePage=function(part,ch,pageNo){
  return `<div class="pin-in gen notes">${R.runhead(part,ch,'Trainer\'s Notes')}<div class="lined"><h3 class="bar">Trainer's Notes</h3><p class="credit">This page is left blank so the next spread opens flat. Jot your team, Exp. levels or catch plans here (print-friendly).</p></div>${R.folio(pageNo,'NOTES')}</div>`;
};
R.contents=function(B,pageNo){
  return `<div class="pin-in toc">${`<div class="phead"><div class="kicker">The complete walkthrough</div><h2>Contents</h2></div>`}
  <div class="toccols">${B.chapters.map(c=>`<div class="tch" style="--tc:${c.color}"><button class="tchh" data-goto="${c.page}">${esc(c.name)}<b>${c.page}</b></button>${c.parts.map(n=>{const p=B.parts[n];return `<button class="tpt" data-goto="${p.page}"><span>${n}</span>${esc(p.title)}<b>${p.page}</b></button>`}).join('')}${c.gym!=null?`<button class="tpt gymln" data-goto="${B.gyms[c.gym].page}"><span>★</span>${esc(B.gyms[c.gym].title)}<b>${B.gyms[c.gym].page}</b></button>`:''}</div>`).join('')}</div>
  ${R.folio(pageNo,'CONTENTS')}</div>`;
};
window.R=R;
})();

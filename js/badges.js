/* Pixel-art badge icons (12×12), drawn as crisp SVG rects. Placeholder fan art for the 8 Tandor badges (not the official badge designs). */
(function(){
const ART={
normal:["....kkkk....", "..kkaaaakk..", ".kaabbaaaak.", ".kabbaaaaak.", "kaabaaaaaack", "kaaaaaaaaack", "kaaaaaaaaack", "kaaaaaaaacck", ".kaaaaaacck.", ".kaaaaccck..", "..kkcccck...", "....kkkk...."],
brightgem:[".....kk.....", "....kbbk....", "...kbaaak...", "..kbaaaaak..", ".kbaaaaaaak.", "kbaaaaaaaack", ".kaaaaaaack.", "..kaaaaack..", "...kaaack...", "....kack....", ".....kk.....", "............"],
tide:["............", "...kkk......", "..kbbak.....", ".kbaaaak....", ".kaaaaaakk..", "kaaaacaaaak.", "kaaacckaaaak", "kaacck.kaack", "kacck...kack", ".kck.....kk.", "..k.........", "............"],
pixel:["kkkkkkkkkkkk", "kbbbaaaaaaak", "kbaaaaaaaaak", "kbaakkkkaaak", "kaaakbbkaaak", "kaaakbakaaak", "kaaakaakaaak", "kaaakkkkaaak", "kaaaaaaaaack", "kaaaaaaaacck", "kccccccccccc", "kkkkkkkkkkkk"],
salsa:[".....k......", "....kak.....", "....kaak....", "...kabak....", "..kaabaak...", "..kabbaak.k.", ".kaabbaaakak", "kaaabaaaaaak", "kaaaaaaaaack", ".kaaaaaaack.", "..kaccccak..", "...kkkkkk..."],
drama:["..kkkkkkkk..", ".kbbaaaaaak.", "kbaaaaaaaaak", "kaakkaakkaak", "kaaaaaaaaaak", "kaaaaaaaaaak", "kakaaaaaakak", "kaakkkkkkaak", ".kaaaaaaaak.", "..kaaaaaak..", "...kccccck..", "....kkkkk..."],
apex:[".....kk.....", "....kbak....", "....kbak....", "...kbaaak...", "...kbaaak...", "..kbaaaaak..", "..kbaaaaak..", ".kaaaaaaaak.", ".kaaaaaaacck", "kaaaaaaaccck", "kccccccccccc", "kkkkkkkkkkkk"],
zen:["....kkkk....", "..kkbbaakk..", ".kbbbbaaaak.", ".kbbbbaaaak.", "kbbbbbkaaaak", "kbbbbkkkaaak", "kbbbkkkkkaak", "kbbbbkkkaaak", ".kbbbbkaaak.", ".kbbbbaaaak.", "..kkbbaakk..", "....kkkk...."]
};
function mix(hex,t,to){ // t in 0..1 toward `to` (#fff or #000)
  const p=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16)); const a=p(hex), b=p(to);
  return '#'+a.map((v,i)=>Math.round(v+(b[i]-v)*t).toString(16).padStart(2,'0')).join('');
}
window.mixColor=mix; window.BADGE_ART=ART;
/* mode: 'color' (default), 'mono' (single ink color, for rubber stamps), 'ghost' (empty socket) */
window.badgeSVG=function(id,size,mode,ink){
  const b=(window.BADGES||[]).find(x=>x.id===id)||{color:'#888'}; const g=ART[id]; if(!g) return '';
  const c=b.color, pal = mode==='mono' ? {k:ink||c,a:ink||c,b:'none',c:ink||c,w:'none'}
    : mode==='dim' ? {k:'rgba(255,226,180,.42)',a:'rgba(255,226,180,.13)',b:'rgba(255,226,180,.2)',c:'rgba(255,226,180,.08)',w:'rgba(255,226,180,.1)'}
    : mode==='ghost' ? {k:'rgba(0,0,0,.35)',a:'rgba(0,0,0,.14)',b:'rgba(0,0,0,.1)',c:'rgba(0,0,0,.2)',w:'rgba(0,0,0,.05)'}
    : {k:'#1d1a16',a:c,b:mix(c,.55,'#ffffff'),c:mix(c,.35,'#000000'),w:'#ffffff'};
  let r='';
  g.forEach((row,y)=>[...row].forEach((ch,x)=>{ const f=pal[ch]; if(f&&f!=='none') r+=`<rect x="${x}" y="${y}" width="1.02" height="1.02" fill="${f}"/>`; }));
  return `<svg class="pxb" viewBox="0 0 12 12" width="${size}" height="${size}" shape-rendering="crispEdges" aria-hidden="true">${r}</svg>`;
};
})();

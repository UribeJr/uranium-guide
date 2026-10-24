/* Hand-made pages: binder cover (page 0) and a how-to page. Everything else is generated from data/pN.js. */
(function(){
const folio=(n,label)=>`<div class="folio"><span>TANDOR FIELD BINDER · ${label}</span><b>${n}</b></div>`;
window.SECTIONS=[{ id:'intro', short:'INTRO', name:'Intro', color:'#2f6b1a', loc:'p2s0' }];
window.PAGES=[
{ sec:'intro', cover:true, html:()=>`<div class="cv bcv">
  <div class="band hazard top"></div><div class="band hazard bot"></div>
  <div class="label"><small>TANDOR REGION · FILE 01</small><h1>POKéMON <span>URANIUM</span><br>FIELD BINDER</h1>
   <p>An interactive walkthrough, PokéPod map and patch log for the Tandor region.</p></div>
  <div class="stamp s1">CONTAINMENT LEVEL 4</div>
  <div class="window">&gt; DOSIMETER: <b>NOMINAL</b><br>&gt; DATA: wiki sync ${(window.BOOK&&BOOK.patch)||'1.4.1'}<br>&gt; FILES: ${(window.BOOK&&BOOK.pages.length)||''} PAGES<br>&gt; TURN THE PAGE ▮</div>
  <img class="tref" src="img/trefoil.svg" alt="" width="120" height="120">
 </div>`},
{ sec:'intro', html:()=>`<div class="pin-in"><div class="phead"><div class="kicker">Before you start</div><h2>How this binder works</h2></div>
  <ul class="u-list">
   <li><b>Walkthrough:</b> 12 parts following the wiki's Game Walkthrough, rewritten as short steps, plus a postgame chapter from the 2026 patch notes.</li>
   <li><b>Gym files:</b> each of the eight Tandor gyms gets a two-page spread with the leader's team and rewards.</li>
   <li><b>PokéPod</b> (top right, or press G): wild Pokémon, items and trainers for the area you're reading. Tick what you've caught, found and beaten; it's saved in this browser only.</li>
   <li><b>Patch notes:</b> boxes marked <b>PATCH</b> come from the official 2026 patch notes. Anything the notes leave vague is tagged <span class="unv">unverified</span>.</li>
   <li><b>Prof. Bamb'o</b> (bottom right) answers questions using this binder's data.</li>
  </ul>
  <div class="box tip"><b>Version:</b> written for Pokémon Uranium 1.4.1 (October 2026). Area pages last edited before 1.4.0 may be out of date; see the credits.</div>
  ${folio(2,'HOW TO USE')}</div>`}
];
})();

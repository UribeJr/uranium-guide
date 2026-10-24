"""v11 paginator: flows every Part's units into spread pages by MEASURED height, in the real app CSS
(the spread is a pure transform scale, so page layout is identical at every viewport and text size).
Writes data/book.js (pages, chapter/part/gym page numbers, per-page anchors, v10->v11 remap).
usage: python3 tools/v11paginate.py http://localhost:5177"""
import sys,json,asyncio,re
from playwright.async_api import async_playwright
BASE=sys.argv[1]; G='/workspace/uranium-guide/app'; GAP=8
src=open(G+'/data/book.js').read(); B=json.loads(src[len('window.BOOK='):].rstrip().rstrip(';'))
FIT="""async([html,color])=>{
 let m=document.getElementById('v11m');
 if(!m){ m=document.createElement('div'); m.id='v11m'; m.className='leaf'; m.style.cssText='visibility:hidden;z-index:-5;pointer-events:none;transform:none';
   m.innerHTML='<div class="face front"><div class="page"></div></div>'; document.getElementById('book').appendChild(m); }
 const p=m.querySelector('.page'); p.style.setProperty('--sec',color); p.innerHTML=html.replace(/loading="lazy"/g,'');
 const imgs=[...p.querySelectorAll('img')].filter(i=>!i.complete);
 await Promise.race([Promise.all(imgs.map(i=>new Promise(r=>{i.onload=i.onerror=r}))),new Promise(r=>setTimeout(r,6000))]);
 const pr=p.getBoundingClientRect(), f=p.querySelector('.pin-in > .folio'), lim=f.getBoundingClientRect().top-%d;
 let bot=0, right=0;
 for(const e of p.querySelectorAll('.pin-in *')){ if(e.closest('.folio')) continue; const r=e.getBoundingClientRect(); if(!r.width||!r.height) continue;
   bot=Math.max(bot,r.bottom); right=Math.max(right,r.right); }
 const fl=p.querySelector('.flow'); const fh=fl?fl.getBoundingClientRect().height:0, ft=fl?fl.getBoundingClientRect().top:0;
 return {ok: bot<=lim && right<=pr.right+1, over: bot-lim, avail: lim-ft, fh};
}"""%GAP
async def main():
  async with async_playwright() as pw:
    b=await pw.chromium.launch(); c=await b.new_context(viewport={'width':1440,'height':900}); pg=await c.new_page()
    await pg.goto(BASE+'/'); await pg.evaluate("()=>localStorage.setItem('uranium-guide-v1',JSON.stringify({intro:false,page:1,view:'page'}))")
    await pg.reload(); await pg.wait_for_function("window.__guide&&window.R&&document.querySelector('#book .leaf')"); await pg.wait_for_timeout(1500)
    await pg.evaluate("document.fonts.ready")
    PD=await pg.evaluate("()=>{const o={};for(const k in window.PD) o[k]={n:PD[k].n,units:PD[k].units.map(u=>({k:u.k,s:u.s}))};return o}")
    old=B['pages']; pages=[p for p in old if p['t']!='f']
    CH=B['chapters']; chap_of={n:ci for ci,c in enumerate(CH) for n in c['parts']}
    chpage={}; gympage={}; big=[]
    async def fits(n,desc,ci,pno):
      html=await pg.evaluate("([d,n,ci,pno])=>R.flowPage(d,PD[n],BOOK.chapters[ci],pno)",[desc,n,ci,pno])
      return await pg.evaluate(FIT,[html,CH[ci]['color']])
    for n in range(1,14):
      units=PD[str(n)]['units']; ci=chap_of[n]
      if ci not in chpage: chpage[ci]=len(pages)
      B['parts'][str(n)]['page']=len(pages)
      opened=True; cur=[]; i=0
      def emit(u,op,z=None):
        first=units[u[0]] if u else units[0]
        d={'t':'f','p':n,'u':u,'open':op,'c':ci,'loc':f"p{n}s{first['s']}",'a':f"p{n}u{u[0] if u else 0}"}
        if z: d['z']=z
        pages.append(d)
      while i<len(units):
        r=await fits(n,{'u':cur+[i],'open':opened},ci,len(pages))
        if r['ok']: cur.append(i); i+=1; continue
        if not cur:
          if opened:  # opener page can't hold even the first unit
            emit([],True); opened=False; continue
          # a single unit taller than a page: give it its own page, shrunk to fit
          z=round(max(.6,min(1,(r['avail'])/(r['fh'] or 1)))-.005,3); big.append((n,i,round(r['over']),z))
          emit([i],False,z); i+=1; continue
        moved=[]
        while len(cur)>1 and units[cur[-1]]['k'] in('sec','h3'): moved.insert(0,cur.pop())
        emit(cur,opened); opened=False; cur=moved
      if cur or opened: emit(cur,opened)
      print('part',n,'->',len(pages),flush=True)
      for gi,g in enumerate(B['gyms']):
        if g['part']==n:
          if len(pages)%2==0: pages.append({'t':'note','p':n,'c':ci})
          gympage[gi]=len(pages); pages.append({'t':'gl','g':gi,'c':ci}); pages.append({'t':'gr','g':gi,'c':ci})
    pages.append({'t':'end','c':len(CH)-1})
    for ci,cc in enumerate(CH): cc['page']=1 if ci==0 else chpage[ci]
    for gi,g in enumerate(B['gyms']): g['page']=gympage[gi]
    B['pages']=pages; B['ver']=1; B['remap']={}
    open(G+'/data/book.js','w').write('window.BOOK='+json.dumps(B,ensure_ascii=False,separators=(',',':'))+';')
    print('pages',len(pages),'(was',len(old),') oversize units',big)
    print('chapters',[c['page'] for c in CH],'gyms',[g['page'] for g in B['gyms']])
    await b.close()
asyncio.run(main())

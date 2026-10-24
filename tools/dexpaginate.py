"""Paginate the Pokédex appendix by MEASURED height (same measuring leaf as paginate.py) and insert it before the credits page.
usage: python3 tools/dexpaginate.py http://localhost:5188"""
import sys,json,asyncio
from playwright.async_api import async_playwright
BASE=sys.argv[1]; G='/workspace/uranium-guide/app'; GAP=8
src=open(G+'/data/book.js').read(); B=json.loads(src[len('window.BOOK='):].rstrip().rstrip(';'))
FIT="""async([html,color])=>{
 let m=document.getElementById('v11m');
 if(!m){ m=document.createElement('div'); m.id='v11m'; m.className='leaf'; m.style.cssText='visibility:hidden;z-index:-5;pointer-events:none;transform:none';
   m.innerHTML='<div class="face front"><div class="page"></div></div>'; document.getElementById('book').appendChild(m); }
 const p=m.querySelector('.page'); p.style.setProperty('--sec',color); p.className='page dexp'; p.innerHTML=html;
 const pr=p.getBoundingClientRect(), f=p.querySelector('.pin-in > .folio'), lim=f.getBoundingClientRect().top-%d;
 let bot=0, right=0;
 for(const e of p.querySelectorAll('.pin-in *')){ if(e.closest('.folio')) continue; const r=e.getBoundingClientRect(); if(!r.width||!r.height) continue;
   bot=Math.max(bot,r.bottom); right=Math.max(right,r.right); }
 return {ok: bot<=lim && right<=pr.right+1};
}"""%GAP
COLOR='#2f6b1a'
async def main():
  pages=[p for p in B['pages'] if p['t']!='dex']
  CH=[c for c in B['chapters'] if c['name']!='Pokédex']
  ci=len(CH); CH.append({'name':'Pokédex','parts':[],'color':COLOR,'gym':None,'page':0})
  B['chapters']=CH
  end=pages.pop()  # credits
  async with async_playwright() as pw:
    b=await pw.chromium.launch(); c=await b.new_context(viewport={'width':1440,'height':900}); pg=await c.new_page()
    await pg.goto(BASE+'/'); await pg.evaluate("()=>localStorage.setItem('uranium-guide-v1',JSON.stringify({intro:false,page:1,view:'page'}))")
    await pg.reload(); await pg.wait_for_function("window.__guide&&window.R&&window.DEX&&document.querySelector('#book .leaf')"); await pg.wait_for_timeout(1200)
    await pg.evaluate("document.fonts.ready")
    n=await pg.evaluate("DEX.length")
    if len(pages)%2==1: pages.append({'t':'note','p':13,'c':ci-1})  # open the dex on a left page (spread start)
    CH[ci]['page']=len(pages); a=0; opened=True
    while a<n:
      bb=a+1
      while bb<=n:
        r=await pg.evaluate(FIT,[await pg.evaluate("([a,b,o,i])=>R.dexPage({a,b,open:o},i)",[a,bb,opened,len(pages)]),COLOR])
        if not r['ok']: break
        bb+=1
      bb=max(a+1,bb-1)
      pages.append({'t':'dex','a':a,'b':bb,'open':opened,'c':ci}); a=bb; opened=False
    await b.close()
  pages.append(end)
  B['pages']=pages; B['ver']=2; B['remap']={}
  open(G+'/data/book.js','w').write('window.BOOK='+json.dumps(B,ensure_ascii=False,separators=(',',':'))+';')
  dp=[p for p in pages if p['t']=='dex']
  print('dex pages',len(dp),'first',CH[ci]['page'],'per page',[p['b']-p['a'] for p in dp],'total pages',len(pages),'credits at',len(pages)-1)
asyncio.run(main())

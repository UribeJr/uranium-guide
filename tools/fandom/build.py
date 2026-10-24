"""Build data/book.js + data/pN.js from cached Fandom wikitext (untrusted data: parsed as text, never executed).
Facts only (names, levels, rates, prizes, moves); walkthrough prose is our own rewrite (prose.py).
Patch corrections (patch_overrides.json) are applied LAST, each with a citation."""
import json,re,os,html,datetime
from prose import P
H=os.path.dirname(os.path.abspath(__file__)); APP=os.path.abspath(H+'/../..')
WIKI='https://pokemon-uranium.fandom.com/wiki/'
def page(t):
  f=H+'/cache/'+t.replace(' ','_')+'.json'
  return json.load(open(f)) if os.path.exists(f) else None
def url(t): return WIKI+t.replace(' ','_')
def clean(s):
  s=re.sub(r'<ref[^>]*?/>|<ref.*?</ref>','',s,flags=re.S); s=re.sub(r'<[^>]+>','',s)
  s=re.sub(r'\[\[(?:[^|\]]*\|)?([^\]]*)\]\]',r'\1',s); s=re.sub(r"'''?",'',s); s=re.sub(r'\{\{P\$\}\}','₽',s)
  s=re.sub(r'\{\{[^{}]*\}\}','',s); return html.unescape(s).strip()
def templates(w,name):
  out=[]; low=w.lower(); key='{{'+name.lower(); i=0
  while True:
    i=low.find(key,i)
    if i<0: return out
    nx=low[i+len(key):i+len(key)+1]
    if nx not in '|}\n ': i+=1; continue
    d=0; j=i
    while j<len(w):
      if w.startswith('{{',j): d+=1; j+=2
      elif w.startswith('}}',j):
        d-=1; j+=2
        if d==0: break
      else: j+=1
    out.append((i,w[i+2:j-2])); i=j
def split(body):
  parts=[]; d=0; cur=''; k=0
  while k<len(body):
    if body.startswith('{{',k) or body.startswith('[[',k): d+=1; cur+=body[k:k+2]; k+=2; continue
    if body.startswith('}}',k) or body.startswith(']]',k): d-=1; cur+=body[k:k+2]; k+=2; continue
    c=body[k]
    if c=='|' and d==0: parts.append(cur); cur=''
    else: cur+=c
    k+=1
  parts.append(cur); return parts[1:]
def kv(parts):
  pos=[]; named={}
  for p in parts:
    m=re.match(r'\s*([\w ]+?)\s*=(.*)$',p,re.S)
    if m: named[m.group(1).strip().lower()]=m.group(2).strip()
    else: pos.append(p.strip())
  return pos,named
def slug(s): return re.sub(r'[^a-z0-9]+','-',s.lower()).strip('-')

def wild(w):
  rows=[]
  for _,b in templates(w,'catch/entry'):
    pos,n=kv(split(b))
    if len(pos)<4: continue
    nd,mon,meth,lv=pos[:4]; mon=clean(mon)
    rate=n.get('all') or next((n[k] for k in ('day','morning','night') if k in n),'')
    rows.append(dict(key=slug(mon),name=mon,label=clean(meth),lv=clean(lv),rate=clean(rate),
      x=[t for t in (n.get('type1',''),n.get('type2','')) if t]))
  return rows
def items(w,lid):
  out=[]; seen={}
  for _,b in templates(w,'ItemList'):
    pos,_n=kv(split(b))
    if not pos: continue
    nm=clean(pos[0]); wh=clean(pos[1]) if len(pos)>1 else ''
    k=slug(nm); seen[k]=seen.get(k,0)+1
    tags=[t for t,rx in (('hidden',r'hidden'),('needs Surf',r'\bsurf'),('needs Strength',r'strength'),('needs Rock Smash',r'rock smash'),('needs Dive',r'\bdive'),('needs Cut',r'\bcut\b'),('gift',r'\bgives?\b|\breward')) if re.search(rx,wh,re.I)]
    out.append(dict(id=f"{lid}-{k}-{seen[k]}",name=nm,where=', '.join(tags),hidden='hidden' in tags,gift='gift' in tags,req=''))
  return out
def trainers(w,lid):
  out=[]
  for _,b in templates(w,'Trainer/entry'):
    p=[x.strip() for x in split(b)]
    if len(p)<5: continue
    cls,name,prize=clean(p[1]),clean(p[2]),clean(p[3]); mons=[]; r=p[5:]
    for i in range(0,len(r)-4,5):
      mons.append(dict(n=[clean(r[i+1])],lv=clean(r[i+3])))
    out.append(dict(id=f"{lid}-{slug(cls+' '+name)}",cls=cls,name=f"{cls} {name}".strip(),prize=('₽'+prize) if prize.isdigit() else prize,team=mons))
  for _,b in templates(w,'Party/Single'):
    t=party(w,b)
    if t: out.append(dict(id=f"{lid}-{slug(t['name'])}-{len(out)}",cls=t['cls'],name=t['name'],prize=t['prize'],team=[dict(n=[m['name']],lv=m['lv']) for m in t['mons']],loc=t['loc']))
  return out
def party(w,body):
  pos,n=kv(split(body)); i=w.find(body)+len(body)
  end=w.find('{{Party/Footer',i); seg=w[i:end if end>0 else i+6000]
  mons=[]
  for _,mb in templates(seg,'Pokémon'):
    _p,m=kv(split(mb)); nm=clean(m.get('pokemon',''))
    if not nm: continue
    mons.append(dict(name=nm,lv=clean(m.get('level','')),type='/'.join(t for t in (m.get('type1',''),m.get('type2','')) if t),
      item=clean(m.get('held','')) or 'None',ability=clean(m.get('ability','')),
      moves=' / '.join(clean(m.get(f'move{k}','')) for k in range(1,5) if clean(m.get(f'move{k}',''))),weak=''))
  return dict(cls=clean(n.get('class','')),name=clean(n.get('name','')),loc=clean(n.get('location','')),prize=clean(n.get('prize','')),mons=mons)

LOCS=json.load(open(H+'/locations.json'))
STALE_CUT='2026-10-10'; stale=[]; sources=[]
def src(t):
  p=page(t)
  if p: sources.append(dict(title=t,url=url(t),revid=p.get('revid'),ts=p.get('timestamp')))
  if p and (p.get('timestamp') or '')[:10]<STALE_CUT: stale.append((t,p.get('timestamp','')[:10]))
  return p

GYMS=[(1,'Nowtoch City Gym','Maria','Nowtoch City'),(2,'Burole Town Gym','Davern','Burole Town'),(3,'Bealbeach City Gym','Cali','Bealbeach City'),
 (4,'Vinoville Town Gym','Sheldon','Vinoville Town'),(5,'Amatree Town Gym','Tiko','Amatree Town'),(6,'Venesi City Gym','Rosalind','Venesi City'),
 (7,'Snowbank Town Gym','Vaeryn','Snowbank Town'),(8,'Tsukinami Village Gym','Hinata & Kaito','Tsukinami Village')]
GYM_TIPS={1:"Maria's team is all Normal-type; a Fighting-type such as Mankey (Route 2) hits everything for super-effective damage.",
 2:"Davern mixes Rock, Ground and Poison. Water and Grass moves cover most of the team; watch for Ground moves against Electric starters.",
 3:"Cali splits Water and Grass. Electric handles the Water half, Fire/Flying/Bug the Grass half.",
 4:"Sheldon combines Psychic and Steel. Fire and Ground hit Steel; Dark and Ghost hit Psychic.",
 5:"Tiko uses Fire. Bring Water, Rock or Ground. Surf arrives only after this gym, so plan a Water-type early.",
 6:"Rosalind blends Psychic, Ghost and Fairy. Dark and Ghost moves and a Steel-type answer most of it.",
 7:"Vaeryn uses Dragon and Ice, including a Mega Ampharos. Steel, Fighting and Rock moves cover Ice; Fairy and Ice cover Dragon.",
 8:"Two leaders back to back: Hinata's day-themed team and Kaito's night-themed team. Heal between battles."}
PUZ={1:"No puzzle: get Maria's house key from the man at the door, use it on her house in the far south-east, then follow her back.",
 2:"Smash rocks in the cave until you uncover the Bright Gem; it opens the way to Davern.",
 3:"A short path down the stairs to Cali.",
 4:"Press each switch to reveal a light path briefly, then walk it from memory.",
 5:"Push the boulders onto the floor switches. Tiko must be rescued from Deeper Anthell first.",
 6:"A slippery floor with trap doors, and a decoy leader before the real Rosalind.",
 7:"Five trials with Theo; failing any one resets all five. Items are banned in the last battle.",
 8:"Balance the black and white floor tiles in each room. Re-enter the room if the counter bar doesn't show."}
def gyms(type_of):
  out=[]
  for no,gp,leader,city in GYMS:
    p=src(gp); w=p['wikitext']; teams=[]
    rew=[kv(split(b))[1] for _,b in templates(w,'GymReward')]
    for _,b in templates(w,'Party/Single'):
      t=party(w,b)
      if not ('gym' in t['loc'].lower() or t['loc']==city) or t['cls'].lower()!='leader': continue
      nm=re.sub(r'^Gym Leader\s+','',t['name'])
      if any(x['who']==nm for x in teams): continue
      teams.append(dict(diff=nm if no==8 else 'Standard',who=nm,mons=t['mons'],prize=t['prize']))
      if no!=8: break
    badge=(rew[0].get('badge','') if rew else '')
    bname=badge+' Badge' if badge and 'badge' not in badge.lower() else badge
    tms=', '.join(f"{r.get('tm','')} {r.get('move','')}".strip() for r in rew)
    out.append(dict(no=no,slug=slug(gp),leader=leader,badgeName=bname,type=type_of[no],part=next(k for k,v in P.items() if v['gym']==no),
      title=f"{gp} ({leader})",url=url(gp),hero='',intro=[f"{leader} is the {['','first','second','third','fourth','fifth','sixth','seventh','eighth'][no]} Tandor gym leader, in {city}."],
      sections=[dict(title='Rewards',paras=[f"{bname} · {tms}" + (f" · prize {teams[0]['prize']}" if teams and teams[0]['prize'] else '')]),
                dict(title='Gym puzzle',paras=[PUZ[no]]),dict(title='Tips',paras=[GYM_TIPS[no]])],
      teams=[dict(diff=t['diff'],mons=t['mons']) for t in teams],note='',prize=teams[0]['prize'] if teams else '',page=0))
    src(leader.split(' & ')[0]) if no!=8 else None
  return out
TYPES={1:'Normal',2:'Rock / Ground / Poison',3:'Water / Grass',4:'Psychic / Steel',5:'Fire',6:'Psychic / Ghost / Fairy',7:'Dragon / Ice',8:'Day / Night themes'}

pn=src('2026_Patch_Notes'); PATCH=json.load(open(H+'/patch_overrides.json'))
PURL=PATCH['source']+f" (rev {pn['revid']})"
src('Game_Walkthrough')
PD={}; locs=[]
def mkpart(n,spec):
  units=[]; sections=[]
  def sec(title): sections.append(dict(title=title)); units.append(dict(k='sec',title=title,s=len(sections)-1))
  for lt,head,steps in spec['locs']:
    sec(head); s=len(sections)-1; lid=f"p{n}s{s}"
    units.append(dict(k='list',ordered=False,items=steps,s=s))
    L=dict(id=lid,name=head,part=n,wild=[],items=[],trainers=[])
    if lt:
      p=src(lt)
      if p:
        w=p['wikitext']; wr=wild(w); it=items(w,lid); tr=trainers(w,lid)
        if wr:
          groups={}
          for r in wr: groups.setdefault(r['label'],[]).append(r)
          for lab,rs in groups.items():
            units.append(dict(k='wild',title='Wild Pokémon',label=lab,s=s,mons=[dict(key=r['key'],n=[r['name']],x=r['x'],lv=r['lv'],rate=r['rate'],img=[]) for r in rs]))
            L['wild']+= [dict(key=r['key'],name=r['name'],label=lab,lv=r['lv'],rate=r['rate'],img='') for r in rs]
        if it:
          units.append(dict(k='items',title='Items',s=s,rows=[dict(id=i['id'],name=html.escape(i['name']),sub=i['where']) for i in it]))
          L['items']=it
        for t in tr[:14]:
          units.append(dict(k='trainer',id=t['id'],name=t['name'],notes=[],prize=t['prize'],s=s,team=[dict(n=m['n'],x=[],lv=m['lv'],img=[]) for m in t['team']]))
        L['trainers']=[dict(id=t['id'],name=t['name'],team=', '.join(f"{m['n'][0]} {m['lv']}" for m in t['team']),prize=t['prize']) for t in tr]
        units.append(dict(k='text',s=s,ps=[f'<span class="srcl">Source: <a href="{url(lt)}" target="_blank" rel="noopener">{lt}</a> (Fandom, rev {p["revid"]})</span>']))
    locs.append(L)
  return dict(n=n,title=spec['title'],url=url('Game_Walkthrough'),quick=spec['quick'],sections=sections,units=units)
for n,spec in P.items(): PD[n]=mkpart(n,spec)

# postgame chapter from the patch notes (part 13)
PG=dict(n=13,title='Postgame & Patch 1.4.x',url=PATCH['source'],quick=['Version 1.4.0 (10 Oct 2026) adds a postgame with three questlines','Start with the Angelure Pirate Quest','Six legendaries become obtainable and 11 new Megas arrive'],sections=[],units=[])
def pgsec(t): PG['sections'].append(dict(title=t)); PG['units'].append(dict(k='sec',title=t,s=len(PG['sections'])-1)); return len(PG['sections'])-1
s=pgsec('What 1.4.0 added')
PG['units'].append(dict(k='list',s=s,items=['A postgame with <b>three questlines</b>; the first is the <b>Angelure Pirate Quest</b>.',
 '<b>Six legendary Pokémon</b> become obtainable. The notes don\'t name them <span class="unv">unverified</span>.',
 '<b>11 new Mega Evolutions</b> (not listed individually) <span class="unv">unverified</span>.',
 '<b>200 Triple Triad cards</b> to collect.','Most egg moves and items are now obtainable.',
 'Level-up moves added: Navighast Sacred Sword (Lv 66), Titanice Heavy Slam (54), Jerbolta Boomburst (53), Splendifowl Heat Wave (54), Garlikid Wood Hammer (67).',
 'Minyan can hold Black Sludge; Quick Powder and Metal Powder work on Duplicat; Tikiki gives 1 Atk EV and Frikitiki 2.']))
s=pgsec('Starting the postgame')
PG['units'].append(dict(k='list',s=s,items=['Become Champion first; the questlines open after the classic endgame.',
 'Where exactly the Angelure Pirate Quest starts is not stated in the notes <span class="unv">unverified</span>. A 1.4.0c fix mentions a red-haired pirate near the <b>Cove</b> entrance who resets the legendary quest if it bugs out.',
 'This binder does not invent quest steps, Pokémon names or locations the notes leave out.']))
s=pgsec('Fixes in 1.4.0b – 1.4.1')
PG['units'].append(dict(k='list',s=s,items=['1.4.0b: Exp All pickup on Route 4 fixed; Larkspur lab door clarified; an item ball in the south-western Shattered Sea moved; Hidden Grotto Buizel has Soak; Actan Triple Triad card fixed.',
 'Stealth update: Leviathao, Aotius and Mutios level-up order changed; Ranger Mission 6 (Floatzel) fixed; a watery-puzzle softlock fixed.',
 '1.4.0c: a new Mega\'s HP stat fixed; Route 10 waterfall softlock fixed; superboss double battle fixed; legendary-quest reset via the red-haired pirate; a two-Empirilla bug fixed; item prices tweaked.',
 '1.4.1: Exp All double-KO bug fixed; stuck stairs/waterfalls fixed; Baykal Valley cutscenes improved; postgame graphics made easier to read.']))
PG['units'].append(dict(k='text',s=s,ps=[f'<span class="srcl">Source: <a href="{PATCH["source"]}" target="_blank" rel="noopener">2026 Patch Notes</a> (Fandom, rev {pn["revid"]})</span>']))
PD[13]=PG

# ---- apply patch overrides LAST ----
applied=[]
for o in PATCH['items']:
  if o.get('global'): continue
  part=PD[o['part']]; cite=f' <a class="cite" href="{PATCH["source"]}" target="_blank" rel="noopener">[{o["ver"]} patch notes]</a>'+(' <span class="unv">unverified</span>' if o['status']=='unverified' else '')
  co=dict(k='callout',html=f'<b>PATCH {o["ver"]}:</b> {o["text"]}{cite}')
  if o.get('loc'):
    si=next((i for i,x in enumerate(part['sections']) if x['title']==o['loc'] or o['loc'] in x['title']),None)
    if si is None: si=len(part['sections'])-1
    co['s']=si; idx=max(i for i,u in enumerate(part['units']) if u['s']==si)
    part['units'].insert(idx+1 if part['units'][idx]['k']!='text' else idx,co)
    if o.get('item'):
      L=next(l for l in locs if l['id']==f"p{o['part']}s{si}")
      L['items'].append(dict(id=f"{L['id']}-{slug(o['item'])}-patch",name=o['item']+' (1.4.0)',where='patch',hidden=False,gift=False,req=''))
  else:
    co['s']=0; part['units'].insert(2 if len(part['units'])>1 else 1,co)
  applied.append(o['id'])
PD[2]['units'].insert(0,dict(k='callout',s=0,html=f'<b>Prices may be stale:</b> 1.4.0c tweaked item prices, so wiki shop prices may be out of date. <a class="cite" href="{PATCH["source"]}" target="_blank" rel="noopener">[patch notes]</a>'))
locs.append(dict(id='p13s0',name='Postgame',part=13,wild=[],items=[],trainers=[]))

CHS=[('Moki Town',[1,2],'#2f6b1a',0),('Burole',[3],'#7a5a2b',1),('Bealbeach',[4],'#2b6f8a',2),('Vinoville',[5],'#6a4c93',3),
 ('Amatree',[6],'#a8291f',4),('Venesi',[7],'#8a3d6b',5),('Snowbank',[8],'#3f7f9e',6),('Tsukinami',[9],'#3b3f5c',7),('League',[10],'#7a6a14',None),('Postgame',[11,12,13],'#151815',None)]
G=gyms(TYPES)
book=dict(chapters=[dict(name=a,parts=b,color=c,gym=d,page=0) for a,b,c,d in CHS],
  parts={str(n):dict(n=n,title=PD[n]['title'],page=0) for n in PD},pages=[{'t':'h','i':0,'c':0},{'t':'toc','c':0},{'t':'h','i':1,'c':0}],gyms=G,locs=locs,ver=1,remap={},patch="1.4.1")
if __name__=='__main__':
  os.makedirs(APP+'/data',exist_ok=True)
  open(APP+'/data/book.js','w').write('window.BOOK='+json.dumps(book,ensure_ascii=False,separators=(',',':'))+';')
  for n,p in PD.items(): open(APP+f'/data/p{n}.js','w').write(f'(window.PD=window.PD||{{}})[{n}]='+json.dumps(p,ensure_ascii=False,separators=(',',':'))+';')
  open(APP+'/data/config.js','w').write('window.LITE=false;\n')
  srcs={s['title']:s for s in sources}
  open(APP+'/data/sources.js','w').write('window.SOURCES='+json.dumps(list(srcs.values()),ensure_ascii=False)+';')
  with open(H+'/stale_report.md','w') as f:
    f.write(f"# Stale report (generated {datetime.datetime.now():%Y-%m-%d %H:%M} America/Chicago)\nPages last edited before {STALE_CUT} (1.4.0 release) may not reflect the 2026 update.\n\n| Page | Last edit (UTC) |\n|---|---|\n")
    for t,ts in sorted(set(stale)): f.write(f"| [{t}]({url(t)}) | {ts} |\n")
    f.write(f"\nPatch overrides applied ({len(applied)}): {', '.join(applied)}\n")
  print('parts',len(PD),'locs',len(locs),'wild',sum(len(l['wild']) for l in locs),'items',sum(len(l['items']) for l in locs),'trainers',sum(len(l['trainers']) for l in locs))
  for g in G: print(g['no'],g['leader'],g['badgeName'],[ (t['diff'],len(t['mons']),[m['lv'] for m in t['mons']]) for t in g['teams']],g['prize'])
  print('stale',len(set(stale)))

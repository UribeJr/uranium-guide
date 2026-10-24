"""Download Pokémon Uranium Wiki sprites (icons + infobox front sprites) via api.php imageinfo; host locally.
Sprites: Pokémon Uranium team (JV and Involuntary Twitch), via the Pokémon Uranium Wiki."""
import json,re,os,time,urllib.request,urllib.parse
H=os.path.dirname(os.path.abspath(__file__)); APP=os.path.abspath(H+'/../..')
API='https://pokemon-uranium.fandom.com/api.php'; UA={'User-Agent':'UraniumFieldBinder/1.0 (fan guide; github.com/UribeJr/uranium-guide)'}
rows=json.load(open(H+'/cache/dex_list_parsed.json'))
def get(u):
  for k in range(4):
    try: return urllib.request.urlopen(urllib.request.Request(u,headers=UA),timeout=30).read()
    except Exception as e: time.sleep(2+3*k)
  return None
def slug(t): return re.sub(r'[^A-Za-z0-9]','_',t)
want={}
for r in rows:
  key=re.sub(r'[^a-z0-9]','',r['name'].lower())
  want['File:'+r['img']]=('icon',r['n'])
  want[f"File:{r['n']}.png"]=('big',r['n'])  # 80x80 front battle sprite
info={}; titles=list(want)
for i in range(0,len(titles),40):
  q=urllib.parse.urlencode({'action':'query','format':'json','prop':'imageinfo','iiprop':'url|size|mime','titles':'|'.join(titles[i:i+40])})
  d=json.loads(get(API+'?'+q)); norm={n['to']:n['from'] for n in d['query'].get('normalized',[])}
  for p in d['query']['pages'].values():
    t=norm.get(p['title'],p['title'])
    if 'imageinfo' in p: info[t]=p['imageinfo'][0]
  time.sleep(1)
out={}; miss=[]
for t,(kind,n) in want.items():
  ii=info.get(t)
  if not ii: miss.append((kind,n,t)); continue
  ext=re.sub(r'/revision.*','',ii['url'].split('?')[0]).rsplit('.',1)[-1].lower()
  fn=f'img/mon/{kind}/{n}.{ext}'
  if not os.path.exists(APP+'/'+fn):
    b=get(ii['url']); time.sleep(0.6)
    if not b or len(b)<40: miss.append((kind,n,t)); continue
    open(APP+'/'+fn,'wb').write(b)
  out.setdefault(n,{})[kind]=dict(f=fn,w=ii['width'],h=ii['height'])
json.dump(out,open(H+'/sprites.json','w'),indent=0)
open(APP+'/data/sprites.js','w').write('/* Pokémon sprites by the Pokémon Uranium team (JV and Involuntary Twitch), via the Pokémon Uranium Wiki; hosted locally */\nwindow.SPR='+json.dumps(out,separators=(',',':'))+';')
print('icons',sum('icon' in v for v in out.values()),'big',sum('big' in v for v in out.values()),'missing',miss)

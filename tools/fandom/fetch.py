#!/usr/bin/env python3
"""Polite cached fetcher for pokemon-uranium.fandom.com api.php.
Usage: fetch.py page "Title" [...] | fetch.py cat "Category:X" | fetch.py all
Cache: cache/<slug>.json = {title, revid, timestamp, wikitext, fetched}. Re-fetch only with --refresh.
Rate limit: >=1.5 s between requests, one at a time, descriptive UA, maxlag=5, retry with backoff."""
import json, os, re, sys, time, urllib.parse, urllib.request
API = "https://pokemon-uranium.fandom.com/api.php"
UA = "uranium-guide-builder/0.1 (fan guide; contact via github.com/UribeJr) python-urllib"
HERE = os.path.dirname(os.path.abspath(__file__)); CACHE = os.path.join(HERE, "cache")
GAP = 1.5; _last = [0.0]; REFRESH = "--refresh" in sys.argv
def slug(t): return re.sub(r"[^A-Za-z0-9._-]+", "_", t)[:120]
def api(**p):
    p.update(format="json", formatversion="2", maxlag="5")
    url = API + "?" + urllib.parse.urlencode(p)
    for attempt in range(5):
        wait = GAP - (time.time() - _last[0])
        if wait > 0: time.sleep(wait)
        _last[0] = time.time()
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "application/json"})
            with urllib.request.urlopen(req, timeout=30) as r: d = json.load(r)
            if "error" in d and d["error"].get("code") == "maxlag": time.sleep(5 * (attempt + 1)); continue
            return d
        except Exception as e:
            print("  retry", attempt, e, file=sys.stderr); time.sleep(3 * 2 ** attempt)
    raise RuntimeError("failed: " + url)
def page(title):
    fn = os.path.join(CACHE, slug(title) + ".json")
    if os.path.exists(fn) and not REFRESH: return json.load(open(fn))
    d = api(action="query", prop="revisions", titles=title, redirects="1", rvprop="ids|timestamp|content", rvslots="main")
    p = d["query"]["pages"][0]
    if p.get("missing"): out = {"title": title, "missing": True}
    else:
        rv = p["revisions"][0]
        out = {"title": p["title"], "revid": rv["revid"], "timestamp": rv["timestamp"], "wikitext": rv["slots"]["main"]["content"],
               "url": "https://pokemon-uranium.fandom.com/wiki/" + urllib.parse.quote(p["title"].replace(" ", "_")), "fetched": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())}
    os.makedirs(CACHE, exist_ok=True); json.dump(out, open(fn, "w"), ensure_ascii=False)
    print("fetched", title, out.get("revid"), out.get("timestamp")); return out
def category(cat):
    fn = os.path.join(CACHE, "cat_" + slug(cat) + ".json")
    if os.path.exists(fn) and not REFRESH: return json.load(open(fn))
    out, cont = [], {}
    while True:
        d = api(action="query", list="categorymembers", cmtitle=cat, cmlimit="500", cmnamespace="0", **cont)
        out += [m["title"] for m in d["query"]["categorymembers"]]
        if "continue" not in d: break
        cont = {"cmcontinue": d["continue"]["cmcontinue"]}
    json.dump(out, open(fn, "w"), ensure_ascii=False); return out
if __name__ == "__main__":
    a = [x for x in sys.argv[1:] if x != "--refresh"]
    if a and a[0] == "page": [page(t) for t in a[1:]]
    elif a and a[0] == "cat": print(category(a[1]))
    elif a and a[0] == "all":
        for t in ["Game Walkthrough", "2026 Patch Notes"]: page(t)
        for c in ["Category:Gyms", "Category:Gym Leaders"]:
            for t in category(c): page(t)

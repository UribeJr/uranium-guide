# Pokémon Uranium Field Binder

An interactive, unofficial walkthrough for **Pokémon Uranium** (v1.4.1, October 2026), styled as a containment-lab field binder.

**Live:** https://uranium-guide.vercel.app

## What's inside
- Page-turning book: the 12 Tandor walkthrough parts (rewritten in our own words), 8 gym spreads, and a postgame / patch chapter built from the 2026 patch notes.
- **PokéPod** companion: wild Pokémon, items and trainers for the area you're reading, with catch / item / trainer / badge checklists saved in your browser (`localStorage`, key `uranium-guide-v1`).
- **Patch banner** and inline PATCH notes with citations; vague patch items are marked *unverified*.
- **Prof. Bamb'o**: an AI help chat (`api/professor.js`, Vercel function) that answers only from this guide's data (BM25 retrieval over `lib/professor-index.json` + Groq). Without a `GROQ_API_KEY` it returns a "resting" fallback with matching pages.

## Build
Static site, no build step. Data pipeline:
```
python3 tools/fandom/build.py                 # wiki wikitext -> data/*.js, stale report
python3 tools/paginate.py http://localhost:PORT  # measure + paginate (Playwright)
node scripts/build-professor-index.js         # chat retrieval index
```
`design/` holds the Art Director's tokens and mocks.

## Sources & credits
- Game facts (encounters, levels, items, trainers, gym teams, rewards) come from the [Pokémon Uranium Wiki](https://pokemon-uranium.fandom.com/) on Fandom and are used under [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/). The derived data in `data/` and `lib/` is shared under the same licence. Revision ids for every source page are in `data/sources.js`.
- Patch information: the wiki's [2026 Patch Notes](https://pokemon-uranium.fandom.com/wiki/2026_Patch_Notes) page.
- Walkthrough prose is original; no wiki text or images are reproduced.
- Book engine adapted from the Pokémon Unbound Trainer's Journal guide.
- Fonts: Saira Stencil One, Share Tech Mono, IBM Plex Sans, Caveat (SIL OFL).

## Licence
Code: MIT (see `LICENSE`). Wiki-derived facts: CC BY-SA 3.0.

## Disclaimer
Unofficial fan project. Not affiliated with or endorsed by Nintendo, Game Freak, Creatures, The Pokémon Company, or the Pokémon Uranium developers. Pokémon and related names are trademarks of their respective owners.

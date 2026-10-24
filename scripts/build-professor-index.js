// Builds lib/professor-index.json (retrieval chunks for /api/professor) from the guide data.
// Run: node scripts/build-professor-index.js
const fs = require('fs'), path = require('path');
const R = p => path.join(__dirname, '..', p);
global.window = {};
eval(fs.readFileSync(R('js/data.js'), 'utf8'));
eval(fs.readFileSync(R('data/book.js'), 'utf8'));
for (let i = 1; i <= 13; i++) eval(fs.readFileSync(R(`data/p${i}.js`), 'utf8'));
const B = window.BOOK, PD = window.PD, MON = window.MON;
const SKIP = new Set(['img', 'full', 'ic', 'url', 'key', 'hero', 'id', 'src', 'portrait', 'slug', 'k', 's', 'w', 'h', 'n']);
const clean = s => String(s).replace(/<br\s*\/?>/gi, ' ').replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
function txt(u) {
  if (u == null) return '';
  if (typeof u === 'string') return clean(u);
  if (typeof u === 'number') return '';
  if (Array.isArray(u)) return u.map(txt).filter(Boolean).join(', ');
  if (u.k === 'trainer') return `Trainer ${clean(u.name)}: ` + (u.team || []).map(m => `${m.n.join(' ')}${m.x && m.x.length ? ' (' + m.x.join(' ') + ')' : ''} Lv${m.lv || '?'}`).join(', ') + (u.notes && u.notes.length ? '. ' + txt(u.notes) : '') + (u.prize ? `. Prize ${u.prize}` : '');
  if (u.k === 'wild' || u.k === 'enc') return `${clean(u.title || '')}${u.label ? ' [' + u.label + ']' : ''}: ` + (u.mons || u.team || []).map(m => m.n.join(' ') + (m.x && m.x.length ? ' (' + m.x.join(' ') + ')' : '') + (m.lv ? ' Lv' + m.lv : '') + (m.rate ? ' ' + m.rate : '')).join(', ');
  if (u.k === 'items') return 'Items: ' + u.rows.map(r => clean(r.name)).join(', ');
  return Object.entries(u).filter(([k]) => !SKIP.has(k)).map(([, v]) => txt(v)).filter(Boolean).join('. ');
}
const chunks = [];
const add = (page, title, text, ch) => { text = text.replace(/\s+/g, ' ').trim(); const a = B.pages[page] && B.pages[page].a; if (text.length > 20) chunks.push(Object.assign({ p: page, t: title, c: ch, x: text.slice(0, 2200) }, a ? { a } : {})); };
// v11: resolve anchored pages (page numbers can change when the book is re-paginated)
const pageOfAnchor = a => { const m = /^p(\d+)u(\d+)$/.exec(a || ''); return m ? B.pages.findIndex(d => d.t === 'f' && d.p === +m[1] && d.u.includes(+m[2])) : -1; };
for (const s of (window.STARTERS||[])) { const p = pageOfAnchor(s.a); if (p >= 0) s.page = p; }
B.pages.forEach((pg, i) => {
  if (pg.t === 'f') {
    const d = PD[pg.p]; let sec = '';
    for (let j = pg.u[0]; j >= 0; j--) if (d.units[j].k === 'sec') { sec = d.units[j].title; break; }
    add(i, `Part ${pg.p}: ${d.title}${sec ? ' – ' + sec : ''}`, pg.u.map(k => txt(d.units[k])).join(' | '), pg.c);
  } else if (pg.t === 'gl') {
    const g = B.gyms[pg.g];
    add(i, `Gym ${g.no}: ${g.title} – ${g.badgeName}, ${g.type}`, txt(g.intro) + ' ' + g.sections.map(s => s.title + ': ' + txt(s.paras)).join(' '), pg.c);
  } else if (pg.t === 'gr') {
    const g = B.gyms[pg.g];
    for (const tm of g.teams) add(i, `Gym ${g.no} ${g.leader} team (${tm.diff}) – ${g.badgeName}${g.prize ? ', prize ' + g.prize : ''}`, tm.mons.map(m => `${m.name} Lv${m.lv} [${m.type}] item ${m.item}; moves ${m.moves}${m.ability ? '; ability ' + m.ability : ''}`).join(' || '), pg.c);
  } else if (pg.t === 'note') {
    add(i, `Note page (Part ${pg.p})`, '', pg.c);
  }
});
// Gym order / badges overview
add(B.gyms[0].page, 'Gym order and badges overview', B.gyms.map((g, k) => `Badge ${k + 1}: ${g.badgeName} – ${g.leader} (${g.type}) at ${g.title}, p.${g.page || ''}`).join('. '), 0);
// Chapters / parts
add(1, 'Table of contents – walkthrough parts', Object.entries(B.parts).map(([n, p]) => `Part ${n} ${p.title} p.${p.page}`).join('; '), 0);
const out = { built: new Date().toISOString(), pages: B.pages.length, starters: [], gyms: B.gyms.map(g => ({ no: g.no, leader: g.leader, badge: g.badgeName, type: g.type, page: B.pages.findIndex(p => p.t === 'gl' && p.g === g.no - 1) })), chunks };
fs.writeFileSync(R('lib/professor-index.json'), JSON.stringify(out));
console.log(chunks.length, 'chunks', fs.statSync(R('lib/professor-index.json')).size, 'bytes');

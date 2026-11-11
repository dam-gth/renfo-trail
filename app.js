/* app.js — Renfo Trail : génération de séances, fiches 3D, lecteur de séance. */
const $ = (s, r = document) => r.querySelector(s);
const byId = Object.fromEntries(EXERCISES.map(e => [e.id, e]));
const LS = (k, v) => { try { if (v === undefined) return JSON.parse(localStorage.getItem(k)); localStorage.setItem(k, JSON.stringify(v)); } catch (e) { return null; } };
const I = {
bolt: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2 4 14h7l-1 8 9-12h-7z"/></svg>',
barbell: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M2 12h3M19 12h3M8 12h8"/><rect x="5" y="7" width="3" height="10" rx="1"/><rect x="16" y="7" width="3" height="10" rx="1"/></svg>',
spring: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v4M8 7l4-4 4 4"/><path d="M5 21c1-5 3-7 7-7s6 2 7 7"/><path d="M9 14l-2-3M15 14l2-3"/></svg>',
mountain: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 20 9 8l3 5 3-3 6 10z"/><path d="M9 8l-1.5-3"/></svg>',
shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z"/><path d="m9 12 2 2 4-4"/></svg>',
core: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/></svg>',
home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11 12 3l9 8"/><path d="M5 10v10h14V10"/></svg>',
list: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M8 6h13M8 12h13M8 18h13"/><circle cx="4" cy="6" r="1"/><circle cx="4" cy="12" r="1"/><circle cx="4" cy="18" r="1"/></svg>',
book: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h6a3 3 0 0 1 3 3v13a2 2 0 0 0-2-2H4z"/><path d="M20 4h-6a3 3 0 0 0-3 3v13a2 2 0 0 1 2-2h7z"/></svg>',
play: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 4v16l13-8z"/></svg>',
shuffle: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 3h5v5M4 20 21 3M21 16v5h-5M15 15l6 6M4 4l5 5"/></svg>',
chev: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m9 6 6 6-6 6"/></svg>',
back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m15 5-7 7 7 7"/></svg>',
check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 5 5 9-10"/></svg>',
cross: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 3h4v7h7v4h-7v7h-4v-7H3v-4h7z"/></svg>',
flame: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3c1 4 5 5 5 10a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-4-1-6 1-9z"/></svg>',
weight: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M4 12h2M18 12h2M9 12h6"/><rect x="6" y="8" width="3" height="8" rx="1"/><rect x="15" y="8" width="3" height="8" rx="1"/></svg>',
machine: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="3"/><path d="M7 16V9M12 16v-4M17 16V7"/></svg>',
band: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M3 12c3-5 6-5 9 0s6 5 9 0"/></svg>',
};
const TYPES = [
  { id: 'complet', icon: 'bolt', name: 'Séance complète', desc: 'Lourd + pliométrie + prévention. Le format de référence, 2 fois par semaine.' },
  { id: 'force', icon: 'barbell', name: 'Force maximale', desc: 'Charges lourdes, peu de répétitions, longues récupérations. Économie de course.' },
  { id: 'plyo', icon: 'spring', name: 'Pliométrie', desc: 'Sauts et rebonds à faible volume. Raideur et réactivité du pied.' },
  { id: 'trail', icon: 'mountain', name: 'Spécial trail', desc: 'Montée sur un appui, freinage excentrique pour la descente, dévers.' },
  { id: 'prevention', icon: 'shield', name: 'Prévention blessures', desc: 'Hanche, tronc, mollets, tendon d\'Achille et pied. Programme type Run RCT.' },
{ id: 'core', icon: 'core', name: 'Gainage', desc: 'Tronc et bassin stables quand la fatigue arrive.' },
{ id: 'reeduc', icon: 'cross', name: 'Rééducation', desc: 'Protocole ciblé sur une zone douloureuse ou en reprise (tendons, TFL, genou…).' },
];
const SLOTS = {
  complet: [['back-squat', 'leg-press', 'goblet-squat', 'pistol-box', 'squat'], ['pogo'], ['deadlift', 'rdl', 'leg-curl', 'nordic', 'sl-rdl'], ['bulgarian', 'step-up', 'lunge'], ['drop-jump', 'box-jump', 'jump-squat', 'bounding'], ['calf-raise-machine', 'calf-raise'], ['side-lying-abduction', 'band-walk', 'cable-abduction', 'sl-bridge'], ['side-plank', 'dead-bug']],
  force: [['back-squat', 'leg-press', 'goblet-squat', 'pistol-box', 'squat'], ['deadlift', 'rdl', 'leg-curl', 'nordic', 'sl-rdl'], ['bulgarian', 'step-up', 'lunge'], ['calf-raise-machine', 'calf-raise', 'soleus-seated'], ['hip-thrust', 'cable-abduction', 'sl-bridge'], ['suitcase-carry', 'side-plank', 'dead-bug']],
  plyo: [['pogo'], ['drop-jump', 'box-jump', 'jump-squat'], ['bounding', 'skater'], ['lateral-hops', 'skater'], ['calf-raise', 'calf-raise-machine'], ['nordic', 'sl-rdl']],
  trail: [['step-up', 'bulgarian'], ['step-down', 'leg-extension'], ['spanish-squat', 'wall-sit'], ['lateral-hops', 'skater'], ['calf-raise', 'calf-raise-machine'], ['nordic', 'leg-curl', 'sl-rdl'], ['side-plank', 'suitcase-carry'], ['tibialis-raise']],
  prevention: [['sl-bridge', 'hip-thrust'], ['band-walk', 'side-lying-abduction', 'cable-abduction'], ['sl-rdl'], ['copenhagen', 'side-plank'], ['calf-raise', 'heel-drop'], ['soleus-seated'], ['side-plank', 'plank'], ['short-foot'], ['tibialis-raise'], ['bird-dog', 'dead-bug'], ['nordic', 'leg-curl']],
  core: [['plank'], ['side-plank'], ['dead-bug'], ['bird-dog'], ['suitcase-carry', 'copenhagen'], ['sl-bridge'], ['band-walk', 'side-lying-abduction']],
};
const WARMUP = {
reeduc: ['3 min de marche rapide', '10 cercles de chevilles et de hanches par côté', 'Mobilisation douce de la zone concernée, sans douleur', '10 squats lents si le genou le permet'],
  base: ['2 min de marche rapide ou de trot sur place', '10 cercles de hanches et 10 de chevilles par côté', '10 squats lents, 10 fentes arrière', '15 montées sur pointes, 10 pogo doux'],
  plyo: ['3 min de trot léger', '10 cercles de chevilles par côté, 10 squats', '2 x 20 m de montées de genoux et de talons-fesses', '10 pogo doux puis 10 pogo normaux'],
};
const LEVELS = ['Débutant', 'Intermédiaire', 'Avancé'];
const DURS = [15, 20, 30, 45, 60];

const DEF = { type: 'complet', dur: 30, level: 2, weight: false, machine: false, band: false, zone: 'achille' };
const zoneOf = cfg => REHAB.find(z => z.id === cfg.zone) || REHAB[0];
const S = { cfg: Object.assign({}, DEF, LS('renfo.cfg') || {}), variant: 0, session: null, player: null };
const saveCfg = () => LS('renfo.cfg', S.cfg);

// ---------- Génération ----------
function repsInfo(reps) {
  const m = /^(\d+)\s*(?:x\s*(\d+)\s*s)?/.exec(reps);
  const n = m ? +m[1] : 10;
  const timed = /\d\s*s(\b|\/)/.test(reps) && !/x/.test(reps);
  return { n, timed, secs: timed ? n : 0 };
}
function instantiate(e, cfg) {
const useW = cfg.weight && e.weighted;
const rd = cfg.type === 'reeduc' ? zoneOf(cfg).dose[e.id] : null;
const dose = Object.assign({}, e.dose, useW ? e.weighted.dose : {}, rd || {});
  const L = cfg.level - 1;
  const it = { ex: e, id: e.id, name: useW ? e.weighted.name : e.name, hold: useW ? e.weighted.hold : e.hold,
    sets: dose.sets[L], reps: dose.reps[L], rest: dose.rest, repSec: dose.repSec, tempo: dose.tempo, load: useW ? (dose.load || e.weighted.dose.load) : (e.needs.length ? dose.load : null), uni: !!e.uni };
  it.minutes = minutes(it);
  return it;
}
function minutes(it) {
  const r = repsInfo(it.reps);
  const work = (r.timed ? r.secs : r.n * it.repSec) * (it.uni ? 2 : 1) + (it.uni ? 10 : 0);
  return Math.round((it.sets * (work + it.rest) - it.rest) / 6) / 10;
}
const EXTRA = {
  complet: [['side-lying-abduction', 'band-walk', 'cable-abduction'], ['copenhagen', 'sl-bridge'], ['soleus-seated'], ['nordic', 'sl-rdl'], ['bird-dog', 'plank']],
  force: [['pistol-box', 'lunge'], ['sl-rdl'], ['soleus-seated'], ['copenhagen', 'side-plank'], ['step-up']],
  plyo: [['step-up'], ['side-plank'], ['sl-bridge'], ['soleus-seated'], ['pistol-box', 'squat']],
  trail: [['sl-bridge', 'hip-thrust'], ['copenhagen'], ['band-walk', 'side-lying-abduction'], ['soleus-seated'], ['pogo'], ['dead-bug']],
  prevention: [['wall-sit', 'spanish-squat'], ['step-down'], ['lunge'], ['heel-drop'], ['pistol-box', 'squat']],
  core: [['copenhagen'], ['wall-sit'], ['sl-rdl'], ['step-down'], ['calf-raise']],
};
function generate(cfg, variant) {
  const have = new Set(['weight', 'machine', 'band'].filter(k => cfg[k]));
  const ok = e => (!e.needs.length || e.needs.some(n => have.has(n))) && e.level <= cfg.level;
  const warm = cfg.dur >= 20 ? 5 : 3;
  const budget0 = cfg.dur - warm;
  let budget = budget0;
  const maxPer = Math.max(6, budget0 * 0.45);
  const items = [], used = new Set();
  function fill(slots) {
    for (const slot of slots) {
      const cands = slot.map(id => byId[id]).filter(e => ok(e) && !used.has(e.id));
      if (!cands.length) continue;
      const it = instantiate(cands[variant % cands.length], cfg);
      it.maxSets = Math.min(5, it.sets + 1);
      const cap = Math.min(budget, maxPer);
      while (it.sets > 2 && it.minutes > cap) { it.sets--; it.minutes = minutes(it); }
      if (it.minutes > cap && it.rest > 45) { it.rest = Math.max(45, Math.round(it.rest * 0.6)); it.minutes = minutes(it); }
      if (it.minutes > budget + 1) continue;
      items.push(it); used.add(it.id); budget -= it.minutes;
      if (budget < 2) return;
    }
  }
const zone = cfg.type === 'reeduc' ? zoneOf(cfg) : null;
const slots = zone ? zone.slots : SLOTS[cfg.type], extra = zone ? zone.extra : (EXTRA[cfg.type] || []);
fill(slots);
if (budget >= 5) fill(extra);
if (budget >= 5) fill(slots);
  for (let guard = 0; budget >= 1.5 && guard < 10; guard++) {
    let added = false;
    for (const it of items) {
      if (it.sets >= it.maxSets) continue;
      const m0 = it.minutes; it.sets++; it.minutes = minutes(it);
      if (it.minutes - m0 <= budget) { budget -= it.minutes - m0; added = true; } else { it.sets--; it.minutes = m0; }
    }
    if (!added) break;
  }
  return { cfg: Object.assign({}, cfg), items, warm, warmList: WARMUP[cfg.type] || WARMUP.base, zone: zone ? zone.id : null, total: Math.round(cfg.dur - budget) };
}

// ---------- Rendu ----------
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const animOf = it => it.hold !== it.ex.hold ? Object.assign({}, it.ex.anim, { hold: it.hold }) : it.ex.anim;
const app = $('#app');
let stopAnim = null;
function view(html, tabs = true) { if (stopAnim) { stopAnim(); stopAnim = null; } app.innerHTML = html; document.body.classList.toggle('hidden-tabs', !tabs); window.scrollTo(0, 0); fillThumbs(); }
function fillThumbs() {
const imgs = [...app.querySelectorAll('img[data-thumb]')]; if (!imgs.length) return;
(function step() { for (let i = 0; i < 2 && imgs.length; i++) { const img = imgs.shift(); try { img.src = RIG3D.thumb(JSON.parse(img.dataset.anim), img.dataset.thumb); } catch (e) { } } if (imgs.length) requestAnimationFrame(step); })();
}
const thumbImg = (it) => { const a = animOf(it); return `<img alt="" data-thumb="${it.id}:${it.hold || ''}" data-anim='${esc(JSON.stringify(a))}'>`; };
const fmtDate = d => new Date(d).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });
const ring = (frac, size, stroke, cls = '') => { const r = (size - stroke) / 2, c = 2 * Math.PI * r; return `<svg viewBox="0 0 ${size} ${size}"><defs><linearGradient id="g${size}" x1="0" x2="1"><stop offset="0" stop-color="#ff8a3d"/><stop offset="1" stop-color="#ff3d6e"/></linearGradient></defs><circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="rgba(255,255,255,.1)" stroke-width="${stroke}"/><circle class="${cls}" cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="url(#g${size})" stroke-width="${stroke}" stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${c * (1 - Math.min(1, frac))}"/></svg>`; };
function renderTabs(active) {
$('#tabs').innerHTML = `<nav>${[['#/', 'home', 'Accueil'], ['#/exos', 'list', 'Exercices'], ['#/sources', 'book', 'Sources']].map(([h, ic, n]) => `<a href="${h}" class="${active === h ? 'on' : ''}">${I[ic]}<span>${n}</span></a>`).join('')}</nav>`;
}
function weekStats() {
const h = LS('renfo.history') || [];
const now = new Date(), day = (now.getDay() + 6) % 7, monday = new Date(now); monday.setHours(0, 0, 0, 0); monday.setDate(now.getDate() - day);
return { week: h.filter(x => new Date(x.date) >= monday).length, total: h.length, last: h.slice(-4).reverse() };
}
function renderHome() {
renderTabs('#/');
const c = S.cfg, st = weekStats();
const standalone = window.navigator.standalone || matchMedia('(display-mode: standalone)').matches;
const hour = new Date().getHours(), hello = hour < 5 ? 'Bonne nuit' : hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir';
view(`
  <div class="greet"><div><p class="muted small">${hello}</p><h1>Renfo <span class="grad">Trail</span></h1><p class="muted small">${st.week >= 2 ? 'Objectif de la semaine atteint.' : st.week === 1 ? 'Encore une séance cette semaine.' : 'Objectif : 2 séances par semaine.'}</p></div>
    <div class="ring">${ring(st.week / 2, 74, 7)}<div class="lbl">${st.week}/2</div></div></div>
  ${standalone ? '' : `<div class="install">${I.flame}<span><b>Installer :</b> Partager → Sur l'écran d'accueil. L'app marche ensuite hors ligne.</span></div>`}
  <h2>Type de séance</h2>
  <div class="types">${TYPES.map(t => `<button class="type ${c.type === t.id ? 'on' : ''}" data-type="${t.id}"><span class="ic">${I[t.icon]}</span><span class="tn">${t.name}</span><span class="td">${t.desc}</span></button>`).join('')}</div>
  ${c.type === 'reeduc' ? `<h2>Zone à rééduquer</h2><div class="chips">${REHAB.map(z => `<button class="chip ${c.zone === z.id ? 'on' : ''}" data-zone="${z.id}">${z.name}</button>`).join('')}</div><p class="muted small" style="margin-top:8px">${esc(zoneOf(c).desc)} Ne remplace pas un diagnostic : consulte si la douleur persiste ou s'aggrave.</p>` : ''}
  <h2>Durée</h2>
  <div class="chips">${DURS.map(d => `<button class="chip ${c.dur === d ? 'on' : ''}" data-dur="${d}">${d} min</button>`).join('')}</div>
  <h2>Matériel disponible</h2>
  <div class="chips">${[['weight', 'Poids'], ['machine', 'Machines'], ['band', 'Élastique']].map(([k, n]) => `<button class="chip eq ${c[k] ? 'on' : ''}" data-tog="${k}">${I[k]}${n}</button>`).join('')}</div>
  <p class="muted small" style="margin-top:8px">Sans rien de coché : poids du corps, une marche et une chaise suffisent.</p>
  <h2>Niveau</h2>
  <div class="seg">${LEVELS.map((l, i) => `<button class="${c.level === i + 1 ? 'on' : ''}" data-level="${i + 1}">${l}</button>`).join('')}</div>
  <p class="muted small">Débutant : moins de 6 mois de renforcement. Avancé : squat et soulevé de terre maîtrisés, pliométrie régulière.</p>
  <div class="sticky"><button class="cta" id="go">${I.play} Générer ma séance</button></div>
  ${st.last.length ? `<h2>Dernières séances</h2><div class="card" style="padding:6px 16px">${st.last.map(x => `<p style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--line)"><span>${esc(x.zone ? (REHAB.find(z => z.id === x.zone)?.name || '') : (TYPES.find(t => t.id === x.type)?.name || ''))}</span><span class="muted">${fmtDate(x.date)} · ${x.dur} min</span></p>`).join('')}</div>` : ''}`);
app.querySelectorAll('[data-type]').forEach(b => b.onclick = () => { c.type = b.dataset.type; saveCfg(); renderHome(); });
app.querySelectorAll('[data-dur]').forEach(b => b.onclick = () => { c.dur = +b.dataset.dur; saveCfg(); renderHome(); });
app.querySelectorAll('[data-zone]').forEach(b => b.onclick = () => { c.zone = b.dataset.zone; saveCfg(); renderHome(); });
app.querySelectorAll('[data-level]').forEach(b => b.onclick = () => { c.level = +b.dataset.level; saveCfg(); renderHome(); });
app.querySelectorAll('[data-tog]').forEach(b => b.onclick = () => { c[b.dataset.tog] = !c[b.dataset.tog]; saveCfg(); renderHome(); });
$('#go').onclick = () => { S.variant = 0; S.session = generate(S.cfg, 0); location.hash = '#/seance'; };
const sel = app.querySelector('.type.on'); if (sel) sel.scrollIntoView({ inline: 'start', block: 'nearest' });
window.scrollTo(0, 0);
}
function doseLine(it) { return `${it.sets} × ${esc(it.reps)} · repos ${it.rest} s`; }
function renderSession() {
renderTabs('');
if (!S.session) S.session = generate(S.cfg, S.variant);
const s = S.session, t = TYPES.find(x => x.id === s.cfg.type), zone = s.zone ? REHAB.find(z => z.id === s.zone) : null;
view(`
  <div class="top"><a class="back" href="#/">${I.back}</a><div class="t"><h1>${zone ? 'Rééducation' : 'Ta séance'}</h1><p class="sub">${LEVELS[s.cfg.level - 1]}${s.cfg.weight ? ' · poids' : ''}${s.cfg.machine ? ' · machines' : ''}${s.cfg.band ? ' · élastique' : ''}${!s.cfg.weight && !s.cfg.machine && !s.cfg.band ? ' · poids du corps' : ''}</p></div></div>
  <section class="hero"><p class="sub" style="display:flex;align-items:center;gap:6px">${I[t.icon].replace('<svg', '<svg style="width:16px;height:16px"')} ${zone ? zone.name : t.name}</p><h1>${s.items.length} exercices, ${s.total} min</h1>
    <div class="stats"><div><b>${s.total}</b><span>minutes</span></div><div><b>${s.items.length}</b><span>exercices</span></div><div><b>${s.items.reduce((a, i) => a + i.sets, 0)}</b><span>séries</span></div></div></section>
  <section class="card warm"><h3>${I.flame} Échauffement · ${s.warm} min</h3><ul>${s.warmList.map(w => `<li>${w}</li>`).join('')}</ul></section>
  <h2>Programme</h2>
  <ol class="exos">${s.items.map((it, i) => `<li class="exo" data-i="${i}"><div class="th">${thumbImg(it)}</div><div class="tx"><b>${esc(it.name)}</b><span>${doseLine(it)}</span><small>${esc(it.ex.group)} · ${it.minutes} min${it.uni ? ' · chaque côté' : ''}</small></div><span class="chev">${I.chev}</span></li>`).join('')}</ol>
  ${zone ? `<section class="card tips why"><h3>Règles du protocole</h3><ul>${zone.rules.map(r => `<li>${esc(r)}</li>`).join('')}</ul><ul class="refs">${zone.refs.map(rf => `<li><a href="${REF_URL(rf)}" target="_blank" rel="noopener">${esc(REFS[rf].t.split('. ')[0])} ${esc(REFS[rf].t.match(/\d{4}/)?.[0] || '')}</a> — ${esc(REFS[rf].k)}</li>`).join('')}</ul></section>` : `<section class="card tips"><h3>À savoir</h3><ul>
    <li>Termine chaque série avec 2 à 3 répétitions en réserve ; augmente la charge quand c'est facile (max +10 %/semaine).</li>
    <li>Place cette séance à au moins 6 h d'une sortie clé, idéalement un jour de course facile.</li>
    <li>Pliométrie et force lourde : jamais fatigué, qualité avant volume.</li>
    <li>Une gêne ≤ 3/10 qui disparaît en 24 h est acceptable ; au-delà, réduis.</li></ul></section>`}
  <div class="sticky"><button class="cta" id="start">${I.play} Démarrer la séance</button><button class="btn-ghost" id="vary">${I.shuffle} Varier les exercices</button></div>`);
app.querySelectorAll('.exo').forEach(li => li.onclick = () => { location.hash = '#/exo/' + s.items[li.dataset.i].id; });
$('#vary').onclick = () => { S.variant++; S.session = generate(S.cfg, S.variant); renderSession(); };
$('#start').onclick = () => { unlockAudio(); S.player = { i: -1, set: 1, phase: 'warm', t: s.warm * 60 }; location.hash = '#/player'; };
}
function renderExo(id, fromList) {
const e = byId[id]; if (!e) { location.hash = '#/'; return; }
renderTabs(fromList ? '#/exos' : '');
const it = S.session && S.session.items.find(x => x.id === id) || instantiate(e, S.cfg);
const backHref = fromList ? '#/exos' : (S.session ? '#/seance' : '#/');
const r = repsInfo(it.reps);
view(`
  <div class="stage" id="stage"><a class="back fab" href="${backHref}">${I.back}</a><span class="hint3d">3D · glisse pour tourner</span></div>
  <div class="title"><h1>${esc(it.name)}</h1><div class="tags"><span class="tag">${esc(e.group)}</span>${e.muscles.split(',').slice(0, 3).map(m => `<span class="tag">${esc(m.trim())}</span>`).join('')}${e.needs.length ? '' : '<span class="tag">sans matériel</span>'}</div></div>
  <section class="card"><h3>Dosage · ${LEVELS[S.cfg.level - 1].toLowerCase()}</h3><div class="dose3"><div><b>${it.sets}</b><span>séries</span></div><div><b>${esc(it.reps.replace('/côté', ''))}</b><span>${it.uni ? 'par côté' : r.timed ? 'tenue' : 'répétitions'}</span></div><div><b>${it.rest}s</b><span>repos</span></div></div>${it.tempo ? `<p style="margin-top:10px"><b>Tempo :</b> ${esc(it.tempo)}</p>` : ''}${it.load ? `<p><b>Charge :</b> ${esc(it.load)}</p>` : ''}</section>
  <section class="card"><h3>Comment faire</h3><ol class="cues">${e.cues.map(c => `<li><span>${esc(c)}</span></li>`).join('')}</ol></section>
  <section class="card err"><h3>Erreurs fréquentes</h3><ul>${e.errors.map(c => `<li>${esc(c)}</li>`).join('')}</ul></section>
  <section class="card why"><h3>Pourquoi cet exercice</h3><p>${esc(e.why)}</p><ul class="refs">${e.refs.map(rf => `<li><a href="${REF_URL(rf)}" target="_blank" rel="noopener">${esc(REFS[rf].t.split('. ')[0])} ${esc(REFS[rf].t.match(/\d{4}/)?.[0] || '')}</a> — ${esc(REFS[rf].k)}</li>`).join('')}</ul></section>`);
stopAnim = RIG3D.mount($('#stage'), animOf(it));
}
function renderList() {
renderTabs('#/exos');
const groups = [...new Set(EXERCISES.map(e => e.group))];
view(`<div class="top"><div class="t"><h1>Exercices</h1><p class="sub">${EXERCISES.length} mouvements, du poids du corps aux machines.</p></div></div>
  ${groups.map(g => `<h2>${esc(g)}</h2><ol class="exos">${EXERCISES.filter(e => e.group === g).map(e => `<li class="exo" data-id="${e.id}"><div class="th">${thumbImg({ id: e.id, ex: e, hold: e.hold })}</div><div class="tx"><b>${esc(e.name)}</b><span>${esc(e.muscles)}</span><small>${e.needs.length ? e.needs.map(n => ({ weight: 'poids', machine: 'machine', band: 'élastique' })[n]).join(' ou ') : 'sans matériel'} · ${LEVELS[e.level - 1].toLowerCase()}</small></div><span class="chev">${I.chev}</span></li>`).join('')}</ol>`).join('')}`);
app.querySelectorAll('.exo').forEach(li => li.onclick = () => { location.hash = '#/exo/' + li.dataset.id + '/liste'; });
}
function renderSources() {
renderTabs('#/sources');
view(`<div class="top"><div class="t"><h1>Sources</h1><p class="sub">Méta-analyses, essais randomisés et recommandations derrière chaque séance.</p></div></div>
  <section class="card tips"><h3>Ce que l'app en retient</h3><ul>
    <li><b>Force lourde</b> (≥ 80 % du max, 3-6 répétitions) et <b>pliométrie</b> à faible volume améliorent l'économie de course ; les combiner donne le meilleur résultat (Llanos-Lagos 2024, Blagrove 2018).</li>
    <li><b>2 séances par semaine</b> pendant 6 à 14 semaines, puis <b>1 séance</b> de maintien en saison (Rønnestad 2014).</li>
    <li>Le renforcement réduit d'environ <b>un tiers</b> les blessures et de <b>moitié</b> les blessures de surutilisation ; un programme <b>hanche + tronc</b> de 20-35 min a réduit de 39 % les blessures chez des coureurs débutants (Lauersen 2014, Leppänen 2024).</li>
    <li>En trail, la <b>descente</b> impose un freinage excentrique des quadriceps : s'y exposer progressivement protège (Vernillo 2017, Bontemps 2022).</li>
    <li><b>Mollets et tendon d'Achille</b> : travail lent et lourd, descentes excentriques ; <b>pied</b> : muscles intrinsèques (Beyer 2015, Alfredson 1998, Taddei 2020).</li></ul></section>
  <ol class="srcs">${Object.keys(REFS).map(r => `<li><a href="${REF_URL(r)}" target="_blank" rel="noopener">${esc(REFS[r].t)}</a><p>${esc(REFS[r].k)}</p></li>`).join('')}</ol>
  <p class="muted small">Cette application ne remplace pas un avis médical. En cas de douleur persistante, consulte un médecin du sport ou un kinésithérapeute.</p>`);
}
// ---------- Lecteur ----------
let audio = null;
function unlockAudio() { try { audio = audio || new (window.AudioContext || window.webkitAudioContext)(); if (audio.state === 'suspended') audio.resume(); } catch (e) { } }
function beep(n = 1) { if (!audio) return; for (let i = 0; i < n; i++) { const o = audio.createOscillator(), g = audio.createGain(); o.frequency.value = i === n - 1 && n > 1 ? 1100 : 880; g.gain.value = 0.15; o.connect(g); g.connect(audio.destination); const t = audio.currentTime + i * 0.25; o.start(t); o.stop(t + 0.15); } }
let wake = null;
async function keepAwake() { try { if ('wakeLock' in navigator) wake = await navigator.wakeLock.request('screen'); } catch (e) { } }
let timer = null;
function clearTimer() { if (timer) { clearInterval(timer); timer = null; } }
const fmt = t => `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`;
function renderPlayer() {
const s = S.session, p = S.player;
if (!s || !p) { location.hash = '#/'; return; }
keepAwake(); clearTimer(); renderTabs('');
const total = s.items.length;
if (p.phase === 'warm') {
  view(`<div class="ptop"><a class="back" href="#/seance">${I.back}</a><div class="pi"><small>Échauffement</small><div class="prog"><i style="width:2%"></i></div></div></div>
    <div class="ringbig" id="ring">${ring(1 - p.t / (s.warm * 60), 190, 10)}<div class="clock" id="clock">${fmt(p.t)}</div></div>
    <section class="panel"><h1>On chauffe</h1><p class="muted">${s.warm} min avant le premier exercice.</p><ul class="tips" style="padding-left:18px;margin-top:8px">${s.warmList.map(w => `<li>${w}</li>`).join('')}</ul></section>
    <div class="sticky"><button class="cta" id="next">${I.check} C'est chaud, on commence</button></div>`, false);
  const T = s.warm * 60;
  timer = setInterval(() => { p.t--; $('#clock').textContent = fmt(Math.max(0, p.t)); $('#ring svg').outerHTML = ring(1 - Math.max(0, p.t) / T, 190, 10); if (p.t === 0) { beep(2); clearTimer(); } }, 1000);
  $('#next').onclick = () => { p.phase = 'work'; p.i = 0; p.set = 1; renderPlayer(); };
  return;
}
if (p.phase === 'done') {
  view(`<div class="done"><div class="big">🏔️</div><h1>Séance terminée</h1><p class="muted">${total} exercices · ${s.total} min · bien joué.</p></div>
    <section class="card tips"><ul><li>Note la charge utilisée pour augmenter la prochaine fois si c'était facile.</li><li>Courbatures 24-48 h après : normal les deux premières semaines, surtout après l'excentrique.</li><li>Prochaine séance de renfo dans 2 à 4 jours.</li></ul></section>
    <div class="sticky"><button class="cta" id="home">Retour à l'accueil</button></div>`, false);
  $('#home').onclick = () => { S.session = null; location.hash = '#/'; };
  return;
}
const it = s.items[p.i], r = repsInfo(it.reps);
const side = it.uni ? (p.side || 1) : 0;
const head = `<div class="ptop"><a class="back" href="#/seance">${I.back}</a><div class="pi"><small>Exercice ${p.i + 1}/${total} · série ${p.set}/${it.sets}${side ? ' · ' + (side === 1 ? 'droite' : 'gauche') : ''}</small><div class="prog"><i style="width:${Math.max(3, Math.round(100 * (p.i + (p.set - 1) / it.sets) / total))}%"></i></div></div></div>`;
if (p.phase === 'rest') {
  const T0 = p.t0 || p.t;
  view(`${head}<div class="ringbig" id="ring">${ring(1 - p.t / T0, 190, 10)}<div class="clock rest" id="clock">${fmt(p.t)}</div></div>
    <p class="center muted">Repos · ensuite : ${p.nextLabel}</p>
    <div class="stage small" id="stage"></div>
    <div class="sticky"><button class="cta" id="skip">Passer le repos</button><button class="btn-ghost" id="more">+ 30 s</button></div>`, false);
  stopAnim = RIG3D.mount($('#stage'), animOf(s.items[p.nextI]), { dist: .9 });
  timer = setInterval(() => { p.t--; if (p.t <= 0) { clearTimer(); beep(2); advance(); } else { $('#clock').textContent = fmt(p.t); $('#ring svg').outerHTML = ring(1 - p.t / T0, 190, 10); if (p.t === 3) beep(1); } }, 1000);
  $('#skip').onclick = () => { clearTimer(); advance(); };
  $('#more').onclick = () => { p.t += 30; p.t0 = Math.max(T0, p.t); $('#clock').textContent = fmt(p.t); };
  return;
}
view(`${head}<div class="stage" id="stage"><span class="hint3d">3D · glisse pour tourner</span></div>
  <section class="panel"><h1>${esc(it.name)}</h1><p class="dose">${esc(it.reps)}${it.tempo ? ' · ' + esc(it.tempo) : ''}</p>
    ${r.timed ? `<div class="clock" id="clock">${fmt(p.t || r.secs)}</div>` : ''}
    <ol class="cues">${it.ex.cues.slice(0, 3).map(c => `<li><span>${esc(c)}</span></li>`).join('')}</ol></section>
  <div class="sticky">${r.timed ? `<button class="cta" id="go">${p.running ? 'En cours…' : 'Lancer le chrono'}</button>` : `<button class="cta" id="done">${I.check} Série faite</button>`}<a class="btn-ghost" href="#/exo/${it.id}">Voir la fiche complète</a></div>`, false);
stopAnim = RIG3D.mount($('#stage'), animOf(it));
if (r.timed) {
  p.t = p.t || r.secs;
  $('#go').onclick = () => { if (p.running) return; p.running = true; $('#go').textContent = 'En cours…'; timer = setInterval(() => { p.t--; $('#clock').textContent = fmt(Math.max(0, p.t)); if (p.t <= 0) { clearTimer(); beep(2); p.running = false; p.t = 0; finishSet(); } }, 1000); };
} else $('#done').onclick = finishSet;
function finishSet() {
  p.t = 0; p.running = false;
  if (it.uni && (p.side || 1) === 1) { p.side = 2; p.nextI = p.i; p.nextLabel = 'même exercice, autre côté'; p.phase = 'rest'; p.t = p.t0 = 15; renderPlayer(); return; }
  p.side = 1;
  if (p.set < it.sets) { p.set++; p.nextI = p.i; p.nextLabel = `${esc(it.name)} · série ${p.set}`; p.phase = 'rest'; p.t = p.t0 = it.rest; renderPlayer(); return; }
  if (p.i + 1 < total) { p.i++; p.set = 1; p.nextI = p.i; p.nextLabel = esc(s.items[p.i].name); p.phase = 'rest'; p.t = p.t0 = Math.min(it.rest, 90); renderPlayer(); return; }
  finish();
}
function advance() { p.phase = 'work'; p.t = 0; renderPlayer(); }
function finish() {
  const h = LS('renfo.history') || []; h.push({ date: new Date().toISOString(), type: s.cfg.type, zone: s.zone, dur: s.total, n: total }); LS('renfo.history', h.slice(-100));
  p.phase = 'done'; renderPlayer();
}
}
// ---------- Routeur ----------
function route() {
const h = location.hash || '#/';
const m = h.match(/^#\/exo\/([\w-]+)(\/liste)?/);
clearTimer();
if (m) return renderExo(m[1], !!m[2]);
if (h.startsWith('#/seance')) return renderSession();
if (h.startsWith('#/player')) return renderPlayer();
if (h.startsWith('#/sources')) return renderSources();
if (h.startsWith('#/exos')) return renderList();
renderHome();
}
window.addEventListener('hashchange', route);
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && S.player) keepAwake(); });
window.RENFO = { generate, instantiate, TYPES, SLOTS, REHAB };
route();
if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js').catch(() => { });

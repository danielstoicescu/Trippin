// Barcelona Aventura – Mara (13), Anne & Daniel. Offline-first, Material 3, mobil.
import { TRIP, ZONES, DAY_ZONES, DAY_TIPS, ITINERARY, ALTERNATIVES, CURATED } from './data.js';

const TRIP_ID = TRIP.id;
const DAYS = ['thu', 'fri', 'sat', 'sun', 'mon'];
const DAY_LABEL = { thu: 'Joi 5', fri: 'Vineri 6', sat: 'Sâmbătă 7', sun: 'Duminică 8', mon: 'Luni 9' };
const PEOPLE = ['Daniel', 'Mara', 'Anne'];
const COFFEE_GOAL = 20;
const LS = { locations: 'bcn_locations', coffee: 'bcn_coffee', quests: 'bcn_quests', visited: 'bcn_visited', pins: 'bcn_pins', notes: 'bcn_notes', skipped: 'bcn_skipped', photos: 'bcn_photos', theme: 'bcn_theme', alerted: 'bcn_alerted', view: 'bcn_view' };
const SUMMARY_TEXT = `Barcelona Aventura (Mara 13, Anne & Daniel), 4–9 nov:
• Baza: Poblenou (Bac de Roda)
• Joi 5: PortAventura (Shambhala, Dragon Khan, Halloween)
• Vineri 6: tren spre BCN, Nomad Coffee, Demasié, Banh Mi Club, Bitácora
• Sâmbătă 7: Satan's Coffee & El Call, churros 1968, toboganul Sephora, Raval, Bar del Pla, MNAC gratis, pinchos Blai
• Duminică 8: Three Marks, Sagrada Família, SAISEI, Design Museum gratis, apus la Bunkers, Gràcia
• Luni 9: Encants, Print Workers, La Cova Fumada, plajă, Hofmann, Quimet & Quimet`;

const state = {
  view: 'plan', day: 'thu', filter: 'all',
  custom: [], coffee: 0, quests: {}, visited: {}, pins: {}, notes: '', skipped: {}, photos: {},
  online: false, radarOn: false, pos: null, watchId: null, alerted: {},
  installPrompt: null, map: null, markers: [], meMarker: null, detailId: null, photoTarget: null,
};
let fb = null;

// ---------- Utilitare ----------
const $ = (s) => document.querySelector(s);
const $$ = (s) => Array.from(document.querySelectorAll(s));
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const icon = (name, cls = '') => `<span class="material-symbols-rounded ${cls}">${name}</span>`;
const mapsSearch = (q) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q + (/(barcelona|salou|vila-seca|portaventura)/i.test(q) ? '' : ' Barcelona'))}`;
const placeQuery = (loc) => loc.placeQuery || (loc.address ? `${loc.title}, ${loc.address}` : loc.title);
const allLocs = () => [...ITINERARY, ...state.custom];
const findLoc = (id) => allLocs().find((l) => l.id === id) || (String(id).startsWith('alt-') ? altAsLoc(Number(id.slice(4))) : null);
function altAsLoc(i) { const a = ALTERNATIVES[i]; return a ? { ...a, id: 'alt-' + i, isAlt: true, altIndex: i, radius: 150 } : null; }
function enriched(loc) { const c = loc.isCustom ? CURATED[(loc.title || '').trim().toLowerCase()] : null; return c ? { ...c, ...loc, rating: loc.rating ?? c.rating, review: loc.review ?? c.review, popular: loc.popular ?? c.popular, tips: loc.tips ?? c.tips, hours: loc.hours || c.hours, price: loc.price || c.price } : loc; }
function coordsOf(loc) {
  const pin = state.pins[loc.id];
  if (pin && typeof pin.lat === 'number') return { lat: pin.lat, lng: pin.lng, exact: true };
  if (typeof loc.lat === 'number' && typeof loc.lng === 'number') return { lat: loc.lat, lng: loc.lng, exact: !loc.approx };
  return null;
}
const destOf = (loc) => { const p = coordsOf(loc); if (p && p.exact) return `${p.lat},${p.lng}`; const a = loc.placeQuery || loc.address || loc.title; return /(barcelona|salou|vila-seca|portaventura)/i.test(a) ? a : `${a}, Barcelona`; };
const mapsNav = (loc, mode = 'walking') => `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destOf(loc))}&travelmode=${mode}`;
const lsGet = (k, d) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } };
const lsSet = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };
function distanceM(a, b) { const R = 6371000, r = (d) => (d * Math.PI) / 180; const dLat = r(b.lat - a.lat), dLng = r(b.lng - a.lng); const s = Math.sin(dLat / 2) ** 2 + Math.cos(r(a.lat)) * Math.cos(r(b.lat)) * Math.sin(dLng / 2) ** 2; return 2 * R * Math.asin(Math.sqrt(s)); }
const fmtDist = (m) => (m < 1000 ? `${Math.round(m / 10) * 10} m` : `${(m / 1000).toFixed(1)} km`);
const walkMin = (m) => Math.max(1, Math.round(m / 80));
function parseRange(t) { const m = /(\d{1,2}):(\d{2})\s*[–-]\s*(\d{1,2}):(\d{2})/.exec(t || ''); return m ? { from: +m[1] * 60 + +m[2], to: +m[3] * 60 + +m[4] } : null; }
const startMin = (loc) => { const r = parseRange(loc.time); if (r) return r.from; const m = /(\d{1,2}):(\d{2})/.exec(loc.time || ''); return m ? +m[1] * 60 + +m[2] : 10000; };
const fmtCount = (n) => (n >= 1000 ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k` : String(n));

let toastTimer;
function toast(message, ic = 'check_circle', ms = 3200) {
  $('#toastMessage').textContent = message; $('#toastIcon').textContent = ic;
  $('#toast').classList.remove('hidden-toast'); clearTimeout(toastTimer); toastTimer = setTimeout(() => $('#toast').classList.add('hidden-toast'), ms);
}
function setSyncStatus(mode, detail) {
  const el = $('#syncStatus'); if (!el) return;
  el.innerHTML = mode === 'online' ? `${icon('cloud_done', 'ms-16')} Live · Mara · Anne · Daniel` : mode === 'local' ? `${icon('smartphone', 'ms-16')} Doar pe acest telefon` : `${icon('sync', 'ms-16')} Se conectează…`;
  el.style.color = mode === 'online' ? 'var(--success)' : ''; el.title = detail || '';
}
function ripple(e) {
  const el = e.target.closest('.btn, .chip, .list-item, .icon-btn, .nav-btn'); if (!el) return;
  const r = el.getBoundingClientRect(), d = Math.max(r.width, r.height);
  const s = document.createElement('span'); s.className = 'ripple'; s.style.cssText = `width:${d}px;height:${d}px;left:${e.clientX - r.left - d / 2}px;top:${e.clientY - r.top - d / 2}px`;
  el.appendChild(s); setTimeout(() => s.remove(), 600);
}

// ---------- Timp ----------
function todayKey() { const t = new Date(), iso = `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`; return DAYS.find((d) => TRIP.days[d] === iso) || null; }
function isNow(loc) { if (todayKey() !== loc.day) return false; const r = parseRange(loc.time); if (!r) return false; const m = new Date().getHours() * 60 + new Date().getMinutes(); return m >= r.from - 15 && m <= r.to; }
function countdownText() {
  const start = new Date(TRIP.start + 'T00:00:00'), end = new Date(TRIP.days.mon + 'T23:59:59'), now = new Date();
  const days = Math.ceil((start - now) / 86400000);
  if (now > end) return 'A fost o excursie!'; if (days > 1) return `${days} zile până la plecare`; if (days === 1) return 'Mâine plecăm!'; return 'Suntem în Barcelona!';
}

// ---------- Categorii ----------
const CAT = {
  mara: { cls: 'cat-mara', icon: 'auto_awesome', label: 'Mara', badge: 'badge-secondary' },
  coffee: { cls: 'cat-coffee', icon: 'local_cafe', label: 'Cafea & bere', badge: 'badge-tertiary' },
  food: { cls: 'cat-food', icon: 'restaurant', label: 'Mâncare', badge: 'badge-success' },
  art: { cls: 'cat-art', icon: 'palette', label: 'Artă & vederi', badge: 'badge-primary' },
};
const cat = (c) => CAT[c] || { cls: 'cat-none', icon: 'location_on', label: 'Loc', badge: 'badge-neutral' };
const SOURCE = { instagram: 'Reel Instagram', tiktok: 'TikTok', youtube: 'YouTube', gmaps: 'Google Maps', web: 'Link' };

function dayItems(day, includeSkipped = false) {
  return allLocs().filter((l) => l.day === day && (includeSkipped || !state.skipped[l.id]))
    .map((l, i) => ({ l, i })).sort((a, b) => startMin(a.l) - startMin(b.l) || a.i - b.i).map((x) => x.l);
}
const photoOf = (id) => state.photos[id]?.data || null;
function thumbHTML(loc, n, sizeCls = '') {
  const c = cat(loc.cat), ph = photoOf(loc.id);
  return `<div class="thumb ${c.cls} ${sizeCls}">${ph ? `<img src="${ph}" alt="">` : icon(c.icon, 'ms-fill')}${n != null ? `<span class="num">${n}</span>` : ''}</div>`;
}
const stars = (r) => r ? `<span class="inline-flex items-center gap-0.5 font-bold" style="color: var(--tertiary)">${icon('star', 'ms-fill ms-16')}${Number(r).toFixed(1)}</span>` : '';

// ---------- Plan: listă ----------
function listItemHTML(loc, n) {
  const visited = !!state.visited[loc.id], skipped = !!state.skipped[loc.id], now = isNow(loc);
  const p = coordsOf(loc), dist = state.pos && p ? distanceM(state.pos, p) : null;
  const meta = [loc.time ? esc(loc.time) : '', loc.rating ? stars(loc.rating) : '', loc.free ? `<span style="color: var(--success)">gratis</span>` : '', loc.price && !loc.free ? esc(loc.price.split('·')[0].split('(')[0].trim()) : ''].filter(Boolean).join(' · ');
  const line2 = [loc.short ? esc(loc.short) : esc((loc.desc || '').slice(0, 70)), dist != null ? `<span style="color: var(--primary)">${fmtDist(dist)} · ${walkMin(dist)} min</span>` : ''].filter(Boolean).join(' · ');
  return `
    <button class="list-item ${visited ? 'done' : ''} ${skipped ? 'skipped' : ''} ${now ? 'now' : ''}" data-action="open-detail" data-id="${esc(loc.id)}" id="loc-${esc(loc.id)}">
      ${thumbHTML(loc, skipped ? null : n)}
      <div class="min-w-0 flex-1">
        <div class="flex items-center gap-1.5 flex-wrap mb-0.5">
          ${now ? '<span class="badge badge-primary">ACUM</span>' : ''}
          ${loc.isCustom ? `<span class="badge badge-secondary">${icon('auto_awesome', 'ms-16')} ${esc(loc.addedBy || 'noi')}</span>` : ''}
          ${loc.verify ? '<span class="badge badge-tertiary">verifică orele</span>' : ''}
          ${skipped ? '<span class="badge badge-neutral">sărit</span>' : ''}
        </div>
        <div class="t-title text-[15px] ${visited ? 'line-through' : ''}">${esc(loc.title)}</div>
        <div class="text-xs variant mt-0.5 truncate">${meta}</div>
        <div class="text-xs muted mt-0.5 truncate">${line2}</div>
      </div>
      <div class="shrink-0 flex flex-col items-center gap-1">
        ${visited ? icon('check_circle', 'ms-fill') : icon('chevron_right_placeholder')}
      </div>
    </button>`.replace('<span class="material-symbols-rounded ">chevron_right_placeholder</span>', '<span class="material-symbols-rounded muted">expand_more</span>');
}

function renderDay() {
  const c = $('#itinerary-container'); if (!c) return;
  const list = dayItems(state.day, true).filter((l) => state.filter === 'all' || l.cat === state.filter);
  const tip = DAY_TIPS[state.day] ? `<div class="card-filled p-3 flex gap-2 text-xs variant leading-relaxed">${icon('lightbulb', 'ms-20 shrink-0')}<span>${esc(DAY_TIPS[state.day])}</span></div>` : '';
  let n = 0;
  const items = list.length ? `<div class="timeline space-y-2">${list.map((l) => listItemHTML(l, state.skipped[l.id] ? null : ++n)).join('')}</div>`
    : `<div class="card-filled p-6 text-center text-sm muted">Nimic pentru filtrul ales. <button data-action="open-add" class="btn btn-text">Adaugă un loc</button></div>`;
  c.innerHTML = tip + items;
  renderZones();
}
function altCardHTML(a, i) {
  const c = cat(a.cat), d = state.pos && typeof a.lat === 'number' ? distanceM(state.pos, { lat: a.lat, lng: a.lng }) : null;
  return `
    <div class="card p-3 w-[236px] shrink-0 flex flex-col gap-2">
      <div class="flex items-center gap-2"><div class="thumb w-9 h-9 rounded-lg ${c.cls}">${icon(c.icon, 'ms-fill ms-20')}</div><div class="flex flex-wrap gap-1">${a.free ? '<span class="badge badge-success">gratis</span>' : ''}${a.verify ? '<span class="badge badge-tertiary">verifică</span>' : ''}${d != null ? `<span class="badge badge-primary">${fmtDist(d)}</span>` : ''}</div></div>
      <div class="t-title text-[14px]">${esc(a.title)}</div>
      <p class="text-[12px] variant leading-snug line-clamp-3">${esc(a.note)}</p>
      <div class="text-[11px] muted">${a.hours ? esc(a.hours) : ''}${a.price ? ' · ' + esc(a.price) : ''}</div>
      <div class="flex gap-1.5 mt-auto pt-1">
        <button data-action="open-detail" data-id="alt-${i}" class="btn btn-sm btn-tonal flex-1">Detalii</button>
        <button data-action="add-alt" data-index="${i}" class="btn btn-sm btn-filled flex-1">${icon('add', 'ms-18')} În plan</button>
      </div>
    </div>`;
}
function renderZones() {
  const z = $('#zonesContainer'); if (!z) return;
  z.innerHTML = (DAY_ZONES[state.day] || []).map((key) => {
    const alts = ALTERNATIVES.map((a, i) => ({ a, i })).filter(({ a }) => a.zone === key && (state.filter === 'all' || a.cat === state.filter));
    if (!alts.length) return '';
    return `<div><div class="flex items-center gap-2 mb-2 px-1"><span class="material-symbols-rounded ms-20" style="color: var(--primary)">${ZONES[key].icon}</span><span class="eyebrow muted">Similare · ${esc(ZONES[key].label)}</span></div><div class="hscroll -mx-3 px-3">${alts.map(({ a, i }) => altCardHTML(a, i)).join('')}</div></div>`;
  }).join('');
}

// ---------- Următorul pas ----------
function nextStopHTML(compact) {
  const stops = dayItems(state.day).filter((l) => !state.visited[l.id]);
  if (!stops.length) return '';
  const nowMin = new Date().getHours() * 60 + new Date().getMinutes();
  const next = stops.find(isNow) || (todayKey() === state.day ? stops.find((l) => startMin(l) >= nowMin - 15) : null) || stops[0];
  const p = coordsOf(next), d = state.pos && p ? distanceM(state.pos, p) : null;
  const label = isNow(next) ? 'Acum' : todayKey() === state.day ? 'Următorul pas' : `${DAY_LABEL[state.day]} · primul pas`;
  return `<div class="hero-next p-3 flex items-center gap-3 ${compact ? '' : 'xamfra'}" data-action="open-detail" data-id="${esc(next.id)}" role="button">
    ${thumbHTML(next, null, 'w-14 h-14')}
    <div class="min-w-0 flex-1"><div class="eyebrow opacity-70">${label} · ${esc(next.time || '')}</div><div class="t-title text-[15px]">${esc(next.title)}</div><div class="text-[11px] opacity-80 truncate">${d != null ? `${fmtDist(d)} · ${walkMin(d)} min pe jos` : esc(next.address || '')}${next.hours ? ' · ' + esc(next.hours) : ''}</div></div>
    <a href="${esc(mapsNav(next))}" target="_blank" rel="noopener" class="btn btn-sm btn-success shrink-0" onclick="event.stopPropagation()">${icon('directions_walk', 'ms-18')} Du-mă</a>
  </div>`;
}
function renderNextStop() { const h = nextStopHTML(false); const a = $('#nextStop'); if (a) a.innerHTML = h; const b = $('#nextStopExplore'); if (b) b.innerHTML = nextStopHTML(true); }

// ---------- Detaliu ----------
function detailHTML(raw) {
  const loc = enriched(raw), c = cat(loc.cat), id = loc.id;
  const visited = !!state.visited[id], skipped = !!state.skipped[id];
  const p = coordsOf(loc), d = state.pos && p ? distanceM(state.pos, p) : null;
  const ph = photoOf(id);
  const hero = ph ? `<div class="relative -mx-4 -mt-2 h-56 overflow-hidden"><img src="${ph}" class="w-full h-full object-cover" alt=""><div class="absolute bottom-2 right-2 badge badge-inverse">${icon('photo_camera', 'ms-16')} ${esc(state.photos[id].by || 'noi')}</div></div>`
    : `<div class="relative -mx-4 -mt-2 h-32 ${c.cls} grid place-items-center text-white/80">${icon(c.icon, 'ms-fill ms-40')}<button data-action="add-photo" data-id="${esc(id)}" class="btn btn-sm absolute bottom-2 right-2" style="background: rgba(255,255,255,.92); color: var(--on-surface)">${icon('add_a_photo', 'ms-18')} Adaugă poză</button></div>`;
  const chips = [
    `<span class="badge ${c.badge}">${icon(c.icon, 'ms-16')} ${esc(loc.catLabel || c.label)}</span>`,
    loc.time ? `<span class="badge badge-neutral">${icon('schedule', 'ms-16')} ${esc(loc.time)}</span>` : '',
    loc.free ? `<span class="badge badge-success">${icon('sell', 'ms-16')} gratis</span>` : '',
    loc.verify ? '<span class="badge badge-tertiary">verifică orele</span>' : '',
    d != null ? `<span class="badge badge-primary">${icon('directions_walk', 'ms-16')} ${fmtDist(d)} · ${walkMin(d)} min</span>` : '',
    loc.isCustom ? `<span class="badge badge-secondary">${esc(loc.addedBy || 'noi')}</span>` : '', loc.isAlt ? '<span class="badge badge-neutral">recomandare</span>' : '',
  ].filter(Boolean).join('');
  const rating = loc.rating ? `<div class="flex items-center gap-2 text-sm"><span class="t-headline text-2xl" style="color: var(--tertiary)">${Number(loc.rating).toFixed(1)}</span><div>${'★'.repeat(Math.round(loc.rating))}<span class="muted">${'★'.repeat(5 - Math.round(loc.rating))}</span><div class="text-[11px] muted">${loc.ratingCount ? fmtCount(loc.ratingCount) + ' recenzii · ' : ''}Google, sept. 2026</div></div></div>` : '';
  const section = (ic, title, body) => `<div class="card p-3.5"><div class="eyebrow muted mb-2 flex items-center gap-1.5">${icon(ic, 'ms-18')} ${title}</div>${body}</div>`;
  const review = loc.review ? section('format_quote', 'Un review', `<p class="text-[13px] leading-relaxed italic variant">„${esc(loc.review)}”</p>`) : '';
  const popular = loc.popular?.length ? section('thumb_up', 'Cel mai popular', `<ul class="space-y-1.5">${loc.popular.map((x) => `<li class="flex gap-2 text-[13px]"><span class="material-symbols-rounded ms-18" style="color: var(--secondary)">check</span><span>${esc(x)}</span></li>`).join('')}</ul>`) : '';
  const tips = loc.tips?.length ? section('tips_and_updates', 'Tips & tricks', `<ul class="space-y-1.5">${loc.tips.map((x) => `<li class="flex gap-2 text-[13px]"><span class="material-symbols-rounded ms-18" style="color: var(--tertiary)">bolt</span><span>${esc(x)}</span></li>`).join('')}</ul>`) : '';
  const info = [
    loc.hours ? `<div class="flex gap-2 text-[13px]">${icon('schedule', 'ms-18 muted')}<span>${esc(loc.hours)}</span></div>` : '',
    loc.price ? `<div class="flex gap-2 text-[13px]">${icon('euro', 'ms-18 muted')}<span>${esc(loc.price)}</span></div>` : '',
    loc.address ? `<div class="flex gap-2 text-[13px]">${icon('location_on', 'ms-18 muted')}<span>${esc(loc.address)}${p && !p.exact ? ' <span class="muted">(poziție aprox.)</span>' : ''}</span></div>` : '',
    loc.link ? `<a href="${esc(loc.link)}" target="_blank" rel="noopener" class="flex gap-2 text-[13px]" style="color: var(--primary)">${icon('link', 'ms-18')}<span>Deschide ${esc(SOURCE[loc.source] || 'linkul')}</span></a>` : '',
  ].filter(Boolean).join('');
  const actions = loc.isAlt
    ? `<button data-action="add-alt" data-index="${loc.altIndex}" class="btn btn-lg btn-secondary w-full">${icon('add')} Pune în program</button>`
    : `<div class="grid grid-cols-2 gap-2">
        <button data-action="toggle-visited" data-id="${esc(id)}" class="btn ${visited ? 'btn-tonal' : 'btn-success'}">${icon(visited ? 'undo' : 'check', 'ms-20')} ${visited ? 'Am fost' : 'Bifează'}</button>
        ${loc.isCustom ? `<button data-action="edit-loc" data-id="${esc(id)}" class="btn btn-tonal">${icon('edit', 'ms-20')} Editează</button>` : `<button data-action="toggle-skip" data-id="${esc(id)}" class="btn btn-tonal">${icon(skipped ? 'undo' : 'skip_next', 'ms-20')} ${skipped ? 'Pune înapoi' : 'Sari peste'}</button>`}
        ${ph ? `<button data-action="add-photo" data-id="${esc(id)}" class="btn btn-outlined">${icon('add_a_photo', 'ms-20')} Altă poză</button>` : `<button data-action="pin-here" data-id="${esc(id)}" class="btn btn-outlined" ${state.pos ? '' : 'disabled'}>${icon('push_pin', 'ms-20')} Fixează aici</button>`}
        ${loc.isCustom ? `<button data-action="delete-loc" data-id="${esc(id)}" class="btn btn-outlined" style="color: var(--secondary)">${icon('delete', 'ms-20')} Șterge</button>` : `<button data-action="pin-here" data-id="${esc(id)}" class="btn btn-outlined ${ph ? '' : 'hidden'}" ${state.pos ? '' : 'disabled'}>${icon('push_pin', 'ms-20')} Fixează aici</button>`}
      </div>`;
  return `
    <div class="sheet-handle"></div>
    ${hero}
    <div class="pt-3 space-y-3">
      <div class="flex items-start justify-between gap-2">
        <div class="min-w-0"><div class="flex flex-wrap gap-1 mb-1.5">${chips}</div><h3 class="t-headline text-[22px] normal-case" style="text-transform:none">${esc(loc.title)}</h3>${loc.short ? `<div class="text-sm variant mt-0.5">${esc(loc.short)}</div>` : ''}</div>
        <button data-action="close-modal" class="icon-btn icon-btn-sm shrink-0" aria-label="Închide">${icon('close')}</button>
      </div>
      ${rating}
      <div class="flex gap-2">
        <a href="${esc(mapsNav(loc))}" target="_blank" rel="noopener" class="btn btn-lg btn-filled flex-1">${icon('directions_walk')} Navighează</a>
        <a href="${esc(mapsSearch(placeQuery(loc)))}" target="_blank" rel="noopener" class="btn btn-lg btn-tonal">${icon('map')} Maps</a>
      </div>
      <p class="t-body">${esc(loc.desc || loc.note || '')}</p>
      ${info ? `<div class="space-y-1.5">${info}</div>` : ''}
      ${review}${popular}${tips}
      ${actions}
    </div>`;
}
function openDetail(id) {
  const loc = findLoc(id); if (!loc) return;
  state.detailId = id; $('#detailBody').innerHTML = detailHTML(loc); $('#detailSheet').classList.remove('hidden'); $('#detailBody').scrollTop = 0;
}
function refreshDetail() { if (state.detailId && !$('#detailSheet').classList.contains('hidden')) { const loc = findLoc(state.detailId); if (loc) $('#detailBody').innerHTML = detailHTML(loc); else closeModals(); } }

// ---------- Poze ----------
function compressImage(file, max = 1100, q = 0.74) {
  return new Promise((resolve, reject) => {
    const img = new Image(), url = URL.createObjectURL(file);
    img.onload = () => {
      const s = Math.min(1, max / Math.max(img.width, img.height));
      const cv = document.createElement('canvas'); cv.width = Math.round(img.width * s); cv.height = Math.round(img.height * s);
      cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height); URL.revokeObjectURL(url);
      let data = cv.toDataURL('image/jpeg', q); let qq = q;
      while (data.length > 900000 && qq > 0.4) { qq -= 0.1; data = cv.toDataURL('image/jpeg', qq); }
      resolve(data);
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Nu am putut citi imaginea.')); };
    img.src = url;
  });
}
async function savePhoto(id, file) {
  toast('Comprim poza…', 'hourglass_top', 8000);
  const data = await compressImage(file);
  if (data.length > 950000) return toast('Poza e prea mare chiar și comprimată.', 'image');
  const by = lsGet('bcn_me', 'Daniel');
  const doc = { data, by, at: new Date().toISOString() };
  state.photos[id] = doc;
  if (fb && state.online) { const { db, fs } = fb; await fs.setDoc(fs.doc(db, 'trips', TRIP_ID, 'photos', id), { ...doc, at: fs.serverTimestamp() }); }
  else lsSet(LS.photos, state.photos);
  renderAll(); refreshDetail(); toast('Poza a fost salvată pentru toți.');
}

// ---------- Zile / filtre / ecrane ----------
function switchDay(day) {
  if (!DAYS.includes(day)) return; state.day = day;
  $$('.day-tab').forEach((b) => { b.classList.toggle('selected', b.dataset.day === day); b.classList.toggle('today', b.dataset.day === todayKey()); });
  $$('.explore-day').forEach((b) => b.classList.toggle('selected', b.dataset.day === day));
  const t = $('#exploreTitle'); if (t) t.textContent = DAY_LABEL[day] + (todayKey() === day ? ' · azi' : '');
  renderDay(); renderMap(); renderNextStop();
}
function setFilter(c) { state.filter = c; $$('.chip[data-cat]').forEach((b) => b.classList.toggle('selected', b.dataset.cat === c)); renderDay(); }
function renderCoffee() { $('#coffeeCountDisplay').textContent = `${state.coffee} / ${COFFEE_GOAL}`; }
function renderQuests() { $$('.quest-check').forEach((cb) => { cb.checked = !!state.quests[cb.dataset.quest]; }); }
function renderNotes() { const ta = $('#sharedNotes'); if (ta && document.activeElement !== ta) ta.value = state.notes || ''; }
function renderAll() { renderDay(); renderMap(); renderNextStop(); renderNearby(); }
function setView(v) {
  if (!['plan', 'explore', 'info'].includes(v)) v = 'plan';
  state.view = v; lsSet(LS.view, v);
  $('#pinSheet').classList.add('hidden'); $('#radarBanner').classList.add('hidden');
  $$('section[data-view]').forEach((s) => s.classList.toggle('hidden', s.dataset.view !== v));
  $$('.nav-btn').forEach((b) => b.classList.toggle('selected', b.dataset.view === v));
  window.scrollTo({ top: 0 });
  if (v === 'explore') { ensureMap(); renderMap(); renderNextStop(); if (!state.radarOn) startRadar(); }
  if (v === 'info') { const url = location.href.split('#')[0].split('?')[0]; $('#shareUrl').value = url; $('#whatsappShareBtn').href = `https://wa.me/?text=${encodeURIComponent(`${SUMMARY_TEXT}\n\n📱 Ghidul live: ${url}`)}`; }
}
function applyThemeIcon() { const dark = document.documentElement.classList.contains('dark'); $('#themeIcon').textContent = dark ? 'light_mode' : 'dark_mode'; $('meta[name="theme-color"]')?.setAttribute('content', dark ? '#131312' : '#F7F5EE'); }
function toggleTheme() { const h = document.documentElement; const d = h.classList.toggle('dark'); h.classList.toggle('light', !d); try { localStorage.setItem(LS.theme, d ? 'dark' : 'light'); } catch {} applyThemeIcon(); }

// ---------- Share ----------
async function share() {
  const url = location.href.split('#')[0].split('?')[0];
  if (navigator.share && location.protocol === 'https:') { try { await navigator.share({ title: 'Barcelona Aventura', text: 'Ghidul nostru de vacanță în Barcelona & PortAventura (4–9 noiembrie).', url }); return; } catch (e) { if (e && e.name === 'AbortError') return; } }
  setView('info');
}
async function copyText(text, ok) { try { await navigator.clipboard.writeText(text); } catch { const ta = document.createElement('textarea'); ta.value = text; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); } catch {} ta.remove(); } toast(ok); }
function dayRoute() {
  const stops = dayItems(state.day).filter((l) => !state.visited[l.id]);
  if (!stops.length) return toast('Nu mai e nimic de vizitat azi.');
  const pts = stops.map(destOf); const origin = state.pos ? `${state.pos.lat},${state.pos.lng}` : pts.shift(); const destination = pts.pop() ?? origin; const wp = pts.slice(0, 9);
  const url = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}${wp.length ? `&waypoints=${encodeURIComponent(wp.join('|'))}` : ''}&travelmode=${state.day === 'thu' ? 'driving' : 'transit'}`;
  if (pts.length > 9) toast('Google Maps primește maximum 9 opriri; am trimis primele.', 'info');
  window.open(url, '_blank', 'noopener');
}

// ---------- Persistență ----------
function loadLocal() { state.custom = lsGet(LS.locations, []); state.coffee = Number(lsGet(LS.coffee, 0)) || 0; state.quests = lsGet(LS.quests, {}); state.visited = lsGet(LS.visited, {}); state.pins = lsGet(LS.pins, {}); state.notes = lsGet(LS.notes, ''); state.skipped = lsGet(LS.skipped, {}); state.photos = lsGet(LS.photos, {}); state.alerted = lsGet(LS.alerted, {}); }
function persistLocal() { lsSet(LS.locations, state.custom); lsSet(LS.coffee, state.coffee); lsSet(LS.quests, state.quests); lsSet(LS.visited, state.visited); lsSet(LS.pins, state.pins); lsSet(LS.notes, state.notes); lsSet(LS.skipped, state.skipped); }
async function loadFirebaseConfig() {
  const local = window.FIREBASE_CONFIG; if (local && local.apiKey && local.projectId) return local;
  try { const res = await fetch('/__/firebase/init.json', { cache: 'no-store' }); if (res.ok) { const cfg = await res.json(); if (cfg && cfg.apiKey && cfg.projectId) return cfg; } } catch {}
  return null;
}
async function connectFirebase() {
  const cfg = await loadFirebaseConfig(); if (!cfg) { setSyncStatus('local', 'Fără configurație Firebase.'); return; }
  try {
    const V = '11.6.1';
    const [{ initializeApp }, fs] = await Promise.all([import(`https://www.gstatic.com/firebasejs/${V}/firebase-app.js`), import(`https://www.gstatic.com/firebasejs/${V}/firebase-firestore.js`)]);
    const app = initializeApp(cfg);
    let db; try { db = fs.initializeFirestore(app, { localCache: fs.persistentLocalCache({ tabManager: fs.persistentMultipleTabManager() }) }); } catch { db = fs.getFirestore(app); }
    fb = { db, fs };
    let first = true;
    fs.onSnapshot(fs.query(fs.collection(db, 'trips', TRIP_ID, 'locations'), fs.orderBy('createdAt', 'asc')), (snap) => {
      state.custom = snap.docs.map((d) => ({ id: d.id, isCustom: true, ...d.data() })); lsSet(LS.locations, state.custom); renderAll(); refreshDetail();
      if (first) { first = false; state.online = true; setSyncStatus('online'); }
    }, (err) => { console.error(err); state.online = false; setSyncStatus('local', err.message); toast('Nu m-am putut conecta la baza de date. Salvez local.', 'info'); });
    fs.onSnapshot(fs.doc(db, 'trips', TRIP_ID, 'state', 'shared'), (snap) => {
      const d = snap.data() || {};
      if (typeof d.coffeeCount === 'number') state.coffee = d.coffeeCount;
      for (const k of ['quests', 'visited', 'pins', 'skipped']) if (d[k] && typeof d[k] === 'object') state[k] = d[k];
      if (typeof d.notes === 'string') state.notes = d.notes;
      persistLocal(); renderCoffee(); renderQuests(); renderNotes(); renderAll(); refreshDetail();
    }, (err) => console.error(err));
    fs.onSnapshot(fs.collection(db, 'trips', TRIP_ID, 'photos'), (snap) => {
      state.photos = {}; snap.forEach((d) => { state.photos[d.id] = d.data(); }); renderAll(); refreshDetail();
    }, (err) => console.error(err));
  } catch (err) { console.error(err); setSyncStatus('local', err.message); }
}
async function saveShared(patch) { if (fb && state.online) { const { db, fs } = fb; await fs.setDoc(fs.doc(db, 'trips', TRIP_ID, 'state', 'shared'), { ...patch, updatedAt: fs.serverTimestamp() }, { merge: true }); } else persistLocal(); }
async function saveLocation(data, editingId) {
  if (fb && state.online && !(editingId && String(editingId).startsWith('local-'))) {
    const { db, fs } = fb;
    if (editingId) await fs.updateDoc(fs.doc(db, 'trips', TRIP_ID, 'locations', editingId), data);
    else await fs.addDoc(fs.collection(db, 'trips', TRIP_ID, 'locations'), { ...data, createdAt: fs.serverTimestamp() });
  } else {
    if (editingId) state.custom = state.custom.map((l) => (l.id === editingId ? { ...l, ...data } : l));
    else state.custom.push({ ...data, id: 'local-' + Date.now(), isCustom: true, createdAt: new Date().toISOString() });
    persistLocal(); renderAll();
  }
}
async function deleteLocation(id) {
  if (!confirm('Ștergi acest loc din programul comun?')) return;
  if (fb && state.online && !String(id).startsWith('local-')) { const { db, fs } = fb; await fs.deleteDoc(fs.doc(db, 'trips', TRIP_ID, 'locations', id)); }
  else { state.custom = state.custom.filter((l) => l.id !== id); persistLocal(); renderAll(); }
  closeModals(); toast('Locul a fost șters.', 'delete');
}
async function updateCoffee(delta) { state.coffee = Math.max(0, state.coffee + delta); renderCoffee(); await saveShared({ coffeeCount: state.coffee }); if (state.coffee === COFFEE_GOAL) toast('20 de espresso! Daniel, ești oficial barcelonez.', 'celebration'); }
async function setQuest(k, done) { state.quests = { ...state.quests, [k]: done }; await saveShared({ quests: state.quests }); if (done) toast('Quest bifat!', 'celebration'); }
async function toggleVisited(k) { state.visited = { ...state.visited, [k]: !state.visited[k] }; renderAll(); refreshDetail(); await saveShared({ visited: state.visited }); }
async function toggleSkip(k) { state.skipped = { ...state.skipped, [k]: !state.skipped[k] }; renderAll(); refreshDetail(); await saveShared({ skipped: state.skipped }); toast(state.skipped[k] ? 'Scos din program. Îl poți pune înapoi oricând.' : 'Pus înapoi în program.'); }
async function pinHere(k) { if (!state.pos) return toast('Nu am încă poziția ta. Deschide Explorare.', 'my_location'); state.pins = { ...state.pins, [k]: { lat: state.pos.lat, lng: state.pos.lng } }; renderAll(); refreshDetail(); await saveShared({ pins: state.pins }); toast('Poziția exactă a fost salvată pentru toți.', 'push_pin'); }
let notesTimer;
function onNotesInput() { state.notes = $('#sharedNotes').value.slice(0, 2000); $('#notesStatus').textContent = 'Se salvează…'; clearTimeout(notesTimer); notesTimer = setTimeout(async () => { try { await saveShared({ notes: state.notes }); $('#notesStatus').textContent = state.online ? 'Salvat și sincronizat ✓' : 'Salvat pe acest telefon ✓'; } catch { $('#notesStatus').textContent = 'Eroare la salvare'; } }, 700); }

// ---------- Adăugare: link / Reel / Maps ----------
function parseShared(text) {
  const out = { text: (text || '').trim(), url: null, source: null, title: '', lat: null, lng: null };
  const m = /https?:\/\/[^\s<>"']+/i.exec(out.text); if (m) out.url = m[0].replace(/[),.]+$/, '');
  const lines = out.text.split(/\n+/).map((s) => s.trim()).filter((s) => s && !/^https?:\/\//i.test(s));
  if (out.url) {
    let u; try { u = new URL(out.url); } catch { u = null; }
    const host = u ? u.hostname.replace(/^www\./, '') : '';
    if (/instagram\.com/.test(host)) out.source = 'instagram'; else if (/tiktok\.com/.test(host)) out.source = 'tiktok'; else if (/youtu\.?be/.test(host)) out.source = 'youtube';
    else if ((u && /google\.[a-z.]+$/.test(host) && /\/maps/.test(u.pathname)) || /maps\.app\.goo\.gl|goo\.gl\/maps|maps\.google/.test(host + (u?.pathname || ''))) out.source = 'gmaps'; else out.source = 'web';
    if (out.source === 'gmaps' && u) {
      const place = /\/maps\/place\/([^/]+)/.exec(u.pathname); if (place) out.title = decodeURIComponent(place[1].replace(/\+/g, ' '));
      const at = /@(-?\d+\.\d+),(-?\d+\.\d+)/.exec(u.pathname); if (at) { out.lat = +at[1]; out.lng = +at[2]; }
      const d3 = /!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/.exec(u.href); if (d3) { out.lat = +d3[1]; out.lng = +d3[2]; }
      const q = u.searchParams.get('q') || u.searchParams.get('query'); if (q) { const c = /^(-?\d+\.\d+),\s*(-?\d+\.\d+)$/.exec(q); if (c) { out.lat = +c[1]; out.lng = +c[2]; } else if (!out.title) out.title = q; }
    }
  }
  if (!out.title && lines.length) out.title = lines[0].replace(/\s*[|·-]\s*(Instagram|TikTok|YouTube).*$/i, '').slice(0, 120);
  return out;
}
function applyParsed(p) {
  const r = $('#linkResult'); $('#locLink').value = p.url || ''; $('#locSource').value = p.source || '';
  if (p.title && !$('#locTitle').value) $('#locTitle').value = p.title;
  if (typeof p.lat === 'number') { formPos = { lat: p.lat, lng: p.lng }; $('#posInfo').textContent = 'poziție din link ✓'; }
  r.classList.remove('hidden');
  r.innerHTML = p.url ? `<div class="font-bold">${esc(SOURCE[p.source] || 'Link')}${p.title ? ' · ' + esc(p.title) : ''}</div><div class="truncate muted">${esc(p.url)}</div><p class="mt-1 variant">${p.source === 'gmaps' ? 'Numele și poziția au fost preluate. Completează ziua și notele.' : p.source === 'instagram' || p.source === 'tiktok' ? 'Instagram/TikTok nu lasă citirea descrierii fără login. Scrie numele locului și apasă „Maps” ca să-l verifici; linkul rămâne pe card.' : 'Linkul rămâne atașat pe card. Completează numele locului.'}</p>` : '<span style="color: var(--secondary)">Nu am găsit niciun link în text.</span>';
  if (!$('#locTitle').value) $('#locTitle').focus(); else $('#locDesc').focus();
}
async function pasteLink() { try { const t = await navigator.clipboard.readText(); if (t) { $('#linkInput').value = t; applyParsed(parseShared(t)); } else toast('Clipboard-ul e gol.', 'content_paste'); } catch { toast('Nu am acces la clipboard. Lipește manual în câmp.', 'content_paste'); $('#linkInput').focus(); } }
function setAddTab(tab) { $$('.add-tab').forEach((b) => b.classList.toggle('selected', b.dataset.tab === tab)); $('#addTabLink').classList.toggle('hidden', tab !== 'link'); }
let formPos = null;
function resetForm() { $('#addLocationForm').reset(); $('#editingId').value = ''; $('#locLink').value = ''; $('#locSource').value = ''; $('#linkInput').value = ''; $('#linkResult').classList.add('hidden'); $('#posInfo').textContent = ''; formPos = null; $('#useMyPosBtn span:last-child').textContent = 'Sunt aici acum'; $('#addTitle').textContent = 'Adaugă un loc'; $('#saveLocBtn').textContent = 'Salvează în programul comun'; $('#locDay').value = state.day; $('#locAddedBy').value = lsGet('bcn_me', 'Daniel'); }
function openAdd({ tab = 'manual', prefill = {}, shared = null, editing = null } = {}) {
  closeModals(); resetForm(); setAddTab(tab);
  if (editing) {
    $('#addTitle').textContent = 'Editează locul'; $('#saveLocBtn').textContent = 'Salvează modificările'; $('#editingId').value = editing.id;
    $('#locTitle').value = editing.title || ''; $('#locAddedBy').value = editing.addedBy || 'Daniel'; $('#locDay').value = editing.day; $('#locCat').value = editing.cat;
    $('#locTime').value = editing.time || ''; $('#locHours').value = editing.hours || ''; $('#locDesc').value = editing.desc || ''; $('#locNear').checked = !!editing.nearPoblenou;
    $('#locLink').value = editing.link || ''; $('#locSource').value = editing.source || '';
    if (typeof editing.lat === 'number') { formPos = { lat: editing.lat, lng: editing.lng }; $('#posInfo').textContent = 'poziție salvată ✓'; }
  }
  for (const [k, v] of Object.entries(prefill)) { const el = $('#' + k); if (el) el.value = v; }
  if (prefill.pos) { formPos = prefill.pos; $('#posInfo').textContent = 'poziție preluată ✓'; }
  $('#addModal').classList.remove('hidden');
  if (shared) { $('#linkInput').value = shared; applyParsed(parseShared(shared)); } else if (tab === 'link') $('#linkInput').focus(); else if (!editing) $('#locTitle').focus();
}
function closeModals() { $$('[data-modal]').forEach((m) => m.classList.add('hidden')); }
async function handleAddSubmit(e) {
  e.preventDefault();
  const btn = $('#saveLocBtn'), title = $('#locTitle').value.trim(), desc = $('#locDesc').value.trim(); if (!title || !desc) return;
  const data = { title, day: $('#locDay').value, cat: $('#locCat').value, time: $('#locTime').value.trim() || 'Flexibil', desc, hours: $('#locHours').value.trim(), mapLink: mapsSearch(title), addedBy: PEOPLE.includes($('#locAddedBy').value) ? $('#locAddedBy').value : 'Daniel', nearPoblenou: $('#locNear').checked, link: $('#locLink').value.trim(), source: $('#locSource').value.trim() };
  lsSet('bcn_me', data.addedBy);
  if (!data.hours) delete data.hours; if (!data.link) { delete data.link; delete data.source; }
  if (formPos) { data.lat = formPos.lat; data.lng = formPos.lng; }
  const editingId = $('#editingId').value || null;
  btn.disabled = true; btn.textContent = 'Se salvează…';
  try { await saveLocation(data, editingId); switchDay(data.day); closeModals(); resetForm(); toast(editingId ? 'Modificările au fost salvate.' : state.online ? `Salvat și sincronizat de ${data.addedBy}.` : `Salvat pe acest telefon de ${data.addedBy}.`); }
  catch (err) { console.error(err); toast('Eroare la salvare: ' + (err.message || err), 'info'); }
  finally { btn.disabled = false; btn.textContent = editingId ? 'Salvează modificările' : 'Salvează în programul comun'; }
}
function useMyPosition() {
  const b = $('#useMyPosBtn'), lbl = b.querySelector('span:last-child'), done = (pos) => { formPos = pos; lbl.textContent = 'Poziție salvată ✓'; $('#posInfo').textContent = ''; };
  if (state.pos) return done(state.pos);
  if (!navigator.geolocation) return toast('Telefonul nu oferă localizare.', 'my_location');
  lbl.textContent = 'Caut poziția…';
  navigator.geolocation.getCurrentPosition((p) => done({ lat: p.coords.latitude, lng: p.coords.longitude }), () => { toast('Nu am putut lua poziția.', 'my_location'); lbl.textContent = 'Sunt aici acum'; }, { enableHighAccuracy: true, timeout: 10000 });
}
function addAlternative(i) {
  const a = ALTERNATIVES[i]; if (!a) return;
  openAdd({ prefill: { locTitle: a.title, locCat: a.cat, locDay: state.day, locHours: a.hours || '', locDesc: [a.note, a.price ? `Preț: ${a.price}` : '', a.address ? `Adresă: ${a.address}` : ''].filter(Boolean).join('\n'), pos: typeof a.lat === 'number' ? { lat: a.lat, lng: a.lng } : null } });
  $('#locTime').focus();
}
function handleShareTarget() { const u = new URL(location.href); const shared = [u.searchParams.get('title'), u.searchParams.get('text'), u.searchParams.get('url')].filter(Boolean).join('\n'); if (!shared) return; history.replaceState(null, '', u.pathname); openAdd({ tab: 'link', shared }); }

// ---------- Radar ----------
const ALERT_COOLDOWN = 3 * 3600 * 1000;
function radarTargets() {
  const items = [];
  for (const loc of allLocs()) { if (state.skipped[loc.id]) continue; const p = coordsOf(loc); if (p) items.push({ loc, p, kind: loc.isCustom ? 'custom' : 'plan' }); }
  ALTERNATIVES.forEach((a, i) => { if (typeof a.lat === 'number') items.push({ loc: altAsLoc(i), p: { lat: a.lat, lng: a.lng, exact: !a.approx }, kind: 'alt' }); });
  return items;
}
function renderNearby() {
  const list = $('#nearbyList'); if (!list) return;
  if (!state.pos) { list.innerHTML = `<div class="card-filled p-3 text-xs muted">${state.radarOn ? 'Caut poziția…' : 'Apasă „Unde sunt” ca să vezi distanțele.'}</div>`; return; }
  const today = todayKey();
  const items = radarTargets().map((it) => ({ ...it, d: distanceM(state.pos, it.p) })).sort((a, b) => (a.kind === 'alt') - (b.kind === 'alt') || a.d - b.d).slice(0, 8);
  list.innerHTML = items.map(({ loc, d, kind, p }) => `
    <div class="list-item" data-action="open-detail" data-id="${esc(loc.id)}" role="button">
      ${thumbHTML(loc, null, 'w-11 h-11 rounded-lg')}
      <div class="min-w-0 flex-1"><div class="t-title text-[14px] truncate">${esc(loc.title)}</div><div class="text-[11px] muted truncate">${fmtDist(d)} · ${walkMin(d)} min pe jos · ${kind === 'alt' ? 'recomandare' : DAY_LABEL[loc.day]}${loc.time ? ' ' + esc(loc.time) : ''}${!p.exact ? ' · aprox.' : ''}${loc.day === today ? ' · <b style="color: var(--primary)">azi</b>' : ''}</div></div>
      <a href="${esc(mapsNav(loc))}" target="_blank" rel="noopener" class="icon-btn icon-btn-sm shrink-0" style="background: var(--success); color: #fff" aria-label="Navighează" onclick="event.stopPropagation()">${icon('directions_walk', 'ms-20')}</a>
    </div>`).join('');
}
function checkProximity() {
  if (!state.pos || !state.radarOn) return;
  const now = Date.now();
  for (const { loc, p, kind } of radarTargets()) {
    const d = distanceM(state.pos, p); if (d > (loc.radius || 150) || state.visited[loc.id]) continue;
    if (state.alerted[loc.id] && now - state.alerted[loc.id] < ALERT_COOLDOWN) continue;
    state.alerted[loc.id] = now; lsSet(LS.alerted, state.alerted);
    $('#radarBannerTitle').textContent = loc.title; $('#radarBannerMeta').textContent = `${fmtDist(d)} · ${kind === 'alt' ? 'recomandare din zonă' : (loc.time || '')}${loc.hours ? ' · ' + loc.hours : ''}`;
    $('#radarBannerNav').href = mapsNav(loc); $('#radarBanner').classList.remove('hidden');
    try { navigator.vibrate?.([200, 100, 200]); } catch {}
    if ('Notification' in window && Notification.permission === 'granted') { try { new Notification('Sunteți aproape: ' + loc.title, { body: `${fmtDist(d)} · ${loc.hours || loc.time || ''}`, icon: '/icon-192.png', tag: 'bcn-' + loc.id }); } catch {} }
    break;
  }
}
function onPosition(p) {
  state.pos = { lat: p.coords.latitude, lng: p.coords.longitude, acc: p.coords.accuracy };
  const s = $('#radarStatus'); if (s) s.innerHTML = `${icon('radar', 'ms-16')}<span>Radar activ · precizie ±${Math.round(p.coords.accuracy)} m · alertă la ~150 m de un loc din program, cât timp aplicația e deschisă.</span>`;
  renderNearby(); renderNextStop(); updateMeMarker(); checkProximity();
  if (!onPosition._t || Date.now() - onPosition._t > 20000) { onPosition._t = Date.now(); renderDay(); }
}
function onPosError(err) { const s = $('#radarStatus'); if (s) s.innerHTML = `${icon('info', 'ms-16')}<span>${err.code === 1 ? 'Localizarea e blocată. Permite accesul la locație în setările browserului.' : 'Nu găsesc poziția (GPS slab?). Încerc în continuare…'}</span>`; }
async function startRadar() {
  if (!navigator.geolocation) return toast('Telefonul nu oferă localizare.', 'my_location');
  state.radarOn = true; renderNearby();
  if ('Notification' in window && Notification.permission === 'default') { try { await Notification.requestPermission(); } catch {} }
  if (state.watchId != null) navigator.geolocation.clearWatch(state.watchId);
  state.watchId = navigator.geolocation.watchPosition(onPosition, onPosError, { enableHighAccuracy: true, maximumAge: 5000, timeout: 20000 });
}
function locate() { startRadar(); if (state.pos && state.map) state.map.setView([state.pos.lat, state.pos.lng], 16); else toast('Caut poziția…', 'my_location'); }

// ---------- Harta ----------
function ensureMap() {
  if (state.map || !window.L || !$('#map')) return;
  const map = L.map('map', { zoomControl: false }).setView([41.39, 2.17], 12);
  L.control.zoom({ position: 'topright' }).addTo(map);
  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', { maxZoom: 19, attribution: '&copy; OpenStreetMap &copy; CARTO' }).addTo(map);
  state.map = map; setTimeout(() => map.invalidateSize(), 50);
}
function updateMeMarker() { if (!state.map || !state.pos) return; const ll = [state.pos.lat, state.pos.lng]; if (!state.meMarker) state.meMarker = L.marker(ll, { icon: L.divIcon({ className: '', html: '<div class="me"></div>', iconSize: [18, 18], iconAnchor: [9, 9] }), zIndexOffset: 1000 }).addTo(state.map); else state.meMarker.setLatLng(ll); }
function renderMap() {
  if (!state.map) return;
  state.markers.forEach((m) => m.remove()); state.markers = [];
  const bounds = []; let n = 0;
  for (const loc of dayItems(state.day)) {
    const p = coordsOf(loc); n++; if (!p) continue;
    const cls = state.visited[loc.id] ? 'pin done' : loc.isCustom ? 'pin custom' : 'pin';
    const m = L.marker([p.lat, p.lng], { icon: L.divIcon({ className: '', html: `<div class="${cls}">${n}</div>`, iconSize: [30, 30], iconAnchor: [15, 15] }) }).addTo(state.map);
    m.on('click', () => showPinSheet(loc)); state.markers.push(m); bounds.push([p.lat, p.lng]);
  }
  for (const z of DAY_ZONES[state.day] || []) ALTERNATIVES.forEach((a, i) => { if (a.zone !== z || typeof a.lat !== 'number') return; const m = L.marker([a.lat, a.lng], { icon: L.divIcon({ className: '', html: '<div class="pin alt">+</div>', iconSize: [22, 22], iconAnchor: [11, 11] }) }).addTo(state.map); m.on('click', () => showPinSheet(altAsLoc(i))); state.markers.push(m); });
  updateMeMarker();
  if (bounds.length) state.map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
  setTimeout(() => state.map.invalidateSize(), 50);
}
function showPinSheet(loc) {
  const c = cat(loc.cat), p = coordsOf(loc), d = state.pos && p ? distanceM(state.pos, p) : null;
  $('#pinSheetIcon').className = `thumb w-11 h-11 rounded-lg ${c.cls}`; $('#pinSheetIcon').innerHTML = photoOf(loc.id) ? `<img src="${photoOf(loc.id)}" alt="">` : icon(c.icon, 'ms-fill');
  $('#pinSheetTitle').textContent = loc.title; $('#pinSheetMeta').textContent = [loc.time, loc.hours, d != null ? `${fmtDist(d)} · ${walkMin(d)} min` : loc.address].filter(Boolean).join(' · ');
  $('#pinSheetNav').href = mapsNav(loc); $('#pinSheetOpen').dataset.id = loc.id; $('#pinSheet').classList.remove('hidden');
}

// ---------- PWA ----------
function setupPWA() {
  window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); state.installPrompt = e; $('#installBtn').classList.remove('hidden'); });
  window.addEventListener('appinstalled', () => { $('#installBtn').classList.add('hidden'); toast('Instalată! O găsești pe ecranul principal și în meniul Share.'); });
  const host = location.hostname;
  if (!('serviceWorker' in navigator) || !(host.endsWith('.web.app') || host.endsWith('.firebaseapp.com') || host === 'localhost' || host === '127.0.0.1')) return;
  navigator.serviceWorker.register('/sw.js').then((reg) => reg.addEventListener('updatefound', () => { const nw = reg.installing; nw?.addEventListener('statechange', () => { if (nw.state === 'installed' && navigator.serviceWorker.controller) toast('Versiune nouă descărcată. Se aplică la următoarea deschidere.', 'sync'); }); })).catch((e) => console.warn('SW:', e));
}
async function installApp() { const p = state.installPrompt; if (!p) return; p.prompt(); await p.userChoice; state.installPrompt = null; $('#installBtn').classList.add('hidden'); }

// ---------- Evenimente ----------
document.addEventListener('pointerdown', ripple);
document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-action]');
  if (!el) { if (e.target.matches('[data-modal]')) closeModals(); return; }
  const a = el.dataset.action, id = el.dataset.id;
  const actions = {
    'view': () => setView(el.dataset.view), 'day': () => switchDay(el.dataset.day), 'filter': () => setFilter(el.dataset.cat),
    'coffee': () => updateCoffee(Number(el.dataset.delta)), 'toggle-theme': toggleTheme, 'share': share,
    'open-add': () => openAdd({ tab: 'manual' }), 'close-modal': closeModals, 'add-tab': () => setAddTab(el.dataset.tab),
    'paste-link': pasteLink, 'parse-link': () => applyParsed(parseShared($('#linkInput').value)),
    'modal-search': () => { const q = $('#locTitle').value.trim(); if (q) window.open(mapsSearch(q), '_blank', 'noopener'); else $('#locTitle').focus(); },
    'use-my-position': useMyPosition, 'add-alt': () => addAlternative(Number(el.dataset.index)),
    'copy-link': () => copyText($('#shareUrl').value, 'Linkul a fost copiat.'), 'copy-summary': () => copyText(`${SUMMARY_TEXT}\n\n📱 ${location.href.split('#')[0].split('?')[0]}`, 'Rezumatul a fost copiat.'),
    'open-detail': () => openDetail(id), 'delete-loc': () => deleteLocation(id), 'edit-loc': () => { const l = state.custom.find((x) => x.id === id); if (l) openAdd({ tab: 'manual', editing: l }); },
    'toggle-visited': () => toggleVisited(id), 'toggle-skip': () => toggleSkip(id), 'pin-here': () => pinHere(id),
    'add-photo': () => { state.photoTarget = id; $('#photoInput').value = ''; $('#photoInput').click(); },
    'day-route': dayRoute, 'locate': locate, 'close-banner': () => $('#radarBanner').classList.add('hidden'), 'close-sheet': () => $('#pinSheet').classList.add('hidden'), 'install': installApp,
  };
  actions[a]?.();
});
document.addEventListener('submit', (e) => { if (e.target.id === 'addLocationForm') handleAddSubmit(e); });
document.addEventListener('change', async (e) => {
  if (e.target.matches('.quest-check')) setQuest(e.target.dataset.quest, e.target.checked);
  if (e.target.id === 'photoInput' && e.target.files?.[0] && state.photoTarget) { try { await savePhoto(state.photoTarget, e.target.files[0]); } catch (err) { console.error(err); toast('Nu am putut salva poza: ' + (err.message || err), 'image'); } }
});
document.addEventListener('input', (e) => { if (e.target.id === 'sharedNotes') onNotesInput(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { closeModals(); $('#pinSheet').classList.add('hidden'); } });
document.addEventListener('visibilitychange', () => { if (!document.hidden) { renderDay(); renderNextStop(); if (state.radarOn) startRadar(); } });

// ---------- Start ----------
applyThemeIcon(); loadLocal(); renderCoffee(); renderQuests(); renderNotes();
switchDay(todayKey() || 'thu');
const hasShare = new URL(location.href).searchParams.has('text') || new URL(location.href).searchParams.has('url');
setView(hasShare ? 'plan' : lsGet(LS.view, 'plan'));
setupPWA(); connectFirebase(); handleShareTarget();
setInterval(renderNextStop, 60000);

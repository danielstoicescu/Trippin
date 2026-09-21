// Trippin · Barcelona – Mara (13), Anne & Daniel. Offline-first, Material 3 Expressive, mobil.
import { TRIP, ZONES, DAY_ZONES, DAY_TIPS, DAY_OPPS, ITINERARY, ALTERNATIVES, CURATED, PEOPLE_META, BUCKET_DEFAULTS, COFFEE_TYPES } from './data.js';
import { ICONS } from './icons.js';

const TRIP_ID = TRIP.id;
const DAYS = ['thu', 'fri', 'sat', 'sun', 'mon'];
const DAY_LABEL = { thu: 'Joi 5', fri: 'Vineri 6', sat: 'Sâmbătă 7', sun: 'Duminică 8', mon: 'Luni 9' };
const DAY_SUB = { thu: 'PortAventura · Salou', fri: 'Tren · Poblenou · pho & tapas', sat: 'El Call · Sephora · MNAC · Blai', sun: 'Sagrada · matcha · Design · Bunkers', mon: 'Encants · Cova Fumada · Quimet' };
const PEOPLE = ['Daniel', 'Mara', 'Anne'];
const LS = { locations: 'bcn_locations', shared: 'bcn_shared', photos: 'bcn_photos', theme: 'bcn_theme', alerted: 'bcn_alerted', view: 'bcn_view', me: 'bcn_me', install: 'bcn_install_seen', weather: 'bcn_weather', img: 'bcn_img' };
const SUMMARY_TEXT = `Trippin · Barcelona (Mara 13, Anne & Daniel), 4–9 nov:
• Joi 5: PortAventura (Shambhala, Dragon Khan, Halloween)
• Vineri 6: tren spre BCN, Nomad Coffee, Demasié, Banh Mi Club, Bitácora
• Sâmbătă 7: Satan's Coffee & El Call, churros 1968, toboganul Sephora, Raval, Bar del Pla, MNAC gratis, pinchos Blai
• Duminică 8: Three Marks, Sagrada Família, SAISEI, Design Museum gratis, apus la Bunkers, Gràcia
• Luni 9: Encants, Print Workers, La Cova Fumada, plajă, Hofmann, Quimet & Quimet`;

const state = {
  view: 'plan', day: 'thu', filter: 'all', person: 'mara',
  custom: [], photos: {},
  shared: { coffeeCount: 0, coffeeLog: [], counters: {}, bucket: {}, quests: {}, visited: {}, pins: {}, skipped: {}, notes: '' },
  online: false, radarOn: false, pos: null, watchId: null, alerted: {},
  installPrompt: null, map: null, markers: [], meMarker: null, detailId: null, photoTarget: null,
};
let fb = null;

// ---------- Utilitare ----------
const $ = (s) => document.querySelector(s);
const $$ = (s) => Array.from(document.querySelectorAll(s));
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const icon = (name, cls = '', style = '') => { const p = ICONS[name] || ICONS.info; return `<svg class="ic ${cls}" viewBox="0 -960 960 960" aria-hidden="true"${style ? ` style="${style}"` : ''}>${p.length > 1 ? `<path class="o" d="${p[0]}"/><path class="f" d="${p[1]}"/>` : `<path class="o f" d="${p[0]}"/>`}</svg>`; };
function hydrateIcons(root = document) { root.querySelectorAll('span.material-symbols-rounded').forEach((el) => { const t = document.createElement('template'); t.innerHTML = icon(el.textContent.trim(), el.className.replace('material-symbols-rounded', '').trim(), el.getAttribute('style') || ''); el.replaceWith(t.content.firstChild); }); }
const mapsSearch = (q) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q + (/(barcelona|salou|vila-seca|portaventura)/i.test(q) ? '' : ' Barcelona'))}`;
const placeQuery = (loc) => loc.placeQuery || (loc.address ? `${loc.title}, ${loc.address}` : loc.title);
const allLocs = () => [...ITINERARY, ...state.custom];
function altAsLoc(i) { const a = ALTERNATIVES[i]; return a ? { ...a, id: 'alt-' + i, isAlt: true, altIndex: i, radius: 150 } : null; }
const findLoc = (id) => allLocs().find((l) => l.id === id) || (String(id).startsWith('alt-') ? altAsLoc(Number(id.slice(4))) : null);
function enriched(loc) { const c = loc.isCustom ? CURATED[(loc.title || '').trim().toLowerCase()] : null; return c ? { ...c, ...loc, rating: loc.rating ?? c.rating, review: loc.review ?? c.review, popular: loc.popular ?? c.popular, tips: loc.tips ?? c.tips, hours: loc.hours || c.hours, price: loc.price || c.price } : loc; }
function coordsOf(loc) { const pin = state.shared.pins[loc.id]; if (pin && typeof pin.lat === 'number') return { lat: pin.lat, lng: pin.lng, exact: true }; if (typeof loc.lat === 'number' && typeof loc.lng === 'number') return { lat: loc.lat, lng: loc.lng, exact: !loc.approx }; return null; }
const destOf = (loc) => { const p = coordsOf(loc); if (p && p.exact) return `${p.lat},${p.lng}`; const a = loc.placeQuery || loc.address || loc.title; return /(barcelona|salou|vila-seca|portaventura)/i.test(a) ? a : `${a}, Barcelona`; };
const mapsNav = (loc, mode = 'walking') => `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destOf(loc))}&travelmode=${mode}`;
const lsGet = (k, d) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } };
const lsSet = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };
function distanceM(a, b) { const R = 6371000, r = (d) => (d * Math.PI) / 180; const dLat = r(b.lat - a.lat), dLng = r(b.lng - a.lng); const s = Math.sin(dLat / 2) ** 2 + Math.cos(r(a.lat)) * Math.cos(r(b.lat)) * Math.sin(dLng / 2) ** 2; return 2 * R * Math.asin(Math.sqrt(s)); }
const fmtDist = (m) => (m < 1000 ? `${Math.round(m / 10) * 10} m` : `${(m / 1000).toFixed(1)} km`);
const walkMin = (m) => Math.max(1, Math.round(m / 80));
function parseRange(t) { const m = /(\d{1,2}):(\d{2})\s*[–-]\s*(\d{1,2}):(\d{2})/.exec(t || ''); return m ? { from: +m[1] * 60 + +m[2], to: +m[3] * 60 + +m[4] } : null; }
const startMin = (loc) => { const r = parseRange(loc.time); if (r) return r.from; const m = /(\d{1,2}):(\d{2})/.exec(loc.time || ''); return m ? +m[1] * 60 + +m[2] : 10000; };
const startLabel = (loc) => { const m = /(\d{1,2}:\d{2})/.exec(loc.time || ''); return m ? m[1] : ''; };
const fmtCount = (n) => (n >= 1000 ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k` : String(n));
const me = () => lsGet(LS.me, 'Daniel');
const isIOS = () => /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
const isStandalone = () => window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;

let toastTimer;
function toast(message, ic = 'check_circle', ms = 3200) { $('#toastMessage').textContent = message; $('#toastIcon').innerHTML = icon(ic); $('#toast').classList.remove('hidden-toast'); clearTimeout(toastTimer); toastTimer = setTimeout(() => $('#toast').classList.add('hidden-toast'), ms); }
function setSyncStatus(mode, detail) {
  const text = mode === 'online' ? 'Sincronizat live: ce bifați voi vede toată familia' : mode === 'local' ? 'Fără conexiune la baza comună: se salvează doar pe acest telefon' : 'Se conectează la programul comun…';
  const dot = $('#syncDot'); if (dot) { dot.dataset.mode = mode; dot.title = text + (detail ? ' (' + detail + ')' : ''); dot.setAttribute('aria-label', text); }
  const row = $('#syncText'); if (row) row.innerHTML = `${icon(mode === 'online' ? 'cloud_done' : mode === 'local' ? 'cloud_off' : 'sync', 'i-20', mode === 'online' ? 'color: var(--success)' : '')}<span class="flex-1 text-[13px]">${esc(text)}</span>`;
}

// ---------- Vremea (Open-Meteo, fără cheie) ----------
const WMO = (c, day = 1) => c === 0 ? [day ? 'sunny' : 'clear_night', 'senin'] : c <= 2 ? [day ? 'partly_cloudy_day' : 'partly_cloudy_night', 'parțial noros'] : c === 3 ? ['cloud', 'noros'] : c <= 48 ? ['foggy', 'ceață'] : c <= 57 ? ['rainy', 'burniță'] : c <= 67 ? ['rainy', 'ploaie'] : c <= 77 ? ['weather_snowy', 'ninsoare'] : c <= 82 ? ['rainy', 'averse'] : ['thunderstorm', 'furtună'];
let weather = null;
function renderWeather() {
  const el = $('#weather'); if (!el) return;
  if (!weather) { el.innerHTML = `${icon('thermostat', 'i-18')}<span>${navigator.onLine ? 'Vremea în Barcelona…' : 'Vremea: fără semnal'}</span>`; return; }
  const c = weather.current, [ic, label] = WMO(c.weather_code, c.is_day);
  el.innerHTML = `${icon(ic, 'i-18 ms-fill', 'color: var(--tertiary)')}<span class="tabular font-bold" style="color: var(--on-surface)">${Math.round(c.temperature_2m)}°</span><span class="muted truncate">${label} · ${Math.round(weather.daily.temperature_2m_min[0])}–${Math.round(weather.daily.temperature_2m_max[0])}° · BCN</span>`;
}
async function loadWeather() {
  const cached = lsGet(LS.weather, null); if (cached && cached.data) { weather = cached.data; renderWeather(); }
  if (cached && Date.now() - cached.at < 20 * 60000) return;
  try {
    const r = await fetch('https://api.open-meteo.com/v1/forecast?latitude=41.3874&longitude=2.1686&current=temperature_2m,apparent_temperature,weather_code,is_day,wind_speed_10m,relative_humidity_2m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset&timezone=Europe%2FMadrid&forecast_days=7');
    if (!r.ok) throw new Error(r.status); weather = await r.json(); lsSet(LS.weather, { at: Date.now(), data: weather }); renderWeather();
  } catch (e) { console.warn('meteo', e); renderWeather(); }
}
function weatherSheetHTML() {
  if (!weather) return `<div class="sheet-handle"></div><p class="t-body p-4">Nu am putut lua vremea (fără semnal?). Încerc din nou când revine conexiunea.</p>`;
  const c = weather.current, d = weather.daily, [ic, label] = WMO(c.weather_code, c.is_day);
  const DOW = ['Du', 'Lu', 'Ma', 'Mi', 'Jo', 'Vi', 'Sâ'];
  const rows = d.time.map((t, i) => { const [wi, wl] = WMO(d.weather_code[i]); const dt = new Date(t + 'T12:00:00'); const trip = DAYS.find((k) => TRIP.days[k] === t); return `<div class="row compact ${trip ? 'selected' : ''}"><div class="w-14 text-[13px] font-bold">${i === 0 ? 'Azi' : DOW[dt.getDay()] + ' ' + dt.getDate()}</div>${icon(wi, 'i-28 ms-fill', 'color: var(--tertiary)')}<div class="flex-1 text-[13px]">${wl}${trip ? ` · <b>${DAY_LABEL[trip]}</b>` : ''}</div><div class="text-[12px] muted tabular">${d.precipitation_probability_max[i]}% ${icon('water_drop', 'i-16')}</div><div class="tabular text-[14px] font-bold w-16 text-right">${Math.round(d.temperature_2m_min[i])}–${Math.round(d.temperature_2m_max[i])}°</div></div>`; }).join('');
  return `<div class="sheet-handle"></div>
    <div class="flex items-start justify-between gap-2"><div><div class="eyebrow muted">Vremea live · Barcelona</div><h3 class="t-headline text-[26px]">${label[0].toUpperCase() + label.slice(1)}</h3></div><button data-action="close-modal" class="icon-btn icon-btn-sm press" aria-label="Închide">${icon('close')}</button></div>
    <div class="card-tertiary xam p-4 mt-3 flex items-center gap-4">${icon(ic, 'i-48 ms-fill')}<div><div class="t-display text-[56px] tabular">${Math.round(c.temperature_2m)}°</div><div class="text-[13px] opacity-80">se simte ${Math.round(c.apparent_temperature)}° · vânt ${Math.round(c.wind_speed_10m)} km/h · umiditate ${c.relative_humidity_2m}%</div></div></div>
    <div class="text-[12px] muted mt-3 mb-2 px-1">Apus azi la ${(d.sunset[0] || '').slice(11, 16)} · răsărit ${(d.sunrise[0] || '').slice(11, 16)}. Sursa: Open-Meteo, actualizat ${new Date(lsGet(LS.weather, { at: Date.now() }).at).toTimeString().slice(0, 5)}.</div>
    <div class="group">${rows}</div>
    <p class="text-[12px] muted mt-3 px-1">În noiembrie, Barcelona are de obicei 12–18 °C și 5–6 zile cu ploaie pe lună: jachetă subțire, o umbrelă mică, pantofi buni pentru Bunkers.</p>`;
}
function openWeather() { $('#coffeeBody').innerHTML = weatherSheetHTML(); $('#coffeeSheet').classList.remove('hidden'); loadWeather(); }

// ---------- Poze reale (Wikimedia Commons, licență liberă, cu atribuire) ----------
const imgCache = lsGet(LS.img, {});
const COMMONS_FILE = (f) => `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(f)}?width=900`;
const COMMONS_PAGE = (f) => `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(f.replace(/ /g, '_'))}`;
const inflight = new Set(); let rerenderTimer;
function stockOf(loc) {
  if (loc.isCustom) return null; const c = imgCache[loc.id];
  if (c && c.url) return c; if (c && c.none && Date.now() - c.at < 7 * 86400000) return null;
  if (loc.img?.file && !(c && c.failed)) return { url: COMMONS_FILE(loc.img.file), page: COMMONS_PAGE(loc.img.file), credit: 'Wikimedia Commons' };
  ensureStock(loc); return null;
}
async function ensureStock(loc) {
  if (inflight.has(loc.id) || !navigator.onLine) return; inflight.add(loc.id);
  const q = loc.img?.q || loc.placeQuery || loc.title;
  try {
    const r = await fetch(`https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(q + ' filetype:bitmap')}&gsrnamespace=6&gsrlimit=1&prop=imageinfo&iiprop=url|extmetadata&iiurlwidth=900&format=json&origin=*`);
    const j = await r.json(); const pg = Object.values(j.query?.pages || {})[0]; const ii = pg?.imageinfo?.[0]; if (!ii) throw new Error('no image');
    const artist = (ii.extmetadata?.Artist?.value || '').replace(/<[^>]+>/g, '').trim();
    imgCache[loc.id] = { url: ii.thumburl || ii.url, page: ii.descriptionurl, credit: artist ? artist.slice(0, 40) : 'Wikimedia Commons' };
  } catch { imgCache[loc.id] = { none: true, at: Date.now() }; }
  lsSet(LS.img, imgCache); inflight.delete(loc.id);
  clearTimeout(rerenderTimer); rerenderTimer = setTimeout(() => { renderAll(); refreshDetail(); }, 400);
}
window.__imgFail = (el, id) => { el.remove(); const loc = findLoc(id); if (!loc) return; imgCache[id] = { failed: true }; lsSet(LS.img, imgCache); ensureStock(loc); };
const stockImg = (loc, cls = '') => { const st = stockOf(loc); return st ? `<img src="${esc(st.url)}" class="${cls}" alt="" loading="lazy" onerror="__imgFail(this,'${esc(loc.id)}')">` : ''; };
function ripple(e) { const el = e.target.closest('.press'); if (!el) return; const r = el.getBoundingClientRect(), d = Math.max(r.width, r.height); const s = document.createElement('span'); s.className = 'ripple'; s.style.cssText = `width:${d}px;height:${d}px;left:${e.clientX - r.left - d / 2}px;top:${e.clientY - r.top - d / 2}px`; el.appendChild(s); setTimeout(() => s.remove(), 650); }

// ---------- Timp ----------
function todayKey() { const t = new Date(), iso = `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`; return DAYS.find((d) => TRIP.days[d] === iso) || null; }
function isNow(loc) { if (todayKey() !== loc.day) return false; const r = parseRange(loc.time); if (!r) return false; const m = new Date().getHours() * 60 + new Date().getMinutes(); return m >= r.from - 15 && m <= r.to; }
function countdownText() { const start = new Date(TRIP.start + 'T00:00:00'), end = new Date(TRIP.days.mon + 'T23:59:59'), now = new Date(); const days = Math.ceil((start - now) / 86400000); if (now > end) return 'A fost o excursie!'; if (days > 1) return `${days} zile până la plecare`; if (days === 1) return 'Mâine plecăm!'; return 'Suntem în Barcelona!'; }

// ---------- Categorii ----------
const CAT = { mara: { cls: 'cat-mara', icon: 'auto_awesome', label: 'Mara', badge: 'badge-secondary' }, coffee: { cls: 'cat-coffee', icon: 'local_cafe', label: 'Cafea & bere', badge: 'badge-tertiary' }, food: { cls: 'cat-food', icon: 'restaurant', label: 'Mâncare', badge: 'badge-success' }, art: { cls: 'cat-art', icon: 'palette', label: 'Artă & vederi', badge: 'badge-primary' } };
const cat = (c) => CAT[c] || { cls: 'cat-none', icon: 'place', label: 'Loc', badge: 'badge-neutral' };
const SOURCE = { instagram: 'Reel Instagram', tiktok: 'TikTok', youtube: 'YouTube', gmaps: 'Google Maps', web: 'Link' };
function dayItems(day, includeSkipped = false) { return allLocs().filter((l) => l.day === day && (includeSkipped || !state.shared.skipped[l.id])).map((l, i) => ({ l, i })).sort((a, b) => startMin(a.l) - startMin(b.l) || a.i - b.i).map((x) => x.l); }
const photoOf = (id) => state.photos[id]?.data || null;
function thumbHTML(loc, sizeCls = '') { const c = cat(loc.cat), ph = photoOf(loc.id); return `<div class="thumb ${c.cls} ${sizeCls}">${icon(c.icon, 'ms-fill i-28')}${ph ? `<img src="${ph}" alt="">` : stockImg(loc)}</div>`; }
const stars = (r) => (r ? `<span class="inline-flex items-center gap-0.5 font-bold" style="color: var(--tertiary)">${icon('star', 'ms-fill i-16')}${Number(r).toFixed(1)}</span>` : '');
function transitHTML(a, b) {
  const pa = coordsOf(a), pb = coordsOf(b); if (!pa || !pb) return '';
  const d = distanceM(pa, pb); if (d < 60) return '';
  if (d > 2500) return `${icon('subway', 'i-16')} ${fmtDist(d)} · metrou / taxi ≈ ${Math.round(d / 400) + 8} min`;
  return `${icon('directions_walk', 'i-16')} ${fmtDist(d)} · ${walkMin(d)} min pe jos`;
}

// ---------- Plan: cronologie ----------
function timelineHTML(list) {
  let html = '', prev = null;
  for (const loc of list) {
    const visited = !!state.shared.visited[loc.id], skipped = !!state.shared.skipped[loc.id], now = isNow(loc);
    if (prev && !skipped) { const t = transitHTML(prev, loc); if (t) html += `<div class="t"></div><div class="rail"></div><div class="gap">${t}</div>`; }
    const p = coordsOf(loc), dist = state.pos && p ? distanceM(state.pos, p) : null;
    const meta = [loc.rating ? stars(loc.rating) : '', loc.free ? `<span style="color: var(--success)">gratis</span>` : '', loc.price && !loc.free ? esc(loc.price.split('·')[0].split('(')[0].trim()) : '', dist != null ? `<span style="color: var(--primary)">${fmtDist(dist)}</span>` : ''].filter(Boolean).join(' · ');
    html += `<div class="t">${esc(startLabel(loc))}</div><div class="rail"><span class="dot ${visited ? 'done' : skipped ? 'skip' : now ? 'now' : ''}"></span></div>
      <div class="item"><button class="card-item press ${visited ? 'done' : ''} ${skipped ? 'skipped' : ''} ${now ? 'now' : ''}" data-action="open-detail" data-id="${esc(loc.id)}" id="loc-${esc(loc.id)}">
        ${thumbHTML(loc)}
        <div class="min-w-0 flex-1">
          ${now || loc.isCustom || loc.verify || skipped ? `<div class="flex flex-wrap gap-1 mb-1">${now ? '<span class="badge badge-inverse">ACUM</span>' : ''}${loc.isCustom ? `<span class="badge badge-secondary">${esc(loc.addedBy || 'noi')}</span>` : ''}${loc.verify ? '<span class="badge badge-tertiary">verifică orele</span>' : ''}${skipped ? '<span class="badge badge-neutral">sărit</span>' : ''}</div>` : ''}
          <div class="t-title text-[15.5px] ${visited ? 'line-through' : ''}">${esc(loc.title)}</div>
          <div class="text-[12.5px] variant mt-0.5 truncate">${esc(loc.short || loc.catLabel || '')}</div>
          ${meta ? `<div class="text-[12px] muted mt-0.5 truncate">${meta}</div>` : ''}
        </div>
        ${visited ? icon('check_circle', 'ms-fill') : `${icon('expand_more', 'muted')}`}
      </button></div>`;
    if (!skipped) prev = loc;
  }
  return `<div class="tl">${html}</div>`;
}
function oppsHTML(day) {
  const opps = DAY_OPPS[day] || []; if (!opps.length) return '';
  const KIND = { gratis: ['badge-success', 'sell', 'Gratis'], inclus: ['badge-primary', 'check_circle', 'Inclus'], tip: ['badge-tertiary', 'bolt', 'De neratat'] };
  return `<div class="card-tertiary p-4 space-y-3">
    <div class="flex items-center justify-between"><div class="t-headline text-[18px]">Oportunitățile zilei</div>${icon('celebration', 'ms-fill', 'color: var(--tertiary)')}</div>
    <div class="group">${opps.map((o) => { const k = KIND[o.kind] || KIND.tip; return `
      <div class="row compact press" style="background: color-mix(in srgb, var(--surface-lowest) 72%, transparent)" ${o.locId ? `data-action="open-detail" data-id="${esc(o.locId)}" role="button"` : `data-action="open-link" data-href="${esc(o.link)}" role="button"`}>
        <div class="min-w-0 flex-1">
          <div class="flex items-center gap-1.5 mb-1"><span class="badge ${k[0]}">${icon(k[1], 'i-16')} ${k[2]}</span><span class="text-[11.5px] variant truncate">${esc(o.when)}</span></div>
          <div class="font-semibold text-[14.5px] leading-snug">${esc(o.title)}</div>
          ${o.price ? `<div class="text-[12px] variant mt-0.5">${esc(o.price)}${o.locId ? ' · <span style="color: var(--primary)">în program, apasă pentru detalii</span>' : ''}</div>` : ''}
        </div>
        <a href="${esc(o.link)}" target="_blank" rel="noopener" class="icon-btn icon-btn-sm press shrink-0" aria-label="Site oficial" title="Site oficial" onclick="event.stopPropagation()">${icon('open_in_new')}</a>
      </div>`; }).join('')}</div>
  </div>`;
}
function renderDay() {
  const c = $('#itinerary-container'); if (!c) return;
  $('#planHeadline').textContent = DAY_LABEL[state.day] + (todayKey() === state.day ? ' · azi' : ''); $('#planSub').textContent = DAY_SUB[state.day]; $('#planEyebrow').textContent = countdownText();
  const list = dayItems(state.day, true).filter((l) => state.filter === 'all' || l.cat === state.filter);
  const tip = DAY_TIPS[state.day] ? `<div class="card-mid p-3.5 flex gap-2.5 text-[13px] variant leading-relaxed">${icon('lightbulb', 'i-20 shrink-0')}<span>${esc(DAY_TIPS[state.day])}</span></div>` : '';
  const timeline = list.length ? timelineHTML(list) : `<div class="card-mid p-6 text-center text-sm muted">Nimic pentru filtrul ales. <button data-action="open-add" class="btn btn-text press">Adaugă un loc</button></div>`;
  c.innerHTML = `<div class="space-y-4">${state.filter === 'all' ? oppsHTML(state.day) : ''}${tip}<div><div class="eyebrow muted mb-2 px-1">Cronologia zilei</div>${timeline}</div></div>`;
  renderZones();
}
function altCardHTML(a, i) {
  const c = cat(a.cat), ph = null, d = state.pos && typeof a.lat === 'number' ? distanceM(state.pos, { lat: a.lat, lng: a.lng }) : null;
  const loc = altAsLoc(i);
  return `<button class="carousel-card press ${c.cls}" data-action="open-detail" data-id="alt-${i}">${stockImg(loc, 'cc-img')}
    <div class="flex flex-wrap gap-1 mb-2">${a.free ? '<span class="badge badge-success">gratis</span>' : ''}${a.verify ? '<span class="badge badge-tertiary">verifică</span>' : ''}${d != null ? `<span class="badge badge-inverse">${fmtDist(d)}</span>` : ''}</div>
    <div class="t-title text-[16px]">${esc(a.title)}</div>
    <div class="text-[12px] opacity-90 mt-1 line-clamp-2">${esc(a.hours || a.note)}</div>
  </button>`;
}
function renderZones() {
  const z = $('#zonesContainer'); if (!z) return;
  z.innerHTML = (DAY_ZONES[state.day] || []).map((key) => {
    const alts = ALTERNATIVES.map((a, i) => ({ a, i })).filter(({ a }) => a.zone === key && (state.filter === 'all' || a.cat === state.filter));
    return alts.length ? `<div><div class="flex items-center gap-2 mb-2 px-1">${icon(ZONES[key].icon, 'i-20')}<span class="eyebrow muted">Similare · ${esc(ZONES[key].label)}</span></div><div class="hscroll">${alts.map(({ a, i }) => altCardHTML(a, i)).join('')}</div></div>` : '';
  }).join('');
}
function nextStopHTML() {
  const stops = dayItems(state.day).filter((l) => !state.shared.visited[l.id]); if (!stops.length) return '';
  const nowMin = new Date().getHours() * 60 + new Date().getMinutes();
  const next = stops.find(isNow) || (todayKey() === state.day ? stops.find((l) => startMin(l) >= nowMin - 15) : null) || stops[0];
  const p = coordsOf(next), d = state.pos && p ? distanceM(state.pos, p) : null;
  const label = isNow(next) ? 'Acum' : todayKey() === state.day ? 'Următorul pas' : 'Primul pas';
  return `<div class="card-primary p-3 flex items-center gap-3 press" style="background: var(--primary); color: var(--on-primary)" data-action="open-detail" data-id="${esc(next.id)}" role="button">
    ${thumbHTML(next, 'w-16 h-16')}
    <div class="min-w-0 flex-1"><div class="eyebrow opacity-75">${label} · ${esc(next.time || '')}</div><div class="t-title text-[16px]">${esc(next.title)}</div><div class="text-[12px] opacity-85 truncate">${d != null ? `${fmtDist(d)} · ${walkMin(d)} min pe jos` : esc(next.address || '')}</div></div>
    <a href="${esc(mapsNav(next))}" target="_blank" rel="noopener" class="icon-btn press shrink-0" style="background: var(--surface-lowest); color: var(--primary)" aria-label="Navighează spre următorul pas (Google Maps)" title="Navighează (Google Maps)" onclick="event.stopPropagation()">${icon('directions_walk')}</a>
  </div>`;
}
function renderNextStop() { const h = nextStopHTML(); const a = $('#nextStop'); if (a) a.innerHTML = h; const b = $('#nextStopExplore'); if (b) b.innerHTML = h; }

// ---------- Detaliu loc ----------
function detailHTML(raw) {
  const loc = enriched(raw), c = cat(loc.cat), id = loc.id;
  const visited = !!state.shared.visited[id], skipped = !!state.shared.skipped[id];
  const p = coordsOf(loc), d = state.pos && p ? distanceM(state.pos, p) : null; const ph = photoOf(id);
  const st = ph ? null : stockOf(loc);
  const hero = ph ? `<div class="hero xam relative h-60 overflow-hidden"><img src="${ph}" class="w-full h-full object-cover" alt=""><div class="absolute bottom-3 left-3 badge badge-inverse">${icon('photo_camera', 'i-16')} ${esc(state.photos[id].by || 'noi')}</div><button data-action="add-photo" data-id="${esc(id)}" class="btn btn-sm btn-surface press absolute bottom-3 right-3">${icon('add_a_photo', 'i-18')} Altă poză</button></div>`
    : `<div class="hero xam relative h-56 ${c.cls} grid place-items-center text-white/85">${icon(c.icon, 'ms-fill i-48')}${st ? `<img src="${esc(st.url)}" class="absolute inset-0 w-full h-full object-cover" alt="" onerror="__imgFail(this,'${esc(id)}')"><a href="${esc(st.page)}" target="_blank" rel="noopener" class="absolute bottom-3 left-3 badge badge-inverse" style="opacity:.85" onclick="event.stopPropagation()">${icon('image', 'i-16')} ${esc(st.credit)}</a>` : ''}<button data-action="add-photo" data-id="${esc(id)}" class="btn btn-sm btn-surface press absolute bottom-3 right-3">${icon('add_a_photo', 'i-18')} ${st ? 'Poza noastră' : 'Adaugă poză'}</button></div>`;
  const chips = [`<span class="badge ${c.badge}">${icon(c.icon, 'i-16')} ${esc(loc.catLabel || c.label)}</span>`, loc.time ? `<span class="badge badge-neutral">${icon('schedule', 'i-16')} ${esc(loc.time)}</span>` : '', loc.free ? `<span class="badge badge-success">gratis</span>` : '', loc.verify ? '<span class="badge badge-tertiary">verifică orele</span>' : '', d != null ? `<span class="badge badge-primary">${icon('directions_walk', 'i-16')} ${fmtDist(d)} · ${walkMin(d)} min</span>` : '', loc.isCustom ? `<span class="badge badge-secondary">${esc(loc.addedBy || 'noi')}</span>` : '', loc.isAlt ? '<span class="badge badge-neutral">recomandare</span>' : ''].filter(Boolean).join('');
  const rating = loc.rating ? `<div class="card p-4 flex items-center gap-4"><div class="t-display text-[40px]" style="color: var(--tertiary)">${Number(loc.rating).toFixed(1)}</div><div><div class="text-[18px] leading-none" style="color: var(--tertiary)">${'★'.repeat(Math.round(loc.rating))}<span class="muted">${'★'.repeat(5 - Math.round(loc.rating))}</span></div><div class="text-[12px] muted mt-1">${loc.ratingCount ? fmtCount(loc.ratingCount) + ' recenzii pe Google · ' : ''}sept. 2026</div></div></div>` : '';
  const section = (ic, title, body, cls = 'card') => `<div class="${cls} p-4"><div class="eyebrow muted mb-2 flex items-center gap-1.5">${icon(ic, 'i-18')} ${title}</div>${body}</div>`;
  const review = loc.review ? section('format_quote', 'Un review', `<p class="text-[14px] leading-relaxed italic variant">„${esc(loc.review)}”</p>`) : '';
  const popular = loc.popular?.length ? section('thumb_up', 'Cel mai popular', `<ul class="space-y-2">${loc.popular.map((x) => `<li class="flex gap-2 text-[14px]">${icon('check', 'i-18', 'color: var(--secondary)')}<span>${esc(x)}</span></li>`).join('')}</ul>`) : '';
  const tips = loc.tips?.length ? section('tips_and_updates', 'Tips & tricks', `<ul class="space-y-2">${loc.tips.map((x) => `<li class="flex gap-2 text-[14px]">${icon('bolt', 'i-18', 'color: var(--tertiary)')}<span>${esc(x)}</span></li>`).join('')}</ul>`, 'card-tertiary') : '';
  const info = [loc.hours ? `<div class="row compact">${icon('schedule', 'muted')}<div class="text-[14px]">${esc(loc.hours)}</div></div>` : '', loc.price ? `<div class="row compact">${icon('euro', 'muted')}<div class="text-[14px]">${esc(loc.price)}</div></div>` : '', loc.budget ? `<div class="row compact">${icon('payments', 'muted')}<div class="text-[14px]"><span class="muted text-[12px]">Buget estimat · </span>${esc(loc.budget)}</div></div>` : '', loc.address ? `<a href="${esc(mapsSearch(placeQuery(loc)))}" target="_blank" rel="noopener" class="row compact press">${icon('place', 'muted')}<div class="text-[14px] flex-1">${esc(loc.address)}${p && !p.exact ? ' <span class="muted">(aprox.)</span>' : ''}</div>${icon('open_in_new', 'muted i-20')}</a>` : '', loc.link ? `<a href="${esc(loc.link)}" target="_blank" rel="noopener" class="row compact press">${icon('link', 'muted')}<div class="text-[14px] flex-1" style="color: var(--primary)">Deschide ${esc(SOURCE[loc.source] || 'linkul')}</div>${icon('open_in_new', 'muted i-20')}</a>` : ''].filter(Boolean).join('');
  const links = [`<a href="${esc(mapsSearch(placeQuery(loc)))}" target="_blank" rel="noopener" class="row compact press">${icon('photo_library', '', 'color: var(--primary)')}<div class="flex-1"><div class="text-[14px] font-semibold">Poze, meniu & recenzii pe Google Maps</div><div class="text-[11.5px] muted">Fotografiile clienților, meniul fotografiat, orele de azi</div></div>${icon('open_in_new', 'muted i-20')}</a>`,
    loc.site ? `<a href="${esc(loc.site)}" target="_blank" rel="noopener" class="row compact press">${icon('language', '', 'color: var(--secondary)')}<div class="flex-1"><div class="text-[14px] font-semibold">Site oficial</div><div class="text-[11.5px] muted truncate">${esc(loc.site.replace(/^https?:\/\/(www\.)?/, '').split('/')[0])}</div></div>${icon('open_in_new', 'muted i-20')}</a>` : '',
    loc.menu ? `<a href="${esc(loc.menu)}" target="_blank" rel="noopener" class="row compact press">${icon('menu_book', '', 'color: var(--tertiary)')}<div class="flex-1"><div class="text-[14px] font-semibold">${/ticket|entrad|bilet/i.test(loc.menu) ? 'Bilete online' : 'Meniul oficial'}</div><div class="text-[11.5px] muted truncate">${esc(loc.menu.replace(/^https?:\/\/(www\.)?/, ''))}</div></div>${icon('open_in_new', 'muted i-20')}</a>` : ''].filter(Boolean).join('');
  const toolbar = loc.isAlt
    ? `<div class="toolbar"><button data-action="add-alt" data-index="${loc.altIndex}" class="btn btn-filled press flex-1">${icon('add')} Pune în program</button><a href="${esc(mapsNav(loc))}" target="_blank" rel="noopener" class="icon-btn press" aria-label="Navighează">${icon('directions_walk')}</a></div>`
    : `<div class="toolbar">
        <a href="${esc(mapsNav(loc))}" target="_blank" rel="noopener" class="btn btn-filled press flex-1">${icon('directions_walk')} Navighează</a>
        <button data-action="toggle-visited" data-id="${esc(id)}" class="icon-btn press ${visited ? 'tonal' : ''}" aria-label="${visited ? 'Anulează bifarea' : 'Bifează: am fost'}" title="${visited ? 'Anulează bifarea' : 'Bifează: am fost'}">${icon(visited ? 'undo' : 'check')}</button>
        <button data-action="add-photo" data-id="${esc(id)}" class="icon-btn press" aria-label="Adaugă poză" title="Adaugă poză">${icon('add_a_photo')}</button>
        ${loc.isCustom ? `<button data-action="edit-loc" data-id="${esc(id)}" class="icon-btn press" aria-label="Editează" title="Editează">${icon('edit')}</button>` : `<button data-action="toggle-skip" data-id="${esc(id)}" class="icon-btn press" aria-label="${skipped ? 'Pune înapoi' : 'Sari peste'}" title="${skipped ? 'Pune înapoi în program' : 'Sari peste (rămâne estompat)'}">${icon(skipped ? 'undo' : 'skip_next')}</button>`}
        <button data-action="pin-here" data-id="${esc(id)}" class="icon-btn press" aria-label="Fixează poziția aici" title="Fixează poziția exactă aici" ${state.pos ? '' : 'disabled'}>${icon('push_pin')}</button>
        ${loc.isCustom ? `<button data-action="delete-loc" data-id="${esc(id)}" class="icon-btn press" style="color: var(--secondary)" aria-label="Șterge" title="Șterge">${icon('delete')}</button>` : ''}
      </div>`;
  return `<div class="sheet-handle"></div>
    <div class="flex items-start justify-between gap-2 mb-3"><div class="min-w-0"><div class="flex flex-wrap gap-1 mb-2">${chips}</div><h3 class="t-headline text-[26px]">${esc(loc.title)}</h3>${loc.short ? `<div class="text-[14px] variant mt-1">${esc(loc.short)}</div>` : ''}</div><button data-action="close-modal" class="icon-btn icon-btn-sm press shrink-0" aria-label="Închide">${icon('close')}</button></div>
    <div class="space-y-3">${hero}${rating}<p class="t-body px-1">${esc(loc.desc || loc.note || '')}</p>${info ? `<div class="group">${info}</div>` : ''}${review}${popular}${tips}<div class="group">${links}</div>
    <div class="grid grid-cols-2 gap-x-3 gap-y-1 text-[11.5px] muted px-1 pb-1">${[['directions_walk','Navigare pe jos (Google Maps)'],['check','Am fost'],['add_a_photo','Adaugă poză'],[loc.isCustom ? 'edit' : 'skip_next', loc.isCustom ? 'Editează' : 'Sari peste'],['push_pin','Fixează poziția exactă']].map(([i, t]) => `<div class="flex items-center gap-1.5">${icon(i, 'i-16')}<span>${t}</span></div>`).join('')}</div></div>${toolbar}`;
}
function openDetail(id) { const loc = findLoc(id); if (!loc) return; state.detailId = id; $('#detailBody').innerHTML = detailHTML(loc); $('#detailSheet').classList.remove('hidden'); $('#detailBody').scrollTop = 0; }
function refreshDetail() { if (state.detailId && !$('#detailSheet').classList.contains('hidden')) { const loc = findLoc(state.detailId); if (loc) $('#detailBody').innerHTML = detailHTML(loc); else closeModals(); } }

// ---------- Poze ----------
function compressImage(file, max = 1100, q = 0.74) {
  return new Promise((resolve, reject) => {
    const img = new Image(), url = URL.createObjectURL(file);
    img.onload = () => { const s = Math.min(1, max / Math.max(img.width, img.height)); const cv = document.createElement('canvas'); cv.width = Math.round(img.width * s); cv.height = Math.round(img.height * s); cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height); URL.revokeObjectURL(url); let qq = q, data = cv.toDataURL('image/jpeg', q); while (data.length > 900000 && qq > 0.4) { qq -= 0.1; data = cv.toDataURL('image/jpeg', qq); } resolve(data); };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Nu am putut citi imaginea.')); }; img.src = url;
  });
}
async function savePhoto(id, file) {
  toast('Comprim poza…', 'hourglass', 8000);
  const data = await compressImage(file); if (data.length > 950000) return toast('Poza e prea mare chiar și comprimată.', 'image');
  const doc = { data, by: me(), at: new Date().toISOString() }; state.photos[id] = doc;
  if (fb && state.online) { const { db, fs } = fb; await fs.setDoc(fs.doc(db, 'trips', TRIP_ID, 'photos', id), { ...doc, at: fs.serverTimestamp() }); } else lsSet(LS.photos, state.photos);
  bumpCounter('photos', 1, me()); renderAll(); refreshDetail(); toast('Poza a fost salvată pentru toți.');
}

// ---------- Noi: bucketlist & contoare ----------
function bucketOf(person) { const custom = state.shared.bucket[person] || {}; const items = BUCKET_DEFAULTS[person].map((d, i) => { const def = typeof d === 'string' ? { text: d } : d; const c = custom[`${person}-d${i}`] || {}; return { id: `${person}-d${i}`, text: def.text, loc: c.loc || def.loc || null, done: !!c.done }; }); for (const [id, v] of Object.entries(custom)) if (v && v.text) items.push({ id, text: v.text, loc: v.loc || null, done: !!v.done }); return items; }
function bucketRowHTML(it, person) {
  const color = person === 'mara' ? 'secondary' : person === 'anne' ? 'primary' : 'tertiary';
  const loc = it.loc ? findLoc(it.loc) : null; const visited = loc && !!state.shared.visited[loc.id];
  const p = loc && coordsOf(loc), d = loc && state.pos && p ? distanceM(state.pos, p) : null;
  const sub = loc ? [DAY_LABEL[loc.day] || 'recomandare', loc.time || loc.hours || '', d != null ? `${fmtDist(d)}` : (loc.address || '').split(',')[0]].filter(Boolean).join(' · ') : '';
  return `<div class="row compact ${it.done ? 'done' : ''}" style="padding-right: 8px">
    <input type="checkbox" class="bucket-check w-6 h-6 shrink-0" style="accent-color: var(--${color})" data-person="${person}" data-id="${esc(it.id)}" ${it.done ? 'checked' : ''} aria-label="Bifează: ${esc(it.text)}">
    ${loc ? `<button data-action="open-detail" data-id="${esc(loc.id)}" class="press shrink-0" aria-label="Detalii ${esc(loc.title)}">${thumbHTML(loc, 'w-12 h-12')}</button>` : ''}
    <button data-action="${loc ? 'open-detail' : 'bucket-noop'}" data-id="${loc ? esc(loc.id) : ''}" class="flex-1 min-w-0 text-left press ${loc ? '' : 'cursor-default'}" style="padding: 6px 0">
      <div class="text-[14.5px] leading-snug ${it.done ? 'line-through muted' : ''}">${esc(it.text)}</div>
      ${loc ? `<div class="text-[11.5px] muted truncate mt-0.5">${esc(loc.title)} · ${esc(sub)}${visited ? ' · <span style="color: var(--success)">am fost</span>' : ''}</div>` : ''}
    </button>
    ${loc ? `<a href="${esc(mapsNav(loc))}" target="_blank" rel="noopener" class="icon-btn icon-btn-sm press shrink-0" style="color: var(--primary)" aria-label="Navighează spre ${esc(loc.title)} (Google Maps)" title="Navighează (Google Maps)">${icon('directions_walk', 'i-22')}</a>` : ''}
    ${it.id.includes('-d') ? '' : `<button data-action="bucket-del" data-person="${person}" data-id="${esc(it.id)}" class="icon-btn icon-btn-sm press muted shrink-0" aria-label="Șterge">${icon('close', 'i-20')}</button>`}
  </div>`;
}
function locOptionsHTML() { const groups = DAYS.map((d) => `<optgroup label="${DAY_LABEL[d]}">${dayItems(d, true).map((l) => `<option value="${esc(l.id)}">${esc(l.title)}</option>`).join('')}</optgroup>`).join(''); return `<option value="">Fără loc anume</option>${groups}<optgroup label="Recomandări">${ALTERNATIVES.map((a, i) => `<option value="alt-${i}">${esc(a.title)}</option>`).join('')}</optgroup>`; }
function counterOf(key) { if (key === 'coffee') return (state.shared.coffeeLog || []).reduce((s, x) => s + (x.shots || 1), 0) || state.shared.coffeeCount || 0; return (state.shared.counters || {})[key] || 0; }
function cupSVG(pct, cls = '') {
  const h = 78, y = 24 + (1 - pct) * h;
  return `<svg viewBox="0 0 120 130" width="120" height="130" class="${cls}" aria-hidden="true">
    <defs><clipPath id="cupclip"><path d="M18 24 h74 l-6 78 a10 10 0 0 1 -10 9 h-42 a10 10 0 0 1 -10 -9 z"/></clipPath></defs>
    <path d="M18 24 h74 l-6 78 a10 10 0 0 1 -10 9 h-42 a10 10 0 0 1 -10 -9 z" fill="var(--surface-lowest)" stroke="var(--on-surface)" stroke-width="3"/>
    <rect class="cup-fill" x="0" y="${y.toFixed(1)}" width="120" height="${(130 - y).toFixed(1)}" fill="var(--tertiary)" clip-path="url(#cupclip)"/>
    <path d="M92 36 h8 a14 14 0 0 1 0 28 h-10" fill="none" stroke="var(--on-surface)" stroke-width="3"/>
    <path d="M40 8 q4 6 0 12 M55 4 q4 6 0 12 M70 8 q4 6 0 12" fill="none" stroke="var(--on-surface-muted)" stroke-width="2.5" stroke-linecap="round"/>
  </svg>`;
}
function renderUs() {
  const person = state.person, meta = PEOPLE_META[person]; if (!meta) return;
  $('#usHeadline').textContent = meta.name; $$('.avatar').forEach((a) => a.classList.toggle('selected', a.dataset.person === person));
  const items = bucketOf(person), done = items.filter((i) => i.done).length, pct = items.length ? Math.round((done / items.length) * 100) : 0;
  const cnt = counterOf(meta.counter.key), cpct = Math.min(100, Math.round((cnt / meta.counter.goal) * 100));
  const perDay = DAYS.map((d) => (state.shared.coffeeLog || []).filter((x) => x.day === d).reduce((s, x) => s + (x.shots || 1), 0));
  const counterCard = person === 'daniel'
    ? `<div class="card p-4 flex items-center gap-4 press" data-action="open-coffee" role="button">
        ${cupSVG(cpct / 100)}
        <div class="min-w-0 flex-1"><div class="eyebrow muted">${esc(meta.counter.label)}</div><div class="t-display text-[44px] tabular" style="color: var(--tertiary)">${cnt}<span class="text-[20px] muted"> / ${meta.counter.goal}</span></div>
          <div class="flex items-end gap-1 mt-2 h-8">${perDay.map((v, i) => `<div class="flex-1 rounded-full" style="height:${Math.max(6, Math.min(32, v * 6))}px; background: ${DAYS[i] === todayKey() ? 'var(--secondary)' : 'var(--tertiary-container)'}" title="${DAY_LABEL[DAYS[i]]}: ${v}"></div>`).join('')}</div>
          <div class="text-[11px] muted mt-1">Joi · Vin · Sâm · Dum · Lun</div></div>
        <button data-action="open-coffee" class="icon-btn filled press shrink-0" style="background: var(--tertiary); color: var(--on-tertiary)" aria-label="Adaugă espresso">${icon('add')}</button>
      </div>`
    : `<div class="card p-4 flex items-center gap-4">
        <div class="ring" style="--p:${cpct}; --ring-color: var(--${person === 'mara' ? 'secondary' : 'primary'})">${icon(meta.counter.icon, 'ms-fill', `color: var(--${person === 'mara' ? 'secondary' : 'primary'})`)}</div>
        <div class="min-w-0 flex-1"><div class="eyebrow muted">${esc(meta.counter.label)}</div><div class="t-display text-[36px] tabular">${cnt}<span class="text-[18px] muted"> / ${meta.counter.goal}</span></div></div>
        <div class="flex gap-1"><button data-action="counter" data-key="${meta.counter.key}" data-delta="-1" class="icon-btn tonal press" aria-label="Scade">${icon('remove')}</button><button data-action="counter" data-key="${meta.counter.key}" data-delta="1" class="icon-btn filled press" style="background: var(--${person === 'mara' ? 'secondary' : 'primary'})" aria-label="Adaugă">${icon('add')}</button></div>
      </div>`;
  $('#usContent').innerHTML = `
    <div class="card-${person === 'mara' ? 'secondary' : person === 'anne' ? 'primary' : 'tertiary'} p-4 flex items-center gap-4">
      <div class="ring" style="--p:${pct}; --ring-color: var(--${person === 'mara' ? 'secondary' : person === 'anne' ? 'primary' : 'tertiary'})"><span class="t-title text-[14px]">${pct}%</span></div>
      <div class="min-w-0 flex-1"><div class="eyebrow opacity-70">${esc(meta.tag)}</div><div class="t-headline text-[22px]">Bucketlist</div><div class="text-[13px] opacity-80">${done} din ${items.length} bifate</div></div>
      ${done === items.length && items.length ? icon('celebration', 'ms-fill i-32') : ''}
    </div>
    ${counterCard}
    <div class="group">
      ${items.map((it) => bucketRowHTML(it, person)).join('')}
      <form class="row" style="flex-direction: column; align-items: stretch; gap: 8px; padding: 12px 16px" data-action="bucket-add" data-person="${person}">
        <div class="flex items-center gap-3">${icon('add_task', 'muted')}<input type="text" id="bucketInput" maxlength="120" placeholder="Adaugă ceva pe lista lui ${esc(meta.name)}…" class="flex-1 min-w-0 bg-transparent text-[14.5px] focus:outline-none" aria-label="Task nou"><button class="btn btn-sm btn-tonal press" type="submit">Adaugă</button></div>
        <label class="flex items-center gap-2 text-[12px] muted">${icon('place', 'i-18')}<span class="shrink-0">Leagă de un loc</span><select id="bucketLoc" class="flex-1 min-w-0 text-[13px] field-input" style="padding: 6px 10px; border-radius: 999px">${locOptionsHTML()}</select></label>
      </form>
    </div>
    <p class="text-[12px] muted px-2">Atinge un task ca să vezi locul, orele și traseul; ${icon('directions_walk', 'i-16')} te duce direct în Google Maps.</p>`;
}
function coffeeSheetHTML() {
  const cnt = counterOf('coffee'), goal = PEOPLE_META.daniel.counter.goal, log = (state.shared.coffeeLog || []).slice(-6).reverse();
  const todays = dayItems(todayKey() || state.day).filter((l) => l.cat === 'coffee');
  return `<div class="sheet-handle"></div>
    <div class="flex items-start justify-between gap-2"><div><div class="eyebrow muted">Daniel · top-up</div><h3 class="t-headline text-[26px]">Încă un espresso</h3></div><button data-action="close-modal" class="icon-btn icon-btn-sm press" aria-label="Închide">${icon('close')}</button></div>
    <div class="flex items-center justify-center gap-6 py-4">${cupSVG(Math.min(1, cnt / goal))}<div><div class="t-display text-[64px] tabular" style="color: var(--tertiary)">${cnt}</div><div class="eyebrow muted">din ${goal} pe trip</div></div></div>
    <div class="eyebrow muted mb-2">Ce a fost</div>
    <div class="flex flex-wrap gap-2 mb-4" id="coffeeTypes">${COFFEE_TYPES.map((t, i) => `<button class="chip press ${i === 0 ? 'selected' : ''}" data-action="coffee-type" data-type="${t.key}">${icon(t.icon, 'i-18')} ${t.label}${t.shots > 1 ? ' ×2' : ''}</button>`).join('')}</div>
    <div class="eyebrow muted mb-2">Unde</div>
    <div class="flex flex-wrap gap-2 mb-4" id="coffeePlaces"><button class="chip press selected" data-action="coffee-place" data-place="">Oriunde</button>${todays.map((l) => `<button class="chip press" data-action="coffee-place" data-place="${esc(l.title)}">${esc(l.title.split('(')[0].trim())}</button>`).join('')}</div>
    <button data-action="coffee-add" class="btn btn-l press w-full" style="background: var(--tertiary); color: var(--on-tertiary)">${icon('coffee', 'ms-fill')} Adaugă în contor</button>
    ${log.length ? `<div class="eyebrow muted mt-5 mb-2">Ultimele</div><div class="group">${log.map((x, i) => `<div class="row compact">${icon('coffee', 'muted')}<div class="flex-1 text-[14px]">${esc(COFFEE_TYPES.find((t) => t.key === x.type)?.label || 'Espresso')}${x.place ? ` · ${esc(x.place)}` : ''}</div><div class="text-[12px] muted">${esc(DAY_LABEL[x.day] || '')} ${esc(x.at ? new Date(x.at).toTimeString().slice(0, 5) : '')}</div>${i === 0 ? `<button data-action="coffee-undo" class="icon-btn icon-btn-sm press muted" aria-label="Anulează">${icon('undo', 'i-20')}</button>` : ''}</div>`).join('')}</div>` : ''}`;
}
let coffeeSel = { type: 'espresso', place: '' };
function openCoffee() { coffeeSel = { type: 'espresso', place: '' }; $('#coffeeBody').innerHTML = coffeeSheetHTML(); $('#coffeeSheet').classList.remove('hidden'); }
async function coffeeAdd() {
  const t = COFFEE_TYPES.find((x) => x.key === coffeeSel.type) || COFFEE_TYPES[0];
  const log = [...(state.shared.coffeeLog || []), { type: t.key, shots: t.shots, place: coffeeSel.place, day: todayKey() || state.day, at: new Date().toISOString() }].slice(-200);
  state.shared.coffeeLog = log; state.shared.coffeeCount = counterOf('coffee');
  await saveShared({ coffeeLog: log, coffeeCount: state.shared.coffeeCount });
  $('#coffeeBody').innerHTML = coffeeSheetHTML(); renderUs();
  const c = counterOf('coffee'); toast(c >= PEOPLE_META.daniel.counter.goal ? '20 de espresso! Daniel, ești oficial barcelonez.' : `${c} espresso. ${t.label}${coffeeSel.place ? ' la ' + coffeeSel.place : ''}.`, c >= 20 ? 'celebration' : 'coffee');
}
async function coffeeUndo() { const log = (state.shared.coffeeLog || []).slice(0, -1); state.shared.coffeeLog = log; state.shared.coffeeCount = counterOf('coffee'); await saveShared({ coffeeLog: log, coffeeCount: state.shared.coffeeCount }); $('#coffeeBody').innerHTML = coffeeSheetHTML(); renderUs(); }
async function bumpCounter(key, delta) { const counters = { ...(state.shared.counters || {}) }; counters[key] = Math.max(0, (counters[key] || 0) + delta); state.shared.counters = counters; renderUs(); await saveShared({ counters }); }
async function bucketSet(person, id, patch) { const b = { ...(state.shared.bucket || {}) }; const p = { ...(b[person] || {}) }; p[id] = { ...(p[id] || {}), ...patch }; b[person] = p; state.shared.bucket = b; renderUs(); await saveShared({ bucket: b }); }
async function bucketDel(person, id) { const b = { ...(state.shared.bucket || {}) }; const p = { ...(b[person] || {}) }; delete p[id]; b[person] = p; state.shared.bucket = b; renderUs(); await saveShared({ bucket: b }); }

// ---------- Ecrane ----------
function switchDay(day) {
  if (!DAYS.includes(day)) return; state.day = day;
  $$('#dayTabs .seg, #exploreDays .seg').forEach((b) => { b.classList.toggle('selected', b.dataset.day === day); b.classList.toggle('today', b.dataset.day === todayKey()); });
  const t = $('#exploreTitle'); if (t) t.textContent = DAY_LABEL[day] + (todayKey() === day ? ' · azi' : '');
  renderDay(); renderMap(); renderNextStop();
}
function setFilter(c) { state.filter = c; $$('.chip[data-cat]').forEach((b) => b.classList.toggle('selected', b.dataset.cat === c)); renderDay(); }
function renderNotes() { const ta = $('#sharedNotes'); if (ta && document.activeElement !== ta) ta.value = state.shared.notes || ''; }
function renderAll() { renderDay(); renderMap(); renderNextStop(); renderNearby(); renderUs(); }
function setView(v) {
  if (!['plan', 'explore', 'us', 'info'].includes(v)) v = 'plan';
  state.view = v; lsSet(LS.view, v);
  $('#pinSheet').classList.add('hidden'); $('#radarBanner').classList.add('hidden');
  $$('section[data-view]').forEach((s) => s.classList.toggle('hidden', s.dataset.view !== v));
  $$('.nav-btn').forEach((b) => b.classList.toggle('selected', b.dataset.view === v));
  $('#fab').classList.toggle('hidden', v !== 'plan');
  window.scrollTo({ top: 0 });
  if (v === 'explore') { ensureMap(); renderMap(); renderNextStop(); if (!state.radarOn) startRadar(); }
  if (v === 'us') renderUs();
  if (v === 'info') { const url = location.href.split('#')[0].split('?')[0]; $('#shareUrl').value = url; $('#whatsappShareBtn').href = `https://wa.me/?text=${encodeURIComponent(`${SUMMARY_TEXT}\n\n📱 Ghidul live: ${url}`)}`; }
}
function applyThemeIcon() { const dark = document.documentElement.classList.contains('dark'); $('#themeIcon').innerHTML = icon(dark ? 'light_mode' : 'dark_mode'); $('meta[name="theme-color"]')?.setAttribute('content', dark ? '#131311' : '#F8F6F0'); }
function toggleTheme() { const h = document.documentElement; const d = h.classList.toggle('dark'); h.classList.toggle('light', !d); try { localStorage.setItem(LS.theme, d ? 'dark' : 'light'); } catch {} applyThemeIcon(); }
async function share() { const url = location.href.split('#')[0].split('?')[0]; if (navigator.share && location.protocol === 'https:') { try { await navigator.share({ title: 'Trippin · Barcelona', text: 'Ghidul nostru de vacanță în Barcelona & PortAventura (4–9 noiembrie).', url }); return; } catch (e) { if (e && e.name === 'AbortError') return; } } setView('info'); }
async function copyText(text, ok) { try { await navigator.clipboard.writeText(text); } catch { const ta = document.createElement('textarea'); ta.value = text; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); } catch {} ta.remove(); } toast(ok); }
function dayRoute() {
  const stops = dayItems(state.day).filter((l) => !state.shared.visited[l.id]); if (!stops.length) return toast('Nu mai e nimic de vizitat azi.');
  const pts = stops.map(destOf); const origin = state.pos ? `${state.pos.lat},${state.pos.lng}` : pts.shift(); const destination = pts.pop() ?? origin; const wp = pts.slice(0, 9);
  const url = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}${wp.length ? `&waypoints=${encodeURIComponent(wp.join('|'))}` : ''}&travelmode=${state.day === 'thu' ? 'driving' : 'transit'}`;
  toast(`Deschid ${DAY_LABEL[state.day]} ca traseu cu ${stops.length} opriri în Google Maps.`, 'route');
  if (pts.length > 9) toast('Google Maps primește maximum 9 opriri; am trimis primele.', 'info');
  window.open(url, '_blank', 'noopener');
}

// ---------- Instalare ----------
function installSheetHTML() {
  const ios = isIOS();
  return `<div class="sheet-handle"></div>
    <div class="flex items-start justify-between gap-2"><div><div class="eyebrow muted">Trippin pe telefon</div><h3 class="t-headline text-[24px]">Pune-o pe ecranul principal</h3></div><button data-action="close-modal" class="icon-btn icon-btn-sm press" aria-label="Închide">${icon('close')}</button></div>
    <p class="t-body mt-2">Merge ca o aplicație: fără bara browserului, pornește și fără semnal, iar pe Android apare în meniul Share din Instagram.</p>
    <div class="group mt-4">${ios
      ? `<div class="row compact"><span class="badge badge-primary">1</span><div class="text-[14px]">În Safari, apasă butonul <b>Share</b> ${icon('open_in_new', 'i-16')} (pătratul cu săgeată, jos în mijloc).</div></div><div class="row compact"><span class="badge badge-primary">2</span><div class="text-[14px]">Derulează și alege <b>„Add to Home Screen”</b> / „Adaugă pe ecranul principal”.</div></div><div class="row compact"><span class="badge badge-primary">3</span><div class="text-[14px]">Apasă <b>Add</b>. Deschide aplicația de pe ecranul principal de acum înainte.</div></div>`
      : `<div class="row compact"><span class="badge badge-primary">1</span><div class="text-[14px]">În Chrome, apasă meniul <b>⋮</b> din dreapta sus.</div></div><div class="row compact"><span class="badge badge-primary">2</span><div class="text-[14px]">Alege <b>„Add to Home screen”</b> / „Adaugă pe ecranul de pornire”, apoi <b>Install</b>.</div></div><div class="row compact"><span class="badge badge-primary">3</span><div class="text-[14px]">Gata: apare în lista de aplicații și în meniul Share din Instagram / Google Maps.</div></div>`}</div>
    ${state.installPrompt ? `<button data-action="install" class="btn btn-l btn-filled press w-full mt-4">${icon('download')} Instalează acum</button>` : ''}
    <button data-action="close-modal" class="btn btn-text press w-full mt-2">Mai târziu</button>`;
}
function openInstallSheet() { $('#coffeeBody').innerHTML = installSheetHTML(); $('#coffeeSheet').classList.remove('hidden'); lsSet(LS.install, Date.now()); }
function maybePromptInstall() { if (isStandalone() || location.hostname === 'localhost') return; const seen = lsGet(LS.install, 0); if (Date.now() - seen < 3 * 86400000) return; setTimeout(openInstallSheet, 2500); }

// ---------- Persistență ----------
function loadLocal() { state.custom = lsGet(LS.locations, []); state.shared = { ...state.shared, ...lsGet(LS.shared, {}) }; state.photos = lsGet(LS.photos, {}); state.alerted = lsGet(LS.alerted, {}); }
function persistLocal() { lsSet(LS.locations, state.custom); lsSet(LS.shared, state.shared); }
async function loadFirebaseConfig() { const local = window.FIREBASE_CONFIG; if (local && local.apiKey && local.projectId) return local; try { const res = await fetch('/__/firebase/init.json', { cache: 'no-store' }); if (res.ok) { const cfg = await res.json(); if (cfg && cfg.apiKey && cfg.projectId) return cfg; } } catch {} return null; }
async function connectFirebase() {
  const cfg = await loadFirebaseConfig(); if (!cfg) { setSyncStatus('local', 'Fără configurație Firebase.'); return; }
  try {
    const V = '11.6.1';
    const [{ initializeApp }, fs] = await Promise.all([import(`https://www.gstatic.com/firebasejs/${V}/firebase-app.js`), import(`https://www.gstatic.com/firebasejs/${V}/firebase-firestore.js`)]);
    const app = initializeApp(cfg); let db; try { db = fs.initializeFirestore(app, { localCache: fs.persistentLocalCache({ tabManager: fs.persistentMultipleTabManager() }) }); } catch { db = fs.getFirestore(app); }
    fb = { db, fs }; let first = true;
    fs.onSnapshot(fs.query(fs.collection(db, 'trips', TRIP_ID, 'locations'), fs.orderBy('createdAt', 'asc')), (snap) => { state.custom = snap.docs.map((d) => ({ id: d.id, isCustom: true, ...d.data() })); lsSet(LS.locations, state.custom); renderAll(); refreshDetail(); if (first) { first = false; state.online = true; setSyncStatus('online'); } }, (err) => { console.error(err); state.online = false; setSyncStatus('local', err.message); toast('Nu m-am putut conecta la baza de date. Salvez local.', 'info'); });
    fs.onSnapshot(fs.doc(db, 'trips', TRIP_ID, 'state', 'shared'), (snap) => { const d = snap.data() || {}; for (const k of ['quests', 'visited', 'pins', 'skipped', 'bucket', 'counters']) if (d[k] && typeof d[k] === 'object') state.shared[k] = d[k]; if (Array.isArray(d.coffeeLog)) state.shared.coffeeLog = d.coffeeLog; if (typeof d.coffeeCount === 'number') state.shared.coffeeCount = d.coffeeCount; if (typeof d.notes === 'string') state.shared.notes = d.notes; persistLocal(); renderNotes(); renderAll(); refreshDetail(); }, (err) => console.error(err));
    fs.onSnapshot(fs.collection(db, 'trips', TRIP_ID, 'photos'), (snap) => { state.photos = {}; snap.forEach((d) => { state.photos[d.id] = d.data(); }); renderAll(); refreshDetail(); }, (err) => console.error(err));
  } catch (err) { console.error(err); setSyncStatus('local', err.message); }
}
async function saveShared(patch) { Object.assign(state.shared, patch); if (fb && state.online) { const { db, fs } = fb; await fs.setDoc(fs.doc(db, 'trips', TRIP_ID, 'state', 'shared'), { ...patch, updatedAt: fs.serverTimestamp() }, { merge: true }); } else persistLocal(); }
async function saveLocation(data, editingId) {
  if (fb && state.online && !(editingId && String(editingId).startsWith('local-'))) { const { db, fs } = fb; if (editingId) await fs.updateDoc(fs.doc(db, 'trips', TRIP_ID, 'locations', editingId), data); else await fs.addDoc(fs.collection(db, 'trips', TRIP_ID, 'locations'), { ...data, createdAt: fs.serverTimestamp() }); }
  else { if (editingId) state.custom = state.custom.map((l) => (l.id === editingId ? { ...l, ...data } : l)); else state.custom.push({ ...data, id: 'local-' + Date.now(), isCustom: true, createdAt: new Date().toISOString() }); persistLocal(); renderAll(); }
}
async function deleteLocation(id) { if (!confirm('Ștergi acest loc din programul comun?')) return; if (fb && state.online && !String(id).startsWith('local-')) { const { db, fs } = fb; await fs.deleteDoc(fs.doc(db, 'trips', TRIP_ID, 'locations', id)); } else { state.custom = state.custom.filter((l) => l.id !== id); persistLocal(); renderAll(); } closeModals(); toast('Locul a fost șters.', 'delete'); }
async function toggleVisited(k) { const v = { ...state.shared.visited, [k]: !state.shared.visited[k] }; state.shared.visited = v; renderAll(); refreshDetail(); await saveShared({ visited: v }); }
async function toggleSkip(k) { const s = { ...state.shared.skipped, [k]: !state.shared.skipped[k] }; state.shared.skipped = s; renderAll(); refreshDetail(); await saveShared({ skipped: s }); toast(s[k] ? 'Scos din program. Îl poți pune înapoi oricând.' : 'Pus înapoi în program.'); }
async function pinHere(k) { if (!state.pos) return toast('Nu am încă poziția ta. Deschide Harta.', 'my_location'); const p = { ...state.shared.pins, [k]: { lat: state.pos.lat, lng: state.pos.lng } }; state.shared.pins = p; renderAll(); refreshDetail(); await saveShared({ pins: p }); toast('Poziția exactă a fost salvată pentru toți.', 'push_pin'); }
let notesTimer;
function onNotesInput() { const v = $('#sharedNotes').value.slice(0, 2000); $('#notesStatus').textContent = 'Se salvează…'; clearTimeout(notesTimer); notesTimer = setTimeout(async () => { try { await saveShared({ notes: v }); $('#notesStatus').textContent = state.online ? 'Salvat și sincronizat ✓' : 'Salvat pe acest telefon ✓'; } catch { $('#notesStatus').textContent = 'Eroare la salvare'; } }, 700); }

// ---------- Adăugare ----------
function parseShared(text) {
  const out = { text: (text || '').trim(), url: null, source: null, title: '', lat: null, lng: null };
  const m = /https?:\/\/[^\s<>"']+/i.exec(out.text); if (m) out.url = m[0].replace(/[),.]+$/, '');
  const lines = out.text.split(/\n+/).map((s) => s.trim()).filter((s) => s && !/^https?:\/\//i.test(s));
  if (out.url) {
    let u; try { u = new URL(out.url); } catch { u = null; } const host = u ? u.hostname.replace(/^www\./, '') : '';
    if (/instagram\.com/.test(host)) out.source = 'instagram'; else if (/tiktok\.com/.test(host)) out.source = 'tiktok'; else if (/youtu\.?be/.test(host)) out.source = 'youtube';
    else if ((u && /google\.[a-z.]+$/.test(host) && /\/maps/.test(u.pathname)) || /maps\.app\.goo\.gl|goo\.gl\/maps|maps\.google/.test(host + (u?.pathname || ''))) out.source = 'gmaps'; else out.source = 'web';
    if (out.source === 'gmaps' && u) { const place = /\/maps\/place\/([^/]+)/.exec(u.pathname); if (place) out.title = decodeURIComponent(place[1].replace(/\+/g, ' ')); const at = /@(-?\d+\.\d+),(-?\d+\.\d+)/.exec(u.pathname); if (at) { out.lat = +at[1]; out.lng = +at[2]; } const d3 = /!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/.exec(u.href); if (d3) { out.lat = +d3[1]; out.lng = +d3[2]; } const q = u.searchParams.get('q') || u.searchParams.get('query'); if (q) { const c = /^(-?\d+\.\d+),\s*(-?\d+\.\d+)$/.exec(q); if (c) { out.lat = +c[1]; out.lng = +c[2]; } else if (!out.title) out.title = q; } }
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
function resetForm() { $('#addLocationForm').reset(); $('#editingId').value = ''; $('#locLink').value = ''; $('#locSource').value = ''; $('#linkInput').value = ''; $('#linkResult').classList.add('hidden'); $('#posInfo').textContent = ''; formPos = null; $('#useMyPosBtn span:last-child').textContent = 'Sunt aici acum'; $('#addTitle').textContent = 'Adaugă un loc'; $('#saveLocBtn').textContent = 'Salvează în programul comun'; $('#locDay').value = state.day; $('#locAddedBy').value = me(); }
function openAdd({ tab = 'manual', prefill = {}, shared = null, editing = null } = {}) {
  closeModals(); resetForm(); setAddTab(tab);
  if (editing) { $('#addTitle').textContent = 'Editează locul'; $('#saveLocBtn').textContent = 'Salvează modificările'; $('#editingId').value = editing.id; $('#locTitle').value = editing.title || ''; $('#locAddedBy').value = editing.addedBy || 'Daniel'; $('#locDay').value = editing.day; $('#locCat').value = editing.cat; $('#locTime').value = editing.time || ''; $('#locHours').value = editing.hours || ''; $('#locDesc').value = editing.desc || ''; $('#locNear').checked = !!editing.nearPoblenou; $('#locLink').value = editing.link || ''; $('#locSource').value = editing.source || ''; if (typeof editing.lat === 'number') { formPos = { lat: editing.lat, lng: editing.lng }; $('#posInfo').textContent = 'poziție salvată ✓'; } }
  for (const [k, v] of Object.entries(prefill)) { const el = $('#' + k); if (el) el.value = v; }
  if (prefill.pos) { formPos = prefill.pos; $('#posInfo').textContent = 'poziție preluată ✓'; }
  $('#addModal').classList.remove('hidden');
  if (shared) { $('#linkInput').value = shared; applyParsed(parseShared(shared)); } else if (tab === 'link') $('#linkInput').focus(); else if (!editing) $('#locTitle').focus();
}
function closeModals() { $$('[data-modal]').forEach((m) => m.classList.add('hidden')); }
async function handleAddSubmit(e) {
  e.preventDefault(); const btn = $('#saveLocBtn'), title = $('#locTitle').value.trim(), desc = $('#locDesc').value.trim(); if (!title || !desc) return;
  const data = { title, day: $('#locDay').value, cat: $('#locCat').value, time: $('#locTime').value.trim() || 'Flexibil', desc, hours: $('#locHours').value.trim(), mapLink: mapsSearch(title), addedBy: PEOPLE.includes($('#locAddedBy').value) ? $('#locAddedBy').value : 'Daniel', nearPoblenou: $('#locNear').checked, link: $('#locLink').value.trim(), source: $('#locSource').value.trim() };
  lsSet(LS.me, data.addedBy); if (!data.hours) delete data.hours; if (!data.link) { delete data.link; delete data.source; } if (formPos) { data.lat = formPos.lat; data.lng = formPos.lng; }
  const editingId = $('#editingId').value || null; btn.disabled = true; btn.textContent = 'Se salvează…';
  try { await saveLocation(data, editingId); switchDay(data.day); closeModals(); resetForm(); toast(editingId ? 'Modificările au fost salvate.' : state.online ? `Salvat și sincronizat de ${data.addedBy}.` : `Salvat pe acest telefon de ${data.addedBy}.`); }
  catch (err) { console.error(err); toast('Eroare la salvare: ' + (err.message || err), 'info'); } finally { btn.disabled = false; btn.textContent = editingId ? 'Salvează modificările' : 'Salvează în programul comun'; }
}
function useMyPosition() { const b = $('#useMyPosBtn'), lbl = b.querySelector('span:last-child'), done = (pos) => { formPos = pos; lbl.textContent = 'Poziție salvată ✓'; $('#posInfo').textContent = ''; }; if (state.pos) return done(state.pos); if (!navigator.geolocation) return toast('Telefonul nu oferă localizare.', 'my_location'); lbl.textContent = 'Caut poziția…'; navigator.geolocation.getCurrentPosition((p) => done({ lat: p.coords.latitude, lng: p.coords.longitude }), () => { toast('Nu am putut lua poziția.', 'my_location'); lbl.textContent = 'Sunt aici acum'; }, { enableHighAccuracy: true, timeout: 10000 }); }
function addAlternative(i) { const a = ALTERNATIVES[i]; if (!a) return; openAdd({ prefill: { locTitle: a.title, locCat: a.cat, locDay: state.day, locHours: a.hours || '', locDesc: [a.note, a.price ? `Preț: ${a.price}` : '', a.address ? `Adresă: ${a.address}` : ''].filter(Boolean).join('\n'), pos: typeof a.lat === 'number' ? { lat: a.lat, lng: a.lng } : null } }); $('#locTime').focus(); }
function handleShareTarget() { const u = new URL(location.href); if (u.searchParams.has('r')) { u.searchParams.delete('r'); history.replaceState(null, '', u.pathname + (u.search || '')); } const shared = [u.searchParams.get('title'), u.searchParams.get('text'), u.searchParams.get('url')].filter(Boolean).join('\n'); if (!shared) return; history.replaceState(null, '', u.pathname); openAdd({ tab: 'link', shared }); }

// ---------- Radar ----------
const ALERT_COOLDOWN = 3 * 3600 * 1000;
function radarTargets() { const items = []; for (const loc of allLocs()) { if (state.shared.skipped[loc.id]) continue; const p = coordsOf(loc); if (p) items.push({ loc, p, kind: loc.isCustom ? 'custom' : 'plan' }); } ALTERNATIVES.forEach((a, i) => { if (typeof a.lat === 'number') items.push({ loc: altAsLoc(i), p: { lat: a.lat, lng: a.lng, exact: !a.approx }, kind: 'alt' }); }); return items; }
function renderNearby() {
  const list = $('#nearbyList'); if (!list) return;
  if (!state.pos) { list.innerHTML = `<div class="row compact text-[13px] muted">${state.radarOn ? 'Caut poziția…' : 'Apasă „Unde sunt” ca să vezi distanțele.'}</div>`; return; }
  const today = todayKey(); const items = radarTargets().map((it) => ({ ...it, d: distanceM(state.pos, it.p) })).sort((a, b) => (a.kind === 'alt') - (b.kind === 'alt') || a.d - b.d).slice(0, 8);
  list.innerHTML = items.map(({ loc, d, kind, p }) => `<div class="row compact press" data-action="open-detail" data-id="${esc(loc.id)}" role="button">${thumbHTML(loc, 'w-11 h-11 rounded-xl')}<div class="min-w-0 flex-1"><div class="t-title text-[14px] truncate">${esc(loc.title)}</div><div class="text-[11.5px] muted truncate">${fmtDist(d)} · ${walkMin(d)} min pe jos · ${kind === 'alt' ? 'recomandare' : DAY_LABEL[loc.day]}${loc.time ? ' ' + esc(loc.time) : ''}${!p.exact ? ' · aprox.' : ''}${loc.day === today ? ' · <b style="color: var(--primary)">azi</b>' : ''}</div></div><a href="${esc(mapsNav(loc))}" target="_blank" rel="noopener" class="icon-btn icon-btn-sm press shrink-0" style="background: var(--success); color: #fff" aria-label="Navighează" onclick="event.stopPropagation()">${icon('directions_walk', 'i-20')}</a></div>`).join('');
}
function checkProximity() {
  if (!state.pos || !state.radarOn) return; const now = Date.now();
  for (const { loc, p, kind } of radarTargets()) {
    const d = distanceM(state.pos, p); if (d > (loc.radius || 150) || state.shared.visited[loc.id]) continue; if (state.alerted[loc.id] && now - state.alerted[loc.id] < ALERT_COOLDOWN) continue;
    state.alerted[loc.id] = now; lsSet(LS.alerted, state.alerted);
    $('#radarBannerTitle').textContent = loc.title; $('#radarBannerMeta').textContent = `${fmtDist(d)} · ${kind === 'alt' ? 'recomandare din zonă' : (loc.time || '')}${loc.hours ? ' · ' + loc.hours : ''}`; $('#radarBannerNav').href = mapsNav(loc); $('#radarBanner').classList.remove('hidden');
    try { navigator.vibrate?.([200, 100, 200]); } catch {} if ('Notification' in window && Notification.permission === 'granted') { try { new Notification('Sunteți aproape: ' + loc.title, { body: `${fmtDist(d)} · ${loc.hours || loc.time || ''}`, icon: '/icon-192.png', tag: 'bcn-' + loc.id }); } catch {} } break;
  }
}
function onPosition(p) { state.pos = { lat: p.coords.latitude, lng: p.coords.longitude, acc: p.coords.accuracy }; const s = $('#radarStatus'); if (s) s.innerHTML = `${icon('radar', 'i-16 mt-0.5')}<span>Radar activ · precizie ±${Math.round(p.coords.accuracy)} m · alertă la ~150 m de un loc din program, cât timp aplicația e deschisă.</span>`; renderNearby(); renderNextStop(); updateMeMarker(); checkProximity(); if (!onPosition._t || Date.now() - onPosition._t > 20000) { onPosition._t = Date.now(); renderDay(); } }
function onPosError(err) { const s = $('#radarStatus'); if (s) s.innerHTML = `${icon('info', 'i-16 mt-0.5')}<span>${err.code === 1 ? 'Localizarea e blocată. Permite accesul la locație în setările browserului.' : 'Nu găsesc poziția (GPS slab?). Încerc în continuare…'}</span>`; }
async function startRadar() { if (!navigator.geolocation) return toast('Telefonul nu oferă localizare.', 'my_location'); state.radarOn = true; renderNearby(); if ('Notification' in window && Notification.permission === 'default') { try { await Notification.requestPermission(); } catch {} } if (state.watchId != null) navigator.geolocation.clearWatch(state.watchId); state.watchId = navigator.geolocation.watchPosition(onPosition, onPosError, { enableHighAccuracy: true, maximumAge: 5000, timeout: 20000 }); }
function locate() { startRadar(); if (state.pos && state.map) state.map.setView([state.pos.lat, state.pos.lng], 16); else toast('Caut poziția…', 'my_location'); }

// ---------- Harta ----------
function ensureMap() { if (state.map || !window.L || !$('#map')) return; const map = L.map('map', { zoomControl: false }).setView([41.39, 2.17], 12); L.control.zoom({ position: 'topright' }).addTo(map); L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', { maxZoom: 19, attribution: '&copy; OpenStreetMap &copy; CARTO' }).addTo(map); state.map = map; setTimeout(() => map.invalidateSize(), 50); }
function updateMeMarker() { if (!state.map || !state.pos) return; const ll = [state.pos.lat, state.pos.lng]; if (!state.meMarker) state.meMarker = L.marker(ll, { icon: L.divIcon({ className: '', html: '<div class="me"></div>', iconSize: [18, 18], iconAnchor: [9, 9] }), zIndexOffset: 1000 }).addTo(state.map); else state.meMarker.setLatLng(ll); }
function renderMap() {
  if (!state.map) return; state.markers.forEach((m) => m.remove()); state.markers = []; const bounds = []; let n = 0;
  for (const loc of dayItems(state.day)) { const p = coordsOf(loc); n++; if (!p) continue; const cls = state.shared.visited[loc.id] ? 'pin done' : loc.isCustom ? 'pin custom' : 'pin'; const m = L.marker([p.lat, p.lng], { icon: L.divIcon({ className: '', html: `<div class="${cls}">${n}</div>`, iconSize: [30, 30], iconAnchor: [15, 15] }) }).addTo(state.map); m.on('click', () => showPinSheet(loc)); state.markers.push(m); bounds.push([p.lat, p.lng]); }
  for (const z of DAY_ZONES[state.day] || []) ALTERNATIVES.forEach((a, i) => { if (a.zone !== z || typeof a.lat !== 'number') return; const m = L.marker([a.lat, a.lng], { icon: L.divIcon({ className: '', html: '<div class="pin alt">+</div>', iconSize: [22, 22], iconAnchor: [11, 11] }) }).addTo(state.map); m.on('click', () => showPinSheet(altAsLoc(i))); state.markers.push(m); });
  updateMeMarker(); if (bounds.length) state.map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 }); setTimeout(() => state.map.invalidateSize(), 50);
}
function showPinSheet(loc) { const c = cat(loc.cat), p = coordsOf(loc), d = state.pos && p ? distanceM(state.pos, p) : null; $('#pinSheetIcon').className = `thumb w-12 h-12 rounded-xl ${c.cls}`; $('#pinSheetIcon').innerHTML = photoOf(loc.id) ? `<img src="${photoOf(loc.id)}" alt="">` : icon(c.icon, 'ms-fill'); $('#pinSheetTitle').textContent = loc.title; $('#pinSheetMeta').textContent = [loc.time, loc.hours, d != null ? `${fmtDist(d)} · ${walkMin(d)} min` : loc.address].filter(Boolean).join(' · '); $('#pinSheetNav').href = mapsNav(loc); $('#pinSheetOpen').dataset.id = loc.id; $('#pinSheet').classList.remove('hidden'); }

// ---------- PWA ----------
function setupPWA() {
  window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); state.installPrompt = e; $('#installBtn').classList.remove('hidden'); });
  window.addEventListener('appinstalled', () => { $('#installBtn').classList.add('hidden'); closeModals(); toast('Instalată! O găsești pe ecranul principal și în meniul Share.'); });
  const host = location.hostname; if (!('serviceWorker' in navigator) || !(host.endsWith('.web.app') || host.endsWith('.firebaseapp.com') || host === 'localhost' || host === '127.0.0.1')) return;
  let refreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => { if (refreshing) return; refreshing = true; toast('Versiune nouă. Se reîncarcă…', 'sync'); setTimeout(() => location.reload(), 700); });
  navigator.serviceWorker.register('/sw.js').then((reg) => { reg.update().catch(() => {}); setInterval(() => reg.update().catch(() => {}), 30 * 60000); }).catch((e) => console.warn('SW:', e));
}
async function hardRefresh() {
  toast('Actualizez aplicația…', 'sync', 6000);
  try { const regs = navigator.serviceWorker ? await navigator.serviceWorker.getRegistrations() : []; for (const r of regs) await r.unregister(); const keys = await caches.keys(); await Promise.all(keys.map((k) => caches.delete(k))); } catch (e) { console.warn(e); }
  lsSet(LS.img, {}); lsSet(LS.weather, null);
  const u = new URL(location.href); u.searchParams.set('r', Date.now()); location.replace(u.toString());
}
async function installApp() { const p = state.installPrompt; if (!p) return openInstallSheet(); p.prompt(); await p.userChoice; state.installPrompt = null; $('#installBtn').classList.add('hidden'); }

// ---------- Evenimente ----------
document.addEventListener('pointerdown', ripple);
document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-action]'); if (!el) { if (e.target.matches('[data-modal]')) closeModals(); return; }
  if (el.tagName === 'FORM' || el.tagName === 'LABEL') return;
  const a = el.dataset.action, id = el.dataset.id;
  const actions = {
    'view': () => setView(el.dataset.view), 'day': () => switchDay(el.dataset.day), 'filter': () => setFilter(el.dataset.cat), 'person': () => { state.person = el.dataset.person; renderUs(); },
    'toggle-theme': toggleTheme, 'share': share, 'open-add': () => openAdd({ tab: 'manual' }), 'close-modal': closeModals, 'add-tab': () => setAddTab(el.dataset.tab),
    'paste-link': pasteLink, 'parse-link': () => applyParsed(parseShared($('#linkInput').value)), 'modal-search': () => { const q = $('#locTitle').value.trim(); if (q) window.open(mapsSearch(q), '_blank', 'noopener'); else $('#locTitle').focus(); },
    'use-my-position': useMyPosition, 'add-alt': () => addAlternative(Number(el.dataset.index)),
    'copy-link': () => copyText($('#shareUrl').value, 'Linkul a fost copiat.'), 'copy-summary': () => copyText(`${SUMMARY_TEXT}\n\n📱 ${location.href.split('#')[0].split('?')[0]}`, 'Rezumatul a fost copiat.'),
    'open-detail': () => openDetail(id), 'delete-loc': () => deleteLocation(id), 'edit-loc': () => { const l = state.custom.find((x) => x.id === id); if (l) openAdd({ tab: 'manual', editing: l }); },
    'toggle-visited': () => toggleVisited(id), 'toggle-skip': () => toggleSkip(id), 'pin-here': () => pinHere(id), 'add-photo': () => { state.photoTarget = id; $('#photoInput').value = ''; $('#photoInput').click(); },
    'day-route': dayRoute, 'locate': locate, 'open-link': () => window.open(el.dataset.href, '_blank', 'noopener'), 'close-banner': () => $('#radarBanner').classList.add('hidden'), 'close-sheet': () => $('#pinSheet').classList.add('hidden'), 'install': installApp, 'open-install': openInstallSheet, 'refresh': hardRefresh,
    'open-coffee': openCoffee, 'coffee-add': coffeeAdd, 'coffee-undo': coffeeUndo, 'open-weather': openWeather,
    'coffee-type': () => { coffeeSel.type = el.dataset.type; $$('#coffeeTypes .chip').forEach((c) => c.classList.toggle('selected', c === el)); },
    'coffee-place': () => { coffeeSel.place = el.dataset.place; $$('#coffeePlaces .chip').forEach((c) => c.classList.toggle('selected', c === el)); },
    'counter': () => bumpCounter(el.dataset.key, Number(el.dataset.delta)), 'bucket-del': () => bucketDel(el.dataset.person, id), 'bucket-noop': () => {},
  };
  actions[a]?.();
});
document.addEventListener('submit', (e) => {
  if (e.target.id === 'addLocationForm') return handleAddSubmit(e);
  if (e.target.dataset.action === 'bucket-add') { e.preventDefault(); const inp = e.target.querySelector('input'); const text = inp.value.trim(); if (!text) return; const loc = e.target.querySelector('#bucketLoc')?.value || ''; bucketSet(e.target.dataset.person, 'c' + Date.now(), { text, done: false, by: me(), ...(loc ? { loc } : {}) }); inp.value = ''; toast(loc ? 'Adăugat pe listă, legat de loc.' : 'Adăugat pe listă.', 'add_task'); }
});
document.addEventListener('change', async (e) => {
  if (e.target.matches('.bucket-check')) bucketSet(e.target.dataset.person, e.target.dataset.id, { done: e.target.checked }).then(() => { if (e.target.checked) toast('Bifat!', 'celebration'); });
  if (e.target.id === 'photoInput' && e.target.files?.[0] && state.photoTarget) { try { await savePhoto(state.photoTarget, e.target.files[0]); } catch (err) { console.error(err); toast('Nu am putut salva poza: ' + (err.message || err), 'image'); } }
});
document.addEventListener('input', (e) => { if (e.target.id === 'sharedNotes') onNotesInput(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { closeModals(); $('#pinSheet').classList.add('hidden'); } });
document.addEventListener('visibilitychange', () => { if (!document.hidden) { renderDay(); renderNextStop(); loadWeather(); if (state.radarOn) startRadar(); } });

// ---------- Start ----------
hydrateIcons(); applyThemeIcon(); { const b = $('#buildStamp'); if (b && window.BUILD) b.textContent = `${window.BUILD.slice(6, 8)}.${window.BUILD.slice(4, 6)} ${window.BUILD.slice(8, 10)}:${window.BUILD.slice(10, 12)}`; } loadLocal(); renderNotes(); renderWeather(); loadWeather();
switchDay(todayKey() || 'thu');
const hasShare = new URL(location.href).searchParams.has('text') || new URL(location.href).searchParams.has('url');
setView(hasShare ? 'plan' : lsGet(LS.view, 'plan'));
setupPWA(); connectFirebase(); handleShareTarget(); maybePromptInstall();
setInterval(renderNextStop, 60000);

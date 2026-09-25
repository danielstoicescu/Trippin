// Trippin · Barcelona – Mara (13), Anne & Daniel. Offline-first, mobil, stil Google Flights.
import { TRIP, ZONES, DAY_ZONES, DAY_TIPS, DAY_OPPS, ITINERARY, ALTERNATIVES, CURATED, PEOPLE_META, BUCKET_DEFAULTS, COFFEE_TYPES } from './data.js';
import { ICONS } from './icons.js';

const TRIP_ID = TRIP.id;
const DAYS = ['thu', 'fri', 'sat', 'sun', 'mon'];
const DAY_LABEL = { thu: 'Joi 5', fri: 'Vineri 6', sat: 'Sâmbătă 7', sun: 'Duminică 8', mon: 'Luni 9', pool: 'Dorite' };
const DAY_LONG = { thu: 'Joi, 5 noiembrie', fri: 'Vineri, 6 noiembrie', sat: 'Sâmbătă, 7 noiembrie', sun: 'Duminică, 8 noiembrie', mon: 'Luni, 9 noiembrie' };
const DAY_SHORT = { thu: ['Joi', 5], fri: ['Vin', 6], sat: ['Sâm', 7], sun: ['Dum', 8], mon: ['Lun', 9] };
const DAY_SUB = { thu: 'PortAventura · Halloween · Salou', fri: 'Ferrari Land · tren · apus pe plajă', sat: 'Sephora · El Call · Born · MNAC · Blai', sun: 'Sagrada · La Papa · Design · Bunkers', mon: 'Print Workers · Alien · Quimet · zbor 20:20' };
const PEOPLE = ['Daniel', 'Mara', 'Anne'];
const PERSONS = ['mara', 'anne', 'daniel'];
const LS = { locations: 'bcn_locations', shared: 'bcn_shared', photos: 'bcn_photos', theme: 'bcn_theme', alerted: 'bcn_alerted', view: 'bcn_view', me: 'bcn_me', install: 'bcn_install_seen', weather: 'bcn_weather', img: 'bcn_img' };
const BCN = { lat: 41.3874, lng: 2.1686 };
const SUMMARY_TEXT = `Trippin · Barcelona (Mara 13, Anne & Daniel), 5–9 nov:
• Joi 5: PortAventura (Shambhala, Dragon Khan, Halloween), cină în Salou
• Vineri 6: Ferrari Land (Red Force), tren spre BCN, Nomad Coffee, Demasié, apus pe plajă, cină la La Cova Fumada
• Sâmbătă 7: toboganul Sephora, Hollister & Brandy Melville, Satan's Coffee, churros, Cereria Subirà, Santa Caterina, MEMS, Bar del Pla, MNAC gratis, pinchos Blai
• Duminică 8: Three Marks, Sagrada Família, La Papa, SAISEI, Design Museum gratis, Bunkers, Gràcia, La Pepita
• Luni 9: Print Workers, Museo Alien, Quimet & Quimet, MUJI, Hofmann; zbor din El Prat la 20:20`;

const state = {
  view: 'plan', day: 'thu', filter: 'all', person: 'mara',
  custom: [], photos: {},
  shared: { coffeeCount: 0, coffeeLog: [], counters: {}, bucket: {}, quests: {}, visited: {}, pins: {}, skipped: {}, times: {}, days: {}, notes: '' },
  online: false, radarOn: false, pos: null, watchId: null, alerted: {},
  installPrompt: null, map: null, markers: [], meMarker: null, homeMarker: null, newMarker: null, detailId: null, photoTarget: null, picking: false,
};
let fb = null;

// ---------- Utilitare ----------
const $ = (s) => document.querySelector(s);
const $$ = (s) => Array.from(document.querySelectorAll(s));
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const GMAPS_SVG = (cls, style) => `<svg class="ic ${cls}" viewBox="0 0 24 24" aria-hidden="true"${style ? ` style="${style}"` : ''}><path d="M12 1.5a8 8 0 0 0-8 8c0 5.6 7 12.6 7.3 12.9a1 1 0 0 0 1.4 0C13 22.1 20 15.1 20 9.5a8 8 0 0 0-8-8z" fill="#EA4335"/><path d="M12 1.5a8 8 0 0 0-8 8c0 1.9.8 3.9 1.9 5.8L12 9.5V1.5z" fill="#4285F4"/><path d="M12 1.5v8l6.1 5.8A13 13 0 0 0 20 9.5a8 8 0 0 0-8-8z" fill="#FBBC04"/><path d="M5.9 15.3 12 9.5l6.1 5.8c-1.6 2.8-4 5.6-5.4 7.1a1 1 0 0 1-1.4 0c-1.4-1.5-3.8-4.3-5.4-7.1z" fill="#34A853"/><circle cx="12" cy="9.5" r="3" fill="#fff"/></svg>`;
const icon = (name, cls = '', style = '') => { if (name === 'gmaps') return GMAPS_SVG(cls, style); const p = ICONS[name] || ICONS.info; return `<svg class="ic ${cls}" viewBox="0 -960 960 960" aria-hidden="true"${style ? ` style="${style}"` : ''}>${p.length > 1 ? `<path class="o" d="${p[0]}"/><path class="f" d="${p[1]}"/>` : `<path class="o f" d="${p[0]}"/>`}</svg>`; };
function hydrateIcons(root = document) { root.querySelectorAll('span.material-symbols-rounded').forEach((el) => { const t = document.createElement('template'); t.innerHTML = icon(el.textContent.trim(), el.className.replace('material-symbols-rounded', '').trim(), el.getAttribute('style') || ''); el.replaceWith(t.content.firstChild); }); }
const inCity = (q) => /(barcelona|salou|vila-seca|portaventura)/i.test(q);
const mapsSearch = (q) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q + (inCity(q) ? '' : ' Barcelona'))}`;
const placeQuery = (loc) => loc.placeQuery || (loc.address ? `${loc.title}, ${loc.address}` : loc.title);
// Mutările făcute din aplicație la locurile din program: altă oră (`times`) sau altă zi (`days`)
const withTime = (l) => { const t = state.shared.times?.[l.id], d = state.shared.days?.[l.id]; return t || d ? { ...l, ...(d ? { day: d } : {}), ...(t ? { time: t, movedTime: true } : {}) } : l; };
const allLocs = () => [...ITINERARY.map(withTime), ...state.custom];
function altAsLoc(i) { const a = ALTERNATIVES[i]; return a ? { ...a, id: 'alt-' + i, isAlt: true, altIndex: i, radius: 150 } : null; }
const findLoc = (id) => (id === 'home' ? baseLoc() : null) || allLocs().find((l) => l.id === id) || (String(id).startsWith('alt-') ? altAsLoc(Number(String(id).slice(4))) : null);
function enriched(loc) { const c = loc.isCustom ? CURATED[(loc.title || '').trim().toLowerCase()] : null; return c ? { ...c, ...loc, rating: loc.rating ?? c.rating, review: loc.review ?? c.review, popular: loc.popular ?? c.popular, tips: loc.tips ?? c.tips, hours: loc.hours && !/^(sunday closed|shop)$/i.test(loc.hours) ? loc.hours : c.hours || loc.hours, price: loc.price || c.price, address: loc.address || c.address, minStay: loc.minStay || c.minStay, placeQuery: loc.placeQuery || c.placeQuery, site: loc.site || c.site, img: loc.img || c.img, variants: c.variants, cat: loc.cat === 'mara' ? (c.cat || 'fun') : loc.cat } : loc; }
function coordsOf(loc) { const pin = state.shared.pins[loc.id]; if (pin && typeof pin.lat === 'number') return { lat: pin.lat, lng: pin.lng, exact: true }; if (typeof loc.lat === 'number' && typeof loc.lng === 'number') return { lat: loc.lat, lng: loc.lng, exact: !loc.approx }; const c = loc.isCustom ? CURATED[(loc.title || '').trim().toLowerCase()] : null; if (c && typeof c.lat === 'number') return { lat: c.lat, lng: c.lng, exact: false }; return null; }
const destOf = (loc) => { const p = coordsOf(loc); if (p && p.exact) return `${p.lat.toFixed(6)},${p.lng.toFixed(6)}`; const a = loc.placeQuery || (loc.address ? `${loc.title}, ${loc.address}` : loc.title); return inCity(a) ? a : `${a}, Barcelona`; };
const mapsNav = (loc, mode = 'walking') => `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destOf(loc))}&travelmode=${mode}&dir_action=navigate`;
const originOf = (a) => (a.arrive ? { id: a.id + '-arr', title: a.arrive.title, placeQuery: a.arrive.placeQuery, lat: a.arrive.lat, lng: a.arrive.lng } : a);
const mapsLeg = (a, b, mode = 'walking') => `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(destOf(originOf(a)))}&destination=${encodeURIComponent(destOf(b))}&travelmode=${mode}`;
const lsGet = (k, d) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } };
const lsSet = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };
function distanceM(a, b) { const R = 6371000, r = (d) => (d * Math.PI) / 180; const dLat = r(b.lat - a.lat), dLng = r(b.lng - a.lng); const s = Math.sin(dLat / 2) ** 2 + Math.cos(r(a.lat)) * Math.cos(r(b.lat)) * Math.sin(dLng / 2) ** 2; return 2 * R * Math.asin(Math.sqrt(s)); }
const fmtDist = (m) => (m < 1000 ? `${Math.max(10, Math.round(m / 10) * 10)} m` : `${(m / 1000).toFixed(1).replace('.', ',')} km`);
// Mers pe jos realist: străzile adaugă ~30% față de linia dreaptă, 4,8 km/h
const walkMin = (m) => Math.max(1, Math.round((m * 1.3) / 80));
const transitMin = (m) => Math.round(((m * 1.3) / 1000) * 2.4 + 9);
const fmtMin = (n) => (n < 60 ? `${n} min` : `${Math.floor(n / 60)} h${n % 60 ? ' ' + (n % 60) + ' min' : ''}`);
function parseRange(t) { const m = /(\d{1,2}):(\d{2})\s*[–-]\s*(\d{1,2}):(\d{2})/.exec(t || ''); return m ? { from: +m[1] * 60 + +m[2], to: +m[3] * 60 + +m[4] } : null; }
const startMin = (loc) => { const r = parseRange(loc.time); if (r) return r.from; const m = /(\d{1,2}):(\d{2})/.exec(loc.time || ''); return m ? +m[1] * 60 + +m[2] : 10000; };
const hhmm = (n) => `${String(Math.floor(n / 60) % 24).padStart(2, '0')}:${String(n % 60).padStart(2, '0')}`;
const fmtCount = (n) => (n >= 1000 ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1).replace('.', ',')}k` : String(n));
const me = () => lsGet(LS.me, 'Daniel');
const fold = (t) => String(t || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
const isIOS = () => /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
const isStandalone = () => window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
const buzz = (ms = 10) => { try { navigator.vibrate?.(ms); } catch {} };
const shortTitle = (t) => String(t || '').split('(')[0].split(' & ')[0].split(',')[0].trim();

let toastTimer;
function toast(message, ic = 'check_circle', ms = 3400, action = null) {
  $('#toastMessage').textContent = message; $('#toastIcon').innerHTML = icon(ic, 'i-20');
  const b = $('#toastAction'); if (action) { b.textContent = action.label; b.onclick = () => { action.run(); $('#toast').classList.add('off'); }; b.classList.remove('hidden'); } else { b.classList.add('hidden'); b.onclick = null; }
  $('#toast').classList.remove('off'); clearTimeout(toastTimer); toastTimer = setTimeout(() => $('#toast').classList.add('off'), ms);
}
function setSyncStatus(mode, detail) {
  const text = mode === 'online' ? 'Sincronizat live: ce bifați se vede la toți' : mode === 'local' ? 'Fără conexiune la baza comună: se salvează pe acest telefon' : 'Se conectează la programul comun…';
  const dot = $('#syncDot'); if (dot) { dot.dataset.mode = mode; dot.title = text + (detail ? ' (' + detail + ')' : ''); dot.setAttribute('aria-label', text); }
  const row = $('#syncText'); if (row) row.innerHTML = `${icon(mode === 'online' ? 'cloud_done' : mode === 'local' ? 'cloud_off' : 'sync', '', mode === 'online' ? 'color: var(--green)' : 'color: var(--text-2)')}<span class="flex-1 t-2">${esc(text)}</span>`;
}
function sheetHead(eyebrow, title, extra = '') { return `<div class="sheet-top"><div class="handle"></div><div class="flex items-start gap-2 pb-3"><div class="min-w-0 flex-1">${eyebrow ? `<div class="cap">${eyebrow}</div>` : ''}<h2 class="ttl-1 mt-0.5">${title}</h2></div>${extra}<button data-action="close-modal" class="icon-btn press" aria-label="Închide">${icon('close')}</button></div></div>`; }
function openSheet(html) { $('#coffeeBody').innerHTML = html; $('#coffeeSheet').classList.remove('hidden'); $('#coffeeBody').scrollTop = 0; }

// ---------- Vremea (Open-Meteo, fără cheie) ----------
const WMO = (c, day = 1) => c === 0 ? [day ? 'sunny' : 'clear_night', 'senin'] : c <= 2 ? [day ? 'partly_cloudy_day' : 'partly_cloudy_night', 'parțial noros'] : c === 3 ? ['cloud', 'noros'] : c <= 48 ? ['foggy', 'ceață'] : c <= 57 ? ['rainy', 'burniță'] : c <= 67 ? ['rainy', 'ploaie'] : c <= 77 ? ['weather_snowy', 'ninsoare'] : c <= 82 ? ['rainy', 'averse'] : ['thunderstorm', 'furtună'];
let weather = null;
function renderWeather() {
  const el = $('#weather'); if (!el) return;
  if (!weather) { el.innerHTML = `${icon('thermostat', 'i-18')}<span>${navigator.onLine ? 'Barcelona' : 'fără semnal'}</span>`; return; }
  const c = weather.current, [ic] = WMO(c.weather_code, c.is_day);
  el.innerHTML = `${icon(ic, 'i-20 ms-fill', 'color: var(--star)')}<span class="tabular" style="color: var(--text); font-weight: 500">${Math.round(c.temperature_2m)}°</span><span class="truncate">Barcelona</span>`;
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
  if (!weather) return `${sheetHead('Vremea', 'Barcelona')}<p class="t-2 pb-4">Nu am putut lua vremea (fără semnal?). Încerc din nou când revine conexiunea.</p>`;
  const c = weather.current, d = weather.daily, [ic, label] = WMO(c.weather_code, c.is_day);
  const DOW = ['Du', 'Lu', 'Ma', 'Mi', 'Jo', 'Vi', 'Sâ'];
  const rows = d.time.map((t, i) => { const [wi, wl] = WMO(d.weather_code[i]); const dt = new Date(t + 'T12:00:00'); const trip = DAYS.find((k) => TRIP.days[k] === t); return `<div class="li tight"><div class="w-14 font-medium">${i === 0 ? 'Azi' : DOW[dt.getDay()] + ' ' + dt.getDate()}</div>${icon(wi, 'i-22 ms-fill', 'color: var(--star)')}<div class="flex-1 t-2">${wl}${trip ? ` · <b class="t-blue">${DAY_LABEL[trip]}</b>` : ''}</div><div class="cap tabular">${d.precipitation_probability_max[i]}%</div><div class="tabular w-16 text-right font-medium">${Math.round(d.temperature_2m_min[i])}° / ${Math.round(d.temperature_2m_max[i])}°</div></div>`; }).join('');
  return `${sheetHead('Vremea live · Barcelona', label[0].toUpperCase() + label.slice(1))}
    <div class="flex items-center gap-4 pb-4">${icon(ic, 'i-48 ms-fill', 'color: var(--star)')}<div><div class="tabular" style="font-size: 48px; line-height: 52px">${Math.round(c.temperature_2m)}°</div><div class="t-2">se simte ${Math.round(c.apparent_temperature)}° · vânt ${Math.round(c.wind_speed_10m)} km/h · umiditate ${c.relative_humidity_2m}%</div></div></div>
    <div class="card list">${rows}</div>
    <p class="cap mt-3 pb-2">Apus azi la ${(d.sunset[0] || '').slice(11, 16)}. Prognoza acoperă 7 zile; pentru 5–9 noiembrie apare cu o săptămână înainte. În noiembrie: 12–18 °C, jachetă subțire și o umbrelă mică.</p>`;
}
function openWeather() { openSheet(weatherSheetHTML()); loadWeather(); }

// ---------- Poze reale (Wikimedia Commons, licență liberă, cu atribuire) ----------
const imgCache = lsGet(LS.img, {});
const COMMONS_FILE = (f) => `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(f)}?width=1000`;
const COMMONS_PAGE = (f) => `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(f.replace(/ /g, '_'))}`;
const inflight = new Set(); let rerenderTimer;
function stockOf(loc) {
  if (!loc || loc.id === 'home' || (loc.isCustom && (loc.title || '').length < 4)) return null; const c = imgCache[loc.id];
  if (c && c.url) return c; if (c && c.none && Date.now() - c.at < 7 * 86400000) return null;
  if (loc.img?.file && !(c && c.failed)) return { url: COMMONS_FILE(loc.img.file), page: COMMONS_PAGE(loc.img.file), credit: 'Wikimedia Commons' };
  ensureStock(loc); return null;
}
async function ensureStock(loc) {
  if (inflight.has(loc.id) || !navigator.onLine) return; inflight.add(loc.id);
  const e = loc.isCustom ? enriched(loc) : loc; const q = e.img?.q || e.placeQuery || (loc.isCustom ? `${loc.title} Barcelona` : loc.title);
  try {
    const r = await fetch(`https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(q + ' filetype:bitmap')}&gsrnamespace=6&gsrlimit=1&prop=imageinfo&iiprop=url|extmetadata&iiurlwidth=1000&format=json&origin=*`);
    const j = await r.json(); const pg = Object.values(j.query?.pages || {})[0]; const ii = pg?.imageinfo?.[0]; if (!ii) throw new Error('no image');
    const artist = (ii.extmetadata?.Artist?.value || '').replace(/<[^>]+>/g, '').trim();
    imgCache[loc.id] = { url: ii.thumburl || ii.url, page: ii.descriptionurl, credit: artist ? artist.slice(0, 40) : 'Wikimedia Commons' };
  } catch { imgCache[loc.id] = { none: true, at: Date.now() }; }
  lsSet(LS.img, imgCache); inflight.delete(loc.id);
  clearTimeout(rerenderTimer); rerenderTimer = setTimeout(() => { renderAll(); refreshDetail(); }, 500);
}
window.__imgFail = (el, id) => { el.remove(); const loc = findLoc(id); if (!loc) return; imgCache[id] = { failed: true }; lsSet(LS.img, imgCache); ensureStock(loc); };
window.__imgOk = (el) => el.removeAttribute('data-loading');
const photoOf = (id) => state.photos[id]?.data || state.photos[id]?.url || null;
function imgTag(loc, eager = false) {
  const own = photoOf(loc.id); if (own) return `<img src="${esc(own)}" alt="" data-loading onload="__imgOk(this)" ${eager ? '' : 'loading="lazy"'}>`;
  const st = stockOf(loc); return st ? `<img src="${esc(st.url)}" alt="" data-loading onload="__imgOk(this)" onerror="__imgFail(this,'${esc(loc.id)}')" ${eager ? '' : 'loading="lazy"'}>` : '';
}
function photoHTML(loc, { cls = '', overlay = '', eager = false } = {}) { const c = cat(loc.cat); return `<div class="photo ${c.cls} ${cls}">${icon(c.icon, 'i-48')}${imgTag(loc, eager)}${overlay}</div>`; }
function thumbHTML(loc, size = 56) { const c = cat(loc.cat); return `<div class="thumb ${c.cls}" style="width:${size}px;height:${size}px">${icon(c.icon, size > 48 ? 'i-28' : 'i-22')}${imgTag(loc)}</div>`; }
function ripple(e) { const el = e.target.closest('.press'); if (!el) return; const r = el.getBoundingClientRect(), d = Math.max(r.width, r.height); const s = document.createElement('span'); s.className = 'ripple'; s.style.cssText = `width:${d}px;height:${d}px;left:${e.clientX - r.left - d / 2}px;top:${e.clientY - r.top - d / 2}px`; el.appendChild(s); setTimeout(() => s.remove(), 600); }

// ---------- Timp ----------
function todayKey() { const t = new Date(), iso = `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`; return DAYS.find((d) => TRIP.days[d] === iso) || null; }
function isNow(loc) { if (todayKey() !== loc.day) return false; const r = parseRange(loc.time); if (!r) return false; const m = new Date().getHours() * 60 + new Date().getMinutes(); return m >= r.from - 15 && m <= r.to; }
function countdownText() { const start = new Date(TRIP.days.thu + 'T00:00:00'), end = new Date(TRIP.days.mon + 'T23:59:59'), now = new Date(); const days = Math.ceil((start - now) / 86400000); if (now > end) return 'A fost o excursie frumoasă'; if (days > 1) return `Barcelona · peste ${days} zile`; if (days === 1) return 'Mâine plecăm!'; return 'Suntem în Barcelona'; }

// ---------- Categorii ----------
const CAT = { coffee: { cls: 'c-coffee', icon: 'local_cafe', label: 'Cafea & bere' }, food: { cls: 'c-food', icon: 'restaurant', label: 'Mâncare' }, sweet: { cls: 'c-sweet', icon: 'icecream', label: 'Dulciuri' }, shop: { cls: 'c-shop', icon: 'local_mall', label: 'Shopping' }, fun: { cls: 'c-fun', icon: 'attractions', label: 'Distracție' }, art: { cls: 'c-art', icon: 'palette', label: 'Artă & vederi' } };
const CAT_KEYS = Object.keys(CAT);
const catKey = (c) => (c === 'mara' ? 'fun' : CAT[c] ? c : 'none');
const cat = (c) => CAT[catKey(c)] || { cls: 'c-none', icon: 'place', label: 'Loc' };
const isPool = (loc) => loc.day === 'pool';
const SOURCE = { instagram: 'Instagram', tiktok: 'TikTok', youtube: 'YouTube', gmaps: 'Google Maps', web: 'Link' };
function dayItems(day, includeSkipped = false) { return allLocs().filter((l) => l.day === day && (includeSkipped || !state.shared.skipped[l.id])).map((l, i) => ({ l, i })).sort((a, b) => startMin(a.l) - startMin(b.l) || a.i - b.i).map((x) => x.l); }

// ---------- Drumul dintre două opriri ----------
function legOf(a, b, day) {
  const pa = a.arrive ? { lat: a.arrive.lat, lng: a.arrive.lng } : coordsOf(a), pb = coordsOf(b); if (!pa || !pb) return null;
  const d = distanceM(pa, pb); if (d < 60) return null;
  if (b.legIn) return { d, ...b.legIn };
  if (d > 20000) return { d, min: Math.round((d / 1000) * 0.8 + 15), mode: 'transit', icon: 'train', label: 'cu trenul sau mașina' };
  if (day === 'thu' && d > 4000) return { d, min: Math.round((d / 1000) * 1.5 + 6), mode: 'driving', icon: 'directions_car', label: 'cu mașina' };
  if (d > 2200) return { d, min: transitMin(d), mode: 'transit', icon: 'subway', label: 'metrou sau taxi' };
  return { d, min: walkMin(d), mode: 'walking', icon: 'directions_walk', label: 'pe jos' };
}

// ---------- Planificator: drumuri + timp minim la fiecare loc ----------
// Locurile cu interval fix rămân pe loc; cele „flexibile” se așază unde încap, cu drumul socotit.
// Unde nu încape ceva, apare un avertisment cu opțiunea de a alege.
const MIN_STAY = { coffee: 30, sweet: 20, food: 60, shop: 40, fun: 60, art: 45, none: 30 };
const stayOf = (loc) => { const e = enriched(loc); return e.minStay || MIN_STAY[catKey(e.cat)] || 30; };
const DAY_START = 9 * 60, DAY_END = 22 * 60 + 30;
const up5 = (n) => Math.ceil(n / 5) * 5;
// Când e deschis de obicei fiecare tip de loc (minute de la miezul nopții)
const OPEN = { coffee: [480, 1170], sweet: [540, 1260], shop: [600, 1230], art: [570, 1200], food: [720, 1380], fun: [600, 1320], none: [540, 1320] };
// Ultima oprire a zilei (zborul de luni): după ea nu se mai pune nimic
const endSlot = (slots) => slots.find((x) => x.loc.endsDay);
const dayEndOf = (slots) => { const e = endSlot(slots); return e ? e.start : DAY_END; };
function fitInto(slots, loc, day, stay = stayOf(loc)) {
  const p = coordsOf(loc); let best = null; const [open, close] = OPEN[catKey(enriched(loc).cat)] || OPEN.none;
  for (let i = 0; i <= slots.length; i++) {
    const prev = slots[i - 1], next = slots[i]; if (prev?.loc.endsDay) break;
    const tIn = prev ? (legOf(prev.loc, loc, day)?.min ?? 0) : 0, tOut = next ? (legOf(loc, next.loc, day)?.min ?? 0) : 0;
    const start = up5(Math.max(open, prev ? prev.end + tIn : Math.max(DAY_START, next ? next.start - tOut - stay : DAY_START)));
    const limit = Math.min(close, next ? next.start - tOut : DAY_END);
    if (start + stay > limit) continue;
    const direct = prev && next ? (legOf(prev.loc, next.loc, day)?.min ?? 0) : 0;
    const detour = tIn + tOut - direct; if (p && detour > 40) continue; // prea departe de opririle vecine
    const cost = p ? detour : slots.length - i;
    if (!best || cost < best.cost) best = { cost, start };
  }
  if (best) return { loc, start: best.start, end: best.start + stay, auto: true };
  // Nu încape nicăieri: îl punem după oprirea cea mai apropiată și semnalăm suprapunerea
  let near = slots.filter((x) => !x.loc.endsDay).pop();
  if (p) { let bd = Infinity; for (const s of slots) { if (s.loc.endsDay) continue; const q = coordsOf(s.loc); if (!q) continue; const dd = distanceM(p, q); if (dd < bd) { bd = dd; near = s; } } }
  const start = up5(near ? near.end + (legOf(near.loc, loc, day)?.min ?? 0) : DAY_START);
  return { loc, start, end: start + stay, auto: true, noFit: true };
}
function planDay(day, excludeId = null) {
  const all = dayItems(day).filter((l) => l.id !== excludeId); const slots = [], flex = [];
  for (const loc of all) { const r = parseRange(loc.time); if (r) slots.push({ loc, start: r.from, end: r.to, auto: false }); else flex.push(loc); }
  slots.sort((a, b) => a.start - b.start);
  for (const loc of flex) { slots.push(fitInto(slots, loc, day)); slots.sort((a, b) => a.start - b.start); }
  const issues = []; let travel = 0, walkM = 0, walkT = 0, other = 0;
  for (let i = 1; i < slots.length; i++) {
    const a = slots[i - 1], b = slots[i], g = legOf(a.loc, b.loc, day), t = g ? g.min : 0; b.travel = t; b.leg = g; travel += t;
    if (g) { if (g.mode === 'walking') { walkM += g.d * 1.3; walkT += g.min; } else other += g.min; }
    if (b.start < a.end - 5) issues.push({ type: 'overlap', a, b, over: a.end - b.start });
    else if (a.end + t > b.start + 5) issues.push({ type: 'tight', a, b, late: a.end + t - b.start, travel: t });
  }
  for (const sl of slots) if (enriched(sl.loc).closed?.includes(day)) issues.push({ type: 'closed', a: sl, b: sl });
  const first = slots.length ? slots[0].start : null, last = slots.length ? Math.max(...slots.map((x) => x.end)) : null;
  const busy = slots.reduce((sum, x) => sum + (x.end - x.start), 0) + travel; const free = first != null ? last - first - busy : 0;
  const level = !slots.length ? 'none' : issues.some((i) => i.type !== 'tight' || i.late > 10) ? 'red' : issues.length || free < 30 ? 'amber' : 'green';
  return { slots, issues, level, free, walkM, walkT, other, first, last, end: dayEndOf(slots) };
}
const LOAD = { green: ['Zi lejeră', 'var(--green)'], amber: ['Zi plină', '#F29900'], red: ['Prea plină', 'var(--red)'], none: ['Liberă', 'var(--text-3)'] };
function daySummary(day) { const p = planDay(day); return { n: p.slots.length, walkM: p.walkM, walkT: p.walkT, other: p.other, from: p.first, to: p.last, plan: p }; }

// ---------- Plan ----------
function renderDates() {
  const el = $('#dates'); const today = todayKey();
  if (el) el.innerHTML = DAYS.map((d) => { const pl = planDay(d), lv = pl.level; return `<button data-action="day" data-day="${d}" class="date press ${d === state.day ? 'on' : ''} ${d === today ? 'today' : ''}" role="tab" aria-selected="${d === state.day}" aria-label="${DAY_LABEL[d]}, ${pl.slots.length} opriri, ${LOAD[lv][0]}"><div class="dn">${DAY_SHORT[d][0]}</div><div class="dd">${DAY_SHORT[d][1]}</div><div class="lights lv-${lv}" title="${LOAD[lv][0]}"><i></i><i></i><i></i></div><div class="dm">${pl.slots.length} opriri</div></button>`; }).join('');
  const md = $('#mapDays'); if (md) md.innerHTML = DAYS.map((d) => `<button data-action="day" data-day="${d}" class="chip press ${d === state.day ? 'on' : ''}" style="box-shadow: var(--shadow-1); border-color: transparent">${d === state.day ? icon('check', 'i-18') : ''}${DAY_SHORT[d][0]} ${DAY_SHORT[d][1]}</button>`).join('');
}
function renderSummary() {
  const s = daySummary(state.day), el = $('#daySummary'); if (!el) return; const lv = s.plan.level, iss = s.plan.issues;
  el.innerHTML = `<div class="summary">
    <div><div class="v tabular">${s.n} <span class="lvl" style="--lv: ${LOAD[lv][1]}"></span></div><div class="k">${LOAD[lv][0]}</div></div>
    <div><div class="v tabular">${s.walkT ? fmtMin(s.walkT) : '—'}</div><div class="k">pe jos${s.walkM ? ' · ' + fmtDist(s.walkM) : ''}</div></div>
    <div><div class="v tabular">${s.from != null ? hhmm(s.from) : '—'}${s.to ? '–' + hhmm(s.to) : ''}</div><div class="k">${s.other ? `+${fmtMin(s.other)} ${s.plan.slots.some((x) => x.leg?.icon === 'train') ? 'tren' : 'metrou'}` : 'interval'}</div></div>
  </div>
  ${iss.length ? `<button data-action="goto-warn" class="watch-banner press mt-3">${icon('warning', 'i-20 ms-fill')}<span class="flex-1 text-left">${iss.length === 1 ? 'Un loc nu merge cum e acum' : `${iss.length} locuri nu merg cum e acum`}: alegeți ce faceți</span>${icon('chevron_right', 'i-20')}</button>` : ''}
  <button data-action="day-route" class="route-cta press mt-3"><span class="gm">${icon('gmaps', 'i-22')}</span><span class="flex-1 text-left"><b>Traseul zilei în Google Maps</b><span class="block">${s.n} opriri${s.walkT ? ` · ${fmtMin(s.walkT)} pe jos` : ''}</span></span>${icon('chevron_right', 'i-22')}</button>`;
}
function renderFilters() {
  const el = $('#filters'); if (!el) return; const present = new Set(dayItems(state.day, true).map((l) => catKey(enriched(l).cat)));
  const opts = [['all', 'Toate', null], ...CAT_KEYS.filter((k) => present.has(k)).map((k) => [k, CAT[k].label, CAT[k].icon])];
  el.innerHTML = opts.map(([k, label, ic]) => `<button data-action="filter" data-cat="${k}" class="chip press ${state.filter === k ? 'on' : ''}">${state.filter === k && k !== 'all' ? icon('check', 'i-18') : ic ? icon(ic, 'i-18') : ''}${label}</button>`).join('');
}
function whoHTML(locId) { const w = whoHas(locId); return w.length ? `<span class="who" title="Pe bucketlist: ${w.map((p) => PEOPLE_META[p].name).join(', ')}">${w.map((p) => `<i class="p-${p}">${PEOPLE_META[p].name[0]}</i>`).join('')}</span>` : ''; }
function stopHTML(loc, slot = null) {
  const visited = !!state.shared.visited[loc.id], skipped = !!state.shared.skipped[loc.id], now = isNow(loc), e = enriched(loc), ck = catKey(e.cat), c = cat(e.cat);
  const r = slot ? { from: slot.start, to: slot.end } : parseRange(loc.time); const p = coordsOf(loc), dist = state.pos && p ? distanceM(state.pos, p) : null;
  const pills = [`<span class="pill ink">${esc(loc.catLabel || c.label)}</span>`, now ? '<span class="pill blue">ACUM</span>' : '', e.free ? '<span class="pill green">Gratis</span>' : '', loc.verify ? '<span class="pill amber">verifică orele</span>' : '', slot?.auto ? '<span class="pill ink">oră propusă</span>' : ''].filter(Boolean).join('');
  const overlay = `<span class="corner">${icon(e.icon || c.icon, 'i-18')}</span><div class="ph-tl">${pills}</div>${whoHas(loc.id).length ? `<div class="ph-bl">${whoHTML(loc.id)}</div>` : ''}`;
  const meta = [e.rating ? `<span><span class="star">★</span> ${Number(e.rating).toFixed(1).replace('.', ',')}${e.ratingCount ? ` <span class="t-3">(${fmtCount(e.ratingCount)})</span>` : ''}</span>` : '', e.price && !e.free ? `<span class="dotsep">${esc(e.price.split('·')[0].split('(')[0].trim())}</span>` : '', slot ? `<span class="dotsep">${fmtMin(slot.end - slot.start)} acolo</span>` : '', dist != null ? `<span class="dotsep t-blue">${fmtDist(dist)} de tine</span>` : '', e.variants?.length ? `<span class="dotsep">${e.variants.length} locații</span>` : '', loc.isCustom ? `<span class="dotsep">de ${esc(loc.addedBy || 'noi')}</span>` : ''].filter(Boolean).join('');
  return `<li class="stop reveal k-${ck} ${visited ? 'done' : ''} ${skipped ? 'skipped' : ''}" id="loc-${esc(loc.id)}">
    <div class="tm">${r ? `${slot?.auto ? '~' : ''}${hhmm(r.from)}<span class="end">${hhmm(r.to)}</span>` : ''}</div>
    <div class="rail"><button class="dot ${visited ? 'done' : skipped ? 'skip' : now ? 'now' : ''}" data-action="toggle-visited" data-id="${esc(loc.id)}" aria-label="${visited ? 'Anulează: am fost' : 'Bifează: am fost'} la ${esc(loc.title)}"></button></div>
    <div class="body">
      <div class="pwrap">
        <button class="stop-card" data-action="open-detail" data-id="${esc(loc.id)}">${photoHTML(e, { overlay })}</button>
        <a href="${esc(mapsNav(loc))}" target="_blank" rel="noopener" class="ph-fab icon-btn solid press" aria-label="Navighează spre ${esc(loc.title)} cu Google Maps">${icon('gmaps', 'i-22')}</a>
      </div>
      <button class="stop-info" data-action="open-detail" data-id="${esc(loc.id)}">
        <div class="stop-title">${esc(loc.title)}</div>
        <div class="stop-sub">${esc(loc.short || cat(e.cat).label)}</div>
        ${meta ? `<div class="stop-meta">${meta}</div>` : ''}
      </button>
      ${skipped ? `<button data-action="toggle-skip" data-id="${esc(loc.id)}" class="btn btn-sm btn-outline press mt-2">${icon('undo', 'i-18')} Pune înapoi în program</button>` : ''}
    </div>
  </li>`;
}
function legHTML(a, b, day) {
  const g = legOf(a, b, day); if (!g) return '';
  return `<li class="leg"><div class="tm"></div><div class="rail"><span class="walker">${icon(g.icon, 'i-18')}</span></div><div class="body"><span><b style="color: var(--text); font-weight: 500">${fmtMin(g.min)}</b> ${g.label} · ${fmtDist(g.d * (g.mode === 'walking' ? 1.3 : 1))}</span><a href="${esc(mapsLeg(a, b, g.mode))}" target="_blank" rel="noopener">Traseu</a></div></li>`;
}
function shortName(l) { const t = shortTitle(l.title); return esc(t.length > 20 ? t.split(' ').slice(0, 2).join(' ') : t); }
function warnHTML(is) {
  const A = is.a.loc, B = is.b.loc;
  if (is.type === 'closed') { const e = enriched(B); return `<li class="warn" data-warn><div class="tm"></div><div class="rail"><span class="warn-ic">${icon('warning', 'i-18 ms-fill')}</span></div><div class="body"><div class="watch">
    <div class="font-medium">${shortName(B)} e închis în ziua asta</div><div class="t-2 mt-1">${e.hours ? `Program: ${esc(e.hours)}. ` : ''}Mutați-l într-o zi în care e deschis sau săriți peste.</div>
    <div class="flex flex-wrap gap-2 mt-3">${B.fixed ? '' : `<button data-action="schedule" data-id="${esc(B.id)}" class="btn btn-sm btn-tonal press">${icon('edit_calendar', 'i-18')} Mută în altă zi</button><button data-action="choose" data-skip="${esc(B.id)}" class="btn btn-sm btn-outline press">Sari peste</button>`}</div></div></div></li>`; }
  const title = is.type === 'overlap' ? 'Nu încap amândouă' : `Timp strâns: ~${is.late} min întârziere`;
  const text = is.type === 'overlap'
    ? `<b>${shortName(A)}</b> ține până la ${hhmm(is.a.end)}, iar <b>${shortName(B)}</b> ar începe la ${hhmm(is.b.start)}. Alegeți unde mergeți sau mutați-l mai târziu.`
    : `De la <b>${shortName(A)}</b> la <b>${shortName(B)}</b> sunt ${fmtMin(is.travel)} de drum, dar între ele rămân doar ${fmtMin(Math.max(0, is.b.start - is.a.end))}.`;
  const shiftTo = up5(is.a.end + (is.b.travel || 0)), dur = is.b.end - is.b.start, end = planDay(B.day).end;
  return `<li class="warn" data-warn><div class="tm"></div><div class="rail"><span class="warn-ic">${icon('warning', 'i-18 ms-fill')}</span></div><div class="body"><div class="watch">
    <div class="font-medium">${title}</div><div class="t-2 mt-1">${text}</div>
    <div class="flex flex-wrap gap-2 mt-3">
      ${!B.fixed ? `<button data-action="choose" data-skip="${esc(B.id)}" class="btn btn-sm btn-tonal press">Mergem la ${shortName(A)}</button>` : ''}
      ${!A.fixed ? `<button data-action="choose" data-skip="${esc(A.id)}" class="btn btn-sm btn-tonal press">Mergem la ${shortName(B)}</button>` : ''}
      ${!B.fixed && shiftTo + dur <= end ? `<button data-action="shift" data-id="${esc(B.id)}" data-time="${hhmm(shiftTo)} – ${hhmm(shiftTo + dur)}" class="btn btn-sm btn-outline press">${icon('schedule', 'i-18')} ${shortName(B)} la ${hhmm(shiftTo)}</button>` : ''}
    </div></div></div></li>`;
}
function timelineHTML(list) {
  if (state.filter !== 'all') return `<ol class="tl">${list.map((l) => stopHTML(l)).join('')}</ol>`;
  const plan = planDay(state.day); const skippedList = list.filter((l) => state.shared.skipped[l.id]);
  const entries = [...plan.slots.map((sl) => ({ t: sl.start, sl })), ...skippedList.map((l) => ({ t: startMin(l), l }))].sort((a, b) => a.t - b.t);
  let html = '', prev = null;
  for (const en of entries) {
    if (en.l) { html += stopHTML(en.l); continue; }
    const sl = en.sl; if (prev) html += legHTML(prev.loc, sl.loc, state.day);
    for (const is of plan.issues.filter((x) => x.b === sl)) html += warnHTML(is);
    html += stopHTML(sl.loc, sl); prev = sl;
  }
  return `<ol class="tl">${html}</ol>`;
}
function oppsHTML(day) {
  const opps = DAY_OPPS[day] || []; if (!opps.length) return '';
  const KIND = { gratis: ['green', 'Gratis'], inclus: ['blue', 'Inclus'], tip: ['amber', 'De neratat'] };
  return `<div class="sec"><div class="sec-h"><h2 class="ttl-2">Gratis și de neratat</h2><span class="cap">${opps.length}</span></div><div class="card list">${opps.map((o) => { const k = KIND[o.kind] || KIND.tip; return `
    <button class="li press" ${o.locId ? `data-action="open-detail" data-id="${esc(o.locId)}"` : `data-action="open-link" data-href="${esc(o.link)}"`}>
      <div class="min-w-0 flex-1"><div class="flex items-center gap-2 mb-1"><span class="pill ${k[0]}">${k[1]}</span><span class="cap truncate">${esc(o.when)}</span></div><div class="font-medium">${esc(o.title)}</div>${o.price ? `<div class="cap mt-0.5">${esc(o.price)}</div>` : ''}</div>
      ${icon('chevron_right', 't-3 i-20')}
    </button>`; }).join('')}</div></div>`;
}
function renderDay() {
  const c = $('#itinerary'); if (!c) return;
  $('#planHeadline').textContent = DAY_LONG[state.day]; $('#planSub').textContent = DAY_SUB[state.day]; $('#planEyebrow').textContent = countdownText() + (todayKey() === state.day ? ' · azi' : '');
  renderDates(); renderSummary(); renderFilters();
  const list = dayItems(state.day, true).filter((l) => state.filter === 'all' || catKey(enriched(l).cat) === state.filter);
  $('#dayTip').innerHTML = DAY_TIPS[state.day] && state.filter === 'all' ? `<div class="card-flat p-3 mt-4 flex gap-3">${icon('lightbulb', 'i-20', 'color: var(--amber)')}<span class="t-2">${esc(DAY_TIPS[state.day])}</span></div>` : '';
  c.innerHTML = list.length ? timelineHTML(list) : `<div class="card-flat p-6 text-center t-2">Nimic pentru filtrul ales.<br><button data-action="open-add" class="btn btn-text press mt-2">Adaugă un loc</button></div>`;
  $('#opps').innerHTML = state.filter === 'all' ? oppsHTML(state.day) : '';
  renderPool(); renderZones(); observeReveal();
}
function renderPool() {
  const el = $('#pool'); if (!el) return; const pool = allLocs().filter((l) => isPool(l)); if (!pool.length) { el.innerHTML = ''; return; }
  const sug = (l) => { const e = enriched(l); return suggestFor(coordsOf(l), l.id, e.cat, e.closed || []); };
  el.innerHTML = `<div class="sec"><div class="sec-h"><h2 class="ttl-2">Locuri dorite</h2><span class="cap">încă fără zi</span></div><div class="card list">${pool.map((l) => { const s = sug(l); return `<div class="li" id="loc-${esc(l.id)}"><button data-action="open-detail" data-id="${esc(l.id)}" class="flex items-center gap-3 flex-1 min-w-0 text-left">${thumbHTML(l, 48)}<div class="min-w-0"><div class="font-medium truncate">${esc(l.title)} ${whoHTML(l.id)}</div><div class="cap truncate">${l.poolNote ? esc(l.poolNote) : s.day !== 'pool' ? `Potrivit ${DAY_LABEL[s.day]}, lângă ${esc(shortTitle(s.afterTitle))}` : esc(cat(l.cat).label)}</div></div></button><button data-action="schedule" data-id="${esc(l.id)}" class="btn btn-sm btn-tonal press">${s.day !== 'pool' ? DAY_SHORT[s.day][0] + ' ' + DAY_SHORT[s.day][1] : 'Pune în zi'}</button></div>`; }).join('')}</div></div>`;
}
function renderZones() {
  const z = $('#zones'); if (!z) return;
  const alts = (DAY_ZONES[state.day] || []).flatMap((key) => ALTERNATIVES.map((a, i) => ({ a, i })).filter(({ a }) => a.zone === key));
  if (!alts.length) { z.innerHTML = ''; return; }
  z.innerHTML = `<div class="sec"><div class="sec-h"><h2 class="ttl-2">Prin zonă, dacă mai aveți timp</h2></div><div class="hscroll">${alts.map(({ a, i }) => { const loc = altAsLoc(i); const d = state.pos && typeof a.lat === 'number' ? distanceM(state.pos, a) : null; return `<button class="rec press" data-action="open-detail" data-id="alt-${i}">${photoHTML(loc, { overlay: `<div class="ph-tl">${a.free ? '<span class="pill green">Gratis</span>' : ''}${d != null ? `<span class="pill ink">${fmtDist(d)}</span>` : ''}</div>` })}<div class="ttl-3 truncate mt-2">${esc(a.title)}</div><div class="cap truncate">${esc(ZONES[a.zone]?.label || '')}</div></button>`; }).join('')}</div></div>`;
}
function nextStopHTML() {
  const stops = dayItems(state.day).filter((l) => !state.shared.visited[l.id]); if (!stops.length) return '';
  const nowMin = new Date().getHours() * 60 + new Date().getMinutes();
  const next = stops.find(isNow) || (todayKey() === state.day ? stops.find((l) => startMin(l) >= nowMin - 15) : null) || stops[0];
  const p = coordsOf(next), d = state.pos && p ? distanceM(state.pos, p) : null;
  const label = isNow(next) ? 'Acum' : todayKey() === state.day ? 'Următorul' : 'Începe cu';
  return `<div class="card flex items-center gap-3 p-3 press" data-action="open-detail" data-id="${esc(next.id)}" role="button">
    ${thumbHTML(next, 56)}
    <div class="min-w-0 flex-1"><div class="cap truncate">${label} · ${esc(next.time || '')}</div><div class="ttl-3 truncate">${esc(next.title)}</div><div class="cap truncate">${d != null ? `${fmtDist(d)} · ${fmtMin(walkMin(d))} pe jos` : esc((next.address || '').split(',')[0])}</div></div>
    <a href="${esc(mapsNav(next))}" target="_blank" rel="noopener" class="icon-btn press" style="width: 44px; height: 44px; background: var(--blue); color: var(--on-blue)" aria-label="Traseu spre ${esc(next.title)} în Google Maps" onclick="event.stopPropagation()">${icon('directions', 'i-22')}</a>
  </div>`;
}
function renderNextStop() { const h = nextStopHTML(); const a = $('#nextStop'); if (a) a.innerHTML = h; const b = $('#nextStopExplore'); if (b) b.innerHTML = h; }

// ---------- Traseul zilei: pe bucăți, ca să meargă în Google Maps pe orice telefon ----------
// Google Maps acceptă cel mult 3 opriri intermediare când linkul se deschide din browserul telefonului
// și nu acceptă opriri intermediare la „transport public”. Rupem ziua la drumurile lungi și la 5 opriri.
function routeParts(day) {
  const stops = planDay(day).slots.map((x) => x.loc).filter((l) => !state.shared.visited[l.id]); const parts = []; if (stops.length < 2) return { stops, parts };
  const mode = day === 'thu' ? 'driving' : 'walking';
  let cur = [stops[0]];
  for (let i = 1; i < stops.length; i++) {
    const g = legOf(stops[i - 1], stops[i], day);
    if (g && g.mode === 'transit') { if (cur.length > 1) parts.push(cur); parts.push({ transit: true, from: stops[i - 1], to: stops[i], g }); cur = [stops[i]]; }
    else if (cur.length === 5) { parts.push(cur); cur = [stops[i - 1], stops[i]]; }
    else cur.push(stops[i]);
  }
  if (cur.length > 1) parts.push(cur);
  let n = 0;
  return { stops, parts: parts.map((p) => (p.transit ? p : { n: ++n, list: p, mode, url: `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(destOf(p[0]))}&destination=${encodeURIComponent(destOf(p[p.length - 1]))}${p.length > 2 ? `&waypoints=${encodeURIComponent(p.slice(1, -1).map(destOf).join('|'))}` : ''}&travelmode=${mode}` })) };
}
function routeSheetHTML() {
  const { stops, parts } = routeParts(state.day);
  if (stops.length < 2) return `${sheetHead(DAY_LABEL[state.day], 'Traseul zilei')}<p class="t-2 pb-4">${stops.length ? 'A rămas o singură oprire.' : 'Nu mai e nimic de vizitat în ziua asta.'}</p>${stops[0] ? `<a href="${esc(mapsNav(stops[0]))}" target="_blank" rel="noopener" class="btn btn-primary btn-lg w-full mb-3">${icon('gmaps', 'i-20')} Navighează la ${esc(shortTitle(stops[0].title))}</a>` : ''}`;
  const first = stops[0], fp = coordsOf(first);
  return `${sheetHead(DAY_LABEL[state.day], 'Traseul zilei în Google Maps')}
    <p class="t-2 pb-3">Google Maps primește puține opriri într-un link, așa că ziua e împărțită în bucăți. Deschideți-le pe rând.</p>
    ${state.pos && fp ? `<a href="${esc(mapsNav(first))}" target="_blank" rel="noopener" class="card li press mb-3">${icon('my_location', '', 'color: var(--blue)')}<div class="flex-1 min-w-0"><div class="font-medium">De unde sunteți până la prima oprire</div><div class="cap truncate">${esc(first.title)} · ${fmtDist(distanceM(state.pos, fp))}</div></div>${icon('gmaps', 'i-22')}</a>` : ''}
    <div class="card list">${parts.map((pt) => pt.transit
      ? `<a href="${esc(mapsLeg(pt.from, pt.to, 'transit'))}" target="_blank" rel="noopener" class="li press">${icon('subway', '', 'color: var(--amber)')}<div class="flex-1 min-w-0"><div class="font-medium">Metrou sau taxi · ~${fmtMin(pt.g.min)}</div><div class="cap truncate">${esc(shortTitle(pt.from.title))} → ${esc(shortTitle(pt.to.title))}</div></div>${icon('gmaps', 'i-22')}</a>`
      : `<a href="${esc(pt.url)}" target="_blank" rel="noopener" class="li press"><span class="cat-ic c-art" style="width: 32px; height: 32px; font-weight: 500">${pt.n}</span><div class="flex-1 min-w-0"><div class="font-medium">${pt.mode === 'driving' ? 'Cu mașina' : 'Pe jos'} · ${pt.list.length} opriri</div><div class="cap">${pt.list.map((l) => esc(shortTitle(l.title))).join(' → ')}</div></div>${icon('gmaps', 'i-22')}</a>`).join('')}</div>
    <p class="cap mt-3 pb-3">În Google Maps apăsați „Start”. Opririle bifate cu „Am fost” ies din traseu.</p>`;
}
function dayRoute() { openSheet(routeSheetHTML()); }

// ---------- Detaliu loc ----------
function detailHTML(raw) {
  const loc = enriched(raw), c = cat(loc.cat), id = loc.id;
  const visited = !!state.shared.visited[id], skipped = !!state.shared.skipped[id];
  const p = coordsOf(loc), d = state.pos && p ? distanceM(state.pos, p) : null;
  const own = state.photos[id], st = own ? null : stockOf(loc);
  const credit = own ? `<span class="pill ink">${icon('photo_camera', 'i-16')} ${esc(own.by || 'noi')}</span>` : st ? `<a href="${esc(st.page)}" target="_blank" rel="noopener" class="pill ink">${icon('image', 'i-16')} ${esc(st.credit)}</a>` : '';
  const hero = `<div class="relative" style="margin: 0 -16px">${photoHTML(loc, { cls: 'hero-photo', eager: true, overlay: `<div class="ph-bl">${credit}</div>` })}<div class="handle absolute" style="top: 2px; left: 50%; margin-left: -16px; background: rgba(255,255,255,.85)"></div><button data-action="close-modal" class="icon-btn solid press absolute" style="top: 12px; right: 12px" aria-label="Închide">${icon('close')}</button></div>`;
  const metaLine = [loc.rating ? `<span><b style="font-weight: 500; color: var(--text)">${Number(loc.rating).toFixed(1).replace('.', ',')}</b> <span class="star">${'★'.repeat(Math.round(loc.rating))}</span>${loc.ratingCount ? ` (${fmtCount(loc.ratingCount)})` : ''}</span>` : '', `<span>${esc(loc.catLabel || c.label)}</span>`, loc.price && !loc.free ? `<span>${esc(loc.price.split('·')[0].split('(')[0].trim())}</span>` : '', loc.free ? '<span class="t-green">Gratis</span>' : ''].filter(Boolean).join('<span class="t-3">·</span>');
  const when = isPool(loc) ? 'Loc dorit, încă fără zi' : loc.isAlt ? 'Recomandare, nu e în program' : `${DAY_LABEL[loc.day]}${loc.time ? ' · ' + loc.time : ''}`;
  const actions = loc.isAlt
    ? `<button data-action="add-alt" data-index="${loc.altIndex}" class="act primary press">${icon('add', 'i-20')} Pune în program</button><a href="${esc(mapsNav(loc))}" target="_blank" rel="noopener" class="act press">${icon('directions', 'i-20')} Traseu</a>`
    : `<a href="${esc(mapsNav(loc))}" target="_blank" rel="noopener" class="act primary press">${icon('directions', 'i-20')} Traseu</a>
       <button data-action="toggle-visited" data-id="${esc(id)}" class="act press ${visited ? 'on' : ''}">${icon(visited ? 'check_circle' : 'check', 'i-20')} ${visited ? 'Am fost' : 'Am fost aici'}</button>
       ${loc.isCustom ? `<button data-action="schedule" data-id="${esc(id)}" class="act press">${icon('edit_calendar', 'i-20')} ${isPool(loc) ? 'Pune în zi' : 'Mută'}</button><button data-action="edit-loc" data-id="${esc(id)}" class="act press">${icon('edit', 'i-20')} Editează</button>` : loc.fixed ? '' : `${isPool(loc) || id.startsWith('alt-') ? '' : `<button data-action="toggle-skip" data-id="${esc(id)}" class="act press">${icon(skipped ? 'undo' : 'skip_next', 'i-20')} ${skipped ? 'Pune înapoi' : 'Sari peste'}</button>`}${id.startsWith('alt-') ? '' : `<button data-action="schedule" data-id="${esc(id)}" class="act press">${icon('edit_calendar', 'i-20')} ${isPool(loc) ? 'Pune în zi' : 'Mută'}</button>`}`}
       <button data-action="add-photo" data-id="${esc(id)}" class="act press">${icon('add_a_photo', 'i-20')} Poză</button>
       <button data-action="pin-here" data-id="${esc(id)}" class="act press" ${state.pos ? '' : 'disabled style="opacity:.4"'}>${icon('push_pin', 'i-20')} Fixează aici</button>`;
  const row = (ic, body, href, trail = '') => href ? `<a href="${esc(href)}" target="_blank" rel="noopener" class="li press">${icon(ic, '', 'color: var(--text-2)')}<div class="flex-1 min-w-0">${body}</div>${trail || icon('chevron_right', 't-3 i-20')}</a>` : `<div class="li">${icon(ic, '', 'color: var(--text-2)')}<div class="flex-1 min-w-0">${body}</div></div>`;
  const info = [loc.hours ? row('schedule', esc(loc.hours)) : '', loc.price ? row('euro', esc(loc.price)) : '', loc.budget ? row('payments', `${esc(loc.budget)}<div class="cap">buget estimat pentru trei</div>`) : '', loc.address ? row('location_on', `${esc(loc.address)}${p && !p.exact ? '<div class="cap">poziție aproximativă · „Fixează aici” o corectează</div>' : ''}`, mapsSearch(placeQuery(loc)), icon('gmaps', 'i-20')) : '', loc.link ? row('link', `<span class="t-blue">Deschide ${esc(SOURCE[loc.source] || 'linkul')}</span>`, loc.link, icon('open_in_new', 't-3 i-20')) : ''].filter(Boolean).join('');
  const sec = (title, body) => `<div class="hair pt-5 mt-5"><h3 class="ttl-3 mb-3">${title}</h3>${body}</div>`;
  const variants = loc.variants?.length ? sec(`${loc.variants.length} locații`, `<div class="card list">${loc.variants.map((v) => { const vd = state.pos && typeof v.lat === 'number' ? distanceM(state.pos, v) : null; return `<a href="${esc(mapsNav({ placeQuery: v.placeQuery, title: v.title, lat: v.lat, lng: v.lng, approx: true }))}" target="_blank" rel="noopener" class="li press"><div class="flex-1 min-w-0"><div class="font-medium">${esc(v.title)}</div><div class="cap">${esc(v.address)}${vd != null ? ` · ${fmtDist(vd)}` : ''}</div><div class="cap">${esc(v.hours || '')}${v.note ? ' · ' + esc(v.note) : ''}</div></div>${icon('gmaps', 'i-22')}</a>`; }).join('')}</div>`) : '';
  const persons = sec('Pe bucketlist-ul lui', `<div class="flex flex-wrap gap-2">${PERSONS.map((pp) => { const on = !!bucketEntryFor(pp, id); return `<button data-action="bucket-toggle" data-person="${pp}" data-id="${esc(id)}" class="ptoggle press ${on ? 'on' : ''}" aria-pressed="${on}"><span class="avatar p-${pp}">${PEOPLE_META[pp].name[0]}</span>${PEOPLE_META[pp].name}${on ? icon('check', 'i-18') : ''}</button>`; }).join('')}</div>`);
  const review = loc.review ? sec('Un review', `<p class="t-2" style="font-size: 15px; line-height: 22px">„${esc(loc.review)}”</p>`) : '';
  const popular = loc.popular?.length ? sec('Cel mai popular', `<ul class="space-y-2">${loc.popular.map((x) => `<li class="flex gap-3">${icon('thumb_up', 'i-18', 'color: var(--blue); margin-top: 1px')}<span>${esc(x)}</span></li>`).join('')}</ul>`) : '';
  const tips = loc.tips?.length ? sec('Sfaturi', `<ul class="space-y-2">${loc.tips.map((x) => `<li class="flex gap-3">${icon('lightbulb', 'i-18', 'color: var(--amber); margin-top: 1px')}<span>${esc(x)}</span></li>`).join('')}</ul>`) : '';
  const links = sec('Mai mult', `<div class="card list">${row('photo_library', '<div class="font-medium">Poze, meniu și recenzii</div><div class="cap">în Google Maps</div>', mapsSearch(placeQuery(loc)), icon('gmaps', 'i-20'))}${loc.site ? row('language', `<div class="font-medium">Site oficial</div><div class="cap truncate">${esc(loc.site.replace(/^https?:\/\/(www\.)?/, '').split('/')[0])}</div>`, loc.site) : ''}${loc.menu ? row('menu_book', `<div class="font-medium">${/ticket|entrad|bilet|dates/i.test(loc.menu) ? 'Bilete și program' : 'Meniul oficial'}</div>`, loc.menu) : ''}</div>${loc.isCustom ? `<button data-action="delete-loc" data-id="${esc(id)}" class="btn btn-text btn-danger press mt-3">${icon('delete', 'i-20')} Șterge locul</button>` : ''}`);
  return `${hero}
    <div class="pt-4"><h2 class="ttl-1">${esc(loc.title)}</h2>${loc.short ? `<div class="t-2 mt-0.5">${esc(loc.short)}</div>` : ''}
      <div class="flex items-center gap-1.5 flex-wrap t-2 mt-2">${metaLine}</div>
      <div class="t-2 mt-1 flex items-center gap-1.5 flex-wrap">${icon('event', 'i-18')} ${esc(when)}${d != null ? ` <span class="t-3">·</span> <span class="t-blue">${fmtDist(d)}, ${fmtMin(walkMin(d))} pe jos</span>` : ''}</div>
    </div>
    <div class="actions mt-4">${actions}</div>
    ${loc.desc || loc.note ? `<p class="mt-5" style="font-size: 15px; line-height: 23px">${esc(loc.desc || loc.note)}</p>` : ''}
    ${info ? `<div class="card list mt-5">${info}</div>` : ''}
    ${variants}${loc.isAlt ? '' : persons}${review}${popular}${tips}${links}<div style="height:16px"></div>`;
}
function openDetail(id) { const loc = findLoc(id); if (!loc) return; state.detailId = id; $('#detailBody').innerHTML = detailHTML(loc); $('#detailSheet').classList.remove('hidden'); $('#detailBody').scrollTop = 0; }
function refreshDetail() { if (state.detailId && !$('#detailSheet').classList.contains('hidden')) { const loc = findLoc(state.detailId); if (loc) { const st = $('#detailBody').scrollTop; $('#detailBody').innerHTML = detailHTML(loc); $('#detailBody').scrollTop = st; } else closeModals(); } }

// ---------- Poze proprii ----------
function compressImage(file, max = 1100, q = 0.74) {
  return new Promise((resolve, reject) => {
    const img = new Image(), url = URL.createObjectURL(file);
    img.onload = () => { const s = Math.min(1, max / Math.max(img.width, img.height)); const cv = document.createElement('canvas'); cv.width = Math.round(img.width * s); cv.height = Math.round(img.height * s); cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height); URL.revokeObjectURL(url); let qq = q, data = cv.toDataURL('image/jpeg', q); while (data.length > 900000 && qq > 0.4) { qq -= 0.1; data = cv.toDataURL('image/jpeg', qq); } resolve(data); };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Nu am putut citi imaginea.')); }; img.src = url;
  });
}
function photoSheetHTML(id) {
  const loc = findLoc(id), cur = state.photos[id];
  return `${sheetHead(esc(loc?.title || ''), 'Poza locului')}
    <div class="card list">
      <button data-action="photo-file" data-id="${esc(id)}" class="li press">${icon('add_a_photo', '', 'color: var(--blue)')}<div class="flex-1 text-left"><div class="font-medium">Din telefon</div><div class="cap">Cameră sau galerie; se vede la toți</div></div>${icon('chevron_right', 't-3 i-20')}</button>
      <form class="li" style="flex-direction: column; align-items: stretch; gap: 10px" data-action="photo-url" data-id="${esc(id)}">
        <div class="flex items-center gap-4">${icon('link', '', 'color: var(--blue)')}<div class="flex-1"><div class="font-medium">Link de pe net</div><div class="cap">Apasă lung pe o poză (Instagram, site, Google) → „Copiază adresa imaginii”</div></div></div>
        <div class="flex gap-2"><input type="url" id="photoUrl" inputmode="url" placeholder="https://…" value="${esc(cur?.url || '')}" class="input flex-1 min-w-0" aria-label="Link poză"><button type="submit" class="btn btn-tonal press">Salvează</button></div>
      </form>
    </div>
    ${cur ? `<button data-action="photo-remove" data-id="${esc(id)}" class="btn btn-text btn-danger press mt-3">${icon('delete', 'i-20')} Scoate poza noastră</button>` : ''}<div style="height:12px"></div>`;
}
function openPhotoSheet(id) { openSheet(photoSheetHTML(id)); }
async function savePhotoDoc(id, doc) { state.photos[id] = doc; if (fb && state.online && !String(id).startsWith('local-')) { const { db, fs } = fb; await fs.setDoc(fs.doc(db, 'trips', TRIP_ID, 'photos', id), { ...doc, at: fs.serverTimestamp() }); } else lsSet(LS.photos, state.photos); }
async function savePhotoUrl(id, url, quiet = false) {
  url = (url || '').trim(); if (!/^https:\/\/\S+$/i.test(url) || url.length > 600) return toast('Linkul trebuie să înceapă cu https://', 'link');
  await savePhotoDoc(id, { url, by: me(), at: new Date().toISOString() });
  $('#coffeeSheet').classList.add('hidden'); renderAll(); refreshDetail(); if (!quiet) toast('Poza a fost pusă pentru toți.', 'image'); if (id === 'home') openHome();
}
async function removePhoto(id) { delete state.photos[id]; if (fb && state.online) { const { db, fs } = fb; await fs.deleteDoc(fs.doc(db, 'trips', TRIP_ID, 'photos', id)); } else lsSet(LS.photos, state.photos); $('#coffeeSheet').classList.add('hidden'); renderAll(); refreshDetail(); toast('Poza a fost scoasă.', 'delete'); }
async function savePhoto(id, file) {
  toast('Comprim poza…', 'hourglass_top', 8000);
  const data = await compressImage(file); if (data.length > 950000) return toast('Poza e prea mare chiar și comprimată.', 'image');
  await savePhotoDoc(id, { data, by: me(), at: new Date().toISOString() });
  bumpCounter('photos', 1); renderAll(); refreshDetail(); toast('Poza a fost salvată pentru toți.'); if (id === 'home') openHome();
}

// ---------- Cazare (Airbnb, Carrer de Pellaires 35) ----------
const STAY = {
  name: 'Bohemian Dreams · loft de design cu plante, lângă plajă',
  url: 'https://www.airbnb.com/rooms/9140899',
  facts: [
    ['hotel', 'Loft într-una dintre cele mai vechi clădiri din Poblenou: dormitor, living cu canapea, bucătărie, colț de lucru'],
    ['local_florist', 'Patio plin de plante, bun pentru o cafea dimineața sau seara'],
    ['beach_access', 'Plaja Bogatell la ~12 min pe jos; gazda lasă lucruri de plajă'],
    ['verified', 'Airbnb Plus, gazdă Superhost'],
    ['subway', 'Metrou L4 (galben) Poblenou la ~6 min; Rambla del Poblenou la 3 min'],
  ],
};
const baseLoc = () => ({ id: 'home', title: 'Cazare · Carrer de Pellaires 35', address: TRIP.base.address, placeQuery: TRIP.base.placeQuery, lat: TRIP.base.lat, lng: TRIP.base.lng, approx: true, cat: 'none', time: '', hours: 'Oricând' });
let homeOpen = false;
function homeCardHTML() {
  const b = baseLoc(), p = coordsOf(b), d = state.pos && p ? distanceM(state.pos, p) : null;
  return `<button data-action="open-home" class="card flex items-center gap-3 p-3 w-full text-left press"><div class="thumb" style="width: 56px; height: 56px; background: var(--brand-soft); color: var(--brand)">${icon('hotel', 'i-28 ms-fill')}${photoOf('home') ? `<img src="${esc(photoOf('home'))}" alt="">` : ''}</div><div class="min-w-0 flex-1"><div class="font-medium">Cazarea noastră (Airbnb)</div><div class="cap truncate">Carrer de Pellaires 35 · ${d != null ? `${fmtDist(d)} · ${fmtMin(walkMin(d))} pe jos` : 'Poblenou, L4'}</div></div>${icon('chevron_right', 't-3 i-20')}</button>`;
}
function renderHome() {
  const el = $('#homeInfo'); if (el) el.innerHTML = homeCardHTML();
  const b = baseLoc(), p = coordsOf(b), d = state.pos && p ? distanceM(state.pos, p) : null;
  const lbl = $('#homeNavLabel'); if (lbl) lbl.textContent = d != null && d < 120 ? 'Cazare ✓' : 'Cazare'; $('.nav-home')?.classList.toggle('near', d != null && d < 120);
  if (homeOpen && !$('#coffeeSheet').classList.contains('hidden')) $('#coffeeBody').innerHTML = homeSheetHTML();
}
function homeSheetHTML() {
  const b = baseLoc(), p = coordsOf(b), d = state.pos && p ? distanceM(state.pos, p) : null, home = d != null && d < 120;
  const notes = (state.shared.notes || '').trim(); const dow = new Date().getDay(); const own = state.photos.home;
  const last = dow === 5 ? 'merge până la 02:00' : dow === 6 ? 'merge toată noaptea' : 'merge până la 24:00';
  const hero = `<div class="relative" style="margin: 0 -16px"><div class="photo hero-photo" style="background: linear-gradient(135deg, var(--brand-soft), var(--blue-soft)); color: var(--brand)">${icon('hotel', 'i-48 ms-fill')}${own ? `<img src="${esc(own.data || own.url)}" alt="">` : ''}<div class="ph-bl"><button data-action="add-photo" data-id="home" class="pill ink press" style="height: 32px; padding: 0 12px">${icon('add_a_photo', 'i-16')} ${own ? 'Altă poză' : 'Pune o poză din Airbnb'}</button></div></div><div class="handle absolute" style="top: 2px; left: 50%; margin-left: -16px; background: rgba(255,255,255,.85)"></div><button data-action="close-modal" class="icon-btn solid press absolute" style="top: 12px; right: 12px" aria-label="Închide">${icon('close')}</button></div>`;
  return `${hero}
    <div class="pt-4"><div class="cap">Cazare · Airbnb · Poblenou</div><h2 class="ttl-1">${home ? 'Sunteți la cazare' : 'Cazarea noastră'}</h2><div class="t-2 mt-0.5">${esc(STAY.name)}</div><div class="t-2 mt-1 flex items-center gap-1.5">${icon('location_on', 'i-18')} Carrer de Pellaires 35, 08019 Barcelona</div></div>
    <div class="summary mt-4"><div><div class="v tabular">${d != null ? fmtDist(d) : '—'}</div><div class="k">până acolo</div></div><div><div class="v tabular">${d != null ? fmtMin(walkMin(d)) : '—'}</div><div class="k">pe jos</div></div><div><div class="v tabular">${d != null ? '~' + fmtMin(transitMin(d)) : '—'}</div><div class="k">metrou / taxi</div></div></div>
    <div class="grid grid-cols-3 gap-2 mt-3">
      <a href="${esc(mapsNav(b, 'walking'))}" target="_blank" rel="noopener" class="btn btn-outline press" style="padding: 0 8px">${icon('directions_walk', 'i-20')} Pe jos</a>
      <a href="${esc(mapsNav(b, 'transit'))}" target="_blank" rel="noopener" class="btn btn-primary press" style="padding: 0 8px">${icon('subway', 'i-20')} Metrou</a>
      <a href="${esc(mapsNav(b, 'driving'))}" target="_blank" rel="noopener" class="btn btn-outline press" style="padding: 0 8px">${icon('local_taxi', 'i-20')} Taxi</a>
    </div>
    <div class="hair pt-5 mt-5"><h3 class="ttl-3 mb-3">Important</h3><div class="card list">
      <div class="li">${icon('event', '', 'color: var(--brand)')}<div class="flex-1"><div class="font-medium">Sosim vineri 6 nov, ~14:30</div><div class="cap">după trenul din PortAventura și metroul de la Sants. Ora exactă de check-in și check-out e în aplicația Airbnb.</div></div></div>
      ${notes ? `<div class="li" style="align-items: flex-start">${icon('key', '', 'color: var(--amber)')}<div class="flex-1"><div class="font-medium">Din notițele noastre</div><div class="whitespace-pre-line t-2">${esc(notes.slice(0, 500))}</div></div></div>` : `<button data-action="view" data-view="info" class="li press">${icon('key', '', 'color: var(--amber)')}<div class="flex-1 text-left"><div class="font-medium">Cod ușă, etaj, wifi</div><div class="cap">Scrieți-le în Notițe ca să apară aici, la toți</div></div>${icon('chevron_right', 't-3 i-20')}</button>`}
      <button data-action="copy-address" class="li press">${icon('content_paste', '', 'color: var(--blue)')}<div class="flex-1 text-left"><div class="font-medium">Copiază adresa pentru taxi</div><div class="cap">Carrer de Pellaires 35, 08019 Barcelona</div></div></button>
      <a href="${esc(STAY.url)}" target="_blank" rel="noopener" class="li press">${icon('open_in_new', '', 'color: var(--brand)')}<div class="flex-1"><div class="font-medium">Anunțul și mesajele din Airbnb</div><div class="cap">poze, reguli, instrucțiuni de check-in</div></div>${icon('chevron_right', 't-3 i-20')}</a>
    </div></div>
    <div class="hair pt-5 mt-5"><h3 class="ttl-3 mb-3">Despre loc</h3><ul class="space-y-3">${STAY.facts.map(([ic, t]) => `<li class="flex gap-3">${icon(ic, 'i-20', 'color: var(--brand); margin-top: 1px')}<span>${esc(t)}</span></li>`).join('')}</ul></div>
    <div class="hair pt-5 mt-5"><h3 class="ttl-3 mb-3">Cum ajungeți</h3><div class="card list">
      <div class="li">${icon('subway', '', 'color: var(--amber)')}<div class="flex-1"><b style="font-weight: 500">L4 galbenă → Poblenou</b>, apoi 6 min pe jos pe Rambla del Poblenou</div></div>
      <div class="li">${icon('schedule', '', 'color: var(--text-2)')}<div class="flex-1">Metroul azi ${last}. Noaptea: NitBus N7 / N8 sau taxi</div></div>
    </div></div><div style="height:16px"></div>`;
}
function openHome() { homeOpen = true; openSheet(homeSheetHTML()); if (!state.pos) startRadar(); }

// ---------- Bucketlist ----------
const isDefaultId = (id) => /^(mara|anne|daniel)-d\d+$/.test(id);
function bucketOf(person) {
  const custom = state.shared.bucket[person] || {}; const items = [];
  BUCKET_DEFAULTS[person].forEach((d, i) => { const def = typeof d === 'string' ? { text: d } : d; const id = `${person}-d${i}`; const c = custom[id] || {}; if (c.hidden) return; items.push({ id, text: c.text || def.text, loc: c.loc !== undefined ? c.loc : def.loc || null, done: !!c.done, def: true }); });
  for (const [id, v] of Object.entries(custom)) if (v && v.text && !isDefaultId(id) && !v.hidden) items.push({ id, text: v.text, loc: v.loc || null, done: !!v.done });
  return items;
}
function bucketEntryFor(person, locId) { return bucketOf(person).find((it) => it.loc === locId) || null; }
function whoHas(locId) { return PERSONS.filter((p) => bucketEntryFor(p, locId)); }
async function bucketToggle(person, loc) { buzz(); const it = bucketEntryFor(person, loc.id); if (it) { if (isDefaultId(it.id)) await bucketSet(person, it.id, { hidden: true }); else await bucketDel(person, it.id); toast(`Scos de pe lista lui ${PEOPLE_META[person].name}.`, 'delete'); } else { await bucketSet(person, 'l-' + loc.id, { text: loc.title, loc: loc.id, done: false, by: me() }); toast(`„${loc.title}” e pe lista lui ${PEOPLE_META[person].name}.`, 'add_task'); } renderAll(); refreshDetail(); }
async function syncPersons(locId, title, wanted) { for (const p of PERSONS) { const has = bucketEntryFor(p, locId); if (wanted.includes(p) && !has) await bucketSet(p, 'l-' + locId, { text: title, loc: locId, done: false, by: me() }); else if (!wanted.includes(p) && has) { if (isDefaultId(has.id)) await bucketSet(p, has.id, { hidden: true }); else await bucketDel(p, has.id); } } }
let bucketEdit = null, pendingBucketLink = null;
function pickable() { return [...allLocs(), ...ALTERNATIVES.map((a, i) => altAsLoc(i))]; }
function pickSub(loc) { return [loc.isAlt ? 'recomandare' : isPool(loc) ? 'dorit' : DAY_LABEL[loc.day], loc.time && loc.time !== 'Flexibil' ? loc.time : '', (loc.address || '').split(',')[0]].filter(Boolean).join(' · '); }
function pickListHTML(q) {
  const f = fold(q).trim(); let list = pickable();
  if (f) list = list.filter((l) => fold(l.title + ' ' + (l.short || '') + ' ' + (l.address || '')).includes(f));
  else list = [...list.filter((l) => l.day === state.day && !l.isAlt), ...list.filter((l) => l.day !== state.day && !l.isAlt)];
  list = list.slice(0, f ? 12 : 6);
  if (!list.length) return `<div class="li t-2">Nimic cu „${esc(q)}”.</div>`;
  return list.map((l) => `<button type="button" data-action="bucket-pick" data-loc="${esc(l.id)}" class="li tight press">${thumbHTML(l, 40)}<div class="min-w-0 flex-1 text-left"><div class="font-medium truncate">${esc(l.title)}</div><div class="cap truncate">${esc(pickSub(l))}</div></div>${bucketEdit?.loc === l.id ? icon('check_circle', 'ms-fill', 'color: var(--blue)') : ''}</button>`).join('');
}
function bucketSheetHTML() {
  const e = bucketEdit, meta = PEOPLE_META[e.person], loc = e.loc ? findLoc(e.loc) : null;
  return `${sheetHead('Bucketlist · ' + esc(meta.name), e.id ? 'Editează' : 'Ceva nou pe listă')}
    <label class="field"><span>Ce vrem să facem</span><input type="text" id="bucketText" maxlength="120" value="${esc(e.text)}" placeholder="Ex: Gelato cu fistic" autocomplete="off"></label>
    <h3 class="ttl-3 mt-5 mb-2">Locul</h3>
    ${loc ? `<div class="card li mb-2">${thumbHTML(loc, 40)}<div class="min-w-0 flex-1"><div class="font-medium truncate">${esc(loc.title)}</div><div class="cap truncate">${esc(pickSub(loc))}</div></div><button type="button" data-action="bucket-pick" data-loc="" class="icon-btn sm press" aria-label="Scoate locul">${icon('close', 'i-20')}</button></div>` : ''}
    <div class="search">${icon('search', 'i-20')}<input type="search" id="bucketSearch" placeholder="Caută în program: Sephora, MNAC…" autocomplete="off" aria-label="Caută un loc"></div>
    <div id="bucketPickList" class="card list mt-2">${pickListHTML('')}</div>
    <button type="button" data-action="bucket-newloc" class="btn btn-text press mt-2">${icon('add_location_alt', 'i-20')} Loc nou, care nu e în program</button>
    <div class="flex gap-2 mt-4 pb-3"><button type="button" data-action="bucket-save" class="btn btn-primary btn-lg press flex-1">${e.id ? 'Salvează' : 'Adaugă pe listă'}</button>${e.id ? `<button type="button" data-action="bucket-delete" class="icon-btn ol press" style="width: 48px; height: 48px; color: var(--red)" aria-label="Șterge">${icon('delete')}</button>` : ''}</div>`;
}
function openBucketEditor(person, item = null) { bucketEdit = item ? { ...item, person } : { person, id: null, text: '', loc: null, done: false }; openSheet(bucketSheetHTML()); if (!item) setTimeout(() => $('#bucketText')?.focus(), 350); }
function bucketRefreshSheet() { const q = $('#bucketSearch')?.value || ''; $('#coffeeBody').innerHTML = bucketSheetHTML(); if (q) { $('#bucketSearch').value = q; $('#bucketPickList').innerHTML = pickListHTML(q); } }
function bucketPick(locId) { bucketEdit.text = $('#bucketText').value; bucketEdit.loc = locId || null; const loc = locId ? findLoc(locId) : null; if (loc && !bucketEdit.text.trim()) bucketEdit.text = loc.title; bucketRefreshSheet(); }
async function bucketSave() {
  const text = ($('#bucketText')?.value || bucketEdit.text || '').trim(); if (!text) { toast('Scrie ce vreți să faceți.', 'edit'); $('#bucketText')?.focus(); return; }
  const id = bucketEdit.id || 'c' + Date.now(); await bucketSet(bucketEdit.person, id, { text, loc: bucketEdit.loc || null, done: !!bucketEdit.done, by: me() });
  closeModals(); toast(bucketEdit.id ? 'Salvat.' : 'Adăugat pe listă.', 'add_task'); bucketEdit = null;
}
async function bucketDelete() { const { person, id, def } = bucketEdit; if (def) await bucketSet(person, id, { hidden: true }); else await bucketDel(person, id); closeModals(); bucketEdit = null; toast('Șters de pe listă.', 'delete'); }
function bucketNewLoc() { pendingBucketLink = { person: bucketEdit.person, id: bucketEdit.id, text: ($('#bucketText')?.value || '').trim(), done: !!bucketEdit.done }; openAdd(); }
function bucketRowHTML(it, person) {
  const loc = it.loc ? findLoc(it.loc) : null; const visited = loc && !!state.shared.visited[loc.id];
  const p = loc && coordsOf(loc), d = loc && state.pos && p ? distanceM(state.pos, p) : null;
  const sub = loc ? [shortTitle(loc.title), loc.isAlt ? 'recomandare' : isPool(loc) ? 'dorit' : DAY_LABEL[loc.day], d != null ? fmtDist(d) : ''].filter(Boolean).join(' · ') : '';
  return `<div class="li" style="gap: 12px; padding-right: 8px">
    <input type="checkbox" class="cb bucket-check" data-person="${person}" data-id="${esc(it.id)}" ${it.done ? 'checked' : ''} aria-label="Bifează: ${esc(it.text)}">
    <button data-action="${loc ? 'open-detail' : 'bucket-edit'}" data-person="${person}" data-id="${loc ? esc(loc.id) : esc(it.id)}" class="flex items-center gap-3 flex-1 min-w-0 text-left">
      ${loc ? thumbHTML(loc, 44) : ''}
      <div class="min-w-0"><div class="${it.done ? 'line-through t-3' : ''}">${esc(it.text)}</div>${loc ? `<div class="cap truncate">${esc(sub)}${visited ? ' · <span class="t-green">am fost</span>' : ''}</div>` : ''}</div>
    </button>
    ${loc ? `<a href="${esc(mapsNav(loc))}" target="_blank" rel="noopener" class="icon-btn sm press" aria-label="Traseu spre ${esc(loc.title)}">${icon('directions', 'i-20', 'color: var(--blue)')}</a>` : ''}
    <button data-action="bucket-edit" data-person="${person}" data-id="${esc(it.id)}" class="icon-btn sm press" aria-label="Editează">${icon('more_horiz', 'i-20')}</button>
  </div>`;
}
function counterOf(key) { if (key === 'coffee') return (state.shared.coffeeLog || []).reduce((s, x) => s + (x.shots || 1), 0) || state.shared.coffeeCount || 0; return (state.shared.counters || {})[key] || 0; }
function renderUs() {
  const person = state.person, meta = PEOPLE_META[person]; if (!meta) return;
  const tabs = $('#peopleTabs'); if (tabs) tabs.innerHTML = PERSONS.map((p) => `<button data-action="person" data-person="${p}" class="tab press ${p === person ? 'on' : ''}"><span class="avatar p-${p}" style="width: 24px; height: 24px; font-size: 12px">${PEOPLE_META[p].name[0]}</span>${PEOPLE_META[p].name}</button>`).join('');
  const items = bucketOf(person), done = items.filter((i) => i.done).length, pct = items.length ? Math.round((done / items.length) * 100) : 0;
  const cnt = counterOf(meta.counter.key), goal = meta.counter.goal;
  const perDay = DAYS.map((d) => (state.shared.coffeeLog || []).filter((x) => x.day === d).reduce((s, x) => s + (x.shots || 1), 0));
  const counter = person === 'daniel'
    ? `<button data-action="open-coffee" class="card li press mt-4">${icon('coffee', 'i-28 ms-fill', 'color: var(--amber)')}<div class="flex-1 min-w-0 text-left"><div class="font-medium">${cnt} / ${goal} espresso</div><div class="flex items-end gap-1 mt-1.5 h-5">${perDay.map((v, i) => `<i class="flex-1 rounded-sm" style="height:${Math.max(3, Math.min(20, v * 4))}px; background: ${DAYS[i] === todayKey() ? 'var(--blue)' : 'var(--surface-4)'}" title="${DAY_LABEL[DAYS[i]]}: ${v}"></i>`).join('')}</div></div><span class="btn btn-sm btn-tonal">${icon('add', 'i-18')} Încă unul</span></button>`
    : `<div class="card li mt-4">${icon(meta.counter.icon, 'i-28 ms-fill', `color: var(--p-${person})`)}<div class="flex-1"><div class="font-medium">${cnt} / ${goal}</div><div class="cap">${esc(meta.counter.label)}</div></div><button data-action="counter" data-key="${meta.counter.key}" data-delta="-1" class="icon-btn ol press" aria-label="Scade">${icon('remove')}</button><button data-action="counter" data-key="${meta.counter.key}" data-delta="1" class="icon-btn press" style="background: var(--blue-soft); color: var(--blue-strong)" aria-label="Adaugă">${icon('add')}</button></div>`;
  $('#usContent').innerHTML = `
    <div class="flex items-center gap-4"><div class="prog" style="--p:${pct}; --ring: var(--p-${person})"><span class="font-medium">${pct}%</span></div><div><div class="ttl-2">${done} din ${items.length} bifate</div><div class="cap">${esc(meta.tag)} · ${items.filter((i) => i.loc).length} legate de locuri</div></div></div>
    ${counter}
    <div class="card list mt-4 rise">${items.map((it) => bucketRowHTML(it, person)).join('')}
      <button data-action="bucket-new" data-person="${person}" class="li press t-blue">${icon('add')}<span class="flex-1 text-left font-medium">Adaugă pe lista lui ${esc(meta.name)}</span></button>
    </div>
    <p class="cap mt-3 pb-4">Pe pagina oricărui loc poți bifa pe lista cui intră.</p>`;
}
function coffeeSheetHTML() {
  const cnt = counterOf('coffee'), goal = PEOPLE_META.daniel.counter.goal, log = (state.shared.coffeeLog || []).slice(-6).reverse();
  const todays = dayItems(todayKey() || state.day).filter((l) => catKey(enriched(l).cat) === 'coffee');
  return `${sheetHead('Daniel', `${cnt} / ${goal} espresso`)}
    <h3 class="ttl-3 mb-2">Ce a fost</h3><div class="flex flex-wrap gap-2" id="coffeeTypes">${COFFEE_TYPES.map((t, i) => `<button class="chip press ${i === 0 ? 'on' : ''}" data-action="coffee-type" data-type="${t.key}">${t.label}${t.shots > 1 ? ' ×2' : ''}</button>`).join('')}</div>
    <h3 class="ttl-3 mt-4 mb-2">Unde</h3><div class="flex flex-wrap gap-2" id="coffeePlaces"><button class="chip press on" data-action="coffee-place" data-place="">Oriunde</button>${todays.map((l) => `<button class="chip press" data-action="coffee-place" data-place="${esc(l.title)}">${esc(shortTitle(l.title))}</button>`).join('')}</div>
    <button data-action="coffee-add" class="btn btn-primary btn-lg w-full mt-5 press">${icon('coffee', 'i-20')} Adaugă în contor</button>
    ${log.length ? `<h3 class="ttl-3 mt-5 mb-2">Ultimele</h3><div class="card list">${log.map((x, i) => `<div class="li tight"><div class="flex-1">${esc(COFFEE_TYPES.find((t) => t.key === x.type)?.label || 'Espresso')}${x.place ? ` · ${esc(x.place)}` : ''}</div><div class="cap">${esc(DAY_LABEL[x.day] || '')} ${esc(x.at ? new Date(x.at).toTimeString().slice(0, 5) : '')}</div>${i === 0 ? `<button data-action="coffee-undo" class="icon-btn sm press" aria-label="Anulează">${icon('undo', 'i-20')}</button>` : ''}</div>`).join('')}</div>` : ''}<div style="height:12px"></div>`;
}
let coffeeSel = { type: 'espresso', place: '' };
function openCoffee() { coffeeSel = { type: 'espresso', place: '' }; openSheet(coffeeSheetHTML()); }
async function coffeeAdd() {
  const t = COFFEE_TYPES.find((x) => x.key === coffeeSel.type) || COFFEE_TYPES[0];
  const log = [...(state.shared.coffeeLog || []), { type: t.key, shots: t.shots, place: coffeeSel.place, day: todayKey() || state.day, at: new Date().toISOString() }].slice(-200);
  state.shared.coffeeLog = log; state.shared.coffeeCount = counterOf('coffee'); buzz();
  await saveShared({ coffeeLog: log, coffeeCount: state.shared.coffeeCount });
  $('#coffeeBody').innerHTML = coffeeSheetHTML(); renderUs();
  const c = counterOf('coffee'); toast(c >= PEOPLE_META.daniel.counter.goal ? '20 de espresso! Daniel, ești oficial barcelonez.' : `${c} espresso. ${t.label}${coffeeSel.place ? ' la ' + coffeeSel.place : ''}.`, 'coffee');
}
async function coffeeUndo() { const log = (state.shared.coffeeLog || []).slice(0, -1); state.shared.coffeeLog = log; state.shared.coffeeCount = counterOf('coffee'); await saveShared({ coffeeLog: log, coffeeCount: state.shared.coffeeCount }); $('#coffeeBody').innerHTML = coffeeSheetHTML(); renderUs(); }
async function bumpCounter(key, delta) { const counters = { ...(state.shared.counters || {}) }; counters[key] = Math.max(0, (counters[key] || 0) + delta); state.shared.counters = counters; renderUs(); await saveShared({ counters }); }
async function bucketSet(person, id, patch) { const b = { ...(state.shared.bucket || {}) }; const p = { ...(b[person] || {}) }; p[id] = { ...(p[id] || {}), ...patch }; b[person] = p; state.shared.bucket = b; renderUs(); await saveShared({ bucket: b }); }
async function bucketDel(person, id) { const b = { ...(state.shared.bucket || {}) }; const p = { ...(b[person] || {}) }; delete p[id]; b[person] = p; state.shared.bucket = b; renderUs(); await saveShared({ bucket: b }); }

// ---------- Programare (mută un loc în altă zi) ----------
let scheduleId = null;
function scheduleSheetHTML(loc) {
  const e = enriched(loc), closed = e.closed || [], s = suggestFor(coordsOf(loc), loc.id, e.cat, closed);
  return `${sheetHead(esc(loc.title), isPool(loc) ? 'În ce zi?' : 'Mută în altă zi')}
    ${s.day !== 'pool' ? `<p class="t-2 mb-3">Cel mai aproape de <b style="font-weight: 500; color: var(--text)">${esc(s.nearTitle)}</b> (${DAY_LABEL[s.day]}, ${fmtDist(s.dist)}).</p>` : ''}
    <div class="flex flex-wrap gap-2" id="schedDays">${DAYS.map((d) => `<button type="button" data-action="sched-day" data-day="${d}" data-time="${esc(d === s.day ? s.time : '')}" class="chip press ${(loc.day === d) || (isPool(loc) && d === s.day) ? 'on' : ''}">${DAY_LABEL[d]}${d === s.day ? ' · recomandat' : closed.includes(d) ? ' · închis' : ''}</button>`).join('')}</div>
    <label class="field mt-4"><span>Ora (opțional)</span><input type="text" id="schedTime" maxlength="60" value="${esc(loc.time && loc.time !== 'Flexibil' ? loc.time : s.time && s.time !== 'Flexibil' ? s.time : '')}" placeholder="Ex: 17:30 – 18:30"></label>
    <div class="flex gap-2 mt-4 pb-3"><button type="button" data-action="sched-save" class="btn btn-primary btn-lg press flex-1">Pune în program</button>${!isPool(loc) ? `<button type="button" data-action="sched-pool" class="btn btn-outline btn-lg press">La dorite</button>` : ''}</div>`;
}
function openSchedule(id) { const loc = findLoc(id); if (!loc || loc.fixed || id === 'home' || id.startsWith('alt-')) return; scheduleId = id; openSheet(scheduleSheetHTML(loc)); }
async function scheduleSave(day) {
  const loc = findLoc(scheduleId); if (!loc) return; const sel = day || $('#schedDays .chip.on')?.dataset.day; if (!sel) return toast('Alege o zi.', 'edit_calendar');
  const time = sel === 'pool' ? 'Flexibil' : (($('#schedTime')?.value || '').trim() || 'Flexibil');
  if (loc.isCustom) { const { id, isCustom, createdAt, ...data } = loc; await saveLocation({ ...data, day: sel, time }, id); }
  else { const base = ITINERARY.find((l) => l.id === loc.id); const days = { ...(state.shared.days || {}), [loc.id]: sel }, times = { ...(state.shared.times || {}), [loc.id]: time === 'Flexibil' && base?.day === sel ? base.time : time }; state.shared.days = days; state.shared.times = times; if (state.shared.skipped[loc.id]) state.shared.skipped = { ...state.shared.skipped, [loc.id]: false }; renderAll(); await saveShared({ days, times, skipped: state.shared.skipped }); }
  $('#coffeeSheet').classList.add('hidden'); refreshDetail();
  if (sel === 'pool') toast(`„${loc.title}” e la dorite.`, 'bookmark'); else { $('#detailSheet').classList.add('hidden'); goToLoc(loc.id, sel); toast(`„${loc.title}”: ${DAY_LABEL[sel]}${time !== 'Flexibil' ? ', ' + time : ''}.`, 'event'); }
}
function goToLoc(id, day) { setView('plan'); state.filter = 'all'; if (day && DAYS.includes(day)) switchDay(day); else renderDay(); setTimeout(() => { const el = $('#loc-' + CSS.escape(id)); if (el) { el.classList.add('in'); el.scrollIntoView({ behavior: 'smooth', block: 'center' }); el.querySelector('.stop-card, button')?.classList.add('flash'); } }, 400); }

// ---------- Ecrane ----------
function switchDay(day) { if (!DAYS.includes(day)) return; state.day = day; state.filter = 'all'; renderDay(); renderMap(); renderNextStop(); }
function setFilter(c) { state.filter = c; renderDay(); }
function renderNotes() { const ta = $('#sharedNotes'); if (ta && document.activeElement !== ta) ta.value = state.shared.notes || ''; }
function renderAll() { renderDay(); renderMap(); renderNextStop(); renderNearby(); renderUs(); renderHome(); }
function setView(v) {
  if (!['plan', 'explore', 'us', 'info'].includes(v)) v = 'plan';
  if (state.picking && v !== 'explore') stopPick();
  state.view = v; lsSet(LS.view, v); if (homeOpen) closeModals();
  $('#radarBanner').classList.add('hidden');
  $$('section[data-view]').forEach((s) => s.classList.toggle('hidden', s.dataset.view !== v));
  $$('.nav-btn[data-view]').forEach((b) => b.classList.toggle('on', b.dataset.view === v));
  $('#fab').classList.toggle('hidden', v === 'info' || v === 'explore');
  window.scrollTo({ top: 0 });
  if (v === 'explore') { ensureMap(); renderMap(); renderNextStop(); if (!state.radarOn) startRadar(); }
  if (v === 'us') renderUs();
  if (v === 'plan') observeReveal();
  if (v === 'info') { const url = location.href.split('#')[0].split('?')[0]; $('#shareUrl').value = url; $('#whatsappShareBtn').href = `https://wa.me/?text=${encodeURIComponent(`${SUMMARY_TEXT}\n\nGhidul live: ${url}`)}`; }
}
function applyThemeIcon() { const dark = document.documentElement.classList.contains('dark'); $('#themeIcon').innerHTML = icon(dark ? 'light_mode' : 'dark_mode'); $('meta[name="theme-color"]')?.setAttribute('content', dark ? '#202124' : '#FFFFFF'); }
function toggleTheme() { const h = document.documentElement; const d = h.classList.toggle('dark'); h.classList.toggle('light', !d); try { localStorage.setItem(LS.theme, d ? 'dark' : 'light'); } catch {} applyThemeIcon(); }
async function copyText(text, ok) { try { await navigator.clipboard.writeText(text); } catch { const ta = document.createElement('textarea'); ta.value = text; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); } catch {} ta.remove(); } toast(ok); }

// ---------- Instalare ----------
function installSheetHTML() {
  const ios = isIOS(); const step = (n, t) => `<div class="li"><span class="cat-ic c-art" style="width: 28px; height: 28px; font-weight: 500">${n}</span><div class="flex-1">${t}</div></div>`;
  return `${sheetHead('Trippin pe telefon', 'Pune-o pe ecranul principal')}
    <p class="t-2 mb-3">Merge ca o aplicație: fără bara browserului, pornește și fără semnal, iar pe Android apare în meniul Share din Instagram.</p>
    <div class="card list">${ios ? step(1, 'În Safari apasă <b>Share</b> (pătratul cu săgeată).') + step(2, 'Alege <b>„Add to Home Screen”</b>.') + step(3, 'Apasă <b>Add</b> și deschide-o de pe ecranul principal.') : step(1, 'În Chrome apasă meniul <b>⋮</b>.') + step(2, 'Alege <b>„Add to Home screen”</b>, apoi <b>Install</b>.') + step(3, 'Apare în aplicații și în meniul Share.')}</div>
    ${state.installPrompt ? `<button data-action="install" class="btn btn-primary btn-lg w-full mt-4 press">${icon('download', 'i-20')} Instalează acum</button>` : ''}
    <button data-action="close-modal" class="btn btn-text w-full mt-2 mb-2 press">Mai târziu</button>`;
}
function openInstallSheet() { openSheet(installSheetHTML()); lsSet(LS.install, Date.now()); }
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
    fs.onSnapshot(fs.query(fs.collection(db, 'trips', TRIP_ID, 'locations'), fs.orderBy('createdAt', 'asc')), (snap) => {
      const local = first ? state.custom.filter((l) => String(l.id).startsWith('local-')) : [];
      state.custom = snap.docs.map((d) => ({ id: d.id, isCustom: true, ...d.data() })); lsSet(LS.locations, state.custom); renderAll(); refreshDetail();
      if (first) { first = false; state.online = true; setSyncStatus('online'); syncLocalLocations(local); }
    }, (err) => { console.error(err); state.online = false; setSyncStatus('local', err.message); toast('Nu m-am putut conecta la baza de date. Salvez local.', 'info'); });
    fs.onSnapshot(fs.doc(db, 'trips', TRIP_ID, 'state', 'shared'), (snap) => { const d = snap.data() || {}; for (const k of ['quests', 'visited', 'pins', 'skipped', 'bucket', 'counters', 'times', 'days']) if (d[k] && typeof d[k] === 'object') state.shared[k] = d[k]; if (Array.isArray(d.coffeeLog)) state.shared.coffeeLog = d.coffeeLog; if (typeof d.coffeeCount === 'number') state.shared.coffeeCount = d.coffeeCount; if (typeof d.notes === 'string') state.shared.notes = d.notes; persistLocal(); renderNotes(); renderAll(); refreshDetail(); }, (err) => console.error(err));
    fs.onSnapshot(fs.collection(db, 'trips', TRIP_ID, 'photos'), (snap) => { state.photos = {}; snap.forEach((d) => { state.photos[d.id] = d.data(); }); renderAll(); refreshDetail(); }, (err) => console.error(err));
  } catch (err) { console.error(err); setSyncStatus('local', err.message); }
}
async function syncLocalLocations(local) {
  if (!local.length || !fb) return; let n = 0;
  for (const l of local) { const { id, isCustom, createdAt, ...data } = l; try { await fb.fs.addDoc(fb.fs.collection(fb.db, 'trips', TRIP_ID, 'locations'), { ...data, createdAt: fb.fs.serverTimestamp() }); n++; } catch (e) { console.warn('sync', e); } }
  if (n) toast(`${n} ${n > 1 ? 'locuri salvate' : 'loc salvat'} fără semnal ${n > 1 ? 'au' : 'a'} ajuns în programul comun.`, 'cloud_done');
}
async function saveShared(patch) { Object.assign(state.shared, patch); if (fb && state.online) { const { db, fs } = fb; await fs.setDoc(fs.doc(db, 'trips', TRIP_ID, 'state', 'shared'), { ...patch, updatedAt: fs.serverTimestamp() }, { merge: true }); } else persistLocal(); }
async function saveLocation(data, editingId) {
  if (fb && state.online && !(editingId && String(editingId).startsWith('local-'))) { const { db, fs } = fb; if (editingId) { await fs.updateDoc(fs.doc(db, 'trips', TRIP_ID, 'locations', editingId), data); return editingId; } const ref = await fs.addDoc(fs.collection(db, 'trips', TRIP_ID, 'locations'), { ...data, createdAt: fs.serverTimestamp() }); return ref.id; }
  if (editingId) { state.custom = state.custom.map((l) => (l.id === editingId ? { ...l, ...data } : l)); persistLocal(); renderAll(); return editingId; }
  const id = 'local-' + Date.now(); state.custom.push({ ...data, id, isCustom: true, createdAt: new Date().toISOString() }); persistLocal(); renderAll(); return id;
}
async function deleteLocation(id) { if (!confirm('Ștergi acest loc din programul comun?')) return; if (fb && state.online && !String(id).startsWith('local-')) { const { db, fs } = fb; await fs.deleteDoc(fs.doc(db, 'trips', TRIP_ID, 'locations', id)); } else { state.custom = state.custom.filter((l) => l.id !== id); persistLocal(); renderAll(); } addState = null; closeModals(); toast('Locul a fost șters.', 'delete'); }
async function toggleVisited(k, el) {
  const v = { ...state.shared.visited, [k]: !state.shared.visited[k] }; state.shared.visited = v;
  if (v[k]) { buzz(14); const r = (el || document.body).getBoundingClientRect(); confetti(r.left + r.width / 2, r.top + Math.min(r.height / 2, 40)); toast(`Bifat: ${shortTitle(findLoc(k)?.title || '')}`, 'check_circle', 3500, { label: 'Anulează', run: () => toggleVisited(k) }); }
  renderAll(); refreshDetail(); await saveShared({ visited: v });
}
async function chooseSkip(k) { const s = { ...state.shared.skipped, [k]: true }; state.shared.skipped = s; buzz(); renderAll(); await saveShared({ skipped: s }); toast(`Sărim peste ${shortTitle(findLoc(k)?.title || '')}.`, 'skip_next', 4000, { label: 'Anulează', run: () => toggleSkip(k) }); }
async function shiftTime(id, time) {
  const loc = findLoc(id); if (!loc) return; buzz();
  if (loc.isCustom) { const { id: _i, isCustom, createdAt, ...data } = loc; await saveLocation({ ...data, time }, id); }
  else { const t = { ...(state.shared.times || {}), [id]: time }; state.shared.times = t; renderAll(); await saveShared({ times: t }); }
  toast(`${shortTitle(loc.title)} mutat la ${time}.`, 'schedule', 4000);
}
async function toggleSkip(k) { const s = { ...state.shared.skipped, [k]: !state.shared.skipped[k] }; state.shared.skipped = s; renderAll(); refreshDetail(); await saveShared({ skipped: s }); toast(s[k] ? 'Scos din traseu. Îl poți pune înapoi oricând.' : 'Pus înapoi în program.'); }
async function pinHere(k) { if (!state.pos) return toast('Nu am încă poziția ta. Deschide Harta.', 'my_location'); const p = { ...state.shared.pins, [k]: { lat: state.pos.lat, lng: state.pos.lng } }; state.shared.pins = p; renderAll(); refreshDetail(); await saveShared({ pins: p }); toast('Poziția exactă a fost salvată pentru toți.', 'push_pin'); }
let notesTimer;
function onNotesInput() { const v = $('#sharedNotes').value.slice(0, 2000); $('#notesStatus').textContent = 'Se salvează…'; clearTimeout(notesTimer); notesTimer = setTimeout(async () => { try { await saveShared({ notes: v }); $('#notesStatus').textContent = state.online ? 'Salvat și sincronizat' : 'Salvat pe acest telefon'; } catch { $('#notesStatus').textContent = 'Eroare la salvare'; } }, 700); }

// =====================================================================
// Adăugare: caută → alege → gata. Ziua și ora se propun singure, după
// oprirea din program cea mai apropiată de locul nou.
// =====================================================================
// Căutare de locuri fără cheie: Photon (OpenStreetMap), cu Nominatim ca rezervă.
const geoCache = new Map();
function osmCat(key, val, name = '') {
  const n = fold(name); key = key || ''; val = val || '';
  if (/(coffee|cafe|caffe|cafeteria|espresso|roaster|torrefact|brew)/.test(n)) return 'coffee';
  if (/(gelat|helad|churr|xurr|pastis|pasteler|donut|bakery|forn |cake|cookie|xocolat|chocolat|matcha|crep)/.test(n)) return 'sweet';
  if (key === 'amenity') { if (/cafe/.test(val)) return 'coffee'; if (/(bar|pub|biergarten)/.test(val)) return 'coffee'; if (/ice_cream/.test(val)) return 'sweet'; if (/(restaurant|fast_food|food_court)/.test(val)) return 'food'; if (/(cinema|theatre|arts_centre)/.test(val)) return 'fun'; }
  if (key === 'shop') return /(bakery|pastry|confectionery|chocolate|ice_cream)/.test(val) ? 'sweet' : /(coffee|tea)/.test(val) ? 'coffee' : 'shop';
  if (key === 'tourism') return /(theme_park|zoo|aquarium)/.test(val) ? 'fun' : 'art';
  if (key === 'leisure') return /(water_park|amusement|escape|trampoline|bowling|miniature_golf)/.test(val) ? 'fun' : 'art';
  if (/(museu|museum|galeri|gallery|parc|park|placa|plaza|mirador|church|basilica|bunker)/.test(n)) return 'art';
  if (/(shop|store|botiga|tienda|market|mercat|vintage|muji|zara)/.test(n)) return 'shop';
  if (/(bar|tapas|restaurant|pizz|burger|ramen|sushi|bodega|taberna)/.test(n)) return 'food';
  return key === 'historic' ? 'art' : 'food';
}
function photonToPlace(f) {
  const p = f.properties || {}, [lng, lat] = f.geometry?.coordinates || [];
  const street = [p.street, p.housenumber].filter(Boolean).join(' ');
  const area = p.district || p.locality || p.city || p.county || '';
  const name = p.name || street || area; if (!name || typeof lat !== 'number') return null;
  return { title: name, address: [street && street !== name ? street : '', area].filter(Boolean).join(', '), lat, lng, cat: osmCat(p.osm_key, p.osm_value, name), isPoi: !!p.name && ['amenity', 'shop', 'tourism', 'leisure', 'historic', 'craft', 'club'].includes(p.osm_key) };
}
async function geoSearch(q) {
  const key = 's:' + fold(q); if (geoCache.has(key)) return geoCache.get(key);
  let out = [];
  try {
    const r = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&lat=${BCN.lat}&lon=${BCN.lng}&limit=12`);
    if (!r.ok) throw new Error(r.status); const j = await r.json();
    out = (j.features || []).map(photonToPlace).filter(Boolean);
  } catch {
    try { const r = await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=10&viewbox=0.9,41.7,2.45,40.95&bounded=0&q=${encodeURIComponent(q)}`); const j = await r.json(); out = j.map((x) => ({ title: x.name || x.display_name.split(',')[0], address: x.display_name.split(',').slice(1, 3).join(',').trim(), lat: +x.lat, lng: +x.lon, cat: osmCat(x.category, x.type, x.name), isPoi: !!x.name })); } catch { out = null; }
  }
  if (out) { out = out.filter((p) => distanceM(BCN, p) < 120000); const seen = new Set(); out = out.filter((p) => { const k = fold(p.title) + Math.round(p.lat * 2000) + ':' + Math.round(p.lng * 2000); if (seen.has(k)) return false; seen.add(k); return true; }).slice(0, 8); geoCache.set(key, out); }
  return out;
}
async function geoReverse(lat, lng) {
  let out = [];
  try { const r = await fetch(`https://photon.komoot.io/reverse?lat=${lat}&lon=${lng}&limit=10&radius=0.12`); const j = await r.json(); out = (j.features || []).map(photonToPlace).filter(Boolean); } catch {}
  if (!out.length) { try { const r = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&zoom=18&lat=${lat}&lon=${lng}`); const x = await r.json(); if (x && x.display_name) out = [{ title: x.name || x.display_name.split(',')[0], address: x.display_name.split(',').slice(1, 3).join(',').trim(), lat: +x.lat, lng: +x.lon, cat: osmCat(x.category, x.type, x.name), isPoi: !!x.name }]; } catch {} }
  out.sort((a, b) => (b.isPoi - a.isPoi) || distanceM({ lat, lng }, a) - distanceM({ lat, lng }, b));
  return out.slice(0, 6);
}
// Sugestia: ziua în care sunteți deja prin zonă, în golul potrivit al programului (drumuri + timp minim)
function nearestByDay(pt, excludeId) { const out = {}; for (const d of DAYS) for (const loc of dayItems(d)) { if (loc.id === excludeId) continue; const p = coordsOf(loc); if (!p) continue; const dist = distanceM(pt, p); if (!out[d] || dist < out[d].dist) out[d] = { loc, dist, day: d }; } return Object.values(out).sort((a, b) => a.dist - b.dist); }
function trySlot(day, pt, cat, excludeId) {
  const plan = planDay(day, excludeId); const probe = { id: '__new', title: 'nou', cat: cat || 'food', lat: pt.lat, lng: pt.lng, time: 'Flexibil' };
  const sl = fitInto(plan.slots, probe, day); const idx = plan.slots.findIndex((x) => x.start > sl.start); const before = plan.slots[(idx === -1 ? plan.slots.length : idx) - 1];
  const clash = sl.noFit ? plan.slots.find((x) => x.start < sl.end && x.end > sl.start) : null;
  const w = before ? (legOf(before.loc, probe, day)?.min ?? 0) : 0;
  const next = plan.slots.find((x) => x.start >= sl.start && x !== clash);
  return { day, start: sl.start, end: sl.end, time: `${hhmm(sl.start)} – ${hhmm(sl.end)}`, noFit: !!sl.noFit, after: before?.loc, clash: clash?.loc, next: next?.loc, walk: w };
}
function suggestFor(pt, excludeId = null, cat = null, closed = []) {
  if (!pt) return { day: 'pool', time: 'Flexibil' };
  const near = nearestByDay(pt, excludeId).filter((n) => !closed.includes(n.day)); if (!near.length || near[0].dist > 3000) return { day: 'pool', time: 'Flexibil', dist: near[0]?.dist };
  const best = near[0]; const t = trySlot(best.day, pt, cat, excludeId);
  const res = { day: best.day, nearTitle: best.loc.title, afterId: (t.after || best.loc).id, afterTitle: (t.after || best.loc).title, dist: best.dist, walk: t.walk || (best.dist < 2200 ? walkMin(best.dist) : transitMin(best.dist)), time: t.time, noFit: t.noFit, clash: t.clash, next: t.next };
  if (t.noFit) { for (const n of near.slice(1)) { if (n.dist > 3000) break; const u = trySlot(n.day, pt, cat, excludeId); if (!u.noFit) { res.alt = { day: n.day, time: u.time, afterTitle: (u.after || n.loc).title, dist: n.dist }; break; } } }
  return res;
}
// Linkuri: Google Maps (nume + coordonate), Instagram / TikTok / YouTube (descrierea, când se poate), orice text lipit
function parseShared(text) {
  const out = { text: (text || '').trim(), url: null, source: null, title: '', address: '', lat: null, lng: null, candidates: [] };
  const m = /https?:\/\/[^\s<>"']+/i.exec(out.text); if (m) out.url = m[0].replace(/[),.]+$/, '');
  const lines = out.text.split(/\n+/).map((s) => s.trim()).filter((s) => s && !/^https?:\/\//i.test(s));
  if (out.url) {
    let u; try { u = new URL(out.url); } catch { u = null; } const host = u ? u.hostname.replace(/^www\./, '') : '';
    if (/instagram\.com/.test(host)) out.source = 'instagram'; else if (/tiktok\.com/.test(host)) out.source = 'tiktok'; else if (/youtu\.?be/.test(host)) out.source = 'youtube';
    else if ((u && /google\.[a-z.]+$/.test(host) && /\/maps/.test(u.pathname)) || /maps\.app\.goo\.gl|goo\.gl\/maps|maps\.google/.test(host + (u?.pathname || ''))) out.source = 'gmaps'; else out.source = 'web';
    if (out.source === 'gmaps' && u) { const place = /\/maps\/place\/([^/]+)/.exec(u.pathname); if (place) out.title = decodeURIComponent(place[1].replace(/\+/g, ' ')); const at = /@(-?\d+\.\d+),(-?\d+\.\d+)/.exec(u.pathname); if (at) { out.lat = +at[1]; out.lng = +at[2]; } const d3 = /!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/.exec(u.href); if (d3) { out.lat = +d3[1]; out.lng = +d3[2]; } const q = u.searchParams.get('q') || u.searchParams.get('query'); if (q) { const c = /^(-?\d+\.\d+),\s*(-?\d+\.\d+)$/.exec(q); if (c) { out.lat = +c[1]; out.lng = +c[2]; } else if (!out.title) out.title = q; } }
  }
  if (out.source === 'instagram' && out.url) { try { const u = new URL(out.url); const seg = u.pathname.split('/').filter(Boolean); if (seg[0] === 'explore' && seg[1] === 'locations' && seg[3]) { out.title = decodeURIComponent(seg[3]).replace(/[-_]+/g, ' ').trim(); out.igKind = 'location'; } else if (seg.length === 1 && !['reel', 'reels', 'p', 'stories', 'explore', 'tv'].includes(seg[0])) { out.title = seg[0].replace(/[._]+/g, ' ').replace(/\b(bcn|barcelona|official|oficial)\b/gi, '').trim(); out.igKind = 'profile'; } } catch {} }
  if (out.source === 'gmaps' && !out.title && lines.length) { out.title = lines[0]; if (lines[1] && /\d/.test(lines[1])) out.address = lines[1]; }
  out.candidates = candidatesFrom(lines.join('\n'));
  if (!out.title && out.candidates.length) out.title = out.candidates[0];
  return out;
}
function candidatesFrom(text) {
  const c = []; const add = (s) => { s = (s || '').replace(/[#@_]/g, ' ').replace(/\s+/g, ' ').trim(); if (s.length > 2 && s.length < 70 && !c.some((x) => fold(x) === fold(s))) c.push(s); };
  for (const m of text.matchAll(/(?:📍|📌|🗺️?|Location:|Loc:|Adresa:|Address:)\s*([^\n#|•]+)/giu)) add(m[1].split(/,|\s-\s/)[0]);
  for (const m of text.matchAll(/@([A-Za-z0-9._]{3,40})/g)) add(m[1].replace(/\./g, ' ').replace(/(bcn|barcelona|oficial|official)$/i, ''));
  const first = text.split('\n').map((s) => s.trim()).find((s) => s && !/^https?:/.test(s)); if (first && first.length < 60) add(first.replace(/\s*[|·-]\s*(Instagram|TikTok|YouTube).*$/i, ''));
  return c.slice(0, 4);
}
async function oembedCaption(p) {
  const url = p.source === 'tiktok' ? `https://www.tiktok.com/oembed?url=${encodeURIComponent(p.url)}` : p.source === 'youtube' ? `https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(p.url)}` : null;
  if (!url) return null; try { const r = await fetch(url); if (!r.ok) return null; const j = await r.json(); return [j.title, j.author_name].filter(Boolean).join('\n'); } catch { return null; }
}

let addState = null;
const blankAdd = () => ({ step: 'search', q: '', results: [], local: [], loading: false, link: null, linkHint: '', place: null, editingId: null, day: null, time: '', cat: 'food', persons: [], note: '', photoUrl: '', hours: '', by: me(), more: false, suggestion: null, nearby: false, anchor: null });
function openAdd({ shared = null, editing = null, place = null, nearby = null } = {}) {
  $('#detailSheet').classList.add('hidden'); $('#coffeeSheet').classList.add('hidden'); homeOpen = false; addState = blankAdd();
  if (editing) { const e = enriched(editing); Object.assign(addState, { step: 'confirm', editingId: editing.id, place: { title: editing.title, address: editing.address || e.address || '', lat: editing.lat ?? null, lng: editing.lng ?? null, cat: catKey(e.cat) }, day: editing.day, time: editing.time || '', cat: CAT[catKey(e.cat)] ? catKey(e.cat) : 'food', note: editing.desc || '', hours: editing.hours || '', by: editing.addedBy || me(), persons: PERSONS.filter((p) => bucketEntryFor(p, editing.id)), photoUrl: state.photos[editing.id]?.url || '', link: editing.link ? { url: editing.link, source: editing.source } : null }); addState.suggestion = suggestFor(coordsOf(editing), editing.id); }
  else if (place) choosePlace(place, false);
  else if (nearby) { addState.nearby = true; addState.results = nearby.results; addState.anchor = nearby.anchor; }
  renderAdd(); $('#addSheet').classList.remove('hidden'); $('#addBody').scrollTop = 0;
  if (shared) handleLinkText(shared); else if (addState.step === 'search' && !nearby) setTimeout(() => $('#addQ')?.focus(), 250);
}
function placeRowHTML(pl, i, from) {
  const s = suggestFor(pl.lat != null ? pl : null, null, pl.cat); const c = cat(pl.cat);
  const hint = s.day !== 'pool' ? `<span class="t-blue">${DAY_SHORT[s.day][0]} ${DAY_SHORT[s.day][1]}, ${s.time.split(' ')[0]}</span> · lângă ${esc(shortTitle(s.afterTitle))}${s.noFit ? ' · <span style="color: #B06000">nu încape</span>' : ''}` : pl.lat != null ? 'departe de program · la dorite' : '';
  return `<button class="li press" data-action="add-choose" data-from="${from}" data-i="${i}"><span class="cat-ic ${c.cls}">${icon(c.icon, 'i-20')}</span><div class="min-w-0 flex-1 text-left"><div class="font-medium truncate">${esc(pl.title)}</div><div class="cap truncate">${esc(pl.address || c.label)}</div>${hint ? `<div class="cap truncate mt-0.5">${hint}</div>` : ''}</div>${icon('add', 't-3 i-20')}</button>`;
}
function localMatches(q) {
  const f = fold(q).trim(); if (f.length < 2) return { existing: [], alts: [] };
  const inProgram = new Set(allLocs().map((l) => fold(l.title)));
  const alts = ALTERNATIVES.map((a, i) => ({ ...a, altIndex: i })).filter((a) => fold(a.title + ' ' + (a.address || '')).includes(f) && !inProgram.has(fold(a.title)));
  const existing = allLocs().filter((l) => fold(l.title).includes(f)).slice(0, 3);
  return { existing, alts: alts.map(altPlace) };
}
const altPlace = (x) => ({ title: x.title, address: x.address, lat: x.lat, lng: x.lng, cat: catKey(x.cat), hours: x.hours, note: [x.note, x.price ? `Preț: ${x.price}` : ''].filter(Boolean).join('\n') });
function renderAdd() {
  const a = addState, body = $('#addBody'); if (!a || !body) return;
  if (a.step === 'search') {
    const { existing, alts } = localMatches(a.q);
    a.local = a.q ? alts : a.nearby ? [] : (DAY_ZONES[state.day] || []).flatMap((z) => ALTERNATIVES.filter((x) => x.zone === z)).slice(0, 5).map(altPlace);
    body.innerHTML = `${sheetHead(pendingBucketLink ? 'Pentru bucketlist' : a.nearby ? 'Pe hartă' : 'Program comun', a.nearby ? 'Ce e aici?' : 'Adaugă un loc')}
      <div class="search">${icon('search', 'i-20')}<input id="addQ" type="search" enterkeyhint="search" autocomplete="off" placeholder="Scrie numele locului" value="${esc(a.q)}" aria-label="Caută un loc">${a.q ? `<button data-action="add-clear" class="icon-btn sm press" aria-label="Șterge">${icon('close', 'i-20')}</button>` : ''}</div>
      ${!a.q.trim() && !a.nearby && !a.link ? `<h3 class="cap mt-5 mb-2">Nu știi numele? Adaugă altfel</h3><div class="card list">
        <button data-action="add-pickmap" class="li press"><span class="cat-ic" style="background: var(--red-soft); color: var(--red)">${icon('pin_drop', 'i-20')}</span><div class="flex-1 text-left"><div class="font-medium">Arăt locul pe hartă</div><div class="cap">Se deschide harta: muți pinul roșu pe loc și apeși „Aici”</div></div>${icon('chevron_right', 't-3 i-20')}</button>
        <button data-action="add-here" class="li press"><span class="cat-ic" style="background: var(--blue-soft); color: var(--blue-strong)">${icon('my_location', 'i-20')}</span><div class="flex-1 text-left"><div class="font-medium">Suntem acolo acum</div><div class="cap">Arăt ce e în jurul vostru și alegeți</div></div>${icon('chevron_right', 't-3 i-20')}</button>
        <button data-action="add-paste" class="li press"><span class="cat-ic" style="background: var(--pink-soft); color: var(--pink)">${icon('link', 'i-20')}</span><div class="flex-1 text-left"><div class="font-medium">Am un link: Reel, TikTok, Google Maps</div><div class="cap">Îl lipesc din clipboard. Din Instagram trebuie scris și numele</div></div>${icon('chevron_right', 't-3 i-20')}</button>
      </div>` : ''}
      ${a.link ? `<div class="card-flat p-3 mt-3 flex gap-3">${icon(a.link.source === 'gmaps' ? 'gmaps' : 'link', 'i-20', 'color: var(--blue)')}<div class="min-w-0 flex-1"><div class="font-medium">${esc(SOURCE[a.link.source] || 'Link')} atașat</div><div class="cap">${esc(a.linkHint)}</div></div><button data-action="add-unlink" class="icon-btn sm press" aria-label="Scoate linkul">${icon('close', 'i-18')}</button></div>` : ''}
      ${existing.length ? `<h3 class="cap mt-5 mb-2">Deja în program</h3><div class="card list">${existing.map((l) => `<button class="li press" data-action="open-detail" data-id="${esc(l.id)}">${thumbHTML(l, 40)}<div class="min-w-0 flex-1 text-left"><div class="font-medium truncate">${esc(l.title)}</div><div class="cap">${esc(pickSub(l))}</div></div>${icon('chevron_right', 't-3 i-20')}</button>`).join('')}</div>` : ''}
      ${a.local.length ? `<h3 class="cap mt-5 mb-2">${a.q ? 'Din recomandările noastre' : `Recomandări pentru ${DAY_LABEL[state.day]}`}</h3><div class="card list">${a.local.map((pl, i) => placeRowHTML(pl, i, 'local')).join('')}</div>` : ''}
      ${a.loading ? `<div class="cap mt-5 flex items-center gap-2">${icon('hourglass_top', 'i-18')} Caut pe hartă…</div>` : ''}
      ${a.results === null ? `<div class="card-flat p-3 mt-5 t-2">Căutarea pe hartă nu merge acum (fără semnal?). Poți adăuga doar cu numele.</div>` : a.results.length ? `<h3 class="cap mt-5 mb-2">${a.nearby ? 'Locuri în jurul pinului' : 'Pe hartă'}</h3><div class="card list">${a.results.map((pl, i) => placeRowHTML(pl, i, 'geo')).join('')}</div>` : (a.q.trim().length > 2 && !a.loading ? `<div class="cap mt-5">Nimic pe hartă pentru „${esc(a.q)}”. Încearcă alt cuvânt sau adaugă doar cu numele.</div>` : '')}
      ${a.q.trim() || a.nearby ? `<button data-action="add-nameonly" class="btn btn-text press mt-3" style="padding: 0">${icon('edit', 'i-20')} ${a.nearby ? 'Folosește doar punctul de pe hartă' : `Adaugă „${esc(a.q.trim().slice(0, 28))}” fără căutare`}</button>` : `<p class="cap mt-4">Scrie 2–3 litere din nume: caut pe hartă, în jurul Barcelonei, și îl pun în ziua în care sunteți prin zonă.</p>`}
      <div style="height:16px"></div>`;
    return;
  }
  // Pasul 2: confirmare
  const pl = a.place || {}; const s = a.suggestion || { day: 'pool' }; const c = cat(a.cat);
  const day = a.day || s.day; const dayBtn = (d, label) => `<button data-action="add-day" data-day="${d}" class="chip press ${day === d ? 'on' : ''}">${day === d ? icon('check', 'i-18') : ''}${label}</button>`;
  body.innerHTML = `<div class="sheet-top"><div class="handle"></div><div class="flex items-center gap-1 pb-3">${a.editingId ? '' : `<button data-action="add-back" class="icon-btn press" aria-label="Înapoi la căutare">${icon('arrow_back')}</button>`}<h2 class="ttl-1 flex-1 ${a.editingId ? '' : 'ml-1'}">${a.editingId ? 'Editează locul' : 'Adaugă în program'}</h2><button data-action="close-modal" class="icon-btn press" aria-label="Închide">${icon('close')}</button></div></div>
    <div class="flex items-center gap-3"><span class="cat-ic ${c.cls}" style="width: 48px; height: 48px">${icon(c.icon)}</span><div class="min-w-0 flex-1"><input id="addTitle" class="w-full bg-transparent ttl-2 outline-none" maxlength="120" value="${esc(pl.title || '')}" aria-label="Numele locului" placeholder="Numele locului"><div class="cap truncate">${esc(pl.address || (pl.lat != null ? 'poziție de pe hartă' : 'fără poziție: „Fixează aici” când ajungeți'))}</div></div></div>
    ${s.day !== 'pool' && s.afterTitle ? `<button data-action="add-day" data-day="${s.day}" data-time="${esc(s.time)}" class="card li press mt-4" style="${day === s.day ? 'border-color: var(--blue); background: var(--blue-soft)' : ''}">${icon('auto_awesome', '', 'color: var(--blue)')}<div class="flex-1 min-w-0 text-left"><div class="font-medium">${DAY_LABEL[s.day]}, ${s.time.split(' ')[0]}</div><div class="cap">după ${esc(shortTitle(s.afterTitle))} · ${fmtMin(s.walk)} de drum · ${fmtMin(stayOf({ cat: a.cat }))} acolo</div></div>${day === s.day ? icon('check_circle', 'ms-fill', 'color: var(--blue)') : ''}</button>
      ${s.noFit ? `<div class="watch mt-3"><div class="font-medium">${icon('warning', 'i-18 ms-fill', 'color: #F29900')} ${DAY_LABEL[s.day]} e plină în zona asta</div><div class="t-2 mt-1">${s.clash ? `Se suprapune cu <b>${esc(shortTitle(s.clash.title))}</b>` : `Nu rămâne timp de drum până la <b>${esc(shortTitle(s.next?.title || s.afterTitle))}</b>`}. Dacă îl adăugați, alegeți apoi în program pe care mergeți.</div>${s.alt ? `<button data-action="add-day" data-day="${s.alt.day}" data-time="${esc(s.alt.time)}" class="btn btn-sm btn-tonal press mt-3">${icon('event', 'i-18')} Încape ${DAY_LABEL[s.alt.day]}, ${s.alt.time.split(' ')[0]}</button>` : ''}</div>` : ''}` : pl.lat != null ? `<div class="card-flat p-3 mt-4 t-2">E departe de tot ce aveți în program, așa că l-am pus la „Dorite”. Alegeți o zi când vreți.</div>` : ''}
    <h3 class="ttl-3 mt-5 mb-2">Când</h3>
    <div class="flex flex-wrap gap-2">${DAYS.map((d) => dayBtn(d, `${DAY_SHORT[d][0]} ${DAY_SHORT[d][1]}`)).join('')}${dayBtn('pool', 'Dorite')}</div>
    ${day !== 'pool' ? `<label class="field mt-3"><span>Ora</span><input id="addTime" type="text" maxlength="60" value="${esc(a.time && a.time !== 'Flexibil' ? a.time : '')}" placeholder="Flexibil (apare la finalul zilei)"></label>` : ''}
    <h3 class="ttl-3 mt-5 mb-2">Ce fel de loc</h3>
    <div class="flex flex-wrap gap-2">${CAT_KEYS.map((k) => `<button data-action="add-cat" data-cat="${k}" class="chip press ${a.cat === k ? 'on' : ''}">${icon(CAT[k].icon, 'i-18')}${CAT[k].label}</button>`).join('')}</div>
    <h3 class="ttl-3 mt-5 mb-2">Pe bucketlist-ul lui</h3>
    <div class="flex flex-wrap gap-2">${PERSONS.map((p) => `<button data-action="add-person" data-person="${p}" class="ptoggle press ${a.persons.includes(p) ? 'on' : ''}" aria-pressed="${a.persons.includes(p)}"><span class="avatar p-${p}">${PEOPLE_META[p].name[0]}</span>${PEOPLE_META[p].name}</button>`).join('')}</div>
    <button data-action="add-more" class="btn btn-text press mt-4" style="padding: 0">${icon(a.more ? 'expand_less' : 'expand_more', 'i-20')} Notă, program, poză${a.link ? ', link' : ''}</button>
    <div class="${a.more ? '' : 'hidden'} space-y-3 mt-2">
      <label class="field"><span>Notă (de ce vrem să mergem, ce comandăm)</span><textarea id="addNote" rows="3" maxlength="1500">${esc(a.note)}</textarea></label>
      <label class="field"><span>Program de funcționare</span><input id="addHours" type="text" maxlength="120" value="${esc(a.hours)}" placeholder="Ex: Lu–Sâ 10–20"></label>
      <label class="field"><span>Link poză de pe net</span><input id="addPhoto" type="url" inputmode="url" maxlength="600" value="${esc(a.photoUrl)}" placeholder="https://…"></label>
      <div><div class="cap mb-2">Adăugat de</div><div class="flex gap-2">${PEOPLE.map((p) => `<button data-action="add-by" data-by="${p}" class="chip press ${a.by === p ? 'on' : ''}">${p}</button>`).join('')}</div></div>
      ${a.link ? `<div class="cap break-all">Link: ${esc(a.link.url)}</div>` : ''}
    </div>
    <div class="sticky bottom-0 pt-3 pb-2 mt-4" style="background: var(--surface)"><div class="flex gap-2"><button data-action="add-save" id="addSave" class="btn btn-primary btn-lg press flex-1">${a.editingId ? 'Salvează' : day === 'pool' ? 'Adaugă la dorite' : `Adaugă ${DAY_LABEL[day]}`}</button>${a.editingId ? `<button data-action="delete-loc" data-id="${esc(a.editingId)}" class="icon-btn ol press" style="width: 48px; height: 48px; color: var(--red)" aria-label="Șterge">${icon('delete')}</button>` : ''}</div></div>`;
}
function syncAddInputs() { const a = addState; if (!a || a.step !== 'confirm') return; const g = (id) => $('#' + id); if (g('addTitle')) a.place = { ...(a.place || {}), title: g('addTitle').value }; if (g('addTime')) a.time = g('addTime').value; if (g('addNote')) a.note = g('addNote').value; if (g('addHours')) a.hours = g('addHours').value; if (g('addPhoto')) a.photoUrl = g('addPhoto').value; }
function choosePlace(pl, render = true) {
  const a = addState; a.place = { title: pl.title, address: pl.address || '', lat: pl.lat ?? null, lng: pl.lng ?? null, cat: pl.cat };
  a.cat = CAT[pl.cat] ? pl.cat : osmCat('', '', pl.title); a.hours = pl.hours || a.hours; if (pl.note && !a.note) a.note = pl.note;
  a.suggestion = suggestFor(pl.lat != null ? { lat: pl.lat, lng: pl.lng } : null, null, a.cat); a.day = a.suggestion.day; a.time = a.suggestion.time; a.step = 'confirm';
  if (pl.lat != null) showNewMarker(pl);
  if (render) { renderAdd(); $('#addBody').scrollTop = 0; buzz(); }
}
let searchTimer, searchSeq = 0;
function onAddQuery(v) {
  const a = addState; if (!a) return; a.q = v; a.nearby = false;
  if (/https?:\/\//i.test(v)) { handleLinkText(v); return; }
  clearTimeout(searchTimer); const q = v.trim();
  if (q.length < 3) { a.results = []; a.loading = false; renderAddKeepFocus(); return; }
  a.loading = true; renderAddKeepFocus();
  searchTimer = setTimeout(async () => { const seq = ++searchSeq; const res = await geoSearch(q); if (seq !== searchSeq || !addState || addState.q.trim() !== q) return; addState.results = res; addState.loading = false; renderAddKeepFocus(); }, 320);
}
function renderAddKeepFocus() { const inp = $('#addQ'); const had = document.activeElement === inp; const pos = inp?.selectionStart; renderAdd(); if (had) { const n = $('#addQ'); if (n) { n.focus(); try { n.setSelectionRange(pos, pos); } catch {} } } }
async function handleLinkText(text) {
  const a = addState; if (!a) return; const p = parseShared(text);
  a.link = p.url ? { url: p.url, source: p.source } : null;
  a.linkHint = p.source === 'gmaps' ? 'Am luat numele din Google Maps.' : p.source === 'instagram' ? (p.igKind === 'location' ? 'Am luat numele din locația de pe Instagram. Alege locul potrivit.' : p.igKind === 'profile' ? 'Am luat numele din profilul de Instagram. Alege locul potrivit.' : 'Din Reel nu pot citi descrierea. Scrie numele, sau în Instagram apasă pe locația de sub nume → Share → Trippin.') : p.source === 'tiktok' || p.source === 'youtube' ? 'Citesc descrierea…' : 'Linkul rămâne pe cardul locului.';
  if (p.source === 'gmaps' && p.lat != null) { choosePlace({ title: p.title || 'Loc din Google Maps', address: p.address, lat: p.lat, lng: p.lng, cat: osmCat('', '', p.title) }); return; }
  let q = p.title || '';
  if (!q && (p.source === 'tiktok' || p.source === 'youtube')) {
    a.q = ''; a.results = []; renderAdd(); const cap = await oembedCaption(p); if (!addState) return;
    if (cap) { const c = candidatesFrom(cap); q = c[0] || ''; a.linkHint = q ? `Din descriere: „${q}”. Alege locul potrivit mai jos.` : 'Descrierea nu numește locul. Scrie numele.'; } else a.linkHint = 'Nu pot citi descrierea. Scrie numele locului.';
  }
  a.q = q; a.results = []; renderAdd(); const inp = $('#addQ'); if (inp) { inp.value = q; inp.focus(); inp.select(); }
  if (q.length > 2) onAddQuery(p.source === 'gmaps' && p.address ? `${q}, ${p.address.split(',')[0]}` : q);
}
async function addFromHere() {
  const go = async (pos) => { if (!addState) return; toast('Caut ce e în jurul vostru…', 'my_location', 2500); const res = await geoReverse(pos.lat, pos.lng); if (!addState) return; addState.nearby = true; addState.anchor = pos; addState.q = ''; addState.results = res.length ? res : [{ title: 'Locul unde suntem', address: '', lat: pos.lat, lng: pos.lng, cat: 'food' }]; renderAdd(); };
  if (state.pos) return go(state.pos); if (!navigator.geolocation) return toast('Telefonul nu oferă localizare.', 'my_location');
  navigator.geolocation.getCurrentPosition((p) => go({ lat: p.coords.latitude, lng: p.coords.longitude }), () => toast('Nu am putut lua poziția.', 'my_location'), { enableHighAccuracy: true, timeout: 10000 });
}
async function saveAdd() {
  syncAddInputs(); const a = addState, pl = a.place || {}; const title = (pl.title || '').trim(); if (!title) { toast('Scrie numele locului.', 'edit'); $('#addTitle')?.focus(); return; }
  const day = a.day || a.suggestion?.day || 'pool';
  const data = { title, day, cat: a.cat, time: day === 'pool' ? 'Flexibil' : ((a.time || '').trim() || 'Flexibil'), desc: (a.note || '').trim(), addedBy: PEOPLE.includes(a.by) ? a.by : 'Daniel', mapLink: mapsSearch(title) };
  if (pl.lat != null && pl.lng != null) { data.lat = +pl.lat; data.lng = +pl.lng; }
  if (pl.address) data.address = pl.address.slice(0, 200);
  if ((a.hours || '').trim()) data.hours = a.hours.trim().slice(0, 120);
  if (a.link?.url) { data.link = a.link.url.slice(0, 500); data.source = a.link.source || 'web'; }
  lsSet(LS.me, data.addedBy);
  const btn = $('#addSave'); btn.disabled = true; btn.textContent = 'Se salvează…';
  try {
    const id = await saveLocation(data, a.editingId); const persons = [...a.persons];
    try { await syncPersons(id, title, persons); } catch (e) { console.warn(e); }
    const photo = (a.photoUrl || '').trim(); if (photo && /^https:\/\/\S+$/i.test(photo) && photo !== state.photos[id]?.url) { try { await savePhotoUrl(id, photo, true); } catch (e) { console.warn(e); } }
    const editing = a.editingId; addState = null; closeModals(); clearNewMarker();
    if (pendingBucketLink && !editing) { const pb = pendingBucketLink; pendingBucketLink = null; await bucketSet(pb.person, pb.id || 'c' + Date.now(), { text: pb.text || title, loc: id, done: pb.done, by: me() }); state.person = pb.person; setView('us'); toast(`„${title}” e în program și pe lista lui ${PEOPLE_META[pb.person].name}.`, 'add_task'); return; }
    goToLoc(id, day); if (!editing) confetti(window.innerWidth / 2, window.innerHeight / 2);
    toast(editing ? 'Salvat.' : day === 'pool' ? `„${title}” e la locurile dorite.` : `„${title}”: ${DAY_LABEL[day]}${data.time !== 'Flexibil' ? ', ' + data.time : ''}.`, day === 'pool' ? 'bookmark' : 'event', 4000);
  } catch (err) { console.error(err); toast('Eroare la salvare: ' + (err.message || err), 'info'); btn.disabled = false; btn.textContent = 'Încearcă din nou'; }
}
function addAlternative(i) { const x = ALTERNATIVES[i]; if (!x) return; openAdd({ place: altPlace(x) }); }
function handleShareTarget() { const u = new URL(location.href); if (u.searchParams.has('r')) { u.searchParams.delete('r'); history.replaceState(null, '', u.pathname + (u.search || '')); } const shared = [u.searchParams.get('title'), u.searchParams.get('text'), u.searchParams.get('url')].filter(Boolean).join('\n'); if (!shared) return; history.replaceState(null, '', u.pathname); openAdd({ shared }); }
function closeModals() { homeOpen = false; $$('[data-modal]').forEach((m) => m.classList.add('hidden')); if (!addState || addState.step !== 'confirm') clearNewMarker(); }

// ---------- Alege pe hartă ----------
function startPick() { $$('[data-modal]').forEach((m) => m.classList.add('hidden')); setView('explore'); state.picking = true; $('#crosshair').classList.remove('hidden'); $('#pickBar').classList.remove('hidden'); $('#pickHint').textContent = 'Pinul roșu arată locul ales'; if (state.map) { state.map.setZoom(Math.max(state.map.getZoom(), 16)); state.map.on('moveend', pickMoved); } }
let pickTimer;
function pickMoved() { if (!state.picking) return; clearTimeout(pickTimer); pickTimer = setTimeout(async () => { const c = state.map.getCenter(); const r = await geoReverse(c.lat, c.lng); if (state.picking) $('#pickHint').textContent = r[0] ? r[0].title + (r[0].address ? ' · ' + r[0].address : '') : 'Punct pe hartă'; }, 450); }
function stopPick() { state.picking = false; $('#crosshair').classList.add('hidden'); $('#pickBar').classList.add('hidden'); state.map?.off('moveend', pickMoved); }
async function confirmPick() { const c = state.map.getCenter(); stopPick(); await addAt({ lat: c.lat, lng: c.lng }); }
async function addAt(pos) {
  showNewMarker(pos); toast('Caut ce e acolo…', 'pin_drop', 2000);
  const res = await geoReverse(pos.lat, pos.lng);
  openAdd({ nearby: { anchor: pos, results: res.length ? res : [{ title: 'Punct pe hartă', address: '', lat: pos.lat, lng: pos.lng, cat: 'food' }] } });
  showNewMarker(pos);
}
function showNewMarker(pl) { if (!state.map || pl.lat == null) return; clearNewMarker(); state.newMarker = L.marker([pl.lat, pl.lng], { icon: L.divIcon({ className: '', html: `<div class="pin new">${icon('add', 'i-20')}</div>`, iconSize: [34, 34], iconAnchor: [17, 17] }), zIndexOffset: 2000 }).addTo(state.map); }
function clearNewMarker() { state.newMarker?.remove(); state.newMarker = null; }

// ---------- Radar ----------
const ALERT_COOLDOWN = 3 * 3600 * 1000;
function radarTargets() { const items = []; for (const loc of allLocs()) { if (state.shared.skipped[loc.id]) continue; const p = coordsOf(loc); if (p) items.push({ loc, p, kind: loc.isCustom ? 'custom' : 'plan' }); } ALTERNATIVES.forEach((a, i) => { if (typeof a.lat === 'number') items.push({ loc: altAsLoc(i), p: { lat: a.lat, lng: a.lng, exact: !a.approx }, kind: 'alt' }); }); return items; }
function renderNearby() {
  const list = $('#nearbyList'); if (!list) return;
  if (!state.pos) { list.innerHTML = `<div class="li t-2">${state.radarOn ? 'Caut poziția…' : 'Apasă butonul de localizare de pe hartă.'}</div>`; return; }
  const today = todayKey(); const items = radarTargets().map((it) => ({ ...it, d: distanceM(state.pos, it.p) })).sort((a, b) => (a.kind === 'alt') - (b.kind === 'alt') || a.d - b.d).slice(0, 8);
  list.innerHTML = items.map(({ loc, d, kind }) => `<div class="li" style="gap: 12px"><button data-action="open-detail" data-id="${esc(loc.id)}" class="flex items-center gap-3 flex-1 min-w-0 text-left">${thumbHTML(loc, 48)}<div class="min-w-0"><div class="font-medium truncate">${esc(loc.title)} ${whoHTML(loc.id)}</div><div class="cap truncate">${fmtDist(d)} · ${fmtMin(walkMin(d))} pe jos · ${kind === 'alt' ? 'recomandare' : isPool(loc) ? 'dorit' : DAY_LABEL[loc.day]}${loc.day === today ? ' · <b class="t-blue">azi</b>' : ''}</div></div></button><a href="${esc(mapsNav(loc))}" target="_blank" rel="noopener" class="icon-btn ol press" aria-label="Traseu spre ${esc(loc.title)}">${icon('directions', 'i-20', 'color: var(--blue)')}</a></div>`).join('');
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
function onPosition(p) { state.pos = { lat: p.coords.latitude, lng: p.coords.longitude, acc: p.coords.accuracy }; renderHome(); const s = $('#radarStatus'); if (s) s.innerHTML = `${icon('radar', 'i-16')}<span>Radar activ, ±${Math.round(p.coords.accuracy)} m. Ține apăsat pe hartă ca să adaugi locul de acolo.</span>`; renderNearby(); renderNextStop(); updateMeMarker(); checkProximity(); if (!onPosition._t || Date.now() - onPosition._t > 20000) { onPosition._t = Date.now(); renderDay(); } }
function onPosError(err) { const s = $('#radarStatus'); if (s) s.innerHTML = `${icon('info', 'i-16')}<span>${err.code === 1 ? 'Localizarea e blocată. Permite accesul la locație în setările browserului.' : 'Nu găsesc poziția (GPS slab?). Încerc în continuare…'}</span>`; }
async function startRadar() { if (!navigator.geolocation) return; state.radarOn = true; renderNearby(); if ('Notification' in window && Notification.permission === 'default') { try { await Notification.requestPermission(); } catch {} } if (state.watchId != null) navigator.geolocation.clearWatch(state.watchId); state.watchId = navigator.geolocation.watchPosition(onPosition, onPosError, { enableHighAccuracy: true, maximumAge: 5000, timeout: 20000 }); }
function locate() { startRadar(); if (state.pos && state.map) state.map.setView([state.pos.lat, state.pos.lng], 16); else toast('Caut poziția…', 'my_location'); }

// ---------- Harta ----------
function ensureMap() {
  if (state.map || !window.L || !$('#map')) return;
  const map = L.map('map', { zoomControl: false }).setView([41.39, 2.17], 13);
  const tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; OpenStreetMap' }).addTo(map); let tileFails = 0; tiles.on('tileerror', () => { if (++tileFails === 6) tiles.setUrl('https://tile.openstreetmap.de/{z}/{x}/{y}.png'); });
  map.on('contextmenu', (e) => { if (state.picking) return; buzz(20); addAt({ lat: e.latlng.lat, lng: e.latlng.lng }); });
  state.map = map; setTimeout(() => map.invalidateSize(), 60);
}
function homeMarker() { if (!state.map || state.homeMarker) return; const b = TRIP.base; state.homeMarker = L.marker([b.lat, b.lng], { icon: L.divIcon({ className: '', html: `<div class="pin home">${icon('hotel', 'i-16 ms-fill')}</div>`, iconSize: [28, 28], iconAnchor: [14, 14] }), zIndexOffset: 500 }).addTo(state.map); state.homeMarker.on('click', () => openHome()); }
function updateMeMarker() { if (!state.map || !state.pos) return; const ll = [state.pos.lat, state.pos.lng]; if (!state.meMarker) state.meMarker = L.marker(ll, { icon: L.divIcon({ className: '', html: '<div class="me"></div>', iconSize: [18, 18], iconAnchor: [9, 9] }), zIndexOffset: 1000 }).addTo(state.map); else state.meMarker.setLatLng(ll); }
function renderMap() {
  renderDates(); if (!state.map) return; state.markers.forEach((m) => m.remove()); state.markers = []; const bounds = []; let n = 0; const list = dayItems(state.day);
  const line = list.map(coordsOf).filter(Boolean).map((p) => [p.lat, p.lng]); if (line.length > 1) state.markers.push(L.polyline(line, { color: '#1A73E8', weight: 3, opacity: 0.55, dashArray: '2 8', lineCap: 'round' }).addTo(state.map));
  for (const loc of list) { const p = coordsOf(loc); n++; if (!p) continue; const cls = state.shared.visited[loc.id] ? 'pin done' : loc.isCustom ? 'pin custom' : 'pin'; const m = L.marker([p.lat, p.lng], { icon: L.divIcon({ className: '', html: `<div class="${cls}">${n}</div>`, iconSize: [28, 28], iconAnchor: [14, 14] }) }).addTo(state.map); m.on('click', () => openDetail(loc.id)); state.markers.push(m); bounds.push([p.lat, p.lng]); }
  for (const loc of list) (enriched(loc).variants || []).forEach((v, i) => { if (typeof v.lat !== 'number') return; const m = L.marker([v.lat, v.lng], { icon: L.divIcon({ className: '', html: `<div class="pin custom" style="width:22px;height:22px;font-size:10px">${i + 1}</div>`, iconSize: [22, 22], iconAnchor: [11, 11] }) }).addTo(state.map); m.on('click', () => openDetail(loc.id)); state.markers.push(m); });
  for (const z of DAY_ZONES[state.day] || []) ALTERNATIVES.forEach((a, i) => { if (a.zone !== z || typeof a.lat !== 'number') return; const m = L.marker([a.lat, a.lng], { icon: L.divIcon({ className: '', html: '<div class="pin alt">+</div>', iconSize: [20, 20], iconAnchor: [10, 10] }) }).addTo(state.map); m.on('click', () => openDetail('alt-' + i)); state.markers.push(m); });
  state.custom.filter(isPool).forEach((l) => { const p = coordsOf(l); if (!p) return; const m = L.marker([p.lat, p.lng], { icon: L.divIcon({ className: '', html: `<div class="pin alt" style="color: #E0457B">${icon('bookmark', 'i-16 ms-fill')}</div>`, iconSize: [20, 20], iconAnchor: [10, 10] }) }).addTo(state.map); m.on('click', () => openDetail(l.id)); state.markers.push(m); });
  homeMarker(); updateMeMarker(); if (bounds.length && !state.picking) state.map.fitBounds(bounds, { padding: [80, 40], maxZoom: 15 }); setTimeout(() => state.map.invalidateSize(), 60);
}

// ---------- PWA ----------
function setupPWA() {
  window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); state.installPrompt = e; $('#installBtn')?.classList.remove('hidden'); });
  window.addEventListener('appinstalled', () => { $('#installBtn')?.classList.add('hidden'); closeModals(); toast('Instalată! O găsești pe ecranul principal și în meniul Share.'); });
  const host = location.hostname; if (!('serviceWorker' in navigator) || !(host.endsWith('.web.app') || host.endsWith('.firebaseapp.com') || host === 'localhost' || host === '127.0.0.1')) return;
  let refreshing = false, hadController = !!navigator.serviceWorker.controller;
  navigator.serviceWorker.addEventListener('controllerchange', () => { if (!hadController) { hadController = true; return; } if (refreshing) return; refreshing = true; toast('Versiune nouă. Se reîncarcă…', 'sync'); setTimeout(() => location.reload(), 700); });
  navigator.serviceWorker.register('/sw.js').then((reg) => { reg.update().catch(() => {}); setInterval(() => reg.update().catch(() => {}), 30 * 60000); }).catch((e) => console.warn('SW:', e));
}
async function hardRefresh() {
  toast('Actualizez aplicația…', 'sync', 6000);
  try { const regs = navigator.serviceWorker ? await navigator.serviceWorker.getRegistrations() : []; for (const r of regs) await r.unregister(); const keys = await caches.keys(); await Promise.all(keys.map((k) => caches.delete(k))); } catch (e) { console.warn(e); }
  try { await Promise.all(['/index.html', '/app.js', '/data.js', '/icons.js', '/version.js', '/styles.css', '/sw.js', '/manifest.webmanifest'].map((u) => fetch(u, { cache: 'reload' }).catch(() => null))); } catch {}
  lsSet(LS.img, {}); lsSet(LS.weather, null);
  const u = new URL(location.href); u.searchParams.set('r', Date.now()); location.replace(u.toString());
}
async function installApp() { const p = state.installPrompt; if (!p) return openInstallSheet(); p.prompt(); await p.userChoice; state.installPrompt = null; $('#installBtn')?.classList.add('hidden'); }

// ---------- Micro-interacțiuni ----------
function confetti(x, y, colors = ['#1A73E8', '#EA4335', '#FBBC04', '#34A853', '#E0457B']) { if (matchMedia('(prefers-reduced-motion: reduce)').matches) return; for (let i = 0; i < 16; i++) { const el = document.createElement('i'); el.className = 'confetti'; const a = (Math.PI * 2 * i) / 16 + Math.random() * 0.4, r = 40 + Math.random() * 60; el.style.cssText = `left:${x}px;top:${y}px;background:${colors[i % colors.length]};--dx:${Math.cos(a) * r}px;--dy:${Math.sin(a) * r - 30}px;--rot:${Math.round(Math.random() * 360)}deg`; document.body.appendChild(el); setTimeout(() => el.remove(), 950); } }
let revealObs = null;
function observeReveal() {
  const els = $$('.reveal:not(.in)'); if (!els.length) return;
  if (!('IntersectionObserver' in window)) { els.forEach((e) => e.classList.add('in')); return; }
  revealObs = revealObs || new IntersectionObserver((entries) => entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('in'); revealObs.unobserve(en.target); } }), { rootMargin: '0px 0px -6% 0px', threshold: 0.06 });
  els.forEach((e) => revealObs.observe(e));
}
let lastY = 0; window.addEventListener('scroll', () => { const y = window.scrollY; $('#fab')?.classList.toggle('mini', y > 160 && y > lastY); $('#appbar')?.classList.toggle('scrolled', y > 4); lastY = y; }, { passive: true });

// ---------- Evenimente ----------
document.addEventListener('pointerdown', (e) => { ripple(e); if (e.target.closest('.chip, .date, .nav-btn, .ptoggle, .tab')) buzz(6); });
document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-action]'); if (!el) { if (e.target.matches('[data-modal]')) closeModals(); return; }
  if (el.tagName === 'FORM' || el.tagName === 'LABEL') return;
  const a = el.dataset.action, id = el.dataset.id;
  const actions = {
    'view': () => { closeModals(); setView(el.dataset.view); }, 'day': () => { switchDay(el.dataset.day); if (state.view === 'plan') window.scrollTo({ top: 0, behavior: 'smooth' }); }, 'filter': () => setFilter(el.dataset.cat), 'person': () => { state.person = el.dataset.person; renderUs(); },
    'toggle-theme': toggleTheme, 'close-modal': () => { addState = null; closeModals(); }, 'open-add': () => openAdd(),
    'copy-link': () => copyText($('#shareUrl').value, 'Linkul a fost copiat.'), 'copy-summary': () => copyText(`${SUMMARY_TEXT}\n\n${location.href.split('#')[0].split('?')[0]}`, 'Programul a fost copiat.'),
    'open-detail': () => { if (addState) { addState = null; $('#addSheet').classList.add('hidden'); clearNewMarker(); } $('#coffeeSheet').classList.add('hidden'); openDetail(id); }, 'delete-loc': () => deleteLocation(id), 'edit-loc': () => { const l = state.custom.find((x) => x.id === id); if (l) openAdd({ editing: l }); },
    'toggle-visited': () => toggleVisited(id, el), 'toggle-skip': () => toggleSkip(id), 'pin-here': () => pinHere(id), 'add-photo': () => { homeOpen = false; openPhotoSheet(id); }, 'photo-file': () => { $('#coffeeSheet').classList.add('hidden'); state.photoTarget = id; $('#photoInput').value = ''; $('#photoInput').click(); }, 'photo-remove': () => removePhoto(id),
    'day-route': dayRoute, 'locate': locate, 'open-link': () => window.open(el.dataset.href, '_blank', 'noopener'), 'close-banner': () => $('#radarBanner').classList.add('hidden'), 'install': installApp, 'open-install': openInstallSheet, 'refresh': hardRefresh,
    'open-coffee': openCoffee, 'open-home': openHome, 'copy-address': () => copyText('Carrer de Pellaires 35, 08019 Barcelona', 'Adresa a fost copiată.'), 'coffee-add': coffeeAdd, 'coffee-undo': coffeeUndo, 'open-weather': openWeather,
    'coffee-type': () => { coffeeSel.type = el.dataset.type; $$('#coffeeTypes .chip').forEach((c) => c.classList.toggle('on', c === el)); },
    'coffee-place': () => { coffeeSel.place = el.dataset.place; $$('#coffeePlaces .chip').forEach((c) => c.classList.toggle('on', c === el)); },
    'counter': () => { buzz(); bumpCounter(el.dataset.key, Number(el.dataset.delta)); }, 'bucket-new': () => openBucketEditor(el.dataset.person), 'bucket-edit': () => { const it = bucketOf(el.dataset.person).find((x) => x.id === id); if (it) openBucketEditor(el.dataset.person, it); }, 'bucket-pick': () => bucketPick(el.dataset.loc), 'bucket-toggle': () => { const l = findLoc(id); if (l) bucketToggle(el.dataset.person, l); }, 'bucket-save': bucketSave, 'bucket-delete': bucketDelete, 'bucket-newloc': bucketNewLoc,
    'schedule': () => openSchedule(id), 'sched-day': () => { $$('#schedDays .chip').forEach((c) => c.classList.toggle('on', c === el)); if (el.dataset.time && el.dataset.time !== 'Flexibil') $('#schedTime').value = el.dataset.time; }, 'sched-save': () => scheduleSave(), 'sched-pool': () => scheduleSave('pool'),
    'add-alt': () => addAlternative(Number(el.dataset.index)),
    'add-clear': () => { addState.q = ''; addState.results = []; addState.link = null; renderAdd(); $('#addQ')?.focus(); },
    'add-paste': async () => { try { const t = await navigator.clipboard.readText(); if (t) { $('#addQ').value = t; handleLinkText(t); } else toast('Clipboard-ul e gol.', 'content_paste'); } catch { toast('Nu am acces la clipboard. Lipește în câmpul de căutare.', 'content_paste'); $('#addQ')?.focus(); } },
    'add-pickmap': startPick, 'add-here': addFromHere, 'add-unlink': () => { addState.link = null; renderAdd(); },
    'add-choose': () => { const list = el.dataset.from === 'local' ? addState.local : addState.results; const pl = list[Number(el.dataset.i)]; if (pl) choosePlace(pl); },
    'add-nameonly': () => { const pos = addState.anchor; choosePlace({ title: addState.q.trim() || (pos ? 'Punct pe hartă' : ''), address: '', lat: pos?.lat ?? null, lng: pos?.lng ?? null, cat: osmCat('', '', addState.q) }); setTimeout(() => { const t = $('#addTitle'); if (t && (!addState?.q || pos)) { t.focus(); t.select(); } }, 120); },
    'add-back': () => { syncAddInputs(); addState.step = 'search'; clearNewMarker(); renderAdd(); },
    'add-day': () => { syncAddInputs(); const d = el.dataset.day; addState.day = d; if (el.dataset.time != null) addState.time = el.dataset.time; else if (d === addState.suggestion?.day) addState.time = addState.suggestion.time; else if (addState.time === addState.suggestion?.time) addState.time = ''; renderAdd(); },
    'add-cat': () => { syncAddInputs(); addState.cat = el.dataset.cat; const pl = addState.place; if (pl?.lat != null && !addState.editingId) { const keep = addState.day === addState.suggestion?.day; addState.suggestion = suggestFor(pl, null, addState.cat); if (keep) { addState.day = addState.suggestion.day; addState.time = addState.suggestion.time; } } renderAdd(); }, 'add-person': () => { syncAddInputs(); const p = el.dataset.person; addState.persons = addState.persons.includes(p) ? addState.persons.filter((x) => x !== p) : [...addState.persons, p]; renderAdd(); },
    'add-more': () => { syncAddInputs(); addState.more = !addState.more; renderAdd(); }, 'add-by': () => { syncAddInputs(); addState.by = el.dataset.by; renderAdd(); }, 'add-save': saveAdd,
    'pick-cancel': () => stopPick(), 'pick-confirm': confirmPick,
    'goto-warn': () => { const w = $('[data-warn]'); if (w) { w.scrollIntoView({ behavior: 'smooth', block: 'center' }); w.querySelector('.watch')?.classList.add('flash'); } },
    'choose': () => chooseSkip(el.dataset.skip), 'shift': () => shiftTime(id, el.dataset.time),
  };
  actions[a]?.();
});
document.addEventListener('submit', (e) => {
  if (e.target.dataset.action === 'photo-url') { e.preventDefault(); return savePhotoUrl(e.target.dataset.id, e.target.querySelector('#photoUrl').value); }
  if (e.target.closest('#coffeeBody') && bucketEdit) { e.preventDefault(); bucketSave(); }
});
document.addEventListener('change', async (e) => {
  if (e.target.matches('.bucket-check')) { if (e.target.checked) { buzz(); const r = e.target.getBoundingClientRect(); confetti(r.left + r.width / 2, r.top + r.height / 2); } bucketSet(e.target.dataset.person, e.target.dataset.id, { done: e.target.checked }); }
  if (e.target.id === 'photoInput' && e.target.files?.[0] && state.photoTarget) { try { await savePhoto(state.photoTarget, e.target.files[0]); } catch (err) { console.error(err); toast('Nu am putut salva poza: ' + (err.message || err), 'image'); } }
});
document.addEventListener('input', (e) => { if (e.target.id === 'sharedNotes') onNotesInput(); if (e.target.id === 'bucketSearch') $('#bucketPickList').innerHTML = pickListHTML(e.target.value); if (e.target.id === 'addQ') onAddQuery(e.target.value); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { if (state.picking) stopPick(); addState = null; closeModals(); } if (e.key === 'Enter' && e.target.id === 'addQ') { e.preventDefault(); const first = $('#addBody [data-action="add-choose"]'); if (first) first.click(); } });
document.addEventListener('visibilitychange', () => { if (!document.hidden) { renderDay(); renderNextStop(); loadWeather(); if (state.radarOn) startRadar(); } });

window.__plan = (d) => { const p = planDay(d); return { level: p.level, free: p.free, slots: p.slots.map((x) => `${hhmm(x.start)}-${hhmm(x.end)}${x.auto ? '*' : ''} ${x.loc.title}${x.travel ? ' (+' + x.travel + ')' : ''}`), issues: p.issues.map((i) => `${i.type} ${i.a.loc.title} → ${i.b.loc.title} ${i.late || i.over || ''}`) }; };

// ---------- Start ----------
hydrateIcons(); applyThemeIcon(); { const b = $('#buildStamp'); if (b && window.BUILD) b.textContent = `${window.BUILD.slice(6, 8)}.${window.BUILD.slice(4, 6)} ${window.BUILD.slice(8, 10)}:${window.BUILD.slice(10, 12)}`; }
loadLocal(); renderNotes(); renderWeather(); loadWeather(); setSyncStatus('connecting');
state.day = todayKey() || 'thu'; renderDay(); renderNextStop(); renderHome();
const hasShare = new URL(location.href).searchParams.has('text') || new URL(location.href).searchParams.has('url');
setView(hasShare ? 'plan' : lsGet(LS.view, 'plan'));
setupPWA(); connectFirebase(); handleShareTarget(); maybePromptInstall();
setInterval(renderNextStop, 60000);

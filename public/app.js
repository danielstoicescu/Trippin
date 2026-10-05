// Trippin · Barcelona – Mara (13), Anne & Daniel. Offline-first, mobil, stil Google Flights.
import { TRIP, ZONES, DAY_ZONES, DAY_TIPS, DAY_THEMES, NEAR_HOME, PACK_DEFAULTS, PHRASES, SUN, WEATHER_NOTE, DAY_OPPS, ITINERARY, ALTERNATIVES, CURATED, PEOPLE_META, BUCKET_DEFAULTS, COFFEE_TYPES, MEAL_SLOTS, PHOTOS } from './data.js';
import { ICONS } from './icons.js';

const TRIP_ID = TRIP.id;
const DAYS = ['thu', 'fri', 'sat', 'sun', 'mon'];
const DAY_LABEL = { thu: 'Joi 5', fri: 'Vineri 6', sat: 'Sâmbătă 7', sun: 'Duminică 8', mon: 'Luni 9', pool: 'Dorite' };
const DAY_LONG = { thu: 'Joi, 5 noiembrie', fri: 'Vineri, 6 noiembrie', sat: 'Sâmbătă, 7 noiembrie', sun: 'Duminică, 8 noiembrie', mon: 'Luni, 9 noiembrie' };
const DAY_SHORT = { thu: ['Joi', 5], fri: ['Vin', 6], sat: ['Sâm', 7], sun: ['Dum', 8], mon: ['Lun', 9] };
const DAY_SUB = Object.fromEntries(Object.entries(DAY_THEMES).map(([d, t]) => [d, t.sub]));
const PEOPLE = ['Daniel', 'Mara', 'Anne'];
const PERSONS = ['mara', 'anne', 'daniel'];
const LS = { locations: 'bcn_locations', shared: 'bcn_shared', photos: 'bcn_photos', theme: 'bcn_theme', alerted: 'bcn_alerted', view: 'bcn_view', viewDesk: 'bcn_view_desk', me: 'bcn_me', install: 'bcn_install_seen', weather: 'bcn_weather', img: 'bcn_img2', planMode: 'bcn_planmode' };
// Tabletă, laptop, monitor: bară laterală + Centru de comandă. Pe telefon nu se schimbă nimic.
const DESK = window.matchMedia('(min-width: 768px)'); // tabletă (portret) și mai mare
const isDesk = () => DESK.matches;
const BCN = { lat: 41.3874, lng: 2.1686 };
const SUMMARY_TEXT = `Trippin · Barcelona (Mara 13, Anne & Daniel), 5–9 nov:
• Joi 5 · Ziua adrenalinei: aterizare 8:35 în T2, tren R2 până la Sants, R17, PortAventura (Shambhala, Halloween), Café Saula, cină în Salou
• Vineri 6 · Red Force & apus la mare: Ferrari Land, tren, paella la Els Pescadors, Demasié, Nomad, apus pe plajă, La Cova Fumada, gelato, TK Maxx
• Sâmbătă 7 · Marea zi de shopping: SlowMov, La Pubilla, Subdued, Sephora, Chök, Hollister & Brandy Melville, Satan's, churros, Cereria, Santa Caterina, Bar del Pla, MEMS & The Hands, terasa MNAC, Blai, Bar Marsella
• Duminică 8 · Pe jos, gratis: La Papa, târgul de cărți Sant Antoni, Gaudí pe dinafară, House of Candy, SAISEI, Sagrada, Vietnam House, Three Marks, Ciutadella, MUHBA, Casa Amàlia
• Luni 9 · Comori de final: Nømad, Encants, Museo Alien, Quimet & Quimet, Escribà, MUJI, Nomad, Hofmann; cină la aeroport, zbor la 20:15 din T2`;

const state = {
  view: 'plan', day: 'thu', filter: 'all', person: 'mara',
  custom: [], photos: {},
  shared: { coffeeCount: 0, coffeeLog: [], counters: {}, bucket: {}, quests: {}, visited: {}, pins: {}, skipped: {}, times: {}, days: {}, comments: {}, reactions: {}, booked: {}, expenses: [], packing: {}, packAdd: [], removed: {}, mealPick: {}, votes: {}, budget: {}, notes: '' },
  online: false, radarOn: false, pos: null, watchId: null, alerted: {},
  installPrompt: null, map: null, markers: [], markerById: {}, focusId: null, focusMarker: null, focusHold: null, meMarker: null, homeMarker: null, newMarker: null, detailId: null, photoTarget: null, picking: false,
};
let fb = null;

// ---------- Utilitare ----------
const $ = (s) => document.querySelector(s);
const $$ = (s) => Array.from(document.querySelectorAll(s));
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const GMAPS_SVG = (cls, style) => `<svg class="ic ${cls}" viewBox="0 0 24 24" aria-hidden="true"${style ? ` style="${style}"` : ''}><path d="M12 1.5a8 8 0 0 0-8 8c0 5.6 7 12.6 7.3 12.9a1 1 0 0 0 1.4 0C13 22.1 20 15.1 20 9.5a8 8 0 0 0-8-8z" fill="#EA4335"/><path d="M12 1.5a8 8 0 0 0-8 8c0 1.9.8 3.9 1.9 5.8L12 9.5V1.5z" fill="#4285F4"/><path d="M12 1.5v8l6.1 5.8A13 13 0 0 0 20 9.5a8 8 0 0 0-8-8z" fill="#FBBC04"/><path d="M5.9 15.3 12 9.5l6.1 5.8c-1.6 2.8-4 5.6-5.4 7.1a1 1 0 0 1-1.4 0c-1.4-1.5-3.8-4.3-5.4-7.1z" fill="#34A853"/><circle cx="12" cy="9.5" r="3" fill="#fff"/></svg>`;
const icon = (name, cls = '', style = '') => { if (name === 'gmaps') return GMAPS_SVG(cls, style); const p = ICONS[name] || ICONS.info; return `<svg class="ic ${cls}" data-i="${name}" viewBox="0 -960 960 960" aria-hidden="true"${style ? ` style="${style}"` : ''}>${p.length > 1 ? `<path class="o" d="${p[0]}"/><path class="f" d="${p[1]}"/>` : `<path class="o f" d="${p[0]}"/>`}</svg>`; };
function hydrateIcons(root = document) { root.querySelectorAll('span.material-symbols-rounded').forEach((el) => { const t = document.createElement('template'); t.innerHTML = icon(el.textContent.trim(), el.className.replace('material-symbols-rounded', '').trim(), el.getAttribute('style') || ''); el.replaceWith(t.content.firstChild); }); }
const inCity = (q) => /(barcelona|salou|vila-seca|portaventura)/i.test(q);
const mapsSearch = (q) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q + (inCity(q) ? '' : ' Barcelona'))}`;
const placeQuery = (loc) => loc.placeQuery || (loc.address ? `${loc.title}, ${loc.address}` : loc.title);
// Mutările făcute din aplicație la locurile din program: altă oră (`times`) sau altă zi (`days`)
const withTime = (l) => { const t = state.shared.times?.[l.id], d = state.shared.days?.[l.id]; return t || d ? { ...l, ...(d ? { day: d } : {}), ...(t ? { time: t, movedTime: true } : {}) } : l; };
// Locurile șterse din program (oricare, și cele puse de noi) se pot pune înapoi din „Șterse”
const isRemoved = (id) => !!state.shared.removed?.[id];
const allLocs = () => applyMeals([...ITINERARY.map(withTime), ...state.custom]).filter((l) => !isRemoved(l.id));
// Sloturile de prânz și cină: prima variantă e cea din program; alegerea familiei o înlocuiește, la aceeași oră
const MEAL_LABEL = { lunch: 'Prânzul', dinner: 'Cina' };
const altIndexByTitle = (t) => ALTERNATIVES.findIndex((a) => a.title === t);
function mealOptionLoc(ref) {
  if (String(ref).startsWith('alt:')) { const i = altIndexByTitle(ref.slice(4)); return i >= 0 ? { ...ALTERNATIVES[i], id: 'alt-' + i, isAlt: false, altIndex: i, radius: 150 } : null; }
  const it = ITINERARY.find((l) => l.id === ref); return it ? withTime(it) : state.custom.find((l) => l.id === ref) || null;
}
const optId = (ref) => (String(ref).startsWith('alt:') ? 'alt-' + altIndexByTitle(ref.slice(4)) : ref);
function applyMeals(list) {
  const picks = state.shared.mealPick || {}; let out = list;
  for (const [key, ref] of Object.entries(picks)) {
    const [day, meal] = key.split('-'), opts = MEAL_SLOTS?.[day]?.[meal]; if (!opts || !ref || ref === opts[0] || !opts.includes(ref)) continue;
    const def = out.find((l) => l.id === opts[0]); const opt = mealOptionLoc(ref); if (!def || !opt) continue;
    out = out.filter((l) => l.id !== opt.id).map((l) => (l.id === def.id ? { ...opt, day, time: def.time, meal, mealSlot: key, legIn: undefined, fixed: false } : l));
  }
  return out;
}
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
  const sd = $('#sideSync'); if (sd) sd.dataset.mode = mode; const st = $('#sideSyncText'); if (st) st.textContent = mode === 'online' ? 'Sincronizat live' : mode === 'local' ? 'Salvat doar aici' : 'Se conectează…';
  const row = $('#syncText'); if (row) row.innerHTML = `${icon(mode === 'online' ? 'cloud_done' : mode === 'local' ? 'cloud_off' : 'sync', '', mode === 'online' ? 'color: var(--green)' : 'color: var(--text-2)')}<span class="flex-1 t-2">${esc(text)}</span>`;
}
function sheetHead(eyebrow, title, extra = '') { return `<div class="sheet-top"><div class="handle"></div><div class="flex items-start gap-2 pb-3"><div class="min-w-0 flex-1">${eyebrow ? `<div class="cap">${eyebrow}</div>` : ''}<h2 class="ttl-1 mt-0.5">${title}</h2></div>${extra}<button data-action="close-modal" class="icon-btn press" aria-label="Închide">${icon('close')}</button></div></div>`; }
function openSheet(html) { $('#coffeeBody').innerHTML = html; $('#coffeeSheet').classList.remove('hidden'); $('#coffeeBody').scrollTop = 0; }

// ---------- Vremea (Open-Meteo, fără cheie) ----------
const WMO = (c, day = 1) => c === 0 ? [day ? 'sunny' : 'clear_night', 'senin'] : c <= 2 ? [day ? 'partly_cloudy_day' : 'partly_cloudy_night', 'parțial noros'] : c === 3 ? ['cloud', 'noros'] : c <= 48 ? ['foggy', 'ceață'] : c <= 57 ? ['rainy', 'burniță'] : c <= 67 ? ['rainy', 'ploaie'] : c <= 77 ? ['weather_snowy', 'ninsoare'] : c <= 82 ? ['rainy', 'averse'] : ['thunderstorm', 'furtună'];
let weather = null;
function renderWeather() {
  const el = $('#weather'); if (!el) return;
  if (!weather) el.innerHTML = `${icon('thermostat', 'i-18')}<span class="${navigator.onLine ? 'wx-city' : ''}">${navigator.onLine ? 'Barcelona' : 'fără semnal'}</span>`;
  else { const c = weather.current, [ic] = WMO(c.weather_code, c.is_day); el.innerHTML = `${icon(ic, 'i-20 ms-fill', 'color: var(--star)')}<span class="tabular" style="color: var(--text); font-weight: 500">${Math.round(c.temperature_2m)}°</span><span class="truncate wx-city">Barcelona</span>`; }
  const sw = $('#sideWx'); if (sw) sw.innerHTML = el.innerHTML;
  if (state.view === 'hq') renderHQHero();
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
const photoKey = (loc) => (String(loc.id).startsWith('alt-') ? 'alt:' + loc.title : loc.id);
function stockOf(loc) {
  if (!loc || loc.id === 'home' || (loc.isCustom && (loc.title || '').length < 4)) return null; const c = imgCache[loc.id];
  // întâi poza aleasă cu research (sau cea din date), apoi căutarea automată
  const file = PHOTOS?.[photoKey(loc)] || loc.img?.file;
  if (file && !(c && c.failed)) return { url: COMMONS_FILE(file), page: COMMONS_PAGE(file), credit: 'Wikimedia Commons' };
  if (c && c.url) return c; if (c && c.none && Date.now() - c.at < 7 * 86400000) return null;
  ensureStock(loc); return null;
}
// Pozele potrivite: întâi cele făcute chiar la locul respectiv (geosearch pe Commons), apoi căutarea după nume.
// Fiecare candidată primește un scor: numele locului în titlu, cât de aproape e, mărimea; hărțile, logourile și stemele ies.
const COMMONS_API = 'https://commons.wikimedia.org/w/api.php?format=json&origin=*';
const IMG_BAD = /\b(map|mapa|mapa_|plano|plan|logo|diagram|locator|location map|escut|coat of arms|bandera|flag|icon|signature|firma|poster|cartell|ticket|menu card|screenshot|interior plan)\b/i;
const IMG_STOP = new Set(['barcelona', 'carrer', 'calle', 'plaça', 'placa', 'restaurant', 'restaurante', 'bar', 'cafe', 'coffee', 'the', 'del', 'dels', 'de', 'la', 'les', 'el', 'los', 'las', 'and', 'sau', 'pentru', 'mercat', 'mercado']);
const imgWords = (s) => fold(s).split(/[^a-z0-9]+/).filter((w) => w.length > 2 && !IMG_STOP.has(w));
function scoreImg(c, words) {
  const t = fold(c.title.replace(/^File:/, '').replace(/\.[a-z0-9]+$/i, '')).replace(/[_-]/g, ' ');
  let s = 0; for (const w of words) if (t.includes(w)) s += 3;
  if (IMG_BAD.test(t)) s -= 12; if (c.dist != null) s += Math.max(0, 3 - c.dist / 50); if (c.rank != null) s += Math.max(0, 2 - c.rank * 0.4);
  if (c.w < 600) s -= 2; const ar = c.w / Math.max(1, c.h); if (ar < 0.65 || ar > 2.4) s -= 2;
  return s;
}
const imgQueue = []; let imgActive = 0;
function imgFetch(url) { return new Promise((res) => { imgQueue.push({ url, res }); pumpImg(); }); }
function pumpImg() { while (imgActive < 3 && imgQueue.length) { const { url, res } = imgQueue.shift(); imgActive++; fetch(url).then((r) => r.json()).then(res, () => res(null)).finally(() => { imgActive--; pumpImg(); }); } }
const candCache = new Map(), badImg = new Set();
async function commonsCandidates(loc) {
  if (candCache.has(loc.id)) return candCache.get(loc.id);
  const e = loc.isCustom ? enriched(loc) : loc, p = coordsOf(loc), name = shortTitle(e.title || ''), words = imgWords(name + ' ' + (e.img?.q || ''));
  const q = e.img?.q || e.placeQuery || (loc.isCustom ? `${loc.title} Barcelona` : loc.title);
  const info = (pages, extra) => Object.values(pages || {}).map((pg) => { const ii = pg.imageinfo?.[0]; if (!ii || !/image\/(jpeg|png|webp)/.test(ii.mime || '')) return null; const artist = (ii.extmetadata?.Artist?.value || '').replace(/<[^>]+>/g, '').trim();
    return { title: pg.title, url: ii.thumburl || ii.url, page: ii.descriptionurl, credit: artist ? artist.slice(0, 40) : 'Wikimedia Commons', w: ii.width || 0, h: ii.height || 1, ...extra(pg) }; }).filter(Boolean);
  const II = '&prop=imageinfo&iiprop=url|extmetadata|size|mime&iiurlwidth=1000';
  const near = p ? imgFetch(`${COMMONS_API}&list=geosearch&gscoord=${p.lat}|${p.lng}&gsradius=${Math.min(400, Math.max(60, loc.radius || 120))}&gsnamespace=6&gslimit=25`).then(async (j) => {
    const hits = j?.query?.geosearch || []; if (!hits.length) return []; const dist = Object.fromEntries(hits.map((h) => [h.title, h.dist]));
    const j2 = await imgFetch(`${COMMONS_API}${II}&titles=${encodeURIComponent(hits.slice(0, 25).map((h) => h.title).join('|'))}`); return info(j2?.query?.pages, (pg) => ({ dist: dist[pg.title] ?? null }));
  }) : Promise.resolve([]);
  const text = imgFetch(`${COMMONS_API}${II}&generator=search&gsrsearch=${encodeURIComponent(q + ' filetype:bitmap')}&gsrnamespace=6&gsrlimit=8`).then((j) => info(j?.query?.pages, (pg) => ({ rank: (pg.index || 1) - 1 })));
  const all = [...(await near), ...(await text)], seen = new Set();
  const list = all.filter((c) => !seen.has(c.title) && seen.add(c.title)).map((c) => ({ ...c, score: scoreImg(c, words) })).sort((a, b) => b.score - a.score);
  candCache.set(loc.id, list); return list;
}
async function ensureStock(loc) {
  if (inflight.has(loc.id) || !navigator.onLine) return; inflight.add(loc.id);
  try {
    const best = (await commonsCandidates(loc)).find((c) => !badImg.has(c.url));
    // doar dacă se potrivește cu numele sau e făcută chiar acolo; altfel rămâne iconița categoriei
    if (!best || best.score < 2.5) throw new Error('no good image');
    imgCache[loc.id] = { url: best.url, page: best.page, credit: best.credit };
  } catch { imgCache[loc.id] = { none: true, at: Date.now() }; }
  lsSet(LS.img, imgCache); inflight.delete(loc.id);
  clearTimeout(rerenderTimer); rerenderTimer = setTimeout(() => { renderAll(); refreshDetail(); }, 500);
}
// Alege poza: candidatele de pe Commons, cea aleasă se vede la toți
async function loadPhotoPicks(id) {
  const box = $('#photoPicks'); if (!box) return; const loc = findLoc(id) || rawLoc(id); if (!loc) return;
  if (!navigator.onLine) { box.innerHTML = '<p class="cap">Fără semnal: încercați când reveniți online.</p>'; return; }
  const list = (await commonsCandidates(loc)).filter((c) => c.score > -5).slice(0, 12); if (!$('#photoPicks')) return;
  box.innerHTML = list.length ? `<div class="pick-grid">${list.map((c) => `<button data-action="photo-pick" data-id="${esc(id)}" data-url="${esc(c.url)}" class="pick-img press" title="${esc(c.title.replace(/^File:/, ''))}"><img src="${esc(c.url)}" alt="" loading="lazy">${c.dist != null ? `<span class="pill ink">${Math.round(c.dist)} m</span>` : ''}</button>`).join('')}</div><p class="cap mt-2">Poze cu licență liberă de pe Wikimedia Commons; „m” = făcută la atâția metri de loc.</p>`
    : '<p class="cap">Nu am găsit poze potrivite pe Commons. Puneți una din telefon sau un link.</p>';
}
window.__imgFail = (el, id) => { badImg.add(el.getAttribute('src')); el.remove(); const loc = findLoc(id); if (!loc || imgCache[id]?.failed > 2) return; imgCache[id] = { failed: (imgCache[id]?.failed || 0) + 1 }; lsSet(LS.img, imgCache); ensureStock(loc); };
window.__imgOk = (el) => el.removeAttribute('data-loading');
const photoOf = (id) => state.photos[id]?.data || state.photos[id]?.url || null;
function imgTag(loc, eager = false) {
  const own = photoOf(loc.id); if (own) return `<img src="${esc(own)}" alt="" data-loading onload="__imgOk(this)" ${eager ? '' : 'loading="lazy"'}>`;
  const st = stockOf(loc); return st ? `<img src="${esc(st.url)}" alt="" data-loading onload="__imgOk(this)" onerror="__imgFail(this,'${esc(loc.id)}')" ${eager ? '' : 'loading="lazy"'}>` : '';
}
function photoHTML(loc, { cls = '', overlay = '', eager = false } = {}) { const c = cat(loc.cat); return `<div class="photo ${c.cls} k-${catKey(loc.cat)} ${cls}">${icon(smartIcon(loc), 'i-48')}${imgTag(loc, eager)}${overlay}</div>`; }
function thumbHTML(loc, size = 56) { const c = cat(loc.cat); return `<div class="thumb ${c.cls}" style="width:${size}px;height:${size}px">${icon(smartIcon(loc), size > 48 ? 'i-28' : 'i-22')}${imgTag(loc)}</div>`; }
function ripple(e) { const el = e.target.closest('.press'); if (!el) return; const r = el.getBoundingClientRect(), d = Math.max(r.width, r.height); const s = document.createElement('span'); s.className = 'ripple'; s.style.cssText = `width:${d}px;height:${d}px;left:${e.clientX - r.left - d / 2}px;top:${e.clientY - r.top - d / 2}px`; el.appendChild(s); setTimeout(() => s.remove(), 600); }

// ---------- Timp ----------
function todayKey() { const t = new Date(), iso = `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`; return DAYS.find((d) => TRIP.days[d] === iso) || null; }
function isNow(loc) { if (todayKey() !== loc.day) return false; const r = parseRange(loc.time); if (!r) return false; const m = new Date().getHours() * 60 + new Date().getMinutes(); return m >= r.from - 15 && m <= r.to; }
function countdownText() { const start = new Date(TRIP.days.thu + 'T00:00:00'), end = new Date(TRIP.days.mon + 'T23:59:59'), now = new Date(); const mid = new Date(now); mid.setHours(0, 0, 0, 0); const cal = Math.round((start - mid) / 86400000), days = Math.floor((new Date(TRIP.days.thu + 'T08:35:00') - now) / 86400000); if (now > end) return 'A fost o excursie frumoasă'; if (cal > 1) return `Barcelona · peste ${roN(Math.max(days, 1), 'zi', 'zile')}`; if (cal === 1) return 'Mâine plecăm!'; return 'Suntem în Barcelona'; }

// ---------- Categorii ----------
const CAT = { coffee: { cls: 'c-coffee', icon: 'local_cafe', label: 'Cafea & bere' }, food: { cls: 'c-food', icon: 'restaurant', label: 'Mâncare' }, sweet: { cls: 'c-sweet', icon: 'icecream', label: 'Dulciuri' }, shop: { cls: 'c-shop', icon: 'local_mall', label: 'Shopping' }, fun: { cls: 'c-fun', icon: 'attractions', label: 'Distracție' }, art: { cls: 'c-art', icon: 'palette', label: 'Artă & vederi' } };
const CAT_KEYS = Object.keys(CAT);
const catKey = (c) => (c === 'mara' ? 'fun' : CAT[c] ? c : 'none');
const cat = (c) => CAT[catKey(c)] || { cls: 'c-none', icon: 'place', label: 'Loc' };
const isPool = (loc) => loc.day === 'pool';
// Iconița cea mai potrivită pentru fiecare loc, după ce este de fapt (categoria rămâne în culoare)
const ICON_RULES = [
  [/aterizare|aterizam|landing/, 'flight_land'], [/imbarcare|zborul|flight/, 'flight_takeoff'], [/bagaj|check-out|checkout/, 'luggage'],
  [/\btren\b|train|gara |r17|rodalies/, 'train'], [/ferrari|red force/, 'sports_motorsports'], [/cazare|pellaires|airbnb/, 'hotel'],
  [/supermerc|lidl|mercadona|aldi|caprabo/, 'shopping_cart'], [/sagrada|catedral|basilica/, 'church'],
  [/gaudi|batllo|pedrera|casa vicens|sant pau|modernis/, 'villa'], [/museo alien|alien/, 'science'], [/disseny|design museum/, 'design_services'],
  [/muhba|museu|museum|born ccm|el born/, 'museum'], [/llibre|carti|book/, 'auto_stories'], [/print/, 'print'], [/sephora/, 'spa'], [/cereria|lumanari|candle/, 'candle'],
  [/pho|vietnam|ramen|tutu|banh mi|dumpling/, 'ramen_dining'], [/paella|arros|orez|pescadors|can sole|fisher|nuri/, 'rice_bowl'],
  [/tapas|pintxo|pinchos|blai|bodega|xampanyet|quimet|montadito|vermut|canete|peninsular|tasqueta|calders|bar super|cova fumada|bomba/, 'tapas'],
  [/churr|xurr|dulcinea|xocolat|ciocolat|croissant|hofmann|escriba|pastis|forn|bakery|demasie|cinnamon|cookie/, 'bakery_dining'],
  [/gelat|ice cream|delacrem|gocce|ibense/, 'icecream'], [/matcha|saisei|wagashi/, 'emoji_food_beverage'], [/candy|bombo/, 'cake'],
  [/bar marsella|absint|cocktail/, 'local_bar'], [/plaj|beach|bogatell/, 'beach_access'], [/apus|sunset|mirador|bunkers|terasa/, 'landscape'],
  [/ciutadella|park|parc |arc de triomf/, 'park'], [/encants|mercat|market|boqueria|piata/, 'storefront'],
  [/scarile|montjuic|stairs/, 'landscape'], [/chok|chocolat|donut/, 'bakery_dining'], [/vintage|subdued|hollister|brandy|tk maxx|mems|the hands|zara/, 'checkroom'], [/muji/, 'shopping_bag'],
];
function smartIcon(loc) {
  if (!loc) return 'place'; if (loc.icon) return loc.icon; const c = cat(loc.cat), k = catKey(loc.cat), txt = fold(`${loc.title || ''} ${loc.catLabel || ''}`);
  const fits = { food: ['ramen_dining', 'rice_bowl', 'tapas', 'bakery_dining', 'dinner_dining', 'lunch_dining'], sweet: ['bakery_dining', 'icecream', 'cake', 'emoji_food_beverage'], coffee: ['local_bar', 'emoji_food_beverage'] }[k];
  for (const [re, ic] of ICON_RULES) { if (!re.test(txt)) continue; if (fits && !fits.includes(ic)) continue; return ic; }
  if (k === 'food') return /cina|dinner/.test(txt) ? 'dinner_dining' : /pranz|lunch/.test(txt) ? 'lunch_dining' : c.icon;
  return c.icon;
}
const SOURCE = { instagram: 'Instagram', tiktok: 'TikTok', youtube: 'YouTube', gmaps: 'Google Maps', web: 'Link' };
function dayItems(day, includeSkipped = false) { return allLocs().filter((l) => l.day === day && (includeSkipped || !state.shared.skipped[l.id])).map((l, i) => ({ l, i })).sort((a, b) => startMin(a.l) - startMin(b.l) || a.i - b.i).map((x) => x.l); }

// ---------- Drumul dintre două opriri ----------
function legOf(a, b, day) {
  const pa = a.arrive ? { lat: a.arrive.lat, lng: a.arrive.lng } : coordsOf(a), pb = coordsOf(b); if (!pa || !pb) return null;
  const d = distanceM(pa, pb); if (d < 60) return null;
  const lin = b.legIn || (b.isCustom ? enriched(b).legIn : null); if (lin) return { d, ...lin };
  if (d > 20000) return { d, min: Math.round((d / 1000) * 0.8 + 15), mode: 'transit', icon: 'train', label: 'cu trenul sau mașina' };
  if (day === 'thu' && d > 4000) return { d, min: Math.round((d / 1000) * 1.5 + 6), mode: 'driving', icon: 'directions_car', label: 'cu mașina' };
  if (d > 2200) return { d, min: transitMin(d), mode: 'transit', icon: 'subway', label: 'metrou sau bus' };
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
// Esențialele zilei: prânz, cină, minim 2 cafenele diferite și 2 locuri cu dulciuri
function essentials(slots) {
  const k = (x) => catKey(enriched(x.loc).cat), food = slots.filter((x) => k(x) === 'food' || enriched(x.loc).meal);
  const meal = (x) => enriched(x.loc).meal || (x.start >= 11 * 60 + 45 && x.start < 17 * 60 ? 'lunch' : x.start >= 18 * 60 ? 'dinner' : 'breakfast');
  const coffees = new Set(slots.filter((x) => k(x) === 'coffee' && !enriched(x.loc).notCoffee).map((x) => shortTitle(x.loc.title))), sweets = slots.filter((x) => k(x) === 'sweet').length;
  return { lunch: food.some((x) => meal(x) === 'lunch'), dinner: food.some((x) => meal(x) === 'dinner'), coffee: coffees.size, sweet: sweets };
}
// Cafeaua zilei: ziua începe cu o cafea, prima sau a doua oprire
function morningCoffeeId(slots) { const s = slots.slice(0, 2).find((x) => catKey(enriched(x.loc).cat) === 'coffee'); return s ? s.loc.id : null; }
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
  // Ora de închidere: după ea e problemă; cu mai puțin de 30 min înainte e doar un „atenție”
  const notes = [];
  for (const sl of slots) { const c = enriched(sl.loc).closes?.[day]; if (!c) continue; const [h, m] = c.split(':').map(Number), close = h * 60 + m;
    if (sl.end > close + 5) issues.push({ type: 'late', a: sl, b: sl, close: c }); else if (close - sl.end <= 30) notes.push({ type: 'closing', a: sl, b: sl, close: c, margin: close - sl.end }); }
  const first = slots.length ? slots[0].start : null, last = slots.length ? Math.max(...slots.map((x) => x.end)) : null;
  const busy = slots.reduce((sum, x) => sum + (x.end - x.start), 0) + travel; const free = first != null ? last - first - busy : 0;
  // Galben și când ziua e lungă: multe opriri sau mult mers pe jos, chiar dacă totul încape
  const level = !slots.length ? 'none' : issues.some((i) => i.type !== 'tight' || i.late > 10) ? 'red' : issues.length || free < 30 || slots.length >= 12 || walkT >= 110 ? 'amber' : 'green';
  return { slots, issues, notes, level, free, walkM, walkT, other, first, last, end: dayEndOf(slots), coffeeId: morningCoffeeId(slots), ess: essentials(slots) };
}
const LOAD = { green: ['Zi lejeră', 'var(--green)'], amber: ['Zi plină', '#F29900'], red: ['Prea plină', 'var(--red)'], none: ['Liberă', 'var(--text-3)'] };
function daySummary(day) { const p = planDay(day); return { n: p.slots.length, walkM: p.walkM, walkT: p.walkT, other: p.other, from: p.first, to: p.last, plan: p }; }

// ---------- Plan ----------
function renderDates() {
  const el = $('#dates'); const today = todayKey();
  if (el) el.innerHTML = DAYS.map((d) => { const pl = planDay(d), lv = pl.level; return `<button data-action="day" data-day="${d}" class="date press ${d === state.day ? 'on' : ''} ${d === today ? 'today' : ''}" role="tab" aria-selected="${d === state.day}" aria-label="${DAY_LABEL[d]}, ${esc(DAY_THEMES[d].name)}, ${pl.slots.length} opriri, ${LOAD[lv][0]}"><div class="dn">${DAY_SHORT[d][0]}</div><div class="dd">${DAY_SHORT[d][1]}</div><div class="lights lv-${lv}" title="${LOAD[lv][0]}"><i></i><i></i><i></i></div><div class="dm">${esc(DAY_THEMES[d].short)}</div></button>`; }).join('');
  const db = $('#dayBarIn'); if (db) db.innerHTML = DAYS.map((d) => { const th = DAY_THEMES[d]; return `<button data-action="day" data-day="${d}" class="db-chip press ${d === state.day ? 'on' : ''} ${d === today ? 'today' : ''}" role="tab" aria-selected="${d === state.day}" aria-label="${DAY_LABEL[d]}, ${esc(th.name)}" style="--th: ${th.color}">${icon(th.icon, 'i-16 ms-fill')}<span>${DAY_SHORT[d][0]} <b class="tabular">${DAY_SHORT[d][1]}</b></span></button>`; }).join('');
  const md = $('#mapDays'); if (md) md.innerHTML = DAYS.map((d) => `<button data-action="day" data-day="${d}" class="chip press ${d === state.day ? 'on' : ''}" style="box-shadow: var(--shadow-1); border-color: transparent">${d === state.day ? icon('check', 'i-18') : ''}${DAY_SHORT[d][0]} ${DAY_SHORT[d][1]}</button>`).join('');
}
function essHTML(e) {
  const it = (ok, ic, txt) => `<span class="ess ${ok ? 'ok' : 'miss'}">${icon(ic, 'i-18 ms-fill')}${txt}</span>`;
  return `<div class="ess-row mt-3" aria-label="Esențialele zilei">${it(e.coffee >= 2, 'coffee', (e.coffee >= 2 ? `${e.coffee} cafenele` : `${e.coffee}/2 cafenele`))}${it(e.lunch, 'lunch_dining', 'prânz')}${it(e.dinner, 'restaurant', 'cină')}${it(e.sweet >= 2, 'icecream', (e.sweet >= 2 ? `${e.sweet} dulciuri` : `${e.sweet}/2 dulciuri`))}</div>`;
}
function sunHTML(day) {
  const su = SUN[day]; if (!su) return '';
  const toM = (t) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
  const cells = [['rise', 'Răsărit', su.rise, 'Soarele răsare'], ['gold', 'Lumină aurie', su.gold, 'Soarele coboară sub 6°: lumina caldă, bună de poze'], ['set', 'Apus', su.set, 'Soarele atinge orizontul'], ['dusk', 'Întuneric', su.dusk, 'Sfârșitul crepusculului civil']].filter((c) => c[2]);
  let cur = -1; if (todayKey() === day) { const n = nowMinute(); cells.forEach((c, i) => { if (n >= toM(c[2])) cur = i; }); if (cur === cells.length - 1 && n > toM(cells[cur][2]) + 60) cur = -1; }
  return `<div class="sunbar mt-3" aria-label="Lumina zilei">
    <div class="sb-h">${icon('wb_twilight', 'i-18', 'color: var(--star)')}<span class="flex-1">Lumina zilei</span><span class="sb-t">${icon('thermostat', 'i-16')}${esc(su.temp)}${su.place ? ` · ${esc(su.place)}` : ''}</span></div>
    <div class="sb-grid">${cells.map(([k, l, v, t], i) => `<div class="sb-c sb-${k} ${i === cur ? 'now' : ''}" title="${t}"><span class="k"><i></i>${l}</span><b class="tabular">${v}</b></div>`).join('')}</div>
  </div>`;
}
function renderSummary() {
  const s = daySummary(state.day), el = $('#daySummary'); if (!el) return; const lv = s.plan.level, iss = s.plan.issues;
  el.innerHTML = `<div class="summary">
    <div><div class="v"><b class="num">${s.n}</b> ${s.n === 1 ? 'oprire' : 'opriri'}</div><div class="k"><span class="lvl" style="--lv: ${LOAD[lv][1]}"></span> ${LOAD[lv][0]}</div></div>
    <div><div class="v tabular">${s.walkT ? fmtMin(s.walkT) : '—'}</div><div class="k">pe jos${s.walkM ? ' · ' + fmtDist(s.walkM) : ''}</div></div>
    <div><div class="v tabular">${s.from != null ? hhmm(s.from) : '—'}${s.to ? '–' + hhmm(s.to) : ''}</div><div class="k">${s.other ? `+${fmtMin(s.other)} ${s.plan.slots.some((x) => x.leg?.icon === 'train') ? 'tren' : 'metrou'}` : 'interval'}</div></div>
  </div>
  ${sunHTML(state.day)}
  ${iss.length ? `<button data-action="goto-warn" class="watch-banner press mt-3">${icon('warning', 'i-20 ms-fill')}<span class="flex-1 text-left">${iss.length === 1 ? 'Un loc nu merge cum e acum' : `${iss.length} locuri nu merg cum e acum`}: alegeți ce faceți</span>${icon('chevron_right', 'i-20')}</button>` : ''}
  ${essHTML(s.plan.ess)}
  <button data-action="day-route" class="route-cta press mt-3"><span class="gm">${icon('gmaps', 'i-22')}</span><span class="flex-1 text-left"><b>Traseul zilei în Google Maps</b><span class="block">${s.n} opriri${s.walkT ? ` · ${fmtMin(s.walkT)} pe jos` : ''}</span></span>${icon('chevron_right', 'i-22')}</button>`;
}
function renderFilters() {
  const el = $('#filters'); if (!el) return; const present = new Set(dayItems(state.day, true).map((l) => catKey(enriched(l).cat)));
  const opts = [['all', 'Toate', null], ...CAT_KEYS.filter((k) => present.has(k)).map((k) => [k, CAT[k].label, CAT[k].icon])];
  el.innerHTML = opts.map(([k, label, ic]) => `<button data-action="filter" data-cat="${k}" class="chip press k-${k} ${state.filter === k ? 'on' : ''}">${state.filter === k && k !== 'all' ? icon('check', 'i-18') : ic ? icon(ic, 'i-18') : ''}${label}</button>`).join('');
}
function whoHTML(locId) { const w = whoHas(locId); return w.length ? `<span class="who" title="Pe bucketlist: ${w.map((p) => PEOPLE_META[p].name).join(', ')}">${w.map((p) => `<i class="p-${p}">${PEOPLE_META[p].name[0]}</i>`).join('')}</span>` : ''; }
function stopHTML(loc, slot = null, amCoffee = false) {
  const visited = !!state.shared.visited[loc.id], skipped = !!state.shared.skipped[loc.id], now = isNow(loc), e = enriched(loc), ck = catKey(e.cat), c = cat(e.cat), mealKey = DAYS.includes(loc.day) ? mealSlotOf(loc) : null;
  const r = slot ? { from: slot.start, to: slot.end } : parseRange(loc.time); const p = coordsOf(loc), dist = state.pos && p ? distanceM(state.pos, p) : null;
  const pills = [`<span class="pill ink"><i class="cdot"></i>${esc(loc.catLabel || c.label)}</span>`, now ? '<span class="pill blue">ACUM</span>' : '', e.free ? '<span class="pill green">Gratis</span>' : '', loc.verify ? '<span class="pill amber">verifică orele</span>' : '', slot?.auto ? '<span class="pill ink">oră propusă</span>' : '', needsBooking(bookOf(loc)) && !isBooked(loc.id) ? '<span class="pill amber">de rezervat</span>' : ''].filter(Boolean).join('');
  const overlay = `<span class="corner">${icon(smartIcon(e), 'i-18')}</span><div class="ph-tl">${pills}</div>${whoHas(loc.id).length ? `<div class="ph-bl">${whoHTML(loc.id)}</div>` : ''}`;
  const meta = [e.rating ? `<span><span class="star">★</span> ${Number(e.rating).toFixed(1).replace('.', ',')}${e.ratingCount ? ` <span class="t-3">(${fmtCount(e.ratingCount)})</span>` : ''}</span>` : '', e.price && !e.free ? `<span class="dotsep">${esc(e.price.split('·')[0].split('(')[0].trim())}</span>` : '', slot ? `<span class="dotsep">${fmtMin(slot.end - slot.start)} acolo</span>` : '', dist != null ? `<span class="dotsep t-blue">${fmtDist(dist)} de tine</span>` : '', e.variants?.length ? `<span class="dotsep">${e.variants.length} locații</span>` : '', commentsOf(loc.id).length ? `<span class="dotsep">${icon('forum', 'i-16', 'vertical-align: -3px; color: var(--brand)')} ${commentsOf(loc.id).length}</span>` : '', loc.isCustom ? `<span class="dotsep">de ${esc(loc.addedBy || 'noi')}</span>` : ''].filter(Boolean).join('');
  return `<li class="stop reveal k-${ck} ${amCoffee ? 'am-coffee' : ''} ${mealKey ? 'meal-stop' : ''} ${visited ? 'done' : ''} ${skipped ? 'skipped' : ''}" id="loc-${esc(loc.id)}">
    ${mealKey ? `<div class="meal-flag">${icon(mealKey.endsWith('lunch') ? 'lunch_dining' : 'restaurant', 'i-18 ms-fill')}<b>${MEAL_LABEL[mealKey.split('-')[1]]}</b><span class="cap">${mealRows(mealKey).length > 1 ? `${mealRows(mealKey).length} variante` : ''}</span></div>` : ''}
    ${amCoffee ? `<div class="cup-flag"><span class="steam"><i></i><i></i><i></i></span>${icon('coffee', 'i-18 ms-fill')}<b>Cafeaua zilei</b><span class="cap">${slot ? hhmm(slot.start) : ''}</span></div>` : ''}
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
      ${skipped ? '' : `<div class="feed-social">${feedSocialHTML(loc)}</div>`}
      ${mealKey && !skipped ? mealOptsHTML(mealKey, 3) : ''}
      ${bookOf(loc) && !skipped && bookOf(loc).need !== 'verificare' ? `<button data-action="book" data-id="${esc(loc.id)}" class="btn btn-sm ${isBooked(loc.id) ? 'btn-booked' : needsBooking(bookOf(loc)) ? 'btn-book' : 'btn-outline'} press mt-3">${icon(isBooked(loc.id) ? 'event_available' : 'event', 'i-18')} ${isBooked(loc.id) ? 'Rezervat' : needsBooking(bookOf(loc)) ? (BOOK_NEED[bookOf(loc).need] || BOOK_NEED.recomandat)[0].replace('Rezervare obligatorie', 'Rezervă (obligatoriu)').replace('Rezervare recomandată', 'Rezervă').replace('Doar cu programare', 'Fă programarea').replace('Bilet online', 'Ia biletul') : 'Bilet (opțional)'}</button>` : ''}
      ${amCoffee && !skipped ? `<button data-action="coffee-here" data-place="${esc(loc.title)}" class="btn btn-sm btn-coffee press mt-3">${icon('coffee', 'i-18 ms-fill')} <span class="px">+1</span> espresso aici</button>` : ''}
      ${skipped ? `<button data-action="toggle-skip" data-id="${esc(loc.id)}" class="btn btn-sm btn-outline press mt-2">${icon('undo', 'i-18')} Pune înapoi în program</button>` : ''}
    </div>
  </li>`;
}
function legHTML(a, b, day) {
  const g = legOf(a, b, day); if (!g) return '';
  return `<li class="leg"><div class="tm"></div><div class="rail"><span class="walker">${icon(g.icon, 'i-18')}</span></div><div class="body"><span><b style="color: var(--text); font-weight: 500">${fmtMin(g.min)}</b> ${g.label} · ${fmtDist(g.d * (g.mode === 'walking' ? 1.3 : 1))}</span><a href="${esc(mapsLeg(a, b, g.mode))}" target="_blank" rel="noopener" aria-label="Traseu spre ${esc(shortTitle(b.title || ''))}">Traseu</a></div></li>`;
}
function shortName(l) { const t = shortTitle(l.title); return esc(t.length > 20 ? t.split(' ').slice(0, 2).join(' ') : t); }
function warnHTML(is) {
  const A = is.a.loc, B = is.b.loc;
  if (is.type === 'closing' || is.type === 'late') { const late = is.type === 'late', e = enriched(B), plan = B.id === 'barjoan' ? 'bardelpla' : null;
    return `<li class="warn" ${late ? 'data-warn' : ''}><div class="tm"></div><div class="rail"><span class="warn-ic">${icon(late ? 'warning' : 'schedule', 'i-18 ms-fill')}</span></div><div class="body"><div class="watch ${late ? '' : 'soft'}">
    <div class="font-medium">${late ? `${shortName(B)} se închide la ${is.close}` : `Atenție: ${shortName(B)} închide la ${is.close}`}</div>
    <div class="t-2 mt-1">${late ? `În program ați rămâne până la ${hhmm(is.b.end)}. Mutați-l mai devreme sau alegeți altceva.` : `Plecați de acolo cu ${is.margin} min înainte de închidere: nu întârziați la opririle de dinainte.${e.tips?.find((t) => /^Plan B/i.test(t)) ? ' ' + esc(e.tips.find((t) => /^Plan B/i.test(t))) : ''}`}</div>
    ${plan ? `<div class="flex flex-wrap gap-2 mt-3"><button data-action="open-detail" data-id="${plan}" class="btn btn-sm btn-outline press">${icon('restaurant', 'i-18')} Planul B: Bar del Pla</button></div>` : ''}</div></div></li>`; }
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
  const gaps = gapsOf(state.day, plan); const gapBefore = new Map(gaps.filter((g) => g.b && !g.head).map((g) => [g.b, g])); const tailGap = gaps.find((g) => g.tail); const headGap = gaps.find((g) => g.head);
  const entries = [...plan.slots.map((sl) => ({ t: sl.start, sl })), ...skippedList.map((l) => ({ t: startMin(l), l }))].sort((a, b) => a.t - b.t);
  const seen = new Set(); let html = headGap ? gapHTML(headGap, gaps.indexOf(headGap), plan, seen) : '', prev = null;
  const nowM = todayKey() === state.day ? nowMinute() : null; let nowShown = nowM == null || (entries.length && nowM < entries[0].t - 90);
  const nowLi = () => { nowShown = true; return `<li class="now-li" role="presentation"><span class="nl-t tabular">${hhmm(nowM)}</span><span class="nl-dot" aria-hidden="true"></span><span class="nl-line"><span class="nl-lbl">acum</span></span></li>`; };
  for (const en of entries) {
    if (!nowShown && en.t > nowM && prev) html += nowLi();
    if (en.l) { html += stopHTML(en.l); continue; }
    const sl = en.sl; if (prev) html += legHTML(prev.loc, sl.loc, state.day);
    const g = gapBefore.get(sl); if (g) html += gapHTML(g, gaps.indexOf(g), plan, seen);
    for (const is of [...plan.issues, ...plan.notes].filter((x) => x.b === sl)) html += warnHTML(is);
    html += stopHTML(sl.loc, sl, sl.loc.id === plan.coffeeId); prev = sl;
  }
  if (tailGap) html += gapHTML(tailGap, gaps.indexOf(tailGap), plan, seen);
  if (!nowShown && prev && nowM < plan.last + 120) html += nowLi();
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
  const th = DAY_THEMES[state.day];
  $('#planEyebrow').textContent = `${DAY_LONG[state.day]}${todayKey() === state.day ? ' · azi' : ''}`;
  const cd = $('#planCountdown'); if (cd) cd.textContent = countdownText().replace('Barcelona · ', '');
  $('#planHeadline').innerHTML = `<span class="theme-ic" style="--th: ${th.color}">${icon(th.icon, 'i-24 ms-fill')}</span><span>${esc(th.name)}</span>`; $('#planSub').textContent = th.sub;
  { const all = DAYS.flatMap((d) => dayItems(d)); const done = all.filter((l) => state.shared.visited[l.id]).length; const tp = $('#tripProgress'); if (tp) tp.innerHTML = done ? `<div class="trip-prog"><div class="tp-bar"><i style="width:${Math.round(done / all.length * 100)}%"></i></div><span class="cap">${done}/${all.length} locuri bifate în tot tripul</span></div>` : ''; }
  renderDates(); renderSummary(); renderFilters();
  const list = dayItems(state.day, true).filter((l) => state.filter === 'all' || catKey(enriched(l).cat) === state.filter);
  $('#dayTip').innerHTML = DAY_TIPS[state.day] && state.filter === 'all' ? `<button data-action="tip-toggle" class="day-tip card-flat press ${state.tipOpen ? 'open' : ''}" aria-expanded="${!!state.tipOpen}">${icon('lightbulb', 'i-20', 'color: var(--amber)')}<span class="t-2 text-left flex-1">${esc(DAY_TIPS[state.day])}</span>${icon(state.tipOpen ? 'expand_less' : 'expand_more', 'i-20 t-3')}</button>` : '';
  const cal = planMode() === 'cal' && state.filter === 'all';
  const toggle = `<div class="plan-tools mt-4"><div class="seg" role="tablist" aria-label="Cum arată ziua">
    <button data-action="plan-mode" data-mode="list" class="seg-b press ${cal ? '' : 'on'}" role="tab" aria-selected="${!cal}">${icon('view_agenda', 'i-18')} Listă</button>
    <button data-action="plan-mode" data-mode="cal" class="seg-b press ${cal ? 'on' : ''}" role="tab" aria-selected="${cal}">${icon('calendar_view_day', 'i-18')} Calendar</button>
  </div><button data-action="here-open" class="btn btn-sm btn-tonal press here-cta">${icon('near_me', 'i-18')} Suntem aici acum</button></div>`;
  c.innerHTML = toggle + (list.length ? (cal ? (calHTML(state.day) || timelineHTML(list)) : timelineHTML(list)) : `<div class="card-flat p-6 text-center t-2">Nimic pentru filtrul ales.<br><button data-action="open-add" class="btn btn-text press mt-2">Adaugă un loc</button></div>`);
  $('#opps').innerHTML = state.filter === 'all' ? oppsHTML(state.day) : '';
  renderPool(); renderZones(); observeReveal();
}
function renderPool() {
  const el = $('#pool'); if (!el) return; const pool = allLocs().filter((l) => isPool(l)); if (!pool.length) { el.innerHTML = removedHTML(); return; }
  const sug = (l) => { const e = enriched(l); return suggestFor(coordsOf(l), l.id, e.cat, e.closed || []); };
  el.innerHTML = `<div class="sec"><div class="sec-h"><h2 class="ttl-2">Locuri dorite</h2><span class="cap">încă fără zi</span></div><div class="card list">${pool.map((l) => { const s = sug(l); return `<div class="li" id="loc-${esc(l.id)}"><button data-action="open-detail" data-id="${esc(l.id)}" class="flex items-center gap-3 flex-1 min-w-0 text-left">${thumbHTML(l, 48)}<div class="min-w-0"><div class="font-medium truncate">${esc(l.title)} ${whoHTML(l.id)}</div><div class="cap truncate">${l.poolNote ? esc(l.poolNote) : s.day !== 'pool' ? `Potrivit ${DAY_LABEL[s.day]}, lângă ${esc(shortTitle(s.afterTitle))}` : esc(cat(l.cat).label)}</div></div></button><button data-action="schedule" data-id="${esc(l.id)}" class="btn btn-sm btn-tonal press">${s.day !== 'pool' ? DAY_SHORT[s.day][0] + ' ' + DAY_SHORT[s.day][1] : 'Pune în zi'}</button></div>`; }).join('')}</div></div>${removedHTML()}`;
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
      ? `<a href="${esc(mapsLeg(pt.from, pt.to, 'transit'))}" target="_blank" rel="noopener" class="li press">${icon('subway', '', 'color: var(--amber)')}<div class="flex-1 min-w-0"><div class="font-medium">Metrou sau bus · ~${fmtMin(pt.g.min)}</div><div class="cap truncate">${esc(shortTitle(pt.from.title))} → ${esc(shortTitle(pt.to.title))}</div></div>${icon('gmaps', 'i-22')}</a>`
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
  const hero = `<div class="relative" style="margin: 0 -16px">${photoHTML(loc, { cls: 'hero-photo', eager: true, overlay: `<div class="ph-bl">${credit}</div><div class="ph-br"><button data-action="add-photo" data-id="${esc(id)}" class="pill ink press" style="height: 30px; padding: 0 10px">${icon('image_search', 'i-16')} Altă poză</button></div>` })}<div class="handle absolute" style="top: 2px; left: 50%; margin-left: -16px; background: rgba(255,255,255,.85)"></div><button data-action="close-modal" class="icon-btn solid press absolute" style="top: 12px; right: 12px" aria-label="Închide">${icon('close')}</button></div>`;
  const metaLine = [loc.rating ? `<span><b style="font-weight: 500; color: var(--text)">${Number(loc.rating).toFixed(1).replace('.', ',')}</b> <span class="star">${'★'.repeat(Math.round(loc.rating))}</span>${loc.ratingCount ? ` (${fmtCount(loc.ratingCount)})` : ''}</span>` : '', `<span>${esc(loc.catLabel || c.label)}</span>`, loc.price && !loc.free ? `<span>${esc(loc.price.split('·')[0].split('(')[0].trim())}</span>` : '', loc.free ? '<span class="t-green">Gratis</span>' : ''].filter(Boolean).join('<span class="t-3">·</span>');
  const when = isPool(loc) ? 'Loc dorit, încă fără zi' : loc.isAlt ? 'Recomandare, nu e în program' : `${DAY_LABEL[loc.day]}${loc.time ? ' · ' + loc.time : ''}`;
  const actions = loc.isAlt
    ? `<button data-action="add-alt" data-index="${loc.altIndex}" class="act primary press">${icon('add', 'i-20')} Pune în program</button>${coordsOf(loc) ? `<button data-action="show-on-map" data-id="${esc(id)}" class="act press">${icon('map', 'i-20')} Pe hartă</button>` : ''}<a href="${esc(mapsNav(loc))}" target="_blank" rel="noopener" class="act press">${icon('directions', 'i-20')} Traseu</a>`
    : `<a href="${esc(mapsNav(loc))}" target="_blank" rel="noopener" class="act primary press">${icon('directions', 'i-20')} Traseu</a>
       ${coordsOf(loc) ? `<button data-action="show-on-map" data-id="${esc(id)}" class="act press">${icon('map', 'i-20')} Pe hartă</button>` : ''}
       ${bookOf(loc) && bookOf(loc).need !== 'verificare' ? `<button data-action="book" data-id="${esc(id)}" class="act press ${isBooked(id) ? 'on' : ''}">${icon(isBooked(id) ? 'event_available' : 'event', 'i-20')} ${isBooked(id) ? 'Rezervat' : 'Rezervă'}</button>` : ''}
       <button data-action="toggle-visited" data-id="${esc(id)}" class="act press ${visited ? 'on' : ''}">${icon(visited ? 'check_circle' : 'check', 'i-20')} ${visited ? 'Am fost' : 'Am fost aici'}</button>
       ${loc.isCustom ? `<button data-action="schedule" data-id="${esc(id)}" class="act press">${icon('edit_calendar', 'i-20')} ${isPool(loc) ? 'Pune în zi' : 'Mută'}</button><button data-action="edit-loc" data-id="${esc(id)}" class="act press">${icon('edit', 'i-20')} Editează</button>` : loc.fixed ? '' : `${isPool(loc) || id.startsWith('alt-') ? '' : `<button data-action="toggle-skip" data-id="${esc(id)}" class="act press">${icon(skipped ? 'undo' : 'skip_next', 'i-20')} ${skipped ? 'Pune înapoi' : 'Sari peste'}</button>`}${id.startsWith('alt-') ? '' : `<button data-action="schedule" data-id="${esc(id)}" class="act press">${icon('edit_calendar', 'i-20')} ${isPool(loc) ? 'Pune în zi' : 'Mută'}</button>`}`}
       ${DAYS.includes(loc.day) && id !== 'home' ? `<button data-action="add-expense" data-loc="${esc(id)}" class="act press">${icon('payments', 'i-20')} Cheltuială</button>` : ''}
       <button data-action="add-photo" data-id="${esc(id)}" class="act press">${icon('add_a_photo', 'i-20')} Poză</button>
       ${state.pos ? `<button data-action="pin-here" data-id="${esc(id)}" class="act press">${icon('push_pin', 'i-20')} Fixează aici</button>` : ''}
       ${id === 'home' ? '' : `<button data-action="remove-loc" data-id="${esc(id)}" class="act act-del press">${icon('delete', 'i-20')} Șterge</button>`}`;
  const row = (ic, body, href, trail = '') => href ? `<a href="${esc(href)}" target="_blank" rel="noopener" class="li press">${icon(ic, '', 'color: var(--text-2)')}<div class="flex-1 min-w-0">${body}</div>${trail || icon('chevron_right', 't-3 i-20')}</a>` : `<div class="li">${icon(ic, '', 'color: var(--text-2)')}<div class="flex-1 min-w-0">${body}</div></div>`;
  const info = [loc.hours ? row('schedule', esc(loc.hours)) : '', loc.price ? row('euro', esc(loc.price)) : '', (!loc.isAlt && id !== 'home' && DAYS.includes(loc.day)) ? `<button data-action="bud-item" data-id="${esc(id)}" class="li press text-left w-full">${icon('payments', '', 'color: var(--text-2)')}<div class="flex-1 min-w-0"><div>Buget ${itemBudget(loc) ? eur(itemBudget(loc)) : '—'}${sumOf(expenses().filter((x) => x.loc === id)) ? ` · cheltuit ${eur(sumOf(expenses().filter((x) => x.loc === id)))}` : ''}</div><div class="cap">${loc.budget ? esc(loc.budget) + ' · ' : ''}atinge ca să schimbi bugetul sau să adaugi o cheltuială</div></div>${icon('chevron_right', 't-3 i-20')}</button>` : loc.budget ? row('payments', `${esc(loc.budget)}<div class="cap">buget estimat pentru trei</div>`) : '', loc.address ? row('location_on', `${esc(loc.address)}${p && !p.exact ? '<div class="cap">poziție aproximativă · „Fixează aici” o corectează</div>' : ''}`, mapsSearch(placeQuery(loc)), icon('gmaps', 'i-20')) : '', loc.link ? row('link', `<span class="t-blue">Deschide ${esc(SOURCE[loc.source] || 'linkul')}</span>`, loc.link, icon('open_in_new', 't-3 i-20')) : ''].filter(Boolean).join('');
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
    ${loc.isAlt && !loc.pick ? '' : `<div class="react-card mt-4"><div class="cap mb-2">Cum vi se pare?</div>${reactionRowHTML(id, true)}</div>`}
    ${mealSlotOf(loc) && DAYS.includes(loc.day) ? `<div class="mt-4">${mealOptsHTML(mealSlotOf(loc))}</div>` : ''}
    ${recLineHTML(loc) ? `<div class="rec-line rec-big mt-4">${icon('lightbulb', 'i-18 ms-fill', 'color: var(--star)')}<span><b>${recOf(loc).verb}:</b> ${esc(recOf(loc).rec)}</span></div>` : ''}
    ${loc.desc || loc.note ? `<p class="mt-5" style="font-size: 15px; line-height: 23px">${esc(loc.desc || loc.note)}</p>` : ''}
    ${info ? `<div class="card list mt-5">${info}</div>` : ''}
    ${variants}${loc.isAlt ? '' : persons}${loc.isAlt && !loc.pick ? '' : commentsHTML(id)}${review}${popular}${tips}${links}<div style="height:16px"></div>`;
}
// ---------- Rezervări: site, telefon, e-mail sau pagina din Google Maps ----------
const BOOK_NEED = { obligatoriu: ['Rezervare obligatorie', 'red'], recomandat: ['Rezervare recomandată', 'amber'], programare: ['Doar cu programare', 'red'], bilet: ['Bilet online', 'amber'], opțional: ['Bilet opțional', 'ink'], verificare: ['Sunați înainte', 'ink'] };
const bookOf = (loc) => enriched(loc).book || null;
const isBooked = (id) => !!state.shared.booked?.[id];
const needsBooking = (b) => b && !['opțional', 'verificare'].includes(b.need);
const ES_DAY = { thu: 'el jueves 5 de noviembre', fri: 'el viernes 6 de noviembre', sat: 'el sábado 7 de noviembre', sun: 'el domingo 8 de noviembre', mon: 'el lunes 9 de noviembre' };
function bookWhen(loc) { if (!DAYS.includes(loc.day)) return null; const sl = planDay(loc.day).slots.find((x) => x.loc.id === loc.id); const r = sl ? { from: sl.start } : parseRange(loc.time); return { day: loc.day, time: r ? hhmm(Math.floor(r.from / 15) * 15) : null }; } // ora de rezervare: la sfert de oră
function bookMessage(loc) {
  const w = bookWhen(loc), b = bookOf(loc) || {}, who = me();
  const what = b.need === 'programare' ? 'una visita' : 'una mesa';
  return w ? `¡Hola! Quisiera reservar ${what} para 3 personas (2 adultos y una niña de 13 años) ${ES_DAY[w.day]}${w.time ? ` a las ${w.time}` : ''}. A nombre de ${who}. ¡Muchas gracias!` : `¡Hola! ¿Tendrían ${what} para 3 personas (2 adultos y una niña de 13 años) entre el 6 y el 9 de noviembre? A nombre de ${who}. ¡Muchas gracias!`;
}
function bookSheetHTML(loc) {
  const b = bookOf(loc), e = enriched(loc), w = bookWhen(loc), done = isBooked(loc.id), [needTxt, needCls] = BOOK_NEED[b.need] || BOOK_NEED.recomandat, msg = bookMessage(loc);
  const host = (u) => { try { return new URL(u).hostname.replace(/^www\./, ''); } catch { return 'site'; } };
  const row = (ic, title, sub, href, cls = '') => `<a href="${esc(href)}" ${href.startsWith('http') ? 'target="_blank" rel="noopener"' : ''} class="li press ${cls}">${icon(ic, 'i-22', 'color: var(--blue)')}<div class="flex-1 min-w-0"><div class="font-medium">${title}</div><div class="cap truncate">${esc(sub)}</div></div>${icon('chevron_right', 't-3 i-20')}</a>`;
  return `${sheetHead('Rezervare', esc(loc.title))}
    <div class="flex flex-wrap items-center gap-2 mb-3"><span class="pill ${needCls}">${needTxt}</span>${w ? `<span class="pill ink">${DAY_LABEL[w.day]}${w.time ? ' · ' + w.time : ''} · 3 pers.</span>` : ''}${done ? `<span class="pill green">${icon('check', 'i-16')} Rezervat</span>` : ''}</div>
    ${b.note ? `<p class="t-2 mb-3">${esc(b.note)}</p>` : ''}
    <div class="card list">
      ${b.url ? row('language', 'Rezervă online', host(b.url), b.url) : ''}
      ${b.tel ? row('call', 'Sună', b.tel.replace(/^\+34/, '+34 ').replace(/(\d{3})(\d{2})(\d{2})(\d{2})$/, '$1 $2 $3 $4'), 'tel:' + b.tel) : ''}
      ${b.mail ? row('mail', 'Trimite e-mail', b.mail, `mailto:${b.mail}?subject=${encodeURIComponent('Reserva · ' + (w ? ES_DAY[w.day].replace('el ', '') : 'noviembre') + ' · 3 personas')}&body=${encodeURIComponent(msg)}`) : ''}
      ${row('gmaps', 'Pagina din Google Maps', 'program, telefon și butonul „Rezervă” când există', mapsSearch(placeQuery(e)))}
    </div>
    <h3 class="ttl-3 mt-5 mb-2">Mesajul, în spaniolă</h3>
    <div class="bubble-es">${esc(msg)}</div>
    <div class="flex gap-2 mt-3"><button data-action="book-copy" data-id="${esc(loc.id)}" class="btn btn-outline press flex-1">${icon('content_paste', 'i-18')} Copiază mesajul</button>
    <button data-action="book-done" data-id="${esc(loc.id)}" class="btn ${done ? 'btn-tonal' : 'btn-primary'} press flex-1">${icon(done ? 'undo' : 'check', 'i-18')} ${done ? 'Anulează' : 'Am rezervat'}</button></div>
    <div style="height:12px"></div>`;
}
let bookId = null;
function openBook(id) { const loc = findLoc(id); if (!loc || !bookOf(loc)) return; bookId = id; openSheet(bookSheetHTML(loc)); }
async function bookToggle(id) {
  const loc = findLoc(id); const on = !isBooked(id); const booked = { ...(state.shared.booked || {}), [id]: on ? { by: me(), at: Date.now() } : false };
  state.shared.booked = booked; buzz(on ? 14 : 8); if (on) toast(`Rezervat: ${shortTitle(loc?.title || '')}`, 'event_available', 3500);
  renderAll(); refreshDetail(); if (bookId === id && !$('#coffeeSheet').classList.contains('hidden')) openBook(id);
  await saveShared({ booked: { [id]: booked[id] } });
}
function bookingItems() {
  const items = [...allLocs().filter((l) => DAYS.includes(l.day) && !state.shared.skipped[l.id]), ...ALTERNATIVES.map((a, i) => altAsLoc(i)).filter((l) => isBooked(l.id))].filter((l) => needsBooking(bookOf(l)) || isBooked(l.id));
  return items.sort((a, b) => dayOrder(a) - dayOrder(b) || startMin(a) - startMin(b));
}
function bookingsHTML() {
  const items = bookingItems();
  if (!items.length) return '';
  const done = items.filter((l) => isBooked(l.id)).length;
  return `<div class="sec"><div class="sec-h"><h2 class="ttl-2">Rezervări</h2><span class="cap">${done} din ${items.length} făcute</span></div><div class="card list">${items.map((l) => { const b = bookOf(l), ok = isBooked(l.id), w = bookWhen(l); return `<button data-action="book" data-id="${esc(l.id)}" class="li press">${icon(ok ? 'event_available' : 'event', 'i-22 ' + (ok ? 'ms-fill' : ''), `color: var(--${ok ? 'green' : 'amber'})`)}<div class="flex-1 min-w-0 text-left"><div class="font-medium truncate">${esc(b?.label || shortTitle(l.title))}</div><div class="cap truncate">${w ? `${DAY_LABEL[w.day]}${w.time ? ' · ' + w.time : ''}` : 'recomandare'} · ${ok ? 'rezervat ✓' : (BOOK_NEED[b?.need] || BOOK_NEED.recomandat)[0].toLowerCase()}</div></div>${icon('chevron_right', 't-3 i-20')}</button>`; }).join('')}</div></div>`;
}
// ---------- În jurul cazării: supermarket, farmacie, apă non-stop… ----------
function nearHomeHTML() {
  if (!NEAR_HOME?.length) return ''; const b = coordsOf(baseLoc());
  const groups = [...new Set(NEAR_HOME.map((x) => x.group))];
  return `<div class="sec"><div class="sec-h"><h2 class="ttl-2">În jurul cazării</h2><span class="cap">minute pe jos de Pellaires 35</span></div>
    ${groups.map((g) => `<h3 class="ttl-3 mt-4 mb-2">${esc(g)}</h3><div class="card list">${NEAR_HOME.filter((x) => x.group === g).map((x) => { const d = b && typeof x.lat === 'number' ? distanceM(b, x) : null; const href = x.tel ? `tel:${x.tel}` : typeof x.lat === 'number' ? `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(TRIP.base.address)}&destination=${x.lat},${x.lng}&travelmode=walking` : mapsSearch(x.q || x.title);
      return `<a href="${esc(href)}" ${x.tel ? '' : 'target="_blank" rel="noopener"'} class="li press">${icon(x.icon, 'i-22', `color: ${x.color || 'var(--blue)'}`)}<div class="flex-1 min-w-0"><div class="font-medium">${esc(x.title)}</div><div class="cap">${esc([x.address, x.hours].filter(Boolean).join(' · '))}</div>${x.note ? `<div class="cap" style="color: var(--text)">${esc(x.note)}</div>` : ''}</div>${d != null ? `<span class="pill ink" style="flex-shrink:0">${fmtMin(walkMin(d))}</span>` : icon('chevron_right', 't-3 i-20')}</a>`; }).join('')}</div>`).join('')}</div>`;
}
function renderBookings() { const el = $('#bookings'); if (el) el.innerHTML = bookingsHTML(); const nh = $('#nearHome'); if (nh && !nh.dataset.done) { nh.innerHTML = nearHomeHTML(); nh.dataset.done = '1'; } }

// ---------- Buget: plan editabil (total, pe zile, pe activități), cheltuieli cu categorii, rapoarte ----------
const eur = (n) => `${Math.round(n)} €`;
const eur2 = (n) => `${(Math.round((+n || 0) * 100) / 100).toLocaleString('ro-RO', { maximumFractionDigits: 2 })} €`;
const EXP_CATS = [
  { k: 'food', label: 'Mâncare', icon: 'restaurant', color: '#1E8E3E' },
  { k: 'coffee', label: 'Cafea & dulciuri', icon: 'coffee', color: '#B06000' },
  { k: 'transport', label: 'Transport', icon: 'directions_subway', color: '#1A73E8' },
  { k: 'tickets', label: 'Bilete & intrări', icon: 'confirmation_number', color: '#8430CE' },
  { k: 'shop', label: 'Cumpărături', icon: 'shopping_bag', color: '#C5157A' },
  { k: 'stay', label: 'Cazare & bagaje', icon: 'hotel', color: '#5F6368' },
  { k: 'other', label: 'Altele', icon: 'more_horiz', color: '#80868B' },
];
const expCat = (k) => EXP_CATS.find((c) => c.k === k) || EXP_CATS[EXP_CATS.length - 1];
const EXP_DAYS = ['pre', ...DAYS];
const expDayLabel = (d) => (d === 'pre' ? 'Înainte de plecare' : DAY_LABEL[d] || '—');
const expDayShort = (d) => (d === 'pre' ? 'Înainte' : DAY_SHORT[d] ? `${DAY_SHORT[d][0]} ${DAY_SHORT[d][1]}` : '—');
function guessExpCat(label = '', loc = null) {
  if (loc) return { food: 'food', coffee: 'coffee', sweet: 'coffee', shop: 'shop', fun: 'tickets', art: 'tickets' }[catKey(enriched(loc).cat)] || 'other';
  const t = fold(label);
  if (/metro|tren|taxi|bus|t-casual|aerob|rodalies|cabify|uber|freenow/.test(t)) return 'transport';
  if (/bilet|intrar|portaventura|ferrari|muze|ticket/.test(t)) return 'tickets';
  if (/pranz|cina|tapas|paella|restaurant|meniu|pizza|mic-dejun|bocadillo|pinchos/.test(t)) return 'food';
  if (/cafea|espresso|cortado|churros|gelato|dulc|inghetat|ciocolat|matcha|cinnamon/.test(t)) return 'coffee';
  if (/magazin|haine|suvenir|sephora|tk maxx|cumpar|supermarket|mercadona|lidl/.test(t)) return 'shop';
  if (/cazare|airbnb|hotel|bagaj|dulap/.test(t)) return 'stay';
  return 'other';
}
const expenses = () => (Array.isArray(state.shared.expenses) ? state.shared.expenses : []);
const expCatOf = (e) => e.cat || guessExpCat(e.label, e.loc ? findLoc(e.loc) : null);
const sumOf = (list) => list.reduce((s, e) => s + (+e.amount || 0), 0);
const bplan = () => (state.shared.budget && typeof state.shared.budget === 'object' ? state.shared.budget : {});
const num0 = (v) => { const n = parseFloat(String(v ?? '').replace(',', '.')); return Number.isFinite(n) && n >= 0 ? Math.round(n * 100) / 100 : null; };
function estBudget(loc) { // estimare grosieră pentru trei, din textul budget/price
  const b = enriched(loc).budget || enriched(loc).price || ''; if (!b) return 0;
  const m = [...b.matchAll(/(\d+)(?:\s*[–-]\s*(\d+))?\s*€/g)]; if (!m.length) return 0;
  const lo = +m[0][1], hi = m[0][2] ? +m[0][2] : lo; let v = (lo + hi) / 2;
  if (/\/\s*pers/i.test(b)) v *= 3; return v;
}
function itemBudget(loc) { const v = bplan().items?.[loc.id]; return typeof v === 'number' ? v : estBudget(loc); }
function dayEstimate(day) { return dayItems(day).filter((l) => !state.shared.skipped[l.id]).reduce((s, l) => s + itemBudget(l), 0); }
function dayBudget(day) { const v = bplan().days?.[day]; return typeof v === 'number' ? v : dayEstimate(day); }
const daysTotal = () => DAYS.reduce((s, d) => s + dayBudget(d), 0);
const tripEstimate = () => { const v = bplan().total; return typeof v === 'number' ? v : daysTotal(); };
const spentTotal = () => sumOf(expenses());
const bar = (v, max, cls = '') => `<span class="bud-track ${cls}"><i style="width:${max ? Math.min(100, (v / max) * 100) : 0}%"></i></span>`;
function budReportHTML(tab) {
  const ex = expenses(), f = state.budFilter || {};
  if (tab === 'cat') {
    const rows = EXP_CATS.map((c) => ({ c, v: sumOf(ex.filter((e) => expCatOf(e) === c.k)) })).filter((r) => r.v > 0).sort((a, b) => b.v - a.v), tot = sumOf(ex);
    return rows.length ? `<div class="bud-rows">${rows.map(({ c, v }) => `<button data-action="bud-filter" data-cat="${c.k}" class="bud-row press ${f.cat === c.k ? 'on' : ''}" style="--ec:${c.color}"><span class="bud-ic">${icon(c.icon, 'i-18')}</span><span class="bud-l"><b>${c.label}</b>${bar(v, tot)}</span><span class="bud-v"><b>${eur(v)}</b><span>${Math.round((v / tot) * 100)}%</span></span></button>`).join('')}</div>` : '<p class="cap bud-empty">Categoriile apar după prima cheltuială.</p>';
  }
  if (tab === 'act') {
    const locs = DAYS.flatMap((d) => dayItems(d)).map((l) => ({ l, b: itemBudget(l), v: sumOf(ex.filter((e) => e.loc === l.id)) })).filter((r) => r.b > 0 || r.v > 0).sort((a, b) => b.v - a.v || b.b - a.b);
    return locs.length ? `<div class="bud-rows">${locs.slice(0, state.budAll ? 99 : 10).map(({ l, b, v }) => `<button data-action="bud-item" data-id="${esc(l.id)}" class="bud-row press" style="--ec:${expCat(guessExpCat('', l)).color}"><span class="bud-ic">${icon(smartIcon(enriched(l)), 'i-18')}</span><span class="bud-l"><b>${esc(shortTitle(l.title))}</b><span class="cap">${DAY_SHORT[l.day] ? DAY_SHORT[l.day].join(' ') : ''} · buget ${b ? eur(b) : '—'}${typeof bplan().items?.[l.id] === 'number' ? ' (setat)' : ''}</span>${bar(v, Math.max(v, b), v > b && b ? 'over' : '')}</span><span class="bud-v"><b>${v ? eur(v) : '—'}</b>${icon('edit', 'i-16 t-3')}</span></button>`).join('')}</div>${locs.length > 10 && !state.budAll ? `<button data-action="bud-all" class="btn btn-text btn-sm press mt-1">Toate cele ${locs.length} activități</button>` : ''}` : '<p class="cap bud-empty">Nicio activitate cu buget încă.</p>';
  }
  if (tab === 'who') {
    const tot = sumOf(ex), rows = PERSONS.map((p) => ({ p, v: sumOf(ex.filter((e) => e.by === PEOPLE_META[p].name)) }));
    return `<div class="bud-rows">${rows.map(({ p, v }) => `<div class="bud-row"><span class="avatar p-${p}" style="width:32px;height:32px;font-size:13px">${PEOPLE_META[p].name[0]}</span><span class="bud-l"><b>${PEOPLE_META[p].name}</b>${bar(v, tot)}</span><span class="bud-v"><b>${eur(v)}</b><span>${tot ? Math.round((v / tot) * 100) : 0}%</span></span></div>`).join('')}</div><p class="cap mt-2">Pe persoană (împărțit la trei): ≈ ${eur(tot / 3)}.</p>`;
  }
  const max = Math.max(1, ...EXP_DAYS.map((d) => Math.max(d === 'pre' ? 0 : dayBudget(d), sumOf(ex.filter((e) => e.day === d)))));
  return `<div class="bud-rows">${EXP_DAYS.map((d) => { const v = sumOf(ex.filter((e) => e.day === d)), b = d === 'pre' ? 0 : dayBudget(d); if (d === 'pre' && !v) return ''; return `<button data-action="bud-filter" data-day="${d}" class="bud-row press ${f.day === d ? 'on' : ''}"><span class="bud-day">${expDayShort(d)}</span><span class="bud-l"><span class="bud-two">${bar(v, max, b && v > b ? 'over' : '')}${b ? `<span class="bud-mark" style="left:${Math.min(100, (b / max) * 100)}%" title="Buget ${eur(b)}"></span>` : ''}</span><span class="cap">${b ? `buget ${eur(b)}${typeof bplan().days?.[d] === 'number' ? ' (setat)' : ''}` : 'cheltuieli dinainte'}</span></span><span class="bud-v"><b class="${v ? '' : 't-3'}">${eur(v)}</b>${b && v ? `<span class="${v > b ? 't-red' : ''}">${v > b ? '+' + eur(v - b) : eur(b - v) + ' rămași'}</span>` : ''}</span></button>`; }).join('')}</div>`;
}
function expRowHTML(e) {
  const c = expCat(expCatOf(e)), loc = e.loc ? findLoc(e.loc) : null, t = e.at ? new Date(e.at) : null;
  return `<button data-action="exp-edit" data-id="${esc(e.id)}" class="li tight exp-row press" style="--ec:${c.color}"><span class="bud-ic">${icon(c.icon, 'i-18')}</span><span class="flex-1 min-w-0 text-left"><span class="block font-medium truncate">${esc(e.label || (loc ? shortTitle(loc.title) : c.label))}</span><span class="block cap truncate">${[loc && e.label ? shortTitle(loc.title) : '', c.label, e.by || '', t ? t.toTimeString().slice(0, 5) : ''].filter(Boolean).map(esc).join(' · ')}</span></span><span class="exp-amt-v">${eur2(e.amount)}</span></button>`;
}
function budgetHTML() {
  const total = tripEstimate(), spent = spentTotal(), pct = total ? spent / total : 0, over = spent > total, tab = state.budTab || 'day', f = state.budFilter || {}, set = typeof bplan().total === 'number';
  const list = expenses().filter((e) => (!f.day || e.day === f.day) && (!f.cat || expCatOf(e) === f.cat)).sort((a, b) => (b.at || 0) - (a.at || 0));
  const groups = EXP_DAYS.slice().reverse().map((d) => ({ d, items: list.filter((e) => e.day === d) })).filter((g) => g.items.length);
  const filt = f.day || f.cat ? `<div class="bud-filter">${f.day ? `<button data-action="bud-filter" data-day="${f.day}" class="chip on press">${expDayLabel(f.day)} ${icon('close', 'i-16')}</button>` : ''}${f.cat ? `<button data-action="bud-filter" data-cat="${f.cat}" class="chip on press">${expCat(f.cat).label} ${icon('close', 'i-16')}</button>` : ''}<span class="cap">${eur(sumOf(list))}</span></div>` : '';
  return `<div class="bud-grid"><div>
    <div class="bud-hero">
      <div class="bud-top"><div><div class="cap">Cheltuit</div><div class="bud-big">${eur(spent)}</div></div>
        <button data-action="bud-edit" class="bud-plan press" aria-label="Editează bugetul"><span class="cap">${set ? 'Bugetul nostru' : 'Buget estimat'}</span><b>${eur(total)}</b><span class="bud-edit">${icon('edit', 'i-16')} Editează</span></button></div>
      <div class="bud-bar ${over ? 'over' : ''}"><i style="width:${Math.min(100, pct * 100)}%"></i></div>
      <div class="bud-meta"><span>${Math.round(pct * 100)}% folosit · ≈ ${eur(spent / 3)} de persoană</span><span class="${over ? 't-red' : ''}">${over ? `${eur(spent - total)} peste buget` : `${eur(total - spent)} rămași`}</span></div>
    </div>
    <button data-action="add-expense" class="btn btn-primary btn-lg press w-full mt-3">${icon('add', 'i-20')} Adaugă o cheltuială</button>
    <div class="sec"><div class="sec-h"><h2 class="ttl-2">Raport</h2><span class="cap">atinge un rând ca să filtrezi</span></div>
      <div class="seg bud-tabs" role="tablist">${[['day', 'Zile'], ['cat', 'Categorii'], ['act', 'Activități'], ['who', 'Cine']].map(([k, t]) => `<button data-action="bud-tab" data-tab="${k}" class="seg-b press ${tab === k ? 'on' : ''}" role="tab" aria-selected="${tab === k}">${t}</button>`).join('')}</div>
      <div class="mt-3">${budReportHTML(tab)}</div>
      <div class="bud-export mt-3"><button data-action="bud-share" class="btn btn-sm btn-tonal press">${icon('ios_share', 'i-18')} Trimite raportul</button><button data-action="bud-copy" class="btn btn-sm btn-outline press">${icon('content_copy', 'i-18')} Copiază</button><button data-action="bud-csv" class="btn btn-sm btn-outline press">${icon('download', 'i-18')} Tabel CSV</button></div>
    </div>
  </div><div>
    <div class="sec bud-list-sec"><div class="sec-h"><h2 class="ttl-2">Cheltuieli</h2><span class="cap">${expenses().length ? `${expenses().length} · atinge ca să editezi` : ''}</span></div>
      ${filt}
      ${groups.length ? groups.map((g) => `<h3 class="cap bud-gh">${expDayLabel(g.d)} · ${eur(sumOf(g.items))}</h3><div class="card list">${g.items.map(expRowHTML).join('')}</div>`).join('') : `<div class="card-flat p-4 t-2">${f.day || f.cat ? 'Nimic pentru filtrul ales.' : 'Încă nicio cheltuială. Adăugați una după fiecare plată: suma, categoria și, dacă vreți, locul. Raportul se face singur.'}</div>`}
    </div>
  </div></div>`;
}
function renderBudget() { const el = $('#budget'); if (el) el.innerHTML = budgetHTML(); }
// Foaia de cheltuială: nouă sau editată
let expenseDraft = null;
function openExpense(o = {}) {
  const ex = o.id ? expenses().find((e) => e.id === o.id) : null, loc = ex?.loc ? findLoc(ex.loc) : o.loc ? findLoc(o.loc) : null;
  expenseDraft = ex ? { ...ex, cat: expCatOf(ex) } : { id: null, by: hasMe() ? me() : 'Daniel', day: o.day || (loc && DAYS.includes(loc.day) ? loc.day : todayKey() || (DAYS.includes(state.day) ? state.day : 'fri')), amount: '', label: '', loc: loc?.id || null, cat: loc ? guessExpCat('', loc) : 'food' };
  openSheet(expenseSheetHTML()); if (!ex) setTimeout(() => $('#expAmount')?.focus(), 250);
}
function syncExp() { if (!expenseDraft) return; const a = $('#expAmount'), l = $('#expLabel'); if (a) expenseDraft.amount = a.value; if (l) expenseDraft.label = l.value; }
function expenseSheetHTML() {
  const dr = expenseDraft, acts = DAYS.includes(dr.day) ? dayItems(dr.day) : [];
  return `${sheetHead(dr.id ? 'Editează cheltuiala' : 'Cheltuială nouă', dr.id ? 'Modifică sau șterge' : 'Cât și pe ce')}
    <div class="exp-amt"><input id="expAmount" type="number" inputmode="decimal" min="0" step="0.01" value="${esc(String(dr.amount ?? ''))}" placeholder="0" aria-label="Sumă în euro, pentru toți trei"><span>€</span></div>
    <div class="exp-quick">${[5, 10, 20, 50].map((n) => `<button data-action="exp-plus" data-n="${n}" class="chip press">+${n}</button>`).join('')}<span class="cap">pentru toți trei</span></div>
    <h3 class="ttl-3 mt-4 mb-2">Categorie</h3><div class="flex flex-wrap gap-2">${EXP_CATS.map((c) => `<button data-action="exp-cat" data-cat="${c.k}" class="chip press exp-cat ${dr.cat === c.k ? 'on' : ''}" style="--ec:${c.color}">${icon(c.icon, 'i-18')}${c.label}</button>`).join('')}</div>
    <h3 class="ttl-3 mt-4 mb-2">Ziua</h3><div class="flex flex-wrap gap-2">${EXP_DAYS.map((d) => `<button data-action="exp-day" data-day="${d}" class="chip press ${d === dr.day ? 'on' : ''}">${expDayShort(d)}</button>`).join('')}</div>
    ${acts.length ? `<h3 class="ttl-3 mt-4 mb-2">Activitatea <span class="cap">opțional</span></h3><div class="exp-acts"><button data-action="exp-loc" data-id="" class="chip press ${!dr.loc ? 'on' : ''}">Fără</button>${acts.map((l) => `<button data-action="exp-loc" data-id="${esc(l.id)}" class="chip press ${dr.loc === l.id ? 'on' : ''}">${esc(shortTitle(l.title))}</button>`).join('')}</div>` : ''}
    <label class="field mt-4"><span>Descriere (opțional)</span><input id="expLabel" class="input" maxlength="60" value="${esc(dr.label || '')}" placeholder="Ex: bilete metrou, prânz, suvenir"></label>
    <h3 class="ttl-3 mt-4 mb-2">Cine a plătit</h3><div class="flex flex-wrap gap-2">${PERSONS.map((pp) => `<button data-action="exp-who" data-person="${pp}" class="chip press ${PEOPLE_META[pp].name === dr.by ? 'on' : ''}"><span class="avatar p-${pp}" style="width:22px;height:22px;font-size:11px">${PEOPLE_META[pp].name[0]}</span>${PEOPLE_META[pp].name}</button>`).join('')}</div>
    <div class="flex gap-2 mt-5 pb-3"><button data-action="exp-save" class="btn btn-primary btn-lg press flex-1">${dr.id ? 'Salvează' : 'Adaugă în buget'}</button>${dr.id ? `<button data-action="del-expense" data-id="${esc(dr.id)}" class="btn btn-outline btn-lg press" style="color: var(--red)" aria-label="Șterge cheltuiala">${icon('delete', 'i-20')}</button>` : ''}</div>`;
}
function expRerender() { syncExp(); $('#coffeeBody').innerHTML = expenseSheetHTML(); }
async function expenseSave() {
  syncExp(); const dr = expenseDraft, amount = num0(dr.amount); if (!amount) { $('#expAmount')?.focus(); return toast('Scrie suma.', 'payments'); }
  const e = { id: dr.id || 'e' + Date.now(), amount, label: (dr.label || '').trim().slice(0, 60), day: dr.day, by: dr.by, cat: dr.cat, loc: dr.loc || null, at: dr.at || Date.now() };
  const prev = expenses(), list = dr.id ? prev.map((x) => (x.id === dr.id ? e : x)) : [...prev, e].slice(-500);
  state.shared.expenses = list; buzz(12); sfx(dr.id ? 'select' : 'coin'); closeModals(); renderAll();
  toast(dr.id ? 'Cheltuiala a fost salvată.' : `+${eur2(e.amount)} · ${expCat(e.cat).label}`, 'payments', 4000, dr.id ? null : { label: 'Anulează', run: () => expenseDel(e.id, true) });
  await saveShared({ expenses: list });
}
async function expenseDel(id, quiet = false) {
  const prev = expenses(), gone = prev.find((e) => e.id === id), list = prev.filter((e) => e.id !== id); state.shared.expenses = list; closeModals(); renderAll(); sfx('undo');
  if (!quiet && gone) toast(`Șters: ${eur2(gone.amount)}`, 'delete', 5000, { label: 'Anulează', run: async () => { state.shared.expenses = [...expenses(), gone]; renderAll(); await saveShared({ expenses: state.shared.expenses }); } });
  await saveShared({ expenses: list });
}
// Bugetul: total, pe zile; pe activitate din fișa locului
function openBudgetEdit() {
  const p = bplan();
  openSheet(`${sheetHead('Bugetul nostru', 'Editează bugetul')}
    <p class="t-2 mb-3">Lăsați gol ca să folosim estimarea din program. Sumele sunt pentru toți trei.</p>
    <label class="field"><span>Total pe trip (€)</span><input id="budTotal" type="number" inputmode="decimal" class="input" value="${p.total ?? ''}" placeholder="≈ ${Math.round(daysTotal())}, suma zilelor"></label>
    <h3 class="ttl-3 mt-4 mb-2">Pe zile</h3>
    <div class="bud-days-edit">${DAYS.map((d) => `<label class="bde"><span>${DAY_LABEL[d]}</span><input data-bud-day="${d}" type="number" inputmode="decimal" class="input" value="${p.days?.[d] ?? ''}" placeholder="≈ ${Math.round(dayEstimate(d))}"></label>`).join('')}</div>
    <p class="cap mt-3">Pe activități: din raportul „Activități” sau din fișa fiecărui loc.</p>
    <div class="flex gap-2 mt-4 pb-3"><button data-action="bud-save" class="btn btn-primary btn-lg press flex-1">Salvează bugetul</button>${p.total != null || Object.values(p.days || {}).some((v) => v != null) ? '<button data-action="bud-reset" class="btn btn-outline btn-lg press">Înapoi la estimat</button>' : ''}</div>`);
}
async function budgetSave(reset = false) {
  const days = {}; if (!reset) $$('[data-bud-day]').forEach((i) => { days[i.dataset.budDay] = num0(i.value); }); else DAYS.forEach((d) => { days[d] = null; });
  const b = { ...bplan(), total: reset ? null : num0($('#budTotal')?.value), days };
  state.shared.budget = b; closeModals(); renderAll(); sfx('select'); toast(reset ? 'Bugetul revine la estimarea din program.' : 'Bugetul a fost salvat.', 'savings'); await saveShared({ budget: b });
}
function openItemBudget(id) {
  const loc = findLoc(id); if (!loc) return; const list = expenses().filter((e) => e.loc === id), v = bplan().items?.[id];
  openSheet(`${sheetHead(esc(loc.title), 'Buget pe activitate')}
    <div class="bud-item-sum"><div><div class="cap">Cheltuit aici</div><b>${eur(sumOf(list))}</b></div><div><div class="cap">Buget</div><b>${eur(itemBudget(loc))}</b></div></div>
    <label class="field mt-3"><span>Buget pentru activitate (€, pentru trei)</span><input id="budItem" type="number" inputmode="decimal" class="input" value="${v ?? ''}" placeholder="≈ ${Math.round(estBudget(loc))} estimat din program"></label>
    ${list.length ? `<div class="card list mt-3">${list.map(expRowHTML).join('')}</div>` : ''}
    <div class="flex gap-2 mt-4 pb-3"><button data-action="bud-item-save" data-id="${esc(id)}" class="btn btn-primary btn-lg press flex-1">Salvează</button><button data-action="add-expense" data-loc="${esc(id)}" class="btn btn-tonal btn-lg press">${icon('add', 'i-20')} Cheltuială</button></div>`);
}
async function itemBudgetSave(id) {
  const b = { ...bplan(), items: { ...(bplan().items || {}), [id]: num0($('#budItem')?.value) } }; state.shared.budget = b; closeModals(); renderAll(); sfx('select'); toast('Bugetul activității a fost salvat.', 'savings'); await saveShared({ budget: b });
}
// Raport: text de trimis (WhatsApp, notițe) și tabel CSV pentru Excel/Numbers
function budgetReportText() {
  const ex = expenses(), tot = sumOf(ex), b = tripEstimate(), L = [`Buget trip·in·Barcelona, 5–9 nov 2026`, `Cheltuit: ${eur2(tot)} din ${eur(b)} (${b ? Math.round((tot / b) * 100) : 0}%) · ≈ ${eur(tot / 3)} de persoană`, ''];
  L.push('Pe categorii:'); EXP_CATS.forEach((c) => { const v = sumOf(ex.filter((e) => expCatOf(e) === c.k)); if (v) L.push(`• ${c.label}: ${eur2(v)} (${Math.round((v / tot) * 100)}%)`); });
  L.push('', 'Pe zile:'); EXP_DAYS.forEach((d) => { const v = sumOf(ex.filter((e) => e.day === d)), bd = d === 'pre' ? 0 : dayBudget(d); if (v || bd) L.push(`• ${expDayLabel(d)}: ${eur2(v)}${bd ? ` din ${eur(bd)}` : ''}`); });
  L.push('', 'Cine a plătit:'); PERSONS.forEach((p) => { const v = sumOf(ex.filter((e) => e.by === PEOPLE_META[p].name)); if (v) L.push(`• ${PEOPLE_META[p].name}: ${eur2(v)}`); });
  return L.join('\n');
}
function budgetCSV() {
  const rows = [['Data', 'Ziua', 'Categorie', 'Activitate', 'Descriere', 'Suma (EUR)', 'Cine a plătit']];
  for (const e of [...expenses()].sort((a, b) => (a.at || 0) - (b.at || 0))) { const loc = e.loc ? findLoc(e.loc) : null; rows.push([e.at ? new Date(e.at).toLocaleString('ro-RO') : '', expDayLabel(e.day), expCat(expCatOf(e)).label, loc ? loc.title : '', e.label || '', String(e.amount).replace('.', ','), e.by || '']); }
  const csv = '﻿' + rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(';')).join('\r\n');
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' })); a.download = 'buget-barcelona.csv'; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  toast('Tabelul a fost descărcat.', 'download');
}
async function budgetShare() { const text = budgetReportText(); if (navigator.share) { try { await navigator.share({ title: 'Buget Barcelona', text }); return; } catch {} } window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener'); }

// ---------- Ce împachetăm: listă comună, bifabilă ----------
const packKey = (t) => 'p_' + t.toLowerCase().replace(/[^a-z0-9]+/g, '').slice(0, 24);
function packGroups() {
  const custom = Array.isArray(state.shared.packAdd) ? state.shared.packAdd : [];
  return PACK_DEFAULTS.map((g) => ({ ...g, items: g.items.map((t) => ({ key: packKey(t + g.cat), text: t })).concat(custom.filter((c) => c.cat === g.cat).map((c) => ({ key: c.key, text: c.text, custom: true }))) }));
}
function packStats() { const all = packGroups().flatMap((g) => g.items); return { done: all.filter((i) => state.shared.packing?.[i.key]).length, total: all.length }; }
let packingOpen = false;
function packingHTML() {
  const gs = packGroups(), st = packStats(), open = !!packingOpen;
  return `<div class="sec"><button data-action="pack-toggle" class="sec-h w-full press" style="cursor:pointer"><h2 class="ttl-2">De împachetat</h2><span class="cap flex items-center gap-2">${st.done}/${st.total} ${icon(open ? 'expand_less' : 'expand_more', 'i-20')}</span></button>
    <div class="prog-line mb-3"><i style="width:${st.total ? Math.round(st.done / st.total * 100) : 0}%"></i></div>
    ${open ? `<div class="li tight" style="border-radius:12px;background:var(--surface-2)">${icon('umbrella', 'i-20', 'color: var(--blue)')}<span class="cap flex-1">${esc(WEATHER_NOTE)}</span></div>` : ''}
    ${open ? gs.map((g) => `<h3 class="ttl-3 mt-4 mb-2 flex items-center gap-2">${icon(g.icon, 'i-20', 'color: var(--brand)')} ${esc(g.cat)}</h3><div class="card list">${g.items.map((it) => { const on = !!state.shared.packing?.[it.key]; return `<div class="li tight pack-row ${on ? 'on' : ''}"><button data-action="pack-item" data-key="${it.key}" class="chk press" aria-label="${on ? 'Debifează' : 'Bifează'} ${esc(it.text)}" aria-pressed="${on}">${on ? icon('check', 'i-18') : ''}</button><span class="flex-1">${esc(it.text)}</span>${it.custom ? `<button data-action="pack-del" data-key="${it.key}" class="icon-btn press" aria-label="Șterge">${icon('close', 'i-18')}</button>` : ''}</div>`; }).join('')}<button data-action="pack-add" data-cat="${esc(g.cat)}" class="li tight press t-blue" style="width:100%">${icon('add', 'i-18')} Adaugă ceva</button></div>`).join('') : '<p class="cap">Bifați pe măsură ce puneți în bagaj. E comună: o vedeți toți trei.</p>'}
    </div>`;
}
function renderPacking() { const el = $('#packing'); if (el) el.innerHTML = packingHTML(); }

// ---------- Mini-ghid de conversație ----------
const canSpeak = () => typeof window !== 'undefined' && 'speechSynthesis' in window;
// Vocile telefonului se încarcă târziu (mai ales pe Android): le reținem când apar.
let ttsVoices = [];
const loadVoices = () => { try { ttsVoices = window.speechSynthesis.getVoices() || []; } catch { ttsVoices = []; } return ttsVoices; };
if (canSpeak()) { loadVoices(); try { window.speechSynthesis.addEventListener('voiceschanged', loadVoices); } catch {} }
function pickVoice(lang) {
  const v = ttsVoices.length ? ttsVoices : loadVoices(), want = lang.toLowerCase(), base = want.slice(0, 2), norm = (x) => (x.lang || '').toLowerCase().replace('_', '-');
  return v.find((x) => norm(x) === want) || v.find((x) => norm(x).startsWith(base)) || null;
}
// Rezerva: pronunția Google Translate, ca fișier audio (merge și unde telefonul n-are voce de spaniolă / catalană)
let ttsAudio = null;
function speakAudio(text, lang, onEnd) {
  try { ttsAudio?.pause(); ttsAudio = new Audio(`https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${lang.slice(0, 2)}&q=${encodeURIComponent(text.slice(0, 190))}`);
    ttsAudio.addEventListener('ended', onEnd); ttsAudio.addEventListener('error', () => { onEnd(); toast('Nu pot reda sunetul acum (fără semnal?). Pronunția e scrisă dedesubt.', 'volume_off', 4000); });
    ttsAudio.play().catch(() => { onEnd(); toast('Telefonul a blocat sunetul. Verificați volumul și modul silențios.', 'volume_off', 4000); });
  } catch { onEnd(); }
}
function voiceHelp() { toast(isIOS() ? 'Nu se aude? Verificați volumul. Vocea spaniolă: Setări → Accesibilitate → Conținut vorbit → Voci → Spaniolă.' : 'Nu se aude? Verificați volumul și vocea spaniolă din setările de text-to-speech ale telefonului.', 'volume_up', 6000); }
function speak(text, lang = 'es-ES', onEnd = () => {}) {
  if (!canSpeak()) return speakAudio(text, lang, onEnd);
  const s = window.speechSynthesis; let voice = pickVoice(lang), useLang = lang;
  // Catalana fără voce catalană pe telefon: o citește vocea spaniolă (pronunția e apropiată), nu tăcere
  if (!voice && lang.startsWith('ca')) { voice = pickVoice('es-ES'); useLang = voice?.lang || 'es-ES'; }
  let finished = false; const end = () => { if (!finished) { finished = true; onEnd(); } };
  const say = (attempt) => {
    let started = false, settled = false; const u = new SpeechSynthesisUtterance(text);
    u.lang = voice?.lang || useLang; if (voice) u.voice = voice; u.rate = 0.9;
    const retryOrHelp = () => { if (settled || started) return; settled = true; if (attempt < 2) say(attempt + 1); else { end(); voiceHelp(); } };
    u.onstart = () => { started = true; }; u.onend = end;
    u.onerror = (e) => { if (e.error === 'interrupted' || e.error === 'canceled') { settled = true; return end(); } retryOrHelp(); };
    try { if (attempt > 1 || s.speaking || s.pending) s.cancel(); s.resume?.(); s.speak(u); } catch { return retryOrHelp(); }
    // Safari poate rata prima frază: dacă nu pornește în 2,5 s, mai încercăm o dată cu vocea telefonului
    setTimeout(() => { if (!started && !s.speaking) retryOrHelp(); }, 2500);
  };
  say(1);
}
function phrasesHTML() {
  const sp = true;
  return `<div class="pb-6">${PHRASES.map((g) => `<div class="sec"><div class="sec-h"><h2 class="ttl-2 flex items-center gap-2">${icon(g.icon, 'i-22', 'color: var(--brand)')} ${esc(g.cat)}</h2></div>
    <div class="phr-grid">${g.items.map(([ro, es, say], i) => { const cat = g.lang === 'ca'; return `<div class="phr-card k-art">
      <div class="phr-ro">${esc(ro)}</div>
      <div class="phr-main"><span class="phr-es">${esc(es)}</span>${sp ? `<button data-action="speak" data-text="${esc(es)}" data-lang="${cat ? 'ca-ES' : 'es-ES'}" class="phr-say press" aria-label="Ascultă: ${esc(es)}">${icon('volume_up', 'i-20')}</button>` : ''}</div>
      <div class="phr-say-txt">„${esc(say)}”</div></div>`; }).join('')}</div></div>`).join('')}
    </div>`;
}
function renderPhrases() { const el = $('#phrases'); if (el) el.innerHTML = phrasesHTML(); }
async function packToggleItem(key) { const p = { ...(state.shared.packing || {}) }; if (p[key]) p[key] = false; else { p[key] = true; buzz(8); } state.shared.packing = p; renderPacking(); await saveShared({ packing: p }); }
async function packAddItem(cat) { const text = (prompt('Ce mai adăugăm?') || '').trim(); if (!text) return; const item = { key: 'pc' + Date.now(), cat, text: text.slice(0, 60) }; const list = [...(state.shared.packAdd || []), item].slice(-200); state.shared.packAdd = list; renderPacking(); await saveShared({ packAdd: list }); }
async function packDelItem(key) { const list = (state.shared.packAdd || []).filter((c) => c.key !== key); const p = { ...(state.shared.packing || {}) }; delete p[key]; state.shared.packAdd = list; state.shared.packing = p; renderPacking(); await saveShared({ packAdd: list, packing: p }); }


// ---------- Sloturile de masă: variante, voturi 👍/👎 și alegerea familiei ----------
function mealSlotOf(loc) {
  if (!loc) return null; if (loc.mealSlot) return loc.mealSlot;
  for (const d of DAYS) for (const m of ['lunch', 'dinner']) { const o = MEAL_SLOTS?.[d]?.[m], k = `${d}-${m}`, p = state.shared.mealPick?.[k]; if (o && o[0] === loc.id && loc.day === d && (!p || p === o[0])) return k; }
  return null;
}
const votesOf = (key, ref) => state.shared.votes?.[key]?.[optId(ref)] || {};
const voteScore = (key, ref) => Object.values(votesOf(key, ref)).reduce((a, v) => a + (+v || 0), 0);
const mealChosen = (key) => { const [d, m] = key.split('-'); return state.shared.mealPick?.[key] || MEAL_SLOTS?.[d]?.[m]?.[0]; };
function mealRows(key) {
  const [d, m] = key.split('-'), opts = MEAL_SLOTS?.[d]?.[m] || [], chosen = mealChosen(key);
  return opts.map((ref) => ({ ref, loc: mealOptionLoc(ref), score: voteScore(key, ref) })).filter((o) => o.loc && (o.ref === chosen || !isRemoved(optId(o.ref))))
    .sort((a, b) => (b.ref === chosen) - (a.ref === chosen) || b.score - a.score || opts.indexOf(a.ref) - opts.indexOf(b.ref));
}
async function castVote(key, ref, v) {
  const id = optId(ref), cur = votesOf(key, ref), mine = +cur[me()] || 0, next = { ...cur, [me()]: mine === v ? 0 : v };
  const slot = { ...(state.shared.votes?.[key] || {}), [id]: next }; state.shared.votes = { ...(state.shared.votes || {}), [key]: slot };
  buzz(8); sfx(next[me()] ? 'blip' : 'undo'); renderAll(); refreshDetail(); popAfterRender(`[data-action="vote"][data-key="${key}"][data-ref="${CSS.escape(ref)}"][data-v="${v}"]`); await saveShared({ votes: { [key]: slot } });
}
async function pickMeal(key, ref) {
  const [d, m] = key.split('-'), def = MEAL_SLOTS?.[d]?.[m]?.[0]; const val = ref === def ? null : ref;
  state.shared.mealPick = { ...(state.shared.mealPick || {}), [key]: val }; buzz(14); closeModals(); renderAll();
  const l = mealOptionLoc(ref); toast(`${MEAL_LABEL[m]} de ${DAY_LABEL[d].toLowerCase()}: ${shortTitle(l?.title || '')}.`, m === 'lunch' ? 'lunch_dining' : 'restaurant', 3500);
  await saveShared({ mealPick: { [key]: val } });
}
function mealRowHTML(key, o, chosen) {
  const d = key.split('-')[0], e = enriched(o.loc), v = votesOf(key, o.ref), mine = +v[me()] || 0, id = optId(o.ref), isC = o.ref === chosen, closed = e.closed?.includes(d);
  const who = (s) => PERSONS.filter((p) => Math.sign(+v[PEOPLE_META[p].name] || 0) === s).map((p) => PEOPLE_META[p].name);
  const ups = who(1), downs = who(-1);
  const sub = [e.short || e.catLabel || cat(e.cat).label, e.price ? e.price.split('(')[0].split('·')[0].trim() : '', closed ? 'închis în ziua asta' : ''].filter(Boolean).join(' · ');
  const vb = (val, ic, list, lbl) => `<button data-action="vote" data-key="${key}" data-ref="${esc(o.ref)}" data-v="${val}" class="vote-btn press ${mine === val ? (val > 0 ? 'on up' : 'on down') : ''}" aria-pressed="${mine === val}" aria-label="${lbl} ${esc(shortTitle(e.title))}" title="${list.length ? esc(list.join(', ')) : lbl}">${icon(ic, 'i-18' + (mine === val ? ' ms-fill' : ''))}<span>${list.length || ''}</span></button>`;
  return `<div class="meal-row ${isC ? 'on' : ''} ${closed ? 'closed' : ''}">
    <button data-action="open-detail" data-id="${esc(id)}" class="meal-row-main">${thumbHTML(e, 44)}<span class="min-w-0"><span class="meal-row-t">${esc(shortTitle(e.title))}${isC ? ' <span class="pill green">ales</span>' : ''}</span><span class="meal-row-s">${esc(sub)}</span></span></button>
    <div class="meal-votes">${vb(1, 'thumb_up', ups, 'Votează pentru')}${vb(-1, 'thumb_down', downs, 'Votează împotrivă')}</div>
    ${isC ? '' : `<button data-action="meal-pick" data-key="${key}" data-ref="${esc(o.ref)}" class="btn btn-sm btn-tonal press meal-pick" ${closed ? 'disabled' : ''}>Alegem</button>`}
  </div>`;
}
function mealOptsHTML(key, max = 99) {
  const [, m] = key.split('-'), rows = mealRows(key), chosen = mealChosen(key); if (rows.length < 2) return '';
  const lead = rows.slice(1).find((o) => o.score > rows[0].score);
  return `<div class="meal-opts">
    <div class="meal-opts-h">${icon(m === 'lunch' ? 'lunch_dining' : 'restaurant', 'i-18 ms-fill')}<span>Variante pentru ${m === 'lunch' ? 'prânz' : 'cină'}</span><span class="cap">votați 👍 👎</span></div>
    ${lead ? `<div class="meal-lead">${icon('ballot', 'i-16')} Favoritul voturilor: <b>${esc(shortTitle(lead.loc.title))}</b></div>` : ''}
    ${rows.slice(0, max).map((o) => mealRowHTML(key, o, chosen)).join('')}
    ${rows.length > max ? `<button data-action="open-detail" data-id="${esc(optId(chosen))}" class="meal-more press">Toate cele ${rows.length} variante ${icon('chevron_right', 'i-18')}</button>` : ''}
  </div>`;
}
// ---------- Șterge orice loc din program (se poate pune înapoi) ----------
const rawLoc = (id) => ITINERARY.find((l) => l.id === id) || state.custom.find((l) => l.id === id) || (String(id).startsWith('alt-') ? altAsLoc(Number(String(id).slice(4))) : null);
async function removeLoc(id) {
  const loc = findLoc(id) || rawLoc(id); if (!loc || id === 'home') return;
  if (!confirm(`Ștergi „${loc.title}” din program? Îl puteți pune înapoi din „Șterse”.`)) return;
  const r = { ...(state.shared.removed || {}), [id]: { by: me(), at: Date.now() } }; state.shared.removed = r;
  const patch = { removed: { [id]: r[id] } };
  if (loc.mealSlot) { state.shared.mealPick = { ...(state.shared.mealPick || {}), [loc.mealSlot]: null }; patch.mealPick = { [loc.mealSlot]: null }; }
  buzz(14); closeModals(); renderAll();
  toast(`Șters: ${shortTitle(loc.title)}`, 'delete', 5000, { label: 'Anulează', run: () => restoreLoc(id) });
  await saveShared(patch);
}
async function restoreLoc(id) { state.shared.removed = { ...(state.shared.removed || {}), [id]: null }; renderAll(); toast(`Pus înapoi: ${shortTitle(rawLoc(id)?.title || '')}`, 'restore_from_trash'); await saveShared({ removed: { [id]: null } }); }
function removedHTML() {
  const ids = Object.entries(state.shared.removed || {}).filter(([, v]) => v).sort((a, b) => (b[1].at || 0) - (a[1].at || 0)).map(([id]) => id).filter(rawLoc);
  if (!ids.length) return '';
  return `<div class="sec"><div class="sec-h"><h2 class="ttl-2">Șterse</h2><span class="cap">${ids.length} · se pot pune înapoi</span></div><div class="card list">${ids.map((id) => { const l = rawLoc(id), r = state.shared.removed[id]; return `<div class="li tight">${thumbHTML(l, 40)}<div class="min-w-0 flex-1"><div class="font-medium truncate">${esc(l.title)}</div><div class="cap truncate">${DAYS.includes(l.day) ? DAY_LABEL[l.day] + ' · ' : ''}șters de ${esc(r.by || 'noi')}</div></div><button data-action="restore-loc" data-id="${esc(id)}" class="btn btn-sm btn-outline press">${icon('undo', 'i-18')} Pune înapoi</button></div>`; }).join('')}</div></div>`;
}

// ---------- Păreri de la noi, pe fiecare loc ----------
const commentsOf = (id) => (Array.isArray(state.shared.comments?.[id]) ? state.shared.comments[id] : []);
const personKey = (name) => PERSONS.find((p) => PEOPLE_META[p].name === name) || 'daniel';

// ---------- Cine ești (identitate pe acest telefon) ----------
const hasMe = () => { const v = lsGet(LS.me, null); return typeof v === 'string' && PERSONS.some((p) => PEOPLE_META[p].name === v); };
const meKey = () => personKey(me());
function renderMe() {
  const set = hasMe(), k = meKey(), m = PEOPLE_META[k];
  for (const el of [$('#meChip'), $('#sideMe')]) {
    if (!el) continue;
    el.className = `me-chip press ${set ? 'p-' + k : 'unset'}`;
    el.innerHTML = `<span class="avatar p-${k}">${set ? m.name[0] : '?'}</span><span class="me-name">${set ? m.name : 'Cine ești?'}</span>${set ? `<span class="hud-pts" aria-label="puncte">${icon('star', 'i-14 ms-fill')}<b class="px" data-v="0">0</b></span>` : ''}`;
    el.setAttribute('aria-label', set ? `Ești ${m.name}. Atinge pentru a schimba jucătorul.` : 'Alege cine ești');
  }
  if (set) renderHud();
}

// ---------- Reacții: fiecare pune un emoji, dintr-un set de 4 ----------
const REACTIONS = [{ k: 'love', e: '😍', t: 'Ne place mult' }, { k: 'good', e: '👍', t: 'Bun' }, { k: 'nope', e: '👎', t: 'Nu prea' }];
const reactEmoji = (k) => (REACTIONS.find((r) => r.k === k) || {}).e || '';
const reactionsOf = (id) => { const r = state.shared.reactions?.[id]; return r && typeof r === 'object' ? Object.fromEntries(Object.entries(r).filter(([, k]) => REACTIONS.some((x) => x.k === k))) : {}; };
const myReaction = (id) => reactionsOf(id)[me()];
async function toggleReaction(id, k) {
  const cur = reactionsOf(id), mine = cur[me()]; const next = { ...cur }; if (mine === k) { delete next[me()]; sfx('undo'); } else { next[me()] = k; buzz(10); sfx('blip'); }
  const all = { ...(state.shared.reactions || {}), [id]: next }; if (!Object.keys(next).length) delete all[id];
  state.shared.reactions = all; renderAll(); refreshDetail(); await saveShared({ reactions: { [id]: Object.keys(next).length ? next : null } });
}
function reactionRowHTML(id, big = false) {
  const rx = reactionsOf(id), mine = rx[me()];
  const others = PERSONS.map((pp) => ({ pp, name: PEOPLE_META[pp].name, k: rx[PEOPLE_META[pp].name] })).filter((o) => o.k);
  return `<div class="react-row ${big ? 'big' : ''}">
    <div class="react-pick">${REACTIONS.map((r) => `<button data-action="react" data-id="${esc(id)}" data-k="${r.k}" class="react-btn press ${mine === r.k ? 'on' : ''}" title="${r.t}" aria-label="${r.t}" aria-pressed="${mine === r.k}">${r.e}</button>`).join('')}</div>
    ${others.length ? `<div class="react-who">${others.map((o) => `<span class="react-chip p-${o.pp}" title="${esc(o.name)}: ${REACTIONS.find((x) => x.k === o.k)?.t || ''}"><b>${esc(o.name[0])}</b>${reactEmoji(o.k)}</span>`).join('')}</div>` : ''}
  </div>`;
}
// Recomandarea: ce e cel mai bun de făcut / de mâncat aici
function recOf(loc) { const e = enriched(loc); const rec = e.rec || (e.popular && e.popular[0]); if (!rec) return null; const verb = { food: 'De comandat', sweet: 'De comandat', coffee: 'De cerut', shop: 'De văzut', art: 'Nu rata', fun: 'Nu rata', none: 'De făcut' }[catKey(e.cat)] || 'De încercat'; return { verb, rec }; }
function recLineHTML(loc) { const r = recOf(loc); return r ? `<div class="rec-line">${icon('lightbulb', 'i-16 ms-fill', 'color: var(--star)')}<span><b>${r.verb}:</b> ${esc(r.rec)}</span></div>` : ''; }
// Rândul social din feed: recomandare + reacții + comentariu
function feedSocialHTML(loc) {
  const id = loc.id, cm = commentsOf(id), last = cm[cm.length - 1];
  return `${recLineHTML(loc)}
    ${reactionRowHTML(id)}
    <button data-action="open-comments" data-id="${esc(id)}" class="feed-comment press">${last ? `<span class="avatar p-${personKey(last.by)}">${esc((last.by || '?')[0])}</span><span class="fc-txt"><b>${esc(last.by)}:</b> ${esc(last.text)}</span>${cm.length > 1 ? `<span class="cap fc-n">+${cm.length - 1}</span>` : ''}` : `${icon('add_comment', 'i-20', 'color: var(--text-2)')}<span class="fc-txt t-2">Spune ceva despre loc…</span>`}${icon('chevron_right', 'i-18 t-3')}</button>`;
}
function openComments(id) { openDetail(id); setTimeout(() => { const el = $('#detailBody')?.querySelector('#noteText'); if (el) { el.scrollIntoView({ block: 'center' }); el.focus(); } }, 300); }
function agoText(ts) { const m = Math.round((Date.now() - ts) / 60000); return m < 1 ? 'acum' : m < 60 ? `acum ${m} min` : m < 1440 ? `acum ${Math.round(m / 60)} h` : new Date(ts).toLocaleDateString('ro-RO', { day: 'numeric', month: 'short' }); }
function commentsHTML(id) {
  const list = commentsOf(id), who = me();
  return `<div class="hair pt-5 mt-5"><h3 class="ttl-3 mb-3 flex items-center gap-2">${icon('forum', 'i-20', 'color: var(--brand)')} Păreri de la noi${list.length ? ` <span class="cap">${list.length}</span>` : ''}</h3>
    ${list.length ? `<ul class="space-y-3 mb-3">${list.map((c, i) => `<li class="note-row"><span class="avatar p-${personKey(c.by)}">${esc((c.by || '?')[0])}</span><div class="bubble"><div class="cap">${esc(c.by)} · ${agoText(c.at)}</div><div>${esc(c.text)}</div></div>${c.by === who ? `<button data-action="note-del" data-id="${esc(id)}" data-i="${i}" class="icon-btn press" aria-label="Șterge nota">${icon('close', 'i-18')}</button>` : ''}</li>`).join('')}</ul>` : '<p class="cap mb-3">Ce vrem să comandăm, ce să nu ratăm, ce a zis cineva care a fost. Vede toată familia.</p>'}
    <div class="flex gap-2 mb-2" role="radiogroup" aria-label="Cine scrie">${PERSONS.map((pp) => `<button data-action="note-who" data-person="${pp}" class="chip press ${PEOPLE_META[pp].name === who ? 'on' : ''}" role="radio" aria-checked="${PEOPLE_META[pp].name === who}"><span class="avatar p-${pp}" style="width:22px;height:22px;font-size:11px">${PEOPLE_META[pp].name[0]}</span>${PEOPLE_META[pp].name}</button>`).join('')}</div>
    <div class="flex gap-2"><input id="noteText" class="input flex-1" maxlength="280" placeholder="Scrie o notă…" aria-label="Notă nouă" enterkeyhint="send"><button data-action="note-add" data-id="${esc(id)}" class="btn btn-primary press" aria-label="Trimite nota">${icon('send', 'i-20')}</button></div></div>`;
}
async function noteAdd(id) {
  const inp = $('#noteText'); const text = (inp?.value || '').trim(); if (!text) return inp?.focus();
  const list = [...commentsOf(id), { by: me(), text: text.slice(0, 280), at: Date.now() }].slice(-30);
  const comments = { ...(state.shared.comments || {}), [id]: list }; state.shared.comments = comments; buzz(); sfx('select'); popFrom($('#noteText'), `+${PTS.comment}`); renderAll(); refreshDetail(); await saveShared({ comments: { [id]: list } });
}
async function noteDel(id, i) { const list = commentsOf(id).filter((_, j) => j !== Number(i)); state.shared.comments = { ...(state.shared.comments || {}), [id]: list }; renderAll(); refreshDetail(); await saveShared({ comments: { [id]: list } }); }

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
    <h3 class="ttl-3 mt-5 mb-2 flex items-center gap-2">${icon('image_search', 'i-20', 'color: var(--brand)')} Alege o poză potrivită</h3>
    <div id="photoPicks"><p class="cap">Caut poze făcute chiar acolo…</p></div>
    ${cur ? `<button data-action="photo-remove" data-id="${esc(id)}" class="btn btn-text btn-danger press mt-3">${icon('delete', 'i-20')} Scoate poza noastră</button>` : ''}<div style="height:12px"></div>`;
}
function openPhotoSheet(id) { openSheet(photoSheetHTML(id)); loadPhotoPicks(id); }
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
    ['beach_access', 'Plaja Nova Mar Bella la ~10 min pe jos, Bogatell la ~15 min; gazda lasă lucruri de plajă'],
    ['verified', 'Airbnb Plus, gazdă Superhost'],
    ['subway', 'Metrou L4 (galben) Selva de Mar la ~5 min, Poblenou la ~9 min; Rambla del Poblenou la ~12 min'],
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
  const lbl = $('#homeNavLabel'); if (lbl) lbl.textContent = d != null && d < 120 ? 'Cazare ✓' : 'Cazare'; $('.nav-more')?.classList.toggle('near', d != null && d < 120);
  if (homeOpen && !$('#coffeeSheet').classList.contains('hidden')) $('#coffeeBody').innerHTML = homeSheetHTML();
}
function homeSheetHTML() {
  const b = baseLoc(), p = coordsOf(b), d = state.pos && p ? distanceM(state.pos, p) : null, home = d != null && d < 120;
  const notes = (state.shared.notes || '').trim(); const dow = new Date().getDay(); const own = state.photos.home;
  const last = dow === 5 ? 'merge până la 02:00' : dow === 6 ? 'merge toată noaptea' : 'merge până la 24:00';
  const hero = `<div class="relative" style="margin: 0 -16px"><div class="photo hero-photo" style="background: linear-gradient(135deg, var(--brand-soft), var(--blue-soft)); color: var(--brand)">${icon('hotel', 'i-48 ms-fill')}${own ? `<img src="${esc(own.data || own.url)}" alt="">` : ''}<div class="ph-bl"><button data-action="add-photo" data-id="home" class="pill ink press" style="height: 32px; padding: 0 12px">${icon('add_a_photo', 'i-16')} ${own ? 'Altă poză' : 'Pune o poză din Airbnb'}</button></div></div><div class="handle absolute" style="top: 2px; left: 50%; margin-left: -16px; background: rgba(255,255,255,.85)"></div><button data-action="close-modal" class="icon-btn solid press absolute" style="top: 12px; right: 12px" aria-label="Închide">${icon('close')}</button></div>`;
  return `${hero}
    <div class="pt-4"><div class="cap">Cazare · Airbnb · Poblenou</div><h2 class="ttl-1">${home ? 'Sunteți la cazare' : 'Cazarea noastră'}</h2><div class="t-2 mt-0.5">${esc(STAY.name)}</div></div>
    <div class="addr-card mt-4">
      <div class="flex items-start gap-3">${icon('location_on', 'i-28 ms-fill', 'color: var(--brand); margin-top: 2px')}<div class="min-w-0"><div class="cap">Adresa</div><div class="addr-v">Carrer de Pellaires 35<br>08019 Barcelona</div><div class="cap mt-1">Poblenou · metrou Selva de Mar (L4, galben), 5 min pe jos</div></div></div>
      <div class="grid grid-cols-2 gap-2 mt-4">
        <a href="${esc(mapsSearch(TRIP.base.placeQuery))}" target="_blank" rel="noopener" class="btn btn-primary press" style="padding: 0 10px">${icon('gmaps', 'i-20')} Vezi pe hartă</a>
        <button data-action="copy-address" class="btn btn-outline press" style="padding: 0 10px" aria-label="Copiază adresa">${icon('content_copy', 'i-20')} Copiază</button>
      </div>
    </div>
    <h3 class="ttl-3 mt-5 mb-2">Cum ajungeți acolo</h3>
    <div class="summary"><div><div class="v tabular">${d != null ? fmtDist(d) : '—'}</div><div class="k">până acolo</div></div><div><div class="v tabular">${d != null ? fmtMin(walkMin(d)) : '—'}</div><div class="k">pe jos</div></div><div><div class="v tabular">${d != null ? '~' + fmtMin(transitMin(d)) : '—'}</div><div class="k">metrou / taxi</div></div></div>
    <div class="grid grid-cols-3 gap-2 mt-3">
      <a href="${esc(mapsNav(b, 'walking'))}" target="_blank" rel="noopener" class="btn btn-outline press" style="padding: 0 8px">${icon('directions_walk', 'i-20')} Pe jos</a>
      <a href="${esc(mapsNav(b, 'transit'))}" target="_blank" rel="noopener" class="btn btn-tonal press" style="padding: 0 8px">${icon('subway', 'i-20')} Metrou</a>
      <a href="${esc(mapsNav(b, 'driving'))}" target="_blank" rel="noopener" class="btn btn-outline press" style="padding: 0 8px">${icon('local_taxi', 'i-20')} Taxi</a>
    </div>
    <div class="hair pt-5 mt-5"><h3 class="ttl-3 mb-3">Important</h3><div class="card list">
      <div class="li">${icon('event', '', 'color: var(--brand)')}<div class="flex-1"><div class="font-medium">Sosim vineri 6 nov, ~14:30</div><div class="cap">după trenul din PortAventura și metroul de la Sants. Ora exactă de check-in și check-out e în aplicația Airbnb.</div></div></div>
      ${notes ? `<div class="li" style="align-items: flex-start">${icon('key', '', 'color: var(--amber)')}<div class="flex-1"><div class="font-medium">Din notițele noastre</div><div class="whitespace-pre-line t-2">${esc(notes.slice(0, 500))}</div></div></div>` : `<button data-action="view" data-view="info" class="li press">${icon('key', '', 'color: var(--amber)')}<div class="flex-1 text-left"><div class="font-medium">Cod ușă, etaj, wifi</div><div class="cap">Scrieți-le în Notițe ca să apară aici, la toți</div></div>${icon('chevron_right', 't-3 i-20')}</button>`}
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
  return `<div class="li bk-row" style="gap: 12px; padding-right: 8px">
    <input type="checkbox" class="cb bucket-check" data-person="${person}" data-id="${esc(it.id)}" ${it.done ? 'checked' : ''} aria-label="Bifează: ${esc(it.text)}">
    <button data-action="${loc ? 'open-detail' : 'bucket-edit'}" data-person="${person}" data-id="${loc ? esc(loc.id) : esc(it.id)}" class="flex items-center gap-3 flex-1 min-w-0 text-left">
      ${loc ? thumbHTML(loc, 44) : ''}
      <div class="min-w-0"><div class="${it.done ? 'line-through t-3' : ''}">${esc(it.text)}</div>${loc ? `<div class="cap truncate">${esc(sub)}${visited ? ' · <span class="t-green">am fost</span>' : ''}</div>` : ''}</div>
    </button>
    ${loc ? `<a href="${esc(mapsNav(loc))}" target="_blank" rel="noopener" class="icon-btn sm press bk-nav" aria-label="Traseu spre ${esc(loc.title)}">${icon('directions', 'i-20', 'color: var(--blue)')}</a>` : ''}
    <button data-action="bucket-edit" data-person="${person}" data-id="${esc(it.id)}" class="icon-btn sm press" aria-label="Editează">${icon('more_horiz', 'i-20')}</button>
  </div>`;
}
function counterOf(key) { if (key === 'coffee') return (state.shared.coffeeLog || []).reduce((s, x) => s + (x.shots || 1), 0) || state.shared.coffeeCount || 0; return (state.shared.counters || {})[key] || 0; }
function usCounterHTML(person) {
  const meta = PEOPLE_META[person], key = meta.counter.key, cnt = counterOf(key), goal = meta.counter.goal, coffee = key === 'coffee';
  const pips = Array.from({ length: goal }, (_, i) => `<i class="${i < cnt ? 'on' : ''}"></i>`).join('');
  return `<div class="ctr mt-4" style="--pc: var(--p-${person})">
    <div class="ctr-l"><div class="ctr-n"><b class="px">${cnt}</b><span>/ ${goal}</span></div><div class="cap">${esc(meta.counter.label)}${cnt >= goal ? ' · gata! 🏆' : ''}</div><div class="ctr-pips" aria-hidden="true">${pips}</div></div>
    ${cnt ? `<button data-action="${coffee ? 'coffee-undo' : 'counter'}" data-key="${key}" data-delta="-1" class="icon-btn sm press ctr-minus" aria-label="Scade unul" title="Scade unul">${icon('remove', 'i-18')}</button>` : ''}
    <button data-action="${coffee ? 'coffee-quick' : 'counter'}" data-key="${key}" data-delta="1" class="arc-btn press" aria-label="Încă ${coffee ? 'un espresso' : 'unul'}">${icon(meta.counter.icon, 'i-24 ms-fill')}<span class="px">+1</span></button>
  </div>`;
}
// Pe desktop, toți trei unul lângă altul, fără tab-uri
function renderUsDesk() {
  const ub = $('#usBoard'); if (ub) ub.innerHTML = leaderboardHTML();
  $('#usContent').innerHTML = `<div class="us-cols">${PERSONS.map((person) => {
    const meta = PEOPLE_META[person], items = bucketOf(person), done = items.filter((i) => i.done).length, pct = items.length ? Math.round((done / items.length) * 100) : 0;
    return `<section class="us-col" id="us-${person}" aria-label="${meta.name}">
      <div class="flex items-center gap-4"><div class="prog" style="--p:${pct}; --ring: var(--p-${person})"><span class="avatar p-${person}" style="width:40px;height:40px">${meta.name[0]}</span></div><div class="min-w-0"><div class="ttl-1">${meta.name}</div><div class="cap">${esc(meta.tag)} · ${done} din ${items.length} bifate</div></div></div>
      ${person === 'mara' ? `<div class="bday mt-4">${icon('cake', 'i-24 ms-fill')}<div><div class="font-medium">Excursia ei de 13 ani 🎂</div><div class="cap">Hai să i-o facem de neuitat: tobogan, churros, matcha, Shambhala.</div></div></div>` : ''}
      ${usCounterHTML(person)}
      <div class="card list mt-4">${items.map((it) => bucketRowHTML(it, person)).join('')}
        <button data-action="bucket-new" data-person="${person}" class="li press t-blue">${icon('add')}<span class="flex-1 text-left font-medium">Adaugă pe lista lui ${esc(meta.name)}</span></button>
      </div>
    </section>`; }).join('')}</div>
    <p class="cap mt-4 pb-6">Pe pagina oricărui loc poți bifa pe lista cui intră.</p>`;
}
function renderUs() {
  if (isDesk()) return renderUsDesk();
  const person = state.person, meta = PEOPLE_META[person]; if (!meta) return;
  const tabs = $('#peopleTabs'); if (tabs) tabs.innerHTML = PERSONS.map((p) => `<button data-action="person" data-person="${p}" class="tab press ${p === person ? 'on' : ''}"><span class="avatar p-${p}" style="width: 24px; height: 24px; font-size: 12px">${PEOPLE_META[p].name[0]}</span>${PEOPLE_META[p].name}</button>`).join('');
  const items = bucketOf(person), done = items.filter((i) => i.done).length, pct = items.length ? Math.round((done / items.length) * 100) : 0;
  const counter = usCounterHTML(person);
  const ub = $('#usBoard'); if (ub) ub.innerHTML = leaderboardHTML();
  $('#usContent').innerHTML = `
    ${person === 'mara' ? `<div class="bday mb-4">${icon('cake', 'i-24 ms-fill')}<div><div class="font-medium">Excursia ei de 13 ani 🎂</div><div class="cap">Hai să i-o facem de neuitat: tobogan, churros, matcha, Shambhala.</div></div></div>` : ''}
    <div class="flex items-center gap-4"><div class="prog" style="--p:${pct}; --ring: var(--p-${person})"><span class="font-medium">${pct}%</span></div><div><div class="ttl-2">${done} din ${items.length} bifate</div><div class="cap">${esc(meta.tag)} · ${items.filter((i) => i.loc).length} legate de locuri</div></div></div>
    ${counter}
    <div class="card list mt-4 rise">${items.map((it) => bucketRowHTML(it, person)).join('')}
      <button data-action="bucket-new" data-person="${person}" class="li press t-blue">${icon('add')}<span class="flex-1 text-left font-medium">Adaugă pe lista lui ${esc(meta.name)}</span></button>
    </div>
    <p class="cap mt-3 pb-4">Pe pagina oricărui loc poți bifa pe lista cui intră.</p>`;
}
async function coffeeUndo() { const log = (state.shared.coffeeLog || []).slice(0, -1); state.shared.coffeeLog = log; state.shared.coffeeCount = counterOf('coffee'); sfx('undo'); renderUs(); renderHud(); refreshDetail(); await saveShared({ coffeeLog: log, coffeeCount: state.shared.coffeeCount }); }
async function bumpCounter(key, delta, el) { if (delta > 0) { sfx('coin'); popFrom(el, `+${PTS.counter}`); buzz(12); } else sfx('undo'); const counters = { ...(state.shared.counters || {}) }; counters[key] = Math.max(0, (counters[key] || 0) + delta); state.shared.counters = counters; renderUs(); await saveShared({ counters }); }
async function bucketSet(person, id, patch) { const b = { ...(state.shared.bucket || {}) }; const p = { ...(b[person] || {}) }; p[id] = { ...(p[id] || {}), ...patch }; b[person] = p; state.shared.bucket = b; renderUs(); await saveShared({ bucket: b }); }
async function bucketDel(person, id) { const b = { ...(state.shared.bucket || {}) }; const p = { ...(b[person] || {}) }; p[id] = { hidden: true }; b[person] = p; state.shared.bucket = b; renderUs(); await saveShared({ bucket: b }); }

// ---------- Programare (mută un loc în altă zi) ----------
let scheduleId = null;
function scheduleSheetHTML(loc) {
  const e = enriched(loc), closed = e.closed || [], s = suggestFor(coordsOf(loc), loc.id, e.cat, closed);
  return `${sheetHead(esc(loc.title), isPool(loc) ? 'În ce zi?' : 'Mută în altă zi')}
    ${s.day !== 'pool' ? `<p class="t-2 mb-3">Cel mai aproape de <b style="font-weight: 500; color: var(--text)">${esc(s.nearTitle)}</b> (${DAY_LABEL[s.day]}, ${fmtDist(s.dist)}).</p>` : ''}
    <div class="flex flex-wrap gap-2" id="schedDays">${DAYS.map((d) => `<button type="button" data-action="sched-day" data-day="${d}" data-time="${esc(d === s.day ? s.time : '')}" class="chip press ${(loc.day === d) || (isPool(loc) && d === s.day) ? 'on' : ''}">${DAY_LABEL[d]}${d === s.day ? ' · recomandat' : closed.includes(d) ? ' · închis' : ''}</button>`).join('')}</div>
    <div class="mt-4">${timePickerHTML('schedTime', loc.time && loc.time !== 'Flexibil' ? loc.time : s.time && s.time !== 'Flexibil' ? s.time : '', { label: 'Ora', suggest: s.time && s.time !== 'Flexibil' ? s.time : '', dur: stayOf(loc) })}</div>
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
function switchDay(day, dir) { if (!DAYS.includes(day)) return; state.focusHold = null; const from = DAYS.indexOf(state.day); state.day = day; state.filter = 'all'; renderDay(); renderMap(); renderNextStop();
  const d = dir || (DAYS.indexOf(day) > from ? 'left' : DAYS.indexOf(day) < from ? 'right' : ''); const it = $('#itinerary'); if (it && d && !RM()) { it.classList.remove('day-in-left', 'day-in-right'); void it.offsetWidth; it.classList.add('day-in-' + d); } }
function setFilter(c) { state.filter = c; renderDay(); }
function renderNotes() { const ta = $('#sharedNotes'); if (ta && document.activeElement !== ta) ta.value = state.shared.notes || ''; }
function renderAll() { renderDay(); renderMap(); renderNextStop(); renderNearby(); renderCollections(); renderUs(); renderHome(); renderBookings(); renderBudget(); renderPacking(); renderPhrases(); renderHQ(); renderHud(); }
function setView(v) {
  if (!['hq', 'plan', 'explore', 'us', 'info', 'budget', 'translate'].includes(v) || (v === 'hq' && !isDesk())) v = 'plan';
  if (state.picking && v !== 'explore') stopPick();
  state.view = v; lsSet(isDesk() ? LS.viewDesk : LS.view, v); if (homeOpen) closeModals();
  $('#radarBanner').classList.add('hidden'); $('#appbar')?.classList.remove('show-days');
  $$('section[data-view]').forEach((s) => s.classList.toggle('hidden', s.dataset.view !== v));
  $$('.nav-btn[data-view], .side-btn[data-view]').forEach((b) => { b.classList.toggle('on', b.dataset.view === v); if (b.classList.contains('side-btn')) b.toggleAttribute('aria-current', b.dataset.view === v); });
  $('.nav-more')?.classList.toggle('on', v === 'translate' || v === 'info');
  $('#fab').classList.toggle('hidden', v === 'info' || v === 'explore' || v === 'budget' || v === 'translate');
  window.scrollTo({ top: 0 });
  if (v === 'hq') { renderHQ(); ensureHQMap(); }
  if (v === 'explore') { ensureMap(); renderMap(); renderNextStop(); if (!state.radarOn) startRadar(); }
  if (v === 'us') renderUs();
  if (v === 'plan') observeReveal();
  if (v === 'info') { const url = location.href.split('#')[0].split('?')[0]; $('#shareUrl').value = url; $('#whatsappShareBtn').href = `https://wa.me/?text=${encodeURIComponent(`${SUMMARY_TEXT}\n\nGhidul live: ${url}`)}`; }
}
function applyThemeIcon() { const dark = document.documentElement.classList.contains('dark'); $('#themeIcon').innerHTML = icon(dark ? 'light_mode' : 'dark_mode'); const si = $('#sideThemeIcon'); if (si) si.innerHTML = icon(dark ? 'light_mode' : 'dark_mode'); $('meta[name="theme-color"]')?.setAttribute('content', dark ? '#202124' : '#FFFFFF'); }
function toggleTheme() { const h = document.documentElement; const d = h.classList.toggle('dark'); h.classList.toggle('light', !d); try { localStorage.setItem(LS.theme, d ? 'dark' : 'light'); } catch {} applyThemeIcon(); if (state.view === 'hq') renderHQMap(); }
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
    fs.onSnapshot(fs.doc(db, 'trips', TRIP_ID, 'state', 'shared'), (snap) => { const d = snap.data() || {}; for (const k of ['quests', 'visited', 'pins', 'skipped', 'bucket', 'counters', 'times', 'days', 'comments', 'booked', 'removed', 'mealPick', 'votes', 'budget']) if (d[k] && typeof d[k] === 'object') state.shared[k] = d[k]; if (Array.isArray(d.expenses)) state.shared.expenses = d.expenses; if (d.reactions && typeof d.reactions === 'object') state.shared.reactions = d.reactions; if (d.packing && typeof d.packing === 'object') state.shared.packing = d.packing; if (Array.isArray(d.packAdd)) state.shared.packAdd = d.packAdd; if (Array.isArray(d.coffeeLog)) state.shared.coffeeLog = d.coffeeLog; if (typeof d.coffeeCount === 'number') state.shared.coffeeCount = d.coffeeCount; if (typeof d.notes === 'string') state.shared.notes = d.notes; persistLocal(); renderNotes(); renderAll(); refreshDetail(); }, (err) => console.error(err));
    fs.onSnapshot(fs.collection(db, 'trips', TRIP_ID, 'photos'), (snap) => { state.photos = {}; snap.forEach((d) => { state.photos[d.id] = d.data(); }); renderAll(); refreshDetail(); }, (err) => console.error(err));
  } catch (err) { console.error(err); setSyncStatus('local', err.message); }
}
async function syncLocalLocations(local) {
  if (!local.length || !fb) return; let n = 0;
  for (const l of local) { const { id, isCustom, createdAt, ...data } = l; try { await fb.fs.addDoc(fb.fs.collection(fb.db, 'trips', TRIP_ID, 'locations'), { ...data, createdAt: fb.fs.serverTimestamp() }); n++; } catch (e) { console.warn('sync', e); } }
  if (n) toast(`${n} ${n > 1 ? 'locuri salvate' : 'loc salvat'} fără semnal ${n > 1 ? 'au' : 'a'} ajuns în programul comun.`, 'cloud_done');
}
async function saveShared(patch) { for (const [k, v] of Object.entries(patch)) { const cur = state.shared[k]; state.shared[k] = v && cur && typeof v === 'object' && typeof cur === 'object' && !Array.isArray(v) && !Array.isArray(cur) ? { ...cur, ...v } : v; } if (fb && state.online) { const { db, fs } = fb; await fs.setDoc(fs.doc(db, 'trips', TRIP_ID, 'state', 'shared'), { ...patch, updatedAt: fs.serverTimestamp() }, { merge: true }); } else persistLocal(); }
async function saveLocation(data, editingId) {
  if (fb && state.online && !(editingId && String(editingId).startsWith('local-'))) { const { db, fs } = fb; if (editingId) { await fs.updateDoc(fs.doc(db, 'trips', TRIP_ID, 'locations', editingId), data); return editingId; } const ref = await fs.addDoc(fs.collection(db, 'trips', TRIP_ID, 'locations'), { ...data, createdAt: fs.serverTimestamp() }); return ref.id; }
  if (editingId) { state.custom = state.custom.map((l) => (l.id === editingId ? { ...l, ...data } : l)); persistLocal(); renderAll(); return editingId; }
  const id = 'local-' + Date.now(); state.custom.push({ ...data, id, isCustom: true, createdAt: new Date().toISOString() }); persistLocal(); renderAll(); return id;
}
async function deleteLocation(id) { if (!confirm('Ștergi acest loc din programul comun?')) return; if (fb && state.online && !String(id).startsWith('local-')) { const { db, fs } = fb; await fs.deleteDoc(fs.doc(db, 'trips', TRIP_ID, 'locations', id)); } else { state.custom = state.custom.filter((l) => l.id !== id); persistLocal(); renderAll(); } addState = null; closeModals(); toast('Locul a fost șters.', 'delete'); }
async function toggleVisited(k, el) {
  const v = { ...state.shared.visited, [k]: state.shared.visited[k] ? false : { by: me(), at: Date.now() } }; state.shared.visited = v;
  if (!v[k]) sfx('undo');
  if (v[k]) { buzz(14); sfx('power'); const r = (el || document.body).getBoundingClientRect(); confetti(r.left + r.width / 2, r.top + Math.min(r.height / 2, 40)); scorePop(r.left + r.width / 2, r.top, `+${PTS.visit}`); toast(`Bifat: ${shortTitle(findLoc(k)?.title || '')}`, 'check_circle', 3500, { label: 'Anulează', run: () => toggleVisited(k) });
    const loc = findLoc(k); const day = loc && DAYS.includes(loc.day) ? loc.day : null;
    if (day) { const stops = dayItems(day); if (stops.length && stops.every((l) => v[l.id])) setTimeout(() => dayDone(day), 400); } }
  renderAll(); refreshDetail(); await saveShared({ visited: v });
}
function dayDone(day) { arcadeMoment('Zi completă!', DAY_THEMES[day]?.name || DAY_LABEL[day], 'clear'); }
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
  const hint = s.day !== 'pool' ? `<span class="t-blue">${DAY_SHORT[s.day][0]} ${DAY_SHORT[s.day][1]}, ${s.time.split(' ')[0]}</span> · lângă ${esc(shortTitle(s.afterTitle))}${s.noFit ? ' · <span style="color: var(--amber)">nu încape</span>' : ''}` : pl.lat != null ? 'departe de program · la dorite' : '';
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
      ${a.local.length ? `<h3 class="cap mt-5 mb-2">${a.q ? 'Din recomandările noastre' : 'Recomandări, fiecare în ziua în care sunteți prin zonă'}</h3><div class="card list">${a.local.map((pl, i) => placeRowHTML(pl, i, 'local')).join('')}</div>` : ''}
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
    ${day !== 'pool' ? `<div class="mt-3">${timePickerHTML('addTime', a.time && a.time !== 'Flexibil' ? a.time : '', { label: 'Ora', suggest: a.suggestion?.day === day && a.suggestion?.time && a.suggestion.time !== 'Flexibil' ? a.suggestion.time : '', dur: MIN_STAY[catKey(a.cat)] || 60 })}</div>` : ''}
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
async function confirmPick() { const c = state.map.getCenter(); const forHere = state.pickFor === 'here'; state.pickFor = null; stopPick(); if (forHere) { hereState.pt = { lat: c.lat, lng: c.lng }; hereState.ptName = 'punct pe hartă'; const r = await geoReverse(c.lat, c.lng); if (r[0]) hereState.ptName = shortTitle(r[0].title); openHereSheet(); return; } await addAt({ lat: c.lat, lng: c.lng }); }
function herePick() { state.pickFor = 'here'; $('#pickHint') && ($('#pickHint').textContent = 'Centrați pe locul unde sunteți'); startPick(); }
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
// ---------- Colecții: toate locurile pe categorii, cu „de făcut / făcute” ----------
const collState = { key: null, filter: 'todo' };
const SOCIAL = new Set(['instagram', 'tiktok', 'youtube']);
function collections() {
  const all = allLocs().filter((l) => !l.fixed && l.id !== 'base');
  const cats = CAT_KEYS.map((k) => ({ key: k, title: CAT[k].label, icon: CAT[k].icon, cls: CAT[k].cls, list: all.filter((l) => catKey(enriched(l).cat) === k) }));
  const picks = (k) => ALTERNATIVES.map((a, i) => altAsLoc(i)).filter((l) => l.pick === k).map((l) => (l.inPlan && findLoc(l.inPlan)) || l).sort((a, b) => a.rank - b.rank);
  const top = [['pho', 'Top 3 pho', 'ramen_dining'], ['paella', 'Top 3 paella & arròs', 'restaurant'], ['tapas', 'Top 3 tapas', 'tapas'], ['piata', 'Top 3 piețe, ca localnicii', 'storefront']].map(([k, title, ic]) => ({ key: 'top-' + k, title, icon: ic, cls: 'c-food', top: true, list: picks(k) }));
  return [...top, ...cats, { key: 'social', title: 'Din reels', icon: 'photo_camera', cls: 'c-sweet', list: all.filter((l) => SOCIAL.has(l.source)) }, { key: 'pool', title: 'Dorite, fără zi', icon: 'bookmark', cls: 'c-none', list: all.filter(isPool) }].filter((c) => c.list.length);
}
const dayOrder = (l) => (DAYS.includes(l.day) ? DAYS.indexOf(l.day) : 9);
function renderCollections() {
  const el = $('#collections'); if (!el) return;
  el.innerHTML = `<div class="coll-grid">${collections().map((c) => { const done = c.list.filter((l) => state.shared.visited[l.id]).length; return `<button data-action="coll-open" data-coll="${c.key}" class="coll ${c.cls} press"><span class="coll-ic">${icon(c.icon, 'i-22 ms-fill')}</span><span class="coll-t">${esc(c.title)}</span><span class="coll-n">${c.list.length} locuri${done ? ` · ${done} făcute` : ''}</span><span class="coll-bar"><i style="width:${Math.round((done / c.list.length) * 100)}%"></i></span></button>`; }).join('')}</div>`;
}
function openCollection(key) { collState.key = key; collState.filter = 'todo'; openSheet('<div id="collBody"></div>'); renderCollectionSheet(); }
function renderCollectionSheet() {
  const box = $('#collBody'); if (!box) return; const c = collections().find((x) => x.key === collState.key); if (!c) return;
  const f = collState.filter, done = (l) => !!state.shared.visited[l.id];
  const list = c.list.filter((l) => (f === 'todo' ? !done(l) : f === 'done' ? done(l) : true)).sort((a, b) => (a.rank || 0) - (b.rank || 0) || dayOrder(a) - dayOrder(b) || startMin(a) - startMin(b));
  const when = (l) => (l.isAlt ? [l.address?.split(',').pop()?.trim(), l.price?.split('(')[0].trim()].filter(Boolean).join(' · ') : isPool(l) ? 'dorit, fără zi' : `${DAY_LABEL[l.day]}${parseRange(l.time) ? ' · ' + hhmm(parseRange(l.time).from) : ''}`);
  box.innerHTML = `${sheetHead('Colecție', esc(c.title))}
    <div class="flex gap-2 mb-3">${[['todo', 'De făcut'], ['done', 'Făcute'], ['all', 'Toate']].map(([k, t]) => `<button data-action="coll-filter" data-f="${k}" class="chip press ${f === k ? 'on' : ''}">${t} <span class="t-3">${k === 'todo' ? c.list.filter((l) => !done(l)).length : k === 'done' ? c.list.filter(done).length : c.list.length}</span></button>`).join('')}</div>
    ${c.top ? '<p class="cap mb-3">Unde merg localnicii, nu turiștii: Time Out Barcelona, Guía Repsol, Michelin și recenzii locale, verificate în septembrie 2026.</p>' : ''}
    ${list.length ? `<div class="card list">${list.map((l) => `<div class="li"><button data-action="open-detail" data-id="${esc(l.id)}" class="flex items-center gap-3 flex-1 min-w-0 text-left">${thumbHTML(enriched(l), 48)}<div class="min-w-0"><div class="font-medium truncate ${done(l) ? 'line-through t-3' : ''}">${l.rank ? `<span class="rank">${l.rank}</span>` : ''}${esc(l.title)} ${whoHTML(l.id)}</div><div class="cap truncate">${esc(when(l))}${enriched(l).closed?.length ? ` · închis ${enriched(l).closed.map((d) => DAY_SHORT[d][0].toLowerCase()).join(', ')}` : ''}</div></div></button><button data-action="coll-visit" data-id="${esc(l.id)}" class="icon-btn press ${done(l) ? 'on-green' : ''}" aria-label="${done(l) ? 'Anulează: am fost' : 'Bifează: am fost'}">${icon(done(l) ? 'check_circle' : 'check', 'i-22' + (done(l) ? ' ms-fill' : ''))}</button></div>`).join('')}</div>` : `<p class="t-2 py-6 text-center">${f === 'todo' ? 'Totul e bifat aici. Bravo!' : 'Nimic bifat încă.'}</p>`}
    <div style="height:12px"></div>`;
}
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
  const lbl = () => map.getContainer().classList.toggle('labels-on', map.getZoom() >= 15); map.on('zoomend', lbl); lbl();
  map.on('dragstart', () => { state.focusHold = null; });
  map.on('contextmenu', (e) => { if (state.picking) return; buzz(20); addAt({ lat: e.latlng.lat, lng: e.latlng.lng }); });
  state.map = map; setTimeout(() => map.invalidateSize(), 60);
}
function homeMarker() { if (!state.map || state.homeMarker) return; const b = TRIP.base; state.homeMarker = L.marker([b.lat, b.lng], { icon: L.divIcon({ className: '', html: `<div class="pin home">${icon('hotel', 'i-16 ms-fill')}</div>`, iconSize: [28, 28], iconAnchor: [14, 14] }), zIndexOffset: 500 }).addTo(state.map); state.homeMarker.on('click', () => openHome()); }
function updateMeMarker() { if (!state.map || !state.pos) return; const ll = [state.pos.lat, state.pos.lng]; if (!state.meMarker) state.meMarker = L.marker(ll, { icon: L.divIcon({ className: '', html: '<div class="me"></div>', iconSize: [18, 18], iconAnchor: [9, 9] }), zIndexOffset: 1000 }).addTo(state.map); else state.meMarker.setLatLng(ll); }
// Încadrează harta pe locurile din oraș; un singur punct departe (aeroportul) nu mai micșorează totul
function coreBounds(pts) {
  if (pts.length < 4) return pts; const med = (i) => pts.map((p) => p[i]).sort((a, b) => a - b)[pts.length >> 1], c = { lat: med(0), lng: med(1) };
  const near = pts.filter((p) => distanceM(c, { lat: p[0], lng: p[1] }) < 6000); return near.length >= pts.length * 0.7 ? near : pts;
}
function renderMap() {
  renderDates(); if (!state.map) return; state.markers.forEach((m) => m.remove()); state.markers = []; state.markerById = {}; state.focusMarker?.remove(); state.focusMarker = null; const bounds = []; let n = 0; const list = dayItems(state.day);
  const label = (m, l) => m.bindTooltip(esc(shortTitle(l.title || '')), { permanent: true, direction: 'bottom', offset: [0, 10], className: 'pin-lbl' });
  const line = list.map(coordsOf).filter(Boolean).map((p) => [p.lat, p.lng]); if (line.length > 1) state.markers.push(L.polyline(line, { color: '#1A73E8', weight: 3, opacity: 0.55, dashArray: '2 8', lineCap: 'round' }).addTo(state.map));
  for (const loc of list) { const p = coordsOf(loc); n++; if (!p) continue; const ck = catKey(enriched(loc).cat), cls = state.shared.visited[loc.id] ? 'pin done' : `pin k-${ck}`, badge = ck === 'coffee' || ck === 'sweet' ? `<i class="pin-b">${icon(ck === 'coffee' ? 'coffee' : 'icecream', 'ms-fill', 'width:11px;height:11px')}</i>` : ''; const m = L.marker([p.lat, p.lng], { icon: L.divIcon({ className: '', html: `<div class="${cls}">${n}${badge}</div>`, iconSize: [28, 28], iconAnchor: [14, 14] }) }).addTo(state.map); m.on('click', () => openDetail(loc.id)); label(m, loc); state.markers.push(m); state.markerById[loc.id] = m; bounds.push([p.lat, p.lng]); }
  for (const loc of list) (enriched(loc).variants || []).forEach((v, i) => { if (typeof v.lat !== 'number') return; const m = L.marker([v.lat, v.lng], { icon: L.divIcon({ className: '', html: `<div class="pin custom" style="width:22px;height:22px;font-size:10px">${i + 1}</div>`, iconSize: [22, 22], iconAnchor: [11, 11] }) }).addTo(state.map); m.on('click', () => openDetail(loc.id)); state.markers.push(m); });
  for (const z of DAY_ZONES[state.day] || []) ALTERNATIVES.forEach((a, i) => { if (a.zone !== z || typeof a.lat !== 'number') return; const m = L.marker([a.lat, a.lng], { icon: L.divIcon({ className: '', html: '<div class="pin alt">+</div>', iconSize: [20, 20], iconAnchor: [10, 10] }) }).addTo(state.map); m.on('click', () => openDetail('alt-' + i)); label(m, a); state.markers.push(m); state.markerById['alt-' + i] = m; });
  state.custom.filter(isPool).forEach((l) => { const p = coordsOf(l); if (!p) return; const m = L.marker([p.lat, p.lng], { icon: L.divIcon({ className: '', html: `<div class="pin alt" style="color: #E0457B">${icon('bookmark', 'i-16 ms-fill')}</div>`, iconSize: [20, 20], iconAnchor: [10, 10] }) }).addTo(state.map); m.on('click', () => openDetail(l.id)); label(m, l); state.markers.push(m); state.markerById[l.id] = m; });
  homeMarker(); updateMeMarker(); const fid = state.focusId || (state.focusHold && Date.now() < state.focusHold.until ? state.focusHold.id : null); if (fid) { focusOnMap(fid); return; } if (bounds.length && !state.picking) state.map.fitBounds(coreBounds(bounds), { padding: [80, 40], maxZoom: 15 }); setTimeout(() => state.map.invalidateSize(), 60);
}

// =====================================================================
// Centru de comandă (doar desktop): tot tripul pe un singur ecran.
// Tabla cu cele 5 zile pe ore, harta care urmărește ziua la care vă uitați
// și ce mai e de făcut înainte de plecare. Totul deschide foile existente.
// =====================================================================
const hq = { day: null, hoverDay: null, timer: null, pins: {}, layers: [], meal: null, hl: null };
const HQ_SCALE = 1.25; // px pe minut în tabla zilelor
const roN = (n, one, many) => (n === 1 ? `1 ${one}` : `${n}${n > 0 && (n % 100 >= 20 || n % 100 === 0) ? ' de' : ''} ${many}`);
const eurN = (n) => `${Math.round(n).toLocaleString('ro-RO')} €`;
const hqDay = () => hq.hoverDay || hq.day || state.day;
function tripPhase() {
  const land = new Date(TRIP.days.thu + 'T08:35:00+01:00'), fly = new Date(TRIP.days.mon + 'T20:15:00+01:00'), now = new Date();
  if (now < land) { const ms = land - now; return { phase: 'before', d: Math.floor(ms / 86400000), h: Math.floor((ms % 86400000) / 3600000), m: Math.floor((ms % 3600000) / 60000) }; }
  if (now <= fly) { const day = todayKey() || 'mon'; return { phase: 'during', day, idx: DAYS.indexOf(day) + 1 }; }
  return { phase: 'after' };
}
function hqStats() {
  const plans = DAYS.map((d) => planDay(d)), items = bookingItems(), pk = packStats();
  return { plans, stops: plans.reduce((s, p) => s + p.slots.length, 0), walkM: plans.reduce((s, p) => s + p.walkM, 0), issues: plans.flatMap((p) => p.issues),
    book: { done: items.filter((l) => isBooked(l.id)).length, total: items.length, items }, pack: pk, est: tripEstimate(), spent: spentTotal(), pool: allLocs().filter(isPool) };
}
function renderHQHero() {
  const el = $('#hqHero'); if (!el || !isDesk()) return; const t = tripPhase(), s = hqStats();
  const head = t.phase === 'before'
    ? (t.d > 1 ? `Mai sunt ${roN(t.d, 'zi', 'zile')} până aterizăm la Barcelona.` : t.d === 1 ? 'Mâine aterizăm la Barcelona.' : `Aterizăm la Barcelona în ${t.h ? roN(t.h, 'oră', 'ore') + ' și ' : ''}${roN(t.m, 'minut', 'minute')}.`)
    : t.phase === 'during' ? `Suntem în Barcelona: ziua ${t.idx} din 5.` : 'A fost o excursie frumoasă.';
  const sub = t.phase === 'before' ? `${t.d > 1 ? `${roN(t.d, 'zi', 'zile')}, ${roN(t.h, 'oră', 'ore')} și ${roN(t.m, 'minut', 'minute')} până joi, 5 noiembrie, la 8:35. ` : ''}Mara, Anne și Daniel, cinci zile între PortAventura și Barcelona.`
    : t.phase === 'during' ? `Azi: ${DAY_THEMES[t.day].name}. ${DAY_THEMES[t.day].sub}.` : `${roN(s.stops, 'oprire', 'opriri')}, ${roN(Math.round(s.walkM / 1000), 'kilometru', 'kilometri')} pe jos și multe amintiri.`;
  const bookOk = s.book.done === s.book.total, packPct = s.pack.total ? Math.round((s.pack.done / s.pack.total) * 100) : 0;
  const stat = (action, ic, txt, tone = '', extra = '') => `<button data-action="${action}" class="hq-stat press ${tone}" ${extra}>${icon(ic, 'i-20' + (tone ? ' ms-fill' : ''))}<span>${txt}</span></button>`;
  el.innerHTML = `<div class="hq-hero-main">
      <div class="hq-family" aria-label="Mara, Anne și Daniel">${PERSONS.map((p) => `<span class="avatar p-${p}">${PEOPLE_META[p].name[0]}</span>`).join('')}<span class="hq-family-t"><span class="senyera"></span> Barcelona & PortAventura, 5–9 noiembrie 2026</span></div>
      <h1 class="hq-title">${esc(head)}</h1>
      <p class="hq-sub">${esc(sub)}</p>
      <div class="hq-stats">
        ${stat('hq-open-plan', 'calendar_month', `${roN(s.stops, 'oprire', 'opriri')} în 5 zile`)}
        ${stat('hq-open-map', 'directions_walk', `≈ ${Math.round(s.walkM / 1000)} km pe jos`)}
        ${stat('hq-open-budget', 'payments', `≈ ${eurN(s.est)} estimat`)}
        ${stat('hq-goto-ready', bookOk ? 'event_available' : 'event_upcoming', `Rezervări ${s.book.done} din ${s.book.total}`, bookOk ? 'ok' : 'warn')}
        ${stat('hq-packing', 'luggage', `Bagaj ${packPct}%`, packPct >= 100 ? 'ok' : '')}
        ${stat('hq-goto-ready', s.issues.length ? 'warning' : 'check_circle', s.issues.length ? `${roN(s.issues.length, 'problemă', 'probleme')} în plan` : 'Toate zilele încap', s.issues.length ? 'bad' : 'ok')}
        ${(() => { const sc = scores(), lv = levelOf(sc.total); return `<button data-action="view" data-view="us" class="hq-stat hq-game press">${icon('sports_esports', 'i-20')}<span><b class="px">Niv ${lv.n}</b> ${esc(lv.name)} · ${fmtPts(sc.total)} pct</span></button>`; })()}
      </div>
    </div>
    <div class="hq-pass" aria-label="Zborurile">
      <div class="hq-leg"><div class="hq-leg-k">${icon('flight_land', 'i-20')} Aterizare</div><div class="hq-leg-t">08:35</div><div class="hq-leg-d">Joi, 5 noiembrie</div><div class="hq-leg-a">Barcelona El Prat</div></div>
      <div class="hq-pass-mid"><span class="hq-pass-line"></span><span class="hq-pass-n">5 zile · 4 nopți</span></div>
      <div class="hq-leg"><div class="hq-leg-k">${icon('flight_takeoff', 'i-20')} Decolare</div><div class="hq-leg-t">20:15</div><div class="hq-leg-d">Luni, 9 noiembrie</div><div class="hq-leg-a">Barcelona El Prat</div></div>
    </div>`;
}
// Vremea pe zilele tripului: prognoza, când apare (cu ~7 zile înainte), altfel media lui noiembrie
function dayWeather(d) {
  const i = weather?.daily?.time?.indexOf(TRIP.days[d]); const su = SUN[d] || {};
  if (i != null && i >= 0) { const w = weather.daily; return { ic: WMO(w.weather_code[i])[0], txt: `${Math.round(w.temperature_2m_max[i])}° / ${Math.round(w.temperature_2m_min[i])}°`, rain: w.precipitation_probability_max[i], live: true, set: su.set }; }
  return { ic: 'partly_cloudy_day', txt: su.temp ? su.temp.replace('/', ' / ') : '', live: false, set: su.set };
}
function hqBoardHTML() {
  const plans = Object.fromEntries(DAYS.map((d) => [d, planDay(d)])); let t0 = 9 * 60, t1 = 20 * 60;
  for (const d of DAYS) { const p = plans[d]; if (p.first != null) t0 = Math.min(t0, p.first); if (p.last != null) t1 = Math.max(t1, p.last); }
  t0 = Math.floor(t0 / 60) * 60; t1 = Math.ceil(t1 / 60) * 60; const y = (m) => Math.round((m - t0) * HQ_SCALE), H = y(t1), sel = hqDay(), today = todayKey(), nowMin = new Date().getHours() * 60 + new Date().getMinutes();
  const hours = []; for (let m = t0; m <= t1; m += 60) hours.push(m);
  const cols = DAYS.map((d) => {
    const p = plans[d], th = DAY_THEMES[d], w = dayWeather(d), e = p.ess, lv = p.level, bad = new Set(p.issues.flatMap((is) => [is.a.loc.id, is.b.loc.id]));
    const sunset = w.set ? (() => { const [h, m] = w.set.split(':').map(Number); return h * 60 + m; })() : null;
    const ok = (b, ic, t) => `<span class="hq-ess ${b ? 'ok' : 'miss'}" title="${t}">${icon(ic, 'i-16 ms-fill')}</span>`;
    // Două opriri care se suprapun (o problemă din plan) stau una lângă alta, pe jumătăți de coloană
    const lane = p.slots.map((sl, i) => (i && sl.start < p.slots[i - 1].end - 4 ? 'lane-r' : p.slots[i + 1] && p.slots[i + 1].start < sl.end - 4 ? 'lane-l' : ''));
    let prev = null; const blocks = p.slots.map((sl, si) => {
      const loc = sl.loc, en = enriched(loc), ck = catKey(en.cat), c = cat(en.cat), top = y(sl.start), h = Math.max(22, y(sl.end) - top - 2);
      let leg = '';
      if (prev && sl.leg && sl.start > prev.end) { const gTop = y(prev.end), gH = y(sl.start) - gTop; if (gH >= 13) leg = `<div class="hq-leg-gap" style="top:${gTop}px;height:${gH}px">${icon(sl.leg.icon, 'i-16')}${gH >= 20 ? `<span>${fmtMin(sl.leg.min)}</span>` : ''}</div>`; }
      prev = sl; const v = !!state.shared.visited[loc.id], b = bookOf(loc), needB = needsBooking(b) && !isBooked(loc.id), rx = reactionsOf(loc.id), rxs = Object.values(rx), who = whoHas(loc.id);
      const flags = [bad.has(loc.id) ? icon('warning', 'i-16 ms-fill', 'color: var(--red)') : '', v ? icon('check_circle', 'i-16 ms-fill', 'color: var(--green)') : '', needB ? icon('event_upcoming', 'i-16', 'color: var(--amber)') : isBooked(loc.id) ? icon('event_available', 'i-16 ms-fill', 'color: var(--green)') : '', loc.id === p.coffeeId ? icon('coffee', 'i-16 ms-fill', 'color: #8D5524') : '', mealSlotOf(loc) && mealRows(mealSlotOf(loc)).length > 1 ? icon('ballot', 'i-16', 'color: var(--green)') : ''].filter(Boolean).join('');
      const label = `${DAY_LABEL[d]}, ${hhmm(sl.start)}–${hhmm(sl.end)}: ${loc.title}, ${c.label}${v ? ', am fost' : ''}${needB ? ', de rezervat' : isBooked(loc.id) ? ', rezervat' : ''}${bad.has(loc.id) ? ', are o problemă' : ''}`;
      return `${leg}<button data-action="open-detail" data-id="${esc(loc.id)}" data-hq-id="${esc(loc.id)}" ${loc.fixed ? '' : `data-drag-id="${esc(loc.id)}" data-start="${sl.start}" data-end="${sl.end}"`} data-hl="cat-${ck}${needB ? ' need' : ''}${isBooked(loc.id) ? ' booked' : ''}${mealSlotOf(loc) && mealRows(mealSlotOf(loc)).length > 1 ? ' meal' : ''}${bad.has(loc.id) ? ' bad' : ''}" class="hq-blk k-${ck} ${v ? 'done' : ''} ${bad.has(loc.id) ? 'bad' : ''} ${h < 34 ? 'tiny' : ''} ${loc.fixed ? 'fixed' : ''} ${loc.id === p.coffeeId ? 'am-coffee' : ''} ${lane[si]}" style="top:${top}px;height:${h}px;--lines:${Math.max(1, Math.min(3, Math.floor((h - 22 - (h >= 52 && (rxs.length || who.length) ? 16 : 0)) / 16)))}" aria-label="${esc(label)}" title="${esc(label)}">
        <span class="hq-blk-h">${icon(smartIcon(en), 'i-16')}<span class="hq-blk-t">${esc(shortTitle(loc.title))}</span>${flags ? `<span class="hq-blk-f">${flags}</span>` : ''}</span>
        ${h >= 34 ? `<span class="hq-blk-m">${sl.auto ? '~' : ''}${hhmm(sl.start)}–${hhmm(sl.end)}</span>` : ''}
        ${h >= 52 && (rxs.length || who.length) ? `<span class="hq-blk-s">${rxs.map((k) => reactEmoji(k)).join('')}${who.map((pp) => `<i class="p-${pp}">${PEOPLE_META[pp].name[0]}</i>`).join('')}</span>` : ''}
        ${loc.fixed ? '' : '<span class="drag-rs" aria-hidden="true"></span>'}
      </button>`;
    }).join('');
    return `<div class="hq-col ${d === sel ? 'sel' : ''} ${d === today ? 'today' : ''}" data-day="${d}" style="--th:${th.color}">
      <div class="hq-col-h">
        <button data-action="hq-day" data-day="${d}" class="hq-col-btn press" aria-pressed="${d === sel}" aria-label="Arată ${DAY_LABEL[d]} pe hartă">
          <span class="hq-col-top"><span class="hq-col-ic">${icon(th.icon, 'i-18 ms-fill')}</span><span class="hq-col-d"><span class="dl">${DAY_LABEL[d]}</span><span class="ds">${DAY_SHORT[d][0]} ${DAY_SHORT[d][1]}</span></span><span class="lights lv-${lv}" title="${LOAD[lv][0]}"><i></i><i></i><i></i></span></span>
          <span class="hq-col-n">${esc(th.name)}</span>
          <span class="hq-col-m">${roN(p.slots.length, 'oprire', 'opriri')}${p.walkT ? ` · ${fmtMin(p.walkT)} pe jos` : ''}</span>
          <span class="hq-col-w">${icon(w.ic, 'i-16 ms-fill', 'color: var(--star)')}${esc(w.txt)}${w.live && w.rain != null ? ` · ${w.rain}% ploaie` : w.live ? '' : ' de obicei'}</span>
          <span class="hq-col-e">${ok(e.coffee >= 2, 'coffee', (e.coffee >= 2 ? `${e.coffee} cafenele` : `${e.coffee}/2 cafenele`))}${ok(e.lunch, 'lunch_dining', 'prânz')}${ok(e.dinner, 'restaurant', 'cină')}${ok(e.sweet >= 2, 'icecream', (e.sweet >= 2 ? `${e.sweet} dulciuri` : `${e.sweet}/2 dulciuri`))}<span class="hq-col-in">${p.issues.length ? `${icon('warning', 'i-16 ms-fill', 'color: var(--red)')}${p.issues.length}` : ''}</span></span>
        </button>
        <button data-action="hq-open-day" data-day="${d}" class="icon-btn sm press hq-col-open" aria-label="Deschide ${DAY_LABEL[d]} în Plan" title="Deschide ziua">${icon('open_in_new', 'i-18')}</button>
      </div>
      <div class="hq-col-b" data-dz data-day="${d}" data-t0="${t0}" data-ppm="${HQ_SCALE}" style="height:${H}px">
        ${sunset && sunset < t1 ? `<div class="hq-dusk" style="top:${y(sunset)}px"><span>${icon('wb_twilight', 'i-16')} apus ${w.set}</span></div>` : ''}
        ${d === today && nowMin > t0 && nowMin < t1 ? `<div class="hq-now" style="top:${y(nowMin)}px"></div>` : ''}
        ${blocks || '<div class="hq-empty">Nimic încă</div>'}
      </div>
    </div>`;
  }).join('');
  const allSlots = DAYS.flatMap((d) => plans[d].slots), badIds = new Set(DAYS.flatMap((d) => plans[d].issues.flatMap((is) => [is.a.loc.id, is.b.loc.id])));
  const cnt = { need: allSlots.filter((sl) => needsBooking(bookOf(sl.loc)) && !isBooked(sl.loc.id)).length, booked: allSlots.filter((sl) => isBooked(sl.loc.id)).length, meal: allSlots.filter((sl) => mealSlotOf(sl.loc) && mealRows(mealSlotOf(sl.loc)).length > 1).length, bad: allSlots.filter((sl) => badIds.has(sl.loc.id)).length };
  const lg = (key, inner, n, label) => `<button data-action="hq-hl" data-hl="${key}" class="hq-lg press ${hq.hl === key ? 'on' : ''}" aria-pressed="${hq.hl === key}" ${n ? '' : 'disabled'} title="${n ? `Arată pe tablă: ${esc(label)}` : 'Niciunul'}">${inner}<span>${esc(label)} <b class="hq-lg-n">(${n})</b></span></button>`;
  const legend = `<div class="hq-legend-row" role="toolbar" aria-label="Legenda: atinge ca să evidențiezi pe tablă">${CAT_KEYS.map((k) => lg(`cat-${k}`, '<i></i>', allSlots.filter((sl) => catKey(enriched(sl.loc).cat) === k).length, CAT[k].label).replace('class="hq-lg', `class="k-${k} hq-lg`)).join('')}<span class="sep"></span>${lg('need', icon('event_upcoming', 'i-16', 'color: var(--amber)'), cnt.need, 'de rezervat')}${lg('booked', icon('event_available', 'i-16 ms-fill', 'color: var(--green)'), cnt.booked, 'rezervat')}${lg('meal', icon('ballot', 'i-16', 'color: var(--green)'), cnt.meal, 'variante de masă')}${lg('bad', icon('warning', 'i-16 ms-fill', 'color: var(--red)'), cnt.bad, 'problemă')}</div>`;
  return legend + `<div class="hq-board ${hq.hl ? 'hl-on' : ''}" data-hl-key="${esc(hq.hl || '')}" style="--hour:${60 * HQ_SCALE}px">
    <div class="hq-axis"><div class="hq-axis-h"></div><div class="hq-axis-b" style="height:${H}px">${hours.map((m) => `<span style="top:${y(m)}px">${hhmm(m)}</span>`).join('')}</div></div>
    ${cols}
  </div>`;
}
function hqPanelsHTML(s) {
  // Înainte de plecare: rezervări, bagaj, problemele din plan, locuri fără zi
  const bk = s.book, pk = s.pack, meter = (done, total, tone) => `<div class="hq-meter ${tone}" role="img" aria-label="${done} din ${total}"><i style="width:${total ? Math.round((done / total) * 100) : 0}%"></i></div>`;
  const ready = `<section class="hq-panel hq-ready" id="hqReady"><h2 class="hq-h">Înainte de plecare</h2>
    <div class="hq-sub-h"><span>Rezervări</span><span class="tabular">${bk.done} din ${bk.total}</span></div>${meter(bk.done, bk.total, bk.done === bk.total ? 'ok' : 'warn')}
    <div class="hq-list">${bk.items.map((l) => { const b = bookOf(l), okb = isBooked(l.id), w = bookWhen(l); return `<div class="hq-row">${icon(okb ? 'check_circle' : 'radio_button_unchecked', 'i-20' + (okb ? ' ms-fill' : ''), `color: var(--${okb ? 'green' : 'text-3'})`)}<button data-action="open-detail" data-id="${esc(l.id)}" class="hq-row-t"><b>${esc(b?.label || shortTitle(l.title))}</b><span>${w ? `${DAY_LABEL[w.day]}${w.time ? ', ' + w.time : ''}` : 'recomandare'} · ${okb ? 'rezervat' : (BOOK_NEED[b?.need] || BOOK_NEED.recomandat)[0].toLowerCase()}</span></button><button data-action="book" data-id="${esc(l.id)}" class="btn btn-sm ${okb ? 'btn-booked' : 'btn-book'} press">${okb ? 'Gata' : 'Rezervă'}</button></div>`; }).join('') || '<p class="cap">Nimic de rezervat.</p>'}</div>
    <div class="hq-sub-h mt-5"><span>Bagaj</span><span class="tabular">${pk.done} din ${pk.total}</span></div>${meter(pk.done, pk.total, pk.done >= pk.total ? 'ok' : '')}
    <button data-action="hq-packing" class="btn btn-sm btn-outline press mt-3">${icon('luggage', 'i-18')} Deschide lista de bagaj</button>
    <div class="hq-sub-h mt-5"><span>Planul</span><span>${s.issues.length ? roN(s.issues.length, 'problemă', 'probleme') : 'fără probleme'}</span></div>
    ${s.issues.length ? `<div class="hq-list">${s.issues.slice(0, 6).map((is) => `<button data-action="hq-open-day" data-day="${esc(is.b.loc.day)}" class="hq-row hq-row-btn">${icon('warning', 'i-20 ms-fill', 'color: var(--red)')}<span class="hq-row-t"><b>${esc(shortTitle(is.b.loc.title))}</b><span>${DAY_LABEL[is.b.loc.day] || ''} · ${is.type === 'closed' ? 'închis în ziua asta' : is.type === 'late' ? `închide la ${is.close}` : is.type === 'overlap' ? `se suprapune cu ${esc(shortTitle(is.a.loc.title))}` : `~${is.late} min întârziere`}</span></span></button>`).join('')}</div>` : `<p class="hq-okline">${icon('check_circle', 'i-20 ms-fill', 'color: var(--green)')} Toate cele 5 zile încap: prânz, cină, cafea și dulce în fiecare zi.</p>`}
    ${s.pool.length ? `<div class="hq-sub-h mt-5"><span>Locuri dorite, fără zi</span><span class="tabular">${s.pool.length}</span></div><p class="cap">${s.pool.slice(0, 4).map((l) => esc(shortTitle(l.title))).join(', ')}${s.pool.length > 4 ? '…' : ''}</p><button data-action="hq-pool" class="btn btn-sm btn-outline press mt-2">${icon('bookmark', 'i-18')} Pune-le în zile</button>` : ''}
  </section>`;
  // Ce vrea fiecare
  const people = `<section class="hq-panel hq-people"><h2 class="hq-h">Ce vrea fiecare</h2><div class="hq-ppl">${PERSONS.map((pp) => {
    const m = PEOPLE_META[pp], items = bucketOf(pp), done = items.filter((i) => i.done).length, pct = items.length ? Math.round((done / items.length) * 100) : 0, cnt = counterOf(m.counter.key), next = items.filter((i) => !i.done).slice(0, 4);
    return `<div class="hq-person"><div class="hq-person-h"><div class="prog" style="--p:${pct}; --ring: var(--p-${pp})"><span class="avatar p-${pp}">${m.name[0]}</span></div><div class="min-w-0"><div class="hq-person-n">${m.name}</div><div class="cap">${done} din ${items.length} bifate · ${cnt}/${m.counter.goal} ${esc(m.counter.unit)}</div></div></div>
      <ul class="hq-wish">${next.map((it) => { const l = it.loc ? findLoc(it.loc) : null; return `<li><button data-action="${l ? 'open-detail' : 'hq-person'}" data-id="${l ? esc(l.id) : ''}" data-person="${pp}"><span>${esc(it.text)}</span>${l && DAYS.includes(l.day) ? `<span class="cap">${DAY_SHORT[l.day][0]} ${DAY_SHORT[l.day][1]}</span>` : ''}</button></li>`; }).join('') || '<li class="cap">Totul bifat. Bravo!</li>'}</ul>
      <button data-action="hq-person" data-person="${pp}" class="btn btn-sm btn-text press">Lista lui ${m.name}</button></div>`; }).join('')}</div></section>`;
  // Păreri și reacții: favoritele familiei + ultimele comentarii
  const SCORE = { love: 2, good: 1, nope: -1 };
  const favs = Object.entries(state.shared.reactions || {}).map(([id, rx]) => ({ id, rx: rx || {}, loc: findLoc(id), score: Object.values(rx || {}).reduce((a, k) => a + (SCORE[k] ?? 0), 0) })).filter((f) => f.loc && f.score > 0).sort((a, b) => b.score - a.score).slice(0, 5);
  const notes = Object.entries(state.shared.comments || {}).flatMap(([id, list]) => (Array.isArray(list) ? list : []).map((c) => ({ ...c, id }))).filter((c) => findLoc(c.id)).sort((a, b) => (b.at || 0) - (a.at || 0)).slice(0, 4);
  const voices = `<section class="hq-panel hq-voices"><h2 class="hq-h">Păreri și reacții</h2>
    <div class="hq-sub-h"><span>Favoritele familiei</span></div>
    ${favs.length ? `<div class="hq-list">${favs.map((f) => `<button data-action="open-detail" data-id="${esc(f.id)}" class="hq-row hq-row-btn">${thumbHTML(enriched(f.loc), 40)}<span class="hq-row-t"><b>${esc(shortTitle(f.loc.title))}</b><span>${DAYS.includes(f.loc.day) ? DAY_LABEL[f.loc.day] : isPool(f.loc) ? 'dorit' : 'recomandare'}</span></span><span class="react-who">${PERSONS.filter((pp) => f.rx[PEOPLE_META[pp].name]).map((pp) => `<span class="react-chip p-${pp}"><b>${PEOPLE_META[pp].name[0]}</b>${reactEmoji(f.rx[PEOPLE_META[pp].name])}</span>`).join('')}</span></button>`).join('')}</div>` : '<p class="cap">Încă nicio reacție. Pe fiecare loc din program alegeți 😍, 👍 sau 👎.</p>'}
    <div class="hq-sub-h mt-5"><span>Ultimele păreri</span></div>
    ${notes.length ? `<div class="hq-list">${notes.map((c) => `<button data-action="open-detail" data-id="${esc(c.id)}" class="hq-row hq-row-btn hq-note"><span class="avatar p-${personKey(c.by)}">${esc((c.by || '?')[0])}</span><span class="hq-row-t"><span><b>${esc(c.by)}</b> la ${esc(shortTitle(findLoc(c.id).title))} · ${agoText(c.at)}</span><span class="hq-note-t">${esc(c.text)}</span></span></button>`).join('')}</div>` : '<p class="cap">Nicio notă încă. Scrieți ce vreți să comandați sau ce nu vreți să ratați.</p>'}
  </section>`;
  // Buget: o singură serie (estimatul) până începem să cheltuim; apoi estimat vs cheltuit
  const per = DAYS.map((d) => ({ d, e: dayBudget(d), sp: expenses().filter((x) => x.day === d).reduce((a, x) => a + (+x.amount || 0), 0) })), max = Math.max(1, ...per.map((x) => Math.max(x.e, x.sp))), two = s.spent > 0;
  const budget = `<section class="hq-panel hq-budget"><h2 class="hq-h">${typeof bplan().total === 'number' ? 'Bugetul nostru' : 'Buget estimat'}</h2>
    <div class="hq-money"><span class="hq-money-v">≈ ${eurN(s.est)}</span><span class="cap">pentru trei · ≈ ${eurN(s.est / 3)} de persoană${two ? ` · cheltuit ${eurN(s.spent)}` : ''}</span></div>
    ${two ? `<div class="hq-legend"><span><i class="lg-est"></i>estimat</span><span><i class="lg-sp"></i>cheltuit</span></div>` : ''}
    <div class="hq-bars ${two ? 'two' : ''}">${per.map((x) => `<button data-action="add-expense" data-day="${x.d}" class="hq-bar-row press" title="${DAY_LABEL[x.d]}: estimat ≈ ${eurN(x.e)}${x.sp ? `, cheltuit ${eurN(x.sp)}` : ''}. Adaugă o cheltuială.">
      <span class="hq-bar-l">${DAY_SHORT[x.d][0]} ${DAY_SHORT[x.d][1]}</span>
      <span class="hq-bar-track"><i class="est" style="width:${(x.e / max) * 100}%"></i>${two ? `<i class="sp" style="width:${(x.sp / max) * 100}%"></i>` : ''}</span>
      <span class="hq-bar-v tabular">${x.e ? '≈ ' + eurN(x.e) : '—'}</span></button>`).join('')}</div>
    <button data-action="hq-open-budget" class="btn btn-sm btn-outline press mt-4">${icon('payments', 'i-18')} Cheltuieli și împărțeala</button>
  </section>`;
  const mealCell = (d, m) => { const k = `${d}-${m}`, rows = mealRows(k); if (!rows.length) return '<span class="hq-meal cap">—</span>'; const c = rows[0], lead = rows.slice(1).find((o) => o.score > c.score), open = hq.meal === k;
    return `<button data-action="hq-meal" data-key="${k}" class="hq-meal ${open ? 'on' : ''}" aria-expanded="${open}"><b>${esc(shortTitle(c.loc.title))}</b><span>${rows.length > 1 ? `${rows.length} variante` : 'o singură variantă'}${c.score ? ` · ${c.score > 0 ? '+' : ''}${c.score} voturi` : ''}${lead ? ` · favorit: ${esc(shortTitle(lead.loc.title))}` : ''}</span>${rows.length > 1 ? `<i class="hq-meal-sw">${icon(open ? 'expand_less' : 'expand_more', 'i-18')}</i>` : ''}</button>`; };
  const meals = `<section class="hq-panel hq-meals"><h2 class="hq-h">Prânz și cină</h2><div class="hq-meal-grid"><span></span><span class="cap">Prânz</span><span class="cap">Cină</span>
    ${DAYS.map((d) => `<span class="hq-meal-d"><i style="background:${DAY_THEMES[d].color}"></i>${DAY_SHORT[d][0]} ${DAY_SHORT[d][1]}</span>${mealCell(d, 'lunch')}${mealCell(d, 'dinner')}${hq.meal && hq.meal.startsWith(d + '-') ? `<div class="hq-meal-edit"><div class="cap mb-1">${MEAL_LABEL[hq.meal.split('-')[1]]} · ${DAY_LABEL[d]}</div>${mealOptsHTML(hq.meal)}</div>` : ''}`).join('')}
  </div><p class="cap mt-3">Atingeți o masă ca să vedeți variantele: votați 👍 / 👎 și alegeți direct de aici.</p></section>`;
  return ready + people + meals + voices + budget;
}
function renderHQMapBar() {
  const bar = $('#hqMapBar'), note = $('#hqMapNote'); if (!bar) return; const d = hqDay(), p = planDay(d), th = DAY_THEMES[d];
  bar.innerHTML = DAYS.map((x) => `<button data-action="hq-day" data-day="${x}" class="hq-chip press ${x === d ? 'on' : ''}" style="--th:${DAY_THEMES[x].color}" aria-pressed="${x === d}"><i></i>${DAY_SHORT[x][0]} ${DAY_SHORT[x][1]}</button>`).join('');
  if (note) note.innerHTML = `<div class="hq-map-day"><span class="hq-col-ic" style="--th:${th.color}">${icon(th.icon, 'i-18 ms-fill')}</span><div class="min-w-0 flex-1"><div class="font-medium truncate">${DAY_LABEL[d]} · ${esc(th.name)}</div><div class="cap truncate">${roN(p.slots.length, 'oprire', 'opriri')}${p.walkT ? ` · ${fmtMin(p.walkT)} pe jos` : ''}${p.other ? ` · +${fmtMin(p.other)} cu trenul sau metroul` : ''}. Gri: celelalte zile.</div></div><button data-action="hq-route" data-day="${d}" class="btn btn-sm btn-primary press">${icon('route', 'i-18')} Traseul zilei</button></div>`;
}
function renderHQ() {
  if (!isDesk() || state.view !== 'hq') return;
  const s = hqStats(); renderHQHero();
  const b = $('#hqBoard'); if (b) { b.innerHTML = hqBoardHTML(); hqBoardEvents(); hqApplyHl(); }
  const pn = $('#hqPanels'); if (pn) pn.innerHTML = hqPanelsHTML(s);
  renderHQMapBar(); renderHQMap();
}
// Harta din centru: ziua la care vă uitați e colorată și numerotată, restul tripului rămâne gri, pentru context
function ensureHQMap() {
  if (!state.hqMap && window.L && $('#hqMap')) {
    const map = L.map('hqMap', { zoomControl: true, scrollWheelZoom: false }).setView([41.39, 2.17], 12);
    const tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; OpenStreetMap' }).addTo(map); let fails = 0; tiles.on('tileerror', () => { if (++fails === 6) tiles.setUrl('https://tile.openstreetmap.de/{z}/{x}/{y}.png'); });
    map.on('click focus', () => map.scrollWheelZoom.enable()); map.on('mouseout blur', () => map.scrollWheelZoom.disable());
    state.hqMap = map; renderHQMap();
  }
  setTimeout(() => { state.hqMap?.invalidateSize(); hqFit(); }, 80);
}
let hqBounds = null;
function hqFit() { if (state.hqMap && hqBounds?.length) state.hqMap.fitBounds(coreBounds(hqBounds), { padding: [44, 44], maxZoom: 15 }); }
function renderHQMap() {
  const map = state.hqMap; if (!map) return; hq.layers.forEach((l) => l.remove()); hq.layers = []; hq.pins = {};
  const d = hqDay(), color = DAY_THEMES[d].color, surf = getComputedStyle(document.documentElement).getPropertyValue('--surface').trim() || '#fff';
  for (const od of DAYS) { if (od === d) continue; for (const l of planDay(od).slots.map((x) => x.loc)) { const p = coordsOf(l); if (!p) continue; const m = L.circleMarker([p.lat, p.lng], { radius: 4, weight: 2, color: surf, fillColor: '#9AA0A6', fillOpacity: 0.95 }).addTo(map); m.bindTooltip(`${DAY_LABEL[od]} · ${esc(shortTitle(l.title))}`, { direction: 'top', offset: [0, -4] }); m.on('click', () => openDetail(l.id)); hq.layers.push(m); } }
  const slots = planDay(d).slots, line = slots.map((x) => coordsOf(x.loc)).filter(Boolean).map((p) => [p.lat, p.lng]);
  if (line.length > 1) hq.layers.push(L.polyline(line, { color, weight: 3, opacity: 0.75, lineCap: 'round', lineJoin: 'round' }).addTo(map));
  hqBounds = [];
  slots.forEach((sl, i) => { const l = sl.loc, p = coordsOf(l); if (!p) return; const v = !!state.shared.visited[l.id];
    const m = L.marker([p.lat, p.lng], { icon: L.divIcon({ className: '', html: `<div class="hq-pin ${v ? 'done' : ''}" style="--dc:${color}">${i + 1}</div>`, iconSize: [26, 26], iconAnchor: [13, 13] }), zIndexOffset: 400 + i, keyboard: false }).addTo(map);
    m.bindTooltip(`${hhmm(sl.start)} · ${esc(shortTitle(l.title))}`, { direction: 'top', offset: [0, -12] }); m.on('click', () => openDetail(l.id)); m.on('mouseover', () => hqHighlight(l.id, true)); m.on('mouseout', () => hqHighlight(l.id, false));
    hq.layers.push(m); hq.pins[l.id] = m; hqBounds.push([p.lat, p.lng]); });
  const b = TRIP.base; const hm = L.marker([b.lat, b.lng], { icon: L.divIcon({ className: '', html: `<div class="pin home">${icon('hotel', 'i-16 ms-fill')}</div>`, iconSize: [28, 28], iconAnchor: [14, 14] }), zIndexOffset: 300 }).addTo(map); hm.bindTooltip('Cazarea, Pellaires 35', { direction: 'top', offset: [0, -14] }); hm.on('click', () => openHome()); hq.layers.push(hm);
  hqFit();
}
// Legenda: o etichetă aleasă evidențiază pe tablă doar blocurile de felul ei
function hqSetHl(key) { hq.hl = key && key !== hq.hl ? key : null; buzz(6); sfx('blip'); hqApplyHl(); }
function hqApplyHl() {
  const board = $('#hqBoard .hq-board'); if (!board) return; board.classList.toggle('hl-on', !!hq.hl);
  $$('#hqBoard .hq-blk').forEach((b) => b.classList.toggle('hl-match', !!hq.hl && (b.dataset.hl || '').split(' ').includes(hq.hl)));
  $$('#hqBoard .hq-lg[data-hl]').forEach((b) => { const on = !!hq.hl && b.dataset.hl === hq.hl; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); });
  const row = $('#hqBoard .hq-legend-row'); if (row) { row.querySelector('.hq-lg-clear')?.remove(); if (hq.hl) row.insertAdjacentHTML('beforeend', `<button data-action="hq-hl" data-hl="" class="hq-lg hq-lg-clear press">${icon('close', 'i-16')}<span>Toate</span></button>`); }
}
function hqHighlight(id, on) {
  $$(`#hqBoard [data-hq-id="${CSS.escape(id)}"]`).forEach((el) => el.classList.toggle('hl', on));
  const m = hq.pins[id]; if (m) { m.getElement()?.firstElementChild?.classList.toggle('hl', on); if (on) m.openTooltip(); else m.closeTooltip(); }
}
// Ziua de pe hartă: clic o fixează; trecerea cu mouse-ul peste o coloană o arată, după o mică pauză
function hqSetDay(d, sticky = true) {
  if (!DAYS.includes(d)) return; if (sticky) { hq.day = d; hq.hoverDay = null; } else hq.hoverDay = d;
  $$('#hqBoard .hq-col').forEach((c) => { c.classList.toggle('sel', c.dataset.day === hqDay()); c.querySelector('.hq-col-btn')?.setAttribute('aria-pressed', c.dataset.day === hqDay()); });
  renderHQMapBar(); renderHQMap();
}
function hqBoardEvents() {
  const b = $('#hqBoard'); if (!b || b.dataset.wired) return; b.dataset.wired = '1';
  b.addEventListener('mouseover', (e) => {
    const blk = e.target.closest('.hq-blk'); if (blk) { $$('#hqBoard .hq-blk.hl').forEach((x) => x !== blk && x.classList.remove('hl')); hqHighlight(blk.dataset.hqId, true); }
    const col = e.target.closest('.hq-col'); if (!col || col.dataset.day === hqDay()) { clearTimeout(hq.timer); return; }
    clearTimeout(hq.timer); hq.timer = setTimeout(() => { hqSetDay(col.dataset.day, false); if (blk) hqHighlight(blk.dataset.hqId, true); }, 260);
  });
  b.addEventListener('mouseout', (e) => { const blk = e.target.closest('.hq-blk'); if (blk && !blk.contains(e.relatedTarget)) hqHighlight(blk.dataset.hqId, false); });
  b.addEventListener('mouseleave', () => { clearTimeout(hq.timer); if (hq.hoverDay) { hq.hoverDay = null; hqSetDay(hq.day || state.day); } });
  b.addEventListener('focusin', (e) => { const blk = e.target.closest('.hq-blk'); const col = e.target.closest('.hq-col'); if (col && col.dataset.day !== hqDay()) hqSetDay(col.dataset.day, false); if (blk) hqHighlight(blk.dataset.hqId, true); });
  b.addEventListener('focusout', (e) => { const blk = e.target.closest('.hq-blk'); if (blk) hqHighlight(blk.dataset.hqId, false); });
}


// ---------- Arată un loc pe hartă: zbor până acolo, pin care pulsează și o fișă mică ----------
function focusOnMap(id) {
  const map = state.map, loc = findLoc(id), p = loc && coordsOf(loc); state.focusId = null; if (!map || !p) return;
  const again = state.focusHold?.id === id, stale = map.getSize().x !== map.getContainer().clientWidth; state.focusHold = { id, until: Date.now() + 6000 }; map.invalidateSize();
  let m = state.markerById[id];
  if (!m) { m = L.marker([p.lat, p.lng], { icon: L.divIcon({ className: '', html: `<div class="pin new">${icon(smartIcon(enriched(loc)), 'i-18')}</div>`, iconSize: [34, 34], iconAnchor: [17, 17] }), zIndexOffset: 2500 }).addTo(map); m.on('click', () => openDetail(id)); m.bindTooltip(esc(shortTitle(loc.title || '')), { permanent: true, direction: 'bottom', offset: [0, 14], className: 'pin-lbl' }); state.focusMarker = m; }
  const z = Math.max(map.getZoom(), 17);
  const done = () => {
    $$('.pin.focus').forEach((x) => x.classList.remove('focus')); $$('.pin-lbl.is-focus').forEach((x) => x.classList.remove('is-focus'));
    m.setZIndexOffset(3000); m.getTooltip()?.getElement()?.classList.add('is-focus');
    const el = m.getElement()?.firstElementChild; if (el) { void el.offsetWidth; el.classList.add('focus'); }
    const e = enriched(loc), when = DAYS.includes(loc.day) ? `${DAY_LABEL[loc.day]}${parseRange(loc.time) ? ' · ' + hhmm(parseRange(loc.time).from) : ''}` : isPool(loc) ? 'dorit, fără zi' : 'recomandare';
    L.popup({ offset: [0, -14], closeButton: false, className: 'focus-pop', autoPan: true }).setLatLng([p.lat, p.lng]).setContent(`<div class="fp"><div class="fp-t">${esc(loc.title)}</div><div class="fp-s">${esc(when)} · ${esc(cat(e.cat).label)}</div><div class="fp-a"><button data-action="open-detail" data-id="${esc(id)}" class="btn btn-sm btn-tonal press">Detalii</button><a href="${esc(mapsNav(loc))}" target="_blank" rel="noopener" class="btn btn-sm btn-primary press">${icon('directions', 'i-18')} Traseu</a></div></div>`).openOn(map);
  };
  // Prima dată zboară până acolo; dacă harta abia s-a deschis sau se redesenează, sare direct
  if (again || stale || RM()) { map.setView([p.lat, p.lng], z, { animate: false }); setTimeout(done, 30); }
  else { map.once('moveend', done); map.flyTo([p.lat, p.lng], z, { duration: 0.8 }); }
}
function showOnMap(id) {
  const loc = findLoc(id); if (!loc) return; if (!coordsOf(loc)) return toast('Nu știu încă unde e exact. Deschideți-l în Google Maps sau „Fixează aici” când sunteți acolo.', 'wrong_location', 4500);
  closeModals(); state.focusId = id;
  if (DAYS.includes(loc.day) && loc.day !== state.day) { state.day = loc.day; state.filter = 'all'; renderDay(); renderNextStop(); }
  if (state.view !== 'explore') setView('explore'); else { ensureMap(); renderMap(); }
}
// ---------- Căutare în tot tripul: locuri, zile, categorii, zone ----------
const DAY_WORDS = { thu: 'joi 5 joia', fri: 'vineri 6', sat: 'sambata 7 sambata', sun: 'duminica 8', mon: 'luni 9' };
const CAT_WORDS = { coffee: 'cafea cafenea espresso bere', food: 'mancare restaurant pranz cina masa tapas', sweet: 'dulce dulciuri desert gelato inghetata prajitura churros', shop: 'shopping magazin cumparaturi haine', fun: 'distractie parc atractii', art: 'arta muzeu vedere gaudi monument plimbare' };
function searchIndex() {
  const seen = new Set(), rows = [];
  const add = (loc, kind) => { if (!loc || seen.has(loc.id)) return; seen.add(loc.id); const e = enriched(loc), k = catKey(e.cat);
    const own = fold([loc.title, e.short, e.address, e.catLabel, e.rec, (e.popular || []).join(' ')].filter(Boolean).join(' '));
    rows.push({ loc, kind, title: fold(loc.title), own, hay: own + ' ' + fold([ZONES[e.zone]?.label, CAT_WORDS[k], DAY_WORDS[loc.day], cat(e.cat).label].filter(Boolean).join(' ')) }); };
  for (const l of allLocs()) add(l, DAYS.includes(l.day) ? 'plan' : 'pool');
  ALTERNATIVES.forEach((a, i) => add(altAsLoc(i), 'alt'));
  return rows;
}
function searchResults(q) {
  const f = fold(q).trim(); if (!f) return [];
  const words = f.split(/\s+/).filter(Boolean), K = { plan: 0, pool: 1, alt: 2 };
  return searchIndex().filter((r) => words.every((w) => r.hay.includes(w)))
    .map((r) => ({ ...r, score: (r.title.startsWith(f) ? 0 : r.title.includes(f) ? 1 : words.every((w) => r.title.includes(w)) ? 2 : words.every((w) => r.own.includes(w)) ? 3 : 4) * 10 + K[r.kind] }))
    .sort((a, b) => a.score - b.score || dayOrder(a.loc) - dayOrder(b.loc) || startMin(a.loc) - startMin(b.loc)).slice(0, 30);
}
function searchRowHTML(r) {
  const l = r.loc, e = enriched(l), when = r.kind === 'plan' ? `${DAY_LABEL[l.day]}${parseRange(l.time) ? ' · ' + hhmm(parseRange(l.time).from) : ''}` : r.kind === 'pool' ? 'dorit, fără zi' : `recomandare${e.zone && ZONES[e.zone] ? ' · ' + ZONES[e.zone].label : ''}`;
  return `<div class="li tight srch-row k-${catKey(e.cat)}"><button data-action="open-detail" data-id="${esc(l.id)}" class="flex items-center gap-3 flex-1 min-w-0 text-left">${thumbHTML(e, 44)}<span class="min-w-0"><span class="block font-medium truncate">${esc(l.title)}</span><span class="block cap truncate"><i class="srch-dot"></i>${esc(cat(e.cat).label)} · ${esc(when)}</span></span></button>
    <button data-action="show-on-map" data-id="${esc(l.id)}" class="icon-btn ol press" aria-label="Arată ${esc(l.title)} pe hartă" title="Pe hartă">${icon('map', 'i-20', 'color: var(--blue)')}</button></div>`;
}
function renderSearch(q) {
  const box = $('#srchResults'); if (!box) return; const f = fold(q).trim();
  if (!f) { box.innerHTML = `<div class="srch-hints">${['cafea', 'tapas', 'dulciuri', 'sâmbătă', 'Gràcia', 'gratis', 'Gaudí'].map((w) => `<button data-action="srch-hint" data-q="${esc(w)}" class="chip press">${esc(w)}</button>`).join('')}</div><p class="cap mt-3">Caută după nume, zi, categorie sau zonă. Butonul ${icon('map', 'i-16')} arată locul pe hartă.</p>`; return; }
  const res = searchResults(q), groups = [['plan', 'În program'], ['pool', 'Dorite, fără zi'], ['alt', 'Recomandări']];
  box.innerHTML = (res.length ? groups.map(([k, t]) => { const g = res.filter((r) => r.kind === k); return g.length ? `<h3 class="cap srch-g">${t} · ${g.length}</h3><div class="card list">${g.map(searchRowHTML).join('')}</div>` : ''; }).join('') : `<p class="t-2 py-3">Nimic în trip cu „${esc(q)}”.</p>`)
    + `<button data-action="srch-add" data-q="${esc(q)}" class="card li press mt-3 w-full">${icon('add_location_alt', '', 'color: var(--brand)')}<span class="flex-1 text-left"><span class="block font-medium">Nu e aici? Caută „${esc(q)}” pe hartă și adaugă-l</span><span class="block cap">în OpenStreetMap, lângă Barcelona</span></span>${icon('chevron_right', 't-3 i-20')}</button>`;
}
function openSearch(q = '') {
  openSheet(`${sheetHead('Caută în tot tripul', 'Unde e…?')}<div class="search">${icon('search', 'i-20')}<input type="search" id="srchQ" placeholder="Nume, zi, categorie, zonă…" autocomplete="off" enterkeyhint="search" aria-label="Caută un loc" value="${esc(q)}"></div><div id="srchResults" class="mt-3 pb-3"></div>`);
  renderSearch(q); setTimeout(() => $('#srchQ')?.focus(), 200);
}

// ---------- Ferestre libere: unde e timp între opriri și ce încape acolo, după zona în care sunteți ----------
const GAP_MIN = 30;
function zoneNear(locs) {
  // Zona după unde sunteți de fapt (coordonate), nu după eticheta zilei
  const p = locs.map((l) => l && coordsOf(l)).find(Boolean);
  if (p) { let best = null, bd = 1500; for (const a of ALTERNATIVES) { if (typeof a.lat !== 'number' || !ZONES[a.zone]) continue; const d = distanceM(p, a); if (d < bd) { bd = d; best = a.zone; } } return best ? ZONES[best].label : ''; }
  for (const l of locs) { const z = l && enriched(l).zone; if (z && ZONES[z]) return ZONES[z].label; }
  return '';
}
function gapsOf(day, plan = planDay(day)) {
  const s = plan.slots.filter((x) => !state.shared.skipped[x.loc.id]), out = [];
  if (!s.length) return out;
  // Dimineața, pe zilele din Barcelona: de la 9:00 până la prima oprire, plecând de la cazare
  if (['sat', 'sun'].includes(day)) { const f = s[0], t = legOf(baseLoc(), f.loc, day)?.min ?? 0, free = f.start - DAY_START - t; if (free >= 45) out.push({ day, a: null, b: f, from: DAY_START, to: f.start, free, head: true }); }
  for (let i = 1; i < s.length; i++) {
    const a = s[i - 1], b = s[i]; if (a.loc.endsDay || b.loc.endsDay && b.loc.fixed && a.loc.fixed) continue;
    const t = legOf(a.loc, b.loc, day)?.min ?? 0, free = b.start - a.end - t; if (free >= GAP_MIN) out.push({ day, a, b, from: a.end, to: b.start, free });
  }
  // Seara: după ultima oprire, dacă ziua se termină devreme
  const last = s[s.length - 1]; if (!last.loc.endsDay && !s.some((x) => x.loc.endsDay) && last.end <= 21 * 60) out.push({ day, a: last, b: null, from: last.end, to: Math.min(DAY_END, 22 * 60), free: Math.min(DAY_END, 22 * 60) - last.end, tail: true });
  for (const g of out) g.zone = zoneNear([g.a ? originOf(g.a.loc) : null, g.b?.loc]);
  return out;
}
// Ce încape într-o fereastră: locuri dorite (fără zi) și recomandări, deschise atunci, cu ocolul socotit
function gapIdeas(g, plan = planDay(g.day)) {
  const day = g.day, A = g.a ? originOf(g.a.loc) : baseLoc(), B = g.b?.loc, ess = plan.ess, used = new Set(allLocs().filter((l) => DAYS.includes(l.day)).map((l) => fold(l.title)));
  const direct = B ? (legOf(A, B, day)?.min ?? 0) : 0, out = [], planned = allLocs().filter((l) => DAYS.includes(l.day) && !state.shared.skipped[l.id]).map(coordsOf).filter(Boolean), plannedNames = new Set(allLocs().filter((l) => DAYS.includes(l.day)).map((l) => fold(shortTitle(l.title))));
  const cands = [...allLocs().filter((l) => isPool(l) && !isRemoved(l.id)).map((l) => ({ loc: l, wanted: true })), ...ALTERNATIVES.map((x, i) => ({ loc: altAsLoc(i), wanted: false })).filter((c) => !used.has(fold(c.loc.title)))];
  for (const c of cands) {
    const loc = c.loc, e = enriched(loc), p = coordsOf(loc); if (!p) continue; const k = catKey(e.cat);
    if (e.zone === 'elprat' && day !== 'mon') continue; // după securitate: doar la plecare
    if (planned.some((q) => distanceM(p, q) < 80) || plannedNames.has(fold(shortTitle(loc.title)))) continue; // e deja în program (poate sub alt nume)
    if (day === 'mon' && k === 'art' && /muse|muhba|museu|fundaci/i.test(loc.title) && !/lu[ -–]|luni|zilnic|daily/i.test(e.hours || '')) continue; // muzeele sunt închise lunea
    if (e.closed?.includes(day) || (day === 'sun' && k === 'shop' && !/du|dum|zilnic|daily|7\/7/i.test(e.hours || ''))) continue;
    const [open, close0] = OPEN[k] || OPEN.none; const cl = e.closes?.[day] ? (([h, m]) => h * 60 + m)(e.closes[day].split(':').map(Number)) : close0;
    const tIn = legOf(A, loc, day)?.min ?? 0, tOut = B ? (legOf(loc, B, day)?.min ?? 0) : 0, stay = Math.min(stayOf(loc), g.tail ? 90 : 75);
    const start = up5(Math.max(g.from + (g.a ? tIn : 0), open, g.head ? DAY_START + tIn : 0)), end = start + stay;
    if (end > Math.min(cl, B ? g.to - tOut : g.to)) continue;
    const detour = g.a ? tIn + tOut - direct : tOut; if (detour > (c.wanted ? 45 : 30)) continue;
    const need = (k === 'sweet' && ess.sweet < 2) || (k === 'coffee' && ess.coffee < 2 && start < 17 * 60) || (k === 'food' && ((!ess.lunch && start >= 12 * 60 && start < 15 * 60 + 30) || (!ess.dinner && start >= 19 * 60)));
    if (k === 'food' && !need) continue; // mesele sunt deja în program: nu propunem încă un restaurant
    const score = detour - (c.wanted ? 18 : 0) - (need ? 14 : 0) - (e.free ? 4 : 0);
    out.push({ loc, wanted: c.wanted, need, start, end, tIn, detour, score, k });
  }
  out.sort((x, y) => x.score - y.score);
  // Varietate: cel mult două din aceeași categorie în primele idei
  const seen = {}, pick = []; for (const x of out) { if ((seen[x.k] = (seen[x.k] || 0) + 1) > 2 && pick.length < 4) continue; pick.push(x); if (pick.length >= 8) break; }
  return pick;
}
const gapWhere = (g) => g.a?.loc.arrive && g.b && distanceM(g.a.loc.arrive, coordsOf(g.b.loc) || g.a.loc.arrive) < 400 ? `la ${g.a.loc.arrive.title}` : g.zone ? `prin ${g.zone}` : g.a ? `lângă ${shortTitle(g.a.loc.title)}` : 'pornind de la cazare';
function ideaRowHTML(g, x, i) {
  const e = enriched(x.loc), why = [x.wanted ? 'dorit' : '', x.need ? (x.k === 'sweet' ? 'un dulce' : x.k === 'coffee' ? 'încă o cafea' : 'masa zilei') : '', e.free ? 'gratis' : ''].filter(Boolean)[0];
  return `<div class="li idea k-${x.k}"><button data-action="open-detail" data-id="${esc(x.loc.id)}" class="idea-main flex items-start gap-2 flex-1 min-w-0 text-left">${thumbHTML(e, 40)}<span class="min-w-0 flex-1"><span class="block font-medium truncate">${esc(x.loc.title)}</span><span class="block cap truncate">${hhmm(x.start)} · ${x.detour <= 3 ? 'pe drum' : `+${fmtMin(x.detour)} ocol`}</span>${why ? `<span class="idea-badge">${why}</span>` : ''}</span></button>
    <button data-action="gap-place" data-day="${g.day}" data-id="${esc(x.loc.id)}" data-time="${hhmm(x.start)} – ${hhmm(x.end)}" class="icon-btn ol press idea-add" aria-label="Pune ${esc(x.loc.title)} la ${hhmm(x.start)}" title="Pune aici">${icon('add', 'i-20', 'color: var(--brand)')}</button></div>`;
}
function gapHTML(g, idx, plan, seen = new Set()) {
  const all = gapIdeas(g, plan), ideas = [...all.filter((x) => !seen.has(x.loc.id)), ...all.filter((x) => seen.has(x.loc.id))]; ideas.slice(0, 2).forEach((x) => seen.add(x.loc.id)); const when = g.head ? `până la ${hhmm(g.to)}` : g.tail ? `după ${hhmm(g.from)}` : `${hhmm(g.from)} – ${hhmm(g.to)}`;
  return `<li class="gap"><div class="tm"></div><div class="rail"><span class="gap-ic">${icon('more_time', 'i-18')}</span></div><div class="body"><div class="gap-card">
    <div class="gap-h"><b>${g.tail ? 'Seară liberă' : g.head ? 'Dimineață liberă' : `${fmtMin(g.free)} libere`}</b><span class="cap">${when} · ${esc(gapWhere(g))}</span></div>
    ${ideas.length ? `<div class="card list mt-2">${ideas.slice(0, 2).map((x, i) => ideaRowHTML(g, x, i)).join('')}</div>${ideas.length > 2 ? `<button data-action="gap-open" data-day="${g.day}" data-gap="${idx}" class="btn btn-text btn-sm press mt-2">${icon('lightbulb', 'i-18')} ${ideas.length - 2 === 1 ? 'Încă o idee' : `Încă ${ideas.length - 2} idei`} prin zonă</button>` : ''}` : `<p class="cap mt-1">Timp de plimbare, nimic din listă nu încape pe drum.</p>`}
  </div></div></li>`;
}
function openGap(day, idx) {
  const plan = planDay(day), g = gapsOf(day, plan)[idx]; if (!g) return; const ideas = gapIdeas(g, plan);
  openSheet(`${sheetHead(`${DAY_LABEL[day]} · ${g.head ? `până la ${hhmm(g.to)}` : g.tail ? `după ${hhmm(g.from)}` : `${hhmm(g.from)} – ${hhmm(g.to)}`}`, g.tail ? 'Seară liberă' : g.head ? 'Dimineață liberă' : `${fmtMin(g.free)} libere`)}
    <p class="t-2 mb-3">${esc(gapWhere(g)[0].toUpperCase() + gapWhere(g).slice(1))}${g.a ? `, după ${esc(shortTitle(g.a.loc.title))}` : ''}${g.b ? ` și înainte de ${esc(shortTitle(g.b.loc.title))}` : ''}. Ce e deschis atunci și încape cu drum cu tot:</p>
    ${ideas.length ? `<div class="card list">${ideas.map((x, i) => ideaRowHTML(g, x, i)).join('')}</div>` : '<p class="t-2">Nimic din listă nu încape aici. E timp de plimbare.</p>'}
    <button data-action="open-add" class="btn btn-outline press mt-3 mb-3 w-full">${icon('add_location_alt', 'i-18')} Alt loc</button>`);
}
async function gapPlace(day, id, time) {
  const loc = findLoc(id); if (!loc) return; buzz(16); sfx('power');
  if (loc.isAlt) {
    const x = ALTERNATIVES[loc.altIndex], k = catKey(x.cat), data = { title: x.title.slice(0, 120), day, cat: k === 'none' ? 'fun' : k, time, desc: [x.note, x.price ? `Preț: ${x.price}` : ''].filter(Boolean).join('\n').slice(0, 1500), addedBy: PEOPLE.includes(me()) ? me() : 'Daniel', mapLink: mapsSearch(x.title) };
    if (typeof x.lat === 'number') { data.lat = x.lat; data.lng = x.lng; } if (x.address) data.address = x.address.slice(0, 200); if (x.hours) data.hours = String(x.hours).slice(0, 120);
    closeModals(); const nid = await saveLocation(data); toast(`„${shortTitle(x.title)}”: ${DAY_LABEL[day]}, ${time}.`, 'event', 4000); setTimeout(() => goToLoc(nid, day), 300); return;
  }
  closeModals(); scheduleId = id; const prev = { day: loc.day, time: loc.time };
  if (loc.isCustom) { const { id: _i, isCustom, createdAt, ...data } = loc; await saveLocation({ ...data, day, time }, id); }
  else { const days = { ...(state.shared.days || {}), [id]: day }, times = { ...(state.shared.times || {}), [id]: time }; state.shared.days = days; state.shared.times = times; renderAll(); await saveShared({ days, times }); }
  toast(`„${shortTitle(loc.title)}”: ${DAY_LABEL[day]}, ${time}.`, 'event', 5000, { label: 'Anulează', run: () => moveLoc(id, prev.day, prev.time, true) });
  setTimeout(() => goToLoc(id, day), 300);
}

// ---------- Ziua ca în calendar: blocuri pe ore, mutate prin tragere (și pe telefon) ----------
// Pe telefon: țineți apăsat pe un loc ≈ 0,4 s, apoi trageți. Marginea de jos îl lungește sau scurtează.
// Pe laptop: trageți direct cu mouse-ul; în centrul de comandă și în altă zi. Alt+↑/↓ mută cu 15 minute.
const planMode = () => (lsGet(LS.planMode, 'list') === 'cal' ? 'cal' : 'list');
function calHTML(day) {
  const plan = planDay(day), slots = plan.slots; if (!slots.length) return '';
  const gaps = gapsOf(day, plan), ppm = isDesk() ? 1.6 : 1.5;
  let t0 = Math.min(...slots.map((x) => x.start), ...gaps.map((g) => g.from)), t1 = Math.max(...slots.map((x) => x.end), ...gaps.map((g) => g.to));
  t0 = Math.floor(t0 / 60) * 60; t1 = Math.ceil(t1 / 60) * 60; const y = (m) => Math.round((m - t0) * ppm), H = y(t1);
  const hours = []; for (let m = t0; m <= t1; m += 60) hours.push(m);
  const bad = new Set(plan.issues.flatMap((is) => [is.a.loc.id, is.b.loc.id])), nowMin = new Date().getHours() * 60 + new Date().getMinutes();
  const lane = slots.map((sl, i) => (i && sl.start < slots[i - 1].end - 4 ? 'lane-r' : slots[i + 1] && slots[i + 1].start < sl.end - 4 ? 'lane-l' : ''));
  let html = '';
  slots.forEach((sl, i) => {
    const loc = sl.loc, e = enriched(loc), ck = catKey(e.cat), c = cat(e.cat), top = y(sl.start), h = Math.max(26, y(sl.end) - top - 2), v = !!state.shared.visited[loc.id], sk = !!state.shared.skipped[loc.id], fixed = !!loc.fixed;
    if (i && sl.leg && sl.travel) { const a = slots[i - 1], lt = y(a.end), lh = Math.min(y(sl.start), y(a.end + sl.travel)) - lt; if (lh >= 14) html += `<div class="cal-leg" style="top:${lt}px;height:${lh}px">${icon(sl.leg.icon, 'i-16')}<span>${fmtMin(sl.leg.min)}</span></div>`; }
    const label = `${hhmm(sl.start)}–${hhmm(sl.end)}: ${loc.title}${fixed ? ', oră fixă' : ', țineți apăsat ca să-l mutați'}`;
    html += `<div class="cal-blk k-${ck} ${lane[i]} ${fixed ? 'fixed' : ''} ${v ? 'done' : ''} ${sk ? 'skipped' : ''} ${bad.has(loc.id) ? 'bad' : ''} ${h < 40 ? 'tiny' : ''}" ${fixed ? '' : `data-drag-id="${esc(loc.id)}" data-start="${sl.start}" data-end="${sl.end}"`} data-action="open-detail" data-id="${esc(loc.id)}" role="button" tabindex="0" style="top:${top}px;height:${h}px" aria-label="${esc(label)}" title="${esc(label)}">
      <span class="cal-t">${icon(smartIcon(e), 'i-16')}<span class="truncate">${esc(shortTitle(loc.title))}</span>${fixed ? icon('lock', 'i-16', 'opacity:.55;margin-left:auto') : bad.has(loc.id) ? icon('warning', 'i-16 ms-fill', 'color: var(--red);margin-left:auto') : v ? icon('check_circle', 'i-16 ms-fill', 'color: var(--green);margin-left:auto') : ''}</span>
      ${h >= 40 ? `<span class="cal-m">${sl.auto ? '~' : ''}${hhmm(sl.start)}–${hhmm(sl.end)} · ${esc(loc.catLabel || c.label)}</span>` : ''}
      ${fixed ? '' : '<span class="drag-rs" aria-hidden="true"></span>'}
    </div>`;
  });
  gaps.forEach((g, gi) => {
    const from = g.a ? g.from + (g.b ? (legOf(g.a.loc, g.b.loc, day)?.min ?? 0) : 0) : g.from, top = y(from) + 2, h = y(g.to) - top - 4; if (h < 26) return;
    const n = gapIdeas(g, plan).length;
    html += `<button class="cal-gap press" data-action="gap-open" data-day="${day}" data-gap="${gi}" style="top:${top}px;height:${h}px">${icon('more_time', 'i-18')}<span><b>${g.tail ? 'Seară liberă' : g.head ? 'Dimineață liberă' : fmtMin(g.free) + ' libere'}</b>${n ? ` · ${n === 1 ? 'o idee' : n + ' idei'} ${esc(gapWhere(g))}` : ''}</span></button>`;
  });
  return `<p class="cap cal-hint">${icon('drag_pan', 'i-16')} ${isDesk() ? 'Trageți un loc ca să-l mutați, de marginea de jos ca să-l lungiți.' : 'Țineți apăsat pe un loc, apoi trageți-l. Marginea de jos îl lungește.'} Golurile arată ce încape prin zonă.</p>
    <div class="cal" style="--hour:${60 * ppm}px"><div class="cal-axis" style="height:${H}px">${hours.map((m) => `<span style="top:${y(m)}px">${hhmm(m)}</span>`).join('')}</div>
    <div class="cal-b" data-dz data-day="${day}" data-t0="${t0}" data-ppm="${ppm}" style="height:${H}px">${todayKey() === day && nowMin > t0 && nowMin < t1 ? `<div class="hq-now" style="top:${y(nowMin)}px"></div>` : ''}${html}</div></div>`;
}
// Mută un loc (oră și, opțional, zi). Revenirea la ora din program șterge suprascrierea.
async function moveLoc(id, day, time) {
  const loc = findLoc(id); if (!loc) return;
  if (loc.isCustom) { const { id: _i, isCustom, createdAt, movedTime, ...data } = loc; await saveLocation({ ...data, day, time: time || 'Flexibil' }, id); return; }
  const base = ITINERARY.find((l) => l.id === id), days = { ...(state.shared.days || {}), [id]: base && base.day === day ? null : day }, times = { ...(state.shared.times || {}), [id]: !time || (base && base.time === time) ? null : time };
  state.shared.days = days; state.shared.times = times; renderAll(); await saveShared({ days, times });
}
function dropCheck(id, day, ns, ne) {
  const loc = findLoc(id), e = loc && enriched(loc); if (!loc) return { lvl: 'ok', msg: '' };
  const others = planDay(day, id).slots.filter((x) => !state.shared.skipped[x.loc.id]); let prev = null, next = null;
  for (const x of others) { if (x.start <= ns) prev = x; else if (!next) next = x; }
  if (e.closed?.includes(day)) return { lvl: 'bad', msg: `închis ${DAY_LABEL[day].split(' ')[0].toLowerCase()}` };
  const ov = others.find((x) => x.start < ne - 4 && x.end > ns + 4); if (ov) return { lvl: 'bad', msg: `peste ${shortTitle(ov.loc.title)}` };
  const tin = prev ? (legOf(prev.loc, loc, day)?.min ?? 0) : 0, tout = next ? (legOf(loc, next.loc, day)?.min ?? 0) : 0;
  if (prev && prev.end + tin > ns + 5) return { lvl: 'warn', msg: `${fmtMin(tin)} drum de la ${shortTitle(prev.loc.title)}` };
  if (next && ne + tout > next.start + 5) return { lvl: 'warn', msg: `${fmtMin(tout)} până la ${shortTitle(next.loc.title)}` };
  const cl = e.closes?.[day]; if (cl) { const [h, m] = cl.split(':').map(Number); if (ne > h * 60 + m) return { lvl: 'warn', msg: `închide la ${cl}` }; }
  const [o, c] = OPEN[catKey(e.cat)] || OPEN.none; if (ns < o - 15 || ne > c + 15) return { lvl: 'warn', msg: 'poate fi închis atunci' };
  return { lvl: 'ok', msg: prev && tin ? `${fmtMin(tin)} drum, încape` : 'încape' };
}
const DRAG = { s: null, suppress: 0 };
function dragArm(blk, x, y, mode, input) {
  const zone = blk.closest('[data-dz]'); if (!zone) return; dragCancel(true);
  const s = DRAG.s = { blk, zone, id: blk.dataset.dragId, mode, input, x0: x, y0: y, sy0: scrollY, x, y, start: +blk.dataset.start, end: +blk.dataset.end, day: zone.dataset.day, active: false };
  s.ns = s.start; s.ne = s.end;
  if (input === 'touch') { if (mode === 'resize') dragActivate(); else s.timer = setTimeout(dragActivate, 380); }
}
function dragActivate() {
  const s = DRAG.s; if (!s || s.active) return; s.active = true; buzz(18); sfx('blip');
  const r = s.blk.getBoundingClientRect(); s.ghost = document.createElement('div'); s.ghost.className = 'drag-ghost'; s.ghost.style.cssText = `top:${s.blk.style.top};height:${r.height}px;left:${s.blk.offsetLeft}px;width:${r.width}px`; s.zone.appendChild(s.ghost);
  s.tip = document.createElement('div'); s.tip.className = 'drag-tip'; s.blk.appendChild(s.tip);
  s.blk.classList.add('dragging'); document.body.classList.add('is-dragging'); dragMove(s.x, s.y);
  const loop = () => { const d = DRAG.s; if (!d || !d.active) return; const edge = 72, v = d.y < edge ? -Math.ceil((edge - d.y) / 6) : d.y > innerHeight - edge ? Math.ceil((d.y - innerHeight + edge) / 6) : 0; if (v) { scrollBy(0, v); dragMove(d.x, d.y); } d.raf = requestAnimationFrame(loop); }; s.raf = requestAnimationFrame(loop);
}
function dragMove(x, y) {
  const s = DRAG.s; if (!s) return; s.x = x; s.y = y;
  if (!s.active) { if (s.input === 'mouse' && Math.hypot(x - s.x0, y - s.y0) > 5) dragActivate(); return; }
  // În centrul de comandă locul poate trece și în altă zi
  const under = document.elementFromPoint(x, y)?.closest('[data-dz]'); if (under && under !== s.zone && under.dataset.t0 && s.zone.parentElement?.parentElement === under.parentElement?.parentElement && s.mode === 'move') { s.zone = under; s.day = under.dataset.day; under.appendChild(s.blk); }
  const ppm = +s.zone.dataset.ppm, t0 = +s.zone.dataset.t0, dm = Math.round(((y + scrollY) - (s.y0 + s.sy0)) / ppm / 5) * 5, dur = s.end - s.start;
  if (s.mode === 'move') { s.ns = Math.max(6 * 60, Math.min(23 * 60 + 30 - dur, s.start + dm)); s.ne = s.ns + dur; } else { s.ns = s.start; s.ne = Math.max(s.start + 10, Math.min(23 * 60 + 45, s.end + dm)); }
  s.blk.style.top = `${Math.round((s.ns - t0) * ppm)}px`; s.blk.style.height = `${Math.max(26, Math.round((s.ne - s.ns) * ppm) - 2)}px`;
  const ck = dropCheck(s.id, s.day, s.ns, s.ne); s.blk.dataset.lvl = ck.lvl;
  const t = `${s.day !== s.zone.dataset.day ? '' : ''}${s.day !== DRAG.s.blk.dataset.day0 && DRAG.s.blk.dataset.day0 ? DAY_LABEL[s.day] + ' · ' : ''}${hhmm(s.ns)}–${hhmm(s.ne)}${ck.msg ? ' · ' + ck.msg : ''}`;
  if (s.tip.textContent !== t) { s.tip.textContent = t; if (s.lastLvl !== ck.lvl || s.lastNs !== s.ns) buzz(4); } s.lastLvl = ck.lvl; s.lastNs = s.ns;
}
function dragCleanup() { const s = DRAG.s; if (!s) return; clearTimeout(s.timer); cancelAnimationFrame(s.raf); s.ghost?.remove(); s.tip?.remove(); s.blk.classList.remove('dragging'); document.body.classList.remove('is-dragging'); DRAG.s = null; return s; }
function dragCancel(quiet) { const s = DRAG.s; if (!s) return; const was = s.active; dragCleanup(); if (was && !quiet) rerenderDrag(); }
const rerenderDrag = () => { if (state.view === 'hq') renderHQ(); else renderDay(); };
async function dragEnd() {
  const s = DRAG.s; if (!s) return; if (!s.active) { dragCleanup(); return; }
  dragCleanup(); DRAG.suppress = Date.now() + 450;
  const day0 = findLoc(s.id)?.day; if (s.ns === s.start && s.ne === s.end && s.day === day0) { rerenderDrag(); return; }
  const loc = findLoc(s.id); if (!loc) return rerenderDrag(); const prev = { day: loc.day, time: loc.time }, time = `${hhmm(s.ns)} – ${hhmm(s.ne)}`;
  buzz(12); sfx('drop'); await moveLoc(s.id, s.day, time);
  toast(`${shortTitle(loc.title)}: ${s.day !== prev.day ? DAY_LABEL[s.day] + ', ' : ''}${time}`, 'schedule', 5000, { label: 'Anulează', run: () => moveLoc(s.id, prev.day, prev.time) });
}
function dragInit() {
  document.addEventListener('pointerdown', (e) => { if (e.pointerType === 'touch' || e.button !== 0) return; const blk = e.target.closest('[data-drag-id]'); if (!blk || e.target.closest('a, input')) return; blk.dataset.day0 = blk.closest('[data-dz]')?.dataset.day || ''; dragArm(blk, e.clientX, e.clientY, e.target.closest('.drag-rs') ? 'resize' : 'move', 'mouse'); });
  document.addEventListener('pointermove', (e) => { if (DRAG.s?.input === 'mouse') dragMove(e.clientX, e.clientY); });
  document.addEventListener('pointerup', () => { if (DRAG.s?.input === 'mouse') dragEnd(); });
  document.addEventListener('touchstart', (e) => { if (e.touches.length > 1) return dragCancel(); const blk = e.target.closest('[data-drag-id]'); if (!blk) return; const t = e.touches[0]; blk.dataset.day0 = blk.closest('[data-dz]')?.dataset.day || ''; dragArm(blk, t.clientX, t.clientY, e.target.closest('.drag-rs') ? 'resize' : 'move', 'touch'); }, { passive: true });
  document.addEventListener('touchmove', (e) => { const s = DRAG.s; if (!s || s.input !== 'touch') return; const t = e.touches[0]; if (!s.active) { if (Math.hypot(t.clientX - s.x0, t.clientY - s.y0) > 9) dragCleanup(); return; } if (e.cancelable) e.preventDefault(); dragMove(t.clientX, t.clientY); }, { passive: false });
  document.addEventListener('touchend', () => { const s = DRAG.s; if (s?.input === 'touch') { if (s.active) dragEnd(); else dragCleanup(); } });
  document.addEventListener('touchcancel', () => dragCancel());
  document.addEventListener('click', (e) => { if (Date.now() < DRAG.suppress) { e.stopPropagation(); e.preventDefault(); } }, true);
  document.addEventListener('contextmenu', (e) => { if (e.target.closest('[data-drag-id]')) e.preventDefault(); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && DRAG.s?.active) { dragCancel(); return; }
    const blk = e.target.closest?.('[data-drag-id]'); if (!blk) return;
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); blk.click(); return; }
    if (e.altKey && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) { e.preventDefault(); const d = e.key === 'ArrowUp' ? -15 : 15, id = blk.dataset.dragId, loc = findLoc(id); if (!loc) return; const ns = +blk.dataset.start + d, ne = +blk.dataset.end + d, day = blk.closest('[data-dz]').dataset.day; moveLoc(id, day, `${hhmm(ns)} – ${hhmm(ne)}`).then(() => { toast(`${shortTitle(loc.title)}: ${hhmm(ns)} – ${hhmm(ne)}`, 'schedule'); setTimeout(() => $(`[data-drag-id="${CSS.escape(id)}"]`)?.focus(), 60); }); }
  });
}

// ---------- „Suntem aici acum”: reface restul zilei din punctul și ora reale ----------
const hereState = { day: null, at: null, pt: null, ptName: '' };
function nowMinute() { const d = new Date(); return d.getHours() * 60 + d.getMinutes(); }
// Reface ziua pornind dintr-un punct (lat/lng) la o oră dată: ce mai prindem, în ce ordine, ce pică
function replanFrom(day, pt, atMin) {
  const origin = { id: '__here', title: 'Unde sunteți', lat: pt.lat, lng: pt.lng };
  const fixed = [], movable = [];
  for (const l of dayItems(day)) { if (state.shared.visited[l.id]) continue; const r = parseRange(withTime(l).time);
    if (l.fixed && r) fixed.push({ loc: l, start: r.from, end: r.to }); else movable.push(l); }
  fixed.sort((a, b) => a.start - b.start);
  const placed = [], dropped = []; let cur = origin, t = atMin, pool = movable.slice();
  const nextFixed = () => fixed.find((f) => f.end > t);
  while (pool.length) {
    let best = null;
    for (const loc of pool) { const e = enriched(loc), p = coordsOf(loc); if (!p) { continue; }
      const k = catKey(e.cat), [open, close0] = OPEN[k] || OPEN.none;
      const cl = e.closes?.[day] ? (([h, m]) => h * 60 + m)(e.closes[day].split(':').map(Number)) : close0;
      if (e.closed?.includes(day)) continue;
      const tIn = legOf(cur, loc, day)?.min ?? 0, stay = stayOf(loc), start = up5(Math.max(t + tIn, open)), end = start + stay;
      const nf = nextFixed(); const capFixed = nf ? nf.start - (legOf(loc, nf.loc, day)?.min ?? 0) : DAY_END;
      if (end > Math.min(cl, capFixed)) continue;
      const need = (k === 'sweet') || (k === 'food');
      const cost = tIn + start * 0.02 - (need ? 8 : 0);
      if (!best || cost < best.cost) best = { loc, start, end, tIn, cost };
    }
    if (!best) break;
    placed.push(best); pool = pool.filter((l) => l !== best.loc); cur = best.loc; t = best.end;
  }
  for (const loc of pool) dropped.push(loc);
  // Intercalează opririle fixe rămase (zborul) la locul lor
  const seq = [...placed.map((x) => ({ ...x, moved: true })), ...fixed.filter((f) => f.end > atMin).map((f) => ({ loc: f.loc, start: f.start, end: f.end, fixed: true }))].sort((a, b) => a.start - b.start);
  return { seq, dropped, origin };
}
function hereIdeasHTML() {
  const { day, at, pt } = hereState; const r = replanFrom(day, pt, at);
  let prev = { id: '__here', title: hereState.ptName || 'aici', lat: pt.lat, lng: pt.lng };
  const rows = r.seq.map((x) => { const e = enriched(x.loc), leg = legOf(prev, x.loc, day); prev = x.loc;
    return `<div class="li tight k-${catKey(e.cat)}">${leg && leg.min ? `<span class="here-leg">${icon(leg.icon, 'i-16')} ${fmtMin(leg.min)}</span>` : '<span class="here-leg t-3">start</span>'}
      <button data-action="open-detail" data-id="${esc(x.loc.id)}" class="flex items-center gap-2 flex-1 min-w-0 text-left">${thumbHTML(e, 38)}<span class="min-w-0"><span class="block font-medium truncate">${esc(x.loc.title)}${x.fixed ? ' ' + icon('lock', 'i-14', 'opacity:.5') : ''}</span><span class="block cap">${hhmm(x.start)}–${hhmm(x.end)}</span></span></button></div>`;
  }).join('');
  const drop = r.dropped.length ? `<div class="here-drop mt-3"><div class="cap mb-1">Nu mai încap azi (le puteți muta sau sări):</div>${r.dropped.map((l) => `<span class="chip sm">${esc(shortTitle(l.title))}</span>`).join('')}</div>` : '';
  return `<div class="card list">${rows || '<div class="li t-2">Nimic de reordonat.</div>'}</div>${drop}
    <div class="flex gap-2 mt-4 pb-2"><button data-action="here-apply" class="btn btn-primary btn-lg press flex-1">${icon('update', 'i-18')} Rearanjează de aici</button></div>
    <p class="cap pb-3">Pornind ${esc(hereState.ptName ? 'de la ' + hereState.ptName : 'din punctul ales')}, la ${hhmm(at)}. Se schimbă doar orele; puteți da Anulează.</p>`;
}
function openHereSheet() {
  const day = DAYS.includes(state.day) ? state.day : todayKey() || 'sat'; hereState.day = day;
  hereState.at = hereState.at || nowMinute(); if (!hereState.pt) { if (state.pos) { hereState.pt = { lat: state.pos.lat, lng: state.pos.lng }; hereState.ptName = 'poziția ta'; } }
  const body = `${sheetHead('Suntem aici acum', 'Reface restul zilei')}
    <div class="here-set">
      <div class="field"><span>Ziua</span><div class="flex flex-wrap gap-2" id="hereDays">${DAYS.map((d) => `<button data-action="here-day" data-day="${d}" class="chip press ${d === hereState.day ? 'on' : ''}">${DAY_LABEL[d]}</button>`).join('')}</div></div>
      <div class="mt-3">${timePickerHTML('hereTime', hhmm(Math.round(hereState.at / 5) * 5), { label: 'Ora de acum', single: true })}</div>
      <div class="field mt-3"><span>Unde sunteți</span>
        <div class="flex flex-wrap gap-2">
          <button data-action="here-gps" class="chip press ${hereState.ptName === 'poziția ta' ? 'on' : ''}">${icon('my_location', 'i-18')} Poziția mea</button>
          <button data-action="here-pick" class="chip press">${icon('location_on', 'i-18')} Aleg pe hartă</button>
        </div>
        <div class="cap mt-1" id="herePtLabel">${hereState.pt ? esc(hereState.ptName || 'punct ales pe hartă') : 'Alegeți poziția ca să refac ziua'}</div>
      </div>
    </div>
    <div id="hereResult" class="mt-2">${hereState.pt ? hereIdeasHTML() : ''}</div>`;
  openSheet(body);
}
function hereRefresh() { const r = $('#hereResult'); if (r) r.innerHTML = hereState.pt ? hereIdeasHTML() : ''; const l = $('#herePtLabel'); if (l) l.textContent = hereState.pt ? (hereState.ptName || 'punct ales pe hartă') : 'Alegeți poziția ca să refac ziua'; }
async function hereApply() {
  const { day, at, pt } = hereState; const r = replanFrom(day, pt, at);
  const snap = r.seq.filter((x) => x.moved).map((x) => ({ id: x.loc.id, day: findLoc(x.loc.id)?.day, time: findLoc(x.loc.id)?.time }));
  for (const x of r.seq) if (x.moved) await moveLoc(x.loc.id, day, `${hhmm(x.start)} – ${hhmm(x.end)}`);
  closeModals(); buzz(16); sfx('power'); setView('plan'); if (state.day !== day) switchDay(day); else renderDay();
  toast(`Ziua refăcută din ${hhmm(at)}.`, 'update', 6000, { label: 'Anulează', run: async () => { for (const s of snap) await moveLoc(s.id, s.day, s.time); } });
}

// =====================================================================
// Arcade: tripul e un joc pentru trei jucători. Sunete 8-bit scurte,
// puncte care sar din buton, nivele pentru echipă. Interfața rămâne curată:
// jocul apare doar ca răspuns la ce faceți.
// =====================================================================
const SFX = 'bcn_sfx';
const sfxOn = () => lsGet(SFX, true) !== false;
let actx = null;
const TUNES = {
  coin: [[988, .07], [1319, .24]], select: [[660, .05], [990, .1]], blip: [[1175, .045]], undo: [[587, .06], [392, .12]], drop: [[392, .05], [523, .09]],
  power: [[523, .06], [659, .06], [784, .06], [1047, .16]], levelup: [[523, .09], [659, .09], [784, .09], [1047, .09], [784, .07], [1047, .3]], clear: [[784, .1], [784, .1], [1047, .12], [988, .1], [1319, .34]],
};
function sfx(kind) {
  if (!sfxOn()) return;
  try {
    actx = actx || new (window.AudioContext || window.webkitAudioContext)(); if (actx.state === 'suspended') actx.resume();
    let t = actx.currentTime + 0.01;
    for (const [f, d] of TUNES[kind] || TUNES.blip) {
      const o = actx.createOscillator(), g = actx.createGain(); o.type = 'square'; o.frequency.setValueAtTime(f, t);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.045, t + 0.008); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
      o.connect(g); g.connect(actx.destination); o.start(t); o.stop(t + d + 0.03); t += d * 0.92;
    }
  } catch {}
}
function toggleSfx() { const on = !sfxOn(); lsSet(SFX, on); if (on) sfx('select'); $$('[data-sfx-label]').forEach((el) => { el.textContent = on ? 'Sunet pornit' : 'Sunet oprit'; }); $$('.ps-foot [data-action="sfx-toggle"] .ic').forEach((el) => el.replaceWith(htmlEl(icon(on ? 'volume_up' : 'volume_off', 'i-18')))); }
const htmlEl = (h) => { const t = document.createElement('template'); t.innerHTML = h.trim(); return t.content.firstChild; };
// „+10” în font pixel, care sare din locul apăsat
function scorePop(x, y, text, color = 'var(--cat-yellow)') { const s = document.createElement('span'); s.className = 'score-pop'; s.textContent = text; s.style.cssText = `left:${x}px;top:${y}px;--c:${color}`; document.body.appendChild(s); setTimeout(() => s.remove(), 1100); }
function popFrom(el, text, color) { const r = el?.getBoundingClientRect?.() || { left: innerWidth / 2, top: innerHeight / 2, width: 0 }; scorePop(r.left + r.width / 2, r.top, text, color); }
// Un moment mare, pe mijlocul ecranului: nivel nou, zi completă
function arcadeMoment(big, small, tune = 'levelup') {
  sfx(tune); buzz(30); const o = document.createElement('div'); o.className = 'arcade-moment'; o.setAttribute('role', 'status');
  o.innerHTML = `<div class="am-in"><div class="am-big">${esc(big)}</div>${small ? `<div class="am-small">${esc(small)}</div>` : ''}</div>`;
  document.body.appendChild(o); for (let i = 0; i < 3; i++) setTimeout(() => confetti(innerWidth * (0.2 + 0.3 * i), innerHeight * 0.38), i * 140);
  setTimeout(() => o.classList.add('out'), 1900); setTimeout(() => o.remove(), 2400);
}
// ---------- Puncte și nivele ----------
const PTS = { visit: 25, bucket: 50, counter: 10, comment: 5, react: 2 };
const LEVELS = [0, 100, 250, 450, 700, 1000, 1400, 1900, 2500, 3200];
const LEVEL_NAMES = ['Turiști', 'Exploratori', 'Plimbăreți', 'Gurmanzi', 'Navigatori', 'Cunoscători', 'Aproape localnici', 'Barcelonezi', 'Legende', 'Campionii Barcelonei'];
const PLAYER_SLOT = { mara: 'P1', anne: 'P2', daniel: 'P3' };
function scores() {
  const sc = Object.fromEntries(PERSONS.map((p) => [p, 0])), byName = Object.fromEntries(PERSONS.map((p) => [PEOPLE_META[p].name, p])); let team = 0;
  for (const v of Object.values(state.shared.visited || {})) { if (!v) continue; const p = byName[v.by]; if (p) sc[p] += PTS.visit; else team += PTS.visit; }
  for (const p of PERSONS) sc[p] += bucketOf(p).filter((i) => i.done).length * PTS.bucket + counterOf(PEOPLE_META[p].counter.key) * PTS.counter;
  for (const list of Object.values(state.shared.comments || {})) if (Array.isArray(list)) for (const c of list) { const p = byName[c.by]; if (p) sc[p] += PTS.comment; }
  for (const r of Object.values(state.shared.reactions || {})) if (r && typeof r === 'object') for (const [n, k] of Object.entries(r)) { const p = byName[n]; if (p && k) sc[p] += PTS.react; }
  return { sc, team, total: team + PERSONS.reduce((s, p) => s + sc[p], 0) };
}
function levelOf(total) { let i = 0; while (i < LEVELS.length - 1 && total >= LEVELS[i + 1]) i++; const next = LEVELS[i + 1] ?? null; return { n: i + 1, name: LEVEL_NAMES[i], from: LEVELS[i], next, pct: next ? (total - LEVELS[i]) / (next - LEVELS[i]) : 1 }; }
const fmtPts = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
const meKeyNow = () => PERSONS.find((p) => PEOPLE_META[p].name === me()) || 'daniel';
// Scorul jucătorului în cip, nivelul echipei în bara laterală; nivel nou = moment arcade
function renderHud() {
  const s = scores(), lv = levelOf(s.total), mine = s.sc[meKeyNow()] || 0;
  $$('.hud-pts b').forEach((el) => { const old = +el.dataset.v || 0; el.dataset.v = mine; el.textContent = fmtPts(mine); if (mine > old && old) { const pill = el.parentElement; pill.classList.remove('bump'); void pill.offsetWidth; pill.classList.add('bump'); } });
  const lb = $('#sideLevel'); if (lb) lb.innerHTML = `<span class="px">Niv ${lv.n}</span><span class="side-lbl">${esc(lv.name)}</span><i style="--p:${Math.round(lv.pct * 100)}%"></i>`;
  const seen = lsGet('bcn_lvl', 0); if (!seen) lsSet('bcn_lvl', lv.n); else if (lv.n > seen) { lsSet('bcn_lvl', lv.n); setTimeout(() => arcadeMoment(`Nivel ${lv.n}!`, lv.name), 450); }
}
function leaderboardHTML() {
  const s = scores(), lv = levelOf(s.total), order = [...PERSONS].sort((a, b) => s.sc[b] - s.sc[a]), top = s.sc[order[0]];
  return `<section class="lb" aria-label="Clasament">
    <div class="lb-team"><div><div class="lb-lv px">Nivel ${lv.n}</div><div class="lb-name">${esc(lv.name)}</div></div><div class="lb-total"><b class="px">${fmtPts(s.total)}</b><span>puncte echipă</span></div></div>
    <div class="lb-bar"><i style="width:${Math.round(lv.pct * 100)}%"></i></div>
    <div class="cap mt-1">${!s.total ? 'Bifați primul loc din program și jocul pornește.' : lv.next ? `Încă ${fmtPts(lv.next - s.total)} puncte până la nivelul ${lv.n + 1}` : 'Nivel maxim. Sunteți barcelonezi.'}</div>
    <div class="lb-rows">${order.map((p, i) => `<button data-action="person" data-person="${p}" class="lb-row press ${i === 0 && top ? 'lead' : ''}" style="--pc: var(--p-${p})"><span class="lb-slot px">${PLAYER_SLOT[p]}</span><span class="avatar p-${p}">${PEOPLE_META[p].name[0]}</span><span class="flex-1 text-left font-medium">${PEOPLE_META[p].name}${i === 0 && top ? ` ${icon('workspace_premium', 'i-18 ms-fill', 'color: var(--star)')}` : ''}</span><b class="px lb-pts">${fmtPts(s.sc[p])}</b></button>`).join('')}</div>
    <p class="cap lb-how">+${PTS.visit} bifat · +${PTS.bucket} bucketlist · +${PTS.counter} la contor · +${PTS.comment} comentariu · +${PTS.react} reacție</p>
  </section>`;
}
// ---------- Cafeaua dintr-o atingere ----------
let coffeeCombo = { n: 0, t: 0 };
function nearCoffeeTitle() {
  if (!state.pos) return ''; let best = null, bd = 220;
  for (const l of dayItems(todayKey() || state.day)) { if (catKey(enriched(l).cat) !== 'coffee') continue; const p = coordsOf(l); if (!p) continue; const d = distanceM(state.pos, p); if (d < bd) { bd = d; best = l; } }
  return best ? best.title : '';
}
async function coffeeQuick(btn, place = '') {
  const now = Date.now(); coffeeCombo = now - coffeeCombo.t < 120000 ? { n: coffeeCombo.n + 1, t: now } : { n: 1, t: now };
  place = place || nearCoffeeTitle();
  const log = [...(state.shared.coffeeLog || []), { type: 'espresso', shots: 1, place, by: me(), day: todayKey() || state.day, at: new Date().toISOString() }].slice(-200);
  state.shared.coffeeLog = log; state.shared.coffeeCount = counterOf('coffee'); const c = state.shared.coffeeCount, goal = PEOPLE_META.daniel.counter.goal;
  buzz(12); sfx('coin'); popFrom(btn, coffeeCombo.n > 1 ? `x${coffeeCombo.n} +${PTS.counter}` : `+${PTS.counter}`);
  btn?.classList.remove('hit'); void btn?.offsetWidth; btn?.classList.add('hit');
  renderUs(); renderHud(); refreshDetail(); if (c === goal) setTimeout(() => arcadeMoment(`${goal} espresso!`, 'Daniel e oficial barcelonez', 'clear'), 300);
  toast(coffeeCombo.n > 1 ? `Combo x${coffeeCombo.n}! Espresso #${c}` : `Espresso #${c}${place ? ' la ' + shortTitle(place) : ''}`, 'coffee', 3500, { label: 'Anulează', run: coffeeUndo });
  await saveShared({ coffeeLog: log, coffeeCount: c });
}
// ---------- Alege jucătorul: pe mijlocul ecranului ----------
function playerSelectHTML(first) {
  const cur = me(), set = hasMe(), s = scores();
  return `<div class="ps-head"><div class="ps-kick px">Alege jucătorul</div><h2 id="psTitle" class="ps-title">${first ? 'Cine joacă?' : 'Cine e la telefon?'}</h2>
      <p class="ps-sub">${first ? 'Te ținem minte pe telefonul ăsta. Punctele, reacțiile și pozele apar pe numele tău.' : 'Schimbă jucătorul de pe acest telefon.'}</p></div>
    <div class="ps-grid">${PERSONS.map((p) => { const m = PEOPLE_META[p], on = set && m.name === cur; return `<button data-action="who-set" data-person="${p}" class="ps-card press ${on ? 'on' : ''}" style="--pc: var(--p-${p})" aria-pressed="${on}">
      <span class="ps-slot px">${PLAYER_SLOT[p]}</span><span class="ps-av avatar p-${p}">${m.name[0]}</span><span class="ps-name">${m.name}</span><span class="ps-tag">${esc(m.tag)}</span><span class="ps-pts"><b class="px">${fmtPts(s.sc[p])}</b> pct</span>${on ? '<span class="ps-ready px">Tu</span>' : ''}</button>`; }).join('')}</div>
    <div class="ps-foot"><button data-action="sfx-toggle" class="chip press">${icon(sfxOn() ? 'volume_up' : 'volume_off', 'i-18')}<span data-sfx-label>${sfxOn() ? 'Sunet pornit' : 'Sunet oprit'}</span></button>${first ? '' : '<button data-action="ps-close" class="btn btn-text press">Închide</button>'}</div>`;
}
function openWhoAmI(first = false) { const d = $('#playerDlg'); if (!d) return; $('#playerBody').innerHTML = playerSelectHTML(first); d.dataset.first = first ? '1' : ''; d.classList.remove('hidden'); if (matchMedia('(pointer: fine)').matches) setTimeout(() => $('#playerBody .ps-card.on, #playerBody .ps-card')?.focus(), 60); }
function setMe(person) {
  const m = PEOPLE_META[person]; if (!m) return; const card = $(`#playerBody [data-person="${person}"]`);
  lsSet(LS.me, m.name); buzz(18); sfx('select');
  $$('#playerBody .ps-card').forEach((c) => c.classList.toggle('picked', c === card)); card?.insertAdjacentHTML('beforeend', '<span class="ps-go px">Gata!</span>');
  setTimeout(() => { $('#playerDlg').classList.add('hidden'); renderMe(); renderAll(); refreshDetail(); toast(`Salut, ${m.name}! Joci ca ${PLAYER_SLOT[person]}.`, 'sports_esports', 3200); }, RM() ? 150 : 700);
}

// ---------- „Mai mult”: ce nu încape în bara de jos ----------
function openMore() {
  const d = state.pos ? distanceM(state.pos, TRIP.base) : null, tile = (act, ic, t, sub, extra = '') => `<button ${act} class="more-tile press">${icon(ic, 'i-24')}<span class="more-t">${t}</span><span class="more-s">${sub}</span>${extra}</button>`;
  openSheet(`${sheetHead('Toate ecranele', 'Mai mult')}
    <div class="more-grid">
      ${tile('data-action="more-go" data-view="translate"', 'translate', 'Traducere', 'Fraze cu pronunție, spaniolă și catalană')}
      ${tile('data-action="more-go" data-view="info"', 'info', 'Info', 'Rezervări, bagaj, notițe, urgențe')}
      ${tile('data-action="open-home"', 'hotel', 'Cazarea', d != null && d < 120 ? 'Sunteți acasă' : 'Pellaires 35: traseu și adresă', d != null && d < 120 ? '<i class="more-dot"></i>' : '')}
    </div>
    <div class="card list mt-3 mb-3">
      <button data-action="whoami" class="li press">${icon('sports_esports', 't-blue')}<span class="flex-1 text-left">Schimbă jucătorul</span><span class="cap">${esc(me())}</span></button>
      <button data-action="sfx-toggle" class="li press">${icon('volume_up', 't-blue')}<span class="flex-1 text-left">Sunete arcade</span><span class="cap" data-sfx-label>${sfxOn() ? 'Sunet pornit' : 'Sunet oprit'}</span></button>
      <button data-action="toggle-theme" class="li press">${icon('dark_mode', 't-blue')}<span class="flex-1 text-left">Temă întunecată / deschisă</span></button>
    </div>`);
}
// ---------- Selector de oră: rezumat mare, bandă de ore, minute, durată ----------
// Fără tastatură: totul din atingeri, gândit pentru degetul mare. Valoarea stă într-un input ascuns
// („17:30 – 18:30”, sau „” pentru Flexibil), ca restul codului să o citească la fel ca înainte.
const TP_DUR = [15, 30, 45, 60, 90, 120, 180];
function tpParse(v) { const r = parseRange(v || ''); if (r) return { s: r.from, d: Math.max(5, r.to - r.from) }; const m = /(\d{1,2}):(\d{2})/.exec(v || ''); return m ? { s: +m[1] * 60 + +m[2], d: null } : null; }
const tpValue = (s, d, single) => (single ? hhmm(s) : `${hhmm(s)} – ${hhmm(s + d)}`);
const tpSum = (s, d, single) => (single ? hhmm(s) : `${hhmm(s)} – ${hhmm(s + d)}<span class="tp-dur">${fmtMin(d)}</span>`);
function timePickerHTML(id, value, o = {}) {
  const cur = tpParse(value), single = !!o.single, flex = !cur && !single, sug = o.suggest ? tpParse(o.suggest) : null;
  const st = cur?.s ?? sug?.s ?? o.start ?? 12 * 60, d = cur?.d ?? sug?.d ?? o.dur ?? 60, h0 = Math.floor(st / 60), m0 = st % 60;
  const hours = []; for (let h = 7; h <= 23; h++) hours.push(h);
  const opts = esc(JSON.stringify(o));
  return `<div class="tp ${flex ? 'is-flex' : ''}" data-tp="${id}" data-s="${st}" data-d="${d}" data-o="${opts}" ${single ? 'data-single="1"' : ''}>
    <input type="hidden" id="${id}" value="${esc(flex ? '' : tpValue(st, d, single))}">
    <div class="tp-head">
      <div class="min-w-0"><div class="tp-label">${esc(o.label || 'Ora')}</div><div class="tp-sum" aria-live="polite">${flex ? 'Flexibil' : tpSum(st, d, single)}</div></div>
      <div class="tp-nudge"><button type="button" data-action="tp-nudge" data-n="-5" class="icon-btn ol press" aria-label="Cu 5 minute mai devreme">${icon('remove', 'i-18')}</button><button type="button" data-action="tp-nudge" data-n="5" class="icon-btn ol press" aria-label="Cu 5 minute mai târziu">${icon('add', 'i-18')}</button></div>
    </div>
    ${!single || sug ? `<div class="tp-quick">${!single ? `<button type="button" data-action="tp-flex" class="chip press tp-flex ${flex ? 'on' : ''}">${icon('auto_awesome', 'i-18')} Flexibil</button>` : ''}${sug ? `<button type="button" data-action="tp-set" data-s="${sug.s}" data-d="${sug.d ?? d}" class="chip press tp-sug">${icon('near_me', 'i-18')} Recomandat ${hhmm(sug.s)}</button>` : ''}</div>` : ''}
    <div class="tp-sec">${single ? '' : '<div class="tp-k">Începe la</div>'}
      <div class="tp-hours" role="listbox" aria-label="Ora">${hours.map((h) => `<button type="button" data-action="tp-h" data-h="${h}" class="tp-h press ${!flex && h === h0 ? 'on' : ''}" role="option" aria-selected="${!flex && h === h0}">${String(h).padStart(2, '0')}</button>`).join('')}</div>
      <div class="tp-mins">${[0, 15, 30, 45].map((m) => `<button type="button" data-action="tp-m" data-m="${m}" class="tp-m press ${!flex && m === m0 ? 'on' : ''}">:${String(m).padStart(2, '0')}</button>`).join('')}</div>
    </div>
    ${single ? '' : `<div class="tp-sec"><div class="tp-k">Cât stați</div><div class="tp-durs">${TP_DUR.map((x) => `<button type="button" data-action="tp-d" data-d="${x}" class="chip press ${!flex && x === d ? 'on' : ''}">${fmtMin(x)}</button>`).join('')}</div></div>`}
  </div>`;
}
function tpUpdate(el, patch) {
  const root = el.closest('.tp'); if (!root) return; const single = !!root.dataset.single, inp = root.querySelector('input'), sum = root.querySelector('.tp-sum');
  if (patch.flex) {
    root.classList.add('is-flex'); inp.value = ''; sum.textContent = 'Flexibil';
    root.querySelectorAll('.on').forEach((b) => b.classList.remove('on')); root.querySelector('.tp-flex')?.classList.add('on');
  } else {
    let st = +root.dataset.s, d = +root.dataset.d;
    if (patch.s != null) st = patch.s; if (patch.h != null) st = patch.h * 60 + (st % 60); if (patch.m != null) st = Math.floor(st / 60) * 60 + patch.m;
    if (patch.n) st += patch.n; if (patch.d != null) d = patch.d; st = Math.max(6 * 60, Math.min(23 * 60 + 55, st));
    root.dataset.s = st; root.dataset.d = d; root.classList.remove('is-flex'); inp.value = tpValue(st, d, single); sum.innerHTML = tpSum(st, d, single);
    root.querySelector('.tp-flex')?.classList.remove('on');
    root.querySelectorAll('.tp-h').forEach((b) => { const on = +b.dataset.h === Math.floor(st / 60); b.classList.toggle('on', on); b.setAttribute('aria-selected', on); });
    root.querySelectorAll('.tp-m').forEach((b) => b.classList.toggle('on', +b.dataset.m === st % 60));
    root.querySelectorAll('.tp-durs .chip').forEach((b) => b.classList.toggle('on', +b.dataset.d === d));
    tpCenter(root);
  }
  sum.classList.remove('bump'); void sum.offsetWidth; sum.classList.add('bump'); buzz(6);
  inp.dispatchEvent(new Event('change', { bubbles: true }));
}
function tpCenter(root, smooth = true) { const on = root.querySelector('.tp-h.on'), strip = root.querySelector('.tp-hours'); if (on && strip) strip.scrollTo({ left: on.offsetLeft - strip.clientWidth / 2 + on.offsetWidth / 2, behavior: smooth && !RM() ? 'smooth' : 'auto' }); }
function tpSetValue(id, v) { const root = $(`[data-tp="${id}"]`); if (!root) return; let o = {}; try { o = JSON.parse(root.dataset.o || '{}'); } catch {} root.outerHTML = timePickerHTML(id, v, o); }
new MutationObserver(() => $$('.tp:not([data-mounted])').forEach((r) => { r.dataset.mounted = '1'; requestAnimationFrame(() => tpCenter(r, false)); })).observe(document.body, { childList: true, subtree: true });

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
function confetti(x, y, colors = ['#FCDD09', '#DA121A', '#C93468', '#1A73E8', '#2BB673', '#FFFFFF']) { if (matchMedia('(prefers-reduced-motion: reduce)').matches) return; for (let i = 0; i < 16; i++) { const el = document.createElement('i'); el.className = 'confetti'; const a = (Math.PI * 2 * i) / 16 + Math.random() * 0.4, r = 40 + Math.random() * 60; el.style.cssText = `left:${x}px;top:${y}px;background:${colors[i % colors.length]};--dx:${Math.cos(a) * r}px;--dy:${Math.sin(a) * r - 30}px;--rot:${Math.round(Math.random() * 360)}deg`; document.body.appendChild(el); setTimeout(() => el.remove(), 950); } }

// ---------- Micro-interacțiuni ----------
const RM = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
// Iconițele prind viață din când în când: câte una sau două vizibile, fiecare după felul ei
const IC_ANIM = (n) => (/cafe|coffee|emoji_food/.test(n) ? 'ic-tilt' : /icecream|cake|bakery/.test(n) ? 'ic-bounce' : /restaurant|dining|tapas|rice|ramen|lunch/.test(n) ? 'ic-wiggle'
  : /rocket|flight|train|motorsports|luggage/.test(n) ? 'ic-lift' : /attractions|festival|science/.test(n) ? 'ic-spin' : /mall|shopping|checkroom|storefront|spa|candle|bag/.test(n) ? 'ic-swing' : 'ic-pop');
function playIcon(el) { if (!el || RM()) return; const c = IC_ANIM(el.dataset.i || ''); el.classList.remove(c); void el.getBoundingClientRect(); el.classList.add(c); setTimeout(() => el.classList.remove(c), 1100); }
function idleIcons() {
  if (document.hidden || RM()) return;
  const vis = $$('.photo .corner .ic, .photo > .ic, .thumb > .ic, .theme-ic .ic, .hq-col-ic .ic, .coll-ic .ic, .hq-blk-h > .ic, .cat-ic .ic, .nav-btn.on .ic, .side-btn.on .ic, .cup-flag .ic, .meal-flag .ic, .ess .ic')
    .filter((el) => { const r = el.getBoundingClientRect(); return r.width && r.top < innerHeight && r.bottom > 0 && r.left < innerWidth; });
  for (let i = 0; i < Math.min(2, vis.length); i++) playIcon(vis[Math.floor(Math.random() * vis.length)]);
}
setInterval(idleIcons, 4200);
// Un mic „pop” pe butonul apăsat, după ce lista s-a redesenat
function popAfterRender(sel, cls = 'pop') { requestAnimationFrame(() => $$(sel).forEach((el) => { el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); })); }
// Emoji care se ridică din butonul de reacție
function emojiBurst(btn, emoji) {
  if (RM() || !btn) return; const r = btn.getBoundingClientRect();
  for (let i = 0; i < 3; i++) { const s = document.createElement('span'); s.className = 'emoji-fly'; s.textContent = emoji; s.style.cssText = `left:${r.left + r.width / 2}px;top:${r.top}px;--dx:${(i - 1) * 18 + Math.random() * 8}px;animation-delay:${i * 70}ms`; document.body.appendChild(s); setTimeout(() => s.remove(), 1100); }
}
// Glisare stânga/dreapta între zile, în Plan (pe telefon)
(() => {
  let sx = 0, sy = 0, ok = false;
  document.addEventListener('touchstart', (e) => { const t0 = e.touches[0]; ok = state.view === 'plan' && !isDesk() && !e.target.closest('.hscroll, .chips, .actions, .leaflet-container, .dates, input, textarea, [data-modal], .react-pick, .meal-votes'); sx = t0.clientX; sy = t0.clientY; }, { passive: true });
  document.addEventListener('touchend', (e) => {
    if (!ok) return; ok = false; const t1 = e.changedTouches[0], dx = t1.clientX - sx, dy = t1.clientY - sy;
    if (Math.abs(dx) < 70 || Math.abs(dx) < Math.abs(dy) * 2) return;
    const i = DAYS.indexOf(state.day), next = DAYS[i + (dx < 0 ? 1 : -1)]; if (!next) return;
    buzz(8); switchDay(next, dx < 0 ? 'left' : 'right');
  }, { passive: true });
})();
// Foile de jos se închid trăgând în jos de mâner (pe telefon)
(() => {
  let sheet = null, y0 = 0, dy = 0;
  document.addEventListener('touchstart', (e) => {
    const s = e.target.closest('.sheet'); if (!s || isDesk() || s.scrollTop > 0) return;
    if (!e.target.closest('.sheet-top, .handle, .hero-photo, .photo')) return; sheet = s; y0 = e.touches[0].clientY; dy = 0; s.style.transition = 'none';
  }, { passive: true });
  document.addEventListener('touchmove', (e) => { if (!sheet) return; dy = Math.max(0, e.touches[0].clientY - y0); sheet.style.transform = `translateY(${dy}px)`; }, { passive: true });
  document.addEventListener('touchend', () => {
    if (!sheet) return; const s = sheet; sheet = null; s.style.transition = 'transform .25s var(--ease)';
    if (dy > 110) { s.style.transform = 'translateY(100%)'; setTimeout(() => { addState = null; closeModals(); s.style.transform = ''; s.style.transition = ''; }, 220); } else { s.style.transform = ''; setTimeout(() => { s.style.transition = ''; }, 260); }
  });
})();
let revealObs = null;
function observeReveal() {
  const els = $$('.reveal:not(.in)'); if (!els.length) return;
  if (!('IntersectionObserver' in window)) { els.forEach((e) => e.classList.add('in')); return; }
  revealObs = revealObs || new IntersectionObserver((entries) => entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('in'); revealObs.unobserve(en.target); } }), { rootMargin: '0px 0px -6% 0px', threshold: 0.06 });
  els.forEach((e) => revealObs.observe(e));
}
function dayBarSync() { const bar = $('#appbar'), d = $('#dates'); if (!bar || !d) return; const show = state.view === 'plan' && innerWidth < 768 && d.getBoundingClientRect().bottom < bar.querySelector('.appbar-in').getBoundingClientRect().bottom; bar.classList.toggle('show-days', show); }
let lastY = 0; window.addEventListener('scroll', () => { const y = window.scrollY; dayBarSync(); $('#fab')?.classList.toggle('mini', y > 160 && y > lastY); $('#appbar')?.classList.toggle('scrolled', y > 4); lastY = y; }, { passive: true });

// ---------- Evenimente ----------
document.addEventListener('pointerdown', (e) => { ripple(e); if (e.target.closest('.chip, .date, .nav-btn, .ptoggle, .tab')) buzz(6); });
document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-action]'); if (!el) { if (e.target.matches('[data-modal]') && !(e.target.id === 'playerDlg' && e.target.dataset.first)) closeModals(); return; }
  if (el.tagName === 'FORM' || el.tagName === 'LABEL') return;
  const a = el.dataset.action, id = el.dataset.id;
  const actions = {
    'view': () => { closeModals(); setView(el.dataset.view); }, 'day': () => { switchDay(el.dataset.day); if (state.view === 'plan') window.scrollTo({ top: 0, behavior: 'smooth' }); }, 'filter': () => setFilter(el.dataset.cat), 'person': () => { state.person = el.dataset.person; renderUs(); },
    'toggle-theme': toggleTheme, 'close-modal': () => { addState = null; closeModals(); }, 'open-add': () => openAdd(),
    'copy-link': () => copyText($('#shareUrl').value, 'Linkul a fost copiat.'), 'copy-summary': () => copyText(`${SUMMARY_TEXT}\n\n${location.href.split('#')[0].split('?')[0]}`, 'Programul a fost copiat.'),
    'open-detail': () => { if (addState) { addState = null; $('#addSheet').classList.add('hidden'); clearNewMarker(); } $('#coffeeSheet').classList.add('hidden'); openDetail(id); }, 'delete-loc': () => deleteLocation(id), 'edit-loc': () => { const l = state.custom.find((x) => x.id === id); if (l) openAdd({ editing: l }); },
    'toggle-visited': () => toggleVisited(id, el), 'toggle-skip': () => toggleSkip(id), 'pin-here': () => pinHere(id), 'add-photo': () => { homeOpen = false; openPhotoSheet(id); }, 'photo-file': () => { $('#coffeeSheet').classList.add('hidden'); state.photoTarget = id; $('#photoInput').value = ''; $('#photoInput').click(); }, 'photo-remove': () => removePhoto(id), 'photo-pick': () => savePhotoUrl(id, el.dataset.url),
    'day-route': dayRoute, 'locate': locate, 'open-link': () => window.open(el.dataset.href, '_blank', 'noopener'), 'close-banner': () => $('#radarBanner').classList.add('hidden'), 'install': installApp, 'open-install': openInstallSheet, 'refresh': hardRefresh,
    'speak': () => { $$('.phr-say.speaking').forEach((x) => x.classList.remove('speaking')); el.classList.add('speaking'); buzz(8); speak(el.dataset.text, el.dataset.lang || 'es-ES', () => el.classList.remove('speaking')); },
    'pack-toggle': () => { packingOpen = !packingOpen; renderPacking(); }, 'pack-item': () => packToggleItem(el.dataset.key), 'pack-add': () => packAddItem(el.dataset.cat), 'pack-del': () => packDelItem(el.dataset.key),
    'add-expense': () => openExpense({ day: el.dataset.day, loc: el.dataset.loc }), 'del-expense': () => expenseDel(el.dataset.id), 'exp-save': () => expenseSave(), 'exp-edit': () => openExpense({ id }),
    'exp-cat': () => { expenseDraft.cat = el.dataset.cat; expenseDraft.catTouched = true; expRerender(); }, 'exp-loc': () => { expenseDraft.loc = el.dataset.id || null; if (expenseDraft.loc && !expenseDraft.id && !expenseDraft.catTouched) expenseDraft.cat = guessExpCat('', findLoc(expenseDraft.loc)); expRerender(); },
    'exp-plus': () => { const i = $('#expAmount'); if (i) { i.value = String(Math.round(((num0(i.value) || 0) + +el.dataset.n) * 100) / 100); buzz(6); } },
    'bud-tab': () => { state.budTab = el.dataset.tab; renderBudget(); }, 'bud-filter': () => { const f = { ...(state.budFilter || {}) }; if (el.dataset.day) f.day = f.day === el.dataset.day ? null : el.dataset.day; if (el.dataset.cat) f.cat = f.cat === el.dataset.cat ? null : el.dataset.cat; state.budFilter = f; renderBudget(); },
    'bud-edit': openBudgetEdit, 'bud-save': () => budgetSave(), 'bud-reset': () => budgetSave(true), 'bud-item': () => openItemBudget(id), 'bud-item-save': () => itemBudgetSave(id), 'bud-all': () => { state.budAll = true; renderBudget(); },
    'bud-share': budgetShare, 'bud-copy': () => copyText(budgetReportText(), 'Raportul a fost copiat.'), 'bud-csv': budgetCSV,
    'exp-day': () => { expenseDraft.day = el.dataset.day; if (expenseDraft.loc && findLoc(expenseDraft.loc)?.day !== el.dataset.day) expenseDraft.loc = null; expRerender(); },
    'exp-who': () => { expenseDraft.by = PEOPLE_META[el.dataset.person].name; $$('[data-action="exp-who"]').forEach((c) => c.classList.toggle('on', c === el)); },
    'react': () => { if (myReaction(el.dataset.id) !== el.dataset.k) emojiBurst(el, reactEmoji(el.dataset.k)); toggleReaction(el.dataset.id, el.dataset.k).then(() => {}); popAfterRender(`[data-action="react"][data-id="${CSS.escape(el.dataset.id)}"][data-k="${el.dataset.k}"]`); }, 'open-comments': () => openComments(el.dataset.id),
    'vote': () => castVote(el.dataset.key, el.dataset.ref, Number(el.dataset.v)), 'meal-pick': () => pickMeal(el.dataset.key, el.dataset.ref), 'remove-loc': () => removeLoc(id), 'restore-loc': () => restoreLoc(id),
    'show-on-map': () => showOnMap(id), 'open-search': () => openSearch(), 'srch-hint': () => { const i = $('#srchQ'); if (i) { i.value = el.dataset.q; renderSearch(i.value); i.focus(); } }, 'srch-add': () => { closeModals(); openAdd(); setTimeout(() => { const i = $('#addQ'); if (i) { i.value = el.dataset.q; onAddQuery(el.dataset.q); } }, 150); },
    'whoami': () => { $('#coffeeSheet').classList.add('hidden'); openWhoAmI(false); }, 'who-set': () => setMe(el.dataset.person),
    'hq-meal': () => { const k = el.dataset.key; hq.meal = hq.meal === k ? null : (mealRows(k).length > 1 ? k : null); renderHQ(); },
    'hq-day': () => hqSetDay(el.dataset.day), 'hq-open-day': () => { switchDay(el.dataset.day); setView('plan'); }, 'hq-route': () => { switchDay(el.dataset.day); dayRoute(); },
    'hq-open-plan': () => setView('plan'), 'hq-open-map': () => setView('explore'), 'hq-open-budget': () => setView('budget'),
    'hq-goto-ready': () => $('#hqReady')?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
    'hq-packing': () => { packingOpen = true; setView('info'); renderPacking(); setTimeout(() => $('#packing')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80); },
    'hq-pool': () => { setView('plan'); setTimeout(() => $('#pool')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 120); },
    'hq-person': () => { state.person = el.dataset.person; setView('us'); setTimeout(() => $(`#us-${el.dataset.person}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80); },
    'book': () => openBook(id), 'book-done': () => bookToggle(id), 'book-copy': () => { const loc = findLoc(id); if (loc) copyText(bookMessage(loc), 'Mesajul e copiat: lipiți-l în WhatsApp, Instagram sau e-mail.'); },
    'note-add': () => noteAdd(id), 'note-del': () => noteDel(id, el.dataset.i), 'note-who': () => { lsSet(LS.me, PEOPLE_META[el.dataset.person].name); const t = $('#noteText')?.value || ''; refreshDetail(); if ($('#noteText')) { $('#noteText').value = t; $('#noteText').focus(); } },
    'coll-open': () => openCollection(el.dataset.coll), 'coll-filter': () => { collState.filter = el.dataset.f; renderCollectionSheet(); }, 'coll-visit': async () => { await toggleVisited(id, el); renderCollectionSheet(); },
    'open-coffee': () => coffeeQuick(el), 'coffee-quick': () => coffeeQuick(el), 'coffee-here': () => coffeeQuick(el, el.dataset.place), 'sfx-toggle': toggleSfx, 'open-more': openMore, 'hq-hl': () => hqSetHl(el.dataset.hl), 'tp-h': () => tpUpdate(el, { h: +el.dataset.h }), 'tp-m': () => tpUpdate(el, { m: +el.dataset.m }), 'tp-d': () => tpUpdate(el, { d: +el.dataset.d }), 'tp-nudge': () => tpUpdate(el, { n: +el.dataset.n }), 'tp-flex': () => tpUpdate(el, { flex: true }), 'tp-set': () => tpUpdate(el, { s: +el.dataset.s, d: +el.dataset.d }), 'tip-toggle': () => { state.tipOpen = !state.tipOpen; el.classList.toggle('open', state.tipOpen); el.setAttribute('aria-expanded', state.tipOpen); const ic = el.lastElementChild; if (ic) ic.replaceWith(htmlEl(icon(state.tipOpen ? 'expand_less' : 'expand_more', 'i-20 t-3'))); }, 'more-go': () => { closeModals(); setView(el.dataset.view); scrollTo(0, 0); }, 'ps-close': () => $('#playerDlg').classList.add('hidden'), 'open-home': openHome, 'copy-address': () => copyText('Carrer de Pellaires 35, 08019 Barcelona', 'Adresa a fost copiată.'), 'coffee-undo': coffeeUndo, 'open-weather': openWeather,
    'counter': () => bumpCounter(el.dataset.key, Number(el.dataset.delta), el), 'bucket-new': () => openBucketEditor(el.dataset.person), 'bucket-edit': () => { const it = bucketOf(el.dataset.person).find((x) => x.id === id); if (it) openBucketEditor(el.dataset.person, it); }, 'bucket-pick': () => bucketPick(el.dataset.loc), 'bucket-toggle': () => { const l = findLoc(id); if (l) bucketToggle(el.dataset.person, l); }, 'bucket-save': bucketSave, 'bucket-delete': bucketDelete, 'bucket-newloc': bucketNewLoc,
    'schedule': () => openSchedule(id), 'sched-day': () => { $$('#schedDays .chip').forEach((c) => c.classList.toggle('on', c === el)); if (el.dataset.time && el.dataset.time !== 'Flexibil') tpSetValue('schedTime', el.dataset.time); }, 'sched-save': () => scheduleSave(), 'sched-pool': () => scheduleSave('pool'),
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
    'plan-mode': () => { lsSet(LS.planMode, el.dataset.mode); renderDay(); },
    'gap-place': () => gapPlace(el.dataset.day, el.dataset.id, el.dataset.time),
    'gap-open': () => openGap(el.dataset.day, Number(el.dataset.gap)),
    'here-open': openHereSheet,
    'here-day': () => { hereState.day = el.dataset.day; $$('#hereDays .chip').forEach((c) => c.classList.toggle('on', c === el)); hereRefresh(); },
    'here-gps': () => { if (state.pos) { hereState.pt = { lat: state.pos.lat, lng: state.pos.lng }; hereState.ptName = 'poziția ta'; $$('#hereDays .chip, .here-set .chip').forEach((c) => c.dataset.action === 'here-gps' && c.classList.add('on')); hereRefresh(); } else { toast('Caut poziția… deschide Harta și apasă „Unde sunt”.', 'my_location', 4000); startRadar(); } },
    'here-pick': () => { closeModals(); herePick(); },
    'here-apply': hereApply,
  };
  actions[a]?.();
});
document.addEventListener('submit', (e) => {
  if (e.target.dataset.action === 'photo-url') { e.preventDefault(); return savePhotoUrl(e.target.dataset.id, e.target.querySelector('#photoUrl').value); }
  if (e.target.closest('#coffeeBody') && bucketEdit) { e.preventDefault(); bucketSave(); }
});
document.addEventListener('change', async (e) => {
  if (e.target.matches('.bucket-check')) { if (e.target.checked) { buzz(14); sfx('power'); const r = e.target.getBoundingClientRect(); confetti(r.left + r.width / 2, r.top + r.height / 2); scorePop(r.left + r.width / 2, r.top, `+${PTS.bucket}`); } else sfx('undo'); bucketSet(e.target.dataset.person, e.target.dataset.id, { done: e.target.checked }); }
  if (e.target.id === 'photoInput' && e.target.files?.[0] && state.photoTarget) { try { await savePhoto(state.photoTarget, e.target.files[0]); } catch (err) { console.error(err); toast('Nu am putut salva poza: ' + (err.message || err), 'image'); } }
  if (e.target.id === 'hereTime') { const t = tpParse(e.target.value); if (t) { hereState.at = t.s; hereRefresh(); } }
});
if (!/Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent)) $$('.kbd').forEach((k) => { k.textContent = 'Ctrl K'; });
document.addEventListener('input', (e) => { if (e.target.id === 'sharedNotes') onNotesInput(); if (e.target.id === 'bucketSearch') $('#bucketPickList').innerHTML = pickListHTML(e.target.value); if (e.target.id === 'addQ') onAddQuery(e.target.value); if (e.target.id === 'srchQ') renderSearch(e.target.value); });
document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && e.target.id === 'srchQ') { e.preventDefault(); const first = $('#srchResults [data-action="show-on-map"]'); if (first) first.click(); return; }
  if (((e.key === 'k' || e.key === 'K') && (e.ctrlKey || e.metaKey)) || (e.key === '/' && !/input|textarea/i.test(e.target.tagName))) { e.preventDefault(); openSearch(); return; }
  if (e.key === 'Escape') { if (state.picking) stopPick(); addState = null; closeModals(); } if (e.key === 'Enter' && e.target.id === 'addQ') { e.preventDefault(); const first = $('#addBody [data-action="add-choose"]'); if (first) first.click(); } });
document.addEventListener('visibilitychange', () => { if (!document.hidden) { renderDay(); renderNextStop(); loadWeather(); if (state.radarOn) startRadar(); } });

window.__pos = (lat, lng) => { state.pos = { lat, lng, acc: 20 }; };
window.__plan = (d) => { const p = planDay(d); return { check: `prânz ${p.ess.lunch ? '✓' : '✗'} cină ${p.ess.dinner ? '✓' : '✗'} cafele ${p.ess.coffee} dulciuri ${p.ess.sweet}`, level: p.level, free: p.free, slots: p.slots.map((x) => `${hhmm(x.start)}-${hhmm(x.end)}${x.auto ? '*' : ''} ${x.loc.title}${x.travel ? ' (+' + x.travel + ')' : ''}`), issues: p.issues.map((i) => `${i.type} ${i.a.loc.title} → ${i.b.loc.title} ${i.late || i.over || ''}`) }; };

// ---------- Start ----------
hydrateIcons(); applyThemeIcon(); { const b = $('#buildStamp'); if (b && window.BUILD) b.textContent = `${window.BUILD.slice(6, 8)}.${window.BUILD.slice(4, 6)} ${window.BUILD.slice(8, 10)}:${window.BUILD.slice(10, 12)}`; }
loadLocal(); renderNotes(); renderWeather(); loadWeather(); setSyncStatus('connecting');
state.day = todayKey() || 'thu'; renderDay(); renderNextStop(); renderHome();
const hasShare = new URL(location.href).searchParams.has('text') || new URL(location.href).searchParams.has('url');
setView(hasShare ? 'plan' : isDesk() ? lsGet(LS.viewDesk, 'hq') : lsGet(LS.view, 'plan'));
renderMe(); setupPWA(); connectFirebase(); handleShareTarget(); dragInit(); $$('[data-sfx-label]').forEach((el) => { el.textContent = sfxOn() ? 'Sunet pornit' : 'Sunet oprit'; });
if (!hasMe()) setTimeout(() => openWhoAmI(true), 500); else maybePromptInstall();
setInterval(() => { renderNextStop(); if (state.view === 'hq') renderHQHero(); }, 60000);
// Fereastra trece între telefon și desktop (laptop micșorat, tabletă rotită)
DESK.addEventListener('change', () => { setView(state.view === 'hq' && !isDesk() ? 'plan' : state.view); renderAll(); setTimeout(() => { state.map?.invalidateSize(); state.hqMap?.invalidateSize(); }, 150); });

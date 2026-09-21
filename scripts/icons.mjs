// Generează public/icons.js din @material-symbols/svg-400 (Rounded, weight 400, outlined + fill).
// Iconițele sunt SVG inline: apar instant, fără font de 450 KB, și se colorează cu currentColor.
import { readFileSync, writeFileSync } from 'node:fs';
const NAMES = `add add_a_photo add_task air auto_awesome bakery_dining beach_access bolt cake calendar_month call castle celebration check check_circle
church clear_day clear_night close cloud cloud_done cloud_off coffee confirmation_number content_paste credit_card_off dark_mode delete directions_bus directions_walk download
edit euro expand_more explore foggy format_quote group home hourglass_top icecream image info landscape language light_mode lightbulb link local_activity local_cafe
local_pharmacy local_taxi lunch_dining map menu_book my_location near_me nightlife open_in_new palette partly_cloudy_day partly_cloudy_night payments photo_camera photo_library
place push_pin radar rainy ramen_dining remove restaurant restaurant_menu rocket_launch route schedule sell shopping_bag skip_next smartphone star storefront subway sunny sync
thermostat thumb_up thunderstorm tips_and_updates train umbrella undo water_drop waves weather_snowy wb_twilight wine_bar mobile mobile_share mobile_arrow_down attractions local_mall edit_calendar bookmark bookmark_add favorite expand_less directions navigation cookie event chevron_right arrow_forward done_all verified explore_nearby hotel`.split(/\s+/).filter(Boolean);
const ALIAS = { auto_awesome: 'wand_stars', clear_night: 'bedtime', expand_more: 'keyboard_arrow_down', expand_less: 'keyboard_arrow_up', place: 'location_on', push_pin: 'keep', restaurant_menu: 'menu_book', smartphone: 'mobile', tips_and_updates: 'emoji_objects' };
const dir = new URL('../node_modules/@material-symbols/svg-400/rounded/', import.meta.url);
const path = (svg) => { const m = /<path d="([^"]+)"/.exec(svg); if (!m) throw new Error('no path'); return m[1]; };
const out = {}; const missing = [];
for (const n of NAMES) {
  const src = ALIAS[n] || n;
  try { const o = path(readFileSync(new URL(src + '.svg', dir), 'utf8')); let f = path(readFileSync(new URL(src + '-fill.svg', dir), 'utf8')); out[n] = f === o ? [o] : [o, f]; }
  catch { missing.push(n); }
}
if (missing.length) { console.error('Lipsesc:', missing.join(' ')); process.exit(1); }
writeFileSync(new URL('../public/icons.js', import.meta.url), `// Generat de scripts/icons.mjs (Material Symbols Rounded 400). Nu edita manual.\nexport const ICONS = ${JSON.stringify(out)};\n`);
console.log(NAMES.length, 'iconițe →', Math.round(JSON.stringify(out).length / 1024), 'KB');

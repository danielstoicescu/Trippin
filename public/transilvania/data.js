// Programul: LIFT la Porumbacu de Sus (20–22 nov 2026) + Via Transilvanica, etapele 33–34 (23–24 nov).
// Surse: harta oficială Via Transilvanica (etape, km, diferență de nivel, cazări, ștampile), mersul oficial al
// trenurilor 2025–2026 (data.gov.ro, CFR Călători și Interregional), prognoza Open-Meteo citită pe 19 nov 2026,
// ore de lumină calculate astronomic (NOAA) pentru Porumbacu și traseu. `verify: true` = de confirmat la telefon.
// Coordonatele `approx: true` sunt la nivel de sat; „Fixează aici” le corectează.

export const TRIP = {
  id: 'transilvania-aventura',
  start: '2026-11-20',
  end: '2026-11-24',
  startAt: '2026-11-20T10:00:00+02:00',
  endAt: '2026-11-24T16:45:00+02:00',
  days: { fri: '2026-11-20', sat: '2026-11-21', sun: '2026-11-22', mon: '2026-11-23', tue: '2026-11-24' },
  base: {
    title: 'Porumbacu de Sus · LIFT', address: 'Porumbacu de Sus, Sibiu', placeQuery: 'Porumbacu de Sus, Sibiu',
    lat: 45.7137, lng: 24.4734, approx: true,
    short: 'Locul cursului LIFT', arrive: 'Vineri 20 nov, pentru weekendul de curs',
    note: 'Adresa exactă a locației o afli de la organizatori. Luni și marți dormi pe traseu (Biertan sau Mediaș, apoi Nemșa).',
  },
};

const POR = { lat: 45.7137, lng: 24.4734 };          // Porumbacu de Sus
const POR_GARA = { lat: 45.7584, lng: 24.4563 };     // gara Porumbacu, în Porumbacu de Jos (Str. Gării)
const SIBIU_GARA = { lat: 45.8027, lng: 24.1590 };
const BIERTAN = { lat: 46.1363, lng: 24.5210 };
const RICHIS = { lat: 46.0979, lng: 24.4818 };
const NEMSA = { lat: 46.0860, lng: 24.4445 };
const MOSNA = { lat: 46.0924, lng: 24.3957 };
const MEDIAS = { lat: 46.1625, lng: 24.3474 };
const MEDIAS_GARA = { lat: 46.1605, lng: 24.3492 };

export const ZONES = {
  porumbacu: { label: 'Porumbacu & Făgăraș', icon: 'landscape' },
  transfer:  { label: 'Sibiu & drumul spre Târnave', icon: 'train' },
  biertan:   { label: 'Biertan & Richiș', icon: 'church' },
  nemsa:     { label: 'Nemșa & Moșna', icon: 'park' },
  medias:    { label: 'Mediaș', icon: 'castle' },
};

export const DAY_ZONES = {
  fri: ['porumbacu'], sat: ['porumbacu'], sun: ['porumbacu', 'transfer', 'biertan'],
  mon: ['biertan', 'nemsa'], tue: ['nemsa', 'medias'],
};

// Numele zilelor, după specific
export const DAY_THEMES = {
  fri: { name: 'Sosirea la poalele Făgărașului', short: 'Sosire', icon: 'landscape', color: '#5353E9', sub: 'Workshop „Facilitate with impact” cu Alina Marian · „Teaching Forward · LIFT” în carnet · agenda · primul cerc · seara cu lămpi' },
  sat: { name: 'Ziua cu lumina bună', short: 'Lumină', icon: 'photo_camera', color: '#D93025', sub: 'AeroPress cu Făgărașul · sesiuni și facilitatori · snap-uri de notițe · Zenit la geam · apus 16:46' },
  sun: { name: 'Cercul de final & drumul spre Biertan', short: 'Final', icon: 'route', color: '#E8710A', sub: 'Cardurile cu o frază · ultimul cerc · portretul de grup pe Zenit · cu mașina spre Biertan (sau trenul de 17:19)' },
  mon: { name: 'Via Transilvanica · etapa 33', short: 'VT 33', icon: 'rainy', color: '#1E8E3E', sub: 'Biertan → Richiș → Nemșa · 14,9 km · +492 m · ploaie, noroi · 3 ștampile' },
  tue: { name: 'Via Transilvanica · etapa 34', short: 'VT 34', icon: 'weather_snowy', color: '#1A73E8', sub: 'Nemșa → Moșna → Mediaș · 19,8 km · +491 m · ger · cafea la Friends · trenul de 16:45' },
};

export const DAY_TIPS = {
  fri: 'Vreme: 5…12°, ploaie slabă, rafale ~54 km/h, apus la 16:47. Tema weekendului: workshopul „Facilitate with impact”, cu Alina Marian. Titlul de lucru al reel-ului: „02 · Facilitare” (îl confirmi din agendă). Alina e facilitatoare nouă în serie: îi ceri acordul pentru filmare înainte de primul cadru cu fața ei. Primul cadru al episodului e „Teaching Forward · LIFT — Porumbacu, 20–22 nov” scris în carnet. În pauza de prânz suni pentru cazare în Nemșa (luni) și Biertan (duminică) și rezervi taxiul de la Biertan: are o singură mașină.',
  sat: 'Vreme: 4…13°, înnorat, uscat, apus la 16:46. Singura zi bună de exterior: AeroPress-ul dimineața între 7:30 și 8:30, lumina de aur de la 16:00. Seara descarci clipurile și pregătești 5–6 carduri pentru duminică.',
  sun: 'Vreme: 2…10°, uscat, frig. Din Porumbacu nu e niciun tren între 12:53 și 17:19. Varianta A: cu mașina direct în Biertan (70 km, ~1h25). Varianta B: trenul de 17:19 până în Mediaș (20:28), dormi acolo, iar luni dimineață iei taxiul. Pe cea pe care n-o folosești o scoți din program.',
  mon: 'Vreme: 0…5°, ploaie 12–13 mm, rafale ~55 km/h, apus la 16:44, întuneric la 17:17. Între Biertan și Richiș (11,3 km) nu e niciun magazin: apă, mâncare și termos plin din Biertan. Ștampile la Biertan, Richiș și Nemșa. Țintește să ajungi în Nemșa până la 15:30.',
  tue: 'Vreme: −1…+1°, se simte −6°, uscat. Pleci la 7:30, odată cu răsăritul. Moșna e ultimul sat cu magazin; după el urmează ~14,5 km de pădure fără nimic. Poate fi polei la coborârea asfaltată spre Mediaș. Trenul spre București: 16:45 (sau 14:19, dacă ajungi devreme).',
};

export const PRE_DEPART = {};

export const ITINERARY = [
  // VINERI 20 · Sosirea
  { id: 'fri-road', icon: 'directions_car', minStay: 30, day: 'fri', time: '10:00 – 10:30', zone: 'porumbacu', cat: 'sweet', catLabel: 'B-roll · drumul',
    img: { q: 'Făgăraș Mountains' },
    title: 'Drumul spre munte', short: 'Parbrizul, ștergătoarele, Făgărașul în nori',
    desc: 'Primele cadre ale episodului: parbrizul cu ștergătoare, munții în nori, plăcuța satului, bagajele la sosire. Clipuri de 5–8 s, ținute fix, 4K 30 fps HLG, fără filtre, expunerea blocată. Ora e orientativă: o potrivești după cum ajungi.',
    address: 'Porumbacu de Sus, Sibiu', placeQuery: 'Porumbacu de Sus, Sibiu', hours: '', price: '',
    tips: ['Telefonul pe suport sau sprijinit de bord, nu în mână.', 'Plăcuța satului e un cadru bun de 2 s pentru textul de deschidere.'],
    ...POR, approx: true, radius: 1500 },
  { id: 'fri-first', minStay: 15, day: 'fri', time: '10:30 – 10:45', zone: 'porumbacu', cat: 'sweet', catLabel: 'Deschiderea ep02',
    rec: 'mâna care termină de scris, filmată fix 5 s',
    title: '„Teaching Forward · LIFT” scris de mână', short: 'Primul cadru: unde suntem, din prima secundă',
    desc: 'În carnet: „Teaching Forward · LIFT — Porumbacu, 20–22 nov”. Filmezi fix 5 s, cu mâna care termină de scris. Așa se vede din prima secundă unde suntem și ce e, cum a cerut Dora: elemente mici, documentaristice, care leagă clipul de curs.',
    address: 'Porumbacu de Sus, Sibiu', placeQuery: 'Porumbacu de Sus, Sibiu',
    tips: ['Lumină de la geam, din lateral.', 'Scrie încet: ai nevoie de 3–4 s de mână în mișcare.'],
    ...POR, approx: true },
  { id: 'fri-agenda', minStay: 120, day: 'fri', time: '11:00 – 13:00', zone: 'porumbacu', cat: 'art', catLabel: 'Workshop · Facilitate with impact',
    rec: 'agenda „Facilitate with impact”, filmată fix și lizibil',
    title: '„Facilitate with impact” cu Alina Marian', short: 'Titlul de lucru: „02 · Facilitare” · acordul Alinei întâi',
    desc: 'Workshopul weekendului: „Facilitate with impact”, cu Alina Marian, facilitatoare la Teaching Forward. Agenda filmată fix și lizibil. Titlul de lucru al reel-ului: „02 · Facilitare”; îl confirmi pe loc din agendă. Alina e facilitatoare nouă în serie: îi ceri acordul pentru filmare înainte de primul cadru cu fața ei. Un cadru larg cu cercul. Orele sesiunilor le afli din agendă și le muți aici în aplicație.',
    address: 'Porumbacu de Sus, Sibiu', placeQuery: 'Porumbacu de Sus, Sibiu', verify: true,
    tips: ['Acordul Alinei Marian pentru filmare: îl ceri în prima pauză și îl notezi în aplicație.', 'Fotografiază agenda: din ea îți ajustezi programul de sâmbătă și duminică.', 'Facilitatorii sunt asseturile seriei: un cadru cu mâna care scrie, unul larg cu grupul.'],
    ...POR, approx: true },
  { id: 'fri-lunch', meal: 'lunch', minStay: 45, day: 'fri', time: '13:00 – 13:45', zone: 'porumbacu', cat: 'food', catLabel: 'Prânz + telefoane',
    title: 'Prânzul și trei telefoane pentru drum', short: 'Nemșa · Biertan · taxiul',
    desc: 'La prânz (la curs sau unde mănâncă grupul) rezolvi drumul de luni și marți:\n1. Cazare în Nemșa pentru luni seara.\n2. Biertan pentru duminică seara, dacă ai mașină, altfel Mercure în Mediaș.\n3. Taxiul Cornel Irimie pentru Biertan.\nÎntreabă și la curs cine pleacă duminică cu mașina spre Sibiu sau Mediaș.',
    address: 'Porumbacu de Sus, Sibiu', placeQuery: 'Porumbacu de Sus, Sibiu',
    book: { need: 'obligatoriu', tel: '+40757056113', label: 'Cazare Nemșa · Familia Muntean', note: 'Luni 23 nov, o noapte, cu masă. Alternative în Nemșa: Bed and Wine 0743 332 405, Liviana 0722 552 001.' },
    tips: ['Taxi Biertan ↔ Mediaș: Cornel Irimie, 0740 585 568. O singură mașină: rezervi cu o zi înainte.', 'Nu e confirmat că pensiunile sunt deschise la final de noiembrie: suni, nu scrii.'],
    ...POR, approx: true },
  { id: 'fri-crew', minStay: 10, day: 'fri', time: '13:45 – 13:55', zone: 'porumbacu', cat: 'sweet', catLabel: 'Colegii',
    title: 'Magda și echipa de marketing', short: 'Ghidul de filmare + 2–3 cadre cu tine',
    desc: 'Le trimiți ghidul de filmare din pagina „Meanwhile at Teaching Forward” (setări 9:16, 4K, clipuri de 5 s, fără filtre, fișierele originale în folderul comun) și îi rogi să te filmeze și pe tine 2–3 cadre. În ep01 nu apari deloc.',
    address: 'Porumbacu de Sus, Sibiu', placeQuery: 'Porumbacu de Sus, Sibiu',
    ...POR, approx: true },
  { id: 'fri-sessions', minStay: 180, day: 'fri', time: '14:00 – 17:00', zone: 'porumbacu', cat: 'art', catLabel: 'Workshop · Facilitate with impact',
    title: 'Facilitate with impact · după-amiaza', short: 'Alina Marian · gesturi, markere, tabla · zoom 5× la perechi',
    desc: 'Mâna Alinei (după acord) care scrie sau arată, sala, perechile la lucru filmate de la distanță cu zoom 5×, ca să nu deranjezi. Între 16:00 și 16:47 e lumina de aur: dacă e pauză, un cadru afară cu munții.',
    address: 'Porumbacu de Sus, Sibiu', placeQuery: 'Porumbacu de Sus, Sibiu', verify: true,
    ...POR, approx: true },
  { id: 'fri-evening', meal: 'dinner', minStay: 120, day: 'fri', time: '19:00 – 21:00', zone: 'porumbacu', cat: 'food', catLabel: 'Cina & atmosferă',
    rec: 'mâini pe căni, conversații filmate din spate',
    title: 'Cina, lămpile, discuțiile', short: 'Atmosferă + 30 s de liniște pentru montaj',
    desc: 'Mâini pe căni, conversații filmate de la distanță, lumina caldă a lămpilor. Înregistrezi 30 s de liniște în sală, pentru montaj. Înainte de culcare descarci clipurile pe laptop și pui telefonul și power bank-ul la încărcat.',
    address: 'Porumbacu de Sus, Sibiu', placeQuery: 'Porumbacu de Sus, Sibiu',
    ...POR, approx: true },

  // SÂMBĂTĂ 21 · Ziua cu lumina bună
  { id: 'sat-aeropress', minStay: 60, day: 'sat', time: '07:30 – 08:30', zone: 'porumbacu', cat: 'coffee', catLabel: 'Cafeaua zilei · AeroPress',
    rec: 'turnarea la 60 fps și cana cu munții în spate',
    img: { q: 'Făgăraș Mountains winter' },
    title: 'AeroPress cu Făgărașul în spate', short: 'Semnătura seriei: 2 cadre × 2 s',
    desc: 'Afară, la 4°, cu aburul vizibil. Doar 2 cadre de câte 2 s: turnarea la 60 fps și cana pe fundalul munților. Scurt, ca să nu repete deschiderea din ep01. Răsăritul e la 7:30: lumina vine din spatele munților.',
    address: 'Porumbacu de Sus, Sibiu', placeQuery: 'Porumbacu de Sus, Sibiu',
    tips: ['Apa fierbinte în termos de seara, dacă bucătăria e închisă dimineața.', 'Mănușile subțiri, cu care poți folosi ecranul, sunt pentru momentul ăsta.'],
    ...POR, approx: true },
  { id: 'sat-morning', minStay: 210, day: 'sat', time: '09:00 – 12:30', zone: 'porumbacu', cat: 'art', catLabel: 'Workshop · Facilitate with impact',
    title: 'Facilitate with impact · dimineața', short: 'Alina Marian · mâna care scrie · cadrul larg · zoom',
    desc: 'Sala care se umple, primul exercițiu de facilitare. Alina Marian: mâna care scrie sau arată, plus un cadru larg cu grupul. Exercițiile în perechi le filmezi de la distanță, cu zoom 5×.',
    address: 'Porumbacu de Sus, Sibiu', placeQuery: 'Porumbacu de Sus, Sibiu', verify: true,
    ...POR, approx: true },
  { id: 'sat-notes', minStay: 15, day: 'sat', time: '12:30 – 12:45', zone: 'porumbacu', cat: 'sweet', catLabel: 'Cererea Dorei',
    title: '5–6 snap-uri de notițe', short: 'Carnet · post-it · flipchart',
    desc: 'Carnetul tău, post-it-uri, flipchart. Se vede ce a scris mâna, nu fața. Din ele ies textele scurte, în stil jurnal, care leagă clipul de curs.',
    address: 'Porumbacu de Sus, Sibiu', placeQuery: 'Porumbacu de Sus, Sibiu',
    ...POR, approx: true },
  { id: 'sat-lunch', meal: 'lunch', minStay: 60, day: 'sat', time: '13:00 – 14:00', zone: 'porumbacu', cat: 'food', catLabel: 'Prânz',
    title: 'Prânzul cu grupul', short: 'Pauza bună pentru Zenit la geam',
    desc: 'Prânzul cu grupul. După masă, cât e lumină bună la geam: 2–3 facilitatori în portret pe Zenit, la 1/30, sprijinit.',
    address: 'Porumbacu de Sus, Sibiu', placeQuery: 'Porumbacu de Sus, Sibiu',
    ...POR, approx: true },
  { id: 'sat-zenit', minStay: 20, day: 'sat', time: '14:00 – 14:20', zone: 'porumbacu', cat: 'sweet', catLabel: 'Zenit TTL · ISO 400',
    rec: 'portrete la geam și o natură moartă cu notițe și cafea',
    title: 'Portrete pe film, natură moartă', short: 'Din rolă poate ieși caruselul seriei',
    desc: '2–3 facilitatori lângă geam, notițe și cafea pe masă, un peisaj. ISO 400 se poate forța la 800. Pe frig, filmul devine casant, deci derulezi încet.',
    address: 'Porumbacu de Sus, Sibiu', placeQuery: 'Porumbacu de Sus, Sibiu',
    ...POR, approx: true },
  { id: 'sat-afternoon', minStay: 100, day: 'sat', time: '14:20 – 16:00', zone: 'porumbacu', cat: 'art', catLabel: 'Workshop · Facilitate with impact',
    title: 'Facilitate with impact · după-amiaza', short: 'Discuțiile, perechile, tabla',
    desc: 'Continuarea sesiunilor. Dacă e timp, notezi ideile-cheie pentru texte, în stil jurnal, direct în aplicație (Notițe).',
    address: 'Porumbacu de Sus, Sibiu', placeQuery: 'Porumbacu de Sus, Sibiu', verify: true,
    ...POR, approx: true },
  { id: 'sat-sunset', minStay: 45, day: 'sat', time: '16:00 – 16:45', zone: 'porumbacu', cat: 'sweet', catLabel: 'Lumina de aur',
    rec: 'grupul pe drum, munții în lumină joasă',
    img: { q: 'Făgăraș Mountains sunset' },
    title: 'Apusul cu grupul și munții', short: 'Lumina de aur 16:00 · apus 16:46',
    desc: 'Grupul pe drum în pauza de după-amiază, munții în lumină joasă. Cele mai frumoase culori sunt în 5–15 minute după apus. Întunericul vine la 17:19.',
    address: 'Porumbacu de Sus, Sibiu', placeQuery: 'Porumbacu de Sus, Sibiu',
    ...POR, approx: true, radius: 1500 },
  { id: 'sat-evening', meal: 'dinner', minStay: 120, day: 'sat', time: '19:00 – 21:00', zone: 'porumbacu', cat: 'food', catLabel: 'Cina · rutina',
    title: 'Cina, descărcat, carduri pentru mâine', short: 'Clipurile pe laptop · 5–6 carduri + marker',
    desc: 'După cină: clipurile pe laptop, telefonul și power bank-ul la încărcat. Pregătești pentru duminică 5–6 carduri și un marker. Verifici prognoza pentru luni.',
    address: 'Porumbacu de Sus, Sibiu', placeQuery: 'Porumbacu de Sus, Sibiu',
    ...POR, approx: true },

  // DUMINICĂ 22 · Final + drumul spre Biertan
  { id: 'sun-aeropress', minStay: 30, day: 'sun', time: '07:45 – 08:15', zone: 'porumbacu', cat: 'coffee', catLabel: 'Cafeaua zilei · AeroPress',
    title: 'AeroPress și termosul pentru drum', short: 'Umpli termosul pentru transfer',
    desc: 'Ultima dimineață la Porumbacu. Dacă sâmbătă n-a ieșit cadrul cu munții, azi e a doua șansă (răsărit 7:31). Umpli termosul pentru drum.',
    address: 'Porumbacu de Sus, Sibiu', placeQuery: 'Porumbacu de Sus, Sibiu',
    ...POR, approx: true },
  { id: 'sun-cards', minStay: 30, day: 'sun', time: '09:00 – 09:30', zone: 'porumbacu', cat: 'sweet', catLabel: 'Gândul episodului',
    rec: 'mâna care scrie și cardul terminat',
    title: 'Cardurile cu o frază', short: '„Ce iei cu tine din weekend? O frază.”',
    desc: 'Dai câte un card la 4–5 oameni și la un facilitator: „Ce iei cu tine din weekend? O frază.” Filmezi mâna care scrie și cardul terminat. Textul intră direct în reel, ca gând scurt.',
    address: 'Porumbacu de Sus, Sibiu', placeQuery: 'Porumbacu de Sus, Sibiu',
    tips: ['Notezi frazele și în aplicație (Notițe), ca să le ai la montaj.'],
    ...POR, approx: true },
  { id: 'sun-circle', minStay: 150, day: 'sun', time: '09:30 – 12:00', zone: 'porumbacu', cat: 'art', catLabel: 'Workshop · închiderea',
    title: 'Facilitate with impact · cercul de final', short: 'Cercul filmat larg',
    desc: 'Ultimele sesiuni și cercul de închidere, filmat larg. Orele exacte le iei din agendă.',
    address: 'Porumbacu de Sus, Sibiu', placeQuery: 'Porumbacu de Sus, Sibiu', verify: true,
    ...POR, approx: true },
  { id: 'sun-portrait', minStay: 15, day: 'sun', time: '12:00 – 12:15', zone: 'porumbacu', cat: 'sweet', catLabel: 'Zenit',
    title: 'Portretul de grup pe film', short: 'Afară sau lângă geam, cât e lumină',
    desc: 'Portretul de grup pe Zenit. Afară, dacă e uscat, altfel lângă geam. Două cadre, ca să ai unul bun.',
    address: 'Porumbacu de Sus, Sibiu', placeQuery: 'Porumbacu de Sus, Sibiu',
    ...POR, approx: true },
  { id: 'sun-lunch', meal: 'lunch', minStay: 60, day: 'sun', time: '12:15 – 13:15', zone: 'porumbacu', cat: 'food', catLabel: 'Prânz',
    title: 'Ultimul prânz cu grupul', short: 'Confirmi mașina spre Biertan',
    desc: 'Ultimul prânz. Confirmi cu cine mergi cu mașina, sau rămâi pe trenul de 17:19.',
    address: 'Porumbacu de Sus, Sibiu', placeQuery: 'Porumbacu de Sus, Sibiu',
    ...POR, approx: true },
  { id: 'sun-last', minStay: 10, day: 'sun', time: '13:50 – 14:00', zone: 'porumbacu', cat: 'sweet', catLabel: 'Ultimul cadru',
    title: 'Rucsacul în spate, poarta, drumul', short: 'Puntea spre partea a doua',
    desc: 'Puntea spre partea a doua a călătoriei: rucsacul pus pe umăr, poarta, drumul care pleacă din sat.',
    address: 'Porumbacu de Sus, Sibiu', placeQuery: 'Porumbacu de Sus, Sibiu',
    ...POR, approx: true },
  { id: 'sun-car', fixed: true, icon: 'directions_car', minStay: 90, day: 'sun', time: '14:00 – 15:30', zone: 'biertan', cat: 'shop', catLabel: 'Varianta A · cu mașina',
    arrive: { title: 'Biertan', placeQuery: 'Biertan, Sibiu', ...BIERTAN },
    img: { q: 'Biertan fortified church' },
    title: 'Cu mașina direct în Biertan', short: '70 km · ~1h25 · ajungi pe lumină',
    desc: 'Cu un coleg sau cu un taxi: 70 km, ~1h25, ajungi pe la 15:30, încă pe lumină. Altă variantă: cineva te lasă în Sibiu (35 km), iei trenul de 15:15 până în Mediaș (16:35), apoi taxiul ~30 min, adică Biertan pe la 17:15.',
    address: 'Biertan, Sibiu', placeQuery: 'Biertan, Sibiu', price: 'Taxi Mediaș → Biertan: tarif neconfirmat',
    book: { need: 'recomandat', tel: '+40750722285', label: 'Cazare Biertan · Pensiunea Unglerus', note: 'Duminică 22 nov, o noapte. Alternative: Casa Ana 0787 876 009, Oppidium / Eva Wagner 0740 679 119.' },
    tips: ['Dacă alegi trenul (varianta B), scoate cardul ăsta din program.', 'Prima ștampilă VT e în Biertan: o iei luni dimineață.'],
    ...BIERTAN, approx: true, radius: 600 },
  { id: 'sun-train', fixed: true, icon: 'train', minStay: 190, day: 'sun', time: '17:19 – 20:28', zone: 'transfer', cat: 'shop', catLabel: 'Varianta B · trenul',
    arrive: { title: 'Gara Mediaș', placeQuery: 'Gara Mediaș', ...MEDIAS_GARA },
    title: 'Trenul: Porumbacu → Sibiu → Mediaș', short: 'R 2103 17:19 → Sibiu 18:38 · R 10765 19:10 → Mediaș 20:28',
    desc: 'R 2103: Porumbacu 17:19 → Sibiu 18:38, apoi R 10765: Sibiu 19:10 → Mediaș 20:28 (sau R 2569: 19:38 → 20:59). Gara Porumbacu e în Porumbacu de Jos, la ~7 km de Porumbacu de Sus. Dormi la Mercure în Mediaș, iar luni la 8:00 iei taxiul spre Biertan. Plasa de siguranță: R 2105, Porumbacu 22:27 → Sibiu 23:26, dormi în Sibiu.',
    address: 'Gara Porumbacu, Porumbacu de Jos', placeQuery: 'Gara Porumbacu', hours: 'Duminică spre Sibiu: 12:53 · 17:19 · 22:27', price: 'Bilet din aplicația CFR Călători sau de la casă',
    book: { need: 'recomandat', tel: '+40730099303', label: 'Mercure Mediaș (varianta B)', note: 'Duminică 22 nov, o noapte. Are reducere pentru drumeți Via Transilvanica.' },
    tips: ['Orarele sunt din mersul oficial 2025–2026: verifică-le pe mersultrenurilor.infofer.ro.', 'Dacă mergi cu mașina (varianta A), scoate cardul ăsta din program.'],
    ...POR_GARA, approx: true, radius: 400 },
  { id: 'sun-dinner', meal: 'dinner', minStay: 60, day: 'sun', time: '19:00 – 20:00', zone: 'biertan', cat: 'food', catLabel: 'Cina',
    title: 'Cina la pensiune', short: 'Cumperi mâncare și apă pentru luni',
    desc: 'Cina unde dormi (Biertan sau Mediaș). Pregătești rucsacul pentru ploaie: haine în sac impermeabil, husa pe rucsac, telefonul în pungă zip. Cumperi apă și mâncare pentru luni: între Biertan și Richiș nu e niciun magazin.',
    address: 'Biertan, Sibiu', placeQuery: 'Biertan, Sibiu',
    ...BIERTAN, approx: true },

  // LUNI 23 · VT etapa 33
  { id: 'mon-start', fixed: true, icon: 'flag', minStay: 30, day: 'mon', time: '08:00 – 08:30', zone: 'biertan', cat: 'shop', catLabel: 'Start · prima ștampilă',
    img: { q: 'Biertan fortified church' },
    title: 'Biertan: start și prima ștampilă', short: 'Dacă ai dormit în Mediaș: taxiul la 8:00',
    desc: 'Dacă ai dormit în Biertan, pleci direct. Dacă ai dormit în Mediaș, ai taxiul la 8:00 și ajungi în Biertan pe la 8:30. Prima ștampilă VT e la Biertan. Biserica fortificată e monument UNESCO: un cadru cu ea în ceață deschide partea a doua.',
    address: 'Biertan, Sibiu', placeQuery: 'Biserica fortificată Biertan', site: 'https://www.viatransilvanica.com/ro/tinuturi/terra-saxonum/biertan-nemsa',
    book: { need: 'obligatoriu', tel: '+40740585568', label: 'Taxi Mediaș → Biertan (varianta B)', note: 'Luni 23 nov, ora 8:00, din fața hotelului Mercure. O singură mașină: rezervi cu o zi înainte.' },
    ...BIERTAN, approx: true, radius: 500 },
  { id: 'mon-leg1', minStay: 240, day: 'mon', time: '08:30 – 12:30', zone: 'biertan', cat: 'fun', catLabel: 'VT 33 · km 0 → 11,3',
    rec: 'marcajul VT pe un stâlp, bocancii în noroi',
    img: { q: 'Richiș fortified church' }, site: 'https://www.viatransilvanica.com/ro/tinuturi/terra-saxonum/biertan-nemsa',
    title: 'Biertan → Richiș', short: '11,3 km · drumuri de pământ, pădure, vie · fără magazin',
    desc: 'Drumuri de pământ, pădure, margini de lan și de vie. Pe ploaie, foarte probabil noroi. Pe porțiunea asta nu e niciun magazin. Oficial, toată etapa 33 are 4h30; pe noroi socotește ~6h cu pauzele. Ora de aici e o estimare.',
    address: 'Richiș, Sibiu', placeQuery: 'Richiș, Sibiu', hours: 'Etapa 33 întreagă: 14,9 km · +492 m · dificultate „ușor”',
    tips: ['Telefonul stă în pungă zip între cadre; după fiecare cadru ștergi obiectivul cu laveta.', 'Câinii de la stâne: ocolește-le larg, bețele ajută.', 'GPX-ul etapei offline: semnalul poate fi slab în pădure.'],
    ...RICHIS, approx: true, radius: 600 },
  { id: 'mon-lunch', meal: 'lunch', minStay: 30, day: 'mon', time: '12:30 – 13:00', zone: 'biertan', cat: 'food', catLabel: 'Prânz la pachet · Richiș',
    title: 'Prânz la pachet în Richiș', short: 'Ștampila de la Richiș · ceai din termos',
    desc: 'Pauză în Richiș: ceai din termos, mâncarea din rucsac, ștampila de la Richiș. Biserica fortificată din sat e un cadru bun pe ploaie.',
    address: 'Richiș, Sibiu', placeQuery: 'Biserica fortificată Richiș',
    ...RICHIS, approx: true, radius: 400 },
  { id: 'mon-leg2', minStay: 75, day: 'mon', time: '13:00 – 14:15', zone: 'nemsa', cat: 'fun', catLabel: 'VT 33 · km 11,3 → 14,9',
    site: 'https://www.viatransilvanica.com/ro/tinuturi/terra-saxonum/biertan-nemsa',
    title: 'Richiș → Nemșa', short: 'Ultimii ~3,6 km · ștampila de la Nemșa',
    desc: 'Asfalt la intrarea în Richiș, apoi ultimii ~3,6 km până în Nemșa. Ștampila de final a etapei e la Nemșa. Apusul e la 16:44, întunericul la 17:17.',
    address: 'Nemșa, Sibiu', placeQuery: 'Nemșa, Sibiu',
    ...NEMSA, approx: true, radius: 500 },
  { id: 'mon-film', minStay: 15, day: 'mon', time: '14:15 – 14:30', zone: 'nemsa', cat: 'sweet', catLabel: 'Filmare pe ploaie',
    title: 'Ce iese din ziua de ploaie', short: 'Marcaje · noroi · biserici prin ceață',
    desc: 'Verifici ce ai filmat: marcajul VT, bocancii în noroi, picăturile pe geacă, bisericile fortificate prin ceață. Pui telefonul la încărcat cât te usuci.',
    address: 'Nemșa, Sibiu', placeQuery: 'Nemșa, Sibiu',
    ...NEMSA, approx: true },
  { id: 'mon-sleep', meal: 'dinner', minStay: 120, day: 'mon', time: '18:00 – 20:00', zone: 'nemsa', cat: 'food', catLabel: 'Cina · cazare',
    title: 'Familia Muntean, Nemșa', short: '5 locuri · masă inclusă · ștampilă',
    desc: 'Cazare cu masă inclusă și punct de ștampilă. Rogi gazdele de apă fiartă pentru AeroPress și umpli termosul pentru marți. Hainele ude pe calorifer, bocancii cu ziar înăuntru.',
    address: 'Nemșa, Sibiu', placeQuery: 'Nemșa, Sibiu', price: 'Preț neconfirmat',
    book: { need: 'obligatoriu', tel: '+40757056113', label: 'Cazare Nemșa · Familia Muntean', note: 'Luni 23 nov, o noapte, cu masă. Al doilea număr: 0771 140 255.' },
    verify: true, ...NEMSA, approx: true },

  // MARȚI 24 · VT etapa 34
  { id: 'tue-aeropress', minStay: 20, day: 'tue', time: '07:00 – 07:20', zone: 'nemsa', cat: 'coffee', catLabel: 'Cafeaua zilei · AeroPress',
    title: 'AeroPress la Nemșa, termosul plin', short: 'Pe ger: apă fierbinte pentru toată ziua',
    desc: 'Cafeaua de dimineață și termosul plin cu apă fierbinte sau ceai. Afară e −1°, se simte −6°.',
    address: 'Nemșa, Sibiu', placeQuery: 'Nemșa, Sibiu',
    ...NEMSA, approx: true },
  { id: 'tue-leg1', minStay: 90, day: 'tue', time: '07:30 – 09:00', zone: 'nemsa', cat: 'fun', catLabel: 'VT 34 · km 0 → 5,3',
    img: { q: 'Moșna fortified church' }, site: 'https://www.viatransilvanica.com/ro/tinuturi/terra-saxonum/nemsa-medias',
    title: 'Nemșa → Moșna', short: '5,3 km · ultimul magazin · ștampilă',
    desc: 'Pleci odată cu răsăritul (7:36). În Moșna sunt ultimele magazine și o ștampilă. Cumperi aici tot ce-ți trebuie până la Mediaș.',
    address: 'Moșna, Sibiu', placeQuery: 'Biserica fortificată Moșna', hours: 'Etapa 34 întreagă: 19,8 km · +491 m · dificultate „ușor”',
    ...MOSNA, approx: true, radius: 600 },
  { id: 'tue-leg2', minStay: 300, day: 'tue', time: '09:15 – 14:15', zone: 'medias', cat: 'fun', catLabel: 'VT 34 · km 5,3 → 19,8',
    rec: 'bruma pe iarbă, respirația, soarele jos printre copaci',
    site: 'https://www.viatransilvanica.com/ro/tinuturi/terra-saxonum/nemsa-medias',
    title: 'Moșna → Mediaș prin pădure', short: '~14,5 km fără sat · polei posibil la coborâre',
    desc: '~14,5 km de pădure și drum de pământ, fără sat pe drum, apoi asfalt la intrarea în Mediaș, unde poate fi polei la coborâre. Pământul înghețat ține mai bine decât noroiul de luni. Oficial, toată etapa are 5h; un jurnal de toamnă dă 7h15. Pe frig, Pixelul stă în buzunarul de la piept.',
    address: 'Mediaș, Sibiu', placeQuery: 'Mediaș, Sibiu',
    ...MEDIAS, approx: true, radius: 900 },
  { id: 'tue-friends', minStay: 60, day: 'tue', time: '14:30 – 15:30', zone: 'medias', cat: 'coffee', catLabel: 'Recompensa · ultima ștampilă',
    rec: 'un filtru de specialitate după 20 km',
    title: 'Friends Fine Wine & Specialty Coffee', short: 'Cafea de specialitate · punct de ștampilă VT',
    desc: 'Cafenea de specialitate în Mediaș, trecută pe harta Via Transilvanica ca punct de ștampilă. Ultima ștampilă a drumului și prima cafea care nu e din AeroPress.',
    address: 'Mediaș, Sibiu', placeQuery: 'Friends Fine Wine & Specialty Coffee Mediaș', hours: 'Program neconfirmat: suni înainte',
    book: { need: 'verificare', tel: '+40770478402', label: 'Friends, Mediaș', note: 'Întrebi dacă e deschis marți după-amiază.' },
    verify: true, ...MEDIAS, approx: true },
  { id: 'tue-lunch', meal: 'lunch', minStay: 45, day: 'tue', time: '15:30 – 16:15', zone: 'medias', cat: 'food', catLabel: 'Masa de după drum',
    title: 'O masă caldă în Mediaș', short: 'Înainte de tren',
    desc: 'O masă caldă în centrul Mediașului, apoi spre gară. Pentru seară îți iei ceva de mâncare pentru tren.',
    address: 'Mediaș, Sibiu', placeQuery: 'Mediaș, Sibiu',
    ...MEDIAS, approx: true },
  { id: 'tue-train', fixed: true, icon: 'train', minStay: 448, day: 'tue', time: '16:45 – 00:13', zone: 'medias', cat: 'shop', catLabel: 'Spre casă',
    arrive: { title: 'București Nord', placeQuery: 'Gara de Nord București', lat: 44.4466, lng: 26.0745 },
    title: 'Mediaș → București Nord · IR 16534', short: '16:45 → 00:13 · sau IR 16023, 14:19 → 21:11',
    desc: 'IR 16534: Mediaș 16:45 → București Nord 00:13. Dacă ajungi mai devreme: IR 16023, 14:19 → 21:11, sau IR 1734, 13:14 → 20:34. Gara e chiar la capătul etapei. În tren: marchezi favoritele pentru ep02, notezi tema și frazele de pe carduri.',
    address: 'Gara Mediaș', placeQuery: 'Gara Mediaș', hours: 'IR 13:14 · 14:19 · 16:45', price: 'Bilet din aplicația CFR Călători',
    site: 'https://mersultrenurilor.infofer.ro',
    tips: ['Orarele sunt din mersul oficial 2025–2026: verifică-le pe mersultrenurilor.infofer.ro.'],
    ...MEDIAS_GARA, radius: 300 },
];

// Alternative pe zone. Cazările și ștampilele sunt de pe harta oficială Via Transilvanica.
export const ALTERNATIVES = [
  { zone: 'porumbacu', cat: 'shop', title: 'Gara Porumbacu (Porumbacu de Jos)', address: 'Str. Gării, Porumbacu de Jos', placeQuery: 'Gara Porumbacu', hours: 'Duminică spre Sibiu: 12:53 · 17:19 · 22:27', price: 'Bilet CFR', note: 'La ~6,7 km cu mașina de Porumbacu de Sus. Legături spre Mediaș din Sibiu: 15:15, 17:40, 19:10, 19:38.', ...POR_GARA, approx: true },
  { zone: 'transfer', cat: 'shop', title: 'Gara Sibiu', address: 'Piața 1 Decembrie 1918, Sibiu', placeQuery: 'Gara Sibiu', hours: 'Duminică spre Mediaș: 15:15 · 17:40 · 19:10 · 19:38 · 20:58', price: 'Bilet CFR / Interregional', note: 'Dacă te lasă cineva în Sibiu: trenul de 15:15 ajunge în Mediaș la 16:35. Autobuze Sibiu → Mediaș: 6 pe zi, ultima la 18:30 (zilele de circulație neconfirmate).', ...SIBIU_GARA, approx: true },
  { zone: 'biertan', cat: 'art', title: 'Biserica fortificată Biertan', address: 'Biertan, Sibiu', placeQuery: 'Biserica fortificată Biertan', hours: 'Program de iarnă: de verificat', price: 'Bilet la intrare', note: 'Monument UNESCO și startul etapei 33. Un cadru cu ea în ceață deschide partea a doua a episodului.', ...BIERTAN, approx: true, verify: true },
  { zone: 'biertan', cat: 'shop', title: 'Pensiunea Unglerus', address: 'Biertan, Sibiu', placeQuery: 'Pensiunea Unglerus Biertan', hours: 'Sunați: 0750 722 285', price: 'Preț neconfirmat', note: 'Cazare în Biertan, recomandată pe harta VT.', ...BIERTAN, approx: true, verify: true },
  { zone: 'biertan', cat: 'shop', title: 'Casa Ana (Biertan)', address: 'Biertan, Sibiu', placeQuery: 'Casa Ana Biertan', hours: 'Sunați: 0787 876 009', price: 'Preț neconfirmat', note: 'Cazare în Biertan, recomandată pe harta VT.', ...BIERTAN, approx: true, verify: true },
  { zone: 'biertan', cat: 'shop', title: 'Pensiunea Oppidium / Casa Eva Wagner', address: 'Biertan, Sibiu', placeQuery: 'Pensiunea Oppidium Biertan', hours: 'Sunați: 0740 679 119', price: 'Preț neconfirmat', note: 'Același număr pentru ambele. Ambele au punct de ștampilă.', ...BIERTAN, approx: true, verify: true },
  { zone: 'biertan', cat: 'shop', title: 'Taxi Cornel Irimie (Biertan ↔ Mediaș)', address: 'Biertan, Sibiu', placeQuery: 'Biertan, Sibiu', hours: 'Sunați: 0740 585 568', price: 'Tarif neconfirmat', note: 'O singură mașină, ~30 min între Mediaș și Biertan. Rezervi cu o zi înainte. Face și transferuri din gara Sighișoara.', ...BIERTAN, approx: true, verify: true },
  { zone: 'nemsa', cat: 'shop', title: 'Bed and Wine (Nemșa)', address: 'Nemșa, Sibiu', placeQuery: 'Bed and Wine Nemșa', hours: 'Sunați: 0743 332 405', price: 'Preț neconfirmat', note: '6 locuri, masă la cerere, punct de ștampilă.', ...NEMSA, approx: true, verify: true },
  { zone: 'nemsa', cat: 'shop', title: 'Casa de oaspeți Liviana (Nemșa)', address: 'Nemșa, Sibiu', placeQuery: 'Nemșa, Sibiu', hours: 'Sunați: 0722 552 001', price: 'Preț neconfirmat', note: '3 locuri, punct de ștampilă.', ...NEMSA, approx: true, verify: true },
  { zone: 'nemsa', cat: 'shop', title: 'Casa Parohială Moșna', address: 'Moșna, Sibiu', placeQuery: 'Casa Parohială Moșna', hours: 'Sunați: 0749 680 770', price: 'Preț neconfirmat', note: '16 locuri, punct de ștampilă, magazine în apropiere. Variantă dacă Nemșa e plină: +5,3 km luni, −5,3 km marți.', ...MOSNA, approx: true, verify: true },
  { zone: 'nemsa', cat: 'shop', title: 'Casa de oaspeți „La Cetate” (Moșna)', address: 'Moșna, Sibiu', placeQuery: 'La Cetate Moșna', hours: 'Sunați: 0743 655 299', price: 'Preț neconfirmat', note: '8 locuri, masă la cerere, punct de ștampilă.', ...MOSNA, approx: true, verify: true },
  { zone: 'nemsa', cat: 'art', title: 'Biserica fortificată Moșna', address: 'Moșna, Sibiu', placeQuery: 'Biserica fortificată Moșna', hours: 'De verificat', price: '', note: 'Pe traseul etapei 34, la km 5,3. Un cadru pe ger, cu bruma pe acoperișuri.', ...MOSNA, approx: true, verify: true },
  { zone: 'medias', cat: 'shop', title: 'Mercure Mediaș Binderbubi', address: 'Mediaș, Sibiu', placeQuery: 'Mercure Mediaș Binderbubi', hours: 'Sunați: 0730 099 303', price: 'Reducere pentru drumeți VT', note: 'Punct de ștampilă. Varianta B de duminică seara.', ...MEDIAS, approx: true, verify: true },
  { zone: 'medias', cat: 'shop', title: 'Apartamente în Mediaș (Alexander, Central, Sophia’s)', address: 'Mediaș, Sibiu', placeQuery: 'Mediaș, Sibiu', hours: 'Sunați: 0740 331 033', price: 'Preț neconfirmat', note: 'Același număr pentru toate, toate cu ștampilă VT.', ...MEDIAS, approx: true, verify: true },
];

export const CURATED = {};

// Contacte și link-uri utile, sus în tab-ul „Contacte”. `tel` în format internațional, `show` = cum se afișează.
export const CONTACTS = [
  { group: 'Urgențe', icon: 'call', title: 'Urgențe', tel: '112', show: '112', note: 'Ambulanță, poliție, pompieri' },
  { group: 'Urgențe', icon: 'landscape', title: 'Salvamont', tel: '+40725826668', show: '0725 826 668', note: '0SALVAMONT, pe munte și pe trasee' },
  { group: 'Drum', icon: 'local_taxi', title: 'Taxi Biertan ↔ Mediaș', tel: '+40740585568', show: '0740 585 568', note: 'Cornel Irimie · o singură mașină · rezervi cu o zi înainte' },
  { group: 'Cazare', icon: 'hotel', title: 'Familia Muntean, Nemșa', tel: '+40757056113', show: '0757 056 113', note: 'Luni seara · masă inclusă · al doilea nr. 0771 140 255' },
  { group: 'Cazare', icon: 'hotel', title: 'Bed and Wine, Nemșa', tel: '+40743332405', show: '0743 332 405', note: 'Alternativă în Nemșa · masă la cerere' },
  { group: 'Cazare', icon: 'hotel', title: 'Pensiunea Unglerus, Biertan', tel: '+40750722285', show: '0750 722 285', note: 'Duminică seara (varianta A)' },
  { group: 'Cazare', icon: 'hotel', title: 'Casa Ana, Biertan', tel: '+40787876009', show: '0787 876 009', note: 'Alternativă în Biertan' },
  { group: 'Cazare', icon: 'hotel', title: 'Mercure Mediaș', tel: '+40730099303', show: '0730 099 303', note: 'Duminică seara (varianta B) · reducere drumeți' },
  { group: 'Cazare', icon: 'hotel', title: 'Casa Parohială Moșna', tel: '+40749680770', show: '0749 680 770', note: 'Dacă Nemșa e plină · 16 locuri' },
  { group: 'Cafea', icon: 'local_cafe', title: 'Friends Fine Wine & Specialty Coffee', tel: '+40770478402', show: '0770 478 402', note: 'Mediaș · ultima ștampilă · program neconfirmat' },
  { group: 'Link-uri', icon: 'route', title: 'GPX etapa 33 · Biertan – Nemșa', link: 'https://www.viatransilvanica.com/ro/tinuturi/terra-saxonum/biertan-nemsa', note: '14,9 km · +492 m' },
  { group: 'Link-uri', icon: 'route', title: 'GPX etapa 34 · Nemșa – Mediaș', link: 'https://www.viatransilvanica.com/ro/tinuturi/terra-saxonum/nemsa-medias', note: '19,8 km · +491 m' },
  { group: 'Link-uri', icon: 'train', title: 'Mersul trenurilor (CFR)', link: 'https://mersultrenurilor.infofer.ro', note: 'Porumbacu · Sibiu · Mediaș · București' },
  { group: 'Link-uri', icon: 'photo_camera', title: 'Ghidul de filmare · Meanwhile at Teaching Forward', link: 'https://claude.ai/artifact/556Csu2RQjRhGKpScnzPfz', note: 'Setări, shot list, trimiterea fișierelor' },
  { group: 'Link-uri', icon: 'partly_cloudy_day', title: 'Prognoza: meteoblue Sibiu', link: 'https://www.meteoblue.com/en/romania/weather-sibiu', note: 'Verifici duminică seara pentru luni și marți' },
];

// Shot list ep02 (în structura de bucketlist): o singură listă, a lui Daniel.
export const PEOPLE_META = {
  daniel: { name: 'Daniel', tag: 'LIFT, filmare, AeroPress', color: 'p-daniel', counter: { key: 'coffee', label: 'AeroPress pe drum', icon: 'coffee', goal: 10, unit: 'AeroPress' } },
};
export const BUCKET_DEFAULTS = {
  daniel: [
    { text: 'Drumul: parbrizul, ștergătoarele, Făgărașul în nori', loc: 'fri-road' },
    { text: 'Plăcuța satului Porumbacu de Sus (2 s)', loc: 'fri-road' },
    { text: 'Primul cadru: „Teaching Forward · LIFT — Porumbacu, 20–22 nov” scris în carnet', loc: 'fri-first' },
    { text: 'Acordul Alinei Marian pentru filmare, confirmat', loc: 'fri-agenda' },
    { text: 'Agenda „Facilitate with impact”, fix și lizibil (titlul „02 · Facilitare”)', loc: 'fri-agenda' },
    { text: 'Primul cerc, cadru larg', loc: 'fri-agenda' },
    { text: 'Alina Marian: mâna care scrie + cadru larg cu grupul (după acord)', loc: 'fri-sessions' },
    { text: 'Seara: lămpi, mâini pe căni, discuții din spate', loc: 'fri-evening' },
    { text: '30 s de liniște în sală (room tone), pentru montaj', loc: 'fri-evening' },
    { text: 'AeroPress cu Făgărașul în spate: turnarea la 60 fps', loc: 'sat-aeropress' },
    { text: 'Cana cu munții, 2 s', loc: 'sat-aeropress' },
    { text: 'Exercițiile în perechi, de la distanță, zoom 5×', loc: 'sat-morning' },
    { text: '5–6 snap-uri de notițe: carnet, post-it, flipchart', loc: 'sat-notes' },
    { text: 'Zenit: 2–3 facilitatori la geam', loc: 'sat-zenit' },
    { text: 'Zenit: natură moartă cu notițe și cafea', loc: 'sat-zenit' },
    { text: 'Apusul cu grupul și munții (16:00 – 16:46)', loc: 'sat-sunset' },
    { text: 'Cardurile cu o frază: mâna care scrie + cardul terminat', loc: 'sun-cards' },
    { text: 'Cercul de închidere, filmat larg', loc: 'sun-circle' },
    { text: 'Portretul de grup pe Zenit', loc: 'sun-portrait' },
    { text: 'Ultimul cadru: rucsacul în spate, poarta, drumul', loc: 'sun-last' },
    { text: '2–3 cadre cu tine, filmate de Magda sau de colegi', loc: 'fri-crew' },
    { text: 'VT: biserica din Biertan în ceață', loc: 'mon-start' },
    { text: 'VT: marcajul pe un stâlp, bocancii în noroi', loc: 'mon-leg1' },
    { text: 'VT: bruma, respirația, soarele jos printre copaci', loc: 'tue-leg2' },
    { text: 'Ștampilele VT: Biertan, Richiș, Nemșa, Moșna, Mediaș', loc: 'mon-start' },
    { text: 'Filtru de specialitate la Friends, în Mediaș', loc: 'tue-friends' },
  ],
};
export const COFFEE_TYPES = [
  { key: 'aeropress', label: 'AeroPress', icon: 'coffee', shots: 1 },
  { key: 'aeropress2', label: 'AeroPress dublu', icon: 'coffee', shots: 2 },
  { key: 'termos', label: 'Din termos', icon: 'local_cafe', shots: 1 },
  { key: 'filtru', label: 'Filtru / V60', icon: 'local_cafe', shots: 1 },
  { key: 'espresso', label: 'Espresso', icon: 'coffee', shots: 1 },
];

// Oportunitățile zilei
export const DAY_OPPS = {
  fri: [
    { title: 'Titlul de lucru: „02 · Facilitare”', when: 'Workshop „Facilitate with impact” cu Alina Marian · confirmi din agendă', price: '', link: 'https://claude.ai/artifact/556Csu2RQjRhGKpScnzPfz', locId: 'fri-agenda', kind: 'tip' },
    { title: 'Rezervi azi cazarea din Nemșa și taxiul', when: 'O singură mașină de taxi la Biertan', price: '', link: 'https://www.viatransilvanica.com/ro/tinuturi/terra-saxonum/biertan-nemsa', locId: 'fri-lunch', kind: 'tip' },
  ],
  sat: [
    { title: 'Singura zi uscată și blândă: exteriorul se filmează azi', when: 'AeroPress 7:30 – 8:30 · lumina de aur 16:00 – 16:46', price: 'Gratis', link: 'https://open-meteo.com', locId: 'sat-aeropress', kind: 'gratis' },
    { title: 'Zenit la geam, după prânz', when: 'Lumina laterală de la 13:30 la 14:30', price: '', link: 'https://claude.ai/artifact/556Csu2RQjRhGKpScnzPfz', locId: 'sat-zenit', kind: 'tip' },
  ],
  sun: [
    { title: 'Cu mașina, ajungi în Biertan pe lumină', when: '70 km · ~1h25 · apus 16:45', price: '', link: 'https://www.viatransilvanica.com/ro/tinuturi/terra-saxonum/biertan-nemsa', locId: 'sun-car', kind: 'tip' },
    { title: 'Trenul de 17:19 e singurul de după-amiază', when: 'Porumbacu 17:19 → Sibiu 18:38 → Mediaș 20:28', price: 'Bilet CFR', link: 'https://mersultrenurilor.infofer.ro', locId: 'sun-train', kind: 'tip' },
  ],
  mon: [
    { title: 'Trei ștampile VT într-o zi', when: 'Biertan · Richiș · Nemșa', price: 'Gratis', link: 'https://www.viatransilvanica.com/ro/tinuturi/terra-saxonum/biertan-nemsa', locId: 'mon-start', kind: 'gratis' },
    { title: 'Biserica fortificată Biertan, monument UNESCO', when: 'La start, dimineața, prin ceață', price: '', link: 'https://www.viatransilvanica.com/ro/tinuturi/terra-saxonum/biertan-nemsa', locId: 'mon-start', kind: 'tip' },
  ],
  tue: [
    { title: 'Cafea de specialitate la final: Friends, Mediaș', when: 'Ultima ștampilă VT · program neconfirmat', price: '', link: 'https://www.viatransilvanica.com/ro/tinuturi/terra-saxonum/nemsa-medias', locId: 'tue-friends', kind: 'tip' },
    { title: 'Gara e chiar la capătul etapei', when: 'IR 14:19 sau 16:45 spre București Nord', price: 'Bilet CFR', link: 'https://mersultrenurilor.infofer.ro', locId: 'tue-train', kind: 'tip' },
  ],
};

// Utile pe drum: urgențe, gări, taxi. Doar ce e verificat.
export const NEAR_HOME = [
  { group: 'Urgențe', icon: 'call', color: 'var(--red)', title: 'Urgențe: 112', note: 'Ambulanță, poliție, pompieri. Apăsați ca să sunați.', tel: '112' },
  { group: 'Urgențe', icon: 'landscape', color: 'var(--red)', title: 'Salvamont: 0725 826 668', note: '0SALVAMONT, pentru accidente pe munte și pe trasee.', tel: '0725826668' },
  { group: 'Transport', icon: 'train', color: 'var(--blue)', title: 'Gara Porumbacu', address: 'Str. Gării, Porumbacu de Jos', hours: 'Duminică spre Sibiu: 12:53 · 17:19 · 22:27', q: 'Gara Porumbacu', ...POR_GARA },
  { group: 'Transport', icon: 'train', color: 'var(--blue)', title: 'Gara Sibiu', address: 'Piața 1 Decembrie 1918, Sibiu', hours: 'Spre Mediaș duminică: 15:15 · 17:40 · 19:10 · 19:38 · 20:58', q: 'Gara Sibiu', ...SIBIU_GARA },
  { group: 'Transport', icon: 'train', color: 'var(--blue)', title: 'Gara Mediaș', address: 'Strada Unirii, Mediaș', hours: 'Spre București Nord: IR 13:14 · 14:19 · 16:45', q: 'Gara Mediaș', ...MEDIAS_GARA },
  { group: 'Transport', icon: 'local_taxi', color: 'var(--text-2)', title: 'Taxi Biertan ↔ Mediaș: 0740 585 568', note: 'Cornel Irimie, o singură mașină: rezervi cu o zi înainte.', tel: '+40740585568' },
  { group: 'Pe traseu', icon: 'route', color: 'var(--green)', title: 'Etapa 33 · Biertan – Nemșa (GPX)', note: '14,9 km · +492 m · 4h30 oficial.', q: 'Biertan, Sibiu', link: 'https://www.viatransilvanica.com/ro/tinuturi/terra-saxonum/biertan-nemsa' },
  { group: 'Pe traseu', icon: 'route', color: 'var(--green)', title: 'Etapa 34 · Nemșa – Mediaș (GPX)', note: '19,8 km · +491 m · 5h oficial.', q: 'Nemșa, Sibiu', link: 'https://www.viatransilvanica.com/ro/tinuturi/terra-saxonum/nemsa-medias' },
];

export const PACK_DEFAULTS = [
  { cat: 'Haine în straturi', icon: 'checkroom', items: ['2 tricouri tehnice sau merinos (fără bumbac pe traseu)', 'Polar sau bluză de lână', 'Geacă puf sau sintetică ușoară', 'Geacă de ploaie cu glugă + pantaloni de ploaie', 'Pantaloni de drum + colanți termo pentru marți', 'Căciulă, buff, mănuși subțiri pentru ecran + mănuși groase', '3 perechi de șosete de lână (una mereu uscată)', 'Haine curate pentru curs, lenjerie pe 4–5 zile'] },
  { cat: 'Încălțăminte', icon: 'directions_walk', items: ['Bocanci impermeabili, deja purtați', 'Papuci ușori pentru sală și cazare', 'Parazăpezi scurți (opțional, pentru noroi)'] },
  { cat: 'Echipament de drum', icon: 'route', items: ['Rucsac 30–40 L + husă de ploaie', 'Sac impermeabil pentru haine și electronice', 'Frontală + baterii', 'Bețe de trekking', 'GPX-ul etapelor 33 și 34, offline', 'Pungi de gunoi, șervețele umede'] },
  { cat: 'Hrană & apă', icon: 'water_drop', items: ['Termos 0,5–0,75 L', 'Sticlă de 1 L', 'Gustări pe 2 zile: nuci, ciocolată, batoane, brânză, pâine', 'AeroPress Go + cafea măcinată + filtre'] },
  { cat: 'Siguranță & prim ajutor', icon: 'local_pharmacy', items: ['Plasturi pentru bășici, pansamente, bandă', 'Ibuprofen sau paracetamol, medicamentele tale, dezinfectant', 'Folie de supraviețuire, fluier'] },
  { cat: 'Acte & bani', icon: 'badge', items: ['Buletin, card de sănătate, card bancar', 'Cash pentru pensiuni și magazine', 'Pașaportul Via Transilvanica (opțional)'] },
  { cat: 'Filmare', icon: 'photo_camera', items: ['Power bank 10.000–20.000 mAh', 'Încărcător USB-C + 2 cabluri', 'Spațiu liber pe Pixel sau stick / SSD USB-C', 'Mini-trepied cu clemă de telefon', 'Microfon lavalieră cu protecție de vânt', 'Zenit: 2–3 role ISO 400', 'Zenit: baterie de rezervă pentru exponometru', 'Carnet + pix (creion pe ploaie) + 5–6 carduri și un marker', 'Lavetă pentru obiectiv + pungă zip pentru telefon'] },
];

export const PHRASES = [];

// Răsărit / lumină de aur (soarele sub 6°) / apus / întuneric (sfârșitul crepusculului civil), ora României,
// calculat astronomic. Temperaturile: prognoza Open-Meteo din 19 nov (Porumbacu Vin–Dum, Mediaș Lun–Mar).
export const SUN = {
  fri: { rise: '7:29', gold: '16:01', set: '16:47', dusk: '17:20', temp: '12°/5°', place: 'Porumbacu' },
  sat: { rise: '7:30', gold: '16:00', set: '16:46', dusk: '17:19', temp: '13°/4°', place: 'Porumbacu' },
  sun: { rise: '7:31', gold: '15:59', set: '16:45', dusk: '17:18', temp: '10°/2°', place: 'Porumbacu' },
  mon: { rise: '7:34', gold: '15:56', set: '16:44', dusk: '17:17', temp: '5°/0°', place: 'Biertan – Nemșa' },
  tue: { rise: '7:36', gold: '15:56', set: '16:43', dusk: '17:16', temp: '1°/−1°', place: 'Nemșa – Mediaș' },
};
export const WEATHER_NOTE = 'Final de noiembrie în Transilvania: weekendul blând (până la 13°), apoi un front rece. Luni plouă toată ziua (12–15 mm, vânt), marți îngheață (−1…+1°, se simte −6°). Zile scurte: apus pe la 16:45, întuneric pe la 17:17.';

// Fără variante de masă votate: programul are o singură masă pe slot.
export const MEAL_SLOTS = {};

// Fără poze alese manual: aplicația caută automat pe Wikimedia Commons după `img.q`, coordonate și nume.
export const PHOTOS = {};

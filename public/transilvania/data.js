// Programul: LIFT la Porumbacu de Sus (20–22 nov 2026) + Via Transilvanica, etapele 33–34 (23–24 nov).
// Surse: harta oficială Via Transilvanica (etape, km, diferență de nivel, cazări, ștampile), mersul oficial al
// trenurilor 2025–2026 (data.gov.ro, CFR Călători și Interregional), prognoza Open-Meteo citită pe 19 nov 2026,
// ore de lumină calculate astronomic (NOAA) pentru Porumbacu și traseu. `verify: true` = de confirmat la telefon.
// Coordonatele `approx: true` sunt la nivel de sat; „Fixează aici” le corectează.

export const TRIP = {
  id: 'transilvania-aventura',
  start: '2026-11-20',
  end: '2026-11-24',
  startAt: '2026-11-20T05:00:00+02:00',
  endAt: '2026-11-24T16:45:00+02:00',
  days: { fri: '2026-11-20', sat: '2026-11-21', sun: '2026-11-22', mon: '2026-11-23', tue: '2026-11-24' },
  walkDays: ['mon', 'tue'],
  base: {
    title: 'Porumbacu de Sus · LIFT', address: 'Porumbacu de Sus, Sibiu', placeQuery: 'Porumbacu de Sus, Sibiu',
    lat: 45.7137, lng: 24.4734, approx: true,
    short: 'Locul cursului LIFT', arrive: 'Vineri 20 nov, pentru weekendul de curs',
    note: 'Adresa exactă a locației o afli de la organizatori. Duminică dormi în Biertan, luni în Richiș.',
  },
};

const POR = { lat: 45.7137, lng: 24.4734 };          // Porumbacu de Sus
const POR_GARA = { lat: 45.7584, lng: 24.4563 };     // gara Porumbacu, în Porumbacu de Jos (Str. Gării)
const SIBIU_GARA = { lat: 45.8027, lng: 24.1590 };
const BIERTAN = { lat: 46.1363, lng: 24.5210 };
const RICHIS = { lat: 46.0979, lng: 24.4818 };
const NEMSA = { lat: 46.0860, lng: 24.4445 };
const RICHIS_NOAH = { lat: 46.094272, lng: 24.474033 };
const BIERTAN_UNGLERUS = { lat: 46.135592, lng: 24.521068 };
const RUINARIUM = { lat: 46.137685, lng: 24.521274 };
const MOSNA_LAURA = { lat: 46.084333, lng: 24.403141 };
const FRIENDS = { lat: 46.16613, lng: 24.350817 };
const MOSNA = { lat: 46.0924, lng: 24.3957 };
const MEDIAS = { lat: 46.1625, lng: 24.3474 };
const MEDIAS_GARA = { lat: 46.1605, lng: 24.3492 };

export const ZONES = {
  porumbacu: { label: 'Porumbacu & Făgăraș', icon: 'landscape' },
  transfer:  { label: 'Sibiu & drumul spre Târnave', icon: 'train' },
  biertan:   { label: 'Biertan', icon: 'church' },
  richis:    { label: 'Richiș', icon: 'park' },
  nemsa:     { label: 'Nemșa & Moșna', icon: 'park' },
  medias:    { label: 'Mediaș', icon: 'castle' },
};

export const DAY_ZONES = {
  fri: ['porumbacu'], sat: ['porumbacu'], sun: ['porumbacu', 'transfer', 'biertan'],
  mon: ['biertan', 'richis'], tue: ['richis', 'nemsa', 'medias'],
};

// Numele zilelor, după specific
export const DAY_THEMES = {
  fri: { name: 'Sosirea la poalele Făgărașului', short: 'Sosire', icon: 'landscape', color: '#5353E9', sub: 'Trezire 5:00, AeroPress de drum · plecare 5:30 de la Liceul Iulia Hasdeu · workshop „Facilitate with impact” cu Alina Marian · „Teaching Forward · LIFT” în carnet · agenda · primul cerc · seara cu lămpi' },
  sat: { name: 'Ziua cu lumina bună', short: 'Lumină', icon: 'photo_camera', color: '#D93025', sub: 'AeroPress cu Făgărașul · sesiuni și facilitatori · snap-uri de notițe · Zenit la geam · apus 16:46' },
  sun: { name: 'Cercul de final & drumul spre Biertan', short: 'Final', icon: 'route', color: '#E8710A', sub: 'Cardurile cu o frază · ultimul cerc · portretul de grup pe Zenit · spre Biertan: toate variantele, pe ore · noaptea în Biertan' },
  mon: { name: 'Biertan, apoi pe jos până la Richiș', short: 'Richiș', icon: 'rainy', color: '#EF7D00', sub: 'Dimineața în Biertan · la prânz pe Via Transilvanica · 11,3 km până la Richiș · ploaie, noroi · noaptea în Richiș' },
  tue: { name: 'Richiș → Nemșa → Moșna → Mediaș', short: 'Mediaș', icon: 'weather_snowy', color: '#1A73E8', sub: '23,4 km pe Via Transilvanica · ger · ștampile la Nemșa, Moșna, Mediaș · cafea la Friends · trenul de 16:45' },
};

export const DAY_TIPS = {
  fri: 'Trezirea la 5:00, AeroPress-ul de drum în termos, plecare la 5:10. La 5:30 te întâlnești cu colega la Liceul Iulia Hasdeu și mergeți cu mașina ei la Porumbacu. Vreme: 6…13°, ploaie slabă. Dimineața e cod portocaliu de vânt în zona joasă a județului Sibiu (01:00–10:00, rafale 70–90 km/h), apoi cod galben până la 16:00. Apus la 16:47. Tema weekendului: workshopul „Facilitate with impact”, cu Alina Marian. Titlul de lucru al reel-ului: „02 · Facilitare” (îl confirmi din agendă). Alina e facilitatoare nouă în serie: îi ceri acordul pentru filmare înainte de primul cadru cu fața ei. Primul cadru al episodului e „Teaching Forward · LIFT — Porumbacu, 20–22 nov” scris în carnet. În pauza de prânz suni pentru cazare în Biertan (duminică) și Richiș (luni). Dacă pleci duminică cu trenul, rezervi și taxiul Mediaș → Biertan: are o singură mașină.',
  sat: 'Vreme: 6…14°, averse slabe, vânt slab, apus la 16:46. Singura zi bună de exterior: AeroPress-ul dimineața între 7:30 și 8:30, lumina de aur de la 16:00. Seara descarci clipurile și pregătești 5–6 carduri pentru duminică.',
  sun: 'Vreme: 1…9°, uscat, se simte −3°. Nu știi când se termină cursul, așa că ai toate variantele spre Biertan pe ore în cardul „Porumbacu → Biertan” și în Contacte. Pe scurt: cel mai simplu e un lift cu mașina, direct (~70 km, ~1h25) sau până în Sibiu. Cu trenul, din Porumbacu pleacă spre Sibiu la 12:53, 17:19 și 22:27. Stația cea mai apropiată de Biertan e Mediaș (24 km, taxi ~30 min). Ultima variantă în aceeași seară: 17:19 → Mediaș 20:28 → taxi. Dacă o pierzi: 22:27 până în Sibiu, dormi acolo, luni 7:15 → Mediaș 8:46 → taxi, și tot pleci pe jos la prânz.',
  mon: 'Vreme: 0…5°, ploaie 13–14 mm (lapoviță spre munte), rafale ~55–57 km/h după model, apus la 16:44, întuneric la 17:17. Dacă se dă cod de vânt sau rafalele trec de ~60 km/h: planul B din avertizare (pe asfalt, fără pădure). Dimineața e în Biertan (cetatea, ștampila, Ruinarium Café, magazinul Adi Impex). Pleci pe jos la 12:00: 11,3 km până la Richiș, pe drum de pământ, prin pădure și vie, fără magazin și fără izvor pe hartă. Apa o iei din Biertan. Ajungi pe la 15:45, înainte de apus. Dacă ajungi devreme și ai chef, Nemșa e la încă 3,6 km (~1 h). Pe ploaie torențială există și scurtătura pe asfalt, DJ141B: 5,7 km, ~1h15 (Google Maps), fără marcaje VT.',
  tue: 'Vreme: −2…+1°, se simte −5°, averse de ninsoare (1–2,5 cm), rafale ~40–48 km/h. Ziua lungă: 23,4 km din Richiș până în Mediaș (3,6 până la Nemșa, încă 5,3 până la Moșna, apoi ~14,5 km de pădure fără nimic). Pleci la 7:30, odată cu răsăritul. În Moșna cumperi tot ce-ți trebuie. Poate fi polei la coborârea asfaltată spre Mediaș. Trenul spre București e la 16:45; dacă întârzii, IR 23:42 (sosire 6:50) sau o noapte în Mediaș.',
};

export const PRE_DEPART = {};

export const ITINERARY = [
  // VINERI 20 · Sosirea
  { id: 'fri-wake', minStay: 10, day: 'fri', time: '05:00 – 05:10', zone: 'porumbacu', cat: 'coffee', catLabel: 'Cafeaua de drum · AeroPress',
    title: 'Trezirea și AeroPress-ul de drum', short: '5:00 · cafeaua în termos, plecare la 5:10',
    desc: 'Te trezești la 5:00 și faci AeroPress-ul de drum direct în termos. Ca să-ți ajungă 10 minute: de seara pui cafeaua măcinată în AeroPress, cana-termos lângă fierbător și rucsacul la ușă.',
    address: 'Acasă, București', placeQuery: 'Colegiul Național Iulia Hasdeu București',
    tips: ['De seara: apa în fierbător, cafeaua măcinată și filtrul în AeroPress, termosul alături.', 'Pleci la 5:10: până la liceu sunt 19 minute.'] },
  { id: 'fri-depart', fixed: true, icon: 'directions_car', minStay: 15, day: 'fri', time: '05:30 – 05:45', zone: 'porumbacu', cat: 'shop', catLabel: 'Plecarea',
    legIn: { min: 19, mode: 'driving', icon: 'directions_car', label: '19 minute de acasă până la liceu' },
    title: 'Plecare de la Liceul Iulia Hasdeu, cu colega', short: '5:30 · cu mașina până la Porumbacu',
    desc: 'La 5:30 te întâlnești cu colega ta la Liceul (Colegiul Național) Iulia Hasdeu din București și mergeți cu mașina ei până la Porumbacu de Sus. Vineri dimineață e cod portocaliu de vânt în zona joasă a județului Sibiu (01:00–10:00): înainte să plecați vă uitați la trafic (Waze, infotrafic).',
    address: 'Liceul Iulia Hasdeu, București', placeQuery: 'Colegiul Național Iulia Hasdeu București',
    tips: ['Telefonul și power bank-ul încărcate de seara.', 'Primele cadre ale episodului se filmează pe drum, după ce se luminează (răsărit 7:29).'] },
  { id: 'fri-road', icon: 'directions_car', minStay: 30, day: 'fri', time: '07:30 – 10:00', zone: 'porumbacu', cat: 'sweet', catLabel: 'B-roll · drumul',
    img: { q: 'Făgăraș Mountains' },
    title: 'Drumul spre munte', short: 'Parbrizul, ștergătoarele, Făgărașul în nori',
    desc: 'Primele cadre ale episodului: parbrizul cu ștergătoare, munții în nori, plăcuța satului, bagajele la sosire. Clipuri de 5–8 s, ținute fix, 4K 30 fps HLG, fără filtre, expunerea blocată. După răsărit (7:29), pe ultima parte a drumului. Ora sosirii e orientativă.',
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
    title: 'Prânzul și telefoanele pentru drum', short: 'Biertan (dum) · Richiș (lun) · taxi',
    desc: 'La prânz rezolvi nopțile de pe drum:\n1. Duminică seara în Biertan: Pensiunea Unglerus (sau Oppidium / Eva Wagner, Casa Ana, Pensiunea Cetate).\n2. Luni seara în Richiș: Casa Noah Experience (sau La Curtea Richvini).\n3. Întrebi la curs cine pleacă duminică cu mașina spre Sibiu, Mediaș sau Sighișoara. Dacă mergi cu trenul, rezervi taxiul Mediaș → Biertan.',
    address: 'Porumbacu de Sus, Sibiu', placeQuery: 'Porumbacu de Sus, Sibiu',
    book: { need: 'obligatoriu', tel: '+40770735165', label: 'Cazare Richiș · Casa Noah Experience', note: 'Luni 23 nov, o noapte, cu cină. Alternativă: La Curtea Richvini 0741 183 404.' },
    tips: ['Taxi Biertan ↔ Mediaș: Cornel Irimie, 0740 585 568. O singură mașină.', 'Nu e confirmat că pensiunile sunt deschise la final de noiembrie: suni, nu scrii.'],
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
    title: 'AeroPress și termosul pentru drum', short: 'A doua șansă pentru cadrul cu munții',
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
    title: 'Facilitate with impact · cercul de final', short: 'Cercul filmat larg · ora de final o afli din agendă',
    desc: 'Ultimele sesiuni și cercul de închidere, filmat larg. Cel mai probabil se termină pe la prânz, poate mai târziu: de ora asta depinde varianta spre Biertan.',
    address: 'Porumbacu de Sus, Sibiu', placeQuery: 'Porumbacu de Sus, Sibiu', verify: true,
    ...POR, approx: true },
  { id: 'sun-portrait', minStay: 15, day: 'sun', time: '12:00 – 12:15', zone: 'porumbacu', cat: 'sweet', catLabel: 'Zenit',
    title: 'Portretul de grup pe film', short: 'Afară sau lângă geam, cât e lumină',
    desc: 'Portretul de grup pe Zenit. Afară, dacă e uscat, altfel lângă geam. Două cadre, ca să ai unul bun. Tot acum întrebi cine pleacă cu mașina spre Sibiu, Mediaș sau Sighișoara.',
    address: 'Porumbacu de Sus, Sibiu', placeQuery: 'Porumbacu de Sus, Sibiu',
    ...POR, approx: true },
  { id: 'sun-lunch', meal: 'lunch', minStay: 45, day: 'sun', time: '12:15 – 13:00', zone: 'porumbacu', cat: 'food', catLabel: 'Prânz',
    title: 'Ultimul prânz cu grupul', short: 'Alegi varianta spre Biertan',
    desc: 'Ultimul prânz. Alegi varianta spre Biertan din cardul următor, după ora la care se termină cursul și după cine are loc în mașină.',
    address: 'Porumbacu de Sus, Sibiu', placeQuery: 'Porumbacu de Sus, Sibiu',
    ...POR, approx: true },
  { id: 'sun-last', minStay: 10, day: 'sun', time: '13:00 – 13:10', zone: 'porumbacu', cat: 'sweet', catLabel: 'Ultimul cadru',
    title: 'Rucsacul în spate, poarta, drumul', short: 'Puntea spre partea a doua',
    desc: 'Puntea spre partea a doua a călătoriei: rucsacul pus pe umăr, poarta, drumul care pleacă din sat.',
    address: 'Porumbacu de Sus, Sibiu', placeQuery: 'Porumbacu de Sus, Sibiu',
    ...POR, approx: true },
  { id: 'sun-transfer', legIn: { min: 15, mode: 'driving', icon: 'directions_car', label: 'cu mașina până la gara din Porumbacu de Jos (~7 km) sau direct, cu liftul' }, fixed: true, icon: 'route', minStay: 225, day: 'sun', time: '13:25 – 17:10', zone: 'transfer', cat: 'shop', catLabel: 'Porumbacu → Biertan · toate variantele',
    arrive: { title: 'Biertan', placeQuery: 'Biertan, Sibiu', ...BIERTAN },
    img: { q: 'Biertan fortified church' },
    title: 'Porumbacu → Biertan: toate variantele, pe ore', short: 'Lift · tren prin Sibiu · Mediaș + taxi · ultima la 17:19',
    desc: 'Alegi pe loc, după ora la care se termină cursul. Stația cea mai apropiată de Biertan e Mediaș (24 km, taxi ~30 min). Autobuz spre Biertan nu există.\n\nCU MAȘINA (oricând)\n• Lift direct până în Biertan: ~70 km, ~1h25.\n• Lift până în Sibiu (35 km, ~50 min), apoi trenurile din Sibiu de mai jos.\n• Lift până în Mediaș, apoi taxi ~30 min.\n\nCU TRENUL DIN PORUMBACU (gara e în Porumbacu de Jos, ~7 km de sat)\n• 08:44 R 2101 → Sibiu 09:59 · 12:22 R 2563 → Mediaș 13:59 · taxi → Biertan ~14:35\n• 12:53 R 2517 → Sibiu 14:12 · 15:15 R 10763 → Mediaș 16:35 · taxi → Biertan ~17:10\n• 12:53 R 2517 → Sibiu 14:12 · 17:40 R 2567 → Mediaș 19:08 · taxi → Biertan ~19:45\n• 13:14 R 2102 → Brașov 16:02 · 17:12 IR 16535 → Sighișoara 21:11 / Mediaș 21:41 (mai lent decât 17:19)\n• 17:19 R 2103 → Sibiu 18:38 · 19:10 R 10765 → Mediaș 20:28 (sau 19:38 R 2569 → 20:59) · taxi → Biertan ~21:00 · ULTIMA în aceeași seară\n• 22:27 R 2105 → Sibiu 23:26 · dormi în Sibiu · luni 07:15 R 2561 → Mediaș 08:46 (sau 08:06 → 09:27) · taxi → Biertan ~9:30, tot pleci pe jos la prânz\n\nDIN SIBIU (dacă te lasă cineva acolo)\n• Tren spre Mediaș: 12:22 → 13:59 · 15:15 → 16:35 · 17:40 → 19:08 · 19:10 → 20:28 · 19:38 → 20:59 · 20:58 → 22:18\n• Autobuz Sibiu → Mediaș: plecări la 12:30, 13:50, 18:30 (zilele de circulație neconfirmate, autogari.ro)\n\nTAXI SPRE BIERTAN\n• Cornel Irimie: 0740 585 568, o singură mașină, din gara Mediaș sau Sighișoara. Rezervi de cum știi ora.\n• Dumbrăveni (31 km) și Sighișoara (47 km) sunt mai departe de Biertan decât Mediaș.',
    address: 'Gara Porumbacu, Porumbacu de Jos → Biertan', placeQuery: 'Gara Porumbacu', hours: 'Trenuri Porumbacu → Sibiu duminică: 08:44 · 12:53 · 17:19 · 22:27', price: 'Tren din aplicația CFR Călători · taxi Mediaș → Biertan: tarif neconfirmat',
    site: 'https://mersultrenurilor.infofer.ro',
    book: { need: 'recomandat', tel: '+40740585568', label: 'Taxi Mediaș → Biertan', note: 'Duminică 22 nov, de la gara Mediaș, la ora trenului ales. O singură mașină.' },
    tips: ['Orarele sunt din mersul oficial 2025–2026 (data.gov.ro, CFR Călători și Interregional): verifică-le pe mersultrenurilor.infofer.ro înainte să pleci.', 'Ora de sosire în Biertan include ~30 min de taxi din Mediaș și câteva minute de așteptare.', 'Distanțele cu mașina sunt calculate pe OpenStreetMap.'],
    ...POR_GARA, approx: true, radius: 400 },
  { id: 'sun-biertan', meal: 'dinner', minStay: 90, day: 'sun', time: '18:30 – 20:00', zone: 'biertan', cat: 'food', catLabel: 'Cina · noaptea în Biertan',
    img: { q: 'Biertan fortified church night' },
    title: 'Noaptea în Biertan', short: 'Pensiunea Unglerus (masă inclusă) · alternative pe hartă',
    desc: 'Dormi în Biertan. Pensiunea Unglerus are 48 de locuri și masă inclusă. Alternative: Pensiunea Oppidium (restaurant în incintă, ștampilă), Casa Eva Wagner (ștampilă), Casa Ana, Pensiunea Cetate, Casele MET. Seara pregătești rucsacul pentru ploaie: haine în sac impermeabil, husa pe rucsac, telefonul în pungă zip.',
    address: 'Biertan, Sibiu', placeQuery: 'Pensiunea Unglerus Biertan', price: 'Preț neconfirmat',
    book: { need: 'obligatoriu', tel: '+40750722285', label: 'Cazare Biertan · Pensiunea Unglerus', note: 'Duminică 22 nov, o noapte, cu cină dacă se poate. Alternative: Oppidium / Eva Wagner 0740 679 119, Casa Ana 0787 876 009, Pensiunea Cetate 0745 246 485.' },
    verify: true, ...BIERTAN_UNGLERUS },

  // LUNI 23 · Biertan, apoi pe jos până la Richiș
  { id: 'mon-aeropress', minStay: 30, day: 'mon', time: '08:00 – 08:30', zone: 'biertan', cat: 'coffee', catLabel: 'Cafeaua zilei · AeroPress',
    title: 'AeroPress în Biertan', short: 'Dimineață liniștită: plecarea e abia la prânz',
    desc: 'Dimineață fără grabă: pleci pe jos abia la prânz. AeroPress și termosul plin pentru drum.',
    address: 'Biertan, Sibiu', placeQuery: 'Biertan, Sibiu',
    ...BIERTAN_UNGLERUS },
  { id: 'mon-biertan', minStay: 120, day: 'mon', time: '09:00 – 11:00', zone: 'biertan', cat: 'art', catLabel: 'Biertan · cetatea',
    rec: 'cetatea în ceață, un cadru pentru partea a doua a episodului',
    img: { q: 'Biertan fortified church' },
    title: 'Biserica fortificată Biertan', short: 'Monument UNESCO · cadre în ceață',
    desc: 'Cetatea din Biertan, monument UNESCO, e startul etapei 33. Pe ploaie și ceață iese un cadru bun pentru partea a doua a episodului. Programul de iarnă al cetății e de verificat la fața locului.',
    address: 'Biertan, Sibiu', placeQuery: 'Biserica fortificată Biertan', hours: 'Program de iarnă: de verificat', verify: true,
    ...BIERTAN },
  { id: 'mon-ruinarium', meal: 'lunch', minStay: 45, day: 'mon', time: '11:00 – 11:45', zone: 'biertan', cat: 'food', catLabel: 'Prânz · prima ștampilă',
    title: 'Ruinarium Café + magazinul Adi Impex', short: 'Prima ștampilă VT · mâncare și apă pentru drum',
    desc: 'Ruinarium Café: băuturi, gustări și preparate locale, punct de ștampilă VT. La magazinul Adi Impex cumperi apă și mâncare pentru drum: până la Richiș nu e niciun magazin și nu e niciun izvor pe hartă.',
    address: 'Biertan, Sibiu', placeQuery: 'Ruinarium Café Biertan', hours: 'Program neconfirmat',
    book: { need: 'verificare', tel: '+40729823413', label: 'Ruinarium Café, Biertan', note: 'Întrebi dacă e deschis luni la prânz.' },
    verify: true, ...RUINARIUM },
  { id: 'mon-leg1', arrive: { title: 'Richiș', placeQuery: 'Richiș, Sibiu', ...RICHIS }, legIn: { min: 5, mode: 'walking', icon: 'directions_walk', label: 'pe jos până la marcajul VT din centru' }, minStay: 225, day: 'mon', time: '12:00 – 15:45', zone: 'richis', cat: 'fun', catLabel: 'Via Transilvanica · etapa 33 · km 0 → 11,3',
    rec: 'marcajul VT pe un stâlp, bocancii în noroi, bornele',
    img: { q: 'Richiș fortified church' }, site: 'https://www.viatransilvanica.com/ro/tinuturi/terra-saxonum/biertan-nemsa',
    title: 'Pe jos: Biertan → Richiș', short: '11,3 km · bornele 608–622 · pădure, vie, drum de pământ',
    desc: 'Drum secundar puțin circulat, ~4,5 km de pădure, apoi coastele cu vie ale Richișului, coborâre pe lângă un lan și ~400 m de asfalt la intrarea în Richiș (descrierea oficială a etapei). Pe ploaie, foarte probabil noroi. Oficial, etapa întreagă (14,9 km) are 4h30; pe noroi socotește ~3h30–4h până la Richiș. Pe hartă: linia portocalie e traseul oficial, iar bornele VT 608–622 îți arată unde ești.',
    address: 'Richiș, Sibiu', placeQuery: 'Richiș, Sibiu', hours: 'Etapa 33 întreagă: 14,9 km · +492 m · dificultate „ușor” · până la Richiș: 11,3 km',
    tips: ['Pădure, după descrierea oficială: ~4,5 km pe drumul secundar de după Biertan; restul e vie, câmp și drum de pământ. Pe vânt puternic (cod de vânt, rafale peste ~60 km/h) mergi pe asfalt, pe DJ141B.', 'Apa doar din sate: între Biertan și Richiș nu e niciun izvor marcat.', 'Câinii din sate și de la stâne: fără contact vizual, pas egal, bețele la îndemână.', 'Urmează marcajele și GPX-ul oficial (actualizat 19.08.2026): traseul a fost refăcut în ultimii ani în zona Biertan – Richiș – Mediaș.', 'Pe vreme foarte rea: varianta pe asfalt, pe DJ141B, are 5,7 km, ~1h15 pe jos (Google Maps), aproape plat, dar fără marcaje VT, fără borne și cu mașini.', 'Telefonul în pungă zip între cadre; laveta pentru obiectiv.'],
    ...BIERTAN, approx: true, radius: 600 },
  { id: 'mon-film', minStay: 15, day: 'mon', time: '15:45 – 16:00', zone: 'richis', cat: 'sweet', catLabel: 'Filmare pe ploaie',
    title: 'Ce iese din ziua de ploaie', short: 'Marcaje · noroi · biserici prin ceață',
    desc: 'Verifici ce ai filmat: marcajul VT, bornele, bocancii în noroi, picăturile pe geacă, bisericile fortificate prin ceață. Pui telefonul la încărcat cât te usuci.',
    address: 'Richiș, Sibiu', placeQuery: 'Richiș, Sibiu',
    ...RICHIS, approx: true },
  { id: 'mon-richis', meal: 'dinner', minStay: 120, day: 'mon', time: '18:00 – 20:00', zone: 'richis', cat: 'food', catLabel: 'Noaptea în Richiș',
    title: 'Noaptea în Richiș', short: 'Casa Noah Experience sau La Curtea Richvini · masă la cerere',
    desc: 'Dormi în Richiș. Casa Noah Experience: 15 locuri, masă la cerere, acces la bucătărie. Pensiunea La Curtea Richvini: 10 locuri, masă la cerere (același număr ca la Camping Richiș). Ștampila de la Richiș e la Punctul de Informare Turistică sau la Magazin la doi pași. Ceri cina și apă fiartă pentru termosul de marți.',
    address: 'Richiș, Sibiu', placeQuery: 'Casa Noah Experience Richiș', price: 'Preț neconfirmat',
    book: { need: 'obligatoriu', tel: '+40770735165', label: 'Cazare Richiș · Casa Noah Experience', note: 'Luni 23 nov, o noapte, cu cină. Al doilea număr: 0758 059 859. Alternativă: La Curtea Richvini 0741 183 404.' },
    tips: ['Dacă Richiș e plin: Nemșa e la încă 3,6 km (Familia Muntean 0757 056 113, Bed and Wine 0743 332 405, Liviana 0722 552 001). Marți rămân atunci doar 19,8 km.'],
    verify: true, ...RICHIS_NOAH },

  // MARȚI 24 · Richiș → Mediaș
  { id: 'tue-aeropress', minStay: 20, day: 'tue', time: '07:00 – 07:20', zone: 'richis', cat: 'coffee', catLabel: 'Cafeaua zilei · AeroPress',
    title: 'AeroPress în Richiș, termosul plin', short: 'Pe ger: apă fierbinte pentru toată ziua',
    desc: 'Cafeaua de dimineață și termosul plin cu apă fierbinte sau ceai. Afară e −1°, se simte −6°. Azi sunt 23,4 km.',
    address: 'Richiș, Sibiu', placeQuery: 'Richiș, Sibiu',
    ...RICHIS_NOAH },
  { id: 'tue-leg0', arrive: { title: 'Nemșa', placeQuery: 'Nemșa, Sibiu', ...NEMSA }, minStay: 60, day: 'tue', time: '07:30 – 08:30', zone: 'nemsa', cat: 'fun', catLabel: 'Etapa 33 · km 11,3 → 14,9',
    site: 'https://www.viatransilvanica.com/ro/tinuturi/terra-saxonum/biertan-nemsa',
    title: 'Richiș → Nemșa', short: '3,6 km · drum de pământ · ștampila de final a etapei 33',
    desc: 'Drum de pământ până la Nemșa, pe lângă bornele 622–626. Ștampila de final a etapei 33 e la Nemșa (Familia Muntean, Bed and Wine sau Liviana).',
    address: 'Nemșa, Sibiu', placeQuery: 'Nemșa, Sibiu',
    ...RICHIS_NOAH, radius: 500 },
  { id: 'tue-leg1', arrive: { title: 'Moșna', placeQuery: 'Moșna, Sibiu', ...MOSNA_LAURA }, minStay: 90, day: 'tue', time: '08:30 – 10:00', zone: 'nemsa', cat: 'fun', catLabel: 'Etapa 34 · km 0 → 5,3',
    img: { q: 'Moșna fortified church' }, site: 'https://www.viatransilvanica.com/ro/tinuturi/terra-saxonum/nemsa-medias',
    title: 'Nemșa → Moșna', short: '5,3 km · ultimele magazine · ștampilă',
    desc: 'Din Nemșa până în Moșna, pe lângă bornele 626–631. În Moșna sunt ultimele magazine înainte de Mediaș, ștampila (Casa Parohială sau La Cetate) și biserica fortificată.',
    address: 'Moșna, Sibiu', placeQuery: 'Biserica fortificată Moșna', hours: 'Etapa 34 întreagă: 19,8 km · +491 m · dificultate „ușor”',
    ...NEMSA, approx: true, radius: 600 },
  { id: 'tue-mosna', meal: 'lunch', minStay: 30, day: 'tue', time: '10:00 – 10:30', zone: 'nemsa', cat: 'food', catLabel: 'Mâncare pentru pădure',
    title: 'Moșna: provizii pentru ultimii 14,5 km', short: 'Punct gastronomic Laura Nuțu · magazine',
    desc: 'Ultima ocazie de mâncare și apă înainte de Mediaș. Punctul gastronomic local Laura Nuțu face mâncare tradițională la cerere (sună de luni seara). Altfel, magazinele de lângă Casa Parohială.',
    address: 'Moșna, Sibiu', placeQuery: 'Moșna, Sibiu',
    book: { need: 'verificare', tel: '+40747325783', label: 'Punct gastronomic Laura Nuțu, Moșna', note: 'Marți dimineață, pe la 10:00: ceva cald și un pachet pentru drum.' },
    verify: true, ...MOSNA_LAURA },
  { id: 'tue-leg2', arrive: { title: 'Mediaș', placeQuery: 'Mediaș, Sibiu', ...FRIENDS }, minStay: 270, day: 'tue', time: '10:30 – 15:00', zone: 'medias', cat: 'fun', catLabel: 'Etapa 34 · km 5,3 → 19,8',
    rec: 'bruma pe iarbă, respirația, soarele jos printre copaci',
    site: 'https://www.viatransilvanica.com/ro/tinuturi/terra-saxonum/nemsa-medias',
    title: 'Moșna → Mediaș prin pădure', short: '~14,5 km fără sat · bornele 631–645 · polei posibil la coborâre',
    desc: '~14,5 km de pădure și drum de pământ, fără sat și fără izvor marcat, apoi asfalt la intrarea în Mediaș, unde poate fi polei la coborâre. Pământul înghețat ține mai bine decât noroiul de luni. Oficial, etapa are 5h; un jurnal de toamnă dă 7h15 pentru Nemșa – Mediaș.',
    address: 'Mediaș, Sibiu', placeQuery: 'Mediaș, Sibiu',
    tips: ['Pădure, după descrierea oficială: ~4,5 km de urcare și coborâre prin pădure (inclusiv pini) după Moșna, apoi poieni și asfalt spre Mediaș. Pe vânt puternic: taxi din Moșna până în Mediaș.', 'Pe frig, Pixelul stă în buzunarul de la piept; filmul Zenitului îl derulezi încet.', 'Dacă la Moșna ești după 11:00, trenul de 16:45 devine strâns: ai ca rezervă IR 23:42 sau o noapte în Mediaș.'],
    ...MOSNA_LAURA, radius: 900 },
  { id: 'tue-friends', minStay: 45, day: 'tue', time: '15:00 – 15:45', zone: 'medias', cat: 'coffee', catLabel: 'Recompensa · ultima ștampilă',
    rec: 'un filtru de specialitate după 23 km',
    title: 'Friends Fine Wine & Specialty Coffee', short: 'Cafea de specialitate · punct de ștampilă VT',
    desc: 'Cafenea de specialitate în Mediaș, trecută pe harta Via Transilvanica ca punct de ștampilă. Ultima ștampilă a drumului și prima cafea care nu e din AeroPress.',
    address: 'Mediaș, Sibiu', placeQuery: 'Friends Fine Wine & Specialty Coffee Mediaș', hours: 'Program neconfirmat: suni înainte',
    book: { need: 'verificare', tel: '+40770478402', label: 'Friends, Mediaș', note: 'Întrebi dacă e deschis marți după-amiază.' },
    verify: true, ...FRIENDS },
  { id: 'tue-train', fixed: true, icon: 'train', minStay: 448, day: 'tue', time: '16:45 – 00:13', zone: 'medias', cat: 'shop', catLabel: 'Spre casă',
    arrive: { title: 'București Nord', placeQuery: 'Gara de Nord București', lat: 44.4466, lng: 26.0745 },
    title: 'Mediaș → București Nord · IR 16534', short: '16:45 → 00:13 · rezervă: IR 16536, 23:42 → 06:50',
    desc: 'IR 16534: Mediaș 16:45 → București Nord 00:13. Dacă ajungi mai devreme: IR 16023, 14:19 → 21:11. Dacă întârzii: IR 16536, 23:42 → 06:50, sau o noapte în Mediaș (Mercure, Ferdinand, apartamentele de pe harta VT). În tren: marchezi favoritele pentru ep02, notezi tema și frazele de pe carduri.',
    address: 'Gara Mediaș', placeQuery: 'Gara Mediaș', hours: 'IR 14:19 · 16:45 · 23:42', price: 'Bilet din aplicația CFR Călători',
    site: 'https://mersultrenurilor.infofer.ro',
    tips: ['Orarele sunt din mersul oficial 2025–2026: verifică-le pe mersultrenurilor.infofer.ro.'],
    lat: 46.160207, lng: 24.349256, radius: 300 },
];

// Alternative pe zone: cazări, ștampile, magazine și mâncare de pe harta oficială Via Transilvanica (coordonatele sunt ale punctelor VT).
export const ALTERNATIVES = [
  { zone: 'porumbacu', cat: 'shop', title: 'Gara Porumbacu (Porumbacu de Jos)', address: 'Str. Gării, Porumbacu de Jos', placeQuery: 'Gara Porumbacu', hours: 'Duminică spre Sibiu: 08:44 · 12:53 · 17:19 · 22:27 · spre Brașov: 13:14', price: 'Bilet CFR', note: 'La ~6,7 km cu mașina de Porumbacu de Sus. Toate legăturile spre Biertan sunt în cardul „Porumbacu → Biertan”.', ...POR_GARA, approx: true },
  { zone: 'transfer', cat: 'shop', title: 'Gara Sibiu', address: 'Piața 1 Decembrie 1918, Sibiu', placeQuery: 'Gara Sibiu', hours: 'Duminică spre Mediaș: 12:22 · 15:15 · 17:40 · 19:10 · 19:38 · 20:58', price: 'Bilet CFR / Interregional', note: 'Dacă te lasă cineva în Sibiu. Autobuze Sibiu → Mediaș: 12:30, 13:50, 18:30 (zilele neconfirmate).', ...SIBIU_GARA, approx: true },
  { zone: 'transfer', cat: 'shop', title: 'Gara Mediaș + taxi spre Biertan', address: 'Strada Unirii, Mediaș', placeQuery: 'Gara Mediaș', hours: 'Taxi Cornel Irimie: 0740 585 568', price: 'Tarif neconfirmat', note: 'Stația cea mai apropiată de Biertan: 24 km, ~30 min cu taxiul. O singură mașină: rezervi de cum știi ora trenului.', lat: 46.160207, lng: 24.349256 },
  { zone: 'biertan', cat: 'shop', title: 'Pensiunea Unglerus', address: 'Biertan, Sibiu', placeQuery: 'Pensiunea Unglerus Biertan', hours: 'Sunați: 0750 722 285', price: '48 de locuri · masă inclusă', note: 'Cazare recomandată pe harta VT.', lat: 46.135592, lng: 24.521068, verify: true },
  { zone: 'biertan', cat: 'shop', title: 'Pensiunea Oppidium', address: 'Biertan, Sibiu', placeQuery: 'Pensiunea Oppidium Biertan', hours: 'Sunați: 0740 679 119', price: '9 locuri · restaurant în incintă', note: 'Punct de ștampilă VT.', lat: 46.135143, lng: 24.522281, verify: true },
  { zone: 'biertan', cat: 'shop', title: 'Casa Eva Wagner', address: 'Biertan, Sibiu', placeQuery: 'Casa Eva Wagner Biertan', hours: 'Sunați: 0740 679 119', price: '16 locuri · masă la cerere', note: 'Punct de ștampilă VT. Același număr ca Oppidium.', lat: 46.133376, lng: 24.520671, verify: true },
  { zone: 'biertan', cat: 'shop', title: 'Casa Ana', address: 'Biertan, Sibiu', placeQuery: 'Casa Ana Biertan', hours: 'Sunați: 0787 876 009', price: '14 locuri · masă la cerere', note: 'Cazare de pe harta VT.', lat: 46.134345, lng: 24.523517, verify: true },
  { zone: 'biertan', cat: 'shop', title: 'Pensiunea Cetate', address: 'Biertan, Sibiu', placeQuery: 'Pensiunea Cetate Biertan', hours: 'Sunați: 0745 246 485', price: '22 de locuri · mic dejun la cerere', note: 'Cazare de pe harta VT.', lat: 46.135174, lng: 24.522085, verify: true },
  { zone: 'biertan', cat: 'shop', title: 'Casele Experience Transylvania (MET) nr. 2', address: 'Biertan, Sibiu', placeQuery: 'Biertan, Sibiu', hours: 'Sunați: 0724 000 350', price: '10 locuri · rezervări online', note: 'Masă la cerere.', lat: 46.136929, lng: 24.52098, verify: true },
  { zone: 'biertan', cat: 'food', title: 'Magazin Adi Impex', address: 'Biertan, Sibiu', placeQuery: 'Biertan, Sibiu', hours: 'Program neconfirmat', price: '', note: 'Magazin și gustări. Apa și mâncarea pentru drumul spre Richiș.', lat: 46.136692, lng: 24.520746, verify: true },
  { zone: 'richis', cat: 'fun', title: 'Scurtătura pe asfalt Biertan → Richiș (DJ141B)', address: 'DJ141B, Biertan – Richiș', placeQuery: 'Richiș, Sibiu', hours: '5,7 km · ~1h15 pe jos', price: 'Gratis', note: 'După Google Maps: aproape plat, pe drumul județean. Pentru vreme foarte rea. Fără marcaje VT, fără borne, cu mașini: vestă sau geacă deschisă la culoare.', lat: 46.1166, lng: 24.5005, approx: true },
  { zone: 'richis', cat: 'shop', title: 'Casa Noah Experience', address: 'Richiș, Sibiu', placeQuery: 'Casa Noah Experience Richiș', hours: 'Sunați: 0770 735 165 · 0758 059 859', price: '15 locuri · masă la cerere', note: 'Acces la bucătărie utilată.', lat: 46.094272, lng: 24.474033, verify: true },
  { zone: 'richis', cat: 'shop', title: 'Pensiunea La Curtea Richvini', address: 'Richiș, Sibiu', placeQuery: 'La Curtea Richvini Richiș', hours: 'Sunați: 0741 183 404', price: '10 locuri · masă la cerere', note: 'Același număr ca la Camping Richiș.', lat: 46.09684, lng: 24.48044, verify: true },
  { zone: 'richis', cat: 'food', title: 'Magazin la doi pași (Richiș)', address: 'Richiș, Sibiu', placeQuery: 'Richiș, Sibiu', hours: 'Sunați: 0723 376 584', price: '', note: 'Magazin și punct de ștampilă VT.', lat: 46.097706, lng: 24.479799, verify: true },
  { zone: 'richis', cat: 'art', title: 'Punct de Informare Turistică Richiș', address: 'Richiș, Sibiu', placeQuery: 'Biserica fortificată Richiș', hours: 'Sunați: 0772 267 784', price: '', note: 'Punct de ștampilă VT, lângă biserica fortificată.', lat: 46.0974, lng: 24.480033, verify: true },
  { zone: 'nemsa', cat: 'shop', title: 'Cazare la Familia Muntean (Nemșa)', address: 'Nemșa, Sibiu', placeQuery: 'Nemșa, Sibiu', hours: 'Sunați: 0757 056 113 · 0771 140 255', price: '5 locuri · masă inclusă', note: 'Ștampilă. Variantă dacă luni ajungi până la Nemșa.', lat: 46.085385, lng: 24.44474, verify: true },
  { zone: 'nemsa', cat: 'shop', title: 'Bed and Wine (Nemșa)', address: 'Nemșa, Sibiu', placeQuery: 'Bed and Wine Nemșa', hours: 'Sunați: 0743 332 405', price: '6 locuri · masă la cerere', note: 'Ștampilă.', lat: 46.083414, lng: 24.448615, verify: true },
  { zone: 'nemsa', cat: 'shop', title: 'Casa de oaspeți Liviana (Nemșa)', address: 'Nemșa, Sibiu', placeQuery: 'Nemșa, Sibiu', hours: 'Sunați: 0722 552 001', price: '3 locuri · masă la cerere', note: 'Ștampilă.', lat: 46.086498, lng: 24.444188, verify: true },
  { zone: 'nemsa', cat: 'shop', title: 'Casa Parohială Moșna', address: 'Moșna, Sibiu', placeQuery: 'Casa Parohială Moșna', hours: 'Sunați: 0749 680 770', price: '16 locuri', note: 'Ștampilă, magazine în apropiere.', lat: 46.091425, lng: 24.395095, verify: true },
  { zone: 'nemsa', cat: 'shop', title: 'Casa de oaspeți „La Cetate” (Moșna)', address: 'Moșna, Sibiu', placeQuery: 'La Cetate Moșna', hours: 'Sunați: 0743 655 299 · 0742 557 328', price: '8 locuri · masă la cerere', note: 'Ștampilă.', lat: 46.093031, lng: 24.394189, verify: true },
  { zone: 'nemsa', cat: 'shop', title: 'Casa Speranței (Moșna)', address: 'Moșna, Sibiu', placeQuery: 'Moșna, Sibiu', hours: 'Sunați: 0752 955 587', price: '10 locuri · masă la cerere', note: 'Cazare de pe harta VT.', lat: 46.091689, lng: 24.39591, verify: true },
  { zone: 'nemsa', cat: 'art', title: 'Biserica fortificată Moșna', address: 'Moșna, Sibiu', placeQuery: 'Biserica fortificată Moșna', hours: 'De verificat', price: '', note: 'Pe traseul etapei 34, la km 5,3. Un cadru pe ger, cu bruma pe acoperișuri.', ...MOSNA, approx: true, verify: true },
  { zone: 'medias', cat: 'shop', title: 'Mercure Mediaș Binderbubi', address: 'Mediaș, Sibiu', placeQuery: 'Mercure Mediaș Binderbubi', hours: 'Sunați: 0730 099 303', price: 'Reducere pentru drumeți VT', note: 'Ștampilă. Dacă pierzi trenul de marți.', lat: 46.161261, lng: 24.369093, verify: true },
  { zone: 'medias', cat: 'shop', title: 'Ferdinand Appartments', address: 'Mediaș, Sibiu', placeQuery: 'Ferdinand Appartments Mediaș', hours: 'Sunați: 0749 680 770', price: '20 de locuri', note: 'Ștampilă. Unele camere au bucătărie.', lat: 46.16406, lng: 24.350163, verify: true },
  { zone: 'medias', cat: 'food', title: 'Carrefour Mediaș', address: 'Mediaș, Sibiu', placeQuery: 'Carrefour Mediaș', hours: '', price: '', note: 'Provizii pentru tren.', lat: 46.166199, lng: 24.347241 },
];

export const CURATED = {};

// Avertizări (apar sus în Plan, în zilele vizate). Surse: comunicatele ANM preluate de presa locală pe 19 nov 2026.
export const ALERTS = [
  { days: ['fri'], level: 'portocaliu', icon: 'air', title: 'Cod portocaliu de vânt · vineri 01:00 – 10:00',
    when: 'Zona joasă a județului Sibiu: rafale 70–90 km/h · munte 800–1200 m: 100–130 km/h (portocaliu) · peste 1200 m (Bâlea, Păltiniș): peste 140 km/h (cod roșu) · apoi cod galben până la 16:00 (50–70 km/h)',
    text: 'Plecarea de la 5:30 cade în fereastra codului portocaliu. Înainte să pleci verifici traficul (Waze, infotrafic): pe Valea Oltului (DN7) restricțiile de lucrări s-au ridicat pe 16 noiembrie și pe 19 noiembrie nu era raportată nicio închidere din cauza vântului; pe DN1 prin Făgăraș bate vânt lateral, pe câmp deschis. Nu opriți sub copaci sau lângă stâlpi. Dacă la plecare bate tare, o plecare pe la 7:00–8:00 scurtează timpul petrecut în cod. Porumbacu de Sus e la 437 m, sub zona cu cod roșu: nu urcați spre creastă.',
    links: [['Avertizările ANM', 'https://www.meteoromania.ro/avertizari/'], ['Ora de Sibiu, 19 nov', 'https://www.oradesibiu.ro/2026/11/19/cod-portocaliu-de-vant-la-sibiu-in-noaptea-de-joi-spre-vineri-cod-rosu-pe-fagaras-si-cindrel/'], ['Sibiu Independent, 19 nov', 'https://sibiuindependent.ro/2026/11/19/cod-rosu-de-vant-la-balea-si-paltinis-rafale-de-pana-la-90-km-h-in-municipiul-sibiu/']] },
  { days: ['mon', 'tue'], level: 'galben', icon: 'park', title: 'Vânt pe Via Transilvanica · planul B',
    when: 'Luni rafale ~55–57 km/h, marți ~40–48 km/h după model · pentru luni și marți ANM n-a dat încă avertizări',
    text: 'Regula: dacă ANM dă cod de vânt pentru județul Sibiu sau rafalele trec de ~60 km/h, eviți pădurea (risc de crengi căzute).\nPădurea, după descrierea oficială a etapelor: ~4,5 km pe drumul secundar de după Biertan și ~4,5 km după Moșna (inclusiv pini). Restul e vie, câmp, drum de pământ și asfalt la intrarea în sate.\nLuni: Biertan → Richiș pe asfalt, pe DJ141B: 5,7 km, ~1h15, fără pădure.\nMarți: Richiș → Nemșa → Moșna pe drum de pământ și prin sate, apoi taxi Moșna → Mediaș, sau tot drumul cu taxiul.\nTaxi: Cornel Irimie, 0740 585 568 (Biertan, Richiș, Copșa Mare, gările Mediaș și Sighișoara). Pe autogari.ro nu apare niciun autobuz din Biertan, Richiș, Nemșa sau Moșna spre Mediaș: întrebi gazda de microbuze locale.',
    links: [['Avertizările ANM', 'https://www.meteoromania.ro/avertizari/'], ['Prognoza meteoblue Sibiu', 'https://www.meteoblue.com/en/romania/weather-sibiu']] },
];

// Contacte și link-uri utile, sus în tab-ul „Contacte”. `tel` în format internațional, `show` = cum se afișează.
export const CONTACTS = [
  { group: 'Urgențe', icon: 'call', title: 'Urgențe', tel: '112', show: '112', note: 'Ambulanță, poliție, pompieri' },
  { group: 'Urgențe', icon: 'landscape', title: 'Salvamont', tel: '+40725826668', show: '0725 826 668', note: '0SALVAMONT, pe munte și pe trasee' },
  { group: 'Duminică · spre Biertan', icon: 'local_taxi', title: 'Taxi Mediaș / Sighișoara → Biertan', tel: '+40740585568', show: '0740 585 568', note: 'Cornel Irimie · o singură mașină · ~30 min din Mediaș' },
  { group: 'Duminică · spre Biertan', icon: 'directions_car', title: 'Lift cu mașina, oricând', note: 'Direct în Biertan ~70 km, ~1h25 · sau până în Sibiu (35 km) / Mediaș' },
  { group: 'Duminică · spre Biertan', icon: 'train', title: '08:44 → Sibiu 09:59 · 12:22 → Mediaș 13:59', note: 'Taxi → Biertan ~14:35', link: 'https://mersultrenurilor.infofer.ro' },
  { group: 'Duminică · spre Biertan', icon: 'train', title: '12:53 → Sibiu 14:12 · 15:15 → Mediaș 16:35', note: 'Taxi → Biertan ~17:10', link: 'https://mersultrenurilor.infofer.ro' },
  { group: 'Duminică · spre Biertan', icon: 'train', title: '12:53 → Sibiu 14:12 · 17:40 → Mediaș 19:08', note: 'Taxi → Biertan ~19:45', link: 'https://mersultrenurilor.infofer.ro' },
  { group: 'Duminică · spre Biertan', icon: 'train', title: '17:19 → Sibiu 18:38 · 19:10 → Mediaș 20:28', note: 'Ultima în aceeași seară · taxi → Biertan ~21:00 · sau 19:38 → 20:59', link: 'https://mersultrenurilor.infofer.ro' },
  { group: 'Duminică · spre Biertan', icon: 'train', title: '22:27 → Sibiu 23:26 · dormi în Sibiu', note: 'Luni 07:15 → Mediaș 08:46 · taxi → Biertan ~9:30', link: 'https://mersultrenurilor.infofer.ro' },
  { group: 'Cazare', icon: 'hotel', title: 'Duminică · Pensiunea Unglerus, Biertan', tel: '+40750722285', show: '0750 722 285', note: '48 de locuri · masă inclusă' },
  { group: 'Cazare', icon: 'hotel', title: 'Duminică · Oppidium / Eva Wagner, Biertan', tel: '+40740679119', show: '0740 679 119', note: 'Ștampilă · restaurant la Oppidium' },
  { group: 'Cazare', icon: 'hotel', title: 'Duminică · Casa Ana, Biertan', tel: '+40787876009', show: '0787 876 009', note: 'Masă la cerere' },
  { group: 'Cazare', icon: 'hotel', title: 'Duminică · Pensiunea Cetate, Biertan', tel: '+40745246485', show: '0745 246 485', note: 'Mic dejun la cerere' },
  { group: 'Cazare', icon: 'hotel', title: 'Luni · Casa Noah Experience, Richiș', tel: '+40770735165', show: '0770 735 165', note: 'Masă la cerere · al doilea nr. 0758 059 859' },
  { group: 'Cazare', icon: 'hotel', title: 'Luni · La Curtea Richvini, Richiș', tel: '+40741183404', show: '0741 183 404', note: 'Masă la cerere' },
  { group: 'Cazare', icon: 'hotel', title: 'Luni (dacă ajungi la Nemșa) · Familia Muntean', tel: '+40757056113', show: '0757 056 113', note: 'Masă inclusă · ștampilă' },
  { group: 'Cazare', icon: 'hotel', title: 'Marți (dacă pierzi trenul) · Mercure Mediaș', tel: '+40730099303', show: '0730 099 303', note: 'Reducere drumeți' },
  { group: 'Mâncare & ștampile', icon: 'local_cafe', title: 'Ruinarium Café, Biertan', tel: '+40729823413', show: '0729 823 413', note: 'Ștampilă · preparate locale' },
  { group: 'Mâncare & ștampile', icon: 'storefront', title: 'Magazin la doi pași, Richiș', tel: '+40723376584', show: '0723 376 584', note: 'Magazin · ștampilă' },
  { group: 'Mâncare & ștampile', icon: 'restaurant', title: 'Laura Nuțu, Moșna', tel: '+40747325783', show: '0747 325 783', note: 'Mâncare tradițională la cerere · ștampilă' },
  { group: 'Mâncare & ștampile', icon: 'local_cafe', title: 'Friends Fine Wine & Specialty Coffee, Mediaș', tel: '+40770478402', show: '0770 478 402', note: 'Ultima ștampilă · program neconfirmat' },
  { group: 'Link-uri', icon: 'route', title: 'GPX etapa 33 · Biertan – Nemșa', link: 'https://www.viatransilvanica.com/ro/tinuturi/terra-saxonum/biertan-nemsa', note: '14,9 km · +492 m · Richiș la km 11,3' },
  { group: 'Link-uri', icon: 'route', title: 'GPX etapa 34 · Nemșa – Mediaș', link: 'https://www.viatransilvanica.com/ro/tinuturi/terra-saxonum/nemsa-medias', note: '19,8 km · +491 m · Moșna la km 5,3' },
  { group: 'Link-uri', icon: 'map', title: 'Harta oficială Via Transilvanica', link: 'https://www.viatransilvanica.com/ro/harta', note: 'Cazări, ștampile, borne' },
  { group: 'Link-uri', icon: 'train', title: 'Mersul trenurilor (CFR)', link: 'https://mersultrenurilor.infofer.ro', note: 'Porumbacu · Sibiu · Mediaș · București' },
  { group: 'Link-uri', icon: 'directions_bus', title: 'Autobuze Sibiu → Mediaș', link: 'https://www.autogari.ro/Transport/Sibiu-Medias', note: 'Zilele de circulație de verificat' },
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
    { text: '2–3 cadre cu tine, filmate de colegi', loc: 'fri-crew' },
    { text: 'VT: cetatea din Biertan în ceață', loc: 'mon-biertan' },
    { text: 'VT: marcajul pe un stâlp, o bornă, bocancii în noroi', loc: 'mon-leg1' },
    { text: 'VT: bruma, respirația, soarele jos printre copaci', loc: 'tue-leg2' },
    { text: 'Ștampilele VT: Biertan, Richiș, Nemșa, Moșna, Mediaș', loc: 'mon-ruinarium' },
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
    { title: 'Rezervi azi Biertan (duminică) și Richiș (luni)', when: 'Pensiunea Unglerus · Casa Noah Experience', price: '', link: 'https://www.viatransilvanica.com/ro/harta', locId: 'fri-lunch', kind: 'tip' },
  ],
  sat: [
    { title: 'Singura zi uscată și blândă: exteriorul se filmează azi', when: 'AeroPress 7:30 – 8:30 · lumina de aur 16:00 – 16:46', price: 'Gratis', link: 'https://www.meteoblue.com/en/romania/weather-sibiu', locId: 'sat-aeropress', kind: 'gratis' },
    { title: 'Întrebi azi cine pleacă duminică spre Sibiu sau Mediaș', when: 'Un lift te scutește de 2–3 trenuri', price: '', link: 'https://mersultrenurilor.infofer.ro', locId: 'sun-transfer', kind: 'tip' },
  ],
  sun: [
    { title: 'Toate variantele spre Biertan, pe ore', when: 'Lift · 08:44 · 12:53 · 17:19 (ultima) · 22:27 + Sibiu', price: '', link: 'https://mersultrenurilor.infofer.ro', locId: 'sun-transfer', kind: 'tip' },
    { title: 'Mediaș e stația cea mai apropiată de Biertan', when: 'Taxi ~30 min · 0740 585 568', price: '', link: 'https://explorebiertan.ro/taxi-local/', locId: 'sun-transfer', kind: 'tip' },
  ],
  mon: [
    { title: 'Biserica fortificată Biertan, monument UNESCO', when: 'Dimineața, până la plecare', price: '', link: 'https://www.viatransilvanica.com/ro/tinuturi/terra-saxonum/biertan-nemsa', locId: 'mon-biertan', kind: 'tip' },
    { title: 'Două ștampile VT: Biertan și Richiș', when: 'Ruinarium Café · Magazin la doi pași', price: 'Gratis', link: 'https://www.viatransilvanica.com/ro/harta', locId: 'mon-ruinarium', kind: 'gratis' },
  ],
  tue: [
    { title: 'Trei ștampile: Nemșa, Moșna, Mediaș', when: 'Familia Muntean · Casa Parohială · Friends', price: 'Gratis', link: 'https://www.viatransilvanica.com/ro/tinuturi/terra-saxonum/nemsa-medias', locId: 'tue-leg1', kind: 'gratis' },
    { title: 'Cafea de specialitate la final: Friends, Mediaș', when: 'Program neconfirmat', price: '', link: 'https://www.viatransilvanica.com/ro/tinuturi/terra-saxonum/nemsa-medias', locId: 'tue-friends', kind: 'tip' },
  ],
};

// Utile pe drum: urgențe, gări, taxi. Doar ce e verificat.
export const NEAR_HOME = [
  { group: 'Urgențe', icon: 'call', color: 'var(--red)', title: 'Urgențe: 112', note: 'Ambulanță, poliție, pompieri. Apăsați ca să sunați.', tel: '112' },
  { group: 'Urgențe', icon: 'landscape', color: 'var(--red)', title: 'Salvamont: 0725 826 668', note: '0SALVAMONT, pentru accidente pe munte și pe trasee.', tel: '0725826668' },
  { group: 'Transport', icon: 'train', color: 'var(--blue)', title: 'Gara Porumbacu', address: 'Str. Gării, Porumbacu de Jos', hours: 'Duminică spre Sibiu: 08:44 · 12:53 · 17:19 · 22:27', q: 'Gara Porumbacu', ...POR_GARA },
  { group: 'Transport', icon: 'train', color: 'var(--blue)', title: 'Gara Sibiu', address: 'Piața 1 Decembrie 1918, Sibiu', hours: 'Spre Mediaș duminică: 12:22 · 15:15 · 17:40 · 19:10 · 19:38 · 20:58', q: 'Gara Sibiu', ...SIBIU_GARA },
  { group: 'Transport', icon: 'train', color: 'var(--blue)', title: 'Gara Mediaș', address: 'Strada Unirii, Mediaș', hours: 'Spre București Nord: IR 14:19 · 16:45 · 23:42', q: 'Gara Mediaș', lat: 46.160207, lng: 24.349256 },
  { group: 'Transport', icon: 'local_taxi', color: 'var(--text-2)', title: 'Taxi Biertan ↔ Mediaș: 0740 585 568', note: 'Cornel Irimie, o singură mașină: rezervi cu o zi înainte.', tel: '+40740585568' },
];

export const PACK_DEFAULTS = [
  { cat: 'Haine în straturi', icon: 'checkroom', items: ['2 tricouri tehnice sau merinos (fără bumbac pe traseu)', 'Polar sau bluză de lână', 'Geacă puf sau sintetică ușoară', 'Geacă de ploaie cu glugă + pantaloni de ploaie', 'Pantaloni de drum + colanți termo pentru marți', 'Căciulă, buff, mănuși subțiri pentru ecran + mănuși groase', 'Ochelari pentru vânt și ninsoare', '3 perechi de șosete de lână (una mereu uscată)', 'Haine curate pentru curs, lenjerie pe 4–5 zile'] },
  { cat: 'Încălțăminte', icon: 'directions_walk', items: ['Bocanci impermeabili, deja purtați', 'Papuci ușori pentru sală și cazare', 'Parazăpezi scurți (noroi luni, ninsoare marți)', 'Microcrampoane ușoare (opțional, pentru polei marți)'] },
  { cat: 'Echipament de drum', icon: 'route', items: ['Rucsac 30–40 L + husă de ploaie', 'Sac impermeabil pentru haine și electronice', 'Frontală + baterii', 'Bețe de trekking', 'GPX-ul etapelor 33 și 34, offline', 'Pungi de gunoi, șervețele umede'] },
  { cat: 'Hrană & apă', icon: 'water_drop', items: ['Termos 0,5–0,75 L', 'Sticlă de 1 L (apa doar din sate)', 'Gustări pe 2 zile: nuci, ciocolată, batoane, brânză, pâine', 'AeroPress Go + cafea măcinată + filtre'] },
  { cat: 'Siguranță & prim ajutor', icon: 'local_pharmacy', items: ['Plasturi pentru bășici, pansamente, bandă', 'Ibuprofen sau paracetamol, medicamentele tale, dezinfectant', 'Folie de supraviețuire, fluier'] },
  { cat: 'Acte & bani', icon: 'badge', items: ['Buletin, card de sănătate, card bancar', 'Cash pentru pensiuni, taxi și magazine', 'Pașaportul Via Transilvanica (opțional)'] },
  { cat: 'Filmare', icon: 'photo_camera', items: ['Power bank 10.000–20.000 mAh', 'Încărcător USB-C + 2 cabluri', 'Spațiu liber pe Pixel sau stick / SSD USB-C', 'Mini-trepied cu clemă de telefon', 'Microfon lavalieră cu protecție de vânt', 'Zenit: 2–3 role ISO 400', 'Zenit: baterie de rezervă pentru exponometru', 'Carnet + pix (creion pe ploaie) + 5–6 carduri și un marker', 'Lavetă pentru obiectiv + pungă zip pentru telefon'] },
];

export const PHRASES = [];

// Răsărit / lumină de aur (soarele sub 6°) / apus / întuneric (sfârșitul crepusculului civil), ora României,
// calculat astronomic. Temperaturile: prognoza Open-Meteo din 19 nov (Porumbacu Vin–Dum, Mediaș Lun–Mar).
export const SUN = {
  fri: { rise: '7:29', gold: '16:01', set: '16:47', dusk: '17:20', temp: '13°/6°', place: 'Porumbacu' },
  sat: { rise: '7:30', gold: '16:00', set: '16:46', dusk: '17:19', temp: '14°/6°', place: 'Porumbacu' },
  sun: { rise: '7:31', gold: '15:59', set: '16:45', dusk: '17:18', temp: '9°/1°', place: 'Porumbacu' },
  mon: { rise: '7:34', gold: '15:56', set: '16:44', dusk: '17:17', temp: '5°/0°', place: 'Biertan – Richiș' },
  tue: { rise: '7:36', gold: '15:56', set: '16:43', dusk: '17:16', temp: '1°/−2°', place: 'Richiș – Mediaș' },
};
export const WEATHER_NOTE = 'Vineri dimineață: cod portocaliu de vânt în zona joasă a județului Sibiu (01:00–10:00, rafale 70–90 km/h), cod roșu la munte peste 1200 m (Bâlea, Păltiniș: peste 140 km/h). Weekendul e blând (până la 14°), apoi se răcește: luni plouă toată ziua (13–14 mm), marți îngheață, cu averse de ninsoare (−2…+1°). Zile scurte: apus pe la 16:45, întuneric pe la 17:17. Prognoza Open-Meteo actualizată pe 19 nov seara; avertizările ANM pe meteoromania.ro.';

// Fără variante de masă votate: programul are o singură masă pe slot.
export const MEAL_SLOTS = {};

// Fără poze alese manual: aplicația caută automat pe Wikimedia Commons după `img.q`, coordonate și nume.
export const PHOTOS = {};

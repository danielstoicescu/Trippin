# Barcelona Aventura – Mara (13), Anne & Daniel 🎉

Ghid interactiv de vacanță (PortAventura + Barcelona, 4–9 noiembrie), găzduit pe **Firebase Hosting**,
cu program comun sincronizat live prin **Firestore**: locații adăugate de oricare dintre voi,
contorul de espresso al lui Daniel și „quest log”-ul Marei apar instant pe toate telefoanele.

Fără Firebase, aplicația merge oricum: totul se salvează local, pe telefonul respectiv.

## Ce face (gândită pentru telefon, în excursie)
- **Material 3 Expressive** (Android 16/17): button group conectat pentru zile, grupuri de rânduri ca în Settings, foi de jos cu toolbar plutitor, FAB, chip-uri, snackbar, mișcare cu arc. Fonturi și iconițe self-hosted (Archivo, Instrument Sans, Material Symbols Rounded).
- **Plan**: „Oportunitățile zilei” (gratis / inclus / de neratat, cu link oficial), sfatul zilei, cronologie cu rail de timp și tranziții („730 m · 9 min pe jos”, „metrou / taxi”), recomandări similare pe zone în carusel.
- **Noi**: bucketlist pentru Mara, Anne și Daniel (bifabil, cu adăugare), contor personal; al lui Daniel are ecran de top-up (cană care se umple, tip de cafea, locul, istoric pe zile).
- **Instalare**: la prima deschidere apare o foaie cu pașii pentru Android / iPhone (și butonul nativ de instalare pe Android).
- **Material 3 pe paleta Barcelona**: bară de navigare Plan · Explorare · Info, buton „Adaugă”, chip-uri, foi de detaliu, light mode implicit.
- **Detaliu pentru fiecare loc**: notă Google (sept. 2026), un review, „cel mai popular”, tips & tricks, program, preț. Pentru locurile adăugate de familie, Daniel completează cu Claude tabelul `CURATED` din `public/data.js`.
- **Poze**: ale voastre („Adaugă poză”, comprimată în telefon, salvată în Firestore, vizibilă la toți) au prioritate. Până atunci, fiecare loc din program arată o fotografie reală cu licență liberă de pe Wikimedia Commons (cu atribuire), iar butonul „Poze, meniu & recenzii pe Google Maps” deschide fotografiile clienților și meniul. Fără Google Places (ar cere facturare).
- **Vremea live** din Barcelona în header (Open-Meteo, fără cheie), cu prognoza pe 7 zile la o atingere.
- **Iconițe** Material Symbols Rounded ca SVG inline (`npm run icons` regenerează `public/icons.js`).
- **Program pe zile** cu ore de deschidere, prețuri și zile gratuite (verificate online în sept. 2026; ce e marcat „Verifică” se confirmă în Maps).
- **Recomandări similare pe zone** sub fiecare zi, cu „Adaugă în program”.
- **Radar „lângă mine”**: pornit din aplicație, arată distanța pe jos până la locurile din program și dă alertă (banner + vibrație + notificare) când sunteți la ~150 m. Merge cât timp aplicația e deschisă pe ecran: un site nu poate urmări locația în fundal.
- **Navighează** (Google Maps pe jos) și **Maps & ore** (orele live) pe fiecare card. „Fixează aici” salvează poziția exactă a unui loc, pentru toți.
- **Bifează „Am fost”**, contorul de espresso, quest log-ul Marei și **notițe comune** (adresă, cod ușă, wifi), toate sincronizate live între telefoane.
- **Vreme** pe zilele excursiei (Open-Meteo, apare cu ~2 săptămâni înainte), **numărătoare inversă**, tab-ul zilei curente se selectează singur, cardul „ACUM”.
- **Offline**: după prima deschidere, aplicația pornește și fără semnal (service worker + cache Firestore). Se poate instala pe ecranul principal.

## Ce trebuie făcut o singură dată (≈10 minute)

### 1. Creează proiectul Firebase
1. Intră pe <https://console.firebase.google.com> → **Add project** (ex. `bcn-aventura`). Google Analytics poate rămâne oprit.
2. În proiect: **Build → Firestore Database → Create database** → *Start in production mode* → alege regiunea `eur3 (europe-west)`.
   Regulile de securitate se instalează automat la deploy (din `firestore.rules`).
3. **Project settings (⚙️) → General → Your apps → `</>` (Web)** → dă-i un nume (ex. `web`), **bifează „Also set up Firebase Hosting”** → Register app. Nu trebuie să copiezi nimic din cod.

### 2. Dă-i lui GitHub voie să publice
1. **Project settings → Service accounts → Generate new private key** → se descarcă un fișier `.json`.
2. În GitHub, repo-ul `Trippin` → **Settings → Secrets and variables → Actions → New repository secret**:
   - `FIREBASE_SERVICE_ACCOUNT` = **tot conținutul** fișierului `.json` (copy/paste).
   - `FIREBASE_PROJECT_ID` = ID-ul proiectului (din Project settings, ex. `bcn-aventura` sau `bcn-aventura-1a2b3`).

### 3. Publică
- Automat: orice push pe `main` rulează workflow-ul **🔥 Deploy BCN Aventura to Firebase**.
- Manual: GitHub → **Actions → 🔥 Deploy BCN Aventura to Firebase → Run workflow** (poți alege și alt branch).

Linkul final: `https://<FIREBASE_PROJECT_ID>.web.app` – trimite-l Marei și Annei pe WhatsApp (butonul verde din aplicație face asta).

## Cum funcționează
- `public/` este ce se publică (HTML + `app.js` + `data.js` cu programul și recomandările + CSS compilat + `sw.js` + iconițe + Font Awesome local). `npm run build` recompilează CSS-ul și pune o versiune nouă în `sw.js`.
- Pe Firebase Hosting, aplicația își ia singură configurația de la `/__/firebase/init.json`, deci `firebase-config.js` poate rămâne gol.
- Datele stau în Firestore la `trips/bcn-aventura/locations/*` (locațiile adăugate) și `trips/bcn-aventura/state/shared` (cafele + quest-uri).
- Regulile (`firestore.rules`) nu cer login (ghid de familie), dar acceptă doar documente cu forma exactă așteptată.

## Lucru local
```bash
npm install
npm run watch     # recompilează CSS-ul la orice modificare
npm run serve     # http://localhost:5173
```
Pentru sincronizare live și local, completează `public/firebase-config.js` cu configul din Firebase Console.

## Deploy din terminal (alternativ la GitHub Actions)
```bash
npm i -g firebase-tools
firebase login
firebase use --add            # alege proiectul
npm run deploy                # build + hosting + firestore rules
```

## Adăugare locuri (din septembrie 2026)
- **Caută direct**: „Adaugă” → scrii 2–3 litere; caut pe OpenStreetMap (Photon, fără cheie; Nominatim ca rezervă) în jurul Barcelonei și în recomandările noastre.
- **Ziua se pune singură**: locul intră în ziua în care sunteți deja prin zonă, imediat după oprirea cea mai apropiată (ora = sfârșitul opririi + drumul pe jos). Peste 3 km de orice oprire → „Dorite”.
- **Pe hartă**: ține apăsat pe orice punct sau „Pe hartă” → muți pinul → „Aici”; apar locurile din jurul pinului.
- **Din link**: Google Maps (nume + coordonate), TikTok/YouTube (descrierea, când se poate), Instagram (linkul rămâne pe card; numele îl scrieți voi, Instagram nu dă descrierea fără cont).

## Programul zilelor (planificatorul)

- Fiecare loc are un timp minim (`minStay` sau după categorie); drumul dintre locuri e socotit din distanță (pe jos, metrou/taxi, tren). Semaforul zilei: verde = lejer, galben = plin, roșu = ceva nu merge.
- În `public/data.js`:
  - `closed: ['sun']` = zilele în care locul e închis (avertisment dacă e pus atunci, iar sugestiile ocolesc ziua).
  - `fixed: true` = nu se poate sări sau muta (trenul, bagajele, zborul).
  - `endsDay: true` = după el nu se mai pune nimic (zborul de luni, 20:20).
  - `legIn` = drumul spre loc, dacă e altfel decât cel calculat (taxiul spre aeroport).
  - `arrive` = unde se termină locul, dacă e altundeva (trenul ajunge la Sants, plimbarea pe plajă în Barceloneta).
  - `day: 'pool'` + `poolNote` = rezerve, la „Locuri dorite”.
- Din aplicație orice loc se poate muta în altă zi sau oră („Mută”); mutările la locurile din program se salvează în `state/shared` (`days`, `times`).

## Traseul zilei în Google Maps
Google Maps acceptă cel mult 3 opriri intermediare într-un link deschis din browserul telefonului și niciuna în modul „transport public”. De aceea ziua se împarte în bucăți pe jos de maximum 5 opriri, iar drumurile lungi apar separat, cu metroul.

## Design
Stil Google Flights: Google Sans (OFL, găzduit local), alb, linii fine, albastru Google, fotografii mari 16:9 în cronologie, timpul de mers între opriri, animații la derulare.

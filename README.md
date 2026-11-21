# AI a hétköznapokban – interaktív kurzus

Magyar nyelvű, önálló tanulásra épülő kurzusweboldal kezdő–haladó felnőtteknek: modulokra és fejezetekre bontva (a pontos számot az oldal maga számolja a `data/` mappából), mini kvízekkel, modulkvízekkel, gyakorlatokkal, interaktív elemekkel és nyomtatható oklevéllel.

- Tiszta HTML + CSS + JavaScript, **build-eszköz nélkül** – GitHub Pages-en közvetlenül fut.
- Nincs saját szerver. (Opcionális: a fejezet végi visszajelzések Firebase Firestore-ba mennek, lásd `FIREBASE-BEALLITAS.md`.) A haladás a böngésző `localStorage`-ében mentődik (`aikurzus.v1.profil`, `aikurzus.v1.haladas`, `aikurzus.v1.beallitasok`), exportálható és importálható.
- Minden szöveg JSON-ban van, egy közös sablon rendereli – a tartalom kód nélkül is javítható.

---

## 1. Futtatás a saját gépeden

A tartalom JSON-fájlokból töltődik be, ezért az `index.html`-t **nem lehet** egyszerű dupla kattintással (`file://`) megnyitni – a böngésző ezt biztonsági okból tiltja. Kell egy helyi webszerver, ami Macen és Linuxon gyárilag elérhető:

```bash
cd ai-kurzus
python3 -m http.server 8000
```

Majd nyisd meg: <http://localhost:8000>

Windowson ugyanez működik, ha telepítve van a Python (`py -m http.server 8000`). Leállítás: `Ctrl + C`.

**Fejlesztői mód:** <http://localhost:8000/?dev=1> – a média-helyőrzőkön megjelenik a generálási leírás és a fájlnév.

---

## 2. Közzététel GitHub Pages-en – lépésről lépésre

1. Regisztrálj vagy jelentkezz be a <https://github.com> oldalon. Kapcsold be a kétlépcsős azonosítást.
2. Jobb felül **+ › New repository**. Név például: `ai-kurzus`. Láthatóság: **Public** (nyilvános tárolóval ingyenes a Pages – 2026. novemberi állapot, ellenőrizd a GitHub oldalán). **Create repository**.
3. A tároló oldalán: **Add file › Upload files**. Húzd be az `ai-kurzus` mappa **tartalmát** (nem magát a mappát!), vagyis az `index.html`-t és a `css`, `js`, `data`, `assets`, `modulok`, `tools` mappákat, valamint a `README.md`, `MEDIA-TODO.md` és `.nojekyll` fájlokat. **Commit changes**.
   - Ha a böngésző nem engedi mappák behúzását, használd a GitHub Desktop alkalmazást, vagy parancssorból:
     ```bash
     cd ai-kurzus
     git init && git add . && git commit -m "AI kurzus"
     git branch -M main
     git remote add origin https://github.com/FELHASZNALONEV/ai-kurzus.git
     git push -u origin main
     ```
4. **Settings › Pages**. A *Build and deployment* résznél: Source = **Deploy from a branch**, Branch = **main**, mappa = **/ (root)**, **Save**.
5. 1–2 perc múlva felül megjelenik a cím: `https://FELHASZNALONEV.github.io/ai-kurzus/`. Nyisd meg gépen és telefonon is.
6. Frissítés: töltsd fel újra a módosított fájlokat ugyanoda (vagy `git push`). Pár perc múlva élesedik.

A `.nojekyll` üres fájl azt jelzi a GitHubnak, hogy ne alakítsa át a fájlokat – maradjon a tároló gyökerében.

> A haladás a látogató saját böngészőjében tárolódik, a GitHubra semmilyen tanulói adat nem kerül.

---

## 3. Mappaszerkezet

```
index.html               egyetlen belépési pont (hash-alapú útvonalak: #/, #/m/m01, #/m/m01/f/1.2 …)
css/base.css             színtokenek, világos/sötét téma, betűméret-skála, tipográfia
css/components.css       kártyák, gombok, kvíz, interaktív elemek, oklevél
css/player.css           videólejátszó
js/app.js                betöltés, útválasztás, zárolási őr, közös keret
js/store.js              localStorage (verziózott kulcsok), memóriás tartalék, export/import, törlés
js/progress.js           zárolás és százalékszámítás – minden nézet ezt használja
js/data.js               a JSON-ok betöltése
js/util.js               segédfüggvények, ikonok, szövegjelölés, másolás
js/views/                főképernyő, bevezető+profil, modul, fejezet, modulzáró, oklevél, beállítások, súgó, szószedet
js/components/           videólejátszó, kvíz, média+helyőrző, interaktív elemek, SVG-ábrák
data/kurzus.json         a modulok sorrendje, címe, ideje, és a záró „következő lépések”
data/tartalom/m01…m11.json, zp.json   a modulok teljes tartalma (fejezetek, szövegek, kvízek, gyakorlatok)
data/media.json          médiamanifeszt (képek, videók, generálási promptok, forgatókönyvek)
data/szoszedet.json      szószedet (a szövegben [[azonosító]] jelöli a szakszavakat)
assets/img|video|captions/   ide kerülnek az elkészült médiafájlok
modulok/README.md        megjegyzés: a fejezetek a közös sablonból renderelődnek
tools/media_todo.py      a MEDIA-TODO.md generátora
MEDIA-TODO.md            az összes hiányzó média, kész leírásokkal
```

---

## 4. A tartalom bővítése és javítása

Minden szöveg a `data/tartalom/*.json` fájlokban van. Egy fejezet felépítése:

```json
{
  "id": "1.1", "cim": "…", "ido": 9, "hero": "img-1-1",
  "celok": ["2–3 pont: ezt fogod tudni a végén"],
  "szakaszok": [{ "cim": "…", "blokkok": ["bekezdés", { "lista": ["…"] }, { "tipp": "…" }, { "vigyazat": "…" },
                 { "szamozott": ["…"] }, { "pelda": ["…"], "cim": "…" }, { "prompt": "másolható szöveg", "cim": "…" },
                 { "tabla": [["fejléc", "…"], ["sor", "…"]] }, { "abra": "bizalom-matrix", "felirat": "…" }] }],
  "video": { "media": "vid-1-2", "kotelezo": true, "bevezeto": "…" },
  "interaktiv": { "tipus": "valasztos", "…": "…" },
  "gyakorlat": { "cim": "…", "ido": 8, "lepesek": ["…"], "promptok": [{ "cim": "…", "szoveg": "…" }], "javaslat": { "levelezes": "…" } },
  "kviz": [{ "k": "kérdés", "v": ["A", "B", "C"], "h": 1, "m": "magyarázat" }],
  "osszefoglalo": ["1. sor", "2. sor", "3. sor"]
}
```

- **Szövegjelölés:** `**félkövér**`, `*dőlt*`, `` `kód` ``, `[[token]]` vagy `[[token|megjelenő szó]]` (szakszó buborékkal – az azonosítónak szerepelnie kell a `szoszedet.json`-ban). Kvízkérdésben és -válaszban ne használj `[[…]]`-t (gomb nem lehet gombban).
- **Kvíz:** `h` a helyes válasz sorszáma 0-tól. A továbblépéshez 60% kell, korlátlan újrapróbálkozással.
- **Interaktív típusok** (`js/components/interactive.js`): `igazkitalalt`, `kovetkezoszo`, `epito` (prompt-, kép-, jelenet-, oldal-leíró, sablon- és egyedi utasítás-építő), `elotteutana`, `valasztos` (minden „melyiket választanád” jellegű feladat), `allitas`, `lepesek` (telefon-mockup), `ertekelo`, `ellenorzolista`, `agens`, `letoltes`, `osszevetes`, `otletlista`. Egy fejezetben tömbként több is megadható.
- **Személyre szabás:** a `gyakorlat.javaslat` (vagy modulszinten a `javaslat`) a profilban megadott célok (`levelezes`, `dokumentumok`, `kutatas`, `kreativ`, `tanulas`) szerint mutat egy „Neked javasolt gyakorlat” dobozt.
- **Új modul:** készíts egy új `data/tartalom/mXX.json`-t, és vedd fel a `data/kurzus.json` `modulok` listájába a kívánt helyre. A megjelenő sorszám a lista sorrendjéből, az idő a fejezetek perceiből számolódik; az azonosítók (`m01`, `1.1`) a mentett haladás kulcsai, ezért ne változtasd őket. Szövegben a modulra és a fejezetre `{{mod:m09}}` és `{{fej:9.3}}` jelöléssel hivatkozz: betöltéskor a megjelenő sorszám kerül a helyére. A `"halado": true` csak „Haladó” jelzést ad.
- A JSON-ok érvényességét így ellenőrizheted: `python3 -m json.tool data/tartalom/m01.json > /dev/null`.

**Figyelem a haladásnál:** a mentett haladás a fejezetazonosítókhoz (`"1.1"` stb.) kötődik. Meglévő azonosítót ne nevezz át; új fejezetet a modul végére érdemes tenni. Ha a tárolás szerkezete változik, emeld a kulcsok verzióját (`aikurzus.v2.*` a `js/store.js`-ben).

---

## 5. A média cseréje és pótlása

Jelenleg **minden kép és videó helyőrzővel jelenik meg** – valódi fotót és AI-videót nem hamisítottunk. A helyőrző ugyanakkora keretben áll, mint a végleges fájl, így az elrendezés nem ugrik.

1. Nyisd meg a `MEDIA-TODO.md`-t: minden elemhez ott a fájlnév, méret, alt szöveg, magyar leírás, angol generálási prompt, illetve a videók teljes forgatókönyve (jelenetek + narráció, ami egyben a felirat szövege).
2. Tedd a kész fájlt a megfelelő mappába:
   - kép: `assets/img/NÉV.webp` **és** `assets/img/NÉV.jpg` (ha csak a webp hiányzik, automatikusan a jpg töltődik)
   - videó: `assets/video/NÉV.mp4`, felirat: `assets/captions/NÉV.hu.vtt`, poszter: `assets/img/NÉV-poster.jpg`
3. A `data/media.json`-ban állítsd az elem `"statusz"` mezőjét `"kesz"`-re.
4. Futtasd: `python3 tools/media_todo.py` – frissül a lista, és figyelmeztet, ha egy „kész” elem fájlja hiányzik.

**Videók és a fejezetzárás:** a `kotelezo: true` videót legalább 90%-ig ténylegesen meg kell nézni (a tekerés nem számít – a lejátszó a valóban lejátszott szakaszokat összegzi). Ha a videó még `hianyzik`, vagy nem tölthető be, a feltétel automatikusan teljesül, a helyén helyőrző és a forgatókönyv szövege (átirat) jelenik meg.

---

## 6. Hozott döntések (ahol a leírás nem volt egyértelmű)

- **Egyetlen oldal hash-útvonalakkal.** A `/modulok/mXX` mappák helyett a leírás által ajánlott „egy sablon + JSON tartalom” megoldás készült; a `modulok/` mappa csak egy magyarázó README-t tartalmaz. Így a tartalom egy helyen van, és GitHub Pages-en extra beállítás nélkül működik.
- **Tartalom modulonként külön JSON-ban.** A `data/kurzus.json` a sorrendet és a modulok adatait tartalmazza, a fejezetek szövege a `data/tartalom/` fájlokban van – így egy-egy modul könnyebben szerkeszthető.
- **Nincs zárolás.** Minden modul és fejezet megnyitható bármikor, közvetlen linkről is. A sorrend csak ajánlás (a „Folytatás” gomb és az „Ajánlott következő” jelzés). A lezárási feltételek (görgetés, gyakorlat, kvíz 60%) csak a haladás számolását érintik. Belépés nélkül megnyitott mélylink belépés után oda viszi vissza az embert.
- **Olvasás feltétele.** A „legalább 90%-os görgetés” úgy teljesül, hogy a tanuló legörget a fejezet összefoglalójának végéig (ott egy láthatatlan jelző figyeli).
- **Százalék.** Fejezet = a teljesített lépések aránya (olvasás, kötelező videó, gyakorlat, kvíz, lezárás) – lezáráskor 100%. Modul = a fejezetek átlaga + a modulzáró mint egy további tétel (lezáráskor 100%). Kurzus = a (nem kihagyott) modulok átlaga, a záró projekttel együtt.
- **Gyakorlatok ideje.** A modulok gyakorlatai legfeljebb 10 percesek. A záró projekt megvalósítása (Z.2) természeténél fogva hosszabb (kb. 45 perc), ez részletekben is elvégezhető.
- **Eszközök összehasonlítása (9. modul).** Árak nem szerepelnek, a funkciók általánosan és „2026. novemberi állapot – ellenőrizd a hivatalos oldalon” jelzéssel. A 9.2 gyakorló válaszai kitalált, betűjeles (A/B/C) szemléltetések, nem valódi eszközök kimenetei; a valódi összevetést a tanuló maga végzi el.
- **Ábrák.** Ahol lehetett, saját SVG-ábra vagy CSS-animáció készült (kurzus-felépítés, következő szó jóslása, a jó kérés öt eleme, bizalmi mátrix, keresés vs. beszélgetés, kontextusablak, ágens-ciklus, telefon-mockupok, szimulált ágens-munkamenet).
- **Oklevél (`#/oklevel`).** Csak 100%-nál: minden modul lezárva és minden fejezet kész. A teljesítés dátuma (`completedAt`) az első 100%-nál mentődik, és bővülő kurzusnál is érvényes marad. A „Név az oklevélen” külön mentődik (`oklevelNev`). Nyomtatás: böngészőből, A4 fekvő, külső szolgáltatás nélkül. Önellenőrzésen alapuló igazolás, nem hivatalos képesítés.
- **Betűtípus.** Source Sans 3 a Google Fonts-ról; ha nem érhető el (offline), a rendszer sans-serif betűje lép a helyére.

---

## 7. Ellenőrzés

### Elvégzett automatikus ellenőrzés

A fejlesztés során a macOS beépített JavaScriptCore motorjával, utánzott böngészőkörnyezetben futott egy teszt (245 ellenőrzés, mind sikeres): zárolás és átirányítás zárolt URL-re, százalékok egyezése a nézetek között, mentés és visszaolvasás, export (kód és JSON) – törlés – import, hibás import elutasítása, minden nézet hiba nélküli kirajzolása, minden szakszó és médiahivatkozás feloldható, kvízindexek, és a tartalmi szabályok (3 soros összefoglalók, 3–5 kérdéses fejezetkvízek, 6–8 kérdéses modulkvízek, ≤10 perces gyakorlatok).

### Böngészőben kézzel ellenőrizendő (a leírás 11. pontja)

Valódi böngészőben ezeket érdemes végigpróbálni:

- [ ] Nincs zárolás: a `#/m/m02` vagy `#/m/m12/f/12.7` cím beírása belépés után közvetlenül megnyitja az oldalt.
- [ ] Haladás: egy fejezet lezárása után frissítés és a böngésző újranyitása után is megmarad.
- [ ] Százalékok: a főképernyő, a modul oldal és a fejezet fejléce ugyanazt mutatja.
- [ ] Videó: tegyél be egy próbavideót (bármilyen mp4-et, a `vid-1-2` nevén, és állítsd „kesz”-re), és próbáld ki a ±10 mp gombokat és a nyilakat, az idővonalat, a sebességet, a feliratot, a teljes képernyőt, és az újranyitáskori „Folytatás innen” ajánlatot. Előretekeréssel ne teljesüljön a 90%.
- [ ] Hiányzó média: a helyőrző jelenik meg, és a fejezet lezárható.
- [ ] Mobilon és extra nagy betűmérettel (Beállítások) sem törik az elrendezés.
- [ ] Export → Haladás törlése → Import visszaállítja a haladást.
- [ ] Sötét téma, billentyűzetes használat (Tab, Enter, Esc a szakszó-buborékon).


---

## 9. Ellenőrző scriptek és közzététel előtt

```bash
python3 tools/check_numbers.py   # kézzel beírt „N modul / N óra” minták keresése (a számokat a getCourseStats() adja)
python3 tools/media_check.py     # melyik képhez / videóhoz hiányzik a fájl (hiányzó fájl az oldalon nem látszik)
python3 tools/media_todo.py      # MEDIA-TODO.md frissítése
python3 tools/stamp.py           # gyorsítótár-verzió (?v=kivonat) a css/js hivatkozásokra – közzététel előtt futtasd
```

- **Haladás formátuma:** az exportált JSON `verzio: 2`. A régi (1-es) mentések importja és a böngészőben tárolt régi haladás automatikusan átalakul (`kurzusKesz` → `completedAt`, a „kihagyva” jelölés megszűnik); adat nem vész el.
- **Szöveges hivatkozások:** `{{mod:m09}}` / `{{fej:9.3}}` – a megjelenő sorszám a modulok sorrendjéből számolódik.
- **Összehasonlító (ChatGPT / Claude):** a mintaválaszok a `data/osszehasonlitas.json` fájlba kerülnek (üresen is hibátlan).
- **Lépés-ábrák:** `data/lepesabrak.json`; a fejezetben `{ "lepesabra": "azonosító" }` blokkal hívhatók.
- **Ne töltsd fel** a közzétett oldalra: `media-prompts/`, `Pictures/`, `BRIEF.md`, `valtoztatasok.md`.


---

## 8. Szintfelmérő, visszajelzés, kezelő, tanúsítvány

- **Szintfelmérő** (`#/szintfelmeres`, `js/assess.js`): első megnyitáskor jelenik meg („Kihagyom” gombbal), a Beállításokban „Szintfelmérő újra”. Csak az ajánlott sorrendet és az „Ajánlott következő” jelzést módosítja, semmit nem zár le. Mentés: `haladas.szintfelmeres` (a haladás exportjában is benne van). Adatverzió: 3, a régi mentések migrálódnak, mezőt nem töröltünk.
- **Visszajelzés** (`js/feedback.js`, `js/components/feedback.js`): minden fejezet végén. Helyi sor a haladásban, Firestore REST-tel küldi, hálózati hiba után újrapróbál. Beállítás: `FIREBASE-BEALLITAS.md`, szabályok: `firestore.rules`.
- **Kezelő** (`#/kezelo`, rejtett, nincs rá link): Firebase e-mail/jelszó belépés után modul → fejezet bontású összesítés, szűrők, olvasott/kezelve jelölő. `#/kezelo/oklevel`: tanúsítvány előnézete (nem ment semmit).
- **Tanúsítvány**: csak 100%-os haladásnál; a „100%-ban teljesítve” sor a számított értékből jön. A készítő neve csak akkor jelenik meg, ha a `data/kurzus.json`-ban van `"keszito"` mező.

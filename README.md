# AI a hétköznapokban – interaktív kurzus

Magyar nyelvű, önálló tanulásra épülő kurzusweboldal kezdő–haladó felnőtteknek: 11 modul, 35 fejezet és egy záró projekt (3 fejezet), mini kvízekkel, modulkvízekkel, gyakorlatokkal, interaktív elemekkel és nyomtatható oklevéllel.

- Tiszta HTML + CSS + JavaScript, **build-eszköz nélkül** – GitHub Pages-en közvetlenül fut.
- Nincs bejelentkezés, szerver vagy adatbázis. A haladás a böngésző `localStorage`-ében mentődik (`aikurzus.v1.profil`, `aikurzus.v1.haladas`, `aikurzus.v1.beallitasok`), exportálható és importálható.
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
- **Új modul:** készíts egy új `data/tartalom/mXX.json`-t, és vedd fel a `data/kurzus.json` `modulok` listájába a kívánt helyre. Az `"opcionalis": true` modul kihagyható.
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
- **Haladó modulok (10–11).** Sorrend szerint zároltak, de „nem kötelezők”: a modul oldalán kihagyhatók. A kihagyott modul nem számít bele a százalékba és a „X / Y modul kész” számlálóba; később is elvégezhető, és lezárva beleszámít. A záró projekt a kihagyás után is megnyílik.
- **Olvasás feltétele.** A „legalább 90%-os görgetés” úgy teljesül, hogy a tanuló legörget a fejezet összefoglalójának végéig (ott egy láthatatlan jelző figyeli).
- **Százalék.** Fejezet = a teljesített lépések aránya (olvasás, kötelező videó, gyakorlat, kvíz, lezárás) – lezáráskor 100%. Modul = a fejezetek átlaga + a modulzáró mint egy további tétel (lezáráskor 100%). Kurzus = a (nem kihagyott) modulok átlaga, a záró projekttel együtt 12 modul.
- **Gyakorlatok ideje.** A modulok gyakorlatai legfeljebb 10 percesek. A záró projekt megvalósítása (Z.2) természeténél fogva hosszabb (kb. 45 perc), ez részletekben is elvégezhető.
- **Eszközök összehasonlítása (9. modul).** Árak nem szerepelnek, a funkciók általánosan és „2026. novemberi állapot – ellenőrizd a hivatalos oldalon” jelzéssel. A 9.2 gyakorló válaszai kitalált, betűjeles (A/B/C) szemléltetések, nem valódi eszközök kimenetei; a valódi összevetést a tanuló maga végzi el.
- **Ábrák.** Ahol lehetett, saját SVG-ábra vagy CSS-animáció készült (kurzus-felépítés, következő szó jóslása, a jó kérés öt eleme, bizalmi mátrix, keresés vs. beszélgetés, kontextusablak, ágens-ciklus, telefon-mockupok, szimulált ágens-munkamenet).
- **Oklevél.** Önellenőrzésen alapuló igazolás, nem hivatalos képesítés – ezt az oklevél maga is jelzi. Nyomtatható, vagy a nyomtatási ablakban PDF-be menthető.
- **Betűtípus.** Source Sans 3 a Google Fonts-ról; ha nem érhető el (offline), a rendszer sans-serif betűje lép a helyére.

---

## 7. Ellenőrzés

### Elvégzett automatikus ellenőrzés

A fejlesztés során a macOS beépített JavaScriptCore motorjával, utánzott böngészőkörnyezetben futott egy teszt (245 ellenőrzés, mind sikeres): zárolás és átirányítás zárolt URL-re, százalékok egyezése a nézetek között, mentés és visszaolvasás, export (kód és JSON) – törlés – import, hibás import elutasítása, minden nézet hiba nélküli kirajzolása, minden szakszó és médiahivatkozás feloldható, kvízindexek, és a tartalmi szabályok (3 soros összefoglalók, 3–5 kérdéses fejezetkvízek, 6–8 kérdéses modulkvízek, ≤10 perces gyakorlatok).

### Böngészőben kézzel ellenőrizendő (a leírás 11. pontja)

Valódi böngészőben ezeket érdemes végigpróbálni:

- [ ] Zárolás: a `#/m/m02` vagy `#/m/m01/f/1.2` cím beírása kezdéskor visszavisz, rövid magyarázattal.
- [ ] Haladás: egy fejezet lezárása után frissítés és a böngésző újranyitása után is megmarad.
- [ ] Százalékok: a főképernyő, a modul oldal és a fejezet fejléce ugyanazt mutatja.
- [ ] Videó: tegyél be egy próbavideót (bármilyen mp4-et, a `vid-1-2` nevén, és állítsd „kesz”-re), és próbáld ki a ±10 mp gombokat és a nyilakat, az idővonalat, a sebességet, a feliratot, a teljes képernyőt, és az újranyitáskori „Folytatás innen” ajánlatot. Előretekeréssel ne teljesüljön a 90%.
- [ ] Hiányzó média: a helyőrző jelenik meg, és a fejezet lezárható.
- [ ] Mobilon és extra nagy betűmérettel (Beállítások) sem törik az elrendezés.
- [ ] Export → Haladás törlése → Import visszaállítja a haladást.
- [ ] Sötét téma, billentyűzetes használat (Tab, Enter, Esc a szakszó-buborékon).

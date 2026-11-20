# Hiányzó média – teendőlista

> Automatikusan generálva a `data/media.json` alapján (2026-11-20). Ne szerkeszd kézzel – futtasd újra: `python3 tools/media_todo.py`.

Összesen **57** elem, ebből **49 kész**, **8 hiányzik** (8 kép, 0 videó).

## Hogyan pótolj egy elemet?

1. Készítsd el a képet vagy videót az alábbi leírás alapján.
2. Képnél mentsd el **webp** és **jpg** formátumban is ugyanazzal a névvel (pl. `m01-1-1-hero.webp` és `m01-1-1-hero.jpg`) az `assets/img/` mappába. Hero: 1600×900, kártya: 800×600.
3. Videónál az mp4 az `assets/video/`, a `.vtt` felirat az `assets/captions/`, a poszterkép (jpg, 1280×720) az `assets/img/` mappába kerül.
4. A `data/media.json`-ban az elem `statusz` mezőjét írd át `"kesz"`-re.
5. Futtasd újra ezt a szkriptet. Az oldal azonnal a valódi fájlt mutatja; ha a fájl mégsem tölthető be, automatikusan helyőrző jelenik meg.

## ⚠ Figyelmeztetések

- `vid-2-2` státusza „kesz”, de hiányzik a fájl: `assets/captions/m02-2-2.hu.vtt`
- `vid-2-2` státusza „kesz”, de hiányzik a fájl: `assets/img/m02-2-2-poster.jpg`
- `vid-3-2` státusza „kesz”, de hiányzik a fájl: `assets/captions/m03-3-2.hu.vtt`
- `vid-3-2` státusza „kesz”, de hiányzik a fájl: `assets/img/m03-3-2-poster.jpg`
- `vid-4-2` státusza „kesz”, de hiányzik a fájl: `assets/captions/m04-4-2.hu.vtt`
- `vid-4-2` státusza „kesz”, de hiányzik a fájl: `assets/img/m04-4-2-poster.jpg`
- `vid-5-2` státusza „kesz”, de hiányzik a fájl: `assets/captions/m05-5-2.hu.vtt`
- `vid-5-2` státusza „kesz”, de hiányzik a fájl: `assets/img/m05-5-2-poster.jpg`
- `vid-6-2` státusza „kesz”, de hiányzik a fájl: `assets/captions/m06-6-2.hu.vtt`
- `vid-6-2` státusza „kesz”, de hiányzik a fájl: `assets/img/m06-6-2-poster.jpg`
- `vid-7-2` státusza „kesz”, de hiányzik a fájl: `assets/captions/m07-7-2.hu.vtt`
- `vid-7-2` státusza „kesz”, de hiányzik a fájl: `assets/img/m07-7-2-poster.jpg`
- `vid-8-2` státusza „kesz”, de hiányzik a fájl: `assets/captions/m08-8-2.hu.vtt`
- `vid-8-2` státusza „kesz”, de hiányzik a fájl: `assets/img/m08-8-2-poster.jpg`
- `vid-9-2` státusza „kesz”, de hiányzik a fájl: `assets/captions/m09-9-2.hu.vtt`
- `vid-9-2` státusza „kesz”, de hiányzik a fájl: `assets/img/m09-9-2-poster.jpg`
- `vid-10-3` státusza „kesz”, de hiányzik a fájl: `assets/captions/m10-10-3.hu.vtt`
- `vid-10-3` státusza „kesz”, de hiányzik a fájl: `assets/img/m10-10-3-poster.jpg`
- `vid-11-2` státusza „kesz”, de hiányzik a fájl: `assets/captions/m11-11-2.hu.vtt`
- `vid-11-2` státusza „kesz”, de hiányzik a fájl: `assets/img/m11-11-2-poster.jpg`

## Képek (8)

Stílus mindenhol: valósághű, természetes fény, hétköznapi helyzet, nem „AI-hatású” (természetes kezek, nincs csillogó digitális művészet), nincs olvasható márkajelzés vagy szöveg.

### `img-4-4` – 4.4 fejezet – hero kép

- **Fájl:** `m04-4-4-hero.webp` (+ `.jpg` tartalék) · **méret:** 1600×900 · **mappa:** `assets/img/`
- **Alt szöveg:** Egy férfi a konyhában számológéppel ellenőriz egy számot, miközben a telefonján egy válasz látszik.
- **Leírás (HU):** Valósághű fotó: ötvenes éveiben járó férfi egy konyhaasztalnál ül, egyik kezében számológép, a másikban a telefonja, és megfontoltan, kissé mosolyogva ellenőrzi a látottakat. Természetes fény, hétköznapi, nyugodt hangulat, a kijelzőn nincs olvasható szöveg.
- **Prompt (EN):**

  ```
  Photorealistic, natural-light photo of a man in his fifties sitting at a kitchen table, holding a calculator in one hand and a phone in the other, double-checking something with a thoughtful, slightly smiling expression. Everyday, calm mood, 35mm lens, shallow depth of field, true-to-life skin texture and natural hands, no readable screen content, no text, no brand marks. 16:9.
  ```

### `img-12-1` – 12.1 fejezet – hero kép

- **Fájl:** `m12-12-1-hero.webp` (+ `.jpg` tartalék) · **méret:** 1600×900 · **mappa:** `assets/img/`
- **Alt szöveg:** Egy ember két laptop előtt ül, az egyiken ismerős, a másikon új csevegőfelület; kíváncsian, nyugodtan néz.
- **Leírás (HU):** Valósághű fotó: Egy ember két laptop előtt ül, az egyiken ismerős, a másikon új csevegőfelület; kíváncsian, nyugodtan néz. Természetes fény, hétköznapi, nyugodt hangulat, nincs olvasható szöveg vagy márkajel.
- **Prompt (EN):**

  ```
  Photorealistic, natural-light photo: a photorealistic photo of a middle-aged person at a desk with two laptops side by side, comparing two generic chat windows with calm curiosity. Everyday, calm mood, 35mm lens, shallow depth of field, true-to-life skin texture and natural hands, no readable text, no brand marks. 16:9.
  ```

### `img-12-2` – 12.2 fejezet – hero kép

- **Fájl:** `m12-12-2-hero.webp` (+ `.jpg` tartalék) · **méret:** 1600×900 · **mappa:** `assets/img/`
- **Alt szöveg:** Két telefon egymás mellett az asztalon, mindkét kijelzőn csevegőablak.
- **Leírás (HU):** Valósághű fotó: Két telefon egymás mellett az asztalon, mindkét kijelzőn csevegőablak. Természetes fény, hétköznapi, nyugodt hangulat, nincs olvasható szöveg vagy márkajel.
- **Prompt (EN):**

  ```
  Photorealistic, natural-light photo: two smartphones side by side on a wooden table, each showing a blurred generic chat window, a hand pointing at one of them. Everyday, calm mood, 35mm lens, shallow depth of field, true-to-life skin texture and natural hands, no readable text, no brand marks. 16:9.
  ```

### `img-12-3` – 12.3 fejezet – hero kép

- **Fájl:** `m12-12-3-hero.webp` (+ `.jpg` tartalék) · **méret:** 1600×900 · **mappa:** `assets/img/`
- **Alt szöveg:** Rendezett íróasztal mappákkal, jegyzetfüzettel és laptoppal.
- **Leírás (HU):** Valósághű fotó: Rendezett íróasztal mappákkal, jegyzetfüzettel és laptoppal. Természetes fény, hétköznapi, nyugodt hangulat, nincs olvasható szöveg vagy márkajel.
- **Prompt (EN):**

  ```
  Photorealistic, natural-light photo: a tidy desk with labeled paper folders, a notebook and an open laptop with a blurred generic document list on screen. Everyday, calm mood, 35mm lens, shallow depth of field, true-to-life skin texture and natural hands, no readable text, no brand marks. 16:9.
  ```

### `img-12-4` – 12.4 fejezet – hero kép

- **Fájl:** `m12-12-4-hero.webp` (+ `.jpg` tartalék) · **méret:** 1600×900 · **mappa:** `assets/img/`
- **Alt szöveg:** Egy nő kinyomtatott ellenőrző listát pipál ki a laptop mellett.
- **Leírás (HU):** Valósághű fotó: Egy nő kinyomtatott ellenőrző listát pipál ki a laptop mellett. Természetes fény, hétköznapi, nyugodt hangulat, nincs olvasható szöveg vagy márkajel.
- **Prompt (EN):**

  ```
  Photorealistic, natural-light photo: a woman ticking items on a printed checklist next to an open laptop showing a blurred document, bright kitchen. Everyday, calm mood, 35mm lens, shallow depth of field, true-to-life skin texture and natural hands, no readable text, no brand marks. 16:9.
  ```

### `img-12-5` – 12.5 fejezet – hero kép

- **Fájl:** `m12-12-5-hero.webp` (+ `.jpg` tartalék) · **méret:** 1600×900 · **mappa:** `assets/img/`
- **Alt szöveg:** Papírok és egy telefon, amivel dokumentumot fényképeznek.
- **Leírás (HU):** Valósághű fotó: Papírok és egy telefon, amivel dokumentumot fényképeznek. Természetes fény, hétköznapi, nyugodt hangulat, nincs olvasható szöveg vagy márkajel.
- **Prompt (EN):**

  ```
  Photorealistic, natural-light photo: hands holding a phone above a paper document on a table, scanning it, soft natural light. Everyday, calm mood, 35mm lens, shallow depth of field, true-to-life skin texture and natural hands, no readable text, no brand marks. 16:9.
  ```

### `img-12-6` – 12.6 fejezet – hero kép

- **Fájl:** `m12-12-6-hero.webp` (+ `.jpg` tartalék) · **méret:** 1600×900 · **mappa:** `assets/img/`
- **Alt szöveg:** Valaki költözködő dobozokat pakol, mellette laptop; az átállás szemléltetése.
- **Leírás (HU):** Valósághű fotó: Valaki költözködő dobozokat pakol, mellette laptop; az átállás szemléltetése. Természetes fény, hétköznapi, nyugodt hangulat, nincs olvasható szöveg vagy márkajel.
- **Prompt (EN):**

  ```
  Photorealistic, natural-light photo: a person packing a cardboard box next to a laptop on a table, a calm and tidy move-in atmosphere. Everyday, calm mood, 35mm lens, shallow depth of field, true-to-life skin texture and natural hands, no readable text, no brand marks. 16:9.
  ```

### `img-12-7` – 12.7 fejezet – hero kép

- **Fájl:** `m12-12-7-hero.webp` (+ `.jpg` tartalék) · **méret:** 1600×900 · **mappa:** `assets/img/`
- **Alt szöveg:** Egy férfi két ajtó között megy, nyugodtan mérlegel.
- **Leírás (HU):** Valósághű fotó: Egy férfi két ajtó között megy, nyugodtan mérlegel. Természetes fény, hétköznapi, nyugodt hangulat, nincs olvasható szöveg vagy márkajel.
- **Prompt (EN):**

  ```
  Photorealistic, natural-light photo: a man standing at a fork between two paths in a sunny park, thinking calmly, no signs or text. Everyday, calm mood, 35mm lens, shallow depth of field, true-to-life skin texture and natural hands, no readable text, no brand marks. 16:9.
  ```

## Videók (0)

Minden videó: 1–4 perc, nyugodt tempó, magyar narráció vagy felirat, mp4 (H.264) 1280×720, `.vtt` felirat magyarul. Hang nélkül is érthető legyen. Ha a videó AI-val generált részt tartalmaz, a képen jelölni kell.

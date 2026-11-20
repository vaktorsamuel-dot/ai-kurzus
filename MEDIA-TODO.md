# Hiányzó média – teendőlista

> Automatikusan generálva a `data/media.json` alapján (2026-11-20). Ne szerkeszd kézzel – futtasd újra: `python3 tools/media_todo.py`.

Összesen **49** elem, ebből **37 kész**, **12 hiányzik** (2 kép, 10 videó).

## Hogyan pótolj egy elemet?

1. Készítsd el a képet vagy videót az alábbi leírás alapján.
2. Képnél mentsd el **webp** és **jpg** formátumban is ugyanazzal a névvel (pl. `m01-1-1-hero.webp` és `m01-1-1-hero.jpg`) az `assets/img/` mappába. Hero: 1600×900, kártya: 800×600.
3. Videónál az mp4 az `assets/video/`, a `.vtt` felirat az `assets/captions/`, a poszterkép (jpg, 1280×720) az `assets/img/` mappába kerül.
4. A `data/media.json`-ban az elem `statusz` mezőjét írd át `"kesz"`-re.
5. Futtasd újra ezt a szkriptet. Az oldal azonnal a valódi fájlt mutatja; ha a fájl mégsem tölthető be, automatikusan helyőrző jelenik meg.

## Képek (2)

Stílus mindenhol: valósághű, természetes fény, hétköznapi helyzet, nem „AI-hatású” (természetes kezek, nincs csillogó digitális művészet), nincs olvasható márkajelzés vagy szöveg.

### `img-z-2` – Z.2 fejezet – hero kép

- **Fájl:** `zp-z-2-hero.webp` (+ `.jpg` tartalék) · **méret:** 1600×900 · **mappa:** `assets/img/`
- **Alt szöveg:** Egy férfi a laptopján dolgozik, mellette kinyomtatott ellenőrzőlista, amelyen már több pont ki van pipálva.
- **Leírás (HU):** Valósághű fotó: ötvenes férfi otthoni asztalnál laptopon dolgozik, mellette kinyomtatott ellenőrzőlista, több sora tollal kipipálva. Délutáni fény, koncentrált, nyugodt hangulat.
- **Prompt (EN):**

  ```
  Photorealistic photo of a man in his fifties working on a laptop at a home desk, a printed checklist beside him with several lines ticked off in pen. Afternoon light, focused and calm mood, realistic hands, no readable text or logos. 16:9.
  ```

### `img-z-3` – Z.3 fejezet – hero kép

- **Fájl:** `zp-z-3-hero.webp` (+ `.jpg` tartalék) · **méret:** 1600×900 · **mappa:** `assets/img/`
- **Alt szöveg:** Egy ember az ablak mellett ülve egy csésze kávéval a kezében elégedetten néz egy füzetet.
- **Leírás (HU):** Valósághű fotó: harmincas-negyvenes ember egy ablak melletti fotelben ül, kezében kávé, az ölében nyitott füzet; elégedett, elgondolkodó arckifejezés. Lágy reggeli fény.
- **Prompt (EN):**

  ```
  Photorealistic photo of a person in their late thirties sitting in an armchair by a window, holding a coffee cup, an open notebook on their lap, with a content, reflective expression. Soft morning light, authentic, realistic skin and hands. 16:9.
  ```

## Videók (10)

Minden videó: 1–4 perc, nyugodt tempó, magyar narráció vagy felirat, mp4 (H.264) 1280×720, `.vtt` felirat magyarul. Hang nélkül is érthető legyen. Ha a videó AI-val generált részt tartalmaz, a képen jelölni kell.

### `vid-2-2` – Ugyanaz a feladat rossz és jó kéréssel

- **Hova:** 2.2 fejezet – képernyőfelvétel
- **Fájlok:** `assets/video/m02-2-2-rossz-jo-keres.mp4`, `assets/captions/m02-2-2.hu.vtt`, poszter: `assets/img/m02-2-2-poster.jpg`
- **Hossz:** kb. 3 perc · **formátum:** mp4 (H.264), 1280×720, magyar felirat (.vtt) · **kötelező a fejezet lezárásához:** igen (90%)
- **Leírás:** Képernyőfelvétel egy AI-csevegőről, amelyben előbb egy rövid, majd egy részletes kérésre érkezik válasz.

**Forgatókönyv.** Képernyőfelvétel egy általános AI-csevegőfelületen (kitalált adatokkal, márka nélkül vagy semleges felülettel), nyugodt narrációval. Ugyanazt a feladatot (szabadságkérő e-mail) előbb rossz, majd jó kéréssel kérjük, és összehasonlítjuk.

| # | Kép / képernyő | Narráció (= felirat szövege) |
|---|---|---|
| 1 | Üres csevegőablak. | Nézzük meg ugyanazt a feladatot kétféleképpen. A cél: egy e-mail a vezetőnknek, hogy szabadságra mennénk. |
| 2 | Begépelve: „Írj e-mailt a főnökömnek, hogy szabadságra mennék.” Megjelenik a válasz. | Először röviden kérjük. A válasz udvarias, de általános: nincs benne dátum, a hangnem merev, és nem tudjuk elküldeni anélkül, hogy átírnánk. |
| 3 | A válasz hiányzó részei kiemelve: dátum, hangnem, átadás. | Mi hiányzott? A dátum, a viszonyunk a címzettel, és az, hogy mi lesz a munkánkkal. Ezt az AI nem tudhatta. |
| 4 | Új beszélgetés, begépelve a részletes kérés; a cél, háttér, formátum részek színnel jelölve. | Most adjuk meg a célt, a hátteret és a formátumot: tegeződünk, július 14–18., az ügyeket átadjuk, legfeljebb öt mondat, tárgysorral. |
| 5 | Megjelenik a második válasz. | A válasz konkrét, a hangnem illik a viszonyhoz, és előre megválaszolja azt a kérdést, ami a vezetőben felmerülne. |
| 6 | A két válasz egymás mellett. | A jobb kérés hosszabb volt, de egyetlen kör alatt elküldhető szöveget kaptunk. Ez a jó kérés lényege. |

### `vid-3-2` – Dokumentum feltöltése és összefoglalása

- **Hova:** 3.2 fejezet – képernyőfelvétel
- **Fájlok:** `assets/video/m03-3-2-dokumentum.mp4`, `assets/captions/m03-3-2.hu.vtt`, poszter: `assets/img/m03-3-2-poster.jpg`
- **Hossz:** kb. 3 perc · **formátum:** mp4 (H.264), 1280×720, magyar felirat (.vtt) · **kötelező a fejezet lezárásához:** igen (90%)
- **Leírás:** Képernyőfelvétel: a kitalált házirend feltöltése egy AI-csevegőbe, majd összefoglaló és határidő-táblázat kérése.

**Forgatókönyv.** Képernyőfelvétel a 3.2 fejezet kitalált házirendjével (minta-hazirend-napfeny-utca.txt). Feltöltés, kétféle összefoglaló kérése, és az ellenőrzés bemutatása az eredeti szövegben.

| # | Kép / képernyő | Narráció (= felirat szövege) |
|---|---|---|
| 1 | A letöltött mintafájl a gépen, majd egy AI-csevegő üres ablaka. | Ebben a videóban a fejezet kitalált házirendjét használjuk. Valós dokumentumnál előbb mindig gondold végig, van-e benne személyes adat. |
| 2 | Kattintás a csatolás ikonra, a fájl kiválasztása, megjelenik a csatolmány. | A legtöbb eszközben a gemkapocs vagy a plusz jel ikonnal tudsz fájlt csatolni. A feltöltött fájl a beszélgetés része lesz. |
| 3 | Begépelve: „Foglald össze 5 pontban egy új lakó számára.” Megjelenik az összefoglaló. | Először egy rövid, közérthető összefoglalót kérünk, megadva, kinek szól. |
| 4 | Begépelve a második kérés a határidőkről és összegekről; megjelenik egy táblázat. | Most célzottan a számokat kérjük táblázatban, és azt is, hogy ne tegyen hozzá semmit, ami nincs a szövegben. |
| 5 | Osztott képernyő: a táblázat és az eredeti dokumentum, a megfelelő sorok kiemelve. | És a legfontosabb lépés: ellenőrizzük az eredetiben. Megvan a 10-i befizetési határidő, a késedelmi díj, a kaució. És a felújítási kivétel? Ha kimaradt, kérjük meg, hogy pótolja. |
| 6 | Összefoglaló kártya: feltöltés, célzott kérés, ellenőrzés. | Három lépés: adatmentes feltöltés, célzott kérés, ellenőrzés az eredetiben. |

### `vid-4-2` – Forrás kérése és ellenőrzése

- **Hova:** 4.2 fejezet – képernyőfelvétel
- **Fájlok:** `assets/video/m04-4-2-forrasok.mp4`, `assets/captions/m04-4-2.hu.vtt`, poszter: `assets/img/m04-4-2-poster.jpg`
- **Hossz:** kb. 2–3 perc · **formátum:** mp4 (H.264), 1280×720, magyar felirat (.vtt) · **kötelező a fejezet lezárásához:** igen (90%)
- **Leírás:** Képernyőfelvétel: forráskérés egy AI-csevegőben, majd a megadott linkek megnyitása és értékelése.

**Forgatókönyv.** Képernyőfelvétel: egy hétköznapi kérdés (például burgonya tárolása) forráskérő sablonnal, a kapott források megnyitása és értékelése a négy kérdéssel. Egy nem létező vagy nem odaillő forrás bemutatása.

| # | Kép / képernyő | Narráció (= felirat szövege) |
|---|---|---|
| 1 | AI-csevegő, begépelve a forráskérő sablon egy hétköznapi kérdéssel. | Kérdezzünk meg valamit úgy, hogy minden állításhoz forrást kérünk, és megengedjük, hogy jelezze, ha valamit nem tud. |
| 2 | A válasz megjelenik, alatta három link. | Kaptunk egy választ és három forrást. Ez jó kiindulás, de még nem ellenőrzés. |
| 3 | Az első link megnyitva: egy hivatalos, dátumozott oldal; kiemelve a releváns bekezdés. | Nyissuk meg az elsőt. Létezik, egy szakmai szervezet oldala, tavalyi dátummal, és tényleg ezt írja. Ez jó forrás. |
| 4 | A második link: hibaoldal vagy egészen más témájú cikk. | A második link nem működik – vagy mást ír. Ez forrásnak nem számít, akármilyen hihetően hangzott. |
| 5 | Négy kérdés kártyán: Létezik? Ki írta? Mikor? Eredeti? | Minden forrásnál ugyanaz a négy kérdés: létezik, ki írta, mikor, és eredeti-e. Fél perc, és sok tévedéstől megóv. |

### `vid-5-2` – Fotó elemzése telefonon

- **Hova:** 5.2 fejezet – telefonos képernyőfelvétel
- **Fájlok:** `assets/video/m05-5-2-foto.mp4`, `assets/captions/m05-5-2.hu.vtt`, poszter: `assets/img/m05-5-2-poster.jpg`
- **Hossz:** kb. 2 perc · **formátum:** mp4 (H.264), 1280×720 (vagy álló 720×1280, fekvő keretben), magyar felirat (.vtt) · **kötelező a fejezet lezárásához:** igen (90%)
- **Leírás:** Telefonos képernyőfelvétel: egy kitalált étlap és egy kézírásos bevásárlólista lefényképezése és elemzése.

**Forgatókönyv.** Telefonos képernyőfelvétel egy AI-alkalmazásban, két kitalált anyaggal: egy nyomtatott étlap (kitalált étterem) és egy kézírásos bevásárlólista. Bemutatja a csatolást, a célzott kérdést és az ellenőrzést.

| # | Kép / képernyő | Narráció (= felirat szövege) |
|---|---|---|
| 1 | Telefon képernyője: AI-alkalmazás, új beszélgetés. | Nézzük meg, hogyan elemez az AI egy fotót. Két kitalált anyagot használunk: egy étlapot és egy kézzel írt bevásárlólistát. |
| 2 | Koppintás a plusz ikonra, kamera, az étlap lefényképezése. | A plusz vagy kamera ikonnal fotót készítünk. Egyenesen, jó fényben fényképezünk, hogy minden olvasható legyen. |
| 3 | Begépelve: „Fordítsd le angolra, és jelöld, melyik vegetáriánus.” Megjelenik a válasz. | A kép mellé mindig írjuk oda, mit szeretnénk. A fordítás mellett jelöli a vegetáriánus ételeket is – és azt, ahol bizonytalan. |
| 4 | Új fotó: kézírásos lista. Kérés: „Gépeld be, ahol nem tudod kiolvasni, jelöld [?]-lel.” | Kézírásnál kérjük, hogy jelölje, amit nem tud kiolvasni. Így nem talál ki szavakat. |
| 5 | Az eredeti lista és a begépelt változat egymás mellett, egy [?] kiemelve. | Összevetjük az eredetivel. Egy szót nem tudott kiolvasni – ezt mi javítjuk. Ennyi az egész: fotó, kérdés, ellenőrzés. |

### `vid-6-2` – Egy kép finomítása lépésről lépésre

- **Hova:** 6.2 fejezet – képernyőfelvétel
- **Fájlok:** `assets/video/m06-6-2-finomitas.mp4`, `assets/captions/m06-6-2.hu.vtt`, poszter: `assets/img/m06-6-2-poster.jpg`
- **Hossz:** kb. 3 perc · **formátum:** mp4 (H.264), 1280×720, magyar felirat (.vtt) · **kötelező a fejezet lezárásához:** igen (90%)
- **Leírás:** Képernyőfelvétel: egy kitalált jelenet képe három módosítási körben, majd három stílusban.

**Forgatókönyv.** Képernyőfelvétel egy képgenerálásra képes AI-eszközben. Kitalált téma (macska egy könyvhalmon az ablakpárkányon), emberek nélkül. Bemutatja a célzott módosítást, a stílusváltást és az újrakezdést javított leírással.

| # | Kép / képernyő | Narráció (= felirat szövege) |
|---|---|---|
| 1 | Begépelve a 6.1 mintaleírása, megjelenik az első kép. | Az első kép a fejezet mintaleírásából készült. Nem rossz, de a fény túl hideg, és a háttér zsúfolt. |
| 2 | Módosító kérés: melegebb fény, egyszerűbb háttér, a macska maradjon. Új kép. | Egyszerre két dolgot kérünk, és kimondjuk, hogy a macska maradjon. Az új kép melegebb és nyugodtabb. |
| 3 | Kérés: 9:16-os arány. Új, álló kép. | Ha telefonra kell, kérjük álló arányban. A téma középen marad. |
| 4 | A három stílus kérése, három kép egymás mellett. | Most ugyanazt kérjük háromféle stílusban. Ugyanaz a jelenet egészen más hangulatot ad fotóként, akvarellként és egyszerű grafikaként. |
| 5 | Egy elrontott kép (furcsa mancsok), majd kérés: írj teljes, javított leírást; új beszélgetés. | Ha valami nem sikerül, és több kör után sem javul, kérjünk egy teljes, javított leírást, és kezdjünk vele új beszélgetést. |

### `vid-7-2` – Ugyanaz a jelenet háromféle kameramozgással

- **Hova:** 7.2 fejezet – magyarázó videó
- **Fájlok:** `assets/video/m07-7-2-kameramozgas.mp4`, `assets/captions/m07-7-2.hu.vtt`, poszter: `assets/img/m07-7-2-poster.jpg`
- **Hossz:** kb. 3 perc · **formátum:** mp4 (H.264), 1280×720, magyar felirat (.vtt) · **kötelező a fejezet lezárásához:** igen (90%)
- **Leírás:** Egy esős kávéházterasz jelenete háromszor: álló kamerával, előre kocsizással és pásztázással, mellettük a leírás szövege.

**Forgatókönyv.** Magyarázó videó egy AI-videógenerátorral készült, emberek nélküli jelenettel (a 7.2 mintája: esős kávézóterasz). Ugyanaz a leírás három kameramozgással, majd egy túlbonyolított leírás rossz eredménye. Minden generált klipen 'AI-val készült' jelölés.

| # | Kép / képernyő | Narráció (= felirat szövege) |
|---|---|---|
| 1 | A jelenetleírás szövege a képernyőn, az összetevők színnel jelölve. | Ebben a videóban egyetlen jelenetleírást próbálunk ki háromféle kameramozgással. A klipek AI-val készültek, ezt a sarokban jelöljük. |
| 2 | Álló kamerás klip: eső a teraszon. | Először álló kamerával: csak az eső és a víz mozog. Nyugodt, egyszerű – és általában ez sikerül a legjobban. |
| 3 | Előre kocsizó klip. | Most lassú kocsizással előre. A kamera közelít a teraszhoz – ettől filmszerűbb lesz a jelenet. |
| 4 | Pásztázó klip. | Végül pásztázás balról jobbra: a kamera egy helyben fordul, és felfedi az utcát. |
| 5 | Túlbonyolított leírás és zavaros eredmény (torzuló tárgyak). | És mi történik, ha egyszerre túl sokat kérünk: futó embereket, változó fényt, körbeforgó kamerát? A jelenet zavaros lesz, a tárgyak torzulnak. Egy jelenet, egy fő mozgás. |

### `vid-8-2` – Token és kontextusablak

- **Hova:** 8.2 fejezet – animált magyarázó videó
- **Fájlok:** `assets/video/m08-8-2-token-kontextus.mp4`, `assets/captions/m08-8-2.hu.vtt`, poszter: `assets/img/m08-8-2-poster.jpg`
- **Hossz:** kb. 2 perc · **formátum:** mp4 (H.264), 1280×720, magyar felirat (.vtt) · **kötelező a fejezet lezárásához:** igen (90%)
- **Leírás:** Animáció: egy mondat szódarabokra bomlik, majd üzenetek töltenek meg egy keretet, a legrégebbiek kicsúsznak belőle.

**Forgatókönyv.** Lapos grafikás animáció a kurzus színvilágában. A token fogalma egy magyar mondat szétbontásával, majd a kontextusablak egy kerettel, amelybe üzenetek érkeznek. Végül az átadó összefoglaló mint megoldás.

| # | Kép / képernyő | Narráció (= felirat szövege) |
|---|---|---|
| 1 | Egy magyar mondat: „Holnap megszervezzük a születésnapi meglepetést.” A szavak színes darabokra bomlanak. | A modell nem betűkben és nem egész szavakban olvas, hanem szódarabokban, ezeket hívjuk tokennek. A hosszú magyar szavak sok darabra bomlanak. |
| 2 | Egy számláló pörög a darabok alatt. | A szöveg hosszát, a feltölthető dokumentumok méretét és sokszor a kereteket is tokenben mérik. |
| 3 | Egy keret jelenik meg, alulról üzenetbuborékok érkeznek. | Minden, amit a modell egy válaszhoz lát – az üzenetek, a fájlok, az utasítások – a kontextus. Ennek van egy felső határa: a kontextusablak. |
| 4 | A keret megtelik, a legfelső buborékok kicsúsznak és elhalványulnak. | Ha a beszélgetés nagyon hosszú, a legrégebbi részletek kieshetnek, vagy a modell kevésbé figyel rájuk. Ezért felejti el néha a korábbi kéréseidet. |
| 5 | Egy összefoglaló kártya kerül egy új, üres keretbe. | A megoldás egyszerű: kérj egy átadó összefoglalót, és azzal kezdj új beszélgetést. Tiszta lap, de a lényeg megmarad. |

### `vid-9-2` – Ugyanaz a kérés három eszközben

- **Hova:** 9.2 fejezet – képernyőfelvétel
- **Fájlok:** `assets/video/m09-9-2-osszehasonlitas.mp4`, `assets/captions/m09-9-2.hu.vtt`, poszter: `assets/img/m09-9-2-poster.jpg`
- **Hossz:** kb. 4 perc · **formátum:** mp4 (H.264), 1280×720, magyar felirat (.vtt) · **kötelező a fejezet lezárásához:** igen (90%)
- **Leírás:** Képernyőfelvétel: ugyanaz a kérés három AI-eszközben, a válaszok egymás mellett, értékelés öt szempont szerint.

**Forgatókönyv.** Képernyőfelvétel a ChatGPT, a Claude és a Gemini felületén, ugyanazzal a kitalált feladattal (lakóközösségi üzenet a kerékpártároló takarításáról). A felvétel napján érvényes állapotot mutatja, ezt a videó elején dátummal jelezni kell. Tárgyilagos, nem eladó hangvétel; nem hirdet győztest.

| # | Kép / képernyő | Narráció (= felirat szövege) |
|---|---|---|
| 1 | Dátum a képernyőn (a felvétel napja), a feladat szövege. | Ez a felvétel egy adott napon készült; az eszközök azóta változhattak. Ugyanazt a kérést másoljuk be három eszközbe, mindenhol új beszélgetésben. |
| 2 | A kérés beillesztése az első eszközbe, a válasz megjelenik. | Az első eszköz válasza. Még nem értékelünk, csak gyűjtünk. |
| 3 | Ugyanez a második és harmadik eszközben. | Ugyanaz a kérés szó szerint a másik két eszközben is. |
| 4 | A három válasz egymás mellett, alatta az öt szempont. | Most jön az értékelés öt szempont szerint: pontosság, követte-e a kérést, érthetőség, hasznosság, őszinteség. |
| 5 | Egy kitöltött értékelő táblázat, eltérő pontokkal; egy hiba kiemelve az egyik válaszban. | Ezen az egy feladaton ez lett az eredmény. Egy másik feladaton más is lehetne – ezért a saját, valódi feladataidon érdemes elvégezni ezt a próbát. |
| 6 | Összefoglaló kártya: ugyanaz a kérés, új beszélgetés, előre rögzített szempontok. | Ugyanaz a kérés, új beszélgetés, előre rögzített szempontok – és a döntés a tiéd. |

### `vid-10-3` – Közzététel GitHub Pages-en

- **Hova:** 10.3 fejezet – képernyőfelvétel
- **Fájlok:** `assets/video/m10-10-3-github-pages.mp4`, `assets/captions/m10-10-3.hu.vtt`, poszter: `assets/img/m10-10-3-poster.jpg`
- **Hossz:** kb. 4 perc · **formátum:** mp4 (H.264), 1280×720, magyar felirat (.vtt) · **kötelező a fejezet lezárásához:** igen (90%)
- **Leírás:** Képernyőfelvétel: új GitHub-tároló létrehozása, az index.html feltöltése, a Pages bekapcsolása és a kész oldal megnyitása.

**Forgatókönyv.** Képernyőfelvétel egy erre a célra létrehozott, kitalált nevű GitHub-fiókkal (valódi személyes adat nélkül). A 10.1 kitalált kertész-bemutatkozó oldalát tesszük közzé. A felvétel dátumát jelezni kell, mert a GitHub felülete változhat.

| # | Kép / képernyő | Narráció (= felirat szövege) |
|---|---|---|
| 1 | A felvétel dátuma, majd a github.com bejelentkezett kezdőoldala. | Ezen a napon készült a felvétel; a GitHub felülete azóta kicsit változhatott. Egy ingyenes fiókkal dolgozunk. |
| 2 | Plusz jel, New repository, név: bemutatkozas, Public, Create repository. | Új tárolót hozunk létre. Rövid nevet adunk, nyilvánosra állítjuk, és létrehozzuk. |
| 3 | Add file, Upload files, az index.html behúzása, Commit changes. | Feltöltjük az index.html fájlt: behúzzuk, majd a Commit changes gombbal mentjük. |
| 4 | Settings, Pages, Deploy from a branch, main, root, Save. | A beállításoknál a Pages pontban kiválasztjuk a main ágat és a gyökérmappát, majd mentünk. |
| 5 | Frissítés után megjelenik a webcím; kattintás, megnyílik az oldal. Utána telefonon is. | Egy-két perc múlva megjelenik a webcím. Megnyitjuk: ez a nyilvános oldalunk. Nézzük meg telefonon is. |
| 6 | Az index.html módosítása, újrafeltöltés, a változás megjelenik. | Ha frissíteni akarjuk, egyszerűen feltöltjük újra a fájlt ugyanabba a tárolóba. Közzététel előtt pedig mindig menjünk végig az ellenőrzőlistán. |

### `vid-11-2` – Egy ágenses munkamenet Claude Code-ban

- **Hova:** 11.2 fejezet – képernyőfelvétel
- **Fájlok:** `assets/video/m11-11-2-agens-munkamenet.mp4`, `assets/captions/m11-11-2.hu.vtt`, poszter: `assets/img/m11-11-2-poster.jpg`
- **Hossz:** kb. 4 perc · **formátum:** mp4 (H.264), 1280×720, magyar felirat (.vtt) · **kötelező a fejezet lezárásához:** igen (90%)
- **Leírás:** Képernyőfelvétel: Claude Code a terminálban egy próbamappán; kérés, terv, két jóváhagyás, módosítás és ellenőrzés a böngészőben.

**Forgatókönyv.** Valódi képernyőfelvétel Claude Code-dal egy próbamappán, amelyben csak a 10. modul kitalált kertész-oldalának index.html-je van. Ugyanaz a forgatókönyv, mint a 11.2 szimulációjában. A felvétel dátumát jelezni kell; a felület változhat. Semmilyen személyes adat vagy valódi fiókadat ne látsszon.

| # | Kép / képernyő | Narráció (= felirat szövege) |
|---|---|---|
| 1 | A felvétel dátuma; egy próbamappa egyetlen index.html-lel; a terminál megnyitása ebben a mappában. | Egy próbamappában dolgozunk, amelyben csak a kitalált bemutatkozó oldalunk van. A felvétel ezen a napon készült; a felület azóta változhatott. |
| 2 | Claude Code elindítása, a kérés begépelése (ugyanaz, mint a szimulációban). | Leírjuk a feladatot: mit, hova, milyen stílusban – és kérjük, hogy előbb mutassa meg a tervet. |
| 3 | Az ágens beolvassa a fájlt, majd kiírja a tervet. | Az ágens körülnéz: beolvassa a fájlt, majd terv formájában leírja, mit fog csinálni. |
| 4 | A terv módosítása egy kérdés cseréjével, majd jóváhagyás. | A tervbe belejavítunk: egy kérdést kicserélünk. Az ágens módosítja a tervet, mi pedig jóváhagyjuk. |
| 5 | Fájlmódosítási engedélykérés a változtatások összefoglalójával; engedélyezés. | Mielőtt a fájlhoz nyúlna, engedélyt kér, és megmutatja, mit változtat. Elolvassuk, és csak utána engedélyezzük. |
| 6 | Az ágens összefoglalja a változásokat; az oldal megnyitása a böngészőben, majd mobilnézetben. | A végén felsorolja, mit csinált. Az ellenőrzés viszont a miénk: megnyitjuk az oldalt, és telefonos nézetben is megnézzük. |

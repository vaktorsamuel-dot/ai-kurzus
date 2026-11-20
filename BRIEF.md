# AI kurzus – fejlesztési feladat Claude Code-nak

Weboldal: https://vaktorsamuel-dot.github.io/ai-kurzus/ ("AI a hétköznapokban – kurzus"), magyar nyelvű, hash-routeres SPA, GitHub Pages-en. A tanulója Samu apukája (50 éves, ChatGPT-t használ, nem műszaki ember). A kurzus célja, hogy magabiztosan használja az AI-t, és szükség esetén át tudjon állni Claude-ra.

Hét feladat van lent. **Előbb olvasd át a teljes repót, és írd le röviden, hogyan épül fel** (hol vannak a modulok és fejezetek adatai, hol van a zárolás logikája, hol van a haladás mentése, mi a lábléc "Kezelő" linkje). Semmit ne feltételezz: ez a leírás az élő oldalt nézve készült, a kódot nem láttam.

## Munkamód

- Sorrend: 1 → 2 → 5 → 4 → 3 → 6 → 7. Az oklevél (7.) az utolsó, mert a végleges modullistára épül.
- Feladatonként külön commit, érthető üzenettel. Minden feladat után próbáld ki az oldalt böngészőben, ne csak a kódot olvasd vissza.
- Ne generálj képet vagy videót. Ahol média kell, hagyj helyet neki (6. pont), a generálási promptokat Samu külön kezeli a `media-prompts/` mappában. Ha további média kell, írd be a promptot a megfelelő fájlba.
- **Meglévő haladást nem szabad elveszíteni.** A modul- és fejezetazonosítók (m01, 1.1 stb.) maradjanak stabilak. A megjelenő sorszám a sorrendből számolódjon, ne az azonosítóból. Ha a mentett haladás formátuma változik, verziózd, és írj hozzá migrációt (az export/import is működjön a régi fájlokkal).
- Tegezés mindenhol, egyszerű magyar, szakzsargon nélkül. A tartalmat ne hagyd nyers vázlatnak: a szövegeket teljesen írd meg.

---

## 1. Nincs ellentmondás: egyetlen forrásból jöjjön minden szám

**Hiba:** a kezdőoldal egyszer "11 modul, 9 óra", máskor "9 modul, 7 óra" feliratot mutatott, a főképernyő "0 / 12 modul kész"-et ír, a lecke-időkből kb. 530 perc jön ki.

**Teendő:**
- Egyetlen modulleíró adatból (a modulok listája + fejezetenkénti percek) számold ki a modulok számát, a fejezetek számát és az össz időt. Legyen egy `getCourseStats()`-szerű függvény, amit mindenhol ugyanaz használ.
- Felesleges kézzel beírt szám sehol ne maradjon: kezdőoldal (hero és "Amit megtanulsz" lista), főképernyő haladás, Súgó, `<meta description>`, README, oklevél.
- Egységes szóhasználat: a záró projekt is modul, tehát az összes modul az új modulokkal együtt számolandó. A kezdőoldalon "{N} modul · kb. {X} óra tartalom" jelenjen meg, az óra egész órára kerekítve.
- Az "Amit megtanulsz" lista is az adatból generálódjon, ne kézzel írt szöveg legyen.
- Az első betöltésnél látszó "Betöltés…" helyére tegyél egy egyszerű, szép töltőképernyőt (logó + animált pontok vagy skeleton). A régi verzió ne maradjon cache-ben: a fájlnevek kapjanak hash-t, vagy a build kezelje a verziózást.
- Írj egy kis ellenőrző scriptet (pl. `npm run check:numbers`), ami megkeresi a forrásban a kézzel beírt "N modul / N óra" mintákat, és hibát jelez, ha van ilyen.

**Kész, ha:** a kezdőoldal, a főképernyő, a Súgó és a meta description mind ugyanazt a számot írja, többszöri frissítés után is.

---

## 2. Mindenki mindenbe beléphet, nem csak a fejlesztő

**Jelenleg:** a modulok sorban nyílnak ("Előbb fejezd be: …"), és ha nem vagy belépve, a modul-linkek a kezdőoldalra dobnak.

**Teendő:**
- Szüntesd meg a zárolást minden felhasználónak: bármelyik modul és bármelyik fejezet megnyitható bármikor, közvetlen linkről is (`#/m/<modul>/f/<fejezet>`).
- A kártyákon a "Zárolt" állapot és az "Előbb fejezd be…" szöveg tűnjön el. Maradjon: "Nincs elkezdve" / "Folyamatban" / "Kész".
- Maradjon egy puha ajánlás: a főképernyő "Kezdés / Folytatás" gombja a legutóbbi, vagy az első el nem kezdett fejezetre mutat, és a modulkártyákon lehet egy kis "Ajánlott következő" jelzés. Ez ne tiltson semmit.
- A fejezet lezárásának feltételei maradjanak (végiggörgetés, gyakorlat "Megcsináltam", kvíz min. 60%), de csak a haladás számítását befolyásolják, a navigációt nem.
- Ha valaki belépés nélkül nyit meg egy mélylinket, lépjen be a nevével, utána vigye vissza arra az oldalra, amit eredetileg kért (ne a kezdőoldalra).
- Nézd meg, mi a lábléc **"Kezelő"** linkje. Ha csak a zárolás megkerülésére való, szűnjön meg vagy váljon feleslegessé. Ha egyéb admin eszköz, maradhat, de a tartalom eléréséhez semmilyen speciális mód ne kelljen.
- Az 1. pontban említett "nem kötelező" címke (10. és 11. modul) tűnjön el: az oklevélhez (7. pont) minden modul kell, így semmi sem "nem kötelező". Legyen helyette "Haladó" jelzés.

**Kész, ha:** friss böngészőben, új névvel belépve a 12. modul utolsó fejezete is megnyílik egyből, és semmi nem tűnik zároltnak.

---

## 3. Új modul: Átállás ChatGPT-ről Claude-ra

A kurzus egyik fő célja, hogy apukám ChatGPT-ről Claude-ra át tudjon térni, ha ő is úgy látja jónak. A modullistából ez most hiányzik. Új azonosító: `m12`. Az **ajánlott sorrendben a 2. modul (Jó kérés írása) után** legyen, mert addigra tudja, mi a prompt. Ettől függetlenül szabadon megnyitható (2. pont).

**Hangnem:** tárgyilagos, nem reklám. Írd le őszintén, mi jobb vagy hiányzik Claude-ban, és hagyd, hogy ő döntsön. A 9. modul (Eszközök és saját asszisztens) általánosan hasonlít össze eszközöket: ezt ne ismételd, hanem kösd össze vele, és ha kell, rövidítsd.

**Fejezetek (mindegyik a megszokott szerkezetben: "Ezt fogod tudni", magyarázat, "Próbáld ki most", mini kvíz, összefoglaló):**

1. **12.1 Mi ugyanaz, és mi más?** Rövid térkép: ami ChatGPT-ben megszokott, azt Claude-ban hol találod.
2. **12.2 Ugyanaz a kérés mindkettőben: egymás mellett.** Az összehasonlító komponens (lent).
3. **12.3 Projektek.** Mi a projekt, mikor jó (állandó témák: levelezés, receptek, tanulás), hogyan állítsd be: név, utasítások, feltöltött fájlok. Lépésről lépésre, általános példával.
4. **12.4 Artifactok.** A válasz mellett megjelenő önálló dokumentum, oldal vagy kis eszköz, amit külön tudsz szerkeszteni és elmenteni. Példa: egy ajánlat, egy ellenőrző lista, egy egyszerű kalkulátor.
5. **12.5 Fájlok feltöltése és használata.** PDF, Excel, kép. Mire figyelj (adatvédelem: kapcsolódik a 8. modulhoz; méret- és számhatárok).
6. **12.6 Átállás lépésről lépésre.** Fiók létrehozása, a fontosabb beállítások (a "Beállítások" képernyő, amit megszokott ChatGPT-ben, Claude-ban hol van), a régi beszélgetések kezelése (ChatGPT-adatexport: csak hivatkozz a hivatalos súgóra), mit érdemes a régi helyen hagyni. **Árakat ne írj be fixen**, csak hivatkozz a hivatalos árazási oldalra.
7. **12.7 Mikor maradj, mikor válts?** Őszinte összehasonlító lista. Itt legyen szó arról is, mit tud az egyik és mit nem a másik (pl. képgenerálás, hangos beszélgetés, keresés a neten).

### Tényellenőrzés (kötelező)

A funkciók gyorsan változnak. Ami lent kérdőjellel áll, az **hipotézis**, nem tény:

| Megszokott ChatGPT-ben | Claude-ban (ellenőrizd!) |
|---|---|
| Egyedi utasítások (custom instructions) | Beállítások / profil és preferenciák? |
| Memória | Memória? |
| GPT-k / Projektek | Projektek |
| Canvas | Artifactok |
| Képgenerálás | Claude nem generál képet? (Ellenőrizd.) |
| Hangmód | Hangos beszélgetés a mobilappban? |
| Webes keresés | Webes keresés? |

- Minden állítást a hivatalos súgóból ellenőrizz be (support.claude.com és help.openai.com), a szöveg írásának napján.
- Az új modul alján szerepeljen: **"Utoljára ellenőrizve: {dátum}"**, és egy mondat arról, hogy az alkalmazások változnak, a súgó mindig frissebb.
- Amit nem tudsz biztosan, azt ne írd állításként, inkább a "Nézz utána a hivatalos súgóban" megfogalmazást használd.

### Az egymás melletti összehasonlító komponens (12.2)

Két oszlop (mobilon egymás alatt): bal "ChatGPT", jobb "Claude". Felül a **közös kérés** (másolható, a 5. pont gombjaival), alatta mindkét oszlopban a **mintaválasz**, alul rövid "Mit vegyél észre?" jegyzet.

Mindkét oszlop fölött legyen "Próbáld ki te is" sáv: a közös kérés egy gombnyomással megnyílik mindkét eszközben (5. pont).

**A mintaválaszokat ne találd ki.** Az adatfájlban (pl. `data/osszehasonlitas.json`) minden példához legyen mező: `kerdes`, `chatgpt_valasz`, `claude_valasz`, `futtatva` (dátum), `modell_chatgpt`, `modell_claude`, `jegyzet`. Ha egy válasz üres, a komponens csak a kérést és a "Próbáld ki te is" gombokat mutassa, hiba nélkül. A válaszokat Samu futtatja le mindkét eszközben, és másolja be. A komponens alatt jelenjen meg: *"Mintaválasz. A tiéd más lehet, mert az AI nem ugyanazt írja le kétszer."*

Az 5 példakérés:
1. *Írj rövid, udvarias e-mailt a szállítónak, hogy a tegnapi szállítás két órát késett. Kérj tőle visszajelzést, hogy hogyan előzhető meg.*
2. *Foglald össze 3 pontban ezt a szöveget, egyszerű nyelven: [mintaszöveg, kb. 120-150 szó, egy kitalált ügyfélszolgálati tájékoztató].* A mintaszöveget te írd meg (kitalált, semmilyen valós szervezet ne szerepeljen benne).
3. *Mi a különbség a bruttó és a nettó ár között? Magyarázd el egy konkrét példával, ne használj szakszót.*
4. *Adj 10 ötletet egy kis céges karácsonyi ajándékra, fejenként 5 000 Ft alatt.*
5. *Egy étel ára 3 490 Ft + 27% áfa. Mennyi a bruttó ár? Számold ki lépésenként.* (Ez a 4.x "Gyakori hibák" fejezethez kapcsolódik: a számokat mindig ellenőrizni kell.)

**Szószedet:** vedd fel az új szavakat: projekt, artifact, memória, egyedi utasítás, fájlfeltöltés.

---

## 4. Gyakori hibák: mikor ne higgyél az AI-nak

Új fejezet a **4. modulban (Kutatás és ellenőrzés)**, "Mikor ne higgyél az AI-nak" címmel. A többi modulból is lehessen hivatkozni rá.

**Tartalom (a megszokott szerkezetben, kb. 15 perc):**
- **Rövid alapelv:** az AI magabiztosan is tévedhet, és ezt általában nem jelzi. A hangneme nem bizonyíték.
- **Hat tipikus hibatípus**, mindegyikhez egy rövid, hétköznapi példa és egy "Mit tegyél?":
  1. **Számok és számolás** (áfa, százalék, összegek): mindig ellenőrizd számológéppel vagy táblázattal. Kapcsolódás: a 12.2 egyik példája.
  2. **Jogi, adózási, szerződéses kérdések:** az AI segíthet megérteni, de nem helyettesít szakembert; fontos döntés előtt kérdezz meg jogászt vagy könyvelőt. Ne írj konkrét paragrafust vagy jogszabályi állítást, és a példák általánosak legyenek.
  3. **Egészség:** az AI nem orvos. Általános tájékozódásra jó, diagnózisra és adagolásra nem.
  4. **Friss vagy változó információ** (árak, szabályok, nyitvatartás): az AI tudása korlátozott lehet; kérj forrást, és nyisd meg a forrást.
  5. **Kitalált források és hivatkozások:** az AI néha létező forrásnak látszó, de nem létező címet vagy linket ír. Mindig nyisd meg.
  6. **Hízelgő egyetértés:** az AI hajlamos egyetérteni veled. Kérj ellenvéleményt is.
- **"3 kérdéses ellenőrzés"** (egy nyomtatható, egy oldalas kártya, a 7. pont print stílusával): *Fontos a téma? Van benne szám, jog vagy egészség? Ellenőriztem egy másik helyen?*
- **Próbáld ki most:** az AI-nak szándékosan egy ellenőrizhető tényt kell megmondania (pl. egy egyszerű számolás), és a tanuló ellenőrzi egy számológéppel. A gyakorlat a lényeget érzékeltesse, ne a "buktatást" célozza.
- **Mini kvíz:** 4 kérdés, magyarázattal (min. 60%).
- Egy újrahasználható **"Ellenőrizd!" figyelmeztető doboz** komponens (ikon + 1-2 mondat), amit beteszel a 3. (szövegek), 8. (biztonság) és 12.2 modulba is ott, ahol számokról vagy jogi tartalomról van szó.

---

## 5. "Másolás" és "Megnyitás" gombok a másolható promptok mellett

A kurzusban jelenleg van "Másolható kérés" blokk "Másolás" gombbal. Bővítsd **a közös komponensben** (ne lecke-enként), hogy minden prompt mellett ez legyen:

- **Másolás** (marad)
- **Megnyitás Claude-ban**
- **Megnyitás ChatGPT-ben**
- (Opcionális) **Megnyitás Gemini-ben**: itt nincs ismert, megbízható előtöltő paraméter, ezért csak megnyitja a Gemini-t, és kiírja, hogy a kérés vágólapra került.

**Működés:**
- Kattintáskor mindig másold a promptot a vágólapra is (biztonsági háló), utána nyisd meg új lapon (`target="_blank" rel="noopener"`).
- A megnyitási címek: `https://claude.ai/new?q=<encodeURIComponent(prompt)>` és `https://chatgpt.com/?q=<encodeURIComponent(prompt)>`. **Próbáld ki az élő oldalakon**, hogy működik-e, mert ezek változhatnak. Ha az előtöltés nem működik, a gomb csak megnyitja az eszközt, és értesítést mutat: "Átmásoltam a kérést. Illeszd be: Ctrl+V (Mac-en Cmd+V)."
- Ha a kódolt cím 1800 karakternél hosszabb lenne, ne tedd bele a promptot a címbe, csak a vágólapot és az értesítést használd.
- Ha a prompt szögletes zárójeles helyőrzőt tartalmaz (`[ ... ]`), a blokk legyen szerkeszthető (szövegmező), és legyen mellette felirat: "Előbb írd át a szögletes zárójeles részt." A gombok mindig az aktuális szöveget használják.
- A vágólap-művelet legyen robusztus (modern Clipboard API, tartalék: `execCommand`), és az értesítés `aria-live` legyen, hogy olvasóprogrammal is hallható legyen.
- Egy rövid megjegyzés a blokk alatt: "Ha nem vagy bejelentkezve, előbb jelentkezz be, utána illeszd be a kérést."
- A gombok legyenek jól láthatók és elég nagyok, mobilon is jól használhatók.

**Kész, ha:** az 1.1 lecke promptján, a 12.2 összehasonlítón és bármelyik más prompton mindhárom gomb működik, és a hosszú vagy üres vágólapos eset sem hibázik.

---

## 6. Média-helyek (generált képek, videók és lépés-ábrák)

Samu **nem készít valódi képernyőképet vagy képernyő-felvételt**. Minden média vagy generált (kép, videó), vagy te építed meg az oldalba (lépés-ábrák). A generálási promptok a `media-prompts/` mappában vannak:
- `kepek-prompt.md`: generált fotók (Samu generálja)
- `videok-prompt.md`: generált rövid videók (Samu generálja)

**A) Generált képek és videók:** készíts egy közös `<Media id="…">` komponenst (kép / videó), ami az `assets/media/<id>.<kiterjesztés>` fájlt tölti be.
- **Ha a fájl nincs meg, ne jelenítsen meg semmit** (se hibaikon, se üres keret), így az oldal félkész állapotban is rendesen néz ki.
- Képnél: `alt` szöveg, `loading="lazy"`, rögzített képarány (nincs elmozdulás betöltéskor), kattintásra nagyítás.
- Videónál: `poster`, billentyűzettel vezérelhető lejátszó, hang nélküli, és az oldal meglévő Beállítások kapcsolóit (automatikus lejátszás, feliratok) kövesse.
- Készíts scriptet (pl. `npm run media:check`), ami kilistázza, melyik `<Media id>` mögül hiányzik a fájl.
- A `<Media>` hívásokat a két fájlban megadott modulokhoz tedd be. Ha a lecke szerkezete eltér, a legközelebbi fejezetbe illeszd, és írd vissza a fájlba, hova került.

**B) Lépés-ábrák (te építed, kódból, képfájl nélkül):** a gyakorlati részeknél (projekt létrehozása, artifact, fájlfeltöltés, hangmód a telefonon, memória/egyedi utasítások beállítása, weboldal közzététele GitHub Pages-en, Claude Code indítása) készíts egy `<StepFigure>` komponenst: egyszerű, **sematikus** ábra HTML/CSS/SVG-ből, számozott lépésekkel és kiemelt gombbal. Szabályok:
- **Ne utánozz pontos felületet**, és ne írj bele olyan feliratot, amit nem ellenőriztél. Az ábra a lépés logikáját mutassa (hol keresd, mit nyomj meg), ne az alkalmazás képét.
- Minden ábra alá kerüljön: *"Szemléltető ábra. A valódi felület kicsit másképp nézhet ki, mert az alkalmazások változnak."*
- Az ábra mellett mindig legyen a lépések szöveges leírása is (ez a mérvadó), és a hivatalos súgó linkje.
- A feliratok az ellenőrzött magyar vagy angol gombnevek legyenek. Ha nem vagy biztos, írd általánosan ("Új projekt", "Fájl hozzáadása").
- Legyen olvasható sötét és világos témában, és billentyűzettel is bejárható.

**C) Fontos:** a `media-prompts/` mappa **ne kerüljön a közzétett (publikus) mappába**.

---

## 7. Oklevél (csak 100%-os teljesítésnél)

Az oklevél csak annak jár, aki **mindent** teljesített: minden modul, a záró projekt és minden fejezet lezárása a szokásos feltételekkel.

- **Állapot:** a főképernyőn jelenjen meg egy "Oklevél" kártya. 100% alatt szürke, a szöveg: "Az oklevél a kurzus teljes teljesítése után nyílik. Még {N} modul van hátra", a hiányzó modulokra mutató linkekkel. 100%-nál a kártya aktív.
- **Kiállítás ideje:** amikor a haladás először éri el a 100%-ot, mentsd el a **teljesítés dátumát** (`completedAt`). Az oklevélen ez a dátum szerepeljen, ne a megnyitás napja. Ha ezután bővül a kurzus, a már kiadott oklevél maradjon érvényes.
- **Név:** a belépéskor megadott név gyakran becenév ("Apa"), ezért az oklevél oldalán legyen egy szerkeszthető "Név az oklevélen" mező, előtöltve a profilnévvel, és mentve külön.
- **Oldal:** `#/oklevel`. 100% alatt ne mutasson oklevelet, hanem a hiányzó dolgokat listázza linkekkel.
- **Tartalom:** cím ("Oklevél"), a kurzus neve ("AI a hétköznapokban"), a név, szöveg ("sikeresen teljesítette az "AI a hétköznapokban" kurzus mind a {N} modulját", a szám az 1. pont függvényéből; a záró projekt a modulok között van), a teljesítés dátuma magyar formában (pl. "2026. november 20."), a kurzus logója.
- **Nyomtatás:** "Nyomtatás / Mentés PDF-ként" gomb, `window.print()`. Külön `@media print` stílus: **A4 fekvő**, fehér háttér (a sötét téma ne nyomtatódjon), kontrasztos szöveg, díszkeret, a navigáció és a gombok rejtve, `print-color-adjust: exact` a keretekhez és a logóhoz. Ellenőrizd nyomtatási előnézetben (böngészőben a print média emulálásával).
- Ne használj külső szolgáltatást vagy könyvtárat a PDF-hez, minden a böngészőben készüljön.
- Frissítsd a kezdőoldal szövegét: a mostani "A záró projekt után letölthető, nyomtatható oklevelet kapsz" helyett "A kurzus teljes teljesítése után letölthető, nyomtatható oklevelet kapsz."
- **Tesztelés:** a meglévő haladás-importtal tölts be egy "mindent kész" fájlt, és nézd meg, hogy az oklevél megjelenik. Hiányzó egy modul esetén zárolt marad.

---

## Közös szabályok

- **Megjelenés:** a meglévő design (sötét téma, kártyák, színek) maradjon. Új komponensek illeszkedjenek. A világos téma és a három betűméret is működjön az új részeken.
- **Hozzáférhetőség:** billentyűzettel használható, látható fókusz, `alt` szövegek, megfelelő kontraszt, a nagy és az extra nagy betűméretnél nem törik szét az elrendezés.
- **Mobil:** minden új rész jól nézzen ki telefon-szélességen.
- **Külső szolgáltatás nélkül:** ne adj hozzá nyomkövetést vagy külső betűtípus-szolgáltatást.
- **Haladás:** a mentés továbbra is a böngészőben történik. Az exportált JSON-nak tartalmaznia kell a verziót és az új mezőket (pl. `completedAt`, oklevélnév).

## Kész, ha (összefoglaló ellenőrző lista)

- [ ] Kezdőoldal, főképernyő, Súgó és meta description ugyanazt a modulszámot és időt írja, és van `check:numbers` script.
- [ ] Friss böngészőben, új névvel bármelyik modul és fejezet megnyílik, semmi sem zárolt.
- [ ] Meglévő (régi) haladás-export beolvasása nem veszít adatot.
- [ ] Új modul (m12) 7 fejezettel, kvízzel, tényellenőrzési dátummal és szószedettel.
- [ ] Az összehasonlító komponens üres mintaválaszokkal is hibátlan; a "Próbáld ki te is" gombok működnek.
- [ ] "Mikor ne higgyél az AI-nak" fejezet a 4. modulban, az "Ellenőrizd!" doboz a megadott helyeken.
- [ ] Minden prompt mellett Másolás + Megnyitás Claude-ban/ChatGPT-ben működik.
- [ ] `<Media>` komponens és `media:check` script kész; hiányzó fájl esetén nem látszik hibás elem.
- [ ] Oklevél: 100% alatt zárolt, 100%-nál megjelenik, a teljesítés dátuma és a név rajta van, A4 fekvő nyomtatás jó.
- [ ] Kipróbálva az élő GitHub Pages-címen is (hash-útvonalak, cache), mobilon és nyomtatási előnézetben.

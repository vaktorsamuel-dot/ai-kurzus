# Módosítások az AI kurzus oldalon

## Fontos munkamódszer (ezt olvasd el először)

- NE olvasd végig az egész kódot és NE nézd át a korábbi munkát / előzményeket.
- Minden pontnál először keresd meg a releváns részt célzottan (`grep -rn "szöveg" .`), és csak azt a részt nyisd meg és módosítsd.
- Ne töröld ki a meglévő kódot, tartalmat, modulokat, szövegeket. Csak azt változtasd, amit lent kérek. Ami nincs felsorolva, az maradjon pontosan úgy, ahogy van.
- Ne írd újra az egész fájlt; kis, célzott szerkesztéseket csinálj.
- A végén írd le röviden, mit változtattál és melyik fájlban.

---

## 1. Kék-fehér stílus

- Az egész oldal legyen kék-fehér: fehér / nagyon világos kék háttér, kék kiemelések (gombok, címsorok, linkek, kártyák szegélye, progress sáv).
- Javasolt színek (CSS változókba tedd, ha még nincs): elsődleges kék `#1d4ed8`, világosabb kék `#3b82f6`, nagyon halvány kék háttér `#eff6ff`, szöveg sötét szürkéskék `#0f172a`, fehér `#ffffff`.
- Csak a színeket és a hangulatot cseréld le; az elrendezés és a funkciók maradjanak.
- Ellenőrizd, hogy a szöveg mindenhol jól olvasható (elég kontraszt).

## 2. Kezdőképernyő szövege

- Keresd meg a szöveget: `Mire lesz szükséged? Egy böngészőre és egy ingyenes AI-eszközre (például ChatGPT, Claude vagy Gemini). Technikai tudás nem kell.`
- Ezt a mondatot TÖRÖLD ki.
- A kezdőképernyő szövegét cseréld le egyszerűbb, alapvető információkra a kurzusról:
  - mi ez a kurzus (rövid, 1-2 mondat),
  - hány modulból áll,
  - körülbelül mennyi idő alatt végezhető el,
  - hogy lépésről lépésre haladsz, és a haladásod automatikusan mentődik.
- Egyszerű, barátságos, magyar nyelv. Ne legyen hosszú.
- A modulok tényleges számát a kódból olvasd ki (ne találj ki számot).

## 3. Kezelő (admin) mód

Cél: én (a kezelő) minden modulba be tudjak lépni és tesztelni, de a sima felhasználó (apukám) csak oda mehet, ahol éppen tart.

- Sima felhasználó: a modulok sorrendben nyílnak meg, a még nem elért modulok zárva vannak (ahogy most is működik). Ezen NE változtass.
- Kezelő mód: minden modul szabadon megnyitható, a zárolás nem érvényes.
- Belépés a kezelő módba: egy diszkrét "Kezelő" gomb (pl. a lap alján vagy a sarokban, kis szürke szöveggel), ami PIN-t kér.
  - A PIN egy könnyen átírható konstans legyen a kód elején (`ADMIN_PIN`), alapértelmezett érték: `2010`. Írd meg a végén, hol lehet átírni.
  - A kezelő mód állapota maradjon meg frissítésig (localStorage), és legyen "Kilépés a kezelő módból" gomb.
- Amíg kezelő módban vagyok, jelenjen meg egy jól látható kis jelzés (pl. kék sáv: "Kezelő mód aktív").
- Fontos: a kezelő módban való lapozgatás ne írja felül a sima felhasználó mentett haladását (ha a haladás localStorage-ban van, ne állítsa át a "hol tart" értéket kezelő módban, vagy használj külön kulcsot).
- Ez kliensoldali védelem, nem igazi biztonság, és ez így rendben van.

## 4. Modul ikonok

- Minden modul kapjon egy kis ikont a sorszáma mellé (a modul számánál / kártyáján).
- Az ikon illeszkedjen a modul témájához (pl. kép-generálás: kép ikon, weboldal: böngésző ikon, stb. – a modul címe alapján válaszd ki).
- Legyen egyszerű, vonalas, kék színű inline SVG (ne kelljen külső fájl vagy külső könyvtár), kb. 24-32 px, világoskék kerek háttérben.
- Az ikon jelenjen meg a modullistában, és ha van modulfejléc, ott is.

## 5. Eltávolítandó szövegek

Keresd meg grep-pel és töröld ki (csak ezeket, a környező tartalom maradjon):

1. Az oldal aljáról: `Minden példa kitalált. Az eszközökről szóló információk 2026. novemberi állapotot tükröznek – ellenőrizd a hivatalos oldalakon.`
2. Minden "Gyakorold játékosan" rész az összes modulból: a címsor ÉS a hozzá tartozó tartalom (feladat / játék / gyakorlat).
   - Ellenőrizd, hogy a modul befejezése / továbblépés nem függ-e ettől a résztől. Ha igen, igazítsd úgy, hogy enélkül is rendesen működjön a haladás és a modul "kész" állapota.
   - Ellenőrizd, hogy nem marad árva JavaScript, ami hibát dobna a törölt elemek miatt.

## 6. Minden más maradjon

Minden más tartalom, modul, szöveg és funkció maradjon pontosan úgy, ahogy most van.

## Végén ellenőrzés

- Nyisd meg az oldalt, és nézd meg: kék-fehér lett, új kezdőképernyő, nincs konzol hiba.
- Sima módban a zárolt modulok tényleg zárva vannak; kezelő módban mind megnyitható.
- Az ikonok megjelennek, a két törölt szöveg és a "Gyakorold játékosan" részek nincsenek meg sehol.

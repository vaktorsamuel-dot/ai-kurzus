# Firebase beállítása a visszajelzésekhez (egyszeri, kb. 10 perc)

A kurzusoldal statikus (GitHub Pages), ezért a visszajelzéseket egy ingyenes Firebase-projekt (Spark csomag, Firestore) tárolja. Apa oldala csak **létrehozni** tud bejegyzést; **olvasni csak te tudsz**, a saját Google/Firebase-fiókoddal létrehozott e-mail + jelszó belépéssel.

1. <https://console.firebase.google.com> › **Projekt hozzáadása**. Név: például `ai-kurzus`. A Google Analytics kikapcsolható.
2. **Build › Firestore Database › Adatbázis létrehozása**. Szabványos (Native) mód, hely: `eur3 (europe-west)` vagy egy másik európai régió. Indítás **éles módban** (a szabályokat lent beírjuk).
3. **Build › Authentication › Első lépések › Bejelentkezési módszer: E-mail/jelszó › Engedélyezés** (a második, „e-mail link” kapcsoló maradjon kikapcsolva).
4. **Authentication › Felhasználók › Felhasználó hozzáadása**: add meg a saját e-mail-címedet és egy erős jelszót. A létrehozás után a listában másold ki a **Felhasználói UID**-t.
5. **Firestore › Szabályok**: másold be a `firestore.rules` tartalmát, a `SAMU_UID` helyére a fenti UID-t (idézőjelek között marad). **Közzététel**.
6. **Projektbeállítások (fogaskerék) › Általános › Saját alkalmazások › Web (</>)**: regisztrálj egy webalkalmazást (Firebase Hosting nem kell). A megjelenő konfigurációból a `projectId` és az `apiKey` kell. Ezek **nyilvános azonosítók**, nem jelszavak: a védelmet a 4–5. lépés adja.
7. Írd be a két értéket a `js/firebase-config.js` fájlba (vagy mondd meg Claude-nak, és beírja).
8. Nyisd meg az oldalon: `…/ai-kurzus/#/kezelo`, és lépj be az e-mail-címeddel és a jelszavaddal.

## Fontos tudnivalók

- A **jelszót soha ne írd a kódba**; a belépés a böngészőben, a Firebase-nek megy.
- Nyilvános oldalról bárki küldhet bejegyzést (ezt a szabályok mező- és hosszkorlátokkal szűkítik). Spam esetén a Firestore konzolban törölhetsz.
- A Spark csomag ingyenes; a napi kvótája (50 000 olvasás, 20 000 írás) ennél a használatnál bőven elég.
- A haladás exportja tartalmazza a még el nem küldött visszajelzéseket is, így nem veszik el.

// Kezdő szintfelmérő: kérdések, ajánlási szabályok, mentés. Nem vizsga: semmit nem zár le és semmit nem teljesít.
// Az eredmény a haladással együtt mentődik (getProgress().szintfelmeres), így az export/import is tartalmazza.
// A modulokat stabil azonosítóval (m01 …) kezeljük, a megjelenő sorszám a kurzus sorrendjéből számolódik.

import { course } from './data.js?v=991a70c2';
import { getProgress, saveProgress } from './store.js?v=991a70c2';

export const QUESTIONS = [
  {
    id: 'k1', tipus: 'egy', onertekeles: true,
    kerdes: 'Most hogyan használod az AI-t?',
    opciok: [
      ['a', 'Még alig vagy egyáltalán nem.'],
      ['b', 'Csevegek vele, kérdezek, néha szöveget íratok.'],
      ['c', 'Rendszeresen, többféle feladatra (levelek, összefoglalók, ötletek).'],
      ['d', 'Fájlokat, képeket is használok, és saját beállításaim vannak.'],
    ],
  },
  {
    id: 'k2', tipus: 'egy', helyes: 'b', modul: 'm01',
    kerdes: 'Mit csinál alapvetően egy nyelvi modell (például a ChatGPT vagy a Claude)?',
    opciok: [
      ['a', 'Tényeket keres ki egy óriási adatbázisból.'],
      ['b', 'Szóról szóra megjósolja a legvalószínűbb folytatást a tanult minták alapján.'],
      ['c', 'Gondolkodik, és mindig igazat mond.'],
      ['d', 'Lekeres a Google-ről egy választ, és átmásolja.'],
      ['e', 'Nem tudom.'],
    ],
  },
  {
    id: 'k3', tipus: 'egy', helyes: 'b', modul: 'm04',
    kerdes: 'Az AI magabiztosan megad egy pontos számot, forrás nélkül. Mit teszel?',
    opciok: [
      ['a', 'Elhiszem, mert magabiztosan írta.'],
      ['b', 'Forrást kérek, és ellenőrzöm egy megbízható helyen.'],
      ['c', 'Újragenerálom, és azt hiszem, amelyik többször előjön.'],
      ['d', 'Megkérdezem, biztos-e, és ha igent mond, elfogadom.'],
      ['e', 'Nem tudom.'],
    ],
  },
  {
    id: 'k4', tipus: 'egy', helyes: 'b', modul: 'm02',
    kerdes: 'Melyik kérés ad valószínűleg jobb eredményt?',
    opciok: [
      ['a', '„Írj egy e-mailt a vendégnek.”'],
      ['b', '„Írj rövid, udvarias e-mailt egy vendégnek, akinek késett a kiszállítása. Kérj elnézést, ajánlj 10% kupont, legfeljebb 5 mondat.”'],
      ['c', '„Írj egy nagyon jó e-mailt.”'],
      ['d', 'Szerintem mindegy.'],
      ['e', 'Nem tudom.'],
    ],
  },
  {
    id: 'k5', tipus: 'egy', helyes: 'b', modul: 'm08',
    kerdes: 'Melyiket NE másold be egy általános AI-csevegőbe?',
    opciok: [
      ['a', 'Egy általános kérdést a főzésről.'],
      ['b', 'Egy vendég teljes nevét, címét és telefonszámát.'],
      ['c', 'Egy kitalált példalevelet.'],
      ['d', 'Egy nyilvános weboldal szövegét.'],
      ['e', 'Nem tudom.'],
    ],
  },
  {
    id: 'k6', tipus: 'egy', helyes: 'b', modul: 'm08',
    kerdes: 'Mi a token az AI-nál?',
    opciok: [
      ['a', 'Egy jelszó, amivel belépsz.'],
      ['b', 'Egy szó vagy szódarab, amiben a modell a szöveget számolja. A beszélgetés hosszának van határa.'],
      ['c', 'Egy fizetési egység a boltban.'],
      ['d', 'Egy fajta kép.'],
      ['e', 'Nem tudom.'],
    ],
  },
  {
    id: 'k7', tipus: 'tobb', onertekeles: true,
    kerdes: 'Használtál már AI-t ezekre?',
    opciok: [
      ['kep', 'Képkészítés'],
      ['video', 'Videókészítés'],
      ['web', 'Weboldal készítése'],
      ['semmi', 'Semmi ezek közül'],
    ],
  },
];

// Tudásos kérdések által lefedett modulok (a kérdés(ek) mind helyes → „Ismerős”).
const TUDAS = { m01: ['k2'], m02: ['k4'], m04: ['k3'], m08: ['k5', 'k6'] };
// K7: amit még nem próbált, az „Érdekelhet” (nem kötelező).
const K7_MODUL = { kep: 'm06', video: 'm07', web: 'm10' };
// A 3. modul (átállás ChatGPT-ről Claude-ra) mindig ajánlott, kivéve ha K1 = d.
const ATALLAS = 'm12';

export const LABELS = {
  ajanlott: 'Ajánlott',
  ismeros: 'Ismerős, átugorhatod (nyitva marad)',
  erdekelhet: 'Érdekelhet',
};

export function getAssessment() { return getProgress().szintfelmeres || null; }
export function hasAnswers() { const a = getAssessment(); return !!(a && a.valaszok); }
export function isAskedOrSkipped() { return getProgress().szintfelmeres !== null; }

export function saveAssessment(valaszok) {
  const p = getProgress();
  p.szintfelmeres = { valaszok, ido: new Date().toISOString() };
  saveProgress();
}
export function skipAssessment() {
  const p = getProgress();
  // Ha már van kitöltött eredmény, azt a kihagyás nem írja felül.
  if (!(p.szintfelmeres && p.szintfelmeres.valaszok)) {
    p.szintfelmeres = { kihagyva: true, ido: new Date().toISOString() };
    saveProgress();
  }
}

// Modulonkénti ajánlás a válaszokból. Tiszta függvény: { modulId: { allapot, ok } }.
export function computeRecs(v, modulIds) {
  const ids = modulIds || course.modulok.map((m) => m.id);
  const jo = (q) => v[q] === (QUESTIONS.find((x) => x.id === q) || {}).helyes;
  const nemTudom = (q) => v[q] === 'e';
  const k1 = v.k1;
  const k7 = Array.isArray(v.k7) ? v.k7 : [];
  const out = {};

  ids.forEach((id) => {
    let r = { allapot: 'ajanlott', ok: 'A kurzus alapsorrendje szerint ajánlott.' };

    if (TUDAS[id]) {
      const qs = TUDAS[id];
      if (k1 === 'a') {
        r = { allapot: 'ajanlott', ok: 'Még alig használod az AI-t, ezért a teljes alapút érdemes végigcsinálni.' };
      } else if (qs.every(jo)) {
        r = { allapot: 'ismeros', ok: qs.length > 1 ? 'Mindkét kérdésre jól válaszoltál.' : 'A kérdésre jól válaszoltál.' };
      } else if (qs.some(nemTudom)) {
        r = { allapot: 'ajanlott', ok: 'Erre a kérdésre azt jelölted, hogy nem tudod, ezért érdemes elvégezni.' };
      } else {
        r = { allapot: 'ajanlott', ok: 'A válaszod alapján érdemes átnézni.' };
      }
    }

    if (id === ATALLAS) {
      r = k1 === 'd'
        ? { allapot: 'ismeros', ok: 'Már fájlokkal és saját beállításokkal is dolgozol.' }
        : { allapot: 'ajanlott', ok: 'Az átállás a Claude-ra a kurzus egyik fő célja, ezért mindig ajánlott.' };
    }

    // K1 = d és K4 helyes: a 2. (m02) és a 4. (m03) modul is „Ismerős” lehet.
    if ((id === 'm02' || id === 'm03') && k1 === 'd' && jo('k4')) {
      r = { allapot: 'ismeros', ok: 'Haladó módon használod az AI-t, és a jó kérés írásában is magabiztos vagy.' };
    }

    Object.keys(K7_MODUL).forEach((k) => {
      if (K7_MODUL[k] === id && Array.isArray(v.k7) && !k7.includes(k)) {
        r = { allapot: 'erdekelhet', ok: 'Ezt még nem próbáltad. Nem kötelező, de érdekelhet.' };
      }
    });

    out[id] = r;
  });
  return out;
}

export function getRecs() {
  const a = getAssessment();
  if (!a || !a.valaszok) return null;
  return computeRecs(a.valaszok);
}

// Ajánlott modulsorrend: az alapsorrend, de az „Érdekelhet” modulok a záró projekt elé kerülnek.
// Az „Ismerős” modulok a helyükön maradnak (így a 3. modul mindig a 2. után áll), csak jelölve vannak.
export function recommendedOrder() {
  const mods = course.modulok.slice();
  const recs = getRecs();
  if (!recs) return mods;
  const normal = mods.filter((m) => !(recs[m.id] && recs[m.id].allapot === 'erdekelhet'));
  const erd = mods.filter((m) => recs[m.id] && recs[m.id].allapot === 'erdekelhet');
  const zpIdx = normal.findIndex((m) => m.id === 'zp');
  if (zpIdx === -1) return normal.concat(erd);
  return normal.slice(0, zpIdx).concat(erd, normal.slice(zpIdx));
}

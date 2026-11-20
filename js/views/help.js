import { course, getCourseStats } from '../data.js?v=7150738a';
import { getProfile } from '../store.js?v=7150738a';
import { esc, icon, statusBadge } from '../util.js?v=7150738a';

function back() {
  return '<nav class="crumbs no-print"><a class="btn btn-ghost btn-small" href="' + (getProfile() ? '#/' : '#/bevezeto') + '">' + icon('arrowLeft') + 'Vissza</a></nav>';
}

export function viewHelp() {
  const st = getCourseStats();
  const qa = [
    ['Mekkora a kurzus?', 'A kurzus ' + st.modules + ' modulból és ' + st.chapters + ' fejezetből áll, összesen kb. ' + st.hours + ' óra tartalom. Saját tempóban haladsz, bármikor abbahagyhatod és később folytathatod.'],
    ['Hogyan működik a haladás?', 'Minden lépésed automatikusan mentődik ebben a böngészőben: a lezárt fejezetek, a kvízeredmények, a videó utolsó pozíciója, a gyakorlatok pipái és a beírt jegyzetek. Nem kell gombot nyomnod a mentéshez, és nincs bejelentkezés. Ha a böngésző nem enged menteni (például privát ablakban), ezt az oldal tetején jelezzük.'],
    ['Van sorrend, vagy bárhol kezdhetem?', 'Bármelyik modult és fejezetet megnyithatod bármikor, akár közvetlen hivatkozásról is, semmi nincs zárolva. A modulok sorrendje ajánlás: a főképernyő „Kezdés / Folytatás” gombja a legutóbbi vagy az első el nem készült fejezetre visz, a modulkártyán pedig az „Ajánlott következő” jelzés mutatja, merre érdemes továbbmenni.'],
    ['Mikor zárhatok le egy fejezetet?', 'A lezárás csak a haladásod számolását érinti, a navigációt nem. A „Fejezet lezárása” gomb akkor aktív, ha: végiggörgettél a fejezeten az összefoglalóig; ha van kötelező videó, legalább 90%-át ténylegesen megnézted (az előretekerés nem számít bele); bejelölted a „Megcsináltam” négyzetet a gyakorlatnál; és a mini kvízen elérted a 60%-ot. A gomb alatt mindig látod, mi van még hátra. Ha egy videó még nem készült el vagy nem tölt be, az nem akadályoz.'],
    ['Mit jelent a százalék?', 'Egy fejezet 0%-ról indul, és minden teljesített lépéssel (olvasás, videó, gyakorlat, kvíz) nő; a lezáráskor lesz 100%. A modul százaléka a fejezetek átlaga, plusz a modulzáró (kvíz és lezárás) egy tételként. A teljes kurzus a modulok átlaga. A főképernyő, a modul és a fejezet ugyanabból a számításból dolgozik, ezért mindenhol ugyanazt látod.'],
    ['Mit jelent a „Haladó” jelzés?', 'A haladó modulok kicsit több önállóságot kérnek. Nem nehezebben érthetők, csak később érdemes őket elővenni. Az oklevélhez minden modul kell, a sorrendet te döntöd el.'],
    ['Hogyan folytathatom másik eszközön?', 'A Beállítások › Haladás exportálása résznél töltsd le a haladásodat fájlként, vagy másold ki a szöveges kódot. A másik eszközön nyisd meg a kurzust, és ugyanott importáld. Az importálás felülírja az ott lévő haladást.'],
    ['Mit jelentenek az aláhúzott szavak?', 'Szakszavak. Koppints vagy kattints rájuk, és egy mondatban elmagyarázzuk őket. Mindet megtalálod a Szószedetben is.'],
    ['Billentyűzettel is használható?', 'Igen. A Tab billentyűvel lépkedhetsz, Enterrel vagy szóközzel választhatsz. A videólejátszóban: szóköz – lejátszás/szünet, bal/jobb nyíl – 10 másodperc vissza/előre, C – felirat, F – teljes képernyő, M – némítás.'],
  ];
  return {
    title: 'Súgó',
    html: '<div class="wrap-narrow section">' + back() + '<h1>Súgó</h1>' +
      '<p class="lead">Röviden arról, hogyan működik a kurzus.</p>' +
      '<p>Állapotjelzők: ' + statusBadge('kesz') + ' ' + statusBadge('folyamatban') + ' ' + statusBadge('nincs') + '</p>' +
      qa.map(([q, a]) => '<details class="faq"><summary>' + esc(q) + '</summary><p>' + esc(a) + '</p></details>').join('') +
      '</div>',
  };
}

export function viewGlossary() {
  const items = Object.values(course.szoszedet).sort((a, b) => a.kifejezes.localeCompare(b.kifejezes, 'hu'));
  return {
    title: 'Szószedet',
    html: '<div class="wrap-narrow section">' + back() + '<h1>Szószedet</h1>' +
      '<p class="lead">A kurzusban előforduló szakszavak egy-egy mondatban.</p>' +
      '<div class="field"><label for="gl-q">Keresés</label><input type="search" id="gl-q" placeholder="pl. token"></div>' +
      '<dl class="glossary">' + items.map((f) => '<div class="gl-item" data-k="' + esc((f.kifejezes + ' ' + f.magyarazat).toLowerCase()) + '"><dt>' + esc(f.kifejezes) + (f.angol ? ' <span class="muted small">(' + esc(f.angol) + ')</span>' : '') + '</dt><dd>' + esc(f.magyarazat) + '</dd></div>').join('') + '</dl>' +
      '<p class="muted small" id="gl-empty" hidden>Nincs találat.</p></div>',
    mount(root) {
      const q = root.querySelector('#gl-q');
      q.addEventListener('input', () => {
        const v = q.value.trim().toLowerCase();
        let n = 0;
        root.querySelectorAll('.gl-item').forEach((i) => { const show = !v || i.dataset.k.includes(v); i.hidden = !show; if (show) n++; });
        root.querySelector('#gl-empty').hidden = n > 0;
      });
    },
  };
}

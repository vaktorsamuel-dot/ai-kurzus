// Saját, kézzel rajzolt SVG ábrák (nem helyőrzők). A színeket CSS-osztályok adják, így sötét témában is olvashatók.

function box(x, y, w, h, label, cls = 'd-box', sub = '') {
  return '<g><rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="12" class="' + cls + '"/>' +
    '<text x="' + (x + w / 2) + '" y="' + (y + h / 2 + (sub ? -4 : 6)) + '" text-anchor="middle" class="d-label">' + label + '</text>' +
    (sub ? '<text x="' + (x + w / 2) + '" y="' + (y + h / 2 + 18) + '" text-anchor="middle" class="d-sub">' + sub + '</text>' : '') + '</g>';
}
function arrow(x1, y1, x2, y2) {
  return '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" class="d-line" marker-end="url(#d-arrow)"/>';
}
const DEFS = '<defs><marker id="d-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" class="d-arrowhead"/></marker></defs>';

function svg(vb, title, desc, body) {
  return '<svg class="diagram" viewBox="' + vb + '" role="img" aria-labelledby="dt-' + title.id + ' dd-' + title.id + '">' +
    '<title id="dt-' + title.id + '">' + title.text + '</title><desc id="dd-' + title.id + '">' + desc + '</desc>' + DEFS + body + '</svg>';
}

const D = {
  felepites() {
    const steps = ['Olvasás', 'Videó', 'Próbáld ki', 'Kvíz', 'Lezárás'];
    let b = '';
    steps.forEach((s, i) => {
      const x = 10 + i * 152;
      b += box(x, 20, 128, 56, s, i === 4 ? 'd-box-accent' : 'd-box');
      if (i < 4) b += arrow(x + 130, 48, x + 150, 48);
    });
    b += '<text x="390" y="118" text-anchor="middle" class="d-sub">Egy fejezet lépései</text>';
    for (let i = 0; i < 12; i++) {
      const x = 40 + i * 60;
      b += '<circle cx="' + x + '" cy="168" r="18" class="' + (i === 11 ? 'd-dot-accent' : 'd-dot') + '"/>' +
        '<text x="' + x + '" y="174" text-anchor="middle" class="d-dot-label">' + (i === 11 ? 'Z' : i + 1) + '</text>';
      if (i < 11) b += '<line x1="' + (x + 19) + '" y1="168" x2="' + (x + 41) + '" y2="168" class="d-line-soft"/>';
    }
    b += '<text x="390" y="218" text-anchor="middle" class="d-sub">11 modul és a záró projekt, sorban nyílnak</text>';
    return svg('0 0 780 230', { id: 'felepites', text: 'A kurzus felépítése' },
      'Egy fejezet öt lépése: olvasás, videó, gyakorlat, kvíz, lezárás. Alatta tizenegy modul és a záró projekt egymás után.', b);
  },

  'prompt-elemek'() {
    const parts = [['Cél', 'mit szeretnél'], ['Háttér', 'mit kell tudnia'], ['Szerep', 'kinek a szemével'], ['Formátum', 'milyen alakban'], ['Példa', 'mihez hasonlót']];
    let b = '';
    parts.forEach((p, i) => {
      const y = 10 + i * 64;
      b += box(10, y, 250, 52, p[0], 'd-box', p[1]);
      b += '<path d="M262 ' + (y + 26) + ' C 360 ' + (y + 26) + ', 380 170, 470 170" class="d-line-soft" fill="none"/>';
    });
    b += box(470, 120, 290, 100, 'Jó kérés', 'd-box-accent', 'pontos, használható válasz');
    return svg('0 0 780 340', { id: 'prompt', text: 'A jó kérés öt eleme' },
      'Öt elem – cél, háttér, szerep, formátum, példa – fut össze egy jó kérésbe.', b);
  },

  'kereses-beszelgetes'() {
    let b = '<text x="190" y="28" text-anchor="middle" class="d-label">Keresőmotor</text><text x="590" y="28" text-anchor="middle" class="d-label">AI-beszélgetés</text>';
    b += box(60, 50, 260, 54, 'kulcsszavak', 'd-box');
    b += arrow(190, 106, 190, 132);
    b += box(60, 134, 260, 54, 'találati lista linkekkel', 'd-box');
    b += arrow(190, 190, 190, 216);
    b += box(60, 218, 260, 64, 'te olvasod és döntesz', 'd-box', 'a forrás mindig látszik');
    b += box(460, 50, 260, 54, 'kérdés teljes mondatban', 'd-box');
    b += arrow(590, 106, 590, 132);
    b += box(460, 134, 260, 54, 'kész, megfogalmazott válasz', 'd-box');
    b += arrow(590, 190, 590, 216);
    b += box(460, 218, 260, 64, 'te ellenőrzöd', 'd-box-accent', 'a forrás nem mindig látszik');
    b += '<line x1="390" y1="40" x2="390" y2="290" class="d-line-soft" stroke-dasharray="6 6"/>';
    return svg('0 0 780 300', { id: 'kereses', text: 'Keresés és beszélgetés különbsége' },
      'Bal oldalon a keresőmotor: kulcsszavak, találati lista, te olvasod a forrást. Jobb oldalon az AI: kérdés, kész válasz, amit neked kell ellenőrizned.', b);
  },

  'kontextus-ablak'() {
    let b = '<rect x="250" y="20" width="280" height="250" rx="16" class="d-window"/>' +
      '<text x="390" y="292" text-anchor="middle" class="d-sub">a modell egyszerre ennyit „lát” (kontextusablak)</text>';
    const msgs = ['1. üzenet', '2. üzenet', '3. üzenet', '4. üzenet', '5. üzenet', '6. üzenet', '7. üzenet'];
    msgs.forEach((m, i) => {
      const y = -46 + i * 44;
      const inside = y >= 30 && y <= 230;
      const x = i % 2 ? 300 : 270;
      b += '<rect x="' + x + '" y="' + (y + 26) + '" width="210" height="34" rx="10" class="' + (inside ? 'd-msg' : 'd-msg-out') + '"/>' +
        '<text x="' + (x + 105) + '" y="' + (y + 48) + '" text-anchor="middle" class="d-msg-label' + (inside ? '' : '-out') + '">' + m + '</text>';
    });
    b += '<text x="120" y="40" text-anchor="middle" class="d-sub">a legrégebbi</text><text x="120" y="60" text-anchor="middle" class="d-sub">részletek kieshetnek</text>';
    b += arrow(170, 30, 260, 6);
    b += '<text x="660" y="240" text-anchor="middle" class="d-sub">mindig az új</text><text x="660" y="260" text-anchor="middle" class="d-sub">üzenet kerül be</text>';
    b += arrow(600, 250, 520, 250);
    return svg('0 0 780 310', { id: 'kontextus', text: 'A kontextusablak' },
      'Egy keret, amelybe az üzenetek alulról érkeznek; a legrégebbiek felül kicsúsznak a keretből, és a modell már nem látja őket pontosan.', b);
  },

  'agens-ciklus'() {
    const steps = [['Kérés', 'te írod'], ['Terv', 'az ágens javasolja'], ['Jóváhagyás', 'te döntesz'], ['Végrehajtás', 'az ágens dolgozik'], ['Ellenőrzés', 'együtt nézitek meg']];
    const cx = 390, cy = 170, r = 125;
    let b = '';
    steps.forEach((s, i) => {
      const a = -Math.PI / 2 + i * (2 * Math.PI / steps.length);
      const x = cx + r * Math.cos(a) * 1.9 - 85;
      const y = cy + r * Math.sin(a) - 28;
      b += box(Math.round(x), Math.round(y), 170, 58, s[0], i === 2 ? 'd-box-accent' : 'd-box', s[1]);
    });
    b += '<circle cx="' + cx + '" cy="' + cy + '" r="62" class="d-ring"/><text x="' + cx + '" y="' + (cy + 6) + '" text-anchor="middle" class="d-label">ismétlés</text>';
    return svg('0 0 780 340', { id: 'agens', text: 'Egy AI-ágens munkaciklusa' },
      'Öt lépés körben: kérés, terv, jóváhagyás, végrehajtás, ellenőrzés, majd szükség esetén újra.', b);
  },

  'bizalom-matrix'() {
    let b = '<rect x="140" y="20" width="300" height="130" rx="12" class="d-q-ok"/><rect x="450" y="20" width="300" height="130" rx="12" class="d-q-mid"/>' +
      '<rect x="140" y="160" width="300" height="130" rx="12" class="d-q-mid"/><rect x="450" y="160" width="300" height="130" rx="12" class="d-q-stop"/>';
    b += '<text x="290" y="78" text-anchor="middle" class="d-label">Nyugodtan használd</text><text x="290" y="102" text-anchor="middle" class="d-sub">ötlet, vázlat, átfogalmazás</text>';
    b += '<text x="600" y="78" text-anchor="middle" class="d-label">Használd, de ellenőrizd</text><text x="600" y="102" text-anchor="middle" class="d-sub">hivatalos levél, összefoglaló</text>';
    b += '<text x="290" y="218" text-anchor="middle" class="d-label">Nézz utána</text><text x="290" y="242" text-anchor="middle" class="d-sub">tény, szám, dátum, idézet</text>';
    b += '<text x="600" y="218" text-anchor="middle" class="d-label">Szakemberrel döntsd el</text><text x="600" y="242" text-anchor="middle" class="d-sub">egészség, jog, pénz</text>';
    b += '<text x="445" y="320" text-anchor="middle" class="d-sub">mekkora a tét, ha téved →</text>';
    b += '<text x="70" y="160" text-anchor="middle" class="d-sub" transform="rotate(-90 70 160)">mennyire kell pontos tény →</text>';
    return svg('0 0 780 335', { id: 'bizalom', text: 'Mikor bízhatsz az AI válaszában?' },
      'Négy mező: ötletnél és vázlatnál nyugodtan használhatod; hivatalos szövegnél ellenőrizd; ténynél, számnál nézz utána; egészség, jog, pénz esetén szakemberrel döntsd el.', b);
  },
};

export function diagram(name) {
  const f = D[name];
  return f ? '<div class="diagram-wrap">' + f() + '</div>' : '';
}

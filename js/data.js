// Tartalom betöltése: kurzus.json (modulok sorrendje) + modulonkénti tartalomfájlok + média + szószedet.

export const course = { modulok: [], fejezetById: {}, modulById: {}, media: {}, szoszedet: {}, meta: {}, osszehasonlitas: [], lepesabrak: {} };

async function getJSON(url) {
  const res = await fetch(url, { cache: 'no-cache' });
  if (!res.ok) throw new Error(url + ' (' + res.status + ')');
  return res.json();
}

export async function loadCourse() {
  const [kurzus, media, szoszedet, ossze, abrak] = await Promise.all([

    getJSON('data/kurzus.json?v=7150738a'),
    getJSON('data/media.json?v=7150738a'),
    getJSON('data/szoszedet.json?v=7150738a'),
    getJSON('data/osszehasonlitas.json?v=7150738a').catch(() => ({ peldak: [] })),
    getJSON('data/lepesabrak.json?v=7150738a').catch(() => ({})),
  ]);
  course.lepesabrak = abrak;
  course.osszehasonlitas = ossze.peldak || [];
  course.meta = kurzus;
  (media.elemek || []).forEach((m) => { course.media[m.id] = m; });
  (szoszedet.fogalmak || []).forEach((f) => { course.szoszedet[f.id] = f; });

  const tartalmak = await Promise.all(kurzus.modulok.map((m) => getJSON('data/' + m.fajl)));
  course.modulok = kurzus.modulok.map((m, i) => {
    const mod = Object.assign({}, m, tartalmak[i]);
    mod.index = i;
    mod.fejezetek = (mod.fejezetek || []).map((f, j) => {
      const fej = Object.assign({}, f, { modulId: mod.id, index: j });
      course.fejezetById[fej.id] = fej;
      return fej;
    });
    course.modulById[mod.id] = mod;
    return mod;
  });
  deriveNumbers();
  resolveRefs(course.modulok);
  resolveRefs(course.meta.kovetkezoLepesek);
  return course;
}

// A megjelenő sorszámok és az idők a modulok sorrendjéből és a fejezetek perceiből számolódnak.
// Az azonosítók (m01, 1.1, zp stb.) stabilak maradnak: ezek a mentett haladás kulcsai.
function deriveNumbers() {
  course.modulok.forEach((mod, i) => {
    mod.sorszam = i + 1;
    mod.fejezetek.forEach((ch, j) => {
      ch.label = mod.id === 'zp' ? ch.id : mod.sorszam + '.' + (j + 1);
    });
    mod.ido = mod.fejezetek.reduce((a, ch) => a + (Number(ch.ido) || 0), 0);
  });
}

// A szövegekben {{mod:m09}} (a modul megjelenő sorszáma) és {{fej:9.3}} (a fejezet megjelenő címkéje)
// jelölés áll; betöltéskor behelyettesítjük, így sorrendváltozásnál nem törnek el a hivatkozások.
function resolveRefs(node, parent, key) {
  if (typeof node === 'string') {
    if (node.indexOf('{{') === -1) return;
    parent[key] = node
      .replace(/\b([Aa])z? \{\{mod:([^}]+)\}\}/g, (m, a, id) => { const x = course.modulById[id.trim()]; return x ? a + (x.sorszam === 1 || x.sorszam === 5 ? 'z ' : ' ') + x.sorszam : m; })
      .replace(/\{\{mod:([^}]+)\}\}/g, (m, id) => { const x = course.modulById[id.trim()]; return x ? String(x.sorszam) : m; })
      .replace(/\{\{fej:([^}]+)\}\}/g, (m, id) => { const x = course.fejezetById[id.trim()]; return x ? x.label : m; });
  } else if (Array.isArray(node)) {
    node.forEach((v, i) => resolveRefs(v, node, i));
  } else if (node && typeof node === 'object') {
    Object.keys(node).forEach((k) => resolveRefs(node[k], node, k));
  }
}

// A kurzus számai egyetlen helyről: modulok és fejezetek száma, összes perc, egész órára kerekített óra.
export function getCourseStats() {
  const modules = course.modulok.length;
  const chapters = course.modulok.reduce((a, m) => a + m.fejezetek.length, 0);
  const minutes = course.modulok.reduce((a, m) => a + m.ido, 0);
  const hours = Math.max(1, Math.round(minutes / 60));
  return { modules, chapters, minutes, hours, label: modules + ' modul · kb. ' + hours + ' óra tartalom' };
}

export function media(id) { return id ? course.media[id] || null : null; }

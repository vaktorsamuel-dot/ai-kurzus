// Tartalom betöltése: kurzus.json (modulok sorrendje) + modulonkénti tartalomfájlok + média + szószedet.

export const course = { modulok: [], fejezetById: {}, modulById: {}, media: {}, szoszedet: {}, meta: {} };

async function getJSON(url) {
  const res = await fetch(url, { cache: 'no-cache' });
  if (!res.ok) throw new Error(url + ' (' + res.status + ')');
  return res.json();
}

export async function loadCourse() {
  const [kurzus, media, szoszedet] = await Promise.all([
    getJSON('data/kurzus.json'),
    getJSON('data/media.json'),
    getJSON('data/szoszedet.json'),
  ]);
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
  return course;
}

export function media(id) { return id ? course.media[id] || null : null; }

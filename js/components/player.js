// Egyedi videólejátszó: ±10 mp, idővonal, hangerő, sebesség, felirat, teljes képernyő,
// pozíciómentés, és csalásbiztos „megnézve” számítás a ténylegesen lejátszott idő alapján.

import { media } from '../data.js?v=6dc27975';
import { chapterState, saveProgress, getSettings } from '../store.js?v=6dc27975';
import { markVideoUnavailable, VIDEO_PASS } from '../progress.js?v=6dc27975';
import { esc, icon, fmtTime } from '../util.js?v=6dc27975';
import { placeholder, placeholderInner, DEV } from './media.js?v=6dc27975';

const SPEEDS = [0.75, 1, 1.25, 1.5];

function transcript(m) {
  const f = m && m.forgatokonyv;
  if (!f || !f.jelenetek) return '';
  const rows = f.jelenetek.map((j, i) => '<li><p class="small muted">' + (i + 1) + '. jelenet' + (j.kep ? ' – ' + esc(j.kep) : '') + '</p><p>' + esc(j.narracio) + '</p></li>').join('');
  return '<details class="transcript"><summary>Átirat' + (m.statusz === 'kesz' ? '' : ' (a videó tervezett szövege)') + '</summary><ol>' + rows + '</ol></details>';
}

function mergeRanges(ranges) {
  const r = ranges.slice().sort((a, b) => a[0] - b[0]);
  const out = [];
  r.forEach((x) => {
    const last = out[out.length - 1];
    if (last && x[0] <= last[1] + 0.3) last[1] = Math.max(last[1], x[1]);
    else out.push([x[0], x[1]]);
  });
  return out;
}
function watchedSum(ranges) { return ranges.reduce((a, r) => a + (r[1] - r[0]), 0); }

export function renderPlayer(mediaId, chapterId) {
  const m = media(mediaId);
  const title = m ? m.cim || m.alt : 'Videó';

  if (!m || m.statusz !== 'kesz') {
    // Hiányzó videó: élesben a szakasz meg sem jelenik; fejlesztői módban helyőrző.
    if (!DEV) return { html: '', empty: true, mount() { return () => {}; } };
    return {
      html: '<div class="video-block"><figure class="media">' + placeholder(m, 'video', '16 / 9') + '</figure>' +
        '<p class="muted small">' + icon('video') + ' A videó még nem készült el, ezért a fejezet nélküle is lezárható. Az alábbi átiratban elolvashatod, miről szól majd.</p>' +
        transcript(m) + '</div>',
      mount() { return () => {}; },
    };
  }

  const s = getSettings();
  const base = 'assets/video/' + m.fajl;
  const poster = m.poster ? ' poster="assets/img/' + esc(m.poster) + '"' : '';
  const track = m.felirat_fajl ? '<track kind="subtitles" srclang="hu" label="Magyar" src="assets/captions/' + esc(m.felirat_fajl) + '"' + (s.feliratok ? ' default' : '') + '>' : '';

  const html =
    '<div class="video-block">' +
    '<div class="player" tabindex="0" role="region" aria-label="Videólejátszó: ' + esc(title) + '. Billentyűk: szóköz – lejátszás/szünet, bal/jobb nyíl – 10 másodperc vissza/előre, C – felirat, F – teljes képernyő, M – némítás.">' +
    '<div class="player-stage media-frame" style="aspect-ratio:16 / 9">' +
    '<video preload="metadata" playsinline' + poster + '><source src="' + esc(base) + '" type="video/mp4">' + track + '</video>' +
    '<button type="button" class="player-bigplay" aria-label="Lejátszás">' + icon('play') + '</button>' +
    '<div class="player-resume" hidden><p>Folytatás innen: <strong class="resume-time"></strong>?</p><div class="row">' +
    '<button type="button" class="btn btn-accent" data-act="resume">Folytatás</button><button type="button" class="btn btn-ghost-light" data-act="restart">Elölről</button></div></div>' +
    '</div>' +
    '<div class="player-bar">' +
    '<div class="player-timeline"><input type="range" class="pl-seek" min="0" max="100" step="0.1" value="0" aria-label="Idővonal"><div class="pl-buffer"></div></div>' +
    '<div class="player-controls">' +
    '<button type="button" class="pl-btn" data-act="toggle" aria-label="Lejátszás">' + icon('play') + '</button>' +
    '<button type="button" class="pl-btn" data-act="back" aria-label="10 másodperc vissza">' + icon('back10') + '</button>' +
    '<button type="button" class="pl-btn" data-act="fwd" aria-label="10 másodperc előre">' + icon('fwd10') + '</button>' +
    '<span class="pl-time" aria-live="off"><span class="pl-cur">0:00</span> / <span class="pl-dur">0:00</span></span>' +
    '<span class="pl-spacer"></span>' +
    '<button type="button" class="pl-btn" data-act="mute" aria-label="Némítás" aria-pressed="false">' + icon('volume') + '</button>' +
    '<input type="range" class="pl-vol" min="0" max="1" step="0.05" value="1" aria-label="Hangerő">' +
    '<label class="pl-speed"><span class="visually-hidden">Lejátszási sebesség</span><select data-act="speed">' +
    SPEEDS.map((x) => '<option value="' + x + '"' + (x === 1 ? ' selected' : '') + '>' + String(x).replace('.', ',') + '×</option>').join('') + '</select></label>' +
    '<button type="button" class="pl-btn" data-act="cc" aria-label="Felirat" aria-pressed="' + (s.feliratok ? 'true' : 'false') + '"' + (track ? '' : ' disabled') + '>' + icon('cc') + '</button>' +
    '<button type="button" class="pl-btn" data-act="fs" aria-label="Teljes képernyő">' + icon('fullscreen') + '</button>' +
    '</div></div></div>' +
    '<p class="pl-watched small muted" aria-live="polite"></p>' +
    transcript(m) + '</div>';

  function mount(root, onProgress) {
    const wrap = root.querySelector('.player');
    const v = wrap.querySelector('video');
    const seek = wrap.querySelector('.pl-seek');
    const vol = wrap.querySelector('.pl-vol');
    const cur = wrap.querySelector('.pl-cur');
    const dur = wrap.querySelector('.pl-dur');
    const big = wrap.querySelector('.player-bigplay');
    const resumeBox = wrap.querySelector('.player-resume');
    const watchedEl = root.querySelector('.pl-watched');
    const btn = (a) => wrap.querySelector('[data-act="' + a + '"]');

    const cs = chapterState(chapterId);
    if (!cs.video) cs.video = { ranges: [], pos: 0, duration: 0, done: false };
    const vs = cs.video;
    let lastT = null;
    let saveTimer = null;
    let failed = false;

    const save = () => { vs.pos = v.currentTime || vs.pos; saveProgress(); };
    const saveSoon = () => { if (!saveTimer) saveTimer = setTimeout(() => { saveTimer = null; save(); }, 3000); };

    function updateWatched() {
      const d = v.duration || vs.duration;
      if (!d) return;
      const frac = Math.min(1, watchedSum(vs.ranges) / d);
      watchedEl.textContent = vs.done ? 'Megnézve ✓ (a fejezet lezárásához elég)' : 'Megnézve: ' + Math.floor(frac * 100) + '% – a lezáráshoz legalább 90% kell.';
      if (!vs.done && frac >= VIDEO_PASS) {
        vs.done = true;
        saveProgress();
        watchedEl.textContent = 'Megnézve ✓ (a fejezet lezárásához elég)';
        onProgress && onProgress();
      }
    }

    function fail() {
      if (failed) return;
      failed = true;
      markVideoUnavailable(m.id);
      const stage = wrap.querySelector('.player-stage');
      if (!DEV) { // betölthetetlen videó: a szakasz eltűnik, a fejezet nélküle is lezárható
        const sec = wrap.closest('.ch-sec');
        if (sec) sec.hidden = true;
        onProgress && onProgress();
        return;
      }
      stage.classList.add('ph');
      stage.innerHTML = placeholderInner(m, 'video');
      wrap.querySelector('.player-bar').remove();
      watchedEl.textContent = 'A videó nem tölthető be, ezért a fejezet nélküle is lezárható. Lent elolvashatod az átiratot.';
      onProgress && onProgress();
    }
    v.addEventListener('error', fail);
    v.querySelector('source').addEventListener('error', fail);

    function setPlayIcon() {
      const b = btn('toggle');
      b.innerHTML = icon(v.paused ? 'play' : 'pause');
      b.setAttribute('aria-label', v.paused ? 'Lejátszás' : 'Szünet');
      big.hidden = !v.paused || !resumeBox.hidden;
      wrap.classList.toggle('playing', !v.paused);
    }
    function toggle() { if (v.paused) { resumeBox.hidden = true; v.play().catch(() => {}); } else v.pause(); }
    function jump(d) {
      if (!v.duration) return;
      v.currentTime = Math.max(0, Math.min(v.duration - 0.1, v.currentTime + d));
    }
    function setCC(on) {
      const t = v.textTracks && v.textTracks[0];
      if (t) t.mode = on ? 'showing' : 'hidden';
      btn('cc').setAttribute('aria-pressed', String(on));
    }
    function fullscreen() {
      if (document.fullscreenElement) { document.exitFullscreen(); return; }
      if (wrap.requestFullscreen) wrap.requestFullscreen().catch(() => {});
      else if (v.webkitEnterFullscreen) v.webkitEnterFullscreen();
    }

    v.addEventListener('loadedmetadata', () => {
      vs.duration = v.duration;
      dur.textContent = fmtTime(v.duration);
      seek.max = v.duration;
      setCC(!!s.feliratok);
      if (vs.pos > 5 && vs.pos < v.duration - 5) {
        wrap.querySelector('.resume-time').textContent = fmtTime(vs.pos);
        resumeBox.hidden = false;
        big.hidden = true;
      } else if (s.autoplay) {
        v.play().catch(() => {});
      }
      updateWatched();
    });
    v.addEventListener('timeupdate', () => {
      const t = v.currentTime;
      if (!v.paused && !v.seeking && lastT !== null) {
        const d = t - lastT;
        if (d > 0 && d < 1.5 * v.playbackRate + 0.5) vs.ranges = mergeRanges(vs.ranges.concat([[lastT, t]]));
      }
      lastT = t;
      cur.textContent = fmtTime(t);
      if (document.activeElement !== seek) seek.value = t;
      seek.setAttribute('aria-valuetext', fmtTime(t) + ' / ' + fmtTime(v.duration));
      updateWatched();
      saveSoon();
    });
    v.addEventListener('seeking', () => { lastT = null; });
    v.addEventListener('seeked', () => { lastT = v.currentTime; });
    v.addEventListener('play', () => { lastT = v.currentTime; setPlayIcon(); });
    v.addEventListener('pause', () => { setPlayIcon(); save(); });
    v.addEventListener('ended', () => { setPlayIcon(); vs.pos = 0; saveProgress(); });
    v.addEventListener('click', toggle);
    v.addEventListener('volumechange', () => {
      const muted = v.muted || v.volume === 0;
      btn('mute').innerHTML = icon(muted ? 'mute' : 'volume');
      btn('mute').setAttribute('aria-pressed', String(muted));
      btn('mute').setAttribute('aria-label', muted ? 'Hang visszakapcsolása' : 'Némítás');
      vol.value = v.muted ? 0 : v.volume;
    });

    big.addEventListener('click', toggle);
    btn('toggle').addEventListener('click', toggle);
    btn('back').addEventListener('click', () => jump(-10));
    btn('fwd').addEventListener('click', () => jump(10));
    btn('mute').addEventListener('click', () => { v.muted = !v.muted; if (!v.muted && v.volume === 0) v.volume = 0.6; });
    vol.addEventListener('input', () => { v.volume = Number(vol.value); v.muted = v.volume === 0; });
    btn('speed').addEventListener('change', (e) => { v.playbackRate = Number(e.target.value); });
    btn('cc').addEventListener('click', () => setCC(btn('cc').getAttribute('aria-pressed') !== 'true'));
    btn('fs').addEventListener('click', fullscreen);
    seek.addEventListener('input', () => { v.currentTime = Number(seek.value); cur.textContent = fmtTime(v.currentTime); });
    wrap.querySelector('[data-act="resume"]').addEventListener('click', () => { v.currentTime = vs.pos; resumeBox.hidden = true; v.play().catch(() => {}); });
    wrap.querySelector('[data-act="restart"]').addEventListener('click', () => { v.currentTime = 0; resumeBox.hidden = true; v.play().catch(() => {}); });

    wrap.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'SELECT' || e.target === vol) return;
      const k = e.key;
      if (k === 'ArrowLeft') { e.preventDefault(); jump(-10); }
      else if (k === 'ArrowRight') { e.preventDefault(); jump(10); }
      else if ((k === ' ' || k === 'k') && e.target.tagName !== 'BUTTON') { e.preventDefault(); toggle(); }
      else if (k === 'f' || k === 'F') { e.preventDefault(); fullscreen(); }
      else if (k === 'c' || k === 'C') { e.preventDefault(); setCC(btn('cc').getAttribute('aria-pressed') !== 'true'); }
      else if (k === 'm' || k === 'M') { e.preventDefault(); v.muted = !v.muted; }
    });

    setPlayIcon();
    if (vs.done) updateWatched();

    return () => { clearTimeout(saveTimer); if (!failed) { try { v.pause(); } catch (e) { /* */ } save(); } };
  }

  return { html, mount };
}

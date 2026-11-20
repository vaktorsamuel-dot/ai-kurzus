#!/usr/bin/env python3
"""MEDIA-TODO.md generálása a data/media.json alapján.

Használat (a kurzus mappájából):  python3 tools/media_todo.py

Felsorolja az összes 'hianyzik' státuszú médiaelemet: azonosító, hova kerül,
fájlnév és formátum, valamint a generálási prompt vagy a videó forgatókönyve.
Ellenőrzi azt is, hogy a 'kesz' státuszú elemek fájljai tényleg megvannak-e.
"""
import json
import os
import sys
from datetime import date

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MEDIA = os.path.join(ROOT, 'data', 'media.json')
OUT = os.path.join(ROOT, 'MEDIA-TODO.md')


def expected_files(e):
    """A ténylegesen szükséges fájlok listája (relatív útvonalak)."""
    if e['tipus'] == 'kep':
        base = os.path.splitext(e['fajl'])[0]
        return ['assets/img/' + base + '.webp', 'assets/img/' + base + '.jpg']
    files = ['assets/video/' + e['fajl']]
    if e.get('felirat_fajl'):
        files.append('assets/captions/' + e['felirat_fajl'])
    if e.get('poster'):
        files.append('assets/img/' + e['poster'])
    return files


def main():
    with open(MEDIA, encoding='utf-8') as f:
        data = json.load(f)
    items = data['elemek']
    missing = [e for e in items if e.get('statusz') != 'kesz']
    done = [e for e in items if e.get('statusz') == 'kesz']

    warnings = []
    for e in done:
        for rel in expected_files(e):
            if not os.path.exists(os.path.join(ROOT, rel)):
                warnings.append('`%s` státusza „kesz”, de hiányzik a fájl: `%s`' % (e['id'], rel))

    imgs = [e for e in missing if e['tipus'] == 'kep']
    vids = [e for e in missing if e['tipus'] == 'video']

    L = []
    L.append('# Hiányzó média – teendőlista')
    L.append('')
    L.append('> Automatikusan generálva a `data/media.json` alapján (%s). Ne szerkeszd kézzel – futtasd újra: `python3 tools/media_todo.py`.' % date.today().isoformat())
    L.append('')
    L.append('Összesen **%d** elem, ebből **%d kész**, **%d hiányzik** (%d kép, %d videó).' % (len(items), len(done), len(missing), len(imgs), len(vids)))
    L.append('')
    L.append('## Hogyan pótolj egy elemet?')
    L.append('')
    L.append('1. Készítsd el a képet vagy videót az alábbi leírás alapján.')
    L.append('2. Képnél mentsd el **webp** és **jpg** formátumban is ugyanazzal a névvel (pl. `m01-1-1-hero.webp` és `m01-1-1-hero.jpg`) az `assets/img/` mappába. Hero: 1600×900, kártya: 800×600.')
    L.append('3. Videónál az mp4 az `assets/video/`, a `.vtt` felirat az `assets/captions/`, a poszterkép (jpg, 1280×720) az `assets/img/` mappába kerül.')
    L.append('4. A `data/media.json`-ban az elem `statusz` mezőjét írd át `"kesz"`-re.')
    L.append('5. Futtasd újra ezt a szkriptet. Az oldal azonnal a valódi fájlt mutatja; ha a fájl mégsem tölthető be, automatikusan helyőrző jelenik meg.')
    L.append('')
    if warnings:
        L.append('## ⚠ Figyelmeztetések')
        L.append('')
        for w in warnings:
            L.append('- ' + w)
        L.append('')

    L.append('## Képek (%d)' % len(imgs))
    L.append('')
    L.append('Stílus mindenhol: valósághű, természetes fény, hétköznapi helyzet, nem „AI-hatású” (természetes kezek, nincs csillogó digitális művészet), nincs olvasható márkajelzés vagy szöveg.')
    L.append('')
    for e in imgs:
        L.append('### `%s` – %s' % (e['id'], e.get('hova', '')))
        L.append('')
        L.append('- **Fájl:** `%s` (+ `.jpg` tartalék) · **méret:** %s · **mappa:** `assets/img/`' % (os.path.splitext(e['fajl'])[0] + '.webp', e.get('meret', '1600x900').replace('x', '×')))
        L.append('- **Alt szöveg:** %s' % e.get('alt', ''))
        if e.get('prompt_hu'):
            L.append('- **Leírás (HU):** %s' % e['prompt_hu'])
        if e.get('prompt_en'):
            L.append('- **Prompt (EN):**')
            L.append('')
            L.append('  ```')
            L.append('  ' + e['prompt_en'])
            L.append('  ```')
        L.append('')

    L.append('## Videók (%d)' % len(vids))
    L.append('')
    L.append('Minden videó: 1–4 perc, nyugodt tempó, magyar narráció vagy felirat, mp4 (H.264) 1280×720, `.vtt` felirat magyarul. Hang nélkül is érthető legyen. Ha a videó AI-val generált részt tartalmaz, a képen jelölni kell.')
    L.append('')
    for e in vids:
        L.append('### `%s` – %s' % (e['id'], e.get('cim', e.get('hova', ''))))
        L.append('')
        L.append('- **Hova:** %s' % e.get('hova', ''))
        L.append('- **Fájlok:** `assets/video/%s`, `assets/captions/%s`, poszter: `assets/img/%s`' % (e['fajl'], e.get('felirat_fajl', ''), e.get('poster', '')))
        L.append('- **Hossz:** %s · **formátum:** %s · **kötelező a fejezet lezárásához:** %s' % (e.get('hossz', ''), e.get('formatum', ''), 'igen (90%)' if e.get('kotelezo') else 'nem'))
        L.append('- **Leírás:** %s' % e.get('alt', ''))
        fk = e.get('forgatokonyv') or {}
        if fk:
            L.append('')
            L.append('**Forgatókönyv.** %s' % fk.get('osszefoglalo', ''))
            L.append('')
            L.append('| # | Kép / képernyő | Narráció (= felirat szövege) |')
            L.append('|---|---|---|')
            for i, j in enumerate(fk.get('jelenetek', []), 1):
                L.append('| %d | %s | %s |' % (i, j.get('kep', '').replace('|', '/'), j.get('narracio', '').replace('|', '/')))
        L.append('')

    with open(OUT, 'w', encoding='utf-8') as f:
        f.write('\n'.join(L).rstrip() + '\n')
    print('MEDIA-TODO.md frissítve: %d hiányzó elem (%d kép, %d videó).' % (len(missing), len(imgs), len(vids)))
    if warnings:
        print('Figyelmeztetések:', len(warnings), file=sys.stderr)


if __name__ == '__main__':
    main()

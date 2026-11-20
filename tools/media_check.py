#!/usr/bin/env python3
"""Kilistázza, melyik <Media> (képhely vagy videó) mögül hiányzik a fájl.

Használat:  python3 tools/media_check.py
Ellenőrzi a data/media.json elemeit, és azt is, hogy a tartalomfájlokban (data/tartalom/*.json)
hivatkozott média-azonosítók léteznek-e a manifesztben. Hiányzó fájl esetén az oldal semmit nem
jelenít meg (nincs hibás elem); ez a lista a teendő. Kilépési kód: 0 mindig, ha a manifeszt ép.
"""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
manifest = json.loads((ROOT / "data" / "media.json").read_text(encoding="utf-8"))["elemek"]
byid = {e["id"]: e for e in manifest}


def fajlok(e):
    if e["tipus"] == "kep":
        b = Path(e["fajl"]).stem
        return ["assets/img/%s.webp" % b, "assets/img/%s.jpg" % b]
    out = ["assets/video/" + e["fajl"]]
    if e.get("felirat_fajl"):
        out.append("assets/captions/" + e["felirat_fajl"])
    if e.get("poster"):
        out.append("assets/img/" + e["poster"])
    return out


# hol van használva
hasznalat = {}
for p in sorted((ROOT / "data" / "tartalom").glob("*.json")):
    for az in re.findall(r'"(?:hero|media)"\s*:\s*"([^"]+)"', p.read_text(encoding="utf-8")):
        hasznalat.setdefault(az, []).append(p.stem)

hianyzo = 0
rossz = []
for az, hol in hasznalat.items():
    if az not in byid:
        rossz.append("Hivatkozott, de nincs a media.json-ban: %s (%s)" % (az, ", ".join(hol)))
for e in manifest:
    hianyzik = [f for f in fajlok(e) if not (ROOT / f).exists()]
    if hianyzik:
        hianyzo += 1
        print("HIÁNYZIK  %-10s %-6s %s  ->  %s" % (e["id"], e["tipus"], e.get("hova", ""), ", ".join(hianyzik)))
print("\nÖsszesen %d elem, ebből %d hiányzik (ezek az oldalon most nem látszanak)." % (len(manifest), hianyzo))
for r in rossz:
    print("FIGYELEM:", r)

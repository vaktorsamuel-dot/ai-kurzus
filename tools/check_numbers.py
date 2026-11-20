#!/usr/bin/env python3
"""Kézzel beírt kurzusszámok keresése ("11 modul", "kb. 9 óra", "tizenegy modul" stb.).

A kurzus számait (modulok, fejezetek, órák) kizárólag a getCourseStats() adja (js/data.js).
Ez a script hibával (kilépési kód 1) jelzi, ha a forrásban kézzel beírt ilyen szám van.
Futtatás:  python3 tools/check_numbers.py
Szándékos kivétel: tedd a sor végére a  szám-rendben  megjegyzést.
"""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SZAMSZAVAK = "tizenegy|tizenkettő|tizenkét|tizenhárom|tizennégy|tizenöt|kilenc|nyolc|tíz|húsz|harminc"
MINTAK = [
    re.compile(r"(?<![\d.,])\d+\s+(modul|fejezet)(?!\w*\s*\()", re.I),                 # "11 modul", "35 fejezet"
    re.compile(r"\b(" + SZAMSZAVAK + r")\s+(modul|fejezet)", re.I),                     # "tizenegy modul"
    re.compile(r"kb\.?\s*\d+\s*óra\b(?!\s*(án|ás))", re.I),                                       # "kb. 9 óra"
    re.compile(r"(?<![\d.,])\d+\s+(óra|órányi)\s+(tartalom|anyag)", re.I),              # "7 óra tartalom"
    re.compile(r"/\s*\d+\s+modul\s+kész", re.I),                                        # "0 / 12 modul kész"
]
FAJLOK = ["index.html", "README.md"]
MAPPAK = ["js", "data"]
KIHAGY = {"data/media.json", "data/szoszedet.json"}


def fajlok():
    for f in FAJLOK:
        p = ROOT / f
        if p.exists():
            yield p
    for m in MAPPAK:
        for p in sorted((ROOT / m).rglob("*")):
            if p.suffix in {".js", ".json", ".html", ".md"} and str(p.relative_to(ROOT)) not in KIHAGY:
                yield p


def main():
    hibak = []
    for p in fajlok():
        for n, sor in enumerate(p.read_text(encoding="utf-8").splitlines(), 1):
            if "szám-rendben" in sor:
                continue
            for minta in MINTAK:
                m = minta.search(sor)
                if m:
                    hibak.append("%s:%d: %r" % (p.relative_to(ROOT), n, sor.strip()[:140]))
                    break
    if hibak:
        print("Kézzel beírt kurzusszám található (használd a getCourseStats()-t):")
        print("\n".join("  " + h for h in hibak))
        sys.exit(1)
    print("Rendben: nincs kézzel beírt modul/fejezet/óra szám.")


if __name__ == "__main__":
    main()

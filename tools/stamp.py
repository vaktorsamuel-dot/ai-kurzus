#!/usr/bin/env python3
"""Gyorsítótár-verzió ("cache busting") GitHub Pages-hez, build-eszköz nélkül.

Közzététel előtt futtasd:  python3 tools/stamp.py
A script a css/ és js/ fájlok tartalmából rövid kivonatot (hash) számol, és ?v=<kivonat> címkét tesz
az index.html css/js hivatkozásaira, a js-fájlok egymás közti importjaira és az adatfájlok lekéréseire.
Ha bármi változik, új a kivonat, így a böngésző nem a régi fájlt használja. Többször is futtatható.
"""
import hashlib
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
V = re.compile(r"\?v=[0-9a-f]{8}")


def kivonat():
    h = hashlib.sha256()
    for d in ("css", "js"):
        for p in sorted((ROOT / d).rglob("*")):
            if p.is_file() and p.suffix in {".js", ".css"}:
                h.update(str(p.relative_to(ROOT)).encode())
                h.update(V.sub("", p.read_text(encoding="utf-8")).encode())
    for p in sorted((ROOT / "data").rglob("*.json")):
        h.update(p.read_bytes())
    return h.hexdigest()[:8]


def bélyeg(szoveg, v, minta):
    return re.sub(minta, lambda m: m.group(1) + "?v=" + v + m.group(2), szoveg)


IMPORT = re.compile(r"(from\s+['\"]\.{1,2}/[^'\"?]+\.js)(['\"])")
GETJSON = re.compile(r"(getJSON\(['\"]data/[^'\"?]+\.json)(['\"]\))")
CSS = re.compile(r'(href="css/[^"?]+\.css)(")')
JS = re.compile(r'(src="js/[^"?]+\.js)(")')


def main():
    v = kivonat()
    for p in (ROOT / "js").rglob("*.js"):
        s = V.sub("", p.read_text(encoding="utf-8"))
        s = bélyeg(s, v, IMPORT)
        s = bélyeg(s, v, GETJSON)
        p.write_text(s, encoding="utf-8")
    idx = ROOT / "index.html"
    s = V.sub("", idx.read_text(encoding="utf-8"))
    s = bélyeg(s, v, CSS)
    s = bélyeg(s, v, JS)
    idx.write_text(s, encoding="utf-8")
    print("Verzió:", v)


if __name__ == "__main__":
    main()

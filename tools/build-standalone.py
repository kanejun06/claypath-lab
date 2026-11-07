#!/usr/bin/env python3
"""Build single-file versions of the three tools into standalone/.

Each tool's HTML loads shared/*.js. This script inlines those files so one HTML file works on its own
(e.g. saved to a PC, or handed to students to modify). three.js and the fonts still come from the CDN.

    python3 tools/build-standalone.py

Run it after changing anything in the tools or in shared/, and commit standalone/ with the change.
"""
import pathlib, re, sys
ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / 'standalone'
TOOLS = [('index.html', 'claypath-lab.html'), ('svg/index.html', 'clayline-lab.html'), ('morph/index.html', 'claymorph-lab.html')]
NAV = "<script>window.ClayNavFiles=[%s];</script>\n" % ','.join(f"'{o}'" for _, o in TOOLS)

def inline(src_rel):
    html = (ROOT / src_rel).read_text(encoding='utf-8')
    def rep(m):
        name = m.group(1)
        js = (ROOT / 'shared' / name).read_text(encoding='utf-8')
        if '</script' in js.lower():
            sys.exit(f'shared/{name} contains </script>; cannot inline')
        pre = NAV if name == 'nav.js' else ''
        return f'{pre}<script>/* ---- inlined from shared/{name} ---- */\n{js}</script>'
    out, n = re.subn(r'<script src="(?:\.\./)?shared/([\w.-]+\.js)"></script>', rep, html)
    if n == 0:
        sys.exit(f'{src_rel}: no shared scripts found')
    if re.search(r'src="[^"]*shared/', out):
        sys.exit(f'{src_rel}: a shared script is still loaded from a file')
    # links that point at the folder layout are replaced by the tab bar (nav.js); nothing else to rewrite
    return out, n

OUT.mkdir(exist_ok=True)
for src, dst in TOOLS:
    html, n = inline(src)
    stamp = '<!-- built by tools/build-standalone.py from %s + shared/*.js — edit those, not this file -->\n' % src
    (OUT / dst).write_text(stamp + html, encoding='utf-8')
    print(f'standalone/{dst}: {n} shared scripts inlined, {len(html)//1024} KB')

#!/usr/bin/env python3
"""Склейка плоского figma-export.html из снапшотов блоков.
CSS каждого блока скоупится префиксом .bNN, шрифты и картинки — data URI."""
import base64, json, os, re, sys

ROOT = '/Users/nikitalapenko/Work/Яндекс Лавка/Франшиза/landing main'
SNAP = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'figma-snap')
SITE = os.path.join(ROOT, 'site')
BLOCKS = ['01-nav','02-hero','03-event','04-numbers','05-business','05-1-darkstore',
          '06-offers','07-steps','08-reviews','09-media','10-faq','11-form','12-footer']

def scope_selector(sel, w):
    s = sel.strip()
    if not s: return s
    if s.startswith(':root'): return s
    s = re.sub(r'^html\.is-embed\s+body\b', w, s)
    s = re.sub(r'^html\.is-embed\b', w, s)
    s = re.sub(r'^body\b', w, s)
    s = re.sub(r'^html\b', w, s)
    if s.startswith(w): return s
    return f'{w} {s}'

def scope_css(css, w):
    """Рекурсивный обход: @media/@supports — внутрь, @keyframes/@font-face — как есть."""
    css = re.sub(r'/\*.*?\*/', '', css, flags=re.S)
    out, i, n = [], 0, len(css)
    while i < n:
        m = re.search(r'[{}]', css[i:])
        if not m:
            out.append(css[i:]); break
        j = i + m.start()
        if css[j] == '}':  # закрывашка верхнего уровня (не должна встретиться)
            out.append(css[i:j+1]); i = j+1; continue
        prelude = css[i:j].strip()
        # найти конец текущего блока с учётом вложенности
        depth, k = 1, j+1
        while k < n and depth:
            if css[k] == '{': depth += 1
            elif css[k] == '}': depth -= 1
            k += 1
        inner = css[j+1:k-1]
        if prelude.startswith('@media') or prelude.startswith('@supports'):
            out.append(f'{prelude} {{{scope_css(inner, w)}}}\n')
        elif prelude.startswith('@keyframes') or prelude.startswith('@font-face') or prelude.startswith('@'):
            out.append(f'{prelude} {{{inner}}}\n')
        else:
            sels = ', '.join(scope_selector(p, w) for p in prelude.split(','))
            out.append(f'{sels} {{{inner}}}\n')
        i = k
    return ''.join(out)

def b64(path, mime):
    with open(path, 'rb') as f:
        return f'data:{mime};base64,' + base64.b64encode(f.read()).decode()

# --- база: tokens + base со шрифтами data-URI ---
tokens = open(os.path.join(SITE, 'blocks/_shared/tokens.css')).read()
base = open(os.path.join(SITE, 'blocks/_shared/base.css')).read()
def font_repl(m):
    fname = m.group(1)
    p = os.path.join(SITE, 'fonts', fname)
    return f'url("{b64(p, "font/ttf")}")'
base = re.sub(r'url\("\.\./\.\./fonts/([^"]+)"\)', font_repl, base)

# --- блоки ---
sections, styles = [], []
for d in BLOCKS:
    data = json.load(open(os.path.join(SNAP, d + '.json')))
    w = '.b' + d[:2] + ('x' if 'darkstore' in d else '')
    css = scope_css(data['styles'], w)
    body = data['body'].strip()
    # картинка даркстора → data URI
    body = body.replace('src="assets/darkstore-map.png"',
                        'src="' + b64(os.path.join(SITE, 'blocks/05-1-darkstore/assets/darkstore-map.png'), 'image/png') + '"')
    styles.append(f'/* ==== {d} ==== */\n{css}')
    cls = w[1:]
    extra = (' ' + data['bodyClass']) if data.get('bodyClass') else ''
    sections.append(f'<div class="{cls}{extra}" data-block="{d}">\n{body}\n</div>')

html = f'''<!doctype html>
<html lang="ru" class="is-embed">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Лендинг франшизы Яндекс Лавки · плоская версия для импорта в Figma</title>
<style>
{tokens}
{base}
/* статика для импорта: всё видимо, ничего не едет */
.reveal {{ opacity: 1 !important; transform: none !important; transition: none !important; }}
* {{ animation-play-state: paused !important; }}
body {{ background: var(--bg); }}
[data-block] {{ position: relative; }}
</style>
<style>
{chr(10).join(styles)}
</style>
</head>
<body>
{chr(10).join(sections)}
</body>
</html>
'''
out = os.path.join(SITE, 'figma-export.html')
open(out, 'w').write(html)
print(out, f'{os.path.getsize(out)/1024/1024:.1f} MB')

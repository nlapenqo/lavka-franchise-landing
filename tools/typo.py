#!/usr/bin/env python3
"""Типографика для HTML: неразрывные пробелы после коротких предлогов/союзов, между числом и словом,
перед тире. Трогает только текст вне тегов, <script> и <style>. Использование: python3 tools/typo.py file.html [...]"""
import re, sys
SHORT = r'(?:в|во|на|и|а|но|с|со|к|ко|о|об|от|до|по|за|из|у|не|ни|же|ли|бы|для|при|под|над|про|без|как|что|или|уже|ещё|это|то)'
RULES = [
    (re.compile(r'(?<![\w&;])(' + SHORT + r') (?=[\wа-яё«(])', re.I), r'\1&nbsp;'),          # предлог + пробел
    (re.compile(r'(?<![\w&;])(' + SHORT + r') (?=[\wа-яё«(])', re.I), r'\1&nbsp;'),          # второй проход: «и в», «а на»
    (re.compile(r'(\d) (?=[а-яё₽%])', re.I), r'\1&nbsp;'),                                     # 17 дарксторов, 250 млн, 28 октября
    (re.compile(r'(млн|тыс\.|тыс) (?=₽)'), r'\1&nbsp;'),                                       # млн ₽
    (re.compile(r'(\S) —'), r'\1&nbsp;—'),                                                     # перед тире
    (re.compile(r'(\S) →'), r'\1&nbsp;→'),
]
def typo(html):
    out, skip = [], False
    for seg in re.split(r'(<[^>]+>)', html):
        if seg.startswith('<'):
            low = seg.lower()
            if low.startswith('<script') or low.startswith('<style'): skip = True
            elif low.startswith('</script') or low.startswith('</style'): skip = False
            out.append(seg); continue
        if skip or not seg.strip(): out.append(seg); continue
        for rx, rep in RULES: seg = rx.sub(rep, seg)
        out.append(seg)
    return ''.join(out)
for path in sys.argv[1:]:
    src = open(path, encoding='utf-8').read(); dst = typo(src)
    open(path, 'w', encoding='utf-8').write(dst)
    print(f'{path}: {src.count("&nbsp;")} → {dst.count("&nbsp;")} nbsp')

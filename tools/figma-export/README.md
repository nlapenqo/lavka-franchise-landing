# Пересборка site/figma-export.html

1. `python3 -m http.server 8931` из корня репо; `python3 snap-receiver.py` отсюда (порт 8932).
2. Playwright открывает каждый `site/blocks/<NN>/final.html?embed=1` (вьюпорт 1440), дожимает каунтеры/reveal и POST'ит `{styles, body}` на `:8932/save?name=<NN>` → `figma-snap/<NN>.json` (готовый сниппет — в docs/figma-import.md или попросить Клода).
3. `python3 build-figma-export.py` — склейка со скоупингом CSS и data-URI шрифтов → `site/figma-export.html`.

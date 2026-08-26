# Лендинг франшизы Яндекс Лавки

Премиальный маркетинговый лендинг для сбора заявок на франшизу Яндекс Лавки.

**Единственный финальный файл:** [`lavka-franchise-offline.html`](./lavka-franchise-offline.html) — веб- и мобильная версии в одном самодостаточном офлайн-файле (шрифты, картинки и скрипты зашиты внутрь; ≥768px — веб, <768px — мобильная сборка E). Это тот же лендинг, что задеплоен на GitHub Pages. Пересборка: `node tools/build-offline-site.mjs`.

**Прод:** https://nlapenqo.github.io/lavka-franchise-landing/ — ветка `gh-pages`; корень собирается скриптом `node tools/build-deploy-root.mjs <куда>` (веб `index.html` ≥768px + мобильная сборка `m.html` <768px, переключение по ширине).

**Исходники:** веб — [`site/`](./site/) (`index.html`, `styles.css`, `app.js`); мобилка — [`concepts/mobile/e-figma.html`](./concepts/mobile/e-figma.html) + `concepts/mobile/_shared/` (контент и поведение блоков). Правки вносить здесь, после правок пересобирать офлайн-файл.

## Структура
- `lavka-franchise-offline.html` — единственный финальный файл: веб + мобилка в одном офлайн-билде (последняя версия от 26.08.2026)
- `site/` — исходники веб-версии: `index.html` (сборка), `blocks/<NN>/final.html` (блоки), `blocks/_shared/` (токены, база, скрипты), `fonts/`, `assets/figma/`
- `concepts/` — `mobile/` (мобильные концепты; финал — `e-figma.html`, сборка E), `steps-scroll/` (серии блока «Как стать партнёром»), `adaptive/` (вариант «плавного» адаптива)
- `tools/` — `build-offline-site.mjs` (финальный офлайн-файл: веб + мобилка), `build-deploy-root.mjs` (корень gh-pages), `figma-export/`
- `blocks/` — песочница концептов: все версии всех блоков, галерея [`blocks/index.html`](./blocks/index.html)
- `docs/` — ТЗ, брифы, дизайн-система, аудиты (не публикуется, в `.gitignore`)
- `references/` — исходные материалы и шрифты YS Geo / YS Text (`references/fonts/`)
- `badge/` — бейдж мероприятия (отдельный мини-проект)
- `partner-day/` — материалы дня партнёров (отдельный мини-проект)
- `archive/` — черновики, старые сборки и промежуточные артефакты — см. `archive/README.md`; уборка от 14.08.2026 — в `archive/2026-08-14-cleanup/`
- `index.html` — локальный редирект на `site/index.html` (навигация по репо; в проде на `gh-pages` корневой `index.html` — это собранный лендинг, не этот файл)

## Статус
Данные, тексты и визуалы — заглушки (рыба); не является публичной офертой.

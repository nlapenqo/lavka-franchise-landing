# Лендинг франшизы Яндекс Лавки

Премиальный маркетинговый лендинг для сбора заявок на франшизу Яндекс Лавки.

**Финальная версия сайта — https://nlapenqo.github.io/lavka-franchise-landing/** — один адаптивный документ на все экраны: веб (≥768px), планшет и телефон (<768px). Это точка истины, всё в репозитории сверяется с ней. Состояние зафиксировано тегами `final-2026-09-03` (исходники) и `prod-2026-09-03` (залитое).

**Исходники:** [`site/`](./site/) — `index.html`, `styles.css`, `mobile.css` (слой <768px), `app.js`, `assets/`, `fonts/`. Правки вносить здесь.

**Сборка:** `node tools/build-site.mjs` → `export/lavka-franchise.html` (всё зашито, для хостинга и пересылки) и `export/lavka-franchise-lpc.html` (шрифты с yastatic, для конструктора LPC). Деплой: скопировать `export/lavka-franchise.html` в корень ветки `gh-pages` как `index.html` (+ `og.png` из `site/assets/figma/`).

## Структура
- `site/` — сайт (см. `site/README.md`)
- `tools/` — `build-site.mjs` (сборка), `shot.mjs` (QA-кадры на любой ширине), `figma-export/`
- `docs/` — ТЗ, брифы, дизайн-система (не публикуется, в `.gitignore`)
- `references/` — исходные материалы и шрифты YS Geo / YS Text (`references/fonts/`)
- `badge/`, `partner-day/`, `certificate/`, `events/`, `presentations/` — отдельные мини-проекты
- `archive/` — всё старое: прежний прод «веб + мобилка», концепты, песочница блоков — см. `archive/README.md`
- `index.html` — локальный редирект на `site/index.html` (в проде корневой `index.html` — собранный сайт)

## Статус
Данные, тексты и визуалы — заглушки (рыба); не является публичной офертой. Форма заявки никуда не отправляет — подключение на стороне разработчиков.

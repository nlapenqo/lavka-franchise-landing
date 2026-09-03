# site/ — исходники сайта

Это и есть финальный сайт: одна разметка на все экраны (веб ≥768px, планшет, телефон <768px).

- `index.html` — разметка всех блоков по порядку (`#business`, `#formats`, `#steps`, `#faq`, `#form`)
- `styles.css` — стили десктопа и планшета (медиазапросы 1199 / 1100 / 768–1023 / 768–820)
- `mobile.css` — мобильный слой `<768px`: перестраивает те же блоки в мобильную сборку
- `app.js` — вся интерактивность; мобильные ветки — через `isMobile()`
- `assets/figma/` — только используемые картинки (webp/svg), фавикон, `og.png` для превью ссылки
- `fonts/` — YS Geo (400/500/800/900) и YS Text Cond Light, woff2

Полоска «День партнёров» не удалена, а спрятана: `<body class="no-event">` + правила `.no-event .event` / `.no-event .evt`. Вернуть — убрать класс.

**Сборка:** `node tools/build-site.mjs` → `export/lavka-franchise.html` (всё зашито: шрифты, картинки, скрипты — для хостинга и пересылки) и `export/lavka-franchise-lpc.html` (шрифты ссылками на yastatic — для конструктора LPC, который вырезает зашитые).

**Локально:** `python3 -m http.server 8821` в корне репо → `http://127.0.0.1:8821/site/`. QA-кадры: `node tools/shot.mjs <url> <out.png> --w 375 --block .formats`.

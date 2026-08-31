# site/ — что где лежит

Полная структура репо — в [`../CLAUDE.md`](../CLAUDE.md). Здесь — только сама папка `site/`, после уборки 17.08.2026.

## Единственный источник правды (то, что реально идёт в прод)

- **`index.html`** — вся сборка лендинга, один файл, секции по порядку (`#hero`, `#steps` и т.д.)
- **`styles.css`** — все стили: токены (`:root`), типографика, секции
- **`app.js`** — вся интерактивность: sticky-скролл, счётчики, карусели, `data-*`-хуки
- **`fonts/YS Geo-{Regular,Medium,Heavy,Black}.ttf`, `YS Text Cond-Light.ttf`** — шрифты, которые реально подключены в `styles.css` (`@font-face`)
- **`assets/figma/*.svg`, `*.png`** — все картинки, инлайнятся в сборку

Из этих файлов вместе с мобильной сборкой E (`../concepts/mobile/e-figma.html` + `_shared/`) командой `node ../tools/build-offline-site.mjs` собирается **`../lavka-franchise-offline.html`** — единственный финальный файл: веб и мобилка в одном самодостаточном документе (шрифты и картинки зашиты как base64). Файл ~3 МБ — не читать целиком, только grep/фрагменты.

Если меняешь `index.html`/`styles.css`/`app.js` или мобильные исходники в `../concepts/mobile/` — пересобери офлайн-версию после правок.

## `blocks/<NN>/final.html` — референс поведения по блокам

Не часть сборки и не синхронизируется с ней автоматически. Каждый файл — изолированный самодостаточный пример анимации/поведения конкретного блока (взять оттуда логику и перенести в `app.js` руками), плюс живая документация для конкретных сложных анимаций:
- `02-hero/final.html` — единый источник прогресса для связанной анимации хиро
- `03-event/final.html` — бесшовная бегущая строка
- `04-numbers/final.html` + `_shared/proto.js` — counters on enter
- `05-1-darkstore/final.html` — zoom/focus карты
- `07-steps/final.html` — sticky scrollytelling с прогрессом
- `08-reviews/final.html` — scroll-snap карусель
- `10-faq/final.html` — accordion

`_shared/` — общие токены/база для этих превью (`tokens.css`, `base.css`, `proto.js`, `preview-shell.js`), используют дополнительные шрифты (`Bold`, `Light`, `Text-Medium`, `Text-Regular`) — те, которых нет в `@font-face` основной сборки.

Открываются локально: `python3 -m http.server` с корня репо, не `file://`.

## Не здесь

- **Концепты и черновики блоков** (десятки вариантов на блок, включая старые `05-business/`) — `../blocks/` (галерея `../blocks/index.html`). Не трогать при доработке `site/` — правки только здесь.
- **Эксперименты по блоку «Как стать партнёром»** (сериями: timeline, route, stage, move, atelier…) — `../concepts/steps-scroll/` (сводный хаб `../concepts/steps-scroll/index.html`)
- **Старые сборки, отклонённые варианты, устаревшие Figma-экспорты** — `../archive/` (см. `../archive/README.md` — там же лог, что и когда сюда переехало)

## 17.08.2026 — что уехало из этой папки

Ничего не удалено, только перемещено в `../archive/2026-08-17-site-cleanup/` — не участвовало в сборке и нигде не переиспользовалось:
- `ambient-motion-preview.html` — одноразовый прототип движения градиента
- `figma-export.html` (3,5 МБ) — устаревший плоский экспорт для Figma
- `blocks/05-business/drinkit.html`, `variants.html` — черновики до текущего `final.html`

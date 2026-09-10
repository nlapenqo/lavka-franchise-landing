# План сборки Figma-файла «Блоки-конструктор Лавки»

Выполняется скиллом `figma:figma-generate-library` + `figma:figma-use` через официальный Figma MCP (`plugin:figma:figma`, аккаунт nlapenqo.us@gmail.com). Перед стартом: `claude mcp login plugin:figma:figma` в интерактивном терминале. Источник истины — `design-system/tokens.json` и `blocks/` (HTML-эталон анимаций и вёрстки). Фазы и чек-листы — по скиллу, ниже только то, что специфично для нас.

## Фаза 0 · Что решено заранее
- Новый файл, Design. Страницы: Cover → Основы → --- → по странице на блок (20) → --- → Примерка.
- Библиотеки не подключать: язык свой, иконки — из `site/assets/figma` как SVG-компоненты.
- Конфликтов код ↔ Figma нет (файл пустой). Ветка «минимальный кит» в `kit/` не источник.

## Фаза 1 · Переменные (из tokens.json, 1:1)
| Коллекция | Режимы | Что | Scope |
|---|---|---|---|
| Primitives | Value | color.* (16 + alpha 9) | скрытые `[]` |
| Color | Light, Dark | text.*, bg.*, surface.*, border.*, action.* — алиасы на Primitives; Dark = значения «on-dark» | FRAME_FILL/SHAPE_FILL, TEXT_FILL, STROKE_COLOR |
| Space | Value | space.1…10, layout.gutter | GAP, WIDTH_HEIGHT |
| Radius | Value | radius.xl/l/m/s/pill | CORNER_RADIUS |
| Type | Desktop, Tablet, Mobile | font.size.* (три ступени из `$extensions.lavka.responsive`), line-height, letter-spacing | FONT_SIZE, LINE_HEIGHT, LETTER_SPACING |

Code syntax WEB = `var(--имя-из-blocks/tokens.css)`. Text styles = роли `type.*` (display, h1, h2, h3, h4, lead, body, body-s, name, small, caption, legal, num-xl, num-l, num). Effect styles = shadow.* (7). Свечение тёмных секций — компонент `Glow` (два размытых эллипса blue, поворот −32.9°), не стиль.

## Фаза 3 · Компоненты блоков: свойства вместо дублей
Каждый блок — один компонент 1280/1440 с авто-лейаутом. Необязательные части — **Boolean** («галочка» в панели), содержимое — **Text**, тема и раскладка — **Variant**. Вложенные карточки — отдельные компоненты с INSTANCE_SWAP, число карточек — Boolean на 3-й/4-й элемент.

| Блок | Variant | Boolean | Text / Instance |
|---|---|---|---|
| Header | Theme=Dark/Solid | Link | Button label |
| 01 Hero | Theme=Dark/Light | Second button, Note, Benefits (×3/×4 — Benefit 4) | Title, Lead, Button, Note; Benefit×4 (число, подпись) |
| 02 Hero photo | — | — | Title, Lead; Frame (KV01 1164×560) |
| 03 Strip | Theme=Light/Dark | Status, Button | 3 items |
| 04 Numbers | — | — | Number×3 (value, label, note) |
| 05 Statement | Theme=White/Light/Dark | Caption | Text |
| 06 Feature | Slides=1/2/3 | Button | Title, Text; Media KV02 |
| 07 Cards media | Columns=2/3/4 | Card 3, Card 4, Link | Card: Title, Text; Media 16:10 |
| 08 Tiles | Layout=1/2/3/4/Feed | Button | Tile: Title, Text |
| 09 Speakers | — | Card 3, Second avatar | Topic, Name, Role; Avatar 88 |
| 10 Quote | Theme=Light/Dark | — | Text, Name, Role; Avatar 64 |
| 11 Checklist | Columns=1/2 | Item 5, Item 6 | Item: Title, Text |
| 12 Offers | Columns=2/3 | Featured (обводка), Chip 2, Row 4, Button | Chips, Note, Row (dt, dd), Foot |
| 13 Timeline | Items=3/4/5 | — | When, Title, Text |
| 14 Steps | Items=3/4/5 · Theme | CTA in last | Number, Title, Text, Button |
| 15 Gallery | Cells=3/5 | Link | KV03 3:2, KV04 3:4 |
| 16 Logos | Columns=4 | — | Logo×4 (INSTANCE_SWAP) |
| 17 FAQ | Theme | Item 5–7 | Question, Answer |
| 18 CTA panel | — | Lead | Title, Lead, Button |
| 19 Form strip | — | Note | Title, Field×2, Button |
| 20 Lead form | — | Field 4–5, Textarea | Title, Lead, Argument×3, Field×N, Submit, Term |
| Footer | — | Button | Nav×4, Legal |

Правила из HTML, которые переносятся как есть: голубая заливка — только кнопки и табы; авто-лейаут с hug по высоте, чтобы Boolean-скрытие схлопывало место; кадры — компонент `Placeholder` с подписью размера и кода слота; карточки минимум 280 (тарифы 600), min-height через auto-layout min.

## Фаза 4 · Примерка
Страница «Примерка»: все блоки инстансами подряд (Content → gap 128), плюс страница слотов KV/AV/LG с размерами из `design-system/README.md`. Code Connect: каждый компонент ↔ секция в `blocks/index.html` по номеру.

## Анимации
В Figma не переносятся. Эталон — `blocks/index.html` (`blocks.js`, `base.css`): слова хиро по очереди 90 мс, появление снизу 28px за .6s со стаггером 70 мс, свечение цифр за курсором, дрейф свечения секций, подъём карточек −4px, кнопок −2px, зум кадра 1.03 за 1s.

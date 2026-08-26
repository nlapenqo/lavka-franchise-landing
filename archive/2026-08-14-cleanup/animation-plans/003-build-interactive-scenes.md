# 003 — Реализовать interruptible darkstore, steps, carousel и FAQ

- **Status**: TODO
- **Commit**: f13ab65
- **Severity**: HIGH
- **Category**: interruptibility, physicality, accessibility, performance
- **Estimated scope**: 8–12 production-файлов; четыре UI-контроллера и тесты

## Problem

Поведение существует только в разрозненных прототипах и местами не соответствует финальному desktop-макету.

Карта (`site/blocks/05-1-darkstore/final.html:15-16`):

```css
.map-scene { transform: scale(1); transition: transform .8s var(--ease-out); }
.map-scene.is-zoomed { transform: scale(1.58); }
```

Steps (`site/blocks/07-steps/final.html:21-25`) построены как плитки и используют 600 ms UI transition, тогда как Figma `269:154` показывает пять строк.

FAQ (`site/blocks/10-faq/final.html:24-27`) анимирует layout 600 ms:

```css
.faq-panel { display: grid; grid-template-rows: 0fr; transition: grid-template-rows var(--dur-med) var(--ease-out); }
.faq-panel.is-open { grid-template-rows: 1fr; }
```

## Target

Darkstore:

- map transform 700–900 ms ease-out, retargetable;
- card opacity + y 16 px за 280 ms;
- close/reselect/Escape + focus return;
- mobile: no orientation-losing zoom; detail below map/bottom sheet;
- reduced: no zoom.

Steps:

- desktop Figma row composition;
- sticky 220–260vh, progress 0…1, scrub 0.4–0.6;
- один progress value управляет rail, counter и active row;
- row state transition 200–280 ms, transform ≤ 4 px;
- ≤900 px/reduced: no pin, обычный список.

Reviews:

- native scroll-snap, no autoplay;
- smooth только без reduced motion;
- keyboard arrows, disabled boundaries, live index.

FAQ:

- retargetable open/close 200–280 ms ease-out;
- plus/icon 200 ms;
- reduced: instant layout + opacity ≤150 ms.

## Repo conventions to follow

- Карта data model и Escape exemplar: `archive/landing-lab/lab-atlas.html:901-935`.
- Steps progress exemplar: `site/blocks/07-steps/final.html:73-106`.
- Reviews scroll exemplar: `site/blocks/08-reviews/final.html:83-95`.
- FAQ ARIA exemplar: `site/blocks/10-faq/final.html:92-106`.
- Visual references: `docs/audit/screenshots/figma-05-1-darkstore-266-341.png`, `figma-07-steps-269-154.png`, `figma-08-testimonials-266-529.png`, `figma-10-faq-266-581.png`.
- Полная спецификация: `docs/TZ-verstka-i-animacii.md`, разделы 05.1, 07, 08 и 10.

## Steps

1. Вынести состояние каждой сцены в отдельный controller с `destroy()`; не смешивать global scroll listeners.
2. Darkstore: один detail node, dataset/config семи зон, focus management, Escape, mobile mode через matchMedia.
3. Steps: сверстать строки Figma, создать ScrollTrigger только в desktop media context, корректно kill/recreate на breakpoint change.
4. В steps обновлять DOM только при смене шага; continuous progress применять одной transform-scale rail, не width.
5. Reviews: scroll-snap + ResizeObserver для step, passive scroll, keyboard handler только когда region focused.
6. FAQ: button/region semantics, один open item, CSS/WAAPI transition, быстрый repeat click retarget-ит текущую фазу.
7. Для всех четырёх контроллеров реализовать reduced-motion ветки и hidden/offscreen pause там, где есть continuous work.
8. Добавить Playwright tests по сценариям из основного ТЗ.

## Boundaries

- Не использовать autoplay для steps/reviews/FAQ.
- Не превращать Figma rows в карточную grid.
- Не ставить tabindex на неинтерактивный `<li>`; использовать semantic buttons при ручном выборе steps.
- Не анимировать карту через `top/left`; только transform.
- Не создавать отдельную detail card на каждый hotspot.

## Verification

- **Mechanical**: axe 0 critical/serious; Playwright покрывает click/keyboard/Escape/reduced/mobile; при resize нет дублированных ScrollTrigger/listeners.
- **Feel check**:
  - быстрый выбор разных hotspots продолжает текущую transform без restart flash;
  - steps держат spatial continuity и не «прилипают» на mobile;
  - spam-click FAQ не прыгает и не застревает;
  - carousel остаётся под прямым контролем gesture;
  - DevTools playback 10% не показывает layout thrash;
  - reduced motion удаляет pin/zoom/smooth movement, но сохраняет состояния.
- **Done when**: все четыре механики совпадают с визуальным макетом, interruptible, доступны с keyboard/touch и имеют корректный reduced-mode.


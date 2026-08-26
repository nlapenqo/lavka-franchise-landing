# 002 — Реализовать hero intro и барабан городов

- **Status**: TODO
- **Commit**: f13ab65
- **Severity**: HIGH
- **Category**: explanatory motion, easing, performance, accessibility
- **Estimated scope**: 2–3 production-файла; hero styles + controller

## Problem

В Figma `266:266` барабан аннотирован как `2.4s hold / 1.15s transition`, но актуальный код показывает другой светлый tracker-hero и держит бесконечный rAF loop.

`site/blocks/02-hero/final.html:392-399`:

```js
if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
  render(.999);
  return;
}
var t0 = performance.now();
(function loop(now) {
  render(((now - t0) % CYCLE) / CYCLE);
  requestAnimationFrame(loop);
})(t0);
```

Это не соответствует композиции Figma и продолжает выполнять работу, пока hero не виден.

## Target

- Воспроизвести тёмный hero Figma `266:219`.
- Intro строк: `yPercent 110 → 0`, 1000 ms, `--motion-ease-out`, stagger 80 ms.
- Subtitle/CTA: y 24 px + opacity, 700 ms, stagger 70 ms, delay 250–350 ms.
- Барабан: hold 2400 ms; move 1150 ms; `--motion-ease-in-out`.
- Набор строк: «в своём городе», Казань, Самара, Уфа, Тюмень, Ижевск, loop.
- Ровно одна строка видима; высота slot измеряется, а не фиксируется 116 px на всех widths.
- Pause при `document.hidden` и когда hero вне viewport.
- Reduced motion: статично «в своём городе».

## Repo conventions to follow

- Маски строк и GSAP choreography: `archive/landing-lab/lab-atlas.html:996-1010`.
- Figma reference: `docs/audit/screenshots/figma-02-hero-266-219.png`.
- Полная спецификация: `docs/TZ-verstka-i-animacii.md`, раздел 01–02.
- Если SplitText не загружен, текст должен оставаться видимым.

## Steps

1. Сверстать heading как один `<h1>` с доступным полным текстом; декоративные drum copies скрыть от screen reader.
2. После `document.fonts.ready` измерить slot и выполнить intro; до этого hero остаётся читаемым.
3. Запустить drum только после intro; использовать GSAP timeline либо WAAPI/CSS transitions, не постоянный rAF.
4. После transition мгновенно нормализовать индекс для loop без видимого скачка.
5. Подключить `IntersectionObserver` и Page Visibility API для pause/resume без временного jump.
6. Обработать resize/font change: закончить текущий transition, переизмерить slot, восстановить активный индекс.
7. В reduced-motion ветке не создавать timeline.

## Boundaries

- Не переносить светлый launch tracker из `site/blocks/02-hero/final.html`.
- Не менять тексты/города без утверждённого content config.
- Не добавлять parallax, bounce, blur и декоративные циклы.
- Не делать доступное имя H1 динамически меняющимся каждые 3.55 s.

## Verification

- **Mechanical**: нет активного rAF loop после ухода hero из viewport; production build без console errors при отсутствии SplitText.
- **Feel check**:
  - строки H1 выходят быстро и мягко тормозят;
  - drum удерживает текст достаточно долго для чтения;
  - в slow motion нет двойной экспозиции двух городов;
  - при переключении tab и возврате фаза не перескакивает;
  - reduced motion статичен.
- **Done when**: визуал соответствует Figma, timings равны 2400/1150 ms, loop экономно паузится, fallback/reduced состояния читаемы.


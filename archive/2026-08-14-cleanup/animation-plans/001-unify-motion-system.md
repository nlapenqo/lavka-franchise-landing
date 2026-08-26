# 001 — Унифицировать motion-токены и progressive reveal

- **Status**: TODO
- **Commit**: f13ab65
- **Severity**: HIGH
- **Category**: easing, duration, accessibility, cohesion, performance
- **Estimated scope**: 3–5 новых production-файлов; перенос правил из прототипных CSS/JS

## Problem

Прототип использует крупную шкалу длительностей и скрывает контент до срабатывания `IntersectionObserver`.

`site/blocks/_shared/tokens.css:63-65`:

```css
--ease-out: cubic-bezier(.22,.61,.36,1);
--ease-spring: cubic-bezier(.34,1.56,.64,1);
--dur-fast: .3s; --dur-med: .6s; --dur-slow: .9s;
```

`site/blocks/_shared/base.css:97-100`:

```css
.reveal { opacity: 0; transform: translateY(28px); transition: opacity var(--dur-med) var(--ease-out), transform var(--dur-med) var(--ease-out); }
.reveal.is-in { opacity: 1; transform: none; }
.reveal-d1 { transition-delay: .08s; } .reveal-d2 { transition-delay: .16s; }
.reveal-d3 { transition-delay: .24s; } .reveal-d4 { transition-delay: .32s; }
```

Из-за этого UI feedback может занимать 300–600 ms, а print/bot/full-page screenshot без прокрутки получает невидимые секции.

## Target

Создать одну шкалу:

```css
:root {
  --motion-ease-out: cubic-bezier(0.23, 1, 0.32, 1);
  --motion-ease-in-out: cubic-bezier(0.77, 0, 0.175, 1);
  --motion-ease-drawer: cubic-bezier(0.32, 0.72, 0, 1);
  --motion-ui-fast: 140ms;
  --motion-ui: 200ms;
  --motion-ui-slow: 280ms;
  --motion-content: 600ms;
  --motion-hero: 1000ms;
  --motion-stagger: 60ms;
}
```

Reveal progressive-enhancement:

```css
.reveal { opacity: 1; transform: none; }
.js.motion-ready .reveal:not(.is-in) {
  opacity: 0;
  transform: translateY(24px);
}
.js.motion-ready .reveal {
  transition: opacity 600ms var(--motion-ease-out),
              transform 600ms var(--motion-ease-out);
}
```

При reduced motion убрать перемещение, но сохранить полезный opacity/color feedback до 200 ms.

## Repo conventions to follow

- Брендовые CSS-токены сейчас живут в `site/blocks/_shared/tokens.css`.
- Reveal observer сейчас живёт в `site/blocks/_shared/proto.js:3-7`.
- Production-реализация должна быть в едином DOM и не редактировать sandbox `site/blocks/*`.
- Полная спецификация: `docs/TZ-verstka-i-animacii.md`, раздел 8.

## Steps

1. В production token-файле добавить указанную шкалу motion; не переносить `--ease-spring` с overshoot 1.56 как глобальный default.
2. Перевести Button/IconButton/FormField/FAQ/Tooltip на 140–280 ms; явно перечислить properties, не использовать `transition: all`.
3. Инициализировать `.js` синхронно, а `.motion-ready` — только после успешного создания observers/ScrollTrigger.
4. Реализовать one-shot reveal через один `IntersectionObserver`, threshold 0.15; delay группы вычислять с шагом 60 ms и ограничением 240 ms.
5. При ошибке JS снять `.motion-ready`, чтобы всё стало видимо.
6. Добавить print и reduced-motion overrides.

## Boundaries

- Не менять композицию секций и контент.
- Не редактировать `blocks/`, `site/blocks/` и `archive/`; это референсы.
- Не добавлять animation library только ради reveal.
- Не скрывать интерактив до завершения stagger.

## Verification

- **Mechanical**: production build проходит; поиск по production CSS не находит `transition: all`; axe не получает hidden-content findings.
- **Feel check**:
  - первый reveal начинается быстро и замедляется к финалу;
  - карточки читаются как одна группа, суммарная задержка ≤ 240 ms;
  - при DevTools playback 10% нет layout jumps;
  - при reduced motion position не меняется, opacity/focus feedback остаются;
  - с отключённым JS и при печати весь текст виден.
- **Done when**: один набор токенов обслуживает все секции, UI ≤ 280 ms, marketing reveal 600 ms, невидимого no-JS контента нет.


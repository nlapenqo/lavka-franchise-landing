#!/usr/bin/env node
// Генератор баннера «Классическая бирка»: пять вариантов покачивания бирки + галерея.
// Углы считаются численно по физике маятника и пишутся в @keyframes, поэтому появление
// переходит в покачивание без стыка: бирку «отпускают», и она продолжает то же движение.
// Запуск: node make.mjs
import { readFileSync, writeFileSync } from 'node:fs';

const STATIC_CSS = readFileSync('static.css', 'utf8');
const MARKUP = readFileSync('markup.html', 'utf8');

/* ── появление сцены (16.09: ещё на четверть медленнее) ── */
const K = 1.25;                                   // общий коэффициент замедления появления
const t = v => +(v * K).toFixed(2);
const reveal = `
:root{
  --calm:cubic-bezier(.33,0,.15,1);  /* мягкий разгон, длинное плавное торможение */
  --sine:cubic-bezier(.37,0,.63,1);  /* синусоида */
}
.pre .a{opacity:0}
.play .product{animation:product ${t(1.4)}s var(--calm) 0s both}
.play .logo   {animation:rise-8 ${t(1.1)}s var(--calm) ${t(.3)}s both}
.play .pill   {animation:pop ${t(1.1)}s var(--calm) ${t(.45)}s both}
.play .price  {animation:rise ${t(1.2)}s var(--calm) ${t(.55)}s both}
.play .rub    {animation:rise ${t(1.2)}s var(--calm) ${t(.68)}s both}
.play .old    {animation:rise-8 ${t(1.1)}s var(--calm) ${t(.76)}s both}
.play .strike {animation:wipe-hold ${(t(1.35)+t(.7)).toFixed(2)}s linear 0s both}
.play .name   {animation:rise ${t(1.2)}s var(--calm) ${t(.86)}s both}
.play .age    {animation:fade ${t(1.1)}s var(--sine) ${t(1.0)}s both}
.play .legal  {animation:fade ${t(1.1)}s var(--sine) ${t(1.06)}s both}
.play .star   {animation:spark ${t(1.1)}s var(--calm) ${t(1.0)}s both,blink 3.2s linear ${t(2.4)}s infinite}
.age,.legal{--o:.7}
@keyframes rise{from{opacity:0;translate:0 16px}to{opacity:1;translate:0 0}}
@keyframes rise-8{from{opacity:0;translate:0 -8px}to{opacity:1;translate:0 0}}
@keyframes pop{from{opacity:0;scale:.94}to{opacity:1;scale:1}}
@keyframes fade{from{opacity:0}to{opacity:var(--o,1)}}
/* зачёркивание без задержки: скрытое удержание внутри кейфреймов — анимация clip-path с задержкой в Chrome 152 не прячет элемент до старта */
@keyframes wipe-hold{0%{opacity:0;clip-path:inset(0 100% 0 0)}${(t(1.35)/(t(1.35)+t(.7))*100).toFixed(1)}%{opacity:0;clip-path:inset(0 100% 0 0)}${(t(1.35)/(t(1.35)+t(.7))*100+.1).toFixed(1)}%{opacity:1;clip-path:inset(0 100% 0 0);animation-timing-function:var(--sine)}100%{opacity:1;clip-path:inset(0 0 0 0)}}
@keyframes product{from{opacity:0;translate:36px 12px}to{opacity:1;translate:0 0}}
@keyframes spark{from{opacity:0;scale:.4}to{opacity:1;scale:1}}
@keyframes blink{
  0%   {opacity:1;scale:1;animation-timing-function:var(--sine)}
  25%  {opacity:0;scale:.5;animation-timing-function:var(--sine)}
  55%  {opacity:1;scale:1}
  100% {opacity:1;scale:1}
}`;

const TAG_IN = t(0.8);   // когда бирка начинает проявляться
const FADE   = t(1.0);   // сколько проявляется

/* Численная раскадровка: samples(fn, from, to, step) → строки кейфреймов */
const frames = (fn, dur, step, extra = () => '') => {
  const out = [];
  for (let i = 0; i * step <= dur + 1e-9; i++) {
    const x = Math.min(i * step, dur);
    out.push(`  ${(x / dur * 100).toFixed(3)}%{rotate:${fn(x).toFixed(3)}deg${extra(x)}}`);
  }
  return out.join('\n');
};

/* Варианты: shape(u) — периодическая форма качания (период P, значения ≈ ±1),
   A0 — угол, с которого бирку «отпускают», A1 — амплитуда покоя, tau — затухание. */
const TAU = 2 * Math.PI;
const VARIANTS = [
  {
    n: 1, title: 'Маятник',
    desc: 'Бирку отпускают, и она качается как настоящий маятник: период 2.6 с, размах гаснет с 6.5° до 1.5° и дальше держится еле заметным. Самое «физичное» поведение.',
    P: 2.6, A0: 6.5, A1: 1.5, tau: 2.6,
    shape: u => Math.sin(TAU * u / 2.6),
  },
  {
    n: 2, title: 'Дыхание',
    desc: 'Один медленный синус ±2° с периодом 7 с: бирка почти не качается, а «дышит». Самый спокойный вариант, движение заметно только боковым зрением.',
    P: 7, A0: 6, A1: 2, tau: 3.4,
    shape: u => Math.sin(TAU * u / 7),
  },
  {
    n: 3, title: 'Два ветра',
    desc: 'Сумма двух качаний: медленное ±2° с периодом 8.4 с и мелкое поверх него с периодом 2.8 с. Рисунок движения не повторяется на глаз, как у бирки на слабом сквозняке.',
    P: 8.4, A0: 7, A1: 2.2, tau: 3.4,
    shape: u => .78 * Math.sin(TAU * u / 8.4) + .22 * Math.sin(TAU * u / 2.8 + 1.1),
  },
  {
    n: 4, title: 'Порывы',
    desc: 'Бирка стоит почти неподвижно, и раз в 6 с её мягко подхватывает воздух: качание нарастает без толчка и само затухает к следующему разу.',
    P: 6, A0: 8, A1: 3.2, tau: 3,
    shape: u => {
      const ramp = Math.min(1, u / .5) ** 2 * (3 - 2 * Math.min(1, u / .5));  // мягкое нарастание, без рывка
      return ramp * Math.exp(-u / 1.7) * Math.sin(TAU * u / 2.4);
    },
  },
  {
    n: 5, title: 'Маятник с порывами',
    desc: 'Постоянное еле заметное качание ±0.8°, и раз в 6 с воздух добавляет более широкий ход. Живее «Дыхания», но без резких движений.',
    P: 6, A0: 8, A1: 2.6, tau: 3,
    shape: u => {
      const ramp = Math.min(1, u / .6) ** 2 * (3 - 2 * Math.min(1, u / .6));
      const gust = ramp * Math.exp(-u / 2.2) * Math.sin(TAU * u / 2.6);
      return .62 * gust + .38 * Math.sin(TAU * u / 3 + .4);
    },
  },
];

const page = (v) => {
  const { P, A0, A1, tau, shape } = v;
  const cycles = Math.max(3, Math.ceil(11 / P));      // длина «отпускания» — целое число периодов
  const Ti = cycles * P;
  const amp = x => A1 + (A0 - A1) * Math.exp(-x / tau);
  const intro = x => amp(x) * shape(x);              // при x = Ti амплитуда ≈ A1 и фаза совпадает с началом покоя
  const idle = x => A1 * shape(x);
  const css = `
/* бирка: медленно проявляется и качается по формуле маятника — «${v.title}» */
.play .pivot--intro{animation:tag-in ${Ti.toFixed(2)}s linear ${TAG_IN}s both}
@keyframes tag-in{
${frames(intro, Ti, .05, x => x <= FADE ? `;opacity:${(x / FADE).toFixed(3)}` : ';opacity:1')}
}
.play .pivot--twitch{animation:sway ${P.toFixed(2)}s linear ${(TAG_IN + Ti).toFixed(2)}s infinite both}
@keyframes sway{
${frames(x => idle(x) - idle(0), P, .08)}
}`;
  return `<!doctype html>
<html lang="ru"><head><meta charset="utf-8"><title>v${v.n} — ${v.title}</title>
<style>
${STATIC_CSS}${reveal}
${css}
</style></head><body>
${MARKUP}
<script>
(() => {
  const b = document.querySelector('.banner');
  const start = () => { b.classList.remove('pre'); b.classList.add('play'); };
  const replay = () => { b.classList.remove('play'); b.classList.add('pre'); void b.offsetWidth; requestAnimationFrame(() => requestAnimationFrame(start)); };
  (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(() => setTimeout(start, 150));
  b.addEventListener('click', replay);
})();
</script>
</body></html>
`;
};

const CHOSEN = 1;                       // выбран «Маятник» (16.09)
const withVariants = process.argv.includes('--variants');
writeFileSync('index.html', page(VARIANTS.find(v => v.n === CHOSEN)));
if (!withVariants) {
  console.log(`written: index.html (v${CHOSEN} · ${VARIANTS.find(v => v.n === CHOSEN).title}); варианты и галерея — node make.mjs --variants`);
  process.exit(0);
}
for (const v of VARIANTS) writeFileSync(`v${v.n}.html`, page(v));

const cards = VARIANTS.map(v => `  <figure>
    <div class="frame"><iframe src="v${v.n}.html" title="v${v.n} — ${v.title}" loading="eager"></iframe></div>
    <figcaption><b>v${v.n} · ${v.title}</b><span>${v.desc}</span><span class="row"><a href="v${v.n}.html" target="_blank">Открыть</a><button type="button">Повторить</button></span></figcaption>
  </figure>`).join('\n');
writeFileSync('variants.html', `<!doctype html>
<html lang="ru"><head><meta charset="utf-8"><title>Бирка — варианты покачивания</title>
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
@font-face{font-family:'YS Geo';src:url('fonts/YS Geo-Regular.woff2') format('woff2');font-weight:400}
@font-face{font-family:'YS Geo';src:url('fonts/YS Geo-Medium.woff2') format('woff2');font-weight:500}
body{margin:0;padding:40px;background:#f2f7fc;color:#1b3a6a;font:16px/1.45 'YS Geo',Arial,sans-serif}
h1{font-size:28px;font-weight:500;margin:0 0 6px}
p.lead{margin:0 0 28px;color:#5a749b;max-width:760px}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(480px,1fr));gap:36px 32px}
figure{margin:0}
.frame{width:480px;height:360px;overflow:hidden;border-radius:12px;box-shadow:0 8px 30px rgba(27,58,106,.12)}
iframe{width:960px;height:720px;border:0;transform:scale(.5);transform-origin:0 0;display:block}
figcaption{display:grid;gap:6px;margin-top:12px;max-width:480px}
figcaption b{font-weight:500;font-size:18px}
figcaption span{color:#5a749b;font-size:14px}
.row{display:flex;gap:14px;align-items:center;margin-top:4px}
a{color:#00adff}
button{font:inherit;font-size:14px;padding:6px 14px;border-radius:999px;border:0;background:#00adff;color:#fff;cursor:pointer}
button:hover{background:#0095db}
</style></head><body>
<h1>Бирка «большие скидки» — варианты покачивания</h1>
<p class="lead">Появление сцены во всех вариантах одинаковое и на четверть медленнее прежнего. Отличается только физика бирки после появления: углы посчитаны по формуле маятника, поэтому отпускание переходит в покачивание без стыка. Клик по баннеру — повтор.</p>
<div class="grid">
${cards}
</div>
<script>
document.querySelectorAll('figure button').forEach(b => b.addEventListener('click', () => { b.closest('figure').querySelector('iframe').contentWindow.location.reload(); }));
</script>
</body></html>
`);
console.log('written: index.html, ' + VARIANTS.map(v => `v${v.n}.html`).join(', ') + ', variants.html');

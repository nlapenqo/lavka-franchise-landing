#!/usr/bin/env node
// Генератор шести вариантов анимации баннера «Авокадо Хасс». Тайминги задаются в секундах,
// скрипт переводит их в проценты @keyframes (одна анимация на элемент, easing на каждом отрезке)
// и пишет v1.html … v6.html + index.html (галерея). Запуск: node make.mjs
import { writeFileSync } from 'node:fs';
const VER = '20260915b'; // версия banner.css в ссылке: Pages кэширует CSS на 10 минут, при правке стилей поднимать

const OUT   = 'cubic-bezier(.22,.61,.36,1)';   // мягкий выход
const OEXPO = 'cubic-bezier(.16,1,.3,1)';      // резкий старт, длинное торможение
const FLY   = 'cubic-bezier(.55,0,.15,1)';     // разгон и мягкая посадка (перелёт бирки)
const BACK  = 'cubic-bezier(.34,1.45,.64,1)';  // лёгкий перелёт за цель (pop)
const IN    = 'cubic-bezier(.55,0,1,.45)';     // разгон (удар штампа)
const IO    = 'cubic-bezier(.65,0,.35,1)';     // симметричный
const SOFT  = 'cubic-bezier(.4,0,.2,1)';

const T = (x, y, r, s) => `transform:translate(${x}px,${y}px) rotate(${r}deg) scale(${s})`;
const pct = (t, d) => +(t / d * 100).toFixed(3);

// frames: [{t, css, ease}] — ease действует на отрезке ОТ этого кадра к следующему
function anim(sel, name, frames, extra = '') {
  const d = frames[frames.length - 1].t;
  const body = frames.map(f => `  ${pct(f.t, d)}%{${f.css}${f.ease ? `;animation-timing-function:${f.ease}` : ''}}`).join('\n');
  return `@keyframes ${name}{\n${body}\n}\n.play ${sel}{animation:${name} ${d}s linear both${extra}}`;
}
// частый случай: скрыт до t0, затем за dur проявляется из состояния from в to
const reveal = (sel, name, t0, dur, from, to, ease = OEXPO) =>
  anim(sel, name, [{ t: 0, css: `opacity:0;${from}` }, { t: t0, css: `opacity:0;${from}`, ease }, { t: t0 + dur, css: `opacity:1;${to}` }]);

const markup = `<div class="banner pre">
  <div class="bg"></div>
  <img class="noise" src="assets/bg-noise.svg" alt="">
  <div class="avo a">
    <div class="sh sh1"></div><div class="sh sh2"></div><div class="sh sh3"></div><div class="sh sh4"></div>
    <img class="avo__img" src="assets/avocado.png" alt="">
  </div>
  <img class="logo a" src="assets/logo.svg" alt="Яндекс Лавка">
  <div class="pill cap a">–25%</div>
  <img class="star a" src="assets/star.svg" alt="">
  <p class="price cap a">179</p>
  <p class="rub cap a">₽</p>
  <p class="old cap a">239</p>
  <img class="strike a" src="assets/strike.svg" alt="">
  <p class="name cap a">Авокадо Хасс, <span>2 шт</span></p>
  <p class="age a">0+</p>
  <p class="legal a">Акция действует с 01.09.25 по 15.09.25.
ООО «Яндекс.Лавка» (123112, г. Москва,
пр. 1-й Красногвардейский, д. 22, стр. 1,
эт. 12, пом. 12-40, ОГРН 1187746479250)</p>
  <div class="tag a">
    <img class="tag__body" src="assets/tag-body.svg" alt="">
    <img class="tag__ring" src="assets/tag-ring.svg" alt="">
    <p class="tag__text">большие<br>скидки</p>
    <svg class="tag__string" viewBox="0 0 55.0003 33.0003" fill="none" aria-hidden="true"><path pathLength="1" d="M53.5003 1.50001C29.5003 2.16668 12.1669 12.1667 1.50028 31.5" stroke="#fff" stroke-width="3" stroke-linecap="round"/></svg>
    <img class="tag__knot" src="assets/knot.svg" alt="">
  </div>
</div>`;

const script = `<script>
(() => {
  const b = document.querySelector('.banner');
  const start = () => { b.classList.remove('pre'); b.classList.add('play'); };
  const replay = () => { b.classList.remove('play'); b.classList.add('pre'); void b.offsetWidth; requestAnimationFrame(() => requestAnimationFrame(start)); };
  (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(() => setTimeout(start, 150));
  b.addEventListener('click', replay);
})();
</script>`;

const page = (n, title, css) => `<!doctype html>
<html lang="ru"><head><meta charset="utf-8"><title>${n} — ${title}</title>
<link rel="stylesheet" href="banner.css?v=${VER}">
<style>
.pre .a{opacity:0}
${css}
</style></head><body>
${markup}
${script}
</body></html>
`;

// Общее для левой колонки: элементы, порядок сверху вниз
const LEFT = ['logo', 'pill', 'star', 'price', 'rub', 'old', 'strike', 'name', 'age', 'legal'];
// финальные трансформы, которые нельзя терять
const REST = { star: 'rotate(-135deg)' };
const tf = (el, extra) => `transform:${extra}${REST[el] ? ' ' + REST[el] : ''}`.replace(/\s+/g, ' ');

const variants = [];

/* ───── 1. Планер: бирка появляется крупно, планирует к авокадо, садится с довесом поворота ───── */
{
  const css = [
    anim('.tag', 'v1tag', [
      { t: 0,    css: `opacity:0;${T(30, 196, 2, 2.2)}`, ease: OEXPO },
      { t: 0.5,  css: `opacity:1;${T(30, 184, 0, 2.4)}` },
      { t: 1.1,  css: `opacity:1;${T(30, 184, 0, 2.4)}`, ease: FLY },
      { t: 1.72, css: `opacity:1;${T(0, 0, -9, 1)}`, ease: OUT },
      { t: 1.95, css: `opacity:1;${T(0, 0, -6, 1)}` },
    ]),
    '.avo{transform-origin:133px 68px}',
    anim('.avo', 'v1avo', [
      { t: 0,    css: 'opacity:0;transform:translateX(160px) scale(1)' },
      { t: 0.8,  css: 'opacity:0;transform:translateX(160px) scale(1)', ease: OEXPO },
      { t: 1.5,  css: 'opacity:1;transform:translateX(0) scale(1)' },
      { t: 1.74, css: 'opacity:1;transform:translateX(0) scale(1)', ease: IO },
      { t: 1.84, css: 'opacity:1;transform:translateX(0) scale(.985)', ease: OUT },
      { t: 2.1,  css: 'opacity:1;transform:translateX(0) scale(1)' },
    ]),
    reveal('.logo',  'v1logo',  1.95, 0.5,  'transform:translateY(-12px)', 'transform:translateY(0)'),
    reveal('.pill',  'v1pill',  2.05, 0.45, 'transform:scale(.85)', 'transform:scale(1)', BACK),
    reveal('.star',  'v1star',  2.3,  0.5,  tf('star', 'scale(0) rotate(-40deg)'), tf('star', 'scale(1) rotate(0deg)')),
    reveal('.price', 'v1price', 2.15, 0.6,  'transform:translateY(24px)', 'transform:translateY(0)'),
    reveal('.rub',   'v1rub',   2.25, 0.55, 'transform:translateY(24px)', 'transform:translateY(0)'),
    reveal('.old',   'v1old',   2.3,  0.5,  'transform:translateY(12px)', 'transform:translateY(0)'),
    anim('.strike', 'v1strike', [
      { t: 0,    css: 'clip-path:inset(0 100% 0 0)' },
      { t: 2.55, css: 'clip-path:inset(0 100% 0 0)', ease: SOFT },
      { t: 2.85, css: 'clip-path:inset(0 0 0 0)' },
    ]),
    reveal('.name',  'v1name',  2.4,  0.55, 'transform:translateY(16px)', 'transform:translateY(0)'),
    reveal('.age',   'v1age',   2.6,  0.5,  'transform:none', 'transform:none'),
    reveal('.legal', 'v1legal', 2.65, 0.5,  'transform:none', 'transform:none'),
  ].join('\n');
  variants.push({ n: 1, title: 'Планер', desc: 'Бирка появляется крупно, планирует к авокадо и садится с лёгким довесом поворота. Авокадо чуть «принимает» её. Контент выходит лесенкой сверху вниз.', css });
}

/* ───── 2. Штамп: бирка висит над сценой с тенью и припечатывается; авокадо пружинит; контент выскакивает ───── */
{
  const SH = (y, b, a) => `filter:drop-shadow(0 ${y}px ${b}px rgba(0,50,110,${a}))`;
  const css = [
    anim('.tag', 'v2tag', [
      { t: 0,    css: `opacity:0;${T(30, 184, -3, 2.8)};${SH(48, 36, 0)}`, ease: OEXPO },
      { t: 0.45, css: `opacity:1;${T(30, 184, -3, 2.6)};${SH(44, 32, .35)}` },
      { t: 1.05, css: `opacity:1;${T(30, 184, -3, 2.6)};${SH(44, 32, .35)}`, ease: IN },
      { t: 1.38, css: `opacity:1;${T(0, 0, -6, 1)};${SH(0, 0, 0)}`, ease: OUT },
      { t: 1.46, css: `opacity:1;${T(0, 0, -6, .965)};${SH(0, 0, 0)}`, ease: OUT },
      { t: 1.7,  css: `opacity:1;${T(0, 0, -6, 1)};${SH(0, 0, 0)}` },
    ]),
    '.avo{transform-origin:50% 100%}',
    anim('.avo', 'v2avo', [
      { t: 0,    css: 'opacity:0;transform:translateY(70px) scale(1,1)' },
      { t: 0.7,  css: 'opacity:0;transform:translateY(70px) scale(1,1)', ease: OEXPO },
      { t: 1.2,  css: 'opacity:1;transform:translateY(0) scale(1,1)' },
      { t: 1.38, css: 'opacity:1;transform:translateY(0) scale(1,1)', ease: OUT },
      { t: 1.47, css: 'opacity:1;transform:translateY(0) scale(1.025,.965)', ease: IO },
      { t: 1.64, css: 'opacity:1;transform:translateY(0) scale(.995,1.01)', ease: OUT },
      { t: 1.82, css: 'opacity:1;transform:translateY(0) scale(1,1)' },
    ]),
    ...[['logo', 1.5], ['pill', 1.58], ['price', 1.66], ['rub', 1.74], ['old', 1.8], ['name', 1.9], ['age', 2.05], ['legal', 2.1]]
      .map(([el, t0]) => reveal(`.${el}`, `v2${el}`, t0, 0.42, tf(el, 'scale(.88)'), tf(el, 'scale(1)'), BACK)),
    reveal('.star', 'v2star', 1.9, 0.45, tf('star', 'scale(0)'), tf('star', 'scale(1)'), BACK),
    anim('.strike', 'v2strike', [
      { t: 0,    css: 'clip-path:inset(0 100% 0 0)' },
      { t: 1.98, css: 'clip-path:inset(0 100% 0 0)', ease: SOFT },
      { t: 2.25, css: 'clip-path:inset(0 0 0 0)' },
    ]),
  ].join('\n');
  variants.push({ n: 2, title: 'Штамп', desc: 'Бирка висит крупно над сценой с мягкой тенью, разгоняется и припечатывается к авокадо. Авокадо пружинит от удара, контент выскакивает с лёгким перелётом.', css });
}

/* ───── 3. Маятник: бирка качается на узелке, затухая, и повисает на черенке ───── */
{
  // ось вращения — узелок (в покое он на черенке авокадо: 569.2, 137.2)
  const css = [
    '.tag{left:315.35px;top:120.6px;transform-origin:253.85px 16.6px}',
    anim('.tag', 'v3tag', [
      { t: 0,    css: `opacity:0;${T(200, 100, 6, 2.3)}`, ease: OUT },
      { t: 0.5,  css: `opacity:1;${T(200, 100, -13, 2.3)}`, ease: IO },
      { t: 1.0,  css: `opacity:1;${T(200, 100, 1, 2.3)}`, ease: FLY },
      { t: 1.7,  css: `opacity:1;${T(0, 0, -11, 1)}`, ease: IO },
      { t: 2.0,  css: `opacity:1;${T(0, 0, -3.5, 1)}`, ease: IO },
      { t: 2.25, css: `opacity:1;${T(0, 0, -7, 1)}`, ease: IO },
      { t: 2.45, css: `opacity:1;${T(0, 0, -6, 1)}` },
    ]),
    // верёвочка с узелком появляются в момент приклейки: штрих дорисовывается от бирки к черенку, узелок ставится в конце
    '.tag__string path{stroke-dasharray:1}',
    anim('.tag__string path', 'v3string', [
      { t: 0,    css: 'stroke-dashoffset:-1' },
      { t: 1.35, css: 'stroke-dashoffset:-1', ease: SOFT },
      { t: 1.7,  css: 'stroke-dashoffset:0' },
    ]),
    reveal('.tag__knot', 'v3knot', 1.64, 0.2, 'transform:scale(0)', 'transform:scale(1)', BACK),
    '.avo{transform-origin:133px 68px}',
    reveal('.avo', 'v3avo', 0.95, 0.6, 'transform:scale(.96)', 'transform:scale(1)'),
    ...[['logo', 1.95], ['pill', 2.04], ['price', 2.22], ['rub', 2.31], ['old', 2.4], ['name', 2.49], ['age', 2.62], ['legal', 2.7]]
      .map(([el, t0]) => reveal(`.${el}`, `v3${el}`, t0, 0.5, tf(el, 'translateY(18px)'), tf(el, 'translateY(0)'))),
    reveal('.star', 'v3star', 2.13, 0.5, tf('star', 'scale(0)'), tf('star', 'scale(1)')),
    anim('.strike', 'v3strike', [
      { t: 0,    css: 'clip-path:inset(0 100% 0 0)' },
      { t: 2.55, css: 'clip-path:inset(0 100% 0 0)', ease: SOFT },
      { t: 2.85, css: 'clip-path:inset(0 0 0 0)' },
    ]),
  ].join('\n');
  variants.push({ n: 3, title: 'Маятник', desc: 'Ось вращения — узелок. Бирка появляется крупно без верёвочки, качнувшись, летит к авокадо; во время полёта из колечка вырастает верёвочка, на посадке ставится узелок — бирка повисает, затухающе покачиваясь. Контент выходит лесенкой.', css });
}

/* ───── 4. Заголовок: сначала только текст «большие скидки», под него выезжает оранжевая бирка ───── */
{
  const css = [
    anim('.tag', 'v4tag', [
      { t: 0,    css: `opacity:0;${T(97, 196, 0, 2.6)}`, ease: OEXPO },
      { t: 0.5,  css: `opacity:1;${T(97, 184, 0, 2.6)}` },
      { t: 1.35, css: `opacity:1;${T(97, 184, 0, 2.6)}`, ease: FLY },
      { t: 1.95, css: `opacity:1;${T(0, 0, -8.5, 1)}`, ease: OUT },
      { t: 2.15, css: `opacity:1;${T(0, 0, -6, 1)}` },
    ]),
    anim('.tag__body', 'v4body', [
      { t: 0,    css: 'opacity:0;clip-path:inset(0 100% 0 0 round 14px)' },
      { t: 0.75, css: 'opacity:1;clip-path:inset(0 100% 0 0 round 14px)', ease: OEXPO },
      { t: 1.2,  css: 'opacity:1;clip-path:inset(0 0 0 0 round 14px)' },
    ]),
    ...['ring', 'string', 'knot'].map(p => anim(`.tag__${p}`, `v4${p}`, [
      { t: 0,    css: 'opacity:0' },
      { t: 1.05, css: 'opacity:0', ease: OUT },
      { t: 1.3,  css: 'opacity:1' },
    ])),
    anim('.avo', 'v4avo', [
      { t: 0,    css: 'opacity:0;transform:translateX(160px)' },
      { t: 1.05, css: 'opacity:0;transform:translateX(160px)', ease: OEXPO },
      { t: 1.75, css: 'opacity:1;transform:translateX(0)' },
    ]),
    reveal('.logo',  'v4logo',  2.1,  0.5,  'transform:translateY(-12px)', 'transform:translateY(0)'),
    reveal('.pill',  'v4pill',  2.2,  0.45, 'transform:scale(.85)', 'transform:scale(1)', BACK),
    reveal('.price', 'v4price', 2.3,  0.6,  'transform:translateY(24px)', 'transform:translateY(0)'),
    reveal('.rub',   'v4rub',   2.4,  0.55, 'transform:translateY(24px)', 'transform:translateY(0)'),
    reveal('.old',   'v4old',   2.45, 0.5,  'transform:translateY(12px)', 'transform:translateY(0)'),
    reveal('.star',  'v4star',  2.45, 0.5,  tf('star', 'scale(0) rotate(-40deg)'), tf('star', 'scale(1) rotate(0deg)')),
    anim('.strike', 'v4strike', [
      { t: 0,   css: 'clip-path:inset(0 100% 0 0)' },
      { t: 2.7, css: 'clip-path:inset(0 100% 0 0)', ease: SOFT },
      { t: 3.0, css: 'clip-path:inset(0 0 0 0)' },
    ]),
    reveal('.name',  'v4name',  2.55, 0.55, 'transform:translateY(16px)', 'transform:translateY(0)'),
    reveal('.age',   'v4age',   2.75, 0.5,  'transform:none', 'transform:none'),
    reveal('.legal', 'v4legal', 2.8,  0.5,  'transform:none', 'transform:none'),
  ].join('\n');
  variants.push({ n: 4, title: 'Заголовок', desc: 'Открывается типографикой: на пустом фоне только белые слова «большие скидки». Под них слева выезжает оранжевая бирка с верёвочкой, и уже бирка летит на авокадо. Дальше — контент.', css });
}

/* ───── 5. Волна: бирка садится, остальное раскрывается от точки посадки по расстоянию ───── */
{
  // точка посадки — узелок (569, 137); задержка = 1.6 + расстояние/1200, сдвиг — 22px к точке
  const P = { logo: [286, 69], pill: [148, 255], star: [245, 330], price: [228, 394], rub: [382, 428], old: [405, 344], strike: [405, 344], name: [253, 495], age: [79, 629], legal: [314, 653] };
  const K = [569, 137];
  const css = [
    anim('.tag', 'v5tag', [
      { t: 0,    css: `opacity:0;${T(30, 184, 0, 3.2)}`, ease: OEXPO },
      { t: 0.45, css: `opacity:1;${T(30, 184, 0, 2.4)}` },
      { t: 1.0,  css: `opacity:1;${T(30, 184, 0, 2.4)}`, ease: FLY },
      { t: 1.6,  css: `opacity:1;${T(0, 0, -8, 1)}`, ease: OUT },
      { t: 1.8,  css: `opacity:1;${T(0, 0, -6, 1)}` },
    ]),
    '.avo{transform-origin:133px 68px}',
    reveal('.avo', 'v5avo', 1.15, 0.5, 'transform:scale(.92)', 'transform:scale(1)'),
    ...LEFT.map(el => {
      const [x, y] = P[el]; const dx = x - K[0], dy = y - K[1]; const d = Math.hypot(dx, dy);
      const ox = (-dx / d * 22).toFixed(1), oy = (-dy / d * 22).toFixed(1);
      const t0 = +(1.6 + d / 1200).toFixed(2);
      const from = el === 'star' ? `translate(${ox}px,${oy}px) scale(.6)` : `translate(${ox}px,${oy}px)`;
      const to = el === 'star' ? 'translate(0,0) scale(1)' : 'translate(0,0)';
      return reveal(`.${el}`, `v5${el}`, t0, 0.55, tf(el, from), tf(el, to));
    }),
  ].join('\n');
  variants.push({ n: 5, title: 'Волна', desc: 'Бирка садится, и от точки посадки расходится волна: авокадо растёт из-под узелка, остальные элементы появляются по расстоянию от неё, чуть сдвигаясь наружу.', css });
}

/* ───── 6. Фокус: бирка не в фокусе у камеры, уходит в глубину и садится; авокадо наводится на резкость ───── */
{
  const F = (b, y, bl, a) => `filter:blur(${b}px) drop-shadow(0 ${y}px ${bl}px rgba(0,60,120,${a}))`;
  const css = [
    anim('.tag', 'v6tag', [
      { t: 0,    css: `opacity:0;${T(30, 184, 0, 3.0)}`, ease: OEXPO },
      { t: 0.55, css: `opacity:1;${T(30, 184, 0, 2.5)}` },
      { t: 1.05, css: `opacity:1;${T(30, 184, 0, 2.5)}`, ease: FLY },
      { t: 1.7,  css: `opacity:1;${T(0, 0, -8, 1)}`, ease: OUT },
      { t: 1.9,  css: `opacity:1;${T(0, 0, -6, 1)}` },
    ], ',v6tagf 1.7s linear both'),
    `@keyframes v6tagf{
  0%{${F(12, 36, 30, 0)};animation-timing-function:${OEXPO}}
  ${pct(0.55, 1.7)}%{${F(0, 34, 28, .3)}}
  ${pct(1.05, 1.7)}%{${F(0, 34, 28, .3)};animation-timing-function:${IO}}
  ${pct(1.35, 1.7)}%{${F(2.5, 14, 12, .18)};animation-timing-function:${OUT}}
  100%{${F(0, 0, 0, 0)}}
}`,
    anim('.avo', 'v6avo', [
      { t: 0,    css: 'opacity:0;transform:scale(.82);filter:blur(10px)' },
      { t: 0.85, css: 'opacity:0;transform:scale(.82);filter:blur(10px)', ease: OEXPO },
      { t: 1.6,  css: 'opacity:1;transform:scale(1);filter:blur(0px)' },
    ]),
    ...[['logo', 1.85], ['pill', 1.94], ['star', 2.03], ['price', 2.12], ['rub', 2.21], ['old', 2.3], ['strike', 2.3], ['name', 2.39], ['age', 2.5], ['legal', 2.57]]
      .map(([el, t0]) => reveal(`.${el}`, `v6${el}`, t0, 0.55, `${tf(el, 'translateY(10px)')};filter:blur(8px)`, `${tf(el, 'translateY(0)')};filter:blur(0px)`)),
  ].join('\n');
  variants.push({ n: 6, title: 'Фокус', desc: 'Бирка возникает слишком близко к камере — крупно и не в фокусе, — наводится на резкость, уходит в глубину сцены и садится на авокадо, которое одновременно выходит из размытия. Контент проявляется из лёгкого расфокуса.', css });
}

for (const v of variants) writeFileSync(`v${v.n}.html`, page(`v${v.n}`, v.title, v.css));

// галерея
const cards = variants.map(v => `  <figure>
    <div class="frame"><iframe src="v${v.n}.html" title="v${v.n} — ${v.title}" loading="eager"></iframe></div>
    <figcaption><b>v${v.n} · ${v.title}</b><span>${v.desc}</span><span class="row"><a href="v${v.n}.html" target="_blank">Открыть</a><button type="button">Повторить</button></span></figcaption>
  </figure>`).join('\n');
writeFileSync('index.html', `<!doctype html>
<html lang="ru"><head><meta charset="utf-8"><title>Бирка «большие скидки» — 6 вариантов анимации</title>
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
@font-face{font-family:'YS Geo';src:url('fonts/YS Geo-Regular.woff2') format('woff2');font-weight:400}
@font-face{font-family:'YS Geo';src:url('fonts/YS Geo-Medium.woff2') format('woff2');font-weight:500}
body{margin:0;padding:40px;background:#f2f7fc;color:#1b3a6a;font:16px/1.4 'YS Geo',Arial,sans-serif}
h1{font-size:28px;font-weight:500;margin:0 0 6px}
p.lead{margin:0 0 28px;color:#5a749b}
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
<h1>Бирка «большие скидки» — 6 вариантов анимации</h1>
<p class="lead">960×720, без библиотек: CSS-кейфреймы. Клик по баннеру — повтор. Тайминги в <code>make.mjs</code>.</p>
<div class="grid">
${cards}
</div>
<script>
document.querySelectorAll('figure button').forEach(b => b.addEventListener('click', () => { const f = b.closest('figure').querySelector('iframe'); f.contentWindow.location.reload(); }));
</script>
</body></html>
`);
console.log('written: ' + variants.map(v => `v${v.n}.html`).join(', ') + ', index.html');

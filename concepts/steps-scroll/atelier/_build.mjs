// Генератор серии «Ателье» — 8 подач блока «Как стать партнёром?».
// Ремесленный слой поверх сайтовых токенов: вложенные оправы (double-bezel), надстрочные
// плашки, кнопка-в-кнопке, собственные кривые вместо ease, движение только по transform/opacity.
// У каждого варианта ровно один «фирменный» приём — остальное держится тихо.
// node _build.mjs → перезаписывает a1–a8.html и index.html. Шрифты — из ../timeline/v1.html
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const OUT = here;
const fonts = readFileSync(join(here, '../timeline/v1.html'), 'utf8').split('\n').filter(l => l.startsWith('@font-face')).join('\n').trim();
if (!fonts.includes('font-weight:900')) throw new Error('не нашёл @font-face в ../timeline/v1.html');

/* ---------- база: токены сайта + ремесленный слой ---------- */
const BASE_CSS = String.raw`
:root{
  --navy:#1b3a6a;--blue:#00adff;--sky:#aad9fc;--light:#f2f7fc;--card:#eaf3fc;--mid:#3e88c5;--dim:#5a749b;--dim-dark:#a7bee0;--white:#fff;--container:1164px;
  --ease:cubic-bezier(.22,.61,.36,1);          /* сайтовая */
  --ease-expo:cubic-bezier(.16,1,.3,1);        /* тяжёлый выход, «масса» */
  --ease-spring:cubic-bezier(.34,1.4,.64,1);   /* лёгкий перелёт за цель */
}
*,*::before,*::after{box-sizing:border-box}
html{scroll-behavior:smooth}
body{margin:0;color:var(--navy);background:#fff;font-family:'YS Geo',Arial,sans-serif;-webkit-font-smoothing:antialiased;overflow-x:clip}
button{border:0;background:none;cursor:pointer;font:inherit;color:inherit}
a{color:inherit;text-decoration:none}
p,h1,h2,h3{margin:0}
.container{width:min(var(--container),calc(100% - 48px));margin-inline:auto;position:relative}
.section-dark{position:relative;color:#fff;background:var(--navy);overflow:hidden}
.section-title{font-size:80px;font-weight:900;line-height:.92;letter-spacing:-.01em;color:#fff}

/* ambient — как на сайте */
.ambient-field{position:absolute;z-index:0;inset:0;overflow:hidden;pointer-events:none;user-select:none}
.ambient-glow{position:absolute;display:flex;align-items:center;justify-content:center;animation-duration:var(--drift-duration,11s);animation-timing-function:cubic-bezier(.45,.05,.55,.95);animation-iteration-count:infinite;animation-direction:alternate;will-change:transform}
.ambient-glow__axis{flex:none;transform:rotate(-32.9deg)}
.ambient-glow__core{position:relative;width:var(--core-w);height:var(--core-h)}
.ambient-glow__core::before{content:'';position:absolute;left:var(--asset-offset);top:var(--asset-offset);width:var(--asset-w);height:var(--asset-h);background:radial-gradient(ellipse closest-side at center,rgba(0,173,255,.78) 0%,rgba(0,173,255,.67) 18%,rgba(0,173,255,.43) 40%,rgba(0,173,255,.2) 62%,rgba(0,173,255,.075) 78%,rgba(0,173,255,.018) 90%,transparent 100%)}
.ambient-glow--medium{--core-w:364.487px;--core-h:626.052px;--asset-offset:-400px;--asset-w:1164.49px;--asset-h:1426.05px;width:646.093px;height:723.625px;animation-name:ambient-drift-a}
.ambient-glow--small{--core-w:316.897px;--core-h:544.31px;--asset-offset:-600px;--asset-w:1516.9px;--asset-h:1744.31px;width:561.735px;height:629.144px;animation-name:ambient-drift-b}
.ambient-glow--steps-left{left:calc(50% - 763px);top:-360.89px;--drift-duration:11s}
.ambient-glow--steps-low{left:calc(50% + 66px);top:490.24px;--drift-duration:9s;animation-delay:-2.6s}
.ambient-glow--steps-high{left:calc(50% + 362px);top:-227.76px;--drift-duration:13s;animation-name:ambient-drift-c;animation-delay:-5.4s}
@keyframes ambient-drift-a{0%{transform:translate3d(-20px,80px,0) scale(.92) rotate(-4deg)}52%{transform:translate3d(156px,-104px,0) scale(1.08) rotate(3deg)}100%{transform:translate3d(48px,44px,0) scale(.98) rotate(-1deg)}}
@keyframes ambient-drift-b{0%{transform:translate3d(68px,-56px,0) scale(.95)}58%{transform:translate3d(-172px,144px,0) scale(1.1)}100%{transform:translate3d(36px,40px,0) scale(1)}}
@keyframes ambient-drift-c{0%{transform:translate3d(84px,96px,0) scale(1.04)}46%{transform:translate3d(-144px,-124px,0) scale(.91)}100%{transform:translate3d(12px,-40px,0) scale(1.08)}}

/* каркас секции — как на сайте */
.steps{min-height:520vh;padding:0;overflow:visible}
.steps__sticky{position:sticky;top:0;min-height:100svh;height:100svh;padding:clamp(30px,5vh,58px) 0;display:grid;align-items:center;overflow:hidden}
.steps__inner{z-index:1}
.steps__header{margin-bottom:clamp(34px,4.4vw,64px)}

/* --- ремесленный слой --- */
/* оправа: внешний поддон с волосяным кантом + внутреннее ядро с концентрическим радиусом */
.a-tray{position:relative;padding:7px;border-radius:34px;background:rgba(255,255,255,.05);box-shadow:inset 0 0 0 1px rgba(255,255,255,.13)}
.a-core{position:relative;height:100%;border-radius:27px;overflow:hidden;background:var(--blue);box-shadow:inset 0 1px 0 rgba(255,255,255,.3),0 24px 60px rgba(0,90,140,.3)}
/* надстрочная плашка вместо голого срока */
.a-brow{display:inline-flex;align-items:center;gap:9px;padding:6px 12px;border-radius:999px;font-size:11px;font-weight:500;line-height:1;letter-spacing:.16em;text-transform:uppercase;white-space:nowrap;background:rgba(255,255,255,.18);color:#fff}
.a-brow.is-quiet{background:rgba(167,190,224,.14);color:var(--dim-dark)}
.a-brow s{width:3px;height:3px;border-radius:50%;background:currentColor;opacity:.6}
/* кнопка-в-кнопке: стрелка живёт в своём круге и тянется по диагонали */
.a-cta{position:relative;z-index:3;display:inline-flex;align-items:center;gap:14px;min-height:52px;padding:8px 8px 8px 26px;border-radius:999px;background:#fff;color:var(--navy);font-size:16px;font-weight:500;line-height:1;white-space:nowrap;transition:transform .35s var(--ease-expo),box-shadow .35s var(--ease-expo)}
.a-cta i{display:grid;place-items:center;width:36px;height:36px;border-radius:50%;background:rgba(27,58,106,.08);transition:transform .45s var(--ease-expo),background .35s}
.a-cta svg{width:14px;height:14px}
.a-cta:hover{box-shadow:0 14px 30px rgba(9,40,80,.3)}
.a-cta:hover i{transform:translate(2px,-2px) scale(1.06);background:rgba(27,58,106,.14)}
.a-cta:active{transform:scale(.98)}
.a-cta:focus-visible{outline:3px solid rgba(255,255,255,.65);outline-offset:3px}
.a-cta--solid{background:var(--blue);color:#fff}
.a-cta--solid i{background:rgba(255,255,255,.2)}
.a-cta--solid:hover i{background:rgba(255,255,255,.3)}

/* шаги */
.pst-rail{display:flex;min-width:0}
.pst-mini{position:relative;min-width:0;padding:0;text-align:left;color:var(--dim-dark);background:none;cursor:pointer}
.pst-mini:focus-visible{outline:3px solid rgba(0,173,255,.5);outline-offset:3px}
.pst-mini b,.pst-mini i,.pst-when,.pst-num{hyphens:none;overflow-wrap:normal;word-break:normal}
.pst-num{display:block;font-size:13px;font-weight:500;line-height:1;color:var(--dim-dark);font-variant-numeric:tabular-nums;transition:color .4s,opacity .4s}
.pst-when{display:block;font-style:normal;font-size:13px;font-weight:500;line-height:1.2;color:var(--blue);white-space:nowrap;transition:color .4s,opacity .4s}
.pst-hit{position:absolute;inset:0;z-index:2;border-radius:inherit;background:none;cursor:pointer}
.pst-hit:focus-visible{outline:3px solid rgba(0,173,255,.5);outline-offset:3px}
.pst-node{position:relative;display:grid;place-items:center;width:22px;height:22px;border-radius:50%;color:#fff;background:var(--navy);box-shadow:inset 0 0 0 1.5px rgba(167,190,224,.4);transition:background .5s var(--ease-expo),box-shadow .5s var(--ease-expo),transform .5s var(--ease-spring)}
.is-active .pst-node{background:var(--blue);box-shadow:0 0 0 5px rgba(0,173,255,.16);transform:scale(1.1)}
.is-done .pst-node{background:var(--blue);box-shadow:none}
.tickmark{width:11px;height:11px;opacity:0;transform:scale(.4);transition:opacity .3s var(--ease-expo),transform .5s var(--ease-spring)}
.is-done .tickmark{opacity:1;transform:none}

/* содержимое шага выезжает лесенкой, а не одним куском */
.pst-pane > *{opacity:0;transform:translateY(16px);transition:opacity .45s var(--ease-expo),transform .6s var(--ease-expo)}
.pst-pane.is-active > *{opacity:1;transform:none}
.pst-pane.is-active > :nth-child(1){transition-delay:.06s}
.pst-pane.is-active > :nth-child(2){transition-delay:.12s}
.pst-pane.is-active > :nth-child(3){transition-delay:.18s}
.pst-pane.is-active > :nth-child(4){transition-delay:.24s}

/* заглушки до/после — проверка пина */
.bumper{min-height:72vh;display:grid;place-content:center;text-align:center;gap:14px;padding:40px;background:var(--light)}
.bumper h1{font-size:44px;font-weight:900;line-height:1;margin:0;letter-spacing:-.01em}
.bumper p{margin:0;color:var(--dim);font-size:18px;max-width:880px}
.bumper a{color:var(--blue);font-weight:500}
.nb{white-space:nowrap}

@media (prefers-reduced-motion:reduce){
  html{scroll-behavior:auto}
  .ambient-glow{animation:none!important}
  *,*::before,*::after{transition-duration:.01ms!important;animation-duration:.01ms!important}
}
`;

const TICK = `<svg class="tickmark" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M2 6.2 4.8 9 10 3.4" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const ARROW = `<svg viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M4 10 10 4M5.4 4H10v4.6" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

/* ---------- ядро: тексты, пин, скролл, клик, финальные галочки ---------- */
const coreJs = (variantJs) => String.raw`
(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const stepsSection = document.querySelector('[data-pst]');
  const STEPS = [
    { n: '01', t: 'Заявка на сайте', d: 'Заполните анкету — мы свяжемся с вами, обсудим формат сотрудничества и ответим на первые вопросы', e: '1 неделя', cta: 'Оставить заявку' },
    { n: '02', t: 'Собеседование и отбор', d: 'Обсуждаем ваш опыт, мотивацию и возможности. В каждом городе выбираем одного партнёра для открытия сети дарксторов', e: '2–3 недели' },
    { n: '03', t: 'Подготовка помещений', d: 'Подбираете помещение по стандартам сети, мы готовим планировку и помогаем с поставщиками оборудования. Ремонт и стройку ведёте вы, мы сопровождаем каждый этап', e: '2–4 месяца' },
    { n: '04', t: 'Подбор персонала', d: 'Параллельно набираете команду: кладовщиков, курьеров и директоров дарксторов. Помогаем привлекать персонал с помощью операционного маркетинга', e: '1–2 месяца' },
    { n: '05', t: 'Запуск сервиса', d: 'Дарксторы заполняются товарами, мы разворачиваем <span class="nb">IT-инфраструктуру</span> и запускаем рекламную кампанию в городе — вы начинаете принимать заказы', e: '1–2 недели' }
  ];
  const tick = '${TICK}';
  const arrow = '${ARROW}';
  const ctaHtml = (step, mod) => step.cta ? '<a class="a-cta' + (mod || '') + '" href="#form">' + step.cta + '<i>' + arrow + '</i></a>' : '';
  const clamp01 = (v) => Math.max(0, Math.min(1, v));
  const panes = stepsSection.querySelector('[data-pst-panes]');
  const rail = stepsSection.querySelector('[data-pst-rail]');
  const progressBox = stepsSection.querySelector('[data-pst-progress]');

  // — то, что меняется между вариантами —
${variantJs}

  const paneItemDefault = (step, i) =>
    '<div class="pst-pane' + (i ? '' : ' is-active') + '">' +
      '<p class="a-brow">' + step.n + '<s></s>' + step.e + '</p>' +
      '<h3>' + step.t + '</h3><p class="a-text">' + step.d + '</p>' +
      (step.cta ? '<div class="pst-foot">' + ctaHtml(step) + '</div>' : '') +
    '</div>';
  const makePane = typeof paneItem === 'function' ? paneItem : paneItemDefault;

  STEPS.forEach((step, i) => {
    if (panes) panes.insertAdjacentHTML('beforeend', makePane(step, i));
    rail.insertAdjacentHTML('beforeend', railItem(step, i));
  });
  const paneNodes = panes ? [...panes.children] : [];
  const miniNodes = [...rail.querySelectorAll('.pst-mini')];
  const measure = () => { if (typeof onMeasure === 'function') onMeasure(); };
  measure();

  let stepState = '';
  let lastIndex = 0;
  const stepOnScroll = () => {
    const travel = stepsSection.offsetHeight - innerHeight;
    if (travel <= 0) return;
    const progress = clamp01(-stepsSection.getBoundingClientRect().top / travel);
    const raw = progress * STEPS.length;
    const index = Math.min(STEPS.length - 1, Math.floor(raw));
    const local = clamp01(raw - index);      // прогресс внутри шага — для непрерывных заливок
    setProgress(progress, index, local);
    progressBox?.setAttribute('aria-valuenow', String(Math.round(progress * 100)));
    // на излёте последнего шага закрывается и он сам — все пять с галочками
    const allDone = progress >= 0.95;
    const state = index + (allDone ? ':done' : '');
    if (state === stepState) return;
    const first = stepState === '';
    stepState = state;
    // направление хода: назад контент уезжает в другую сторону
    stepsSection.classList.toggle('is-back', index < lastIndex);
    paneNodes.forEach((node, i) => node.classList.toggle('is-active', i === index));
    miniNodes.forEach((node, i) => {
      node.classList.toggle('is-active', !allDone && i === index);
      node.classList.toggle('is-done', allDone || i < index);
      node.setAttribute('aria-current', !allDone && i === index ? 'step' : 'false');
    });
    setState(index, allDone, lastIndex, first);
    lastIndex = index;
  };
  // клик по шагу прокручивает к его отрезку — состояние по-прежнему считается от скролла
  miniNodes.forEach((node, i) => {
    (node.querySelector('.pst-hit') || node).addEventListener('click', () => {
      const travel = stepsSection.offsetHeight - innerHeight;
      if (travel <= 0) return;
      const top = stepsSection.getBoundingClientRect().top + scrollY + ((i + 0.5) / STEPS.length) * travel;
      scrollTo({ top, behavior: reduced ? 'auto' : 'smooth' });
    });
  });
  const refresh = () => { measure(); stepState = ''; stepOnScroll(); };
  addEventListener('scroll', stepOnScroll, { passive: true });
  addEventListener('resize', refresh, { passive: true });
  document.fonts?.ready.then(refresh);
  stepOnScroll();
})();
`;

/* =========================================================================
   a1 «Прошивка» — приём: линия сама себя рисует (line drawing)
   ========================================================================= */
const a1 = {
  id: 'a1', title: 'Прошивка', group: 'a',
  sig: 'линия рисует сама себя',
  desc: 'Путь — не заливка готовой линии, а SVG-траектория, которую скролл прочерчивает от узла к узлу; на кончике идёт перо. Линия не прямая: на каждом шаге она уступом уходит вправо, и подписи уходят вместе с ней. Карточка слева собрана как оправа: внешний поддон с волосяным кантом, внутреннее ядро с концентрическим радиусом.',
  short: 'SVG-траектория, которую скролл прочерчивает от узла к узлу; на кончике — перо, подписи уступом уходят вправо',
  css: String.raw`
.pst-layout{display:grid;grid-template-columns:736px minmax(0,1fr);gap:28px;align-items:center;height:clamp(400px,50vh,468px)}
.a-tray{height:308px}
.pst-pane{position:absolute;inset:34px 38px;display:flex;flex-direction:column;align-items:flex-start;justify-content:center;gap:0;pointer-events:none}
.pst-pane.is-active{pointer-events:auto}
.pst-pane:not(.is-active){visibility:hidden;transition:visibility 0s .5s}
.pst-pane h3{margin:16px 0 0;font-size:42px;font-weight:800;line-height:1.03;letter-spacing:-.018em;color:#fff}
.pst-pane .a-text{margin:16px 0 0;font-size:19px;line-height:1.45;color:#fff;max-width:600px}
.pst-foot{margin-top:22px}

.a-stitch{position:relative;height:100%;min-width:0}
.a-stitch svg{position:absolute;inset:0;width:100%;height:100%;overflow:visible}
.a-line{fill:none;stroke:rgba(167,190,224,.22);stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
.a-draw{fill:none;stroke:var(--blue);stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
.a-pen{fill:var(--blue)}
.pst-mini{position:absolute;display:flex;align-items:center;gap:14px;transform:translateY(-50%)}
.pst-mini .pst-lab{display:flex;flex-direction:column;gap:5px;min-width:0}
.pst-mini b{display:block;font-size:15px;font-weight:500;line-height:1.24;color:var(--dim-dark);transition:color .4s,font-weight .2s}
.pst-mini:hover b{color:#fff}
.pst-mini.is-active b{color:#fff;font-weight:800}
.pst-mini.is-done b{opacity:.5}
.pst-mini.is-done .pst-when{color:var(--dim-dark);opacity:.55}
`,
  body: String.raw`
    <div class="container steps__inner">
      <div class="steps__header"><h2 class="section-title">Как стать<br>партнёром?</h2></div>
      <div class="pst-layout">
        <div class="a-tray"><div class="a-core" data-pst-panes></div></div>
        <div class="a-stitch" role="progressbar" aria-label="Прогресс шагов" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" data-pst-progress data-pst-rail>
          <svg aria-hidden="true" data-a-svg><path class="a-line" data-a-line></path><path class="a-draw" data-a-draw></path><circle class="a-pen" r="4" data-a-pen></circle></svg>
        </div>
      </div>
    </div>`,
  js: String.raw`
  const railItem = (step, i) => '<button class="pst-mini" type="button" aria-label="Шаг ' + step.n + ': ' + step.t + ', ' + step.e + '">' +
      '<span class="pst-node">' + tick + '</span>' +
      '<span class="pst-lab"><b>' + step.t + '</b><i class="pst-when">' + step.e + '</i></span>' +
    '</button>';
  const lineEl = stepsSection.querySelector('[data-a-line]');
  const drawEl = stepsSection.querySelector('[data-a-draw]');
  const penEl = stepsSection.querySelector('[data-a-pen]');
  let pathLen = 0;
  const onMeasure = () => {
    const h = rail.clientHeight, n = STEPS.length, top = 20, drift = 16, x0 = 22, r = 9;
    const stepY = (h - top * 2) / (n - 1);
    const pts = STEPS.map((_, i) => ({ x: x0 + i * drift, y: top + i * stepY }));
    let d = 'M ' + pts[0].x + ' ' + pts[0].y;
    for (let i = 1; i < n; i++) {
      const p0 = pts[i - 1], p1 = pts[i];
      d += ' L ' + p0.x + ' ' + (p1.y - r) + ' Q ' + p0.x + ' ' + p1.y + ' ' + (p0.x + r) + ' ' + p1.y + ' L ' + p1.x + ' ' + p1.y;
    }
    lineEl.setAttribute('d', d);
    drawEl.setAttribute('d', d);
    pathLen = drawEl.getTotalLength();
    drawEl.style.strokeDasharray = pathLen;
    miniNodes.forEach((node, i) => { node.style.left = (pts[i].x - 11) + 'px'; node.style.top = pts[i].y + 'px'; });
  };
  const setProgress = (p) => {
    if (!pathLen) return;
    drawEl.style.strokeDashoffset = (pathLen * (1 - p)).toFixed(1);
    const pt = drawEl.getPointAtLength(pathLen * p);
    penEl.setAttribute('cx', pt.x); penEl.setAttribute('cy', pt.y);
    penEl.style.opacity = p > .002 && p < .999 ? '1' : '0';
  };
  const setState = () => {};
`
};

/* =========================================================================
   a2 «Перелёт» — приём: shared element transition, заголовок летит из рейки в карточку
   ========================================================================= */
const a2 = {
  id: 'a2', title: 'Перелёт', group: 'a',
  sig: 'заголовок перелетает из рейки в карточку',
  desc: 'Заголовок шага не подменяется кроссфейдом: он физически перелетает из строки рейки в карточку, вырастая с 15 до 40px по дуге затухания. Приём называется shared element transition — глаз не теряет объект и понимает, что это одно и то же. Работает и на скролле, и на клике по шагу.',
  short: 'заголовок физически перелетает из строки рейки в карточку, вырастая с 15 до 40px (shared element transition)',
  css: String.raw`
.pst-layout{display:grid;grid-template-columns:760px minmax(0,1fr);gap:28px;align-items:center;height:clamp(400px,50vh,464px)}
.a-tray{height:308px}
.pst-pane{position:absolute;inset:34px 38px;display:flex;flex-direction:column;align-items:flex-start;justify-content:center;pointer-events:none}
.pst-pane.is-active{pointer-events:auto}
.pst-pane:not(.is-active){visibility:hidden;transition:visibility 0s .5s}
.pst-pane h3{margin:16px 0 0;font-size:40px;font-weight:800;line-height:1.04;letter-spacing:-.018em;color:#fff;opacity:0;transition:opacity .2s}
.pst-pane.is-active h3{opacity:1;transform:none;transition:opacity .25s linear .42s}
.pst-pane .a-text{margin:16px 0 0;font-size:19px;line-height:1.45;color:#fff;max-width:610px}
.pst-foot{margin-top:22px}
.a-flyer{position:fixed;z-index:40;margin:0;font-size:40px;font-weight:800;line-height:1.04;letter-spacing:-.018em;color:#fff;white-space:nowrap;pointer-events:none;opacity:0;transform-origin:left top;will-change:transform}

.pst-rail{flex-direction:column;justify-content:space-between;height:100%;padding:4px 0;min-width:0}
.pst-mini{display:flex;align-items:center;gap:14px;padding:9px 0}
.pst-mini .pst-lab{display:flex;flex-direction:column;gap:4px;min-width:0}
.pst-mini b{display:block;font-size:15px;font-weight:500;line-height:1.24;color:var(--dim-dark);transition:color .4s,opacity .4s}
.pst-mini:hover b{color:#fff}
.pst-mini.is-active b{color:#fff}
.pst-mini.is-done b{opacity:.5}
.pst-mini.is-done .pst-when{color:var(--dim-dark);opacity:.55}
`,
  body: String.raw`
    <div class="container steps__inner">
      <div class="steps__header"><h2 class="section-title">Как стать<br>партнёром?</h2></div>
      <div class="pst-layout">
        <div class="a-tray"><div class="a-core" data-pst-panes></div></div>
        <div class="pst-rail" role="progressbar" aria-label="Прогресс шагов" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" data-pst-progress data-pst-rail></div>
      </div>
    </div>
    <p class="a-flyer" aria-hidden="true" data-a-flyer></p>`,
  js: String.raw`
  const railItem = (step, i) => '<button class="pst-mini" type="button" aria-label="Шаг ' + step.n + ': ' + step.t + ', ' + step.e + '">' +
      '<span class="pst-node">' + tick + '</span>' +
      '<span class="pst-lab"><b>' + step.t + '</b><i class="pst-when">' + step.e + '</i></span>' +
    '</button>';
  const flyer = stepsSection.querySelector('[data-a-flyer]');
  let flyTimer = 0;
  const fly = (index) => {
    const src = miniNodes[index]?.querySelector('b');
    const dst = paneNodes[index]?.querySelector('h3');
    if (!src || !dst || reduced) return;
    const a = src.getBoundingClientRect(), b = dst.getBoundingClientRect();
    if (!a.width || !b.width) return;
    flyer.textContent = STEPS[index].t;
    flyer.style.transition = 'none';
    flyer.style.left = b.left + 'px';
    flyer.style.top = b.top + 'px';
    flyer.style.transform = 'translate(' + (a.left - b.left) + 'px,' + (a.top - b.top) + 'px) scale(' + (a.width / b.width) + ')';
    flyer.style.opacity = '1';
    void flyer.offsetWidth;
    flyer.style.transition = 'transform .58s var(--ease-expo),opacity .16s linear .42s';
    flyer.style.transform = 'none';
    flyer.style.opacity = '0';
    clearTimeout(flyTimer);
    flyTimer = setTimeout(() => { flyer.style.opacity = '0'; }, 620);
  };
  const setProgress = () => {};
  const setState = (index, allDone, prev, first) => { if (!first && !allDone) fly(index); };
`
};

/* =========================================================================
   a3 «Оправа» — приём: вложенные оправы + счётчик-одометр с табличными цифрами
   ========================================================================= */
const a3 = {
  id: 'a3', title: 'Оправа', group: 'a',
  sig: 'машинная оправа и одометр',
  desc: 'Весь блок собран как деталь: внешний поддон с кантом, внутри тёмная плита, в ней — голубое ядро и рейка, радиусы концентрические (34 → 27 → 20). Наверху служебная строка: надстрочная плашка и счётчик, у которого цифра шага прокручивается барабаном на табличных цифрах — ничего не дёргается по ширине.',
  short: 'весь блок — одна машинная оправа с концентрическими радиусами; наверху счётчик, где цифра шага прокручивается барабаном',
  css: String.raw`
.a-tray{padding:8px;border-radius:36px}
.a-plate{padding:22px 24px 24px;border-radius:28px;background:rgba(9,32,66,.42);box-shadow:inset 0 1px 0 rgba(255,255,255,.06)}
.a-bar{display:flex;align-items:center;justify-content:space-between;gap:20px;margin-bottom:20px}
.a-count{display:flex;align-items:center;gap:10px;font-size:13px;line-height:1;font-weight:500;color:var(--dim-dark);font-variant-numeric:tabular-nums}
.a-odo{display:inline-block;height:1em;line-height:1;overflow:hidden;vertical-align:-.08em}
.a-odo span{display:block;transition:transform .6s var(--ease-spring)}
.a-odo i{display:block;height:1em;line-height:1;font-style:normal;font-weight:800;color:#fff}
.a-grid{display:grid;grid-template-columns:640px minmax(0,1fr);gap:24px;align-items:stretch;height:268px}
.a-core{border-radius:20px}
.pst-pane{position:absolute;inset:28px 32px;display:flex;flex-direction:column;align-items:flex-start;justify-content:center;pointer-events:none}
.pst-pane.is-active{pointer-events:auto}
.pst-pane:not(.is-active){visibility:hidden;transition:visibility 0s .5s}
.pst-pane h3{margin:14px 0 0;font-size:36px;font-weight:800;line-height:1.04;letter-spacing:-.018em;color:#fff}
.pst-pane .a-text{margin:14px 0 0;font-size:18px;line-height:1.44;color:#fff;max-width:540px}
.pst-foot{margin-top:18px}

.pst-rail{flex-direction:column;justify-content:space-between;min-width:0}
.pst-mini{display:flex;align-items:center;gap:13px;padding:7px 0}
.pst-mini .pst-lab{display:flex;flex-direction:column;gap:4px;min-width:0}
.pst-mini b{display:block;font-size:14px;font-weight:500;line-height:1.24;color:var(--dim-dark);transition:color .4s,opacity .4s}
.pst-mini .pst-when{font-size:12px}
.pst-mini:hover b{color:#fff}
.pst-mini.is-active b{color:#fff;font-weight:800}
.pst-mini.is-done b{opacity:.5}
.pst-mini.is-done .pst-when{color:var(--dim-dark);opacity:.55}
`,
  body: String.raw`
    <div class="container steps__inner">
      <div class="steps__header"><h2 class="section-title">Как стать<br>партнёром?</h2></div>
      <div class="a-tray">
        <div class="a-plate">
          <div class="a-bar">
            <p class="a-brow is-quiet">путь партнёра</p>
            <p class="a-count" role="progressbar" aria-label="Прогресс шагов" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" data-pst-progress>шаг <span class="a-odo"><span data-a-odo><i>01</i><i>02</i><i>03</i><i>04</i><i>05</i></span></span> из 05</p>
          </div>
          <div class="a-grid">
            <div class="a-core" data-pst-panes></div>
            <div class="pst-rail" data-pst-rail></div>
          </div>
        </div>
      </div>
    </div>`,
  js: String.raw`
  const railItem = (step, i) => '<button class="pst-mini" type="button" aria-label="Шаг ' + step.n + ': ' + step.t + ', ' + step.e + '">' +
      '<span class="pst-node">' + tick + '</span>' +
      '<span class="pst-lab"><b>' + step.t + '</b><i class="pst-when">' + step.e + '</i></span>' +
    '</button>';
  const odo = stepsSection.querySelector('[data-a-odo]');
  const setProgress = () => {};
  const setState = (index) => { odo.style.transform = 'translateY(-' + index + 'em)'; };
`
};

/* =========================================================================
   a4 «Барабан» — приём: барабан с маской по краям
   ========================================================================= */
const a4 = {
  id: 'a4', title: 'Барабан', group: 'b',
  sig: 'барабан с растворяющимися краями',
  desc: 'Шаги висят на вертикальном барабане во всю ширину: активный стоит в окне, соседние выглядывают сверху и снизу и растворяются в градиентной маске — видно, откуда пришли и куда идём. Барабан доезжает пружиной с лёгким перелётом. Под окном — горизонтальный индекс из пяти станций.',
  short: 'шаги на вертикальном барабане во всю ширину: соседние выглядывают и растворяются в маске, барабан доезжает пружиной',
  css: String.raw`
.a-slot{position:relative;height:300px;overflow:hidden;-webkit-mask-image:linear-gradient(180deg,transparent 0,#000 15%,#000 85%,transparent 100%);mask-image:linear-gradient(180deg,transparent 0,#000 15%,#000 85%,transparent 100%)}
.a-reel{position:absolute;inset:0;transition:transform .72s var(--ease-spring)}
.pst-pane{position:absolute;left:0;right:0;height:180px;border-radius:26px;padding:26px 32px;display:grid;grid-template-columns:400px minmax(0,1fr);gap:40px;align-items:start;background:rgba(255,255,255,.05);box-shadow:inset 0 0 0 1px rgba(255,255,255,.1);opacity:.4;transition:opacity .5s var(--ease-expo),background .5s var(--ease-expo),box-shadow .5s}
.pst-pane.is-active{opacity:1;background:var(--blue);box-shadow:inset 0 1px 0 rgba(255,255,255,.3),0 24px 60px rgba(0,90,140,.3)}
.pst-pane > *{opacity:1;transform:none;transition:none}
.pst-pane h3{margin:14px 0 0;font-size:34px;font-weight:800;line-height:1.04;letter-spacing:-.018em;color:#fff}
.pst-pane .a-text{margin:0;font-size:18px;line-height:1.45;color:#fff}
.pst-foot{margin:18px 0 0}
.a-side{grid-column:2;display:flex;flex-direction:column}

.pst-rail{margin-top:28px;gap:12px;align-items:stretch}
.pst-mini{flex:1;display:flex;align-items:center;gap:11px;padding:14px 16px;border-radius:16px;background:rgba(255,255,255,.035);transition:background .45s var(--ease-expo)}
.pst-mini:hover{background:rgba(255,255,255,.08)}
.pst-mini b{display:block;font-size:13px;font-weight:500;line-height:1.24;color:var(--dim-dark);transition:color .4s,opacity .4s}
.pst-mini .pst-node{width:20px;height:20px;flex:none}
.pst-mini.is-active{background:rgba(0,173,255,.14);box-shadow:inset 0 0 0 1.5px rgba(0,173,255,.6)}
.pst-mini.is-active b{color:#fff;font-weight:800}
.pst-mini.is-done b{opacity:.5}
`,
  body: String.raw`
    <div class="container steps__inner">
      <div class="steps__header"><h2 class="section-title">Как стать<br>партнёром?</h2></div>
      <div class="a-slot"><div class="a-reel" data-a-reel data-pst-panes></div></div>
      <div class="pst-rail" role="progressbar" aria-label="Прогресс шагов" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" data-pst-progress data-pst-rail></div>
    </div>`,
  js: String.raw`
  const STRIDE = 196;
  const paneItem = (step, i) =>
    '<div class="pst-pane' + (i ? '' : ' is-active') + '" style="top:' + (60 + i * STRIDE) + 'px">' +
      '<div><p class="a-brow">' + step.n + '<s></s>' + step.e + '</p><h3>' + step.t + '</h3></div>' +
      '<div class="a-side"><p class="a-text">' + step.d + '</p>' + (step.cta ? '<div class="pst-foot">' + ctaHtml(step) + '</div>' : '') + '</div>' +
    '</div>';
  const railItem = (step, i) => '<div class="pst-mini' + (i ? '' : ' is-active') + '">' +
      '<button class="pst-hit" type="button" aria-label="Шаг ' + step.n + ': ' + step.t + ', ' + step.e + '"></button>' +
      '<span class="pst-node">' + tick + '</span><b>' + step.t + '</b>' +
    '</div>';
  const reel = stepsSection.querySelector('[data-a-reel]');
  const setProgress = () => {};
  const setState = (index) => { reel.style.transform = 'translateY(' + (-index * STRIDE) + 'px)'; };
`
};

/* =========================================================================
   a5 «Кегль» — приём: крупный набор и пословный подъём из-под маски
   ========================================================================= */
const a5 = {
  id: 'a5', title: 'Кегль', group: 'b',
  sig: 'пословный подъём заголовка из-под маски',
  desc: 'Голубой плашки нет вообще — работает набор: название шага набрано 64-м кеглем и при смене поднимается из-под маски слово за словом с задержкой 55 мс. Срок стал надстрочной плашкой, кнопка — с вложенной стрелкой. Справа тонкий индекс из пяти строк, он только отмечает место в пути.',
  short: 'без плашки: заголовок 64px поднимается из-под маски слово за словом, срок — надстрочная плашка',
  css: String.raw`
.pst-layout{display:grid;grid-template-columns:836px minmax(0,1fr);gap:28px;align-items:center;height:clamp(360px,46vh,420px)}
.a-stage{position:relative;height:100%;min-width:0}
.pst-pane{position:absolute;inset:0;display:flex;flex-direction:column;align-items:flex-start;justify-content:center;pointer-events:none}
.pst-pane.is-active{pointer-events:auto}
.pst-pane:not(.is-active){visibility:hidden;transition:visibility 0s .5s}
.pst-pane > *{opacity:1;transform:none;transition:opacity .35s var(--ease-expo)}
.pst-pane:not(.is-active) > *{opacity:0}
.pst-pane h3{margin:18px 0 0;font-size:64px;font-weight:800;line-height:.98;letter-spacing:-.024em;color:#fff}
.a-w{display:inline-block;overflow:hidden;vertical-align:top;padding-bottom:.14em;margin-bottom:-.14em}
.a-w i{display:inline-block;font-style:normal;transform:translateY(115%);transition:transform .75s var(--ease-expo)}
.pst-pane.is-active .a-w i{transform:none;transition-delay:calc(var(--w) * 55ms)}
.pst-pane .a-text{margin:20px 0 0;font-size:19px;line-height:1.5;color:var(--sky);max-width:620px;transition:opacity .4s var(--ease-expo) .2s}
.pst-foot{margin:26px 0 0}

.pst-rail{flex-direction:column;gap:0;min-width:0;padding-left:20px;position:relative}
.pst-rail::before{content:'';position:absolute;left:0;top:6px;bottom:6px;width:2px;border-radius:2px;background:rgba(167,190,224,.18)}
.pst-mini{display:flex;align-items:center;gap:10px;height:38px}
.pst-mini::before{content:'';position:absolute;left:-20px;top:8px;width:2px;height:0;border-radius:2px;background:#fff;transition:height .5s var(--ease-expo)}
.pst-mini b{display:block;font-size:14px;font-weight:500;line-height:1.2;white-space:nowrap;color:var(--dim-dark);transition:color .4s,opacity .4s}
.pst-mini .pst-num{flex:none;width:20px;font-size:12px}
.pst-mini .pst-node{width:18px;height:18px;margin-left:auto;flex:none}
.pst-mini:hover b{color:#fff}
.pst-mini.is-active b{color:#fff;font-weight:800}
.pst-mini.is-active::before{height:22px}
.pst-mini.is-done b,.pst-mini.is-done .pst-num{opacity:.45}
`,
  body: String.raw`
    <div class="container steps__inner">
      <div class="steps__header"><h2 class="section-title">Как стать<br>партнёром?</h2></div>
      <div class="pst-layout">
        <div class="a-stage" data-pst-panes></div>
        <div class="pst-rail" role="progressbar" aria-label="Прогресс шагов" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" data-pst-progress data-pst-rail></div>
      </div>
    </div>`,
  js: String.raw`
  const words = (t) => t.split(' ').map((w, i) => '<span class="a-w" style="--w:' + i + '"><i>' + w + '</i></span>').join(' ');
  const paneItem = (step, i) =>
    '<div class="pst-pane' + (i ? '' : ' is-active') + '">' +
      '<p class="a-brow">' + step.n + '<s></s>' + step.e + '</p>' +
      '<h3>' + words(step.t) + '</h3><p class="a-text">' + step.d + '</p>' +
      (step.cta ? '<div class="pst-foot">' + ctaHtml(step, ' a-cta--solid') + '</div>' : '') +
    '</div>';
  const railItem = (step, i) => '<button class="pst-mini" type="button" aria-label="Шаг ' + step.n + ': ' + step.t + ', ' + step.e + '">' +
      '<span class="pst-num">' + step.n + '</span><b>' + step.t + '</b><span class="pst-node">' + tick + '</span>' +
    '</button>';
  const setProgress = () => {};
  const setState = () => {};
`
};

/* =========================================================================
   a6 «Колода» — приём: стопка по оси Z, карты сдаются
   ========================================================================= */
const a6 = {
  id: 'a6', title: 'Колода', group: 'b',
  sig: 'карты сдаются по оси Z',
  desc: 'Пять шагов — физическая колода во всю ширину: следующие карты выглядывают снизу уменьшенными, пройденные уходят вверх за кадр. Видно, сколько пути осталось, без единой лишней подписи. В финале колода собирается обратно в ровную стопку, а индекс сверху закрывается пятью галочками.',
  short: 'пять шагов как физическая колода: следующие выглядывают снизу, пройденные уходят вверх, в финале стопка собирается',
  css: String.raw`
.pst-rail{gap:12px;margin-bottom:22px}
.pst-mini{flex:1;display:flex;align-items:center;gap:10px;padding:12px 14px;border-radius:14px;background:rgba(255,255,255,.035);transition:background .45s var(--ease-expo)}
.pst-mini:hover{background:rgba(255,255,255,.08)}
.pst-mini b{display:block;font-size:13px;font-weight:500;line-height:1.2;color:var(--dim-dark);transition:color .4s,opacity .4s}
.pst-mini .pst-node{width:18px;height:18px;flex:none}
.pst-mini.is-active{background:rgba(0,173,255,.14);box-shadow:inset 0 0 0 1.5px rgba(0,173,255,.6)}
.pst-mini.is-active b{color:#fff;font-weight:800}
.pst-mini.is-done b{opacity:.5}

.a-deck{position:relative;height:256px}
.pst-pane{position:absolute;left:0;right:0;top:0;height:212px;border-radius:28px;padding:30px 34px;display:grid;grid-template-columns:430px minmax(0,1fr);gap:36px;align-content:start;background:var(--blue);box-shadow:inset 0 1px 0 rgba(255,255,255,.3),0 26px 64px rgba(9,32,66,.45);transform-origin:50% 100%;transition:transform .72s var(--ease-expo),opacity .5s var(--ease-expo)}
.pst-pane > *{opacity:1;transform:none;transition:none}
.pst-pane h3{margin:14px 0 0;font-size:36px;font-weight:800;line-height:1.04;letter-spacing:-.018em;color:#fff}
.pst-pane .a-text{margin:0;font-size:18px;line-height:1.45;color:#fff}
.pst-foot{margin:20px 0 0}
.a-side{display:flex;flex-direction:column}
.a-deck .pst-pane:not(.is-active) .pst-foot,.a-deck .pst-pane:not(.is-active) .a-text{opacity:.001;transition:opacity .3s}
/* карты за активной притоплены — иначе стопка не читается как стопка */
.pst-pane::after{content:'';position:absolute;inset:0;border-radius:inherit;background:rgba(9,32,66,.42);opacity:0;pointer-events:none;transition:opacity .5s var(--ease-expo)}
.pst-pane:not(.is-active)::after{opacity:1}
`,
  body: String.raw`
    <div class="container steps__inner">
      <div class="steps__header"><h2 class="section-title">Как стать<br>партнёром?</h2></div>
      <div class="pst-rail" role="progressbar" aria-label="Прогресс шагов" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" data-pst-progress data-pst-rail></div>
      <div class="a-deck" data-pst-panes></div>
    </div>`,
  js: String.raw`
  const paneItem = (step, i) =>
    '<div class="pst-pane' + (i ? '' : ' is-active') + '">' +
      '<div><p class="a-brow">' + step.n + '<s></s>' + step.e + '</p><h3>' + step.t + '</h3></div>' +
      '<div class="a-side"><p class="a-text">' + step.d + '</p>' + (step.cta ? '<div class="pst-foot">' + ctaHtml(step) + '</div>' : '') + '</div>' +
    '</div>';
  const railItem = (step, i) => '<div class="pst-mini' + (i ? '' : ' is-active') + '">' +
      '<button class="pst-hit" type="button" aria-label="Шаг ' + step.n + ': ' + step.t + ', ' + step.e + '"></button>' +
      '<span class="pst-node">' + tick + '</span><b>' + step.t + '</b>' +
    '</div>';
  const setProgress = () => {};
  const setState = (index, allDone) => {
    paneNodes.forEach((node, i) => {
      const d = i - index;
      let tf, op = 1, z = 10 - Math.abs(d);
      if (allDone) { tf = 'translateY(' + (i * 9) + 'px) scale(' + (1 - i * .018) + ')'; z = 10 - i; }
      else if (d < 0) { tf = 'translateY(-52px) scale(1.015)'; op = 0; z = 1; }
      else { tf = 'translateY(' + (d * 12) + 'px) scale(' + (1 - d * .03) + ')'; op = d > 3 ? 0 : 1; z = 10 - d; }
      node.style.transform = tf;
      node.style.opacity = op;
      node.style.zIndex = z;
    });
  };
`
};

/* =========================================================================
   a7 «Глубина» — приём: расфокус вместо прозрачности
   ========================================================================= */
const a7 = {
  id: 'a7', title: 'Глубина', group: 'b',
  sig: 'глубина резкости',
  desc: 'Весь путь открыт сразу пятью колонками, но в фокусе всегда одна: соседние уходят в расфокус на 1,6px, дальние — на 3px. Это не прозрачность, а глубина резкости, как в объективе: колонки не выключаются, а отступают на второй план. Активная колонка становится голубой плитой и чуть выступает вперёд.',
  short: 'пять колонок открыты сразу, но в фокусе одна: соседние расфокусированы на 1,6px, дальние на 3px — глубина резкости вместо прозрачности',
  css: String.raw`
.pst-rail{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:20px;height:440px;padding:8px 0}
.pst-mini{display:flex;flex-direction:column;padding:22px 20px;border-radius:24px;background:rgba(255,255,255,.04);box-shadow:inset 0 0 0 1px rgba(255,255,255,.07);filter:blur(var(--b,0px));opacity:var(--o,1);transform:scale(var(--s,1));transform-origin:50% 60%;transition:filter .6s var(--ease-expo),opacity .6s var(--ease-expo),transform .6s var(--ease-expo),background .5s var(--ease-expo),box-shadow .5s}
.pst-mini .a-brow{align-self:flex-start;margin-bottom:14px}
.pst-mini b{display:block;font-size:18px;font-weight:800;line-height:1.14;letter-spacing:-.01em;color:#fff}
.pst-mini .a-text{display:block;margin:12px 0 0;font-size:14px;line-height:1.5;color:var(--sky)}
.pst-mini .pst-node{position:absolute;right:18px;bottom:18px;width:20px;height:20px}
.pst-mini:hover{--b:0px;--o:1}
.pst-mini.is-active{background:var(--blue);box-shadow:inset 0 1px 0 rgba(255,255,255,.3),0 26px 60px rgba(9,32,66,.4)}
.pst-mini.is-active .a-text{color:#fff}
.pst-mini.is-active .a-brow{background:rgba(255,255,255,.2)}
.pst-mini .pst-foot{margin-top:auto;padding-top:16px}
.pst-mini .a-cta{min-height:44px;padding:6px 6px 6px 18px;font-size:14px;gap:10px}
.pst-mini .a-cta i{width:32px;height:32px}
.pst-mini:not(.is-active) .pst-foot{opacity:0;visibility:hidden;pointer-events:none;transition:opacity .3s,visibility 0s .3s}
`,
  body: String.raw`
    <div class="container steps__inner">
      <div class="steps__header"><h2 class="section-title">Как стать<br>партнёром?</h2></div>
      <div class="pst-rail" role="progressbar" aria-label="Прогресс шагов" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" data-pst-progress data-pst-rail></div>
    </div>`,
  js: String.raw`
  const railItem = (step, i) => '<div class="pst-mini' + (i ? '' : ' is-active') + '">' +
      '<button class="pst-hit" type="button" aria-label="Шаг ' + step.n + ': ' + step.t + ', ' + step.e + '"></button>' +
      '<p class="a-brow' + (i ? ' is-quiet' : '') + '">' + step.n + '<s></s>' + step.e + '</p>' +
      '<b>' + step.t + '</b><span class="a-text">' + step.d + '</span>' +
      (step.cta ? '<div class="pst-foot">' + ctaHtml(step) + '</div>' : '') +
      '<span class="pst-node">' + tick + '</span>' +
    '</div>';
  const setProgress = () => {};
  const setState = (index, allDone) => {
    miniNodes.forEach((node, i) => {
      const d = allDone ? 0 : Math.abs(i - index);
      node.style.setProperty('--b', (allDone ? 0 : Math.min(d * 1.6, 3)) + 'px');
      node.style.setProperty('--o', allDone ? .82 : (d === 0 ? 1 : d === 1 ? .62 : .42));
      node.style.setProperty('--s', !allDone && d === 0 ? 1.03 : 1);
      node.querySelector('.a-brow')?.classList.toggle('is-quiet', allDone || i !== index);
    });
  };
`
};

/* =========================================================================
   a8 «Кассета» — приём: выдвижной ящик с бегущей связкой
   ========================================================================= */
const a8 = {
  id: 'a8', title: 'Кассета', group: 'b',
  sig: 'ящик под бегущей связкой',
  desc: 'Пять корешков стоят неподвижно во всю ширину — ничего не прыгает и не меняет размер. Под ними выдвинут один ящик с текстом активного шага, а связывает их короткая вертикальная нить, которая переезжает к нужному корешку. Текст в ящике меняется с учётом направления: вперёд — уезжает влево, назад — вправо.',
  short: 'пять неподвижных корешков и один выдвинутый ящик под ними; нить-связка переезжает к активному, текст учитывает направление хода',
  css: String.raw`
.pst-rail{gap:12px;position:relative;padding-bottom:16px}
.pst-mini{flex:1;display:flex;flex-direction:column;justify-content:space-between;gap:14px;height:96px;padding:16px 18px;border-radius:20px;background:rgba(255,255,255,.04);box-shadow:inset 0 0 0 1px rgba(255,255,255,.07);transition:background .45s var(--ease-expo),box-shadow .45s var(--ease-expo)}
.pst-mini:hover{background:rgba(255,255,255,.08)}
.pst-mini .a-top{display:flex;align-items:center;justify-content:space-between;gap:10px}
.pst-mini b{display:block;font-size:15px;font-weight:500;line-height:1.2;color:var(--dim-dark);transition:color .4s,font-weight .2s,opacity .4s}
.pst-mini .pst-node{width:20px;height:20px;flex:none}
.pst-mini.is-active{background:rgba(0,173,255,.14);box-shadow:inset 0 0 0 1.5px rgba(0,173,255,.65)}
.pst-mini.is-active b{color:#fff;font-weight:800}
.pst-mini.is-done b{opacity:.5}
.pst-mini.is-done .pst-when{color:var(--dim-dark);opacity:.55}
.a-thread{position:absolute;left:0;bottom:0;width:2px;height:16px;border-radius:2px;background:var(--blue);transition:transform .62s var(--ease-expo);transform-origin:50% 0}

.a-drawer{position:relative;height:206px;border-radius:30px;overflow:hidden;background:var(--blue);box-shadow:inset 0 1px 0 rgba(255,255,255,.3),0 26px 64px rgba(9,32,66,.42)}
.pst-pane{position:absolute;inset:28px 34px;display:grid;grid-template-columns:420px minmax(0,1fr);gap:40px;align-content:start;pointer-events:none;opacity:0;transform:translateX(46px);transition:opacity .3s var(--ease-expo),transform .55s var(--ease-expo)}
.is-back .pst-pane{transform:translateX(-46px)}
.pst-pane.is-active,.is-back .pst-pane.is-active{opacity:1;transform:none;pointer-events:auto;transition:opacity .45s var(--ease-expo) .1s,transform .6s var(--ease-expo) .1s}
.pst-pane > *{opacity:1;transform:none;transition:none}
.pst-pane h3{margin:14px 0 0;font-size:36px;font-weight:800;line-height:1.04;letter-spacing:-.018em;color:#fff}
.pst-pane .a-text{margin:0;font-size:18px;line-height:1.45;color:#fff}
.pst-foot{margin:20px 0 0}
.a-side{display:flex;flex-direction:column}
`,
  body: String.raw`
    <div class="container steps__inner">
      <div class="steps__header"><h2 class="section-title">Как стать<br>партнёром?</h2></div>
      <div class="pst-rail" role="progressbar" aria-label="Прогресс шагов" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" data-pst-progress data-pst-rail><i class="a-thread" data-a-thread aria-hidden="true"></i></div>
      <div class="a-drawer" data-pst-panes></div>
    </div>`,
  js: String.raw`
  const paneItem = (step, i) =>
    '<div class="pst-pane' + (i ? '' : ' is-active') + '">' +
      '<div><p class="a-brow">' + step.n + '<s></s>' + step.e + '</p><h3>' + step.t + '</h3></div>' +
      '<div class="a-side"><p class="a-text">' + step.d + '</p>' + (step.cta ? '<div class="pst-foot">' + ctaHtml(step) + '</div>' : '') + '</div>' +
    '</div>';
  const railItem = (step, i) => '<div class="pst-mini' + (i ? '' : ' is-active') + '">' +
      '<button class="pst-hit" type="button" aria-label="Шаг ' + step.n + ': ' + step.t + ', ' + step.e + '"></button>' +
      '<span class="a-top"><b>' + step.t + '</b><span class="pst-node">' + tick + '</span></span>' +
      '<i class="pst-when">' + step.e + '</i>' +
    '</div>';
  const thread = stepsSection.querySelector('[data-a-thread]');
  const setProgress = () => {};
  const setState = (index, allDone) => {
    const row = miniNodes[index];
    if (row) thread.style.transform = 'translateX(' + (row.offsetLeft + row.offsetWidth / 2 - 1) + 'px) scaleY(' + (allDone ? 0 : 1) + ')';
  };
`
};

const VARIANTS = [a1, a2, a3, a4, a5, a6, a7, a8];

/* ---------- страница варианта ---------- */
const page = (v) => `<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${v.id} — ${v.title}</title>
<style>
${fonts}
${BASE_CSS}
/* ===== ${v.id}: ${v.title} — приём: ${v.sig} ===== */
${v.css.trim()}
</style>
</head>
<body>

<div class="bumper">
  <h1>${v.id} — ${v.title}</h1>
  <p>${v.desc}</p>
  <p>Скрольте вниз ↓ &nbsp;·&nbsp; <a href="index.html">все варианты</a></p>
</div>

<section class="steps section-dark" id="steps" data-pst>
  <div class="steps__sticky">
    <div class="ambient-field" aria-hidden="true">
      <div class="ambient-glow ambient-glow--steps-left ambient-glow--medium"><div class="ambient-glow__axis"><div class="ambient-glow__core"></div></div></div>
      <div class="ambient-glow ambient-glow--steps-low ambient-glow--small"><div class="ambient-glow__axis"><div class="ambient-glow__core"></div></div></div>
      <div class="ambient-glow ambient-glow--steps-high ambient-glow--small"><div class="ambient-glow__axis"><div class="ambient-glow__core"></div></div></div>
    </div>
${v.body.trim()}
  </div>
</section>

<div class="bumper">
  <h1>Секция открепилась</h1>
  <p>Дальше идёт обычный скролл. <a href="index.html">← Все варианты</a></p>
</div>

<script>
${coreJs(v.js).trim()}
</script>
</body>
</html>
`;

VARIANTS.forEach(v => writeFileSync(join(OUT, v.id + '.html'), page(v)));

/* ---------- галерея серии ---------- */
const item = (v) => `  <a class="item" href="${v.id}.html"><span class="num">${v.id}</span><b>${v.title}</b><span>${v.short}</span></a>`;
const index = `<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Ателье — 8 вариантов блока</title>
<style>
:root{--navy:#1b3a6a;--blue:#00adff;--light:#f2f7fc;--dim:#5a749b}
*{box-sizing:border-box}
body{margin:0;font-family:'YS Geo',Arial,sans-serif;background:var(--light);color:var(--navy);-webkit-font-smoothing:antialiased}
.wrap{max-width:880px;margin:0 auto;padding:72px 24px}
h1{font-size:52px;font-weight:900;line-height:.96;letter-spacing:-.01em;margin:0 0 12px}
h2{font-size:22px;font-weight:800;margin:38px 0 6px}
.sub{color:var(--dim);font-size:18px;margin:0 0 32px;line-height:1.45}
.hint{color:var(--dim);font-size:15px;margin:0 0 16px;line-height:1.5}
a.item{display:flex;align-items:baseline;gap:18px;padding:22px 26px;margin-bottom:14px;border-radius:20px;background:#fff;box-shadow:0 8px 24px rgba(27,58,106,.08);text-decoration:none;color:var(--navy);transition:transform .2s,box-shadow .2s}
a.item:hover{transform:translateY(-2px);box-shadow:0 14px 34px rgba(27,58,106,.14)}
a.item b{font-size:20px;font-weight:800;white-space:nowrap}
a.item span{color:var(--dim);font-size:16px;line-height:1.45}
.num{color:var(--blue);font-weight:800;font-size:20px}
.note{margin-top:40px;color:var(--dim);font-size:14px;line-height:1.6}
.note b{color:var(--navy)}
</style>
</head>
<body>
<div class="wrap">
  <h1>Ателье</h1>
  <p class="sub">Восемь подач блока «Как стать партнёром?», собранных по правилам премиального веба: вложенные оправы вместо плоских карточек, надстрочные плашки вместо голых подписей, кнопка с вложенной стрелкой, собственные кривые вместо ease, движение только по transform и opacity. У каждого варианта ровно один фирменный приём — всё остальное держится тихо. Механика прежняя: пин, скролл ведёт по пяти шагам, клик по шагу, кнопка на первом, в финале все пять с галочками. Desktop 1440.</p>

  <h2>a1–a3 — крупный шаг слева, путь справа</h2>
  <p class="hint">Каркас как на сайте, отличается приём.</p>
${VARIANTS.filter(v => v.group === 'a').map(item).join('\n')}

  <h2>a4–a8 — вольная композиция</h2>
${VARIANTS.filter(v => v.group === 'b').map(item).join('\n')}

  <p class="note">
    Тексты шагов, палитра, типографика и радиусы — из сайтовых исходников (<b>site/styles.css</b>, <b>site/app.js</b>). Прошлые серии — <b>active-chip/</b>, <b>big-card/</b>, <b>timeline/</b>, <b>route/</b>, <b>stage/</b>, <b>move/</b>.<br>
    Файлы самодостаточны: инлайн CSS/JS, шрифты YS Geo в base64, без CDN. Пересобрать все восемь — <b>node _build.mjs</b> в этой папке.
  </p>
</div>
</body>
</html>
`;
writeFileSync(join(OUT, 'index.html'), index);
console.log('written:', VARIANTS.map(v => v.id + '.html').join(', '), '+ index.html →', OUT);

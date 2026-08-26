// Генератор концептов «Путь» — 4 варианта блока «Как стать партнёром?»
// node _build.mjs  → перезаписывает v1–v4.html и index.html рядом с собой.
// Шрифты YS Geo (base64 @font-face) берёт из ../timeline/v1.html, строки 8–11.
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const OUT = here;
const fonts = readFileSync(join(here, '../timeline/v1.html'), 'utf8').split('\n').filter(l => l.startsWith('@font-face')).join('\n').trim();
if (!fonts.includes('font-weight:900')) throw new Error('не нашёл @font-face в ../timeline/v1.html');

/* ---------- общая база: токены, каркас секции, ambient — как на сайте ---------- */
const BASE_CSS = String.raw`
:root{--navy:#1b3a6a;--blue:#00adff;--sky:#aad9fc;--light:#f2f7fc;--card:#eaf3fc;--mid:#3e88c5;--dim:#5a749b;--dim-dark:#a7bee0;--white:#fff;--container:1164px;--ease:cubic-bezier(.22,.61,.36,1);--spring:cubic-bezier(.34,1.56,.64,1)}
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
.steps__sticky{position:sticky;top:0;min-height:100svh;padding:clamp(30px,5vh,58px) 0;display:grid;align-items:center;overflow:hidden}
.steps__inner{z-index:1}
.steps__header{margin-bottom:clamp(34px,4.4vw,64px)}
.pst-layout{display:grid;gap:28px;align-items:stretch}
.pst-bigcard{position:relative;border-radius:32px;background:var(--blue);box-shadow:0 24px 70px rgba(0,90,140,.35);overflow:hidden}
.pst-pane{position:absolute;inset:36px;display:flex;flex-direction:column;opacity:0;transform:translateY(26px);transition:opacity .5s var(--ease),transform .5s var(--ease);pointer-events:none}
.pst-pane.is-active{opacity:1;transform:none;transition-delay:.12s;pointer-events:auto}
.pst-pane h3{margin:0;font-weight:800;letter-spacing:-.018em}
.pst-pane p{margin:16px 0 0}
.pst-foot{margin-top:auto;padding-top:20px;display:flex;flex-direction:column;align-items:flex-start;gap:14px}
.pst-pane em{font-style:normal;font-weight:500;opacity:.9}
.pst-cta{display:inline-flex;align-items:center;min-height:46px;padding:13px 26px;border-radius:999px;background:#fff;color:var(--navy);font-size:16px;font-weight:500;line-height:1;transition:transform .2s var(--ease),box-shadow .2s}
.pst-cta:hover{transform:translateY(-2px);box-shadow:0 12px 26px rgba(9,40,80,.28)}
.pst-cta:focus-visible{outline:3px solid rgba(255,255,255,.6);outline-offset:3px}
.pst-right{display:flex;flex-direction:column;min-width:0}
.pst-bar{flex:none;height:8px;border-radius:999px;background:rgba(167,190,224,.18);overflow:hidden}
.pst-bar i{display:block;height:100%;width:0;border-radius:inherit;background:var(--blue)}
.pst-rail{display:flex;gap:12px}
.pst-mini{position:relative;flex:1;min-width:0;padding:0;border-radius:20px;text-align:left;color:var(--dim-dark);background:none;box-shadow:inset 0 0 0 1px rgba(167,190,224,.28);overflow:hidden;cursor:pointer;transition:box-shadow .5s,background .5s}
.pst-mini:focus-visible{outline:3px solid rgba(0,173,255,.45);outline-offset:2px}
.pst-mini b,.pst-when{hyphens:none;overflow-wrap:normal;word-break:normal}
.pst-when{font-style:normal;font-weight:500;line-height:1.2;color:var(--blue);white-space:nowrap}
.pst-tick{position:absolute;width:22px;height:22px;border-radius:50%;background:transparent;box-shadow:inset 0 0 0 1.5px rgba(167,190,224,.4);display:grid;place-items:center;transition:background .45s var(--ease),box-shadow .45s var(--ease)}
.pst-tick svg{width:11px;height:11px;opacity:0;transform:scale(.4);transition:opacity .35s var(--ease),transform .45s var(--ease)}
.pst-mini.is-done .pst-tick{background:var(--blue);box-shadow:none}
.pst-mini.is-done .pst-tick svg{opacity:1;transform:none}

/* общее для всех четырёх: карточка 600×344, ховер на плашках */
.pst-layout{grid-template-columns:600px minmax(0,1fr)}
.pst-bigcard{min-height:344px}
.pst-pane h3{font-size:42px;line-height:1.04}
.pst-pane p{font-size:19px;line-height:1.42;max-width:520px}
.pst-pane em{font-size:17px}
.pst-mini:hover:not(.is-active){background:rgba(255,255,255,.045);box-shadow:inset 0 0 0 1px rgba(167,190,224,.55)}

/* заглушки до/после для проверки пина */
.bumper{min-height:72vh;display:grid;place-content:center;text-align:center;gap:14px;padding:40px;background:var(--light)}
.bumper h1{font-size:44px;font-weight:900;line-height:1;margin:0;letter-spacing:-.01em}
.bumper p{margin:0;color:var(--dim);font-size:18px;max-width:760px}
.bumper a{color:var(--blue);font-weight:500}

@media (prefers-reduced-motion:reduce){html{scroll-behavior:auto}*,*::before,*::after{transition-duration:.01ms!important;animation-duration:.01ms!important;animation-iteration-count:1!important}}
`;

/* направленная смена контента карточки: новый шаг въезжает по ходу пути (справа), старый уходит назад (влево); при скролле вверх — наоборот */
const DIRECTIONAL_PANE_CSS = String.raw`
.pst-pane{transform:translateX(44px);transition:opacity .28s var(--ease),transform .5s var(--ease)}
.pst-pane.is-leaving{transform:translateX(-44px)}
.is-back .pst-pane{transform:translateX(-44px)}
.is-back .pst-pane.is-leaving{transform:translateX(44px)}
.pst-pane.is-active,.is-back .pst-pane.is-active{transform:none;transition:opacity .45s var(--ease) .14s,transform .55s var(--ease) .14s}
`;
const DIRECTIONAL_PANE_JS = String.raw`
  // направление: вперёд по пути или назад — влияет на то, откуда въезжает контент карточки
  const onIndexChange = (index, prev) => {
    stepsSection.classList.toggle('is-back', index < prev);
    paneNodes.forEach(node => node.classList.remove('is-leaving'));
    if (prev !== index && paneNodes[prev]) {
      const leaving = paneNodes[prev];
      leaving.classList.add('is-leaving');
      setTimeout(() => leaving.classList.remove('is-leaving'), 600);
    }
  };`;

/* ---------- ядро JS: механика с сайта + хуки варианта ---------- */
const coreJs = (variantJs) => String.raw`
(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const stepsSection = document.querySelector('[data-pst]');
  const STEPS = [
    { n: '01', t: 'Заявка на сайте', d: 'Заполните анкету — мы свяжемся с вами, обсудим формат сотрудничества и ответим на первые вопросы', e: '1 неделя', cta: 'Оставить заявку' },
    { n: '02', t: 'Собеседование и отбор', d: 'Обсуждаем ваш опыт, мотивацию и возможности. В каждом городе выбираем одного партнёра для открытия сети дарксторов', e: '2–3 недели' },
    { n: '03', t: 'Подготовка помещений', d: 'Подбираете помещение по стандартам сети, мы готовим планировку и помогаем с поставщиками оборудования. Ремонт и стройку ведёте вы, мы сопровождаем каждый этап', e: '2–4 месяца' },
    { n: '04', t: 'Подбор персонала', d: 'Параллельно набираете команду: кладовщиков, курьеров и директоров дарксторов. Помогаем привлекать персонал с помощью операционного маркетинга', e: '1–2 месяца' },
    { n: '05', t: 'Запуск сервиса', d: 'Дарксторы заполняются товарами, мы разворачиваем IT-инфраструктуру и запускаем рекламную кампанию в городе — вы начинаете принимать заказы', e: '1–2 недели' }
  ];
  const tick = '<svg viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M2 6.2 4.8 9 10 3.4" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const clamp01 = (v) => Math.max(0, Math.min(1, v));
  const smooth = (t) => { t = clamp01(t); return t * t * (3 - 2 * t); };
  const panes = stepsSection.querySelector('[data-pst-panes]');
  const rail = stepsSection.querySelector('[data-pst-rail]');
  const bar = stepsSection.querySelector('[data-pst-bar]');
  const progressBox = stepsSection.querySelector('[data-pst-progress]');
  const nodeBox = stepsSection.querySelector('[data-pst-nodes]');

  STEPS.forEach((step, i) => {
    panes.insertAdjacentHTML('beforeend',
      '<div class="pst-pane' + (i ? '' : ' is-active') + '">' +
        '<h3>' + step.t + '</h3><p>' + step.d + '</p>' +
        '<div class="pst-foot"><em>' + step.e + '</em>' + (step.cta ? '<a class="pst-cta" href="#form">' + step.cta + '</a>' : '') + '</div>' +
      '</div>');
  });
  const paneNodes = [...panes.children];

  // — то, что меняется между вариантами —
${variantJs}

  STEPS.forEach((step, i) => {
    rail.insertAdjacentHTML('beforeend', railItem(step, i));
    if (nodeBox && typeof nodeItem === 'function') nodeBox.insertAdjacentHTML('beforeend', nodeItem(step, i));
  });
  const miniNodes = [...rail.querySelectorAll('.pst-mini')];
  const dotNodes = nodeBox ? [...nodeBox.children] : [];

  let stepState = '';
  let lastIndex = 0;
  const stepOnScroll = () => {
    const travel = stepsSection.offsetHeight - innerHeight;
    if (travel <= 0) return;
    const progress = clamp01(-stepsSection.getBoundingClientRect().top / travel);
    setProgress(progress);
    progressBox?.setAttribute('aria-valuenow', String(Math.round(progress * 100)));
    const index = Math.min(STEPS.length - 1, Math.floor(progress * STEPS.length));
    // на излёте последнего шага закрывается и он сам — все пять плашек с галочками
    const allDone = progress >= 0.95;
    const state = index + (allDone ? ':done' : '');
    if (state === stepState) return;
    stepState = state;
    if (typeof onIndexChange === 'function' && index !== lastIndex) onIndexChange(index, lastIndex);
    paneNodes.forEach((node, i) => node.classList.toggle('is-active', i === index));
    miniNodes.forEach((node, i) => {
      node.classList.toggle('is-active', !allDone && i === index);
      node.classList.toggle('is-done', allDone || i < index);
    });
    dotNodes.forEach((node, i) => {
      node.classList.toggle('is-active', !allDone && i === index);
      node.classList.toggle('is-done', allDone || i < index);
    });
    setState(index, allDone);
    lastIndex = index;
  };
  // клик по шагу прокручивает к его отрезку — состояние по-прежнему считается от скролла
  miniNodes.forEach((node, i) => {
    node.addEventListener('click', () => {
      const travel = stepsSection.offsetHeight - innerHeight;
      if (travel <= 0) return;
      const top = stepsSection.getBoundingClientRect().top + scrollY + ((i + 0.5) / STEPS.length) * travel;
      scrollTo({ top, behavior: reduced ? 'auto' : 'smooth' });
    });
  });
  addEventListener('scroll', stepOnScroll, { passive: true });
  addEventListener('resize', stepOnScroll, { passive: true });
  stepOnScroll();
})();
`;

/* ---------- страница ---------- */
const page = (v) => `<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${v.id} — ${v.title}</title>
<style>
${fonts}
${BASE_CSS}
/* ===== вариант ${v.id}: ${v.title} ===== */
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
    <div class="container steps__inner">
      <div class="steps__header"><h2 class="section-title">Как стать<br>партнёром?</h2></div>
      <div class="pst-layout">
        <div class="pst-bigcard" data-pst-panes></div>
        <div class="pst-right">
${v.right.trim()}
        </div>
      </div>
    </div>
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

/* ======================================================================
   v1 — Курьер: по линии пути едет точка-бегунок
   ====================================================================== */
const v1 = {
  id: 'v1', title: 'Курьер',
  desc: 'По линии пути едет точка: на каждой станции задерживается, потом переезжает к следующей. Пройденные узлы закрываются галочкой, у пройденных плашек гаснет подсветка. Плашки маленькие — номер, название, срок.',
  css: String.raw`
.pst-right{justify-content:center;gap:12px}
.pst-track{position:relative;flex:none;height:36px}
.pst-track__line,.pst-track__fill{position:absolute;top:17px;height:2px;border-radius:2px}
.pst-track__line{left:10%;right:10%;background:rgba(167,190,224,.22)}
.pst-track__fill{left:10%;width:0;background:var(--blue)}
.pst-nodes{position:absolute;inset:0}
.pst-node{position:absolute;top:50%;left:var(--x);width:10px;height:10px;margin:-5px 0 0 -5px;border-radius:50%;background:var(--navy);box-shadow:inset 0 0 0 1.5px rgba(167,190,224,.45);display:grid;place-items:center;transition:width .35s var(--ease),height .35s var(--ease),margin .35s var(--ease),background .4s,box-shadow .4s}
.pst-node svg{width:10px;height:10px;opacity:0;transform:scale(.4);transition:opacity .3s var(--ease),transform .5s var(--spring)}
.pst-node.is-active{box-shadow:inset 0 0 0 2px var(--blue)}
.pst-node.is-done{width:18px;height:18px;margin:-9px 0 0 -9px;background:var(--blue);box-shadow:none}
.pst-node.is-done svg{opacity:1;transform:none}
.pst-walker{position:absolute;top:50%;left:10%;width:18px;height:18px;margin:-9px 0 0 -9px;border-radius:50%;background:var(--blue);box-shadow:0 0 0 3px var(--navy);transition:opacity .4s var(--ease),transform .4s var(--ease);pointer-events:none}
.pst-walker::before{content:'';position:absolute;inset:-7px;border-radius:50%;border:1.5px solid rgba(0,173,255,.6);animation:pst-pulse 1.9s ease-out infinite}
@keyframes pst-pulse{0%{transform:scale(.55);opacity:.9}100%{transform:scale(1.75);opacity:0}}
.steps.is-finished .pst-walker{opacity:0;transform:scale(.4)}
.pst-rail{flex:none;gap:6px;height:88px}
.pst-mini{border-radius:14px}
.pst-fold{position:absolute;inset:11px 8px 10px;display:flex;flex-direction:column;justify-content:space-between}
.pst-num{font-size:12px;font-weight:500;line-height:1;color:var(--dim-dark);transition:color .4s}
.pst-foldbot{display:flex;flex-direction:column;gap:4px;min-width:0}
.pst-fold b{font-size:11px;font-weight:500;line-height:1.25;color:var(--dim-dark);transition:color .4s}
.pst-fold .pst-when{font-size:11px}
.pst-mini.is-active{background:rgba(0,173,255,.14);box-shadow:inset 0 0 0 1.5px rgba(0,173,255,.75)}
.pst-mini.is-active .pst-fold b,.pst-mini.is-active .pst-num{color:#fff}
.pst-mini.is-active .pst-fold b{font-weight:800}
.pst-mini.is-done{background:var(--navy);box-shadow:inset 0 0 0 1px rgba(167,190,224,.12)}
.pst-mini.is-done .pst-fold{opacity:.55}
.pst-mini.is-done .pst-when{color:var(--dim-dark);opacity:.7}
`,
  right: String.raw`
          <div class="pst-track" role="progressbar" aria-label="Прогресс шагов" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" data-pst-progress>
            <i class="pst-track__line"></i><i class="pst-track__fill" data-pst-bar></i>
            <span class="pst-nodes" data-pst-nodes></span>
            <i class="pst-walker" data-pst-walker aria-hidden="true"></i>
          </div>
          <div class="pst-rail" data-pst-rail></div>`,
  js: String.raw`
  const walker = stepsSection.querySelector('[data-pst-walker]');
  const railItem = (step, i) => '<button class="pst-mini' + (i ? '' : ' is-active') + '" type="button" aria-label="Шаг ' + step.n + ': ' + step.t + ', ' + step.e + '">' +
       '<span class="pst-fold"><span class="pst-num">' + step.n + '</span><span class="pst-foldbot"><b>' + step.t + '</b><i class="pst-when">' + step.e + '</i></span></span>' +
     '</button>';
  const nodeItem = (step, i) => '<span class="pst-node' + (i ? '' : ' is-active') + '" style="--x:' + ((i + 0.5) * 20) + '%" aria-hidden="true">' + tick + '</span>';
  // бегунок: первые 55% отрезка стоит на станции, оставшиеся 45% переезжает к следующей
  const setProgress = (p) => {
    const s = p * STEPS.length;
    const i = Math.min(STEPS.length - 1, Math.floor(s));
    const move = i < STEPS.length - 1 ? smooth((s - i - .55) / .45) : 0;
    const x = 10 + 20 * (i + move);
    walker.style.left = x + '%';
    bar.style.width = (x - 10) + '%';
  };
  const setState = (index, allDone) => { stepsSection.classList.toggle('is-finished', allDone); };`
};

/* ======================================================================
   v2 — Сторис: прогресс живёт внутри плашек, каждая заполняется по ходу своего шага
   ====================================================================== */
const v2 = {
  id: 'v2', title: 'Сторис',
  desc: 'Отдельного прогресс-бара нет: у каждой плашки своя полоска сверху, как в сторис. Активная заполняется по ходу скролла внутри шага, пройденные — полные с галочкой, будущие — пустые. Пять полосок подряд и есть линия пути.',
  css: String.raw`
.pst-right{justify-content:center}
.pst-stories{flex:none}
.pst-rail{gap:6px;height:100px}
.pst-mini{border-radius:14px}
.pst-seg{position:absolute;left:10px;right:10px;top:10px;height:3px;border-radius:2px;background:rgba(167,190,224,.22);overflow:hidden}
.pst-seg i{display:block;height:100%;width:var(--fill,0%);border-radius:inherit;background:var(--blue);transition:width .12s linear}
.pst-fold{position:absolute;inset:23px 10px 11px;display:flex;flex-direction:column;justify-content:space-between}
.pst-num{font-size:12px;font-weight:500;line-height:1;color:var(--dim-dark);transition:color .4s}
.pst-foldbot{display:flex;flex-direction:column;gap:4px;min-width:0}
.pst-fold b{font-size:11px;font-weight:500;line-height:1.25;color:var(--dim-dark);transition:color .4s}
.pst-fold .pst-when{font-size:11px}
.pst-tick{top:20px;right:9px;width:18px;height:18px}
.pst-tick svg{width:9px;height:9px;transition:opacity .3s var(--ease),transform .5s var(--spring)}
.pst-mini.is-active{background:rgba(0,173,255,.14);box-shadow:inset 0 0 0 1.5px rgba(0,173,255,.75)}
.pst-mini.is-active .pst-fold b,.pst-mini.is-active .pst-num{color:#fff}
.pst-mini.is-active .pst-fold b{font-weight:800}
.pst-mini.is-done{background:var(--navy);box-shadow:inset 0 0 0 1px rgba(167,190,224,.12)}
.pst-mini.is-done .pst-seg i{width:100%;transition:width .3s var(--ease)}
.pst-mini.is-done .pst-fold{opacity:.55}
.pst-mini.is-done .pst-when{color:var(--dim-dark);opacity:.7}
`,
  right: String.raw`
          <div class="pst-stories" role="progressbar" aria-label="Прогресс шагов" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" data-pst-progress><div class="pst-rail" data-pst-rail></div></div>`,
  js: String.raw`
  const railItem = (step, i) => '<button class="pst-mini' + (i ? '' : ' is-active') + '" type="button" aria-label="Шаг ' + step.n + ': ' + step.t + ', ' + step.e + '">' +
       '<i class="pst-seg" aria-hidden="true"><i></i></i>' +
       '<span class="pst-fold"><span class="pst-num">' + step.n + '</span><span class="pst-foldbot"><b>' + step.t + '</b><i class="pst-when">' + step.e + '</i></span></span>' +
       '<span class="pst-tick">' + tick + '</span>' +
     '</button>';
  // у каждой плашки своя полоска: заполняется от 0 до 100% пока скролл идёт по её отрезку
  const setProgress = (p) => {
    const s = p * STEPS.length;
    rail.querySelectorAll('.pst-mini').forEach((node, i) => node.style.setProperty('--fill', (clamp01(s - i) * 100) + '%'));
  };
  const setState = () => {};`
};

/* ======================================================================
   v3 — Дорога: лента плашек едет под карточкой, активная всегда «под ногами»
   ====================================================================== */
const v3 = {
  id: 'v3', title: 'Дорога',
  desc: 'Плашки шире и стоят лентой, которая переезжает влево на каждом шаге: активная всегда паркуется на одном месте, пройденные уходят за левый край, следующие ждут справа. Контент карточки едет в ту же сторону. В финале лента складывается в пять галочек.',
  css: DIRECTIONAL_PANE_CSS + String.raw`
.pst-right{justify-content:center;gap:16px}
.pst-bar{height:4px}
.pst-road{position:relative;flex:none;overflow:hidden;padding:6px 0;-webkit-mask-image:linear-gradient(90deg,transparent 0,#000 54px,#000 calc(100% - 96px),transparent 100%);mask-image:linear-gradient(90deg,transparent 0,#000 54px,#000 calc(100% - 96px),transparent 100%)}
.pst-road.is-folded{-webkit-mask-image:none;mask-image:none}
.pst-rail{--shift:0px;gap:12px;transform:translateX(calc(64px - var(--shift)));transition:transform .75s var(--ease),gap .6s var(--ease);will-change:transform}
.pst-mini{flex:none;width:172px;height:112px;border-radius:18px;transition:width .6s var(--ease),border-radius .6s var(--ease),background .45s,box-shadow .45s}
.pst-open,.pst-fold{position:absolute;display:flex;flex-direction:column;justify-content:space-between;transition:opacity .35s var(--ease)}
.pst-open{inset:14px 14px 13px}
.pst-fold{inset:11px 8px 10px;opacity:0}
.pst-num{font-size:13px;font-weight:500;line-height:1;color:var(--dim-dark);transition:color .4s}
.pst-openbot,.pst-foldbot{display:flex;flex-direction:column;gap:5px;min-width:0}
.pst-open b{font-size:15px;font-weight:500;line-height:1.2;color:var(--dim-dark);transition:color .4s,font-size .3s}
.pst-open .pst-when{font-size:12px}
.pst-fold .pst-num,.pst-fold .pst-when{font-size:11px}
.pst-fold b{font-size:11px;font-weight:500;line-height:1.25;color:var(--dim-dark)}
.pst-tick{top:12px;right:12px;width:20px;height:20px}
.pst-tick svg{width:10px;height:10px;transition:opacity .3s var(--ease),transform .5s var(--spring)}
.pst-mini.is-active{background:rgba(0,173,255,.14);box-shadow:inset 0 0 0 1.5px rgba(0,173,255,.75)}
.pst-mini.is-active .pst-open b{color:#fff;font-weight:800;font-size:16px}
.pst-mini.is-active .pst-num{color:#fff}
.pst-mini.is-done{background:var(--navy);box-shadow:inset 0 0 0 1px rgba(167,190,224,.12)}
.pst-mini.is-done .pst-open,.pst-mini.is-done .pst-fold{opacity:.55}
.pst-mini.is-done .pst-when{color:var(--dim-dark);opacity:.7}
/* финал: лента возвращается к началу и складывается — все пять помещаются в колонку */
.pst-rail.is-folded{--shift:0px;transform:none;gap:8px}
.pst-rail.is-folded .pst-mini{width:calc((100% - 32px) / 5);border-radius:14px}
.pst-rail.is-folded .pst-open{opacity:0}
.pst-rail.is-folded .pst-fold{opacity:.55;transition-delay:.3s}
.pst-rail.is-folded .pst-tick{top:11px;right:8px;width:18px;height:18px}
.pst-rail.is-folded .pst-tick svg{width:9px;height:9px}
`,
  right: String.raw`
          <div class="pst-bar" role="progressbar" aria-label="Прогресс шагов" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" data-pst-progress><i data-pst-bar></i></div>
          <div class="pst-road"><div class="pst-rail" data-pst-rail></div></div>`,
  js: DIRECTIONAL_PANE_JS + String.raw`
  const railItem = (step, i) => '<button class="pst-mini' + (i ? '' : ' is-active') + '" type="button" aria-label="Шаг ' + step.n + ': ' + step.t + ', ' + step.e + '">' +
       '<span class="pst-open"><span class="pst-num">' + step.n + '</span><span class="pst-openbot"><b>' + step.t + '</b><i class="pst-when">' + step.e + '</i></span></span>' +
       '<span class="pst-fold"><span class="pst-num">' + step.n + '</span><span class="pst-foldbot"><b>' + step.t + '</b><i class="pst-when">' + step.e + '</i></span></span>' +
       '<span class="pst-tick">' + tick + '</span>' +
     '</button>';
  const setProgress = (p) => { bar.style.width = (p * 100) + '%'; };
  // лента сдвигается на ширину плашки + зазор за каждый пройденный шаг; в финале складывается
  const setState = (index, allDone) => {
    rail.classList.toggle('is-folded', allDone);
    rail.parentElement.classList.toggle('is-folded', allDone);
    rail.style.setProperty('--shift', (index * (172 + 12)) + 'px');
  };`
};

/* ======================================================================
   v4 — Хореография: ни одного нового элемента, только движение по ходу пути
   ====================================================================== */
const v4 = {
  id: 'v4', title: 'Хореография',
  desc: 'Состав как на сайте, только меньше: бар и пять плашек с номером, названием, сроком и галочкой. Вся живость — в движении по ходу пути: контент карточки въезжает справа и уходит влево, активная плашка приподнимается, галочка ставится с пружиной, в финале галочки закрываются волной слева направо.',
  css: DIRECTIONAL_PANE_CSS + String.raw`
.pst-right{justify-content:center;gap:14px}
.pst-bar{height:6px}
.pst-rail{flex:none;gap:6px;height:92px;padding-top:6px}
.pst-mini{border-radius:14px;--d:0ms;transition-property:background,box-shadow,transform;transition-duration:.45s,.45s,.5s;transition-timing-function:var(--ease),var(--ease),var(--spring);transition-delay:var(--d),var(--d),0s}
.pst-mini:hover:not(.is-active){transform:translateY(-2px)}
.pst-fold{position:absolute;inset:11px 8px 10px;display:flex;flex-direction:column;justify-content:space-between}
.pst-num{font-size:12px;font-weight:500;line-height:1;color:var(--dim-dark);transition:color .4s}
.pst-foldbot{display:flex;flex-direction:column;gap:4px;min-width:0}
.pst-fold b{font-size:11px;font-weight:500;line-height:1.25;color:var(--dim-dark);transition:color .4s}
.pst-fold .pst-when{font-size:11px}
.pst-tick{top:10px;right:8px;width:18px;height:18px;transform:scale(.9);transition:background .35s var(--ease),box-shadow .35s var(--ease),transform .5s var(--spring);transition-delay:var(--d)}
.pst-tick svg{width:9px;height:9px;transform:scale(.3);transition:opacity .25s var(--ease),transform .55s var(--spring);transition-delay:var(--d)}
.pst-mini.is-active{transform:translateY(-5px);background:rgba(0,173,255,.14);box-shadow:inset 0 0 0 1.5px rgba(0,173,255,.75),0 16px 30px rgba(0,30,80,.35);transition-delay:.1s,.1s,.1s}
.pst-mini.is-active .pst-fold b,.pst-mini.is-active .pst-num{color:#fff}
.pst-mini.is-active .pst-fold b{font-weight:800}
.pst-mini.is-done{background:var(--navy);box-shadow:inset 0 0 0 1px rgba(167,190,224,.12)}
.pst-mini.is-done .pst-fold{opacity:.55}
.pst-mini.is-done .pst-when{color:var(--dim-dark);opacity:.7}
.pst-mini.is-done .pst-tick{transform:none}
`,
  right: String.raw`
          <div class="pst-bar" role="progressbar" aria-label="Прогресс шагов" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" data-pst-progress><i data-pst-bar></i></div>
          <div class="pst-rail" data-pst-rail></div>`,
  js: DIRECTIONAL_PANE_JS + String.raw`
  const railItem = (step, i) => '<button class="pst-mini' + (i ? '' : ' is-active') + '" type="button" aria-label="Шаг ' + step.n + ': ' + step.t + ', ' + step.e + '">' +
       '<span class="pst-fold"><span class="pst-num">' + step.n + '</span><span class="pst-foldbot"><b>' + step.t + '</b><i class="pst-when">' + step.e + '</i></span></span>' +
       '<span class="pst-tick">' + tick + '</span>' +
     '</button>';
  const setProgress = (p) => { bar.style.width = (p * 100) + '%'; };
  // в финале галочки закрываются волной: каждой плашке своя задержка
  const setState = (index, allDone) => {
    rail.querySelectorAll('.pst-mini').forEach((node, i) => node.style.setProperty('--d', allDone ? (i * 80) + 'ms' : '0ms'));
  };`
};

const VARIANTS = [v1, v2, v3, v4];
for (const v of VARIANTS) writeFileSync(join(OUT, v.id + '.html'), page(v));

/* ---------- index ---------- */
const index = `<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Путь — 4 подачи блока</title>
<style>
:root{--navy:#1b3a6a;--blue:#00adff;--light:#f2f7fc;--dim:#5a749b}
*{box-sizing:border-box}
body{margin:0;font-family:'YS Geo',Arial,sans-serif;background:var(--light);color:var(--navy);-webkit-font-smoothing:antialiased}
.wrap{max-width:860px;margin:0 auto;padding:72px 24px}
h1{font-size:52px;font-weight:900;line-height:.96;letter-spacing:-.01em;margin:0 0 12px}
.sub{color:var(--dim);font-size:18px;margin:0 0 44px;line-height:1.45}
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
  <h1>Путь</h1>
  <p class="sub">4 подачи блока «Как стать партнёром?» вокруг идеи пути. Во всех — карточка 600×344 (было 380×430), справа компактные плашки; сетка 1164 = 600 + 28 + 536. Механика прежняя: пин, скролл ведёт по шагам, клик по плашке скроллит к шагу, кнопка на первом шаге, в финале все пять с галочками. Desktop 1440.</p>
  <a class="item" href="v1.html"><span class="num">v1</span><b>Курьер</b><span>по линии пути едет точка-бегунок: стоит на станции, потом переезжает к следующей; пройденные узлы — галочки; под линией пять маленьких плашек</span></a>
  <a class="item" href="v2.html"><span class="num">v2</span><b>Сторис</b><span>прогресс-бара нет — у каждой плашки своя полоска сверху, активная заполняется по ходу скролла внутри шага; пять полосок подряд и есть линия пути</span></a>
  <a class="item" href="v3.html"><span class="num">v3</span><b>Дорога</b><span>лента широких плашек едет влево на каждом шаге, активная всегда на одном месте; контент карточки едет в ту же сторону; в финале лента складывается в пять галочек</span></a>
  <a class="item" href="v4.html"><span class="num">v4</span><b>Хореография</b><span>ни одного нового элемента: бар и плашки как на сайте, только меньше; живость — в направленном движении карточки, подъёме активной плашки, пружинных галочках и финальной волне</span></a>
  <p class="note">
    Тексты шагов, цвета и шрифт YS Geo — из сайтовых исходников (<b>site/</b>). Ширина плашек справа упирается в слово «Собеседование»: при 536px на колонку и пяти плашках подписи идут 11px (Medium 80px, Heavy 82px при внутренней ширине 84–86px) без переносов внутри слов. У всех плашек добавлен ховер — на сайте его нет.<br>
    Файлы самодостаточны: инлайн CSS/JS, шрифты в base64, без CDN; открываются и по file://, и по http.
  </p>
</div>
</body>
</html>
`;
writeFileSync(join(OUT, 'index.html'), index);
console.log('written:', VARIANTS.map(v => v.id + '.html').join(', '), 'index.html →', OUT);

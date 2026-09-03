// Генератор концептов «Сцена» — 4 композиции блока «Как стать партнёром?»
// node _build.mjs → перезаписывает v1–v4.html и index.html рядом с собой.
// Шрифты YS Geo (base64 @font-face) берёт из ../timeline/v1.html
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const OUT = here;
const fonts = readFileSync(join(here, '../timeline/v1.html'), 'utf8').split('\n').filter(l => l.startsWith('@font-face')).join('\n').trim();
if (!fonts.includes('font-weight:900')) throw new Error('не нашёл @font-face в ../timeline/v1.html');

/* ---------- общая база ---------- */
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
.steps__sticky{position:sticky;top:0;min-height:100svh;height:100svh;padding:clamp(30px,5vh,58px) 0;display:grid;align-items:center;overflow:hidden}
.steps__inner{z-index:1}

/* большая плашка и её содержимое */
.pst-bigcard{position:relative;border-radius:32px;background:var(--blue);box-shadow:0 24px 70px rgba(0,90,140,.35);overflow:hidden}
.pst-pane{position:absolute;inset:40px;display:flex;flex-direction:column;opacity:0;transform:translateX(40px);transition:opacity .28s var(--ease),transform .5s var(--ease);pointer-events:none}
.pst-pane.is-leaving{transform:translateX(-40px)}
.is-back .pst-pane{transform:translateX(-40px)}
.is-back .pst-pane.is-leaving{transform:translateX(40px)}
.pst-pane.is-active,.is-back .pst-pane.is-active{opacity:1;transform:none;pointer-events:auto;transition:opacity .45s var(--ease) .14s,transform .55s var(--ease) .14s}
.pst-pane h3{margin:0;font-weight:800;letter-spacing:-.018em;font-size:44px;line-height:1.03}
.pst-pane p{margin:18px 0 0;font-size:20px;line-height:1.42}
.pst-foot{margin-top:auto;padding-top:22px;display:flex;align-items:center;gap:22px}
.pst-pane em{font-style:normal;font-weight:500;opacity:.9;font-size:17px}
.pst-cta{display:inline-flex;align-items:center;min-height:48px;padding:14px 28px;border-radius:999px;background:#fff;color:var(--navy);font-size:16px;font-weight:500;line-height:1;transition:transform .2s var(--ease),box-shadow .2s}
.pst-cta:hover{transform:translateY(-2px);box-shadow:0 12px 26px rgba(9,40,80,.28)}
.pst-cta:focus-visible{outline:3px solid rgba(255,255,255,.6);outline-offset:3px}

/* станции таймлайна */
.pst-rail{display:flex;min-width:0}
.pst-mini{position:relative;flex:1;min-width:0;padding:0;text-align:left;color:var(--dim-dark);background:none;cursor:pointer;transition:background .45s var(--ease),box-shadow .45s var(--ease),color .4s}
.pst-mini:focus-visible{outline:3px solid rgba(0,173,255,.45);outline-offset:3px}
.pst-mini b,.pst-when,.pst-num{hyphens:none;overflow-wrap:normal;word-break:normal}
.pst-num{display:block;font-size:13px;font-weight:500;line-height:1;color:var(--dim-dark);transition:color .4s}
.pst-mini b{display:block;font-size:15px;font-weight:500;line-height:1.24;color:var(--dim-dark);transition:color .4s,font-weight .2s}
.pst-when{display:block;font-style:normal;font-size:13px;font-weight:500;line-height:1.2;color:var(--blue);white-space:nowrap;transition:color .4s,opacity .4s}
.pst-mini.is-active b{color:#fff;font-weight:800}
.pst-mini.is-active .pst-num{color:#fff}
.pst-mini.is-done b,.pst-mini.is-done .pst-num{opacity:.5}
.pst-mini.is-done .pst-when{color:var(--dim-dark);opacity:.55}
.tickmark{width:11px;height:11px;opacity:0;transform:scale(.4);transition:opacity .3s var(--ease),transform .5s var(--spring)}
.is-done .tickmark{opacity:1;transform:none}

/* заглушки до/после для проверки пина */
.bumper{min-height:72vh;display:grid;place-content:center;text-align:center;gap:14px;padding:40px;background:var(--light)}
.bumper h1{font-size:44px;font-weight:900;line-height:1;margin:0;letter-spacing:-.01em}
.bumper p{margin:0;color:var(--dim);font-size:18px;max-width:820px}
.bumper a{color:var(--blue);font-weight:500}

@media (prefers-reduced-motion:reduce){html{scroll-behavior:auto}*,*::before,*::after{transition-duration:.01ms!important;animation-duration:.01ms!important;animation-iteration-count:1!important}}
`;

const TICK = `<svg class="tickmark" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M2 6.2 4.8 9 10 3.4" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

/* ---------- ядро JS ---------- */
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
  const tick = '${TICK}';
  const clamp01 = (v) => Math.max(0, Math.min(1, v));
  const panes = stepsSection.querySelector('[data-pst-panes]');
  const rail = stepsSection.querySelector('[data-pst-rail]');
  const bar = stepsSection.querySelector('[data-pst-bar]');
  const progressBox = stepsSection.querySelector('[data-pst-progress]');

  // — то, что меняется между вариантами —
${variantJs}

  const paneItemDefault = (step, i) =>
    '<div class="pst-pane' + (i ? '' : ' is-active') + '">' +
      '<h3>' + step.t + '</h3><p>' + step.d + '</p>' +
      '<div class="pst-foot"><em>' + step.e + '</em>' + (step.cta ? '<a class="pst-cta" href="#form">' + step.cta + '</a>' : '') + '</div>' +
    '</div>';
  const makePane = typeof paneItem === 'function' ? paneItem : paneItemDefault;

  STEPS.forEach((step, i) => {
    panes.insertAdjacentHTML('beforeend', makePane(step, i));
    rail.insertAdjacentHTML('beforeend', railItem(step, i));
  });
  const paneNodes = [...panes.children];
  const miniNodes = [...rail.querySelectorAll('.pst-mini')];

  // направление: вперёд по пути или назад — контент карточки едет в ту же сторону
  const onIndexChange = (index, prev) => {
    stepsSection.classList.toggle('is-back', index < prev);
    paneNodes.forEach(node => node.classList.remove('is-leaving'));
    if (prev !== index && paneNodes[prev]) {
      const leaving = paneNodes[prev];
      leaving.classList.add('is-leaving');
      setTimeout(() => leaving.classList.remove('is-leaving'), 620);
    }
  };

  let stepState = '';
  let lastIndex = 0;
  const stepOnScroll = () => {
    const travel = stepsSection.offsetHeight - innerHeight;
    if (travel <= 0) return;
    const progress = clamp01(-stepsSection.getBoundingClientRect().top / travel);
    setProgress(progress);
    progressBox?.setAttribute('aria-valuenow', String(Math.round(progress * 100)));
    const index = Math.min(STEPS.length - 1, Math.floor(progress * STEPS.length));
    // на излёте последнего шага закрывается и он сам — все пять станций с галочками
    const allDone = progress >= 0.95;
    const state = index + (allDone ? ':done' : '');
    if (state === stepState) return;
    stepState = state;
    if (index !== lastIndex) onIndexChange(index, lastIndex);
    paneNodes.forEach((node, i) => node.classList.toggle('is-active', i === index));
    miniNodes.forEach((node, i) => {
      node.classList.toggle('is-active', !allDone && i === index);
      node.classList.toggle('is-done', allDone || i < index);
    });
    setState(index, allDone);
    lastIndex = index;
  };
  // клик по станции прокручивает к её отрезку — состояние по-прежнему считается от скролла
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

const page = (v) => `<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${v.id} — ${v.title}</title>
<style>
${fonts}
${BASE_CSS}
/* ===== композиция ${v.id}: ${v.title} ===== */
${v.css.trim()}
</style>
</head>
<body>

<div class="bumper">
  <h1>${v.id} — ${v.title}</h1>
  <p>${v.desc}</p>
  <p>Скрольте вниз ↓ &nbsp;·&nbsp; <a href="index.html">все композиции</a></p>
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
  <p>Дальше идёт обычный скролл. <a href="index.html">← Все композиции</a></p>
</div>

<script>
${coreJs(v.js).trim()}
</script>
</body>
</html>
`;

/* ======================================================================
   v1 — Афиша: заголовок и плашка в одном ряду, таймлайн-линия под ними
   ====================================================================== */
const v1 = {
  id: 'v1', title: 'Афиша',
  desc: 'Заголовок секции встаёт в один ряд с плашкой — пустого угла больше нет. Под ними на всю ширину контейнера идёт линия пути: пять станций с крупными подписями (15px вместо 11px), узел активной — кольцо, пройденные закрываются галочкой.',
  css: String.raw`
.steps__inner{display:flex;flex-direction:column;gap:58px}
.pst-top{display:grid;grid-template-columns:436px minmax(0,1fr);gap:34px;align-items:end}
.section-title{font-size:72px;padding-bottom:6px}
.pst-bigcard{min-height:318px}
.pst-pane{inset:38px 40px}
.pst-track{position:relative;padding-top:30px}
.pst-track__line,.pst-track__fill{position:absolute;top:6px;height:2px;border-radius:2px}
.pst-track__line{left:11px;right:11px;background:rgba(167,190,224,.24)}
.pst-track__fill{left:11px;width:0;background:var(--blue);transition:width .12s linear}
.pst-rail{gap:20px}
.pst-mini{padding:0 12px 0 0}
.pst-mini::before{content:'';position:absolute;left:0;top:-30px;width:14px;height:14px;margin-top:-6px;border-radius:50%;background:var(--navy);box-shadow:inset 0 0 0 1.5px rgba(167,190,224,.5);transition:width .35s var(--ease),height .35s var(--ease),margin .35s var(--ease),background .4s,box-shadow .4s}
.pst-mini.is-active::before{width:20px;height:20px;margin-top:-9px;box-shadow:inset 0 0 0 3px var(--blue)}
.pst-mini.is-done::before{background:var(--blue);box-shadow:none}
.pst-tick{position:absolute;left:0;top:-30px;width:14px;height:14px;margin-top:-6px;display:grid;place-items:center;color:#fff;pointer-events:none}
.pst-tick .tickmark{width:8px;height:8px}
.pst-mini .pst-num{margin-bottom:10px;font-size:14px}
.pst-mini b{min-height:40px;margin-bottom:2px;font-size:16px}
.pst-mini .pst-when{font-size:14px}
.pst-mini:hover:not(.is-active) b{color:#fff}
`,
  body: String.raw`
    <div class="container steps__inner">
      <div class="pst-top">
        <h2 class="section-title">Как стать<br>партнёром?</h2>
        <div class="pst-bigcard" data-pst-panes></div>
      </div>
      <div class="pst-track" role="progressbar" aria-label="Прогресс шагов" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" data-pst-progress>
        <i class="pst-track__line"></i><i class="pst-track__fill" data-pst-bar></i>
        <div class="pst-rail" data-pst-rail></div>
      </div>
    </div>`,
  js: String.raw`
  const railItem = (step, i) => '<button class="pst-mini' + (i ? '' : ' is-active') + '" type="button" aria-label="Шаг ' + step.n + ': ' + step.t + ', ' + step.e + '">' +
       '<span class="pst-num">' + step.n + '</span><b>' + step.t + '</b><i class="pst-when">' + step.e + '</i>' +
       '<span class="pst-tick">' + tick + '</span>' +
     '</button>';
  // линия заполняется до узла активной станции: узлы стоят на 0…80% ширины рейки
  const setProgress = (p) => { bar.style.width = 'calc(' + (p * 80) + '% + ' + (p * 80 / 100 * 20) + 'px)'; };
  const setState = () => {};`
};

/* ======================================================================
   v2 — Полоса: плашка во всю ширину, под ней пять станций-вагонов
   ====================================================================== */
const v2 = {
  id: 'v2', title: 'Полоса',
  desc: 'Плашка растянута на всю ширину контейнера и разбита внутри: слева номер и крупный заголовок шага, справа описание, срок и кнопка. Под плашкой — пять станций-вагонов, соединённых отрезками линии: отрезок голубеет, когда шаг пройден.',
  css: String.raw`
.steps__inner{display:flex;flex-direction:column;gap:34px}
.steps__header{margin-bottom:-6px}
.pst-bigcard{min-height:318px}
.pst-pane{inset:44px 48px;display:grid;grid-template-columns:400px minmax(0,1fr);gap:52px;align-items:start}
.pst-pane__l{display:flex;flex-direction:column;align-items:flex-start;gap:14px;height:100%}
.pst-step{font-size:15px;font-weight:500;opacity:.85;letter-spacing:.02em}
.pst-pane h3{font-size:46px;line-height:1}
.pst-pane__l em{margin-top:auto;font-size:18px}
.pst-pane__r{display:flex;flex-direction:column;height:100%}
.pst-pane p{margin:0;font-size:21px;line-height:1.45;max-width:600px}
.pst-pane__r .pst-foot{padding-top:26px}
.pst-rail{gap:0;align-items:stretch}
.pst-mini{margin-right:26px;padding:18px 20px;border-radius:18px;box-shadow:inset 0 0 0 1px rgba(167,190,224,.28)}
.pst-mini:last-child{margin-right:0}
.pst-mini::after{content:'';position:absolute;right:-26px;top:50%;width:26px;height:1.5px;background:rgba(167,190,224,.28);transition:background .5s var(--ease)}
.pst-mini:last-child::after{display:none}
.pst-mini.is-done::after{background:var(--blue)}
.pst-mini .pst-num{margin-bottom:24px;font-size:14px}
.pst-mini b{margin-bottom:5px;min-height:40px;font-size:16px}
.pst-mini .pst-when{font-size:14px}
.pst-tick{position:absolute;top:16px;right:16px;width:22px;height:22px;border-radius:50%;display:grid;place-items:center;color:#fff;box-shadow:inset 0 0 0 1.5px rgba(167,190,224,.4);transition:background .45s var(--ease),box-shadow .45s var(--ease)}
.pst-mini.is-done .pst-tick{background:var(--blue);box-shadow:none}
.pst-mini:hover:not(.is-active){background:rgba(255,255,255,.05);box-shadow:inset 0 0 0 1px rgba(167,190,224,.55)}
.pst-mini.is-active{background:rgba(0,173,255,.14);box-shadow:inset 0 0 0 1.5px rgba(0,173,255,.75)}
.pst-mini.is-done{background:var(--navy);box-shadow:inset 0 0 0 1px rgba(167,190,224,.12)}
`,
  body: String.raw`
    <div class="container steps__inner">
      <div class="steps__header"><h2 class="section-title">Как стать партнёром?</h2></div>
      <div class="pst-bigcard" data-pst-panes></div>
      <div class="pst-rail" role="progressbar" aria-label="Прогресс шагов" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" data-pst-progress data-pst-rail></div>
    </div>`,
  js: String.raw`
  const paneItem = (step, i) => '<div class="pst-pane' + (i ? '' : ' is-active') + '">' +
      '<div class="pst-pane__l"><span class="pst-step">Шаг ' + step.n + ' из 05</span><h3>' + step.t + '</h3><em>' + step.e + '</em></div>' +
      '<div class="pst-pane__r"><p>' + step.d + '</p>' +
        (step.cta ? '<div class="pst-foot"><a class="pst-cta" href="#form">' + step.cta + '</a></div>' : '') +
      '</div>' +
    '</div>';
  const railItem = (step, i) => '<button class="pst-mini' + (i ? '' : ' is-active') + '" type="button" aria-label="Шаг ' + step.n + ': ' + step.t + ', ' + step.e + '">' +
       '<span class="pst-num">' + step.n + '</span><b>' + step.t + '</b><i class="pst-when">' + step.e + '</i>' +
       '<span class="pst-tick">' + tick + '</span>' +
     '</button>';
  const setProgress = () => {};
  const setState = () => {};`
};

/* ======================================================================
   v3 — Обложка: всё живёт внутри одной голубой плоскости
   ====================================================================== */
const v3 = {
  id: 'v3', title: 'Обложка',
  desc: 'Один блок вместо двух: заголовок секции, шаг и таймлайн собраны внутри голубой плоскости 1164×540. Пустого места не остаётся — экран держит одна плоскость. Станции внизу плашки: активная становится белой, пройденные гаснут и закрываются галочкой.',
  css: String.raw`
.steps__inner{display:block}
.pst-cover{position:relative;border-radius:36px;background:var(--blue);box-shadow:0 30px 80px rgba(0,90,140,.4);padding:48px 56px 28px;min-height:474px;display:flex;flex-direction:column;overflow:hidden}
.pst-cover__top{flex:1;display:grid;grid-template-columns:420px minmax(0,1fr);gap:56px;align-items:stretch}
.pst-cover__head{display:flex;flex-direction:column;height:100%}
.pst-cover .section-title{font-size:58px;line-height:.94}
.pst-count{margin-top:auto;font-size:17px;font-weight:500;line-height:1.2;opacity:.85}
.pst-bigcard{background:none;box-shadow:none;border-radius:0;min-height:214px}
.pst-pane{inset:0}
.pst-pane h3{font-size:44px}
.pst-pane p{font-size:20px}
.pst-cta{background:var(--navy);color:#fff}
.pst-line{position:relative;height:2px;margin:24px 0 0;border-radius:2px;background:rgba(255,255,255,.3)}
.pst-line i{position:absolute;left:0;top:0;height:100%;width:0;border-radius:inherit;background:#fff;transition:width .12s linear}
.pst-rail{gap:10px;margin:12px -10px 0}
.pst-mini{padding:18px 14px 20px;border-radius:16px;color:rgba(255,255,255,.72)}
.pst-mini .pst-num,.pst-mini b{color:rgba(255,255,255,.72)}
.pst-mini .pst-when{color:rgba(255,255,255,.72)}
.pst-mini .pst-num{margin-bottom:10px}
.pst-mini b{margin-bottom:4px;min-height:40px;font-size:16px}
.pst-mini .pst-num{font-size:14px}
.pst-mini .pst-when{font-size:14px}
.pst-mini:hover:not(.is-active){background:rgba(255,255,255,.14)}
.pst-mini.is-active{background:#fff}
.pst-mini.is-active .pst-num{color:var(--mid)}
.pst-mini.is-active b{color:var(--navy);font-weight:800}
.pst-mini.is-active .pst-when{color:var(--mid)}
.pst-mini.is-done{background:rgba(255,255,255,.12)}
.pst-mini.is-done .pst-num,.pst-mini.is-done b,.pst-mini.is-done .pst-when{color:#fff;opacity:.62}
.pst-tick{position:absolute;top:16px;right:14px;width:20px;height:20px;border-radius:50%;display:grid;place-items:center;color:var(--blue);background:transparent;transition:background .45s var(--ease)}
.pst-mini.is-done .pst-tick{background:#fff}
`,
  body: String.raw`
    <div class="container steps__inner">
      <div class="pst-cover">
        <div class="pst-cover__top">
          <div class="pst-cover__head">
            <h2 class="section-title">Как стать<br>партнёром?</h2>
            <span class="pst-count" data-pst-count>Шаг 01 из 05</span>
          </div>
          <div class="pst-bigcard" data-pst-panes></div>
        </div>
        <div class="pst-line" role="progressbar" aria-label="Прогресс шагов" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" data-pst-progress><i data-pst-bar></i></div>
        <div class="pst-rail" data-pst-rail></div>
      </div>
    </div>`,
  js: String.raw`
  const count = stepsSection.querySelector('[data-pst-count]');
  const railItem = (step, i) => '<button class="pst-mini' + (i ? '' : ' is-active') + '" type="button" aria-label="Шаг ' + step.n + ': ' + step.t + ', ' + step.e + '">' +
       '<span class="pst-num">' + step.n + '</span><b>' + step.t + '</b><i class="pst-when">' + step.e + '</i>' +
       '<span class="pst-tick">' + tick + '</span>' +
     '</button>';
  const setProgress = (p) => { bar.style.width = (p * 100) + '%'; };
  const setState = (index, allDone) => { count.textContent = allDone ? 'Все шаги пройдены' : 'Шаг ' + STEPS[index].n + ' из 05'; };`
};

/* ======================================================================
   v4 — Каретка: таймлайн во всю ширину экрана, плашка едет над станцией
   ====================================================================== */
const v4 = {
  id: 'v4', title: 'Каретка',
  desc: 'Таймлайн уходит за границы контейнера и становится «полом» секции во всю ширину экрана. Плашка едет над ним: на каждом шаге она переезжает к своей станции, у активной станции поднимается засечка к плашке. Пустого низа не остаётся — композиция стоит на линии.',
  css: String.raw`
.steps__sticky{display:block;padding:0}
.steps__inner{position:absolute;left:50%;top:78px;transform:translateX(-50%);width:min(var(--container),calc(100% - 48px));display:flex;align-items:flex-start;justify-content:space-between;gap:40px}
.section-title{font-size:72px}
.pst-count{flex:none;padding-top:12px;font-size:17px;font-weight:500;line-height:1.2;color:var(--dim-dark)}
.pst-stage{position:absolute;inset:0;z-index:1}
.pst-bigcard{position:absolute;top:52%;left:0;width:664px;min-height:280px;transform:translate3d(var(--x,44px),-50%,0);transition:transform .8s var(--ease)}
.pst-pane{inset:36px 38px}
.pst-pane h3{font-size:40px}
.pst-pane p{font-size:19px}
.pst-floor{position:absolute;left:0;right:0;bottom:70px;z-index:1}
.pst-floor__line,.pst-floor__fill{position:absolute;top:0;height:2px}
.pst-floor__line{left:44px;right:44px;background:rgba(167,190,224,.22)}
.pst-floor__fill{left:44px;width:0;background:var(--blue);transition:width .12s linear}
.pst-rail{gap:0;padding:0 44px}
.pst-mini{padding:30px 26px 0;text-align:left}
.pst-mini::before{content:'';position:absolute;left:26px;top:0;width:14px;height:14px;margin-top:-6px;border-radius:50%;background:var(--navy);box-shadow:inset 0 0 0 1.5px rgba(167,190,224,.5);transition:width .35s var(--ease),height .35s var(--ease),margin .35s var(--ease),background .4s,box-shadow .4s}
.pst-mini.is-active::before{width:20px;height:20px;margin-top:-9px;box-shadow:inset 0 0 0 3px var(--blue)}
.pst-mini.is-done::before{background:var(--blue);box-shadow:none}
.pst-notch{position:absolute;left:32px;bottom:100%;width:2px;height:0;background:linear-gradient(to top,rgba(0,173,255,.75),rgba(0,173,255,0));transition:height .5s var(--ease)}
.pst-mini.is-active .pst-notch{height:92px}
.pst-tick{position:absolute;left:26px;top:0;width:14px;height:14px;margin-top:-6px;display:grid;place-items:center;color:#fff;pointer-events:none}
.pst-tick .tickmark{width:8px;height:8px}
.pst-mini .pst-num{margin-bottom:9px}
.pst-mini b{margin-bottom:6px;max-width:236px}
.pst-mini:hover:not(.is-active) b{color:#fff}
`,
  body: String.raw`
    <div class="container steps__inner">
      <h2 class="section-title">Как стать<br>партнёром?</h2>
      <span class="pst-count" data-pst-count>Шаг 01 из 05</span>
    </div>
    <div class="pst-stage">
      <div class="pst-bigcard" data-pst-panes data-pst-carriage></div>
    </div>
    <div class="pst-floor" role="progressbar" aria-label="Прогресс шагов" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" data-pst-progress>
      <i class="pst-floor__line"></i><i class="pst-floor__fill" data-pst-bar></i>
      <div class="pst-rail" data-pst-rail></div>
    </div>`,
  js: String.raw`
  const carriage = stepsSection.querySelector('[data-pst-carriage]');
  const count = stepsSection.querySelector('[data-pst-count]');
  const railItem = (step, i) => '<button class="pst-mini' + (i ? '' : ' is-active') + '" type="button" aria-label="Шаг ' + step.n + ': ' + step.t + ', ' + step.e + '">' +
       '<i class="pst-notch" aria-hidden="true"></i>' +
       '<span class="pst-num">' + step.n + '</span><b>' + step.t + '</b><i class="pst-when">' + step.e + '</i>' +
       '<span class="pst-tick">' + tick + '</span>' +
     '</button>';
  const setProgress = (p) => { bar.style.width = 'calc((100% - 88px) * ' + p + ')'; };
  // плашка едет к станции активного шага: её узел — цель, у краёв экрана положение кламплится
  const setState = (index, allDone) => {
    count.textContent = allDone ? 'Все шаги пройдены' : 'Шаг ' + STEPS[index].n + ' из 05';
    const node = miniNodes[index];
    if (!node) return;
    const dot = node.getBoundingClientRect().left + 33;
    const w = carriage.offsetWidth;
    const x = Math.max(44, Math.min(innerWidth - w - 44, dot - w / 2));
    carriage.style.setProperty('--x', x + 'px');
  };`
};


/* ======================================================================
   v2a — Полоса · Колонка: один поток сверху вниз, две колонки только на подписи
   ====================================================================== */
const v2a = {
  id: 'v2a', title: 'Полоса · Колонка',
  desc: 'Тот же низ, что в v2. Голубой блок одним потоком: верхняя строка (срок крупно слева, «01 из 05» справа) → заголовок → описание → кнопка. Одна гарнитура и один вес во всех подписях, отличается только кегль.',
  css: String.raw`
.steps__inner{display:flex;flex-direction:column;gap:34px}
.steps__header{margin-bottom:-6px}
.pst-bigcard{min-height:310px}
.pst-pane{inset:40px 48px;display:flex;flex-direction:column;align-items:flex-start;gap:0}
/* верхняя строка: срок слева крупно, счётчик шага справа — одна гарнитура, один вес, разный только кегль */
.pst-top{width:100%;display:flex;align-items:baseline;justify-content:space-between;gap:24px}
.pst-when-big{font-size:22px;font-weight:500;line-height:1;letter-spacing:-.01em}
.pst-count{font-size:15px;font-weight:500;line-height:1;opacity:.75;font-variant-numeric:tabular-nums;white-space:nowrap}
.pst-pane h3{margin-top:18px;font-size:46px;line-height:1}
.pst-pane p{margin:16px 0 0;font-size:20px;line-height:1.45;max-width:760px}
.pst-foot{margin-top:auto;padding-top:22px}
.pst-rail{gap:0;align-items:stretch}
.pst-mini{margin-right:26px;padding:18px 20px;border-radius:18px;box-shadow:inset 0 0 0 1px rgba(167,190,224,.28)}
.pst-mini:last-child{margin-right:0}
.pst-mini::after{content:'';position:absolute;right:-26px;top:50%;width:26px;height:1.5px;background:rgba(167,190,224,.28);transition:background .5s var(--ease)}
.pst-mini:last-child::after{display:none}
.pst-mini.is-done::after{background:var(--blue)}
.pst-mini .pst-num{margin-bottom:24px;font-size:14px}
.pst-mini b{margin-bottom:5px;min-height:40px;font-size:16px}
.pst-mini .pst-when{font-size:14px}
.pst-tick{position:absolute;top:16px;right:16px;width:22px;height:22px;border-radius:50%;display:grid;place-items:center;color:#fff;box-shadow:inset 0 0 0 1.5px rgba(167,190,224,.4);transition:background .45s var(--ease),box-shadow .45s var(--ease)}
.pst-mini.is-done .pst-tick{background:var(--blue);box-shadow:none}
.pst-mini:hover:not(.is-active){background:rgba(255,255,255,.05);box-shadow:inset 0 0 0 1px rgba(167,190,224,.55)}
.pst-mini.is-active{background:rgba(0,173,255,.14);box-shadow:inset 0 0 0 1.5px rgba(0,173,255,.75)}
.pst-mini.is-done{background:var(--navy);box-shadow:inset 0 0 0 1px rgba(167,190,224,.12)}
`,
  body: String.raw`
    <div class="container steps__inner">
      <div class="steps__header"><h2 class="section-title">Как стать партнёром?</h2></div>
      <div class="pst-bigcard" data-pst-panes></div>
      <div class="pst-rail" role="progressbar" aria-label="Прогресс шагов" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" data-pst-progress data-pst-rail></div>
    </div>`,
  js: String.raw`
  const paneItem = (step, i) => '<div class="pst-pane' + (i ? '' : ' is-active') + '">' +
      '<div class="pst-top"><span class="pst-when-big">' + step.e + '</span><span class="pst-count">' + step.n + ' из 05</span></div>' +
      '<h3>' + step.t + '</h3><p>' + step.d + '</p>' +
      (step.cta ? '<div class="pst-foot"><a class="pst-cta" href="#form">' + step.cta + '</a></div>' : '') +
    '</div>';
  const railItem = (step, i) => '<button class="pst-mini' + (i ? '' : ' is-active') + '" type="button" aria-label="Шаг ' + step.n + ': ' + step.t + ', ' + step.e + '">' +
       '<span class="pst-num">' + step.n + '</span><b>' + step.t + '</b><i class="pst-when">' + step.e + '</i>' +
       '<span class="pst-tick">' + tick + '</span>' +
     '</button>';
  const setProgress = () => {};
  const setState = () => {};
`
};

/* ======================================================================
   v2b — Полоса · Цифра: крупный номер шага держит левый край
   ====================================================================== */
const v2b = {
  id: 'v2b', title: 'Полоса · Цифра',
  desc: 'Тот же низ. Слева — крупная цифра шага (120px, полупрозрачная), она держит левый край и даёт блоку ритм. Справа один поток: срок мелко, заголовок, описание, кнопка. Две колонки, но у обеих один верх и одна логика.',
  css: String.raw`
.steps__inner{display:flex;flex-direction:column;gap:34px}
.steps__header{margin-bottom:-6px}
.pst-bigcard{min-height:288px}
.pst-pane{inset:36px 48px 40px;display:grid;grid-template-columns:200px minmax(0,1fr);gap:40px;align-items:start}
.pst-big{font-size:132px;font-weight:900;line-height:1;letter-spacing:-.04em;color:#fff;opacity:.34;font-variant-numeric:tabular-nums;margin-top:-22px}
.pst-pane__r{display:flex;flex-direction:column;align-items:flex-start;height:100%}
.pst-when-top{font-size:14px;font-weight:500;letter-spacing:.02em;opacity:.85}
.pst-pane h3{margin-top:10px;font-size:44px;line-height:1}
.pst-pane p{margin:14px 0 0;font-size:20px;line-height:1.45;max-width:700px}
.pst-foot{margin-top:auto;padding-top:22px}
.pst-rail{gap:0;align-items:stretch}
.pst-mini{margin-right:26px;padding:18px 20px;border-radius:18px;box-shadow:inset 0 0 0 1px rgba(167,190,224,.28)}
.pst-mini:last-child{margin-right:0}
.pst-mini::after{content:'';position:absolute;right:-26px;top:50%;width:26px;height:1.5px;background:rgba(167,190,224,.28);transition:background .5s var(--ease)}
.pst-mini:last-child::after{display:none}
.pst-mini.is-done::after{background:var(--blue)}
.pst-mini .pst-num{margin-bottom:24px;font-size:14px}
.pst-mini b{margin-bottom:5px;min-height:40px;font-size:16px}
.pst-mini .pst-when{font-size:14px}
.pst-tick{position:absolute;top:16px;right:16px;width:22px;height:22px;border-radius:50%;display:grid;place-items:center;color:#fff;box-shadow:inset 0 0 0 1.5px rgba(167,190,224,.4);transition:background .45s var(--ease),box-shadow .45s var(--ease)}
.pst-mini.is-done .pst-tick{background:var(--blue);box-shadow:none}
.pst-mini:hover:not(.is-active){background:rgba(255,255,255,.05);box-shadow:inset 0 0 0 1px rgba(167,190,224,.55)}
.pst-mini.is-active{background:rgba(0,173,255,.14);box-shadow:inset 0 0 0 1.5px rgba(0,173,255,.75)}
.pst-mini.is-done{background:var(--navy);box-shadow:inset 0 0 0 1px rgba(167,190,224,.12)}
`,
  body: String.raw`
    <div class="container steps__inner">
      <div class="steps__header"><h2 class="section-title">Как стать партнёром?</h2></div>
      <div class="pst-bigcard" data-pst-panes></div>
      <div class="pst-rail" role="progressbar" aria-label="Прогресс шагов" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" data-pst-progress data-pst-rail></div>
    </div>`,
  js: String.raw`
  const paneItem = (step, i) => '<div class="pst-pane' + (i ? '' : ' is-active') + '">' +
      '<div class="pst-big" aria-hidden="true">' + step.n + '</div>' +
      '<div class="pst-pane__r"><span class="pst-when-top">' + step.e + '</span><h3>' + step.t + '</h3><p>' + step.d + '</p>' +
        (step.cta ? '<div class="pst-foot"><a class="pst-cta" href="#form">' + step.cta + '</a></div>' : '') +
      '</div>' +
    '</div>';
  const railItem = (step, i) => '<button class="pst-mini' + (i ? '' : ' is-active') + '" type="button" aria-label="Шаг ' + step.n + ': ' + step.t + ', ' + step.e + '">' +
       '<span class="pst-num">' + step.n + '</span><b>' + step.t + '</b><i class="pst-when">' + step.e + '</i>' +
       '<span class="pst-tick">' + tick + '</span>' +
     '</button>';
  const setProgress = () => {};
  const setState = () => {};
`
};

/* ======================================================================
   v2c — Полоса · Плашки: служебка в чипах сверху, кнопка внизу справа
   ====================================================================== */
const v2c = {
  id: 'v2c', title: 'Полоса · Плашки',
  desc: 'Тот же низ. Сверху блока строка чипов: «01 из 05» и срок — в белых полупрозрачных плашках, как на сайте. Ниже заголовок и описание одной колонкой. Кнопка стоит в правом нижнем углу — на своём естественном месте для действия, но у неё есть пара: слева внизу подпись «следующий шаг →», чтобы угол не висел.',
  css: String.raw`
.steps__inner{display:flex;flex-direction:column;gap:34px}
.steps__header{margin-bottom:-6px}
.pst-bigcard{min-height:312px}
.pst-pane{inset:36px 48px;display:flex;flex-direction:column;align-items:stretch}
.pst-chips{display:flex;gap:8px}
.pst-chip{display:inline-flex;align-items:center;min-height:30px;padding:0 13px;border-radius:999px;background:rgba(255,255,255,.18);font-size:13px;font-weight:500;letter-spacing:.01em}
.pst-pane h3{margin-top:18px;font-size:46px;line-height:1}
.pst-pane p{margin:14px 0 0;font-size:20px;line-height:1.45;max-width:760px}
.pst-bot{margin-top:auto;padding-top:22px;display:flex;align-items:flex-end;justify-content:space-between;gap:24px}
.pst-next{font-size:15px;font-weight:500;opacity:.8}
.pst-next b{font-weight:800;opacity:1}
.pst-rail{gap:0;align-items:stretch}
.pst-mini{margin-right:26px;padding:18px 20px;border-radius:18px;box-shadow:inset 0 0 0 1px rgba(167,190,224,.28)}
.pst-mini:last-child{margin-right:0}
.pst-mini::after{content:'';position:absolute;right:-26px;top:50%;width:26px;height:1.5px;background:rgba(167,190,224,.28);transition:background .5s var(--ease)}
.pst-mini:last-child::after{display:none}
.pst-mini.is-done::after{background:var(--blue)}
.pst-mini .pst-num{margin-bottom:24px;font-size:14px}
.pst-mini b{margin-bottom:5px;min-height:40px;font-size:16px}
.pst-mini .pst-when{font-size:14px}
.pst-tick{position:absolute;top:16px;right:16px;width:22px;height:22px;border-radius:50%;display:grid;place-items:center;color:#fff;box-shadow:inset 0 0 0 1.5px rgba(167,190,224,.4);transition:background .45s var(--ease),box-shadow .45s var(--ease)}
.pst-mini.is-done .pst-tick{background:var(--blue);box-shadow:none}
.pst-mini:hover:not(.is-active){background:rgba(255,255,255,.05);box-shadow:inset 0 0 0 1px rgba(167,190,224,.55)}
.pst-mini.is-active{background:rgba(0,173,255,.14);box-shadow:inset 0 0 0 1.5px rgba(0,173,255,.75)}
.pst-mini.is-done{background:var(--navy);box-shadow:inset 0 0 0 1px rgba(167,190,224,.12)}
`,
  body: String.raw`
    <div class="container steps__inner">
      <div class="steps__header"><h2 class="section-title">Как стать партнёром?</h2></div>
      <div class="pst-bigcard" data-pst-panes></div>
      <div class="pst-rail" role="progressbar" aria-label="Прогресс шагов" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" data-pst-progress data-pst-rail></div>
    </div>`,
  js: String.raw`
  const nextName = (i) => STEPS[i + 1] ? STEPS[i + 1].t : null;
  const paneItem = (step, i) => '<div class="pst-pane' + (i ? '' : ' is-active') + '">' +
      '<div class="pst-chips"><span class="pst-chip">' + step.n + ' из 05</span><span class="pst-chip">' + step.e + '</span></div>' +
      '<h3>' + step.t + '</h3><p>' + step.d + '</p>' +
      '<div class="pst-bot">' +
        (nextName(i) ? '<span class="pst-next">Дальше: <b>' + nextName(i).toLowerCase() + '</b> →</span>' : '<span class="pst-next">Вы принимаете заказы</span>') +
        (step.cta ? '<a class="pst-cta" href="#form">' + step.cta + '</a>' : '') +
      '</div>' +
    '</div>';
  const railItem = (step, i) => '<button class="pst-mini' + (i ? '' : ' is-active') + '" type="button" aria-label="Шаг ' + step.n + ': ' + step.t + ', ' + step.e + '">' +
       '<span class="pst-num">' + step.n + '</span><b>' + step.t + '</b><i class="pst-when">' + step.e + '</i>' +
       '<span class="pst-tick">' + tick + '</span>' +
     '</button>';
  const setProgress = () => {};
  const setState = () => {};
`
};

const VARIANTS = [v1, v2, v2a, v2b, v2c, v3, v4];
for (const v of VARIANTS) writeFileSync(join(OUT, v.id + '.html'), page(v));

const index = `<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Сцена — 4 композиции блока</title>
<style>
:root{--navy:#1b3a6a;--blue:#00adff;--light:#f2f7fc;--dim:#5a749b}
*{box-sizing:border-box}
body{margin:0;font-family:'YS Geo',Arial,sans-serif;background:var(--light);color:var(--navy);-webkit-font-smoothing:antialiased}
.wrap{max-width:880px;margin:0 auto;padding:72px 24px}
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
  <h1>Сцена</h1>
  <p class="sub">Четыре композиции блока «Как стать партнёром?». Во всех — одна крупная плашка, раскрывающая шаг, и таймлайн из пяти станций; в трёх из четырёх таймлайн ушёл вниз и получил всю ширину, поэтому подписи станций выросли с 11px до 15px. Механика прежняя: пин, скролл ведёт по шагам, клик по станции скроллит к шагу, кнопка на первом шаге, в финале все пять с галочками. Desktop 1440.</p>
  <a class="item" href="v1.html"><span class="num">v1</span><b>Афиша</b><span>заголовок секции встаёт в ряд с плашкой, пустой угол закрыт; под ними линия пути во всю ширину с пятью станциями и крупными подписями</span></a>
  <a class="item" href="v2.html"><span class="num">v2</span><b>Полоса</b><span>плашка во всю ширину контейнера, внутри — номер и заголовок слева, описание и кнопка справа; снизу пять станций-вагонов, соединённых отрезками линии</span></a>
  <a class="item" href="v2a.html"><span class="num">v2a</span><b>Полоса · Колонка</b><span>тот же низ; голубой блок одним потоком: срок крупно слева и «01 из 05» справа → заголовок → описание → кнопка</span></a>
  <a class="item" href="v2b.html"><span class="num">v2b</span><b>Полоса · Цифра</b><span>тот же низ; слева крупная цифра шага держит край, справа поток: срок, заголовок, описание, кнопка</span></a>
  <a class="item" href="v2c.html"><span class="num">v2c</span><b>Полоса · Плашки</b><span>тот же низ; номер и срок в чипах сверху, кнопка внизу справа в паре с подписью «Дальше: …»</span></a>
  <a class="item" href="v3.html"><span class="num">v3</span><b>Обложка</b><span>всё внутри одной голубой плоскости 1164×540: заголовок секции, шаг и таймлайн; активная станция становится белой</span></a>
  <a class="item" href="v4.html"><span class="num">v4</span><b>Каретка</b><span>таймлайн во всю ширину экрана как «пол» секции, плашка едет над ним от станции к станции, у активной поднимается засечка</span></a>
  <p class="note">
    Тексты шагов, цвета и шрифт YS Geo — из сайтовых исходников (<b>site/</b>). Прошлые серии — <b>active-chip/</b>, <b>big-card/</b>, <b>timeline/</b>, <b>route/</b>.<br>
    Файлы самодостаточны: инлайн CSS/JS, шрифты в base64, без CDN; открываются и по file://, и по http. Пересобрать все четыре — <b>node _build.mjs</b> в этой папке.
  </p>
</div>
</body>
</html>
`;
writeFileSync(join(OUT, 'index.html'), index);
console.log('written:', VARIANTS.map(v => v.id + '.html').join(', '), 'index.html →', OUT);

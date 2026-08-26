// Серия «Створки» — развитие move/v4 (выбран АД 18.08 за основу).
// Общее для всех: крупная цифра шага на голубой плашке, счётчик «04/05» в шапке секции,
// срок выделен как метка (не кнопкой — на первом шаге уже есть кнопка).
// Отличаются тем, как полоса прогресса «подсоединена» к створкам.
// node _build.mjs → s1–s3.html + index.html. Шрифты — из ../timeline/v1.html.
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const fonts = readFileSync(join(here, '../timeline/v1.html'), 'utf8').split('\n').filter(l => l.startsWith('@font-face')).join('\n').trim();
if (!fonts.includes('font-weight:900')) throw new Error('не нашёл @font-face');

const BASE_CSS = String.raw`
:root{--navy:#1b3a6a;--blue:#00adff;--sky:#aad9fc;--light:#f2f7fc;--card:#eaf3fc;--mid:#3e88c5;--dim:#5a749b;--dim-dark:#a7bee0;--white:#fff;--container:1164px;--ease:cubic-bezier(.22,.61,.36,1);--spring:cubic-bezier(.34,1.4,.64,1)}
*,*::before,*::after{box-sizing:border-box}
html{scroll-behavior:smooth}
body{margin:0;color:var(--navy);background:#fff;font-family:'YS Geo',Arial,sans-serif;-webkit-font-smoothing:antialiased;overflow-x:clip}
button{border:0;background:none;cursor:pointer;font:inherit;color:inherit}
a{color:inherit;text-decoration:none}
p,h1,h2,h3{margin:0}
.container{width:min(var(--container),calc(100% - 48px));margin-inline:auto;position:relative}
.section-dark{position:relative;color:#fff;background:var(--navy);overflow:hidden}
.section-title{font-size:80px;font-weight:900;line-height:.92;letter-spacing:-.01em;color:#fff}

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

.steps{min-height:520vh;padding:0;overflow:visible}
.steps__sticky{position:sticky;top:0;min-height:100svh;height:100svh;padding:clamp(30px,5vh,58px) 0;display:grid;align-items:center;overflow:hidden}
.steps__inner{z-index:1}

/* шапка: заголовок + счётчик шага справа */
.steps__header{display:flex;align-items:flex-start;justify-content:space-between;gap:40px;margin-bottom:clamp(30px,4vw,56px)}
.pst-count{display:flex;align-items:baseline;gap:10px;padding-top:12px;font-variant-numeric:tabular-nums}
.pst-count b{font-size:44px;line-height:.8;color:var(--blue);font-weight:900;letter-spacing:-.01em}
.pst-count s{display:none}
.pst-count > span{font-size:22px;font-weight:500;line-height:1;color:#fff}
/* цифра шага — барабаном, чтобы смена не была подменой текста */
.pst-odo{display:inline-block;height:1em;line-height:1;overflow:hidden;vertical-align:top}
.pst-odo i{display:block;font-style:normal;transition:transform .55s var(--spring)}
.pst-odo i em{display:block;height:1em;line-height:1;font-style:normal;font-weight:inherit;font-size:inherit;color:inherit}

/* створки */
.pst-rail{display:flex;gap:12px;height:clamp(360px,44vh,400px)}
.pst-mini{position:relative;flex:0 0 118px;min-width:0;border-radius:22px;overflow:hidden;background:rgba(255,255,255,.045);box-shadow:inset 0 0 0 1px rgba(167,190,224,.22);transition:flex-basis .62s var(--ease),background .5s var(--ease),box-shadow .5s var(--ease)}
.pst-mini:hover{background:rgba(255,255,255,.08)}
.pst-hit{position:absolute;inset:0;z-index:2;border-radius:inherit;background:none;cursor:pointer}
.pst-hit:focus-visible{outline:3px solid rgba(0,173,255,.5);outline-offset:3px}
.pst-strip{position:absolute;inset:0;padding:22px 0;display:flex;flex-direction:column;align-items:center;justify-content:space-between;gap:14px;transition:opacity .3s var(--ease)}
.pst-num{display:block;font-size:13px;font-weight:500;line-height:1;color:var(--dim-dark);font-variant-numeric:tabular-nums;transition:color .4s,opacity .4s}
.pst-vert{flex:1;min-height:0;writing-mode:vertical-rl;transform:rotate(180deg);text-align:center;font-size:15px;font-weight:500;line-height:1.2;color:var(--dim-dark);overflow:hidden;hyphens:none;transition:color .4s,opacity .4s}
.pst-node{flex:none;width:22px;height:22px;border-radius:50%;display:grid;place-items:center;color:#fff;box-shadow:inset 0 0 0 1.5px rgba(167,190,224,.38);transition:background .45s var(--ease),box-shadow .45s var(--ease)}
.tickmark{width:11px;height:11px;opacity:0;transform:scale(.4);transition:opacity .3s var(--ease),transform .5s var(--spring)}
.is-done .tickmark{opacity:1;transform:none}

/* раскрытая створка */
.pst-full{position:absolute;inset:36px;width:572px;display:flex;flex-direction:column;overflow:hidden;opacity:0;pointer-events:none;transition:opacity .28s var(--ease)}
.pst-full h3{margin:0;font-size:42px;font-weight:800;line-height:.95;letter-spacing:-.005em;color:#fff}
.pst-full p{margin:16px 0 0;font-size:18px;line-height:1.45;color:#fff;max-width:520px}
.pst-foot{margin-top:auto;padding-top:22px;display:flex;align-items:center;gap:22px;flex-wrap:wrap}
/* срок — метка: контурная плашка, не кнопка */
.pst-term{display:inline-flex;align-items:center;gap:9px;font-size:17px;font-weight:800;line-height:1;color:#fff;white-space:nowrap}
.pst-term svg{width:18px;height:18px;flex:none;opacity:.9}
.pst-cta{position:relative;z-index:3;display:inline-flex;align-items:center;min-height:48px;padding:14px 28px;border-radius:999px;background:#fff;color:var(--navy);font-size:16px;font-weight:500;line-height:1;white-space:nowrap;transition:transform .2s var(--ease),box-shadow .2s}
.pst-cta:hover{transform:translateY(-2px);box-shadow:0 12px 26px rgba(9,40,80,.28)}
/* крупная цифра шага в правом нижнем углу плашки */
.pst-big{position:absolute;right:36px;bottom:30px;font-size:48px;font-weight:800;line-height:.95;letter-spacing:-.005em;color:#fff;font-variant-numeric:tabular-nums;opacity:0;transform:translateY(10px);transition:opacity .35s var(--ease),transform .5s var(--ease);pointer-events:none}
.pst-mini.is-active{flex-basis:644px;background:var(--blue);box-shadow:0 24px 70px rgba(0,90,140,.35)}
.pst-mini.is-active .pst-strip{opacity:0}
.pst-mini.is-active .pst-full{opacity:1;pointer-events:auto;transition-delay:.24s}
.pst-mini.is-active .pst-big{opacity:1;transform:none;transition-delay:.3s}
/* последняя створка в финале: раскрыта, голубая, с галочкой в углу */
.pst-mini.is-done.is-active{background:var(--blue);box-shadow:0 24px 70px rgba(0,90,140,.35)}
.pst-mini.is-done.is-active .pst-strip{opacity:0}
.pst-tickcorner{position:absolute;top:22px;right:24px;width:26px;height:26px;border-radius:50%;background:#fff;color:var(--blue);display:grid;place-items:center;opacity:0;transform:scale(.6);transition:opacity .35s var(--ease),transform .5s var(--spring)}
.pst-tickcorner .tickmark{opacity:1;transform:none;width:13px;height:13px}
.pst-mini.is-done.is-active .pst-tickcorner{opacity:1;transform:none;transition-delay:.25s}
.pst-mini.is-done{background:rgba(9,32,66,.5);box-shadow:inset 0 0 0 1px rgba(167,190,224,.12)}
.pst-mini.is-done .pst-vert{opacity:.5}
.pst-mini.is-done .pst-num{opacity:.45}
.pst-mini.is-done .pst-node{background:var(--blue);box-shadow:none}
.nb{white-space:nowrap}
.pst-inner{display:none}

.bumper{min-height:72vh;display:grid;place-content:center;text-align:center;gap:14px;padding:40px;background:var(--light)}
.bumper h1{font-size:44px;font-weight:900;line-height:1;margin:0;letter-spacing:-.01em}
.bumper p{margin:0;color:var(--dim);font-size:18px;max-width:880px}
.bumper a{color:var(--blue);font-weight:500}
@media (prefers-reduced-motion:reduce){html{scroll-behavior:auto}.ambient-glow{animation:none!important}*,*::before,*::after{transition-duration:.01ms!important}}
`;

const TICK = `<svg class="tickmark" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M2 6.2 4.8 9 10 3.4" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const CLOCK = `<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><circle cx="8" cy="8" r="6.25" stroke="currentColor" stroke-width="1.5"/><path d="M8 4.6V8l2.4 1.6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

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
  const tick = '${TICK}', clock = '${CLOCK}';
  const clamp01 = (v) => Math.max(0, Math.min(1, v));
  const rail = stepsSection.querySelector('[data-pst-rail]');
  const progressBox = stepsSection.querySelector('[data-pst-progress]');
  const odo = stepsSection.querySelector('[data-pst-odo]');

  const railItem = (step, i) => '<div class="pst-mini' + (i ? '' : ' is-active') + '">' +
      '<button class="pst-hit" type="button" aria-label="Шаг ' + step.n + ': ' + step.t + ', ' + step.e + '"></button>' +
      '<span class="pst-strip"><span class="pst-num">' + step.n + '</span><span class="pst-vert">' + step.t + '</span><span class="pst-node">' + tick + '</span></span>' +
      '<div class="pst-full"><h3>' + step.t + '</h3><p>' + step.d + '</p>' +
        '<div class="pst-foot"><span class="pst-term">' + clock + step.e + '</span>' + (step.cta ? '<a class="pst-cta" href="#form">' + step.cta + '</a>' : '') + '</div>' +
      '</div>' +
      '<span class="pst-big" aria-hidden="true">' + step.n + '</span>' +
      '<span class="pst-inner" aria-hidden="true"><i></i></span>' +
      '<span class="pst-tickcorner" aria-hidden="true">' + tick + '</span>' +
    '</div>';
${variantJs}
  STEPS.forEach((step, i) => rail.insertAdjacentHTML('beforeend', railItem(step, i)));
  const miniNodes = [...rail.querySelectorAll('.pst-mini')];
  const measure = () => { if (typeof onMeasure === 'function') onMeasure(miniNodes); };

  let stepState = '';
  const stepOnScroll = () => {
    const travel = stepsSection.offsetHeight - innerHeight;
    if (travel <= 0) return;
    const progress = clamp01(-stepsSection.getBoundingClientRect().top / travel);
    const raw = progress * STEPS.length;
    const index = Math.min(STEPS.length - 1, Math.floor(raw));
    const local = clamp01(raw - index);
    setProgress(progress, index, local, miniNodes);
    progressBox?.setAttribute('aria-valuenow', String(Math.round(progress * 100)));
    const allDone = progress >= 0.95;
    const state = index + (allDone ? ':done' : '');
    if (state === stepState) return;
    stepState = state;
    const last = STEPS.length - 1;
    miniNodes.forEach((node, i) => {
      // в финале последняя створка остаётся раскрытой — путь пройден, но блок не схлопывается
      const active = allDone ? i === last : i === index;
      node.classList.toggle('is-active', active);
      node.classList.toggle('is-done', allDone || i < index);
      node.setAttribute('aria-current', active ? 'step' : 'false');
    });
    rail.classList.toggle('is-done', allDone);
    if (odo) odo.style.transform = 'translateY(-' + index + 'em)';
    setState(index, allDone, miniNodes);
  };
  miniNodes.forEach((node, i) => {
    node.querySelector('.pst-hit').addEventListener('click', () => {
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
  // после каждой анимации ширины створок — пересчитать геометрию линии
  rail.addEventListener('transitionend', (e) => { if (e.propertyName === 'flex-basis') { measure(); stepState = ''; stepOnScroll(); } });
  measure(); stepOnScroll();
})();
`;

const HEADER = String.raw`
      <div class="steps__header">
        <h2 class="section-title">Как стать<br>партнёром?</h2>
        <p class="pst-count" aria-live="polite"><b><span class="pst-odo"><i data-pst-odo><em>01</em><em>02</em><em>03</em><em>04</em><em>05</em></i></span></b><span>из 05</span></p>
      </div>`;

/* ======================================================================
   s1 «Нить сквозь узлы» — линия проходит через узлы створок
   ====================================================================== */
const s1 = {
  id: 's1', title: 'Нить сквозь узлы',
  desc: 'Полоса — не отдельная линейка над створками, а нить, проходящая через их узлы: она лежит на высоте кружков внизу створок и заливается голубым от узла к узлу. Голубой конец нити всегда доходит ровно до узла активной створки и продолжает ползти внутрь неё вместе со скроллом. Так линия и створки — одна конструкция.',
  short: 'полоса лежит на высоте узлов створок и заливается от узла к узлу; голубой конец всегда упирается в активную',
  css: String.raw`
.pst-rail{position:relative}
.pst-thread{position:absolute;left:0;right:0;bottom:33px;height:3px;border-radius:3px;background:rgba(167,190,224,.2);pointer-events:none;z-index:0}
.pst-thread i{position:absolute;left:0;top:0;height:100%;width:0;border-radius:3px;background:var(--blue);box-shadow:0 0 12px rgba(0,173,255,.55)}
.pst-mini{z-index:1}
.pst-strip{padding-bottom:22px}
.pst-node{background:var(--navy)}
.pst-mini.is-active .pst-node{opacity:0}
/* продолжение нити внутри активной плашки: от левого края до цифры */
.pst-inner{display:block;position:absolute;left:0;right:0;bottom:33px;height:3px;background:rgba(255,255,255,.18);opacity:0;transition:opacity .3s var(--ease)}
.pst-inner i{position:absolute;left:0;top:0;height:100%;width:calc(var(--local,0) * 100%);background:#fff}
.pst-mini.is-active .pst-inner{opacity:1;transition-delay:.3s}
/* цифра и метка срока приподняты над внутренней нитью */
.pst-big{bottom:48px}
.pst-full{bottom:56px}
`,
  body: String.raw`
    <div class="container steps__inner">${HEADER}
      <div class="pst-rail" role="progressbar" aria-label="Прогресс шагов" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" data-pst-progress data-pst-rail><i class="pst-thread" aria-hidden="true"><i data-pst-fill></i></i></div>
    </div>`,
  js: String.raw`
  const fill = stepsSection.querySelector('[data-pst-fill]');
  let nodesX = [];
  const onMeasure = (nodes) => {
    const r0 = rail.getBoundingClientRect();
    // цель нити для каждой створки: центр её узла; для активной — её левый край (дальше нить идёт внутри плашки)
    nodesX = nodes.map(n => { const r = n.getBoundingClientRect(); const nd = n.querySelector('.pst-node').getBoundingClientRect(); return n.classList.contains('is-active') ? r.left - r0.left : nd.left + nd.width / 2 - r0.left; });
  };
  const setProgress = (p, index, local, nodes) => {
    if (!nodesX.length) return;
    fill.style.width = (p >= .95 ? rail.clientWidth : Math.max(0, nodesX[index])) + 'px';
    nodes.forEach((n, i) => n.style.setProperty('--local', i === index ? local.toFixed(3) : '0'));
  };
  const setState = () => {};
`
};

/* ======================================================================
   s2 «Полоса-подложка» — прогресс лежит под створками как их пол
   ====================================================================== */
const s2 = {
  id: 's2', title: 'Пол',
  desc: 'Полоса стала «полом»: широкая (6px) линия сразу под створками, на которую они опираются. Она заливается по ширине створок: пройденные створки стоят на голубом, будущие — на сером; под активной заливка ползёт вместе со скроллом внутри шага. Полоса и створки читаются одним объектом — стеллаж и его полка.',
  short: 'полоса 6px под створками как «пол»; заливка идёт по ширине створок, под активной ползёт со скроллом',
  css: String.raw`
.pst-rail{position:relative;padding-bottom:22px}
.pst-floor{position:absolute;left:0;right:0;bottom:0;height:6px;border-radius:6px;background:rgba(167,190,224,.18);overflow:hidden;pointer-events:none}
.pst-floor i{position:absolute;left:0;top:0;height:100%;width:0;border-radius:6px;background:var(--blue)}
/* засечка от активной створки к полу */
.pst-mini::after{content:'';position:absolute;left:50%;bottom:-22px;width:2px;height:22px;margin-left:-1px;background:var(--blue);opacity:0;transform:scaleY(0);transform-origin:50% 0;transition:opacity .3s var(--ease),transform .45s var(--ease)}
.pst-mini.is-active::after{opacity:1;transform:none;transition-delay:.3s}
.pst-mini{overflow:visible}
.pst-mini > *{border-radius:22px}
.pst-mini .pst-strip,.pst-mini .pst-full,.pst-mini .pst-big{border-radius:0}
.pst-clip{position:absolute;inset:0;border-radius:22px;overflow:hidden}
`,
  body: String.raw`
    <div class="container steps__inner">${HEADER}
      <div class="pst-rail" role="progressbar" aria-label="Прогресс шагов" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" data-pst-progress data-pst-rail><i class="pst-floor" aria-hidden="true"><i data-pst-fill></i></i></div>
    </div>`,
  js: String.raw`
  const fill = stepsSection.querySelector('[data-pst-fill]');
  let edges = [];
  const onMeasure = (nodes) => {
    const r0 = rail.getBoundingClientRect().left;
    edges = nodes.map(n => { const r = n.getBoundingClientRect(); return [r.left - r0, r.right - r0]; });
  };
  const setProgress = (p, index, local, nodes) => {
    if (!edges.length) return;
    const [l, r] = edges[index];
    fill.style.width = (p >= .95 ? rail.clientWidth : Math.max(0, l + (r - l) * local)) + 'px';
  };
  const setState = () => {};
`
};

/* ======================================================================
   s3 «Полоса едет вместе с активной» — линия над створками, но её голубая часть
   привязана к активной створке и растягивается вместе с ней
   ====================================================================== */
const s3 = {
  id: 's3', title: 'Указатель',
  desc: 'Полоса остаётся над створками (как в исходнике), но становится толще (4px) и перестаёт жить отдельно: голубой отрезок — это указатель, который стоит ровно над активной створкой и растягивается вместе с ней той же анимацией. Пройденная часть — синяя приглушённая, будущая — серая. Створка раскрылась — над ней раскрылся и указатель.',
  short: 'полоса 4px над створками; голубой отрезок стоит ровно над активной и растягивается вместе с ней той же анимацией',
  css: String.raw`
.pst-bar{position:relative;height:4px;margin-bottom:22px;border-radius:4px;background:rgba(167,190,224,.18);overflow:hidden}
.pst-bar i{position:absolute;top:0;height:100%;border-radius:4px;transition:left .62s var(--ease),width .62s var(--ease)}
.pst-bar .pst-done{left:0;background:rgba(0,173,255,.38)}
.pst-bar .pst-here{background:var(--blue);box-shadow:0 0 12px rgba(0,173,255,.55)}
`,
  body: String.raw`
    <div class="container steps__inner">${HEADER}
      <div class="pst-bar" role="progressbar" aria-label="Прогресс шагов" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" data-pst-progress><i class="pst-done" data-pst-done></i><i class="pst-here" data-pst-here></i></div>
      <div class="pst-rail" data-pst-rail></div>
    </div>`,
  js: String.raw`
  const doneEl = stepsSection.querySelector('[data-pst-done]');
  const hereEl = stepsSection.querySelector('[data-pst-here]');
  // целевые ширины считаем из сетки, а не измеряем — тогда линия едет той же анимацией и синхронно
  const W = 1164, WA = 644, WS = 118, G = 12;
  const setProgress = () => {};
  const setState = (index, allDone) => {
    if (allDone) { const w = (W - 4 * G) / 5; doneEl.style.width = W + 'px'; hereEl.style.left = (4 * (w + G)) + 'px'; hereEl.style.width = w + 'px'; return; }
    const left = index * (WS + G);
    doneEl.style.width = left + 'px';
    hereEl.style.left = left + 'px'; hereEl.style.width = WA + 'px';
  };
  const onMeasure = () => {};
`
};


const fin = {
  id: 'final', title: 'Створки · финал',
  desc: 'Собрано на сайтовых токенах: счётчик «01 из 05» как крупная цифра зоны в блоке даркстора (44px/Black/голубой), крупная цифра на плашке и заголовок створки — 42–48px/Heavy как заголовки карточек «Как устроен бизнес», срок — иконка часов + 17px/Heavy без плашки, описание 18px. Полоска прогресса — как в исходных «Створках».',
  short: 'финал: полоска как раньше, счётчик «01 из 05» голубым, цифра на плашке, срок — часы + жирный текст; все кегли из сайта',
  css: String.raw`
.pst-bar{height:2px;margin-bottom:22px;border-radius:2px;background:rgba(167,190,224,.2);overflow:hidden}
.pst-bar i{display:block;height:100%;width:calc(var(--p,0) * 100%);border-radius:2px;background:var(--blue)}
`,
  body: String.raw`
    <div class="container steps__inner">${HEADER}
      <div class="pst-bar" role="progressbar" aria-label="Прогресс шагов" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" data-pst-progress><i data-pst-bar></i></div>
      <div class="pst-rail" data-pst-rail></div>
    </div>`,
  js: String.raw`
  const bar = stepsSection.querySelector('[data-pst-bar]');
  // заливка привязана к шагам: конец N-го шага = 100%; на излёте (allDone) — ровно 100%
  const setProgress = (p, index, local) => { bar.style.setProperty('--p', (p >= .95 ? 1 : (index + local) / STEPS.length).toFixed(4)); };
  const setState = () => {};
  const onMeasure = () => {};
`
};

const VARIANTS = [fin, s1, s2, s3];

const page = (v) => `<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${v.id} — ${v.title}</title>
<style>
${fonts}
${BASE_CSS}
/* ===== ${v.id}: ${v.title} ===== */
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

VARIANTS.forEach(v => writeFileSync(join(here, v.id + '.html'), page(v)));

const item = (v) => `  <a class="item" href="${v.id}.html"><span class="num">${v.id}</span><b>${v.title}</b><span>${v.short}</span></a>`;
writeFileSync(join(here, 'index.html'), `<!doctype html>
<html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Створки — 3 варианта полосы</title>
<style>
:root{--navy:#1b3a6a;--blue:#00adff;--light:#f2f7fc;--dim:#5a749b}
*{box-sizing:border-box}
body{margin:0;font-family:'YS Geo',Arial,sans-serif;background:var(--light);color:var(--navy);-webkit-font-smoothing:antialiased}
.wrap{max-width:880px;margin:0 auto;padding:72px 24px}
h1{font-size:52px;font-weight:900;line-height:.96;letter-spacing:-.01em;margin:0 0 12px}
.sub{color:var(--dim);font-size:18px;margin:0 0 32px;line-height:1.45}
a.item{display:flex;align-items:baseline;gap:18px;padding:22px 26px;margin-bottom:14px;border-radius:20px;background:#fff;box-shadow:0 8px 24px rgba(27,58,106,.08);text-decoration:none;color:var(--navy);transition:transform .2s,box-shadow .2s}
a.item:hover{transform:translateY(-2px);box-shadow:0 14px 34px rgba(27,58,106,.14)}
a.item b{font-size:20px;font-weight:800;white-space:nowrap}
a.item span{color:var(--dim);font-size:16px;line-height:1.45}
.num{color:var(--blue);font-weight:800;font-size:20px}
.note{margin-top:40px;color:var(--dim);font-size:14px;line-height:1.6}
.note b{color:var(--navy)}
</style></head><body><div class="wrap">
<h1>Створки</h1>
<p class="sub"><b>final</b> — итоговая сборка по замечаниям 18.08 (полоска как раньше, счётчик «01 из 05», срок без плашки, все кегли из сайта). Ниже — три пробы полосы, из которых выбирали. Развитие <b>move/v4</b> — выбран за основу 18.08. Во всех трёх: крупная цифра шага в правом нижнем углу голубой плашки, счётчик «04/05» в шапке секции (цифра крутится барабаном), срок выделен контурной меткой с часами — не кнопкой, потому что на первом шаге кнопка уже есть. Отличаются тем, как полоса прогресса «подсоединена» к створкам.</p>
${VARIANTS.map(item).join('\n')}
<p class="note">Пересобрать — <b>node _build.mjs</b> в этой папке.</p>
</div></body></html>
`);
console.log('written:', VARIANTS.map(v => v.id + '.html').join(', '), '+ index.html');

// Витрина блока «Программа» (вариант 03 «карточки на светлом», выбран 17.09.2026).
//   node blocks/schedule-variants.mjs        → переписывает зоны в blocks/schedule-variants.html:
//                                              шапку, стили вариантов, разметку вариантов и их скрипт.
//   node blocks/build.mjs --in blocks/schedule-variants.html blocks/schedule-variants-preview.html
// Галерея рефов (разметка, JSON #refs-data, просмотрщик) и оболочка витрины в html написаны руками и не трогаются.
// Прежние 15 раскладок — archive/2026-09-17-schedule-15-variants/.
// Исполнения: 03a обычная, 03b длинная с кнопкой, 03c1–c5 компактные для 16–18 докладов (после того как
// двухколоночный компакт «слипся»: строки в плашке, две колонки без карточек, табы, сетка спикеров, аккордеон).
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const FILE = join(dirname(fileURLToPath(import.meta.url)), 'schedule-variants.html');
let page = readFileSync(FILE, 'utf8');

/* ---------- контент: съезд 2025, портреты events/assets ---------- */
const SPK = {
  petrov: ['Вадим Петров', 'CEO Яндекс Лавки'],
  katanov: ['Александр Катанов', 'CFO Яндекс Лавки'],
  tolstoy: ['Никита Толстой', 'CPO B2C &amp; Head of&nbsp;Product Design'],
  alontseva: ['Анастасия Алонцева', 'Руководитель группы исследований Лавки'],
  starostina: ['Олеся Старостина', 'Marketing Researcher'],
  burdin: ['Николай Бурдин', 'Руководитель управления модулями «Есть Горячее» и&nbsp;кофе'],
  shvindt: ['Мария Швиндт', 'Руководитель сектора службы развития франшизы'],
};
// описания — рыба, на витрине это подписано
const DESC = {
  petrov: 'Итоги года, новые форматы, планы на&nbsp;2027 и&nbsp;роль партнёров в&nbsp;них. Вопросы из&nbsp;зала&nbsp;— 20&nbsp;минут',
  katanov: 'Где партнёры теряют деньги и&nbsp;как это видно в&nbsp;данных: пять метрик, за&nbsp;которыми стоит следить каждую неделю',
  tolstoy: 'Как Лавка встроена в&nbsp;Go, Плюс и&nbsp;Маркет и&nbsp;что это даёт партнёру: трафик, подписчики, совместные акции',
  alontseva: 'Исследования 2026: кто заказывает, зачем и&nbsp;что мешает заказывать чаще',
  burdin: 'Как устроен модуль, где он&nbsp;уже открыт, экономика и&nbsp;сроки запуска для партнёра',
  shvindt: 'Цифры сети за&nbsp;год, новые регионы и&nbsp;что изменится в&nbsp;условиях для партнёров',
};
// доклады: [тема, спикеры[], ключ описания]
const TALKS = [
  ['Стратегия Яндекс Лавки', ['petrov'], 'petrov'],
  ['Качество определяет прибыльность', ['katanov'], 'katanov'],
  ['Продукт Лавки как часть экосистемы Яндекса', ['tolstoy'], 'tolstoy'],
  ['Что мы&nbsp;знаем о&nbsp;пользователях Лавки', ['alontseva', 'starostina'], 'alontseva'],
  ['Модули «Есть Горячее»: дарк китчены с&nbsp;доставкой от&nbsp;15&nbsp;минут', ['burdin'], 'burdin'],
  ['Успехи 2025 года и&nbsp;планы развития на&nbsp;2026-й', ['shvindt'], 'shvindt'],
];
const BREAK = (time, name) => [time, name];
const at = (h, m) => `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
// n докладов подряд с шагом step минут, начиная с h:m; сами доклады берутся по кругу из TALKS начиная с from
const run = (h, m, n, step, from = 0) => Array.from({ length: n }, (_, i) => {
  const t = h * 60 + m + i * step;
  return [at(Math.floor(t / 60), t % 60), ...TALKS[(from + i) % TALKS.length]];
});

// обычная: 6 докладов, три перерыва
const MAIN = [BREAK('09:30', 'Регистрация и&nbsp;кофе'), ...run(10, 0, 2, 40), BREAK('11:20', 'Кофе-брейк'), ...run(11, 40, 2, 40, 2), BREAK('13:00', 'Обед'), ...run(14, 0, 2, 40, 4)];
// длинная: 18 докладов по 30 минут тремя частями дня — программа съезда повторена трижды, чтобы набрать объём
const PARTS = [
  { name: 'Утро', range: '10:00–13:00', brk: BREAK('09:30', 'Регистрация и&nbsp;кофе'), brkNote: 'регистрация и&nbsp;кофе с&nbsp;09:30', talks: run(10, 0, 6, 30) },
  { name: 'День', range: '14:00–17:00', brk: BREAK('13:00', 'Обед'), brkNote: 'обед 13:00–14:00', talks: run(14, 0, 6, 30) },
  { name: 'Вечер', range: '17:20–20:20', brk: BREAK('17:00', 'Кофе-брейк'), brkNote: 'кофе-брейк 17:00–17:20', talks: run(17, 20, 6, 30) },
];
const LONG = PARTS.flatMap(p => [p.brk, ...p.talks]);
// панели переключателя (опция 03a) — короткая рыба
const SECOND = [BREAK('10:00', 'Регистрация и&nbsp;кофе'), ...run(10, 30, 2, 40, 1)];
const THIRD = [BREAK('11:00', 'Регистрация и&nbsp;кофе'), ...run(11, 30, 2, 40, 3)];

// стрелки «рандомно»: у первого, третьего и шестого доклада (в длинных программах — у каждого их повтора)
const MORE = ['petrov', 'tolstoy', 'shvindt'];

/* ---------- кирпичи разметки ---------- */
const person = (k, size = '') => `<div class="person person--sq${size}"><span class="avatar"><img src="../events/assets/spk-${k}.webp" alt=""></span><div><b>${SPK[k][0]}</b><small>${SPK[k][1]}</small></div></div>`;
const persons = (ks, size = '') => `<div class="persons">${ks.map(k => person(k, size)).join('')}</div>`;
const faces = ks => `<div class="faces">${ks.map(k => `<span class="avatar"><img src="../events/assets/spk-${k}.webp" alt=""></span>`).join('')}</div>`;
const desc = k => `<div class="schedule__desc"><div><p>${DESC[k]}</p></div></div>`;
const chev = (open = false) => `<button class="schedule__chev" type="button" aria-label="Подробнее" aria-expanded="${open}"></button>`;
const attrs = (isBreak, hasMore) => ` data-row${isBreak ? ' data-break' : ''}${hasMore ? ' data-more' : ''}`;
const parse = ([time, topic, ks, d], more) => ({ time, topic, ks, d, isBreak: !ks, hasMore: !!ks && !!d && more.includes(d) });
const note = (id, n, title, text, opts = '') => `<div class="note" id="${id}"><b>${n}</b><strong>${title}</strong><span>${text}</span>${opts}</div>`;
const section = (id, body, extra = '', lead = '') => `<section class="section section--light">
  <div class="container" id="${id}"${extra}>
    <div class="section__head"><h2 class="t-h1">Программа</h2>${lead ? `<p class="t-lead">${lead}</p>` : ''}</div>
${body}
  </div>
</section>`;
const LEAD18 = '18&nbsp;докладов, один зал';

// 03a/03b/03c3: карточки
const cardRow = (r, more) => {
  const x = parse(r, more);
  return `      <article class="schedule-cards__item"${attrs(x.isBreak, x.hasMore)}><div class="schedule-cards__time">${x.time}</div><div class="schedule-cards__body"><div class="schedule-cards__topic">${x.topic}</div>${x.hasMore ? desc(x.d) : ''}${x.isBreak ? '' : persons(x.ks)}</div>${x.hasMore ? chev() : ''}</article>`;
};
const cards = (rows, more, extra = '') => `    <div class="schedule-cards"${extra}>\n${rows.map(r => cardRow(r, more)).join('\n')}\n    </div>`;

// 03c1: строки в одной плашке (и внутри аккордеона c5)
const lineRow = (r, more) => {
  const x = parse(r, more);
  return `      <div class="schedule-rows__row"${attrs(x.isBreak, x.hasMore)}><div class="schedule-rows__time">${x.time}</div><div class="schedule-rows__main"><div class="schedule-rows__topic">${x.topic}</div>${x.hasMore ? desc(x.d) : ''}</div><div class="schedule-rows__who">${x.isBreak ? '' : persons(x.ks, ' person--s')}</div>${x.hasMore ? chev() : ''}</div>`;
};
const lines = (rows, more, cls = '') => `    <div class="schedule-rows${cls}">\n${rows.map(r => lineRow(r, more)).join('\n')}\n    </div>`;

// 03c2: части дня плашками, внутри две колонки без карточек
const groupCell = (r, more) => {
  const x = parse(r, more);
  return `        <div class="schedule-group__cell"${attrs(false, x.hasMore)}><div><div class="schedule-group__time">${x.time}</div><div class="schedule-group__topic">${x.topic}</div>${x.hasMore ? desc(x.d) : ''}${persons(x.ks, ' person--s')}</div>${x.hasMore ? chev() : ''}</div>`;
};
const groups = more => `    <div class="schedule-groups">
${PARTS.map(p => `      <section class="schedule-group">
        <div class="schedule-group__head"><b>${p.name}</b><span>${p.range}, ${p.brkNote}</span></div>
        <div class="schedule-group__grid">
${p.talks.map(t => groupCell(t, more)).join('\n')}
        </div>
      </section>`).join('\n')}
    </div>`;

// 03c4: сетка спикеров: доклад = карточка
const gridCard = (r, more) => {
  const x = parse(r, more);
  if (x.isBreak) return `      <div class="schedule-grid__break"><b>${x.time}</b><span>${x.topic}</span></div>`;
  return `      <article class="schedule-grid__card"${attrs(false, x.hasMore)}><div class="schedule-grid__top"><span class="schedule-grid__time">${x.time}</span>${x.hasMore ? chev() : ''}</div>${persons(x.ks, ' person--s')}<div class="schedule-grid__topic">${x.topic}</div>${x.hasMore ? desc(x.d) : ''}</article>`;
};
const grid = more => `    <div class="schedule-grid">\n${LONG.map(r => gridCard(r, more)).join('\n')}\n    </div>`;

// 03c5: аккордеон частей дня
const parts = more => `    <div class="schedule-parts">
${PARTS.map((p, i) => `      <section class="schedule-parts__part${i ? '' : ' is-open'}" data-part>
        <div class="schedule-parts__head" data-part-head><div class="schedule-parts__time">${p.range}</div><div class="schedule-parts__title"><b>${p.name}</b><small>${p.talks.length} докладов, ${p.brkNote}</small></div>${faces([...new Set(p.talks.flatMap(t => t[2]))])}${chev(!i)}</div>
        <div class="schedule-parts__body"><div>
${lines(p.talks, more, ' schedule-rows--flat')}
        </div></div>
      </section>`).join('\n')}
    </div>`;

/* ---------- разметка витрины ---------- */
const HALLS = [['h1', 'Главный зал'], ['h2', 'Малый зал'], ['h3', 'Лекторий']];
const tabs = (items, cls = '', extra = '') => `    <div class="tabs schedule__switch${cls}"${extra}>${items.map(([id, t], i) => `<button class="tab${i ? '' : ' is-on'}" type="button" data-tab="${id}">${t}</button>`).join('')}</div>`;

const markup = `<!-- ======================= варианты ======================= -->
${note('v03a', '03a', 'Обычная программа', 'До&nbsp;восьми докладов. Время и&nbsp;тема одним кеглем, спикеры под&nbsp;темой в&nbsp;скруглённых квадратах, перерывы не&nbsp;выделяются. Стрелка&nbsp;— у&nbsp;докладов с&nbsp;описанием: серый кружок, голубой на&nbsp;наведении и&nbsp;в&nbsp;раскрытом виде. Описания&nbsp;— рыба. Опция: переключатель залов, дат или городов сверху', `<label class="opt"><input type="checkbox" data-opt="switch" data-for="b03a">Переключатель</label>`)}
${section('b03a', [tabs(HALLS, '', ' data-switch hidden'), cards(MAIN, MORE, ' data-tab-panel="h1"'), cards(SECOND, MORE, ' data-tab-panel="h2" hidden'), cards(THIRD, MORE, ' data-tab-panel="h3" hidden')].join('\n'), ' data-tabs')}

${note('v03b', '03b', 'Длинная с&nbsp;кнопкой', 'Когда докладов больше десяти: видны первые шесть, остальные&nbsp;— по&nbsp;кнопке «Показать всю программу». Здесь 18&nbsp;докладов по&nbsp;30&nbsp;минут: программа съезда повторена трижды, чтобы набрать объём')}
${section('b03b', `    <div class="schedule-cards__wrap">\n${cards(LONG, MORE)}\n      <div class="schedule-cards__fade" data-more-fade></div>\n    </div>\n    <div class="schedule-cards__action"><button class="button button--secondary" type="button" data-more-toggle>Показать всю программу</button></div>`, ' data-schedule-more="7"', LEAD18)}

${note('v03c1', '03c1', 'Строки в&nbsp;одной плашке', 'Компакт для 16–18 докладов. Вся программа&nbsp;— одна белая плашка, строки через тонкие линии: время, тема, спикер справа. Фото 44px. Стрелка и&nbsp;описание у&nbsp;каждого доклада с&nbsp;описанием, описание раскрывается под&nbsp;темой')}
${section('b03c1', lines(LONG, MORE), '', LEAD18)}

${note('v03c2', '03c2', 'Две колонки без карточек', 'Части дня&nbsp;— три плашки с&nbsp;подписями, перерывы ушли в&nbsp;подписи. Внутри по&nbsp;две ячейки в&nbsp;ряд через линии, без вложенных карточек и&nbsp;теней. Стрелка справа в&nbsp;каждой ячейке')}
${section('b03c2', groups(MORE), '', LEAD18)}

${note('v03c3', '03c3', 'Табы по&nbsp;частям дня', 'Не&nbsp;уменьшать, а&nbsp;разбить: табы кита сверху, в&nbsp;каждом&nbsp;— обычная программа 03a на&nbsp;шесть докладов. Тот&nbsp;же приём годится для залов и&nbsp;дат')}
${section('b03c3', [tabs(PARTS.map((p, i) => [`p${i}`, `${p.name}, ${p.range}`])), ...PARTS.map((p, i) => cards([p.brk, ...p.talks], MORE, ` data-tab-panel="p${i}"${i ? ' hidden' : ''}`))].join('\n'), ' data-tabs', LEAD18)}

${note('v03c4', '03c4', 'Сетка спикеров', 'Доклад&nbsp;= карточка со&nbsp;спикером: время, фото, имя, тема. Три в&nbsp;ряд, перерывы&nbsp;— подписями между рядами. Ближе всего к&nbsp;блоку спикеров кита. Стрелка в&nbsp;правом верхнем углу карточки')}
${section('b03c4', grid(MORE), '', LEAD18)}

${note('v03c5', '03c5', 'Аккордеон частей дня', 'Три раскрывающиеся плашки: утро, день, вечер&nbsp;— с&nbsp;временем, числом докладов и&nbsp;лицами спикеров. Открыта одна, внутри строки как в&nbsp;c1. По&nbsp;умолчанию на&nbsp;экране 6 докладов вместо 18')}
${section('b03c5', parts(MORE), '', LEAD18)}

`;

/* ---------- шапка витрины ---------- */
const header = `<header class="section--dark intro">
  <div class="container">
    <p class="t-caption" style="margin-bottom:24px">Дизайн-система лендингов, блок «Программа», 17.09.2026</p>
    <h1 class="t-h1">Программа: <span class="accent">карточки на&nbsp;светлом</span></h1>
    <p class="t-lead intro__lead">Из&nbsp;пятнадцати раскладок выбрана третья. Ниже обычная программа, длинная с&nbsp;кнопкой «Показать всю» и&nbsp;пять компактных исполнений для 16–18 докладов. Контент&nbsp;— съезд 2025, время и&nbsp;описания&nbsp;— рыба. Прежние 15 вариантов лежат в&nbsp;archive/2026-09-17-schedule-15-variants</p>
    <nav class="intro__nav" aria-label="Варианты">
      <a href="#v03a"><b>03a</b><span>Обычная программа<small>до восьми докладов, стрелки у&nbsp;части</small></span></a>
      <a href="#v03b"><b>03b</b><span>Длинная с&nbsp;кнопкой<small>«Показать всю программу»</small></span></a>
      <a href="#v03c1"><b>c1</b><span>Строки в&nbsp;одной плашке<small>компакт: время, тема, спикер справа</small></span></a>
      <a href="#v03c2"><b>c2</b><span>Две колонки без карточек<small>компакт: части дня плашками</small></span></a>
      <a href="#v03c3"><b>c3</b><span>Табы по&nbsp;частям дня<small>не уменьшать, а&nbsp;разбить</small></span></a>
      <a href="#v03c4"><b>c4</b><span>Сетка спикеров<small>компакт: доклад = карточка</small></span></a>
      <a href="#v03c5"><b>c5</b><span>Аккордеон частей дня<small>компакт: открыта одна часть</small></span></a>
    </nav>
  </div>
</header>
`;

/* ---------- стили вариантов ---------- */
const CHEV_SVG = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='none'%3E%3Cpath d='M5 8l5 5 5-5' stroke='%23000' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`;
const css = `/* ---------- общее для вариантов ---------- */
.person{display:flex;align-items:center;gap:14px;min-width:0}
.person b{display:block;font-size:var(--fs-body);font-weight:var(--fw-heavy);line-height:1.15}
.person small{display:block;margin-top:4px;font-size:var(--fs-small);line-height:1.3;color:var(--text-secondary)}
.persons{display:flex;flex-wrap:wrap;gap:14px 32px}
/* спикер в скруглённом квадрате: 88px, компактный --s 44px */
.person--sq{gap:18px}
.person--sq .avatar{width:88px;height:88px;border-radius:var(--radius-m)}
.person--sq .avatar img,.faces .avatar img{transform:scale(1.12);transform-origin:50% 32%}
.person--sq.person--s{gap:12px}
.person--sq.person--s .avatar{width:44px;height:44px;border-radius:var(--radius-s)}
.person--sq.person--s b{font-size:var(--fs-body-s)}
.person--sq.person--s small{margin-top:2px;font-size:var(--fs-caption)}
/* лица стопкой */
.faces{display:flex}
.faces .avatar{width:36px;height:36px;margin-left:-8px;border-radius:10px;box-shadow:0 0 0 2px var(--white)}
.faces .avatar:first-child{margin-left:0}
/* стрелка-раскрытие: серый кружок, голубой на наведении и в раскрытом виде; шеврон как у выпадающих списков кита */
.schedule__chev{display:block;width:28px;height:28px;margin-top:2px;border-radius:50%;background:var(--card);cursor:pointer;transition:transform var(--dur-hover) var(--ease),background-color var(--dur-hover)}
.schedule__chev::before{content:'';display:block;width:100%;height:100%;background:var(--navy);-webkit-mask:${CHEV_SVG} center/16px no-repeat;mask:${CHEV_SVG} center/16px no-repeat;transition:background-color var(--dur-hover)}
.schedule__chev:focus-visible{outline:2px solid var(--blue);outline-offset:3px}
[data-more],[data-part-head]{cursor:pointer}
[data-more]:hover .schedule__chev,[data-part-head]:hover .schedule__chev,.schedule__chev[aria-expanded=true]{background-color:var(--blue)}
[data-more]:hover .schedule__chev::before,[data-part-head]:hover .schedule__chev::before,.schedule__chev[aria-expanded=true]::before{background-color:var(--white)}
.schedule__chev[aria-expanded=true]{transform:rotate(180deg)}
.schedule__desc{display:grid;grid-template-rows:0fr;transition:grid-template-rows var(--dur-reveal) var(--ease)}
.schedule__desc>div{overflow:hidden;min-height:0}
.schedule__desc p{margin:16px 0 0;max-width:680px;color:var(--text-secondary)}
[data-row].is-open>.schedule__desc,[data-row].is-open>*>.schedule__desc{grid-template-rows:1fr}
/* переключатель сверху (табы кита) */
.schedule__switch{margin-bottom:var(--space-5)}

/* 03a: карточки на светлом */
.schedule-cards{display:flex;flex-direction:column;gap:12px}
.schedule-cards__item{display:grid;grid-template-columns:170px minmax(0,1fr);gap:var(--space-5);align-items:start;padding:36px 40px;border-radius:var(--radius-l);background:var(--white);box-shadow:var(--shadow-card);transition:transform var(--dur-hover) var(--ease),box-shadow var(--dur-hover)}
.schedule-cards__item[data-more]{grid-template-columns:170px minmax(0,1fr) 28px}
.schedule-cards__item:hover{transform:translateY(-4px);box-shadow:var(--shadow-card-hover)}
.schedule-cards__time,.schedule-cards__topic{font-size:var(--fs-h3);font-weight:var(--fw-heavy);line-height:1.05}
.schedule-cards__topic{text-wrap:balance}
.schedule-cards .persons{margin-top:28px}

/* 03b: длинная с кнопкой: первые строки, затем растворение и «Показать всю программу» */
.schedule-cards__wrap{position:relative}
.schedule-cards__fade{position:absolute;left:0;right:0;bottom:0;height:180px;background:linear-gradient(rgba(242,247,252,0),var(--light));pointer-events:none}
.schedule-cards__action{display:flex;justify-content:center;margin-top:var(--space-5)}

/* 03c1: строки в одной плашке: время, тема, спикер, стрелка */
.schedule-rows{padding:6px 40px;border-radius:var(--radius-l);background:var(--white);box-shadow:var(--shadow-card)}
.schedule-rows__row{display:grid;grid-template-columns:72px minmax(0,1fr) 320px 28px;gap:var(--space-4);align-items:start;padding:20px 0;border-top:1px solid var(--border)}
.schedule-rows__row:first-child{border-top:0}
.schedule-rows__row[data-break]{padding:16px 0}
.schedule-rows__time,.schedule-rows__topic{font-size:var(--fs-body);font-weight:var(--fw-heavy);line-height:1.3}
.schedule-rows__row .schedule__desc p{margin-top:8px;font-size:var(--fs-body-s)}
.schedule-rows__row .persons{flex-direction:column;gap:10px}
.schedule-rows__row>.schedule__chev{grid-column:4;margin-top:-2px}
.schedule-rows--flat{padding:0 40px 16px;border-radius:0;background:none;box-shadow:none}
.schedule-rows--flat .schedule-rows__row:first-child{border-top:1px solid var(--border)}

/* 03c2: части дня плашками, внутри две колонки через линии */
.schedule-groups{display:flex;flex-direction:column;gap:var(--space-6)}
.schedule-group__head{display:flex;align-items:baseline;gap:14px;margin:0 0 var(--space-3) 4px}
.schedule-group__head b{font-size:var(--fs-h4);font-weight:var(--fw-heavy)}
.schedule-group__head span{font-size:var(--fs-body-s);color:var(--text-secondary)}
.schedule-group__grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:0 var(--space-7);padding:4px 40px;border-radius:var(--radius-l);background:var(--white);box-shadow:var(--shadow-card)}
.schedule-group__cell{display:grid;grid-template-columns:minmax(0,1fr) 28px;gap:var(--space-3);align-items:start;padding:22px 0;border-top:1px solid var(--border)}
.schedule-group__cell:nth-child(-n+2){border-top:0}
.schedule-group__time{font-size:var(--fs-small);font-weight:var(--fw-heavy)}
.schedule-group__topic{margin-top:6px;font-size:var(--fs-body);font-weight:var(--fw-heavy);line-height:1.3}
.schedule-group__cell .persons{margin-top:12px;gap:10px 20px}
.schedule-group__cell .schedule__desc p{margin-top:8px;font-size:var(--fs-body-s)}
.schedule-group__cell>.schedule__chev{margin-top:20px}

/* 03c4: сетка спикеров: доклад = карточка, три в ряд, перерывы подписями */
.schedule-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}
.schedule-grid__break{grid-column:1/-1;display:flex;align-items:baseline;gap:14px;padding:20px 4px 4px;font-size:var(--fs-body);font-weight:var(--fw-heavy)}
.schedule-grid__break:first-child{padding-top:0}
.schedule-grid__card{display:flex;flex-direction:column;padding:22px 24px 24px;border-radius:var(--radius-m);background:var(--white);box-shadow:var(--shadow-card);transition:transform var(--dur-hover) var(--ease),box-shadow var(--dur-hover)}
.schedule-grid__card:hover{transform:translateY(-4px);box-shadow:var(--shadow-card-hover)}
.schedule-grid__top{display:flex;justify-content:space-between;align-items:center;min-height:28px;margin-bottom:16px}
.schedule-grid__time{font-size:var(--fs-body);font-weight:var(--fw-heavy)}
.schedule-grid__top .schedule__chev{margin:0}
.schedule-grid__card .persons{flex-direction:column;gap:10px;margin-bottom:14px}
.schedule-grid__topic{font-size:var(--fs-body);font-weight:var(--fw-heavy);line-height:1.3}
.schedule-grid__card .schedule__desc p{margin-top:10px;font-size:var(--fs-body-s)}

/* 03c5: аккордеон частей дня: открыта одна, внутри строки c1 */
.schedule-parts{display:flex;flex-direction:column;gap:12px}
.schedule-parts__part{border-radius:var(--radius-l);background:var(--white);box-shadow:var(--shadow-card)}
.schedule-parts__head{display:grid;grid-template-columns:150px minmax(0,1fr) auto 28px;gap:var(--space-4);align-items:center;padding:26px 40px}
.schedule-parts__time{font-size:var(--fs-h4);font-weight:var(--fw-heavy);line-height:1.1}
.schedule-parts__title b{display:block;font-size:var(--fs-h4);font-weight:var(--fw-heavy);line-height:1.1}
.schedule-parts__title small{display:block;margin-top:5px;font-size:var(--fs-small);color:var(--text-secondary)}
.schedule-parts__head .schedule__chev{margin:0}
.schedule-parts__body{display:grid;grid-template-rows:0fr;transition:grid-template-rows var(--dur-reveal) var(--ease)}
.schedule-parts__body>div{overflow:hidden;min-height:0}
.schedule-parts__part.is-open>.schedule-parts__body{grid-template-rows:1fr}

/* ---------- планшет и телефон ---------- */
@media (max-width:1100px){
  .schedule-rows__row{grid-template-columns:64px minmax(0,1fr) 260px 28px}
  .schedule-group__grid{gap:0 var(--space-5)}
  .schedule-grid{grid-template-columns:repeat(2,minmax(0,1fr))}
}
@media (max-width:767px){
  .schedule-cards__item{grid-template-columns:1fr;gap:10px;padding:22px 20px}
  .schedule-cards__item[data-more]{grid-template-columns:minmax(0,1fr) 28px}
  .schedule-cards__item[data-more]>.schedule__chev{grid-column:2;grid-row:1}
  .schedule-cards__item[data-more]>:not(.schedule__chev){grid-column:1}
  .schedule-cards .persons{flex-direction:column;gap:14px;margin-top:18px}
  .schedule__desc p{margin-top:12px}
  .person--sq{gap:14px}
  .person--sq .avatar{width:72px;height:72px;border-radius:18px}
  .person--sq.person--s .avatar{width:40px;height:40px;border-radius:10px}
  .schedule__switch{flex-wrap:nowrap;overflow-x:auto;margin-inline:calc(var(--gutter) / -2);padding-inline:calc(var(--gutter) / 2);scrollbar-width:none}
  .schedule__switch .tab{flex:none}
  .schedule-cards__fade{height:140px}

  .schedule-rows{padding:0 20px}
  .schedule-rows__row{grid-template-columns:minmax(0,1fr) 28px;gap:6px 12px;padding:16px 0}
  .schedule-rows__row>:not(.schedule__chev){grid-column:1}
  .schedule-rows__row>.schedule__chev{grid-column:2;grid-row:1}
  .schedule-rows__who:empty{display:none}
  .schedule-rows__row .persons{margin-top:6px}
  .schedule-rows--flat{padding:0 20px 12px}

  .schedule-group__head{flex-direction:column;gap:4px}
  .schedule-group__grid{grid-template-columns:1fr;padding:2px 20px}
  .schedule-group__cell{padding:18px 0}
  .schedule-group__cell:nth-child(2){border-top:1px solid var(--border)}

  .schedule-grid{grid-template-columns:1fr;gap:8px}
  .schedule-grid__break{padding:14px 4px 2px}
  .schedule-grid__card{padding:18px 20px 20px}

  .schedule-parts__head{grid-template-columns:minmax(0,1fr) 28px;gap:4px 12px;padding:20px}
  .schedule-parts__head>:not(.schedule__chev){grid-column:1}
  .schedule-parts__head>.schedule__chev{grid-column:2;grid-row:1}
  .schedule-parts__head .faces{display:none}
  .schedule-parts__time{font-size:var(--fs-body)}
}
`;

/* ---------- скрипт вариантов ---------- */
const js = `/* стрелка-раскрытие: строки с описанием (data-more) и части дня (data-part-head) */
document.addEventListener('click', e => {
  const head = e.target.closest('[data-part-head]');
  const row = head ? null : e.target.closest('[data-row][data-more]');
  const box = head ? head.parentElement : row;
  if (!box) return;
  const open = box.classList.toggle('is-open');
  (head || row).querySelector('.schedule__chev')?.setAttribute('aria-expanded', open);
});
/* 03b: длинная программа: первые N строк, остальное — по кнопке */
const plural = (n, one, few, many) => { const a = n % 10, b = n % 100; return (a === 1 && b !== 11) ? one : (a >= 2 && a <= 4 && (b < 12 || b > 14)) ? few : many; };
document.querySelectorAll('[data-schedule-more]').forEach(box => {
  const LIMIT = +box.dataset.scheduleMore || 7;
  const rows = [...box.querySelectorAll('[data-row]')];
  const toggle = box.querySelector('[data-more-toggle]');
  const fade = box.querySelector('[data-more-fade]');
  let expanded = false;
  const render = () => {
    rows.forEach((r, i) => { r.hidden = !expanded && i >= LIMIT; });
    const rest = rows.slice(LIMIT).filter(r => !r.hasAttribute('data-break')).length;
    fade.hidden = expanded;
    toggle.textContent = expanded ? 'Свернуть программу' : \`Показать всю программу, ещё \${rest} \${plural(rest, 'доклад', 'доклада', 'докладов')}\`;
  };
  toggle.addEventListener('click', () => {
    expanded = !expanded; render();
    if (!expanded) box.scrollIntoView({ block: 'start', behavior: 'smooth' });
  });
  render();
});
/* чекбокс витрины: переключатель сверху */
document.querySelectorAll('[data-opt="switch"]').forEach(cb => cb.addEventListener('change', () => {
  const sw = document.getElementById(cb.dataset.for).querySelector('[data-switch]');
  sw.hidden = !cb.checked;
  if (!cb.checked) sw.querySelector('[data-tab]').click();
}));

`;

/* ---------- сборка: зоны между маркерами ---------- */
const between = (start, end, body, what) => {
  const a = page.indexOf(start), z = page.indexOf(end, a + 1);
  if (a < 0 || z < 0) throw new Error(`маркеры не найдены: ${what}`);
  page = page.slice(0, a) + body + page.slice(z);
};
between('<header class="section--dark intro">', '</header>\n', header.replace(/<\/header>\n$/, ''), 'шапка');
between('/* ---------- общее для вариантов ---------- */', '</style>', css, 'стили');
between('<!-- ======================= варианты ', '<!-- ======================= рефы ', markup, 'разметка');
const jsStart = '<script src="./blocks.js"></script>\n<script>\n';
if (!page.includes(jsStart)) throw new Error('маркеры не найдены: скрипт');
between(jsStart, '/* рефы: галерея по группам и просмотрщик кадров */', jsStart + js, 'скрипт');

writeFileSync(FILE, page);
console.log(`schedule-variants.html: ${(page.length / 1024).toFixed(0)} КБ`);

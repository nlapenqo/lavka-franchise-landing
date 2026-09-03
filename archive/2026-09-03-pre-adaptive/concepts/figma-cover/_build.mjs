// Обложка Figma-файла: 5 вариантов шейпового вайрфрейма первых двух блоков лендинга.
// Геометрия снята с site/index.html + site/styles.css (hero 820, event-strip 64, numbers).
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIR = dirname(fileURLToPath(import.meta.url));
const W = 1920, H = 960;

const C = {
  bg:    '#E9EFF6',
  bgAlt: '#DFE9F3',
  ink:   '#6A86A6',
  sky:   '#BAD5EC',
  paper: '#FFFFFF',
  acc:   '#00ADFF',
  grid:  '#D3E1EE',
  soft:  '#C9D8E8',
  edge:  '#CFDDEB',
};

const n = v => Math.round(v * 100) / 100;
const rc = (x, y, w, h, rx, fill, o) =>
  `<rect x="${n(x)}" y="${n(y)}" width="${n(w)}" height="${n(h)}" rx="${n(rx)}" fill="${fill}"${o != null ? ` fill-opacity="${o}"` : ''}/>`;
const so = (x, y, w, h, rx, stroke, o, sw = 2) =>
  `<rect x="${n(x)}" y="${n(y)}" width="${n(w)}" height="${n(h)}" rx="${n(rx)}" fill="none" stroke="${stroke}"${o != null ? ` stroke-opacity="${o}"` : ''} stroke-width="${n(sw)}"/>`;
const el = (cx, cy, rx, ry, fill, rot) =>
  `<ellipse cx="${n(cx)}" cy="${n(cy)}" rx="${n(rx)}" ry="${n(ry)}" fill="${fill}"${rot ? ` transform="rotate(${rot} ${n(cx)} ${n(cy)})"` : ''}/>`;
const ci = (cx, cy, r, fill, o) =>
  `<circle cx="${n(cx)}" cy="${n(cy)}" r="${n(r)}" fill="${fill}"${o != null ? ` fill-opacity="${o}"` : ''}/>`;
const ln = (x1, y1, x2, y2, stroke, o, sw = 1) =>
  `<line x1="${n(x1)}" y1="${n(y1)}" x2="${n(x2)}" y2="${n(y2)}" stroke="${stroke}"${o != null ? ` stroke-opacity="${o}"` : ''} stroke-width="${n(sw)}"/>`;

/* ---------- страница-вайрфрейм: 1440 × 1456 ---------- */
const PW = 1440, PH = 1456;
const HERO_H = 820, STRIP_Y = 820, STRIP_H = 64, NUM_Y = 884;
const CARD_Y = 980, CARD_H = 380, CARD_W = 364;
const CARD_X = [143, 538, 933];

function page(ctx, opt = {}) {
  const p = `p${++ctx.n}`;
  const simple = !!opt.simple;
  ctx.defs.push(
    `<radialGradient id="${p}-g"><stop offset="0" stop-color="${C.acc}" stop-opacity="${simple ? '.2' : '.34'}"/><stop offset=".38" stop-color="${C.acc}" stop-opacity="${simple ? '.1' : '.18'}"/><stop offset=".7" stop-color="${C.acc}" stop-opacity="${simple ? '.03' : '.06'}"/><stop offset="1" stop-color="${C.acc}" stop-opacity="0"/></radialGradient>`,
    `<radialGradient id="${p}-gc"><stop offset="0" stop-color="${C.acc}" stop-opacity=".26"/><stop offset=".45" stop-color="${C.acc}" stop-opacity=".12"/><stop offset="1" stop-color="${C.acc}" stop-opacity="0"/></radialGradient>`,
    `<clipPath id="${p}-hero"><rect width="${PW}" height="${HERO_H}"/></clipPath>`,
    ...CARD_X.map((x, i) => `<clipPath id="${p}-c${i}"><rect x="${x}" y="${CARD_Y}" width="${CARD_W}" height="${CARD_H}" rx="28"/></clipPath>`)
  );

  const o = [];
  o.push(rc(0, 0, PW, PH, 0, C.paper));

  /* --- первый экран --- */
  o.push(rc(0, 0, PW, HERO_H, 0, C.ink));
  o.push(`<g clip-path="url(#${p}-hero)">`);
  if (!simple) {
    o.push(el(-320, 738, 473, 529, `url(#${p}-g)`, -33));
    o.push(el(1095, 836, 281, 315, `url(#${p}-g)`, -33));
    o.push(el(1297, 33, 281, 315, `url(#${p}-g)`, -33));
  }
  o.push(`</g>`);

  // шапка-капсула
  o.push(rc(48, 28, 1344, 68, 34, C.paper, simple ? .12 : .1));
  if (simple) {
    o.push(rc(80, 48, 208, 28, 8, C.paper, .82));
    o.push(rc(1230, 44, 130, 36, 18, C.paper, .82));
  } else {
    o.push(so(49, 29, 1342, 66, 33, C.paper, .22, 2));
    o.push(rc(78, 50, 132, 22, 6, C.paper, .9));
    o.push(rc(222, 50, 68, 22, 6, C.paper, .5));
    o.push(rc(302, 50, 56, 22, 6, C.paper, .32));
    o.push(rc(1136, 54, 84, 15, 7.5, C.paper, .5));
    o.push(so(1245, 44, 116, 36, 18, C.paper, .7, 2.5));
  }

  if (simple) {
    // заголовок — два крупных блока
    o.push(rc(138, 300, 640, 96, 12, C.paper, .92));
    o.push(rc(138, 416, 392, 96, 12, C.paper, .45));
    // одна строка лида
    o.push(rc(138, 578, 470, 18, 9, C.paper, .38));
    // кнопка
    o.push(rc(138, 656, 268, 64, 32, C.acc));
  } else {
    o.push(rc(138, 286, 520, 78, 10, C.paper, .92));
    o.push(rc(138, 378, 306, 78, 10, C.paper, .92));
    o.push(rc(462, 378, 232, 78, 10, C.paper, .92));
    o.push(rc(138, 470, 398, 78, 10, C.paper, .45));
    o.push(rc(138, 600, 486, 15, 7.5, C.paper, .38));
    o.push(rc(138, 628, 404, 15, 7.5, C.paper, .38));
    o.push(rc(138, 692, 236, 56, 28, C.acc));
    o.push(rc(404, 712, 148, 15, 7.5, C.paper, .5));
  }

  /* --- лента мероприятия --- */
  o.push(rc(0, STRIP_Y, PW, STRIP_H, 0, C.sky));
  if (simple) {
    o.push(rc(48, STRIP_Y + 24, 320, 16, 8, C.ink, .45));
    o.push(rc(1252, STRIP_Y + 12, 140, 40, 20, C.ink));
  } else {
    o.push(rc(48, STRIP_Y + 25, 210, 15, 7.5, C.ink, .62));
    o.push(rc(298, STRIP_Y + 25, 152, 15, 7.5, C.ink, .42));
    o.push(rc(490, STRIP_Y + 25, 286, 15, 7.5, C.ink, .42));
    o.push(ci(824, STRIP_Y + 32, 6, C.ink, .5));
    o.push(rc(842, STRIP_Y + 25, 120, 15, 7.5, C.ink, .42));
    o.push(rc(1252, STRIP_Y + 12, 140, 40, 20, C.ink));
  }

  /* --- цифры --- */
  CARD_X.forEach((x, i) => {
    const cx = x + CARD_W / 2;
    o.push(rc(x, CARD_Y, CARD_W, CARD_H, 28, C.ink));
    if (!simple) {
      o.push(`<g clip-path="url(#${p}-c${i})">`);
      o.push(el(cx - 8, CARD_Y - 4, 232, 176, `url(#${p}-gc)`));
      o.push(`</g>`);
      o.push(rc(cx - 66, CARD_Y + 52, 132, 104, 12, C.paper, .92));
      o.push(rc(cx - 95, CARD_Y + 186, 190, 21, 10.5, C.paper, .7));
      o.push(rc(cx - 70, CARD_Y + 216, 140, 21, 10.5, C.paper, .7));
      o.push(rc(cx - 116, CARD_Y + 282, 232, 12, 6, C.paper, .36));
      o.push(rc(cx - 105, CARD_Y + 304, 210, 12, 6, C.paper, .36));
      o.push(rc(cx - 80, CARD_Y + 326, 160, 12, 6, C.paper, .36));
    } else {
      o.push(rc(cx - 78, CARD_Y + 76, 156, 118, 14, C.paper, .9));
      o.push(rc(cx - 100, CARD_Y + 234, 200, 24, 12, C.paper, .5));
    }
  });

  return o.join('');
}

/* кадр-вьюпорт: показывает страницу начиная с логической точки (sx,sy) в масштабе s */
function viewport(ctx, { x, y, w, h, rx = 28, s, sx = 0, sy = 0, rot = 0, shadow = true, edge = true, simple = false }) {
  const id = `v${++ctx.n}`;
  ctx.defs.push(`<clipPath id="${id}"><rect x="${n(x)}" y="${n(y)}" width="${n(w)}" height="${n(h)}" rx="${n(rx)}"/></clipPath>`);
  const inner = page(ctx, { simple });
  const spin = rot ? ` rotate(${rot} ${n(x + w / 2)} ${n(y + h / 2)})` : '';
  return [
    `<g${spin ? ` transform="${spin.trim()}"` : ''}>`,
    shadow ? `<g filter="url(#drop)">${rc(x, y, w, h, rx, C.paper)}</g>` : '',
    `<g clip-path="url(#${id})"><g transform="translate(${n(x - sx * s)},${n(y - sy * s)}) scale(${n(s)})">${inner}</g></g>`,
    edge ? so(x + .75, y + .75, w - 1.5, h - 1.5, rx, C.edge, .9, 1.5) : '',
    `</g>`,
  ].join('');
}

function doc(fn) {
  const ctx = { n: 0, defs: [] };
  const body = fn(ctx);
  const defs = [
    `<filter id="drop" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="28" stdDeviation="34" flood-color="#22406B" flood-opacity=".18"/></filter>`,
    `<radialGradient id="amb"><stop offset="0" stop-color="${C.acc}" stop-opacity=".26"/><stop offset=".55" stop-color="${C.acc}" stop-opacity=".09"/><stop offset="1" stop-color="${C.acc}" stop-opacity="0"/></radialGradient>`,
    ...ctx.defs,
  ].join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" fill="none"><defs>${defs}</defs>${body}</svg>`;
}

/* ---------- 01 · Фронт ---------- */
const v1 = doc(ctx => {
  const s = .75, w = PW * s, x = (W - w) / 2, y = 74;
  return [
    rc(0, 0, W, H, 0, C.bg),
    el(960, 640, 800, 430, 'url(#amb)'),
    viewport(ctx, { x, y, w, h: H - y, s, rx: 30, simple: true }),
  ].join('');
});

/* ---------- 02 · Наклон ---------- */
const v2 = doc(ctx => {
  const s = .72, w = PW * s, h = 1400 * s;
  return [
    rc(0, 0, W, H, 0, C.bgAlt),
    el(430, 250, 560, 420, 'url(#amb)'),
    viewport(ctx, { x: 990 - w / 2, y: 545 - h / 2, w, h, s, rx: 26, rot: -7 }),
  ].join('');
});

/* ---------- 03 · Два кадра ---------- */
const v3 = doc(ctx => {
  const sA = .827;                       // левый кадр: hero + лента, кроп по ширине
  const a = { x: 116, y: 112, w: 744, h: 884 * sA, s: sA, sx: 0, sy: 0, rot: -2 };
  const sB = .726;                       // правый кадр: лента + цифры
  const b = { x: 830, y: 322, w: 900, h: 616 * sB, s: sB, sx: 100, sy: 800, rot: 1.6 };
  return [
    rc(0, 0, W, H, 0, C.bg),
    el(1180, 560, 620, 430, 'url(#amb)'),
    viewport(ctx, { ...b, rx: 24 }),
    viewport(ctx, { ...a, rx: 28 }),
  ].join('');
});

/* ---------- 04 · Крупный план ---------- */
const v4 = doc(ctx => [
  rc(0, 0, W, H, 0, C.bg),
  viewport(ctx, { x: 0, y: 0, w: W, h: H, rx: 0, s: 1.45, sx: 100, sy: 250, shadow: false, edge: false }),
  viewport(ctx, { x: 1150, y: 455, w: 680, h: 280, rx: 20, s: .53, sx: 115, sy: 946, rot: -1.5 }),
].join(''));

/* ---------- 05 · Разбор ---------- */
const v5 = doc(ctx => {
  const grid = [];
  for (let gx = 60; gx < W; gx += 60) grid.push(ln(gx, 0, gx, H, C.grid, .95));
  for (let gy = 60; gy < H; gy += 60) grid.push(ln(0, gy, W, gy, C.grid, .95));
  const ticks = [];
  for (let tx = 108; tx <= 1812; tx += 48) ticks.push(ln(tx, 54, tx, tx % 192 === 108 ? 74 : 66, C.ink, .38, 2));
  for (let ty = 104; ty <= 856; ty += 48) ticks.push(ln(54, ty, ty % 192 === 104 ? 74 : 66, ty, C.ink, .38, 2));
  return [
    rc(0, 0, W, H, 0, C.bg),
    grid.join(''),
    ticks.join(''),
    viewport(ctx, { x: 108, y: 104, w: 763, h: 752, rx: 20, s: .53 }),
    viewport(ctx, { x: 908, y: 104, w: 904, h: 440, rx: 18, s: .9, sx: 96, sy: 272 }),
    viewport(ctx, { x: 908, y: 576, w: 904, h: 342, rx: 18, s: .755, sx: 120, sy: 946 }),
  ].join('');
});

const VARIANTS = [
  ['v1', 'Фронт · упрощённый', 'Крупные блоки без мелочи: шапка, заголовок, кнопка, лента, три карточки', v1],
  ['v2', 'Наклон', 'Оба блока целиком, лист повёрнут — обложка «в движении»', v2],
  ['v3', 'Два кадра', 'Первый блок и второй разложены на два перекрывающихся кадра', v3],
  ['v4', 'Крупный план', 'Макро-кроп героя, второй блок — врезкой в углу', v4],
  ['v5', 'Разбор', 'Полный лист слева, фрагменты обоих блоков справа, сетка', v5],
];

for (const [id, , , svg] of VARIANTS) writeFileSync(join(DIR, `${id}.svg`), svg);

const html = `<!doctype html>
<html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Обложка Figma — вайрфрейм первых блоков</title>
<style>
:root{color-scheme:light}
*{box-sizing:border-box}
body{margin:0;padding:56px 40px 96px;background:#F4F7FA;color:#1B3A6A;font:15px/1.5 -apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif}
h1{margin:0 0 8px;font-size:26px;letter-spacing:-.01em}
.sub{margin:0 0 44px;color:#5A749B}
.item{margin:0 0 56px}
.head{display:flex;align-items:baseline;gap:14px;margin:0 0 14px}
.num{font-size:13px;font-weight:700;color:#00ADFF;letter-spacing:.08em}
.name{font-size:19px;font-weight:700}
.desc{color:#5A749B;font-size:14px}
.frame{border-radius:20px;overflow:hidden;box-shadow:0 18px 44px rgba(27,58,106,.14);background:#fff;line-height:0}
.frame svg{width:100%;height:auto;display:block}
.dl{display:inline-block;margin-top:12px;font-size:13px;color:#3E88C5;text-decoration:none;border-bottom:1px solid rgba(62,136,197,.4)}
</style></head><body>
<h1>Обложка Figma — 5 вариантов вайрфрейма</h1>
<p class="sub">1920×960. Только шейпы: первый экран, лента мероприятия, блок цифр. Файлы <code>v1–v5.svg</code> перетаскиваются в Figma как векторные слои.</p>
${VARIANTS.map(([id, name, desc, svg], i) => `<section class="item">
  <div class="head"><span class="num">0${i + 1}</span><span class="name">${name}</span><span class="desc">${desc}</span></div>
  <div class="frame">${svg}</div>
  <a class="dl" href="./${id}.svg" download>Скачать ${id}.svg</a>
</section>`).join('\n')}
</body></html>`;

writeFileSync(join(DIR, 'index.html'), html);
console.log('built', VARIANTS.map(v => v[0]).join(', '));

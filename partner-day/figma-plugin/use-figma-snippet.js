/* ============================================================================
   Код для инструмента `use_figma` удалённого Figma MCP (mcp.figma.com/mcp).
   Выполняется через Figma Plugin API прямо на файле:
     fileKey = AKcj37nN8YykAKDpwt5qe4   (Лендинг франшизы Яндекс Лавки)
     страница «Лендинг Мероприятия»

   Собирает нативный макет: фреймы с auto-layout, именованные слои,
   текст на YS Geo / YS Text, цвета и радиусы Лавки.
   Эталон 1920 (на боевой странице при ≥1920 rem = 10px, поэтому все
   размеры здесь = rem × 10 и совпадают с вёрсткой один в один).

   Отличия от версии-плагина (code.js): нет figma.closePlugin,
   результат возвращается строкой.
   ========================================================================== */

var W = 1920;

function hex(h) {
  return {
    r: parseInt(h.slice(1, 3), 16) / 255,
    g: parseInt(h.slice(3, 5), 16) / 255,
    b: parseInt(h.slice(5, 7), 16) / 255
  };
}
var C = {
  blue:    hex('#1B3A6A'),
  sky:     hex('#7FD0FF'),
  cta:     hex('#00ADFF'),
  grey:    hex('#7D7D7D'),
  white:   { r: 1, g: 1, b: 1 },
  photoA:  hex('#E9F6FF'),
  photoB:  hex('#7FC4EF'),
  photoFg: hex('#1D3E70')
};
function solid(color, opacity) {
  return { type: 'SOLID', color: color, opacity: opacity === undefined ? 1 : opacity };
}

var SPEAKERS = [
  { kick: 'Яндекс',    n: 'Вадим Петров',      r: 'Генеральный директор Яндекс Лавки' },
  { kick: 'Яндекс',    n: 'Мария Швиндт',      r: 'Руководитель франшизы Яндекс Лавки' },
  { kick: 'Яндекс',    n: 'Наталья Крякова',   r: 'Лид поддержки франчайзи Яндекс Лавки' },
  { kick: 'Яндекс',    n: 'Надежда Полюдова',  r: 'Старший менеджер продукта Яндекс Лавки' },
  { kick: 'Яндекс',    n: 'Анита Краснова',    r: 'Менеджер по развитию бизнеса Яндекс Байка' },
  { kick: 'Эксперт',   n: 'Наталья Марова',    r: 'Руководитель Retail.ru, эксперт ритейла' },
  { kick: 'Эксперт',   n: 'Михаил Бурмистров', r: 'Генеральный директор «INFOLine-Аналитика»' },
  { kick: 'Эксперт',   n: 'Василь Газизулин',  r: 'Основатель TopFranchise' },
  { kick: 'Эксперт',   n: 'Виктор Ляшевский',  r: 'Эксперт по франчайзингу, автор «Франшизы на 360»' },
  { kick: 'Франчайзи', n: 'Сергей Козлов',     r: 'Франчайзи Яндекс Лавки' },
  { kick: 'Франчайзи', n: 'Станислав Лопатин', r: 'Франчайзи Яндекс Лавки' },
  { kick: 'Франчайзи', n: 'Артём Сизов',       r: 'Франчайзи Яндекс Лавки' }
];

/* Подписи спикеров короткие — строка табло должна остаться однострочной */
var PROGRAM = [
  { time: '11:00', topic: 'Регистрация и приветственный кофе', who: '', brk: true },
  { time: '12:00', topic: 'Сильная франшиза — сильная сеть: открытие Дня партнёров', who: 'Вадим Петров, Яндекс Лавка' },
  { time: '12:20', topic: 'Рынок e-grocery: куда растёт спрос', who: 'Наталья Марова, Retail.ru' },
  { time: '12:40', topic: 'Стратегия роста и выход в новые города', who: 'Мария Швиндт, Яндекс Лавка' },
  { time: '13:10', topic: 'Франшиза как вход в готовую бизнес-модель', who: 'Василь Газизулин, TopFranchise' },
  { time: '13:30', topic: 'Зайти в новую нишу и вырасти: личный опыт франчайзи', who: 'Сергей Козлов' },
  { time: '13:50', topic: 'Перерыв и демо-стенды Яндекс Лавки', who: '', brk: true },
  { time: '14:20', topic: 'Партнёр у руля: как устроено управление сервисом', who: 'Наталья Крякова, Яндекс Лавка' },
  { time: '14:40', topic: 'Не теория: за что реально отвечает партнёр', who: 'Станислав Лопатин, франчайзи' },
  { time: '15:00', topic: 'Метрики вместо интуиции: эффективность и результат', who: 'Артём Сизов, франчайзи' },
  { time: '15:20', topic: 'Трафик, конверсия, рост: как работает маркетинг', who: 'Спикер Яндекс Лавки' },
  { time: '15:40', topic: 'Горячая еда: частота заказов, чек и лояльность', who: 'Спикер Яндекс Лавки' },
  { time: '16:00', topic: 'Перерыв', who: '', brk: true },
  { time: '16:20', topic: 'Разбор финансовой модели реального бизнеса', who: 'Мария Швиндт, Яндекс Лавка' },
  { time: '16:50', topic: 'Цифровая среда для франшизы: технологии Лавки', who: 'Надежда Полюдова' },
  { time: '17:10', topic: 'Трансформация офлайн-торговли под влиянием AI', who: 'Спикер Яндекса' },
  { time: '17:30', topic: 'Синергия бизнесов: Яндекс Байк для последней мили', who: 'Анита Краснова' },
  { time: '18:00', topic: 'Фуршет, дегустация хитов Лавки и общение с командой', who: '', brk: true }
];

async function resolveFonts() {
  var all = await figma.listAvailableFontsAsync();
  var fams = {};
  all.forEach(function (f) {
    if (!fams[f.fontName.family]) fams[f.fontName.family] = [];
    fams[f.fontName.family].push(f.fontName.style);
  });
  function pick(family, wanted) {
    var styles = fams[family], fam = family;
    if (!styles) { fam = 'Inter'; styles = fams['Inter'] || ['Regular']; }
    for (var i = 0; i < wanted.length; i++) {
      if (styles.indexOf(wanted[i]) >= 0) return { family: fam, style: wanted[i] };
    }
    return { family: fam, style: styles[0] };
  }
  var F = {
    black:   pick('YS Geo',  ['Black', 'Heavy', 'Bold']),
    medium:  pick('YS Geo',  ['Medium', 'Regular']),
    regular: pick('YS Geo',  ['Regular', 'Light']),
    textReg: pick('YS Text', ['Regular', 'Light'])
  };
  var uniq = [];
  Object.keys(F).forEach(function (k) {
    var f = F[k];
    if (!uniq.some(function (u) { return u.family === f.family && u.style === f.style; })) uniq.push(f);
  });
  for (var i = 0; i < uniq.length; i++) await figma.loadFontAsync(uniq[i]);
  F.missing = !fams['YS Geo'] || !fams['YS Text'];
  return F;
}

function frame(name, o) {
  o = o || {};
  var f = figma.createFrame();
  f.name = name;
  f.fills = o.fill ? [o.fill] : [];
  if (o.mode) {
    f.layoutMode = o.mode;
    f.primaryAxisSizingMode = 'AUTO';
    f.counterAxisSizingMode = 'AUTO';
    f.itemSpacing = o.gap || 0;
    f.paddingTop = o.pt || o.pv || o.pad || 0;
    f.paddingBottom = o.pb || o.pv || o.pad || 0;
    f.paddingLeft = o.pl || o.ph || o.pad || 0;
    f.paddingRight = o.pr || o.ph || o.pad || 0;
    if (o.align) f.counterAxisAlignItems = o.align;
  }
  if (o.radius) f.cornerRadius = o.radius;
  if (o.clip !== undefined) f.clipsContent = o.clip;
  return f;
}

function textNode(name, chars, font, size, fill, o) {
  o = o || {};
  var t = figma.createText();
  t.name = name;
  t.fontName = font;
  t.characters = chars;
  t.fontSize = size;
  t.fills = [fill];
  t.lineHeight = o.lineHeight ? { value: o.lineHeight, unit: 'PIXELS' } : { value: 120, unit: 'PERCENT' };
  if (o.letterSpacing) t.letterSpacing = { value: o.letterSpacing, unit: 'PERCENT' };
  return t;
}

function photoPlaceholder(size) {
  var f = frame('Фото', { radius: 20, clip: true });
  f.resize(size, size);
  f.fills = [{
    type: 'GRADIENT_LINEAR',
    gradientTransform: [[0, 1, 0], [-1, 0, 1]],
    gradientStops: [
      { position: 0, color: { r: C.photoA.r, g: C.photoA.g, b: C.photoA.b, a: 1 } },
      { position: 1, color: { r: C.photoB.r, g: C.photoB.g, b: C.photoB.b, a: 1 } }
    ]
  }];
  var head = figma.createEllipse();
  head.name = 'Силуэт · голова';
  head.resize(size * 0.35, size * 0.42);
  head.x = size / 2 - size * 0.175;
  head.y = size * 0.40 - size * 0.21;
  head.fills = [solid(C.photoFg)];
  f.appendChild(head);
  var body = figma.createEllipse();
  body.name = 'Силуэт · плечи';
  body.resize(size * 0.76, size * 0.84);
  body.x = size / 2 - size * 0.38;
  body.y = size * 1.06 - size * 0.42;
  body.fills = [solid(C.photoFg)];
  f.appendChild(body);
  return f;
}

function buildSpeakers(F) {
  var CARD = (W - 160 - 5 * 20) / 6;
  var sec = frame('Блок · Спикеры', { mode: 'VERTICAL', gap: 48 });
  sec.appendChild(textNode('Заголовок', 'Спикеры', F.black, 80, solid(C.blue), { lineHeight: 80 }));

  var grid = frame('Сетка 6×2', { mode: 'VERTICAL', gap: 48 });
  sec.appendChild(grid);

  for (var r = 0; r < 2; r++) {
    var row = frame('Ряд ' + (r + 1), { mode: 'HORIZONTAL', gap: 20 });
    grid.appendChild(row);
    for (var i = 0; i < 6; i++) {
      var sp = SPEAKERS[r * 6 + i];
      var card = frame('Спикер · ' + sp.n, { mode: 'VERTICAL', gap: 16 });
      row.appendChild(card);
      card.resize(CARD, card.height);
      card.layoutSizingHorizontal = 'FIXED';

      var ph = photoPlaceholder(CARD);
      card.appendChild(ph);
      ph.layoutSizingHorizontal = 'FIXED';

      var info = frame('Подпись', { mode: 'VERTICAL', gap: 8 });
      card.appendChild(info);
      info.layoutSizingHorizontal = 'FILL';

      var kick = textNode('Группа', sp.kick, F.medium, 13, solid(C.blue, 0.5), { lineHeight: 13 });
      info.appendChild(kick);
      kick.textAutoResize = 'HEIGHT';
      kick.layoutSizingHorizontal = 'FILL';

      var name = textNode('Имя', sp.n, F.black, 20, solid(C.blue), { lineHeight: 22 });
      info.appendChild(name);
      name.textAutoResize = 'HEIGHT';
      name.layoutSizingHorizontal = 'FILL';

      var role = textNode('Должность', sp.r, F.textReg, 14, solid(C.grey), { lineHeight: 17 });
      info.appendChild(role);
      role.textAutoResize = 'HEIGHT';
      role.layoutSizingHorizontal = 'FILL';
    }
  }
  return sec;
}

function programRow(item, F) {
  var row = frame('Строка · ' + item.time, { mode: 'HORIZONTAL', gap: 20, pv: 14, align: 'BASELINE' });
  row.strokes = [solid(C.white, 0.09)];
  row.strokeTopWeight = 0;
  row.strokeBottomWeight = 1;
  row.strokeLeftWeight = 0;
  row.strokeRightWeight = 0;

  var time = textNode('Время', item.time, F.medium, 16, solid(C.sky, item.brk ? 0.5 : 1), { lineHeight: 22 });
  row.appendChild(time);
  time.resize(56, time.height);
  time.layoutSizingHorizontal = 'FIXED';
  time.textAutoResize = 'HEIGHT';

  var chars = item.topic + (item.who ? '  — ' + item.who : '');
  var body = textNode('Тема и спикер', chars, item.brk ? F.medium : F.black, 17,
    solid(C.white, item.brk ? 0.45 : 1), { lineHeight: 22 });
  row.appendChild(body);
  body.layoutSizingHorizontal = 'FILL';
  body.textAutoResize = 'HEIGHT';

  if (item.who) {
    body.setRangeFontName(item.topic.length, chars.length, F.textReg);
    body.setRangeFontSize(item.topic.length, chars.length, 13);
    body.setRangeFills(item.topic.length, chars.length, [solid(C.white, 0.5)]);
  }
  return row;
}

function buildProgram(F) {
  var sec = frame('Блок · Программа', { mode: 'VERTICAL', gap: 32 });
  sec.appendChild(textNode('Заголовок', 'Программа', F.black, 80, solid(C.blue), { lineHeight: 80 }));

  var tray = frame('Лоток табло', { mode: 'VERTICAL', pad: 10, radius: 46, fill: solid(C.blue, 0.06) });
  sec.appendChild(tray);
  tray.layoutSizingHorizontal = 'FILL';

  var board = frame('Табло', {
    mode: 'VERTICAL', gap: 24, pt: 32, pb: 36, ph: 48, radius: 38, fill: solid(C.blue), clip: true
  });
  tray.appendChild(board);
  board.layoutSizingHorizontal = 'FILL';

  var chip = frame('Чип', { mode: 'HORIZONTAL', gap: 10, pv: 9, ph: 18, radius: 132, align: 'CENTER' });
  chip.strokes = [solid(C.white, 0.22)];
  chip.strokeWeight = 1;
  board.appendChild(chip);

  var dot = figma.createEllipse();
  dot.name = 'Индикатор';
  dot.resize(7, 7);
  dot.fills = [solid(C.cta)];
  chip.appendChild(dot);

  chip.appendChild(textNode('Подпись', 'ДЕЛОВАЯ ПРОГРАММА · 27.08 · MERCURY SPACE',
    F.medium, 12, solid(C.sky), { lineHeight: 12, letterSpacing: 14 }));

  var cols = frame('Колонки', { mode: 'HORIZONTAL', gap: 70 });
  board.appendChild(cols);
  cols.layoutSizingHorizontal = 'FILL';

  var half = Math.ceil(PROGRAM.length / 2);
  for (var c = 0; c < 2; c++) {
    var col = frame('Колонка ' + (c + 1), { mode: 'VERTICAL', gap: 0 });
    cols.appendChild(col);
    col.layoutSizingHorizontal = 'FILL';
    var slice = PROGRAM.slice(c * half, (c + 1) * half);
    for (var i = 0; i < slice.length; i++) {
      var row = programRow(slice[i], F);
      col.appendChild(row);
      row.layoutSizingHorizontal = 'FILL';
    }
  }
  return sec;
}

/* ── Точка входа ─────────────────────────────────────────────────────── */
var NAME = 'День партнёров · Спикеры + Программа · 1920';

/* Страница «Лендинг Мероприятия»; если её нет — текущая */
var pages = figma.root.children;
var page = null;
for (var i = 0; i < pages.length; i++) {
  if (pages[i].name.indexOf('Мероприятия') >= 0) { page = pages[i]; break; }
}
if (!page) page = figma.currentPage;
await page.loadAsync();
figma.currentPage = page;

var F = await resolveFonts();

var old = page.findOne(function (n) { return n.type === 'FRAME' && n.name === NAME; });
var at = old ? { x: old.x, y: old.y } : { x: 0, y: 0 };
if (old) old.remove();

var root = frame(NAME, { mode: 'VERTICAL', gap: 96, pt: 64, pb: 96, ph: 80, fill: solid(C.white) });
page.appendChild(root);
root.x = at.x;
root.y = at.y;
root.resize(W, root.height);
root.counterAxisSizingMode = 'FIXED';

var speakers = buildSpeakers(F);
root.appendChild(speakers);
speakers.layoutSizingHorizontal = 'FILL';

var program = buildProgram(F);
root.appendChild(program);
program.layoutSizingHorizontal = 'FILL';

page.selection = [root];

return 'Готово: ' + NAME + ', ' + Math.round(root.width) + '×' + Math.round(root.height) +
  (F.missing ? ' (YS Geo / YS Text не найдены — подставлен Inter)' : ' на YS Geo и YS Text');

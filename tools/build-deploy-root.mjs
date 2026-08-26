#!/usr/bin/env node
// Собирает прод-сайт в указанную папку — ровно то, что должно лежать на хостинге:
//   /index.html          — веб-версия (≥768px), из site/
//   /m.html              — мобильная версия (<768px), сборка E из concepts/mobile/
//   /styles.css, /app.js, /assets/, /fonts/, /mobile/_shared/
// Больше ничего: варианты сравнения и витрины живут в репозитории, не в проде.
// Использование: node tools/build-deploy-root.mjs <куда-собирать>
import { cpSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dest = process.argv[2] && resolve(process.argv[2]);
if (!dest) { console.error('Использование: node tools/build-deploy-root.mjs <куда-собирать>'); process.exit(1); }

const read = p => readFileSync(join(root, p), 'utf8');
const write = (p, s) => { mkdirSync(dirname(join(dest, p)), { recursive: true }); writeFileSync(join(dest, p), s); };
const copy = (from, to) => { mkdirSync(dirname(join(dest, to)), { recursive: true }); cpSync(join(root, from), join(dest, to), { recursive: true }); };

/* Pages отдаёт статику с cache-control: max-age=600 — без версии в ссылке
   вернувшийся посетитель до 10 минут видит старые стили. Штампуем ссылки
   хешем содержимого: новый билд = новый URL, старый кэш не мешает. */
const ver = p => createHash('sha1').update(read(p)).digest('hex').slice(0, 8);
const V = {
  css: ver('site/styles.css'),
  js: ver('site/app.js'),
  base: ver('concepts/mobile/_shared/base.css'),
  content: ver('concepts/mobile/_shared/content.js'),
  blocks: ver('concepts/mobile/_shared/blocks.js')
};
/* веб-страница: ./styles.css и ./app.js рядом или на уровень выше */
const stampWeb = s => s
  .replace('href="./styles.css"', `href="./styles.css?v=${V.css}"`)
  .replace('src="./app.js"', `src="./app.js?v=${V.js}"`)
  .replace('href="../styles.css"', `href="../styles.css?v=${V.css}"`)
  .replace('src="../app.js"', `src="../app.js?v=${V.js}"`);
/* мобильная страница: три файла из _shared, путь до них уже переписан */
const stampMobile = s => s
  .replace('base.css"', `base.css?v=${V.base}"`)
  .replace('content.js"', `content.js?v=${V.content}"`)
  .replace('blocks.js"', `blocks.js?v=${V.blocks}"`);

/* Мобильная сборка E c путями под размещение в папке dir ('' — корень gh-pages).
   Широкий экран уводит на веб-версию рядом (./index.html), заголовок — продовый. */
const mobilePage = (assetsUp, sharedPath) => read('concepts/mobile/e-figma.html')
  .replaceAll('../../site/assets/', assetsUp)
  .replaceAll('./_shared/', sharedPath)
  .replace('<title>Мобилка E — Одна сущность · Франшиза Яндекс Лавки</title>',
           '<title>Франшиза Яндекс Лавки</title>')
  .replace("location.replace('./showcase.html' + location.hash)",
           "location.replace('./index.html' + location.hash)")
  .replace("wide.addEventListener ? wide.addEventListener('change', jump) : wide.addListener(jump);",
           "wide.addEventListener ? wide.addEventListener('change', jump) : wide.addListener(jump);\n  addEventListener('resize', jump);");

/* Редирект веб-страницы: узкое окно уводим на m.html рядом */
const switchScript = `<script>
/* <768px — мобильная сборка (m.html); она делает обратный редирект при расширении */
(() => {
  if (window.top !== window.self) return;
  const narrow = matchMedia('(max-width: 767px)');
  const jump = () => { if (narrow.matches) location.replace('./m.html' + location.hash); };
  jump();
  narrow.addEventListener ? narrow.addEventListener('change', jump) : narrow.addListener(jump);
  addEventListener('resize', jump);
})();
<\/script>`;

/* 1 · корень — выбранный вариант «переключение»: веб ≥768px, мобильная сборка E <768px */
const webRoot = read('site/index.html');
const rootCss = '<link rel="stylesheet" href="./styles.css">';
if (!webRoot.includes(rootCss)) { console.error('Не нашёл ссылку на styles.css в site/index.html'); process.exit(1); }
write('index.html', stampWeb(webRoot.replace(rootCss, switchScript + '\n  ' + rootCss)));
write('m.html', stampMobile(mobilePage('./assets/', './mobile/_shared/')));
for (const f of ['styles.css', 'app.js']) copy(`site/${f}`, f);
/* Копируем только те картинки и шрифты, на которые есть ссылка в вёрстке:
   в site/assets и site/fonts лежат ещё файлы для превью блоков и старых концептов
   (например, hero-photo.png на 4,5 МБ) — в прод они не нужны. */
const usedFiles = (dir, ext, sources) => {
  const names = new Set();
  for (const name of readdirSync(join(root, dir))) {
    if (!ext.some(e => name.endsWith(e))) continue;
    if (sources.some(src => src.includes(name))) names.add(name);
  }
  return names;
};
const pageSources = [read('site/index.html'), read('site/styles.css'), read('site/app.js'),
                     read('concepts/mobile/e-figma.html'), read('concepts/mobile/_shared/base.css'),
                     read('concepts/mobile/_shared/content.js'), read('concepts/mobile/_shared/blocks.js')];
for (const name of usedFiles('site/assets/figma', ['.png', '.svg'], pageSources)) {
  copy(`site/assets/figma/${name}`, `assets/figma/${name}`);
}
copy('site/assets/figma/business', 'assets/figma/business');   // пути строятся в рантайме
for (const name of usedFiles('site/fonts', ['.ttf'], pageSources)) {
  copy(`site/fonts/${name}`, `fonts/${name}`);
}
write('.nojekyll', '');

/* 2 · /mobile/_shared/ — стили, контент и поведение мобильной версии (их грузит m.html) */
write('mobile/_shared/base.css', read('concepts/mobile/_shared/base.css')
  .replaceAll('../../../site/fonts/', '../../fonts/'));
copy('concepts/mobile/_shared/content.js', 'mobile/_shared/content.js');
copy('concepts/mobile/_shared/blocks.js', 'mobile/_shared/blocks.js');

console.log('Собрано в', dest);

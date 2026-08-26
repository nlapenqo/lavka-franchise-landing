// Собирает единственный финальный файл lavka-franchise-offline.html:
// веб-версия (site/) + мобильная сборка E (concepts/mobile/) в одном документе.
// ≥768px работает веб-разметка, <768px поверх неё монтируется iframe с мобильной
// версией (srcdoc). Всё самодостаточно: шрифты, картинки и скрипты зашиты base64.
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const site = join(root, 'site');
const output = join(root, 'lavka-franchise-offline.html');

const mime = {
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ttf': 'font/ttf'
};

// Пути вида ./fonts/… и ./assets/… собираются из самих исходников:
// список не ведём руками, поэтому он не устаревает при правках сборки.
const collectAssetPaths = sources => {
  const paths = new Set();
  const reference = /\.\/((?:fonts|assets)\/[^"'()]+?\.(?:svg|png|ttf))/g;
  for (const source of sources) {
    for (const match of source.matchAll(reference)) paths.add(match[1]);
  }
  return [...paths];
};

const toDataUri = relative => {
  const file = join(site, relative);
  const extension = relative.slice(relative.lastIndexOf('.'));
  return `data:${mime[extension]};base64,${readFileSync(file).toString('base64')}`;
};

/* ---------- веб-версия (site/) ---------- */
const css = readFileSync(join(site, 'styles.css'), 'utf8');
const js = readFileSync(join(site, 'app.js'), 'utf8');
let html = readFileSync(join(site, 'index.html'), 'utf8');

/* ---------- мобильная версия (сборка E) ----------
   Пути приводим к виду ./assets|./fonts — тогда их видит общий сборщик,
   а _shared-стили и скрипты зашиваются в документ прямо здесь. */
const baseCss = readFileSync(join(root, 'concepts/mobile/_shared/base.css'), 'utf8')
  .replaceAll('../../../site/fonts/', './fonts/');
const contentJs = readFileSync(join(root, 'concepts/mobile/_shared/content.js'), 'utf8');
const blocksJs = readFileSync(join(root, 'concepts/mobile/_shared/blocks.js'), 'utf8');
let mobile = readFileSync(join(root, 'concepts/mobile/e-figma.html'), 'utf8')
  .replaceAll('../../site/assets/', './assets/')
  .replace('<title>Мобилка E — Одна сущность · Франшиза Яндекс Лавки</title>',
           '<title>Франшиза Яндекс Лавки</title>')
  .replace('<link rel="stylesheet" href="./_shared/base.css">', () => `<style>\n${baseCss}\n</style>`)
  .replace('<script src="./_shared/content.js"></script>', () => `<script>\n${contentJs}\n</script>`)
  .replace('<script src="./_shared/blocks.js"></script>', () => `<script>\n${blocksJs}\n</script>`);

/* Мобильный скрипт собирает часть путей в рантайме (медиа-логотипы, карточки
   бизнеса) — такие файлы зашиваем картой data-URI и подменяем после рендера. */
const dynamicPaths = new Set(['assets/figma/business/orbit.svg']);
for (const match of contentJs.matchAll(/src: '([^']+?\.(?:svg|png))'/g)) dynamicPaths.add(`assets/figma/${match[1]}`);
for (const match of contentJs.matchAll(/img: '([\w-]+)'/g)) dynamicPaths.add(`assets/figma/business/${match[1]}.png`);
const dynamicMap = Object.fromEntries([...dynamicPaths].map(relative => [relative, toDataUri(relative)]));
mobile = mobile.replace('</body>', () => `<script>
/* Офлайн-файл: подставляем зашитые data-URI вместо путей, собранных в рантайме */
(() => {
  const map = ${JSON.stringify(dynamicMap)};
  document.querySelectorAll('img[src^="./assets/"]').forEach(img => {
    const key = img.getAttribute('src').slice(2);
    if (map[key]) img.src = map[key];
  });
})();
</script>
</body>`);

const inlined = new Map(collectAssetPaths([css, html, mobile]).map(relative => [relative, toDataUri(relative)]));
const replaceAssets = source => {
  let result = source;
  for (const [relative, dataUri] of inlined) {
    result = result.split(`./${relative}`).join(dataUri);
  }
  return result;
};

mobile = replaceAssets(mobile);
html = html.replace('<link rel="stylesheet" href="./styles.css">', () => `<style data-offline-css>\n${replaceAssets(css)}\n</style>`);
html = html.replace('<script src="./app.js"></script>', () => `<script data-offline-app>\n${js}\n</script>`);
html = replaceAssets(html);

/* Экраны уже 768px: прячем веб-разметку и монтируем мобильную сборку в iframe.
   Замена </ на <\/ внутри JSON-строки не даёт вложенным тегам закрыть <script>. */
const mobileSrc = JSON.stringify(mobile).replace(/<\//g, '<\\/');
html = html.replace('</body>', () => `
<div id="m-shell"></div>
<style>
#m-shell{display:none}
@media (max-width:767px){
  body>*:not(#m-shell){display:none!important}
  #m-shell{display:block;position:fixed;inset:0;background:#1b3a6a}
  #m-shell iframe{display:block;width:100%;height:100%;border:0}
}
</style>
<script>
(() => {
  const shell = document.getElementById('m-shell');
  const narrow = matchMedia('(max-width: 767px)');
  const mount = () => {
    if (!narrow.matches || shell.firstChild) return;
    const frame = document.createElement('iframe');
    frame.title = 'Франшиза Яндекс Лавки — мобильная версия';
    frame.srcdoc = ${mobileSrc};
    shell.append(frame);
  };
  mount();
  narrow.addEventListener ? narrow.addEventListener('change', mount) : narrow.addListener(mount);
  addEventListener('resize', mount);
})();
</script>
</body>`);
html = html.replace('<head>', '<head>\n  <!-- Standalone offline build: web + mobile in one file, all local styles, scripts, fonts and media are embedded. -->');
writeFileSync(output, html);
console.log(`Inlined ${inlined.size} shared assets + ${dynamicPaths.size} runtime assets`);
console.log(`Wrote ${output} (${Buffer.byteLength(html)} bytes)`);

// Собирает адаптивную версию (adaptive/) в один самодостаточный HTML — две сборки:
//   export/lavka-adaptive.html      — шрифты и картинки зашиты base64 (любой хостинг, показ, пересылка)
//   export/lavka-adaptive-lpc.html  — для конструктора LPC: он вырезает зашитые шрифты,
//                                     поэтому YS Geo подключён ссылками на yastatic.net
//                                     и стоит защита от переопределения платформенными стилями
// Использование: node tools/build-adaptive.mjs
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const src = join(root, 'adaptive');
const site = join(root, 'site');           // ассеты и шрифты общие с веб-версией
const outDir = join(root, 'export');
mkdirSync(outDir, { recursive: true });

const mime = { '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp', '.ttf': 'font/ttf', '.woff2': 'font/woff2' };
const toDataUri = relative => {
  const extension = relative.slice(relative.lastIndexOf('.'));
  return `data:${mime[extension]};base64,${readFileSync(join(site, relative)).toString('base64')}`;
};
const collectAssetPaths = sources => {
  const paths = new Set();
  const reference = /\.\/((?:fonts|assets)\/[^"'()]+?\.(?:svg|png|webp|ttf|woff2))/g;
  for (const source of sources) for (const match of source.matchAll(reference)) paths.add(match[1]);
  return [...paths];
};

const css = readFileSync(join(src, 'styles.css'), 'utf8');
const mobileCss = readFileSync(join(src, 'mobile.css'), 'utf8');
const js = readFileSync(join(src, 'app.js'), 'utf8');
const html = readFileSync(join(src, 'index.html'), 'utf8');

const inlined = new Map(collectAssetPaths([css, mobileCss, html]).map(relative => [relative, toDataUri(relative)]));
const replaceAssets = source => {
  let result = source;
  for (const [relative, dataUri] of inlined) result = result.split(`./${relative}`).join(dataUri);
  return result;
};

const assemble = (styles, note) => {
  let page = html
    .replace('<link rel="stylesheet" href="./styles.css">', () => `<style data-offline-css>\n${styles}\n</style>`)
    .replace('\n  <link rel="stylesheet" href="./mobile.css">', '')
    .replace('<script src="./app.js"></script>', () => `<script data-offline-app>\n${js}\n</script>`);
  page = replaceAssets(page);
  return page.replace('<head>', `<head>\n  <!-- ${note} -->`);
};

/* 1 · всё зашито */
const full = assemble(replaceAssets(css + '\n' + mobileCss),
  'Adaptive standalone build: one document for every screen, all styles, scripts, fonts and media are embedded.');
writeFileSync(join(outDir, 'lavka-adaptive.html'), full);

/* 2 · LPC: шрифты со своего CDN Яндекса (веса 400/500/900; 800 → black), каскад защищён */
const YS = 'https://yastatic.net/s3/home/fonts/ys/4/';
const geoFile = { 400: 'text-geo-regular.woff2', 500: 'text-geo-medium.woff2', 800: 'text-geo-black.woff2', 900: 'text-geo-black.woff2' };
const lpcCss = (css + '\n' + mobileCss)
  .replace(/@font-face\{font-family:'YS Geo';src:url\('\.\/fonts\/[^']+'\) format\('woff2'\);font-weight:(\d+);font-display:swap\}/g,
    (m, w) => `@font-face{font-family:'YS Geo';src:url('${YS}${geoFile[w]}') format('woff2');font-weight:${w};font-display:swap}`)
  .replace(/@font-face\{font-family:'YS Text Cond';src:url\('\.\/fonts\/[^']+'\) format\('woff2'\);font-weight:300;font-display:swap\}/,
    "@font-face{font-family:'YS Text Cond';src:local('YS Text');font-weight:300;font-display:swap}")
  + `\n/* LPC: платформа Турбо-страниц перебивает font-family — возвращаем фирменный шрифт */
body, body :where(*):not(.footer__legal){font-family:'YS Geo','YS Text',Arial,sans-serif !important}
.footer__legal{font-family:'YS Text','YS Geo',Arial,sans-serif !important}\n`;
const lpc = assemble(replaceAssets(lpcCss),
  'Adaptive build for LPC: fonts are linked from yastatic.net (the platform strips embedded fonts), images embedded.');
writeFileSync(join(outDir, 'lavka-adaptive-lpc.html'), lpc);

const mb = s => (Buffer.byteLength(s) / 1048576).toFixed(1);
console.log(`Inlined ${inlined.size} assets`);
console.log(`export/lavka-adaptive.html      ${mb(full)} МБ`);
console.log(`export/lavka-adaptive-lpc.html  ${mb(lpc)} МБ`);

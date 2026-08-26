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

const css = readFileSync(join(site, 'styles.css'), 'utf8');
const js = readFileSync(join(site, 'app.js'), 'utf8');
let html = readFileSync(join(site, 'index.html'), 'utf8');

const inlined = new Map(collectAssetPaths([css, html]).map(relative => [relative, toDataUri(relative)]));
const replaceAssets = source => {
  let result = source;
  for (const [relative, dataUri] of inlined) {
    result = result.split(`./${relative}`).join(dataUri);
  }
  return result;
};

html = html.replace('<link rel="stylesheet" href="./styles.css">', `<style data-offline-css>\n${replaceAssets(css)}\n</style>`);
html = html.replace('<script src="./app.js"></script>', `<script data-offline-app>\n${js}\n</script>`);
html = replaceAssets(html);
html = html.replace('<head>', '<head>\n  <!-- Standalone offline build: all local styles, scripts, fonts and media are embedded. -->');
writeFileSync(output, html);
console.log(`Inlined ${inlined.size} assets`);
console.log(`Wrote ${output} (${Buffer.byteLength(html)} bytes)`);

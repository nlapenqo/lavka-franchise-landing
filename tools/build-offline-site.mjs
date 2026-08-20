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

const assetPaths = [
  'fonts/YS Geo-Regular.ttf',
  'fonts/YS Geo-Medium.ttf',
  'fonts/YS Geo-Heavy.ttf',
  'fonts/YS Geo-Black.ttf',
  'fonts/YS Text Cond-Light.ttf',
  'assets/figma/arrow-left.svg',
  'assets/figma/arrow-right.svg',
  'assets/figma/arrow.svg',
  'assets/figma/business/arrow-left.svg',
  'assets/figma/business/arrow-right.svg',
  'assets/figma/business/orbit.svg',
  'assets/figma/business/service.png',
  'assets/figma/darkstore-glow-a.svg',
  'assets/figma/darkstore-glow-b.svg',
  'assets/figma/darkstore-map.png',
  'assets/figma/hero-photo.png',
  'assets/figma/info.svg',
  'assets/figma/logo-footer-word-1.svg',
  'assets/figma/logo-footer-word-2.svg',
  'assets/figma/logo-footer.svg',
  'assets/figma/logo-main.svg',
  'assets/figma/logo-word-1.svg',
  'assets/figma/logo-word-2.svg',
  'assets/figma/media-forbes.svg',
  'assets/figma/media-mark.svg',
  'assets/figma/media-rbc.svg',
  'assets/figma/media-rbk.svg',
  'assets/figma/orbit-card.svg',
  'assets/figma/orbit-large.svg',
  'assets/figma/orbit-small.svg',
  'assets/figma/orbit-steps.svg',
  'assets/figma/telegram-plane.svg',
  'assets/figma/telegram.svg'
];

const toDataUri = relative => {
  const file = join(site, relative);
  const extension = relative.slice(relative.lastIndexOf('.'));
  return `data:${mime[extension]};base64,${readFileSync(file).toString('base64')}`;
};

const inlined = new Map(assetPaths.map(relative => [relative, toDataUri(relative)]));
const replaceAssets = source => {
  let result = source;
  for (const [relative, dataUri] of inlined) {
    result = result.split(`./${relative}`).join(dataUri);
  }
  return result;
};

const css = replaceAssets(readFileSync(join(site, 'styles.css'), 'utf8'));
const js = readFileSync(join(site, 'app.js'), 'utf8');
let html = readFileSync(join(site, 'index.html'), 'utf8');
html = html.replace('<link rel="stylesheet" href="./styles.css">', `<style data-offline-css>\n${css}\n</style>`);
html = html.replace('<script src="./app.js"></script>', `<script data-offline-app>\n${js}\n</script>`);
html = replaceAssets(html);
html = html.replace('<head>', '<head>\n  <!-- Standalone offline build: all local styles, scripts, fonts and media are embedded. -->');
writeFileSync(output, html);
console.log(`Wrote ${output} (${Buffer.byteLength(html)} bytes)`);

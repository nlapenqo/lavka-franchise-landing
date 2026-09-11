// Собирает страницу на блоках в один файл: стили, скрипт, шрифты и картинки внутри.
//   node blocks/build.mjs                                   → blocks/preview.html (витрина)
//   node blocks/build.mjs out.html --artifact               → без html/head/body для claude.ai
//   node blocks/build.mjs --in breakfast-meeting/index.html breakfast-meeting/preview.html
//                                                           → любой лендинг на блоках; пути в нём — относительно самого файла
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const here = dirname(fileURLToPath(import.meta.url));
const argv = process.argv.slice(2);
const flag = k => { const i = argv.indexOf('--' + k); return i > -1 ? argv[i + 1] : null; };
const artifact = argv.includes('--artifact');
const input = resolve(flag('in') || join(here, 'index.html'));
const root = dirname(input);
const args = argv.filter((a, i) => !a.startsWith('--') && argv[i - 1] !== '--in');
const out = resolve(args[0] ? process.cwd() : root, args[0] || (artifact ? 'artifact.html' : 'preview.html'));
const MIME = { svg: 'image/svg+xml', png: 'image/png', webp: 'image/webp', jpg: 'image/jpeg', woff2: 'font/woff2' };
const cache = new Map();
const data = abs => { if (!cache.has(abs)) cache.set(abs, `data:${MIME[abs.split('.').pop()]};base64,${readFileSync(abs).toString('base64')}`); return cache.get(abs); };
const ASSET = /^\.{1,2}\/.+\.(svg|png|webp|jpg|woff2)$/;
// относительные пути к ассетам: в разметке (src/href) и в css (url()); base — папка файла, где путь написан
const inline = (t, base) => t
  .replace(/(src|href)="([^"]+)"/g, (m, a, p) => ASSET.test(p) ? `${a}="${data(resolve(base, p))}"` : m)
  .replace(/url\('?([^')]+)'?\)/g, (m, p) => ASSET.test(p) ? `url(${data(resolve(base, p))})` : m);
let page = readFileSync(input, 'utf8');
page = page.replace(/<link rel="stylesheet" href="((?:\.{1,2}\/)[^"]+\.css)">/g, (_, f) => { const abs = resolve(root, f); return `<style data-file="${f.split('/').pop()}">\n${inline(readFileSync(abs, 'utf8'), dirname(abs))}\n</style>`; });
page = page.replace(/<script src="((?:\.{1,2}\/)[^"]+\.js)"><\/script>/g, (_, f) => `<script data-file="${f.split('/').pop()}">\n${readFileSync(resolve(root, f), 'utf8').replace(/<\/script>/g, '<\\/script>')}\n</script>`);
page = inline(page, root);
if (artifact) {
  const head = page.match(/<head>([\s\S]*?)<\/head>/)[1].replace(/<meta[^>]*>|<link[^>]*>/g, '').trim();
  const body = page.match(/<body[^>]*>([\s\S]*?)<\/body>/)[1].trim();
  page = `${head}\n${body}\n`;
}
writeFileSync(out, page);
console.log(`${out.replace(process.cwd() + '/', '')}: ${(Buffer.byteLength(page) / 1048576).toFixed(2)} МБ, ассетов ${cache.size}`);

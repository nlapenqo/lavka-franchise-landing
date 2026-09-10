// tokens.json (DTCG) → blocks/tokens.css: CSS custom properties, десктоп в :root,
// планшет и телефон — из $extensions.lavka.responsive.  node design-system/build-tokens.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const tokens = JSON.parse(readFileSync(join(here, 'tokens.json'), 'utf8'));

/* имя переменной из пути токена: короткие прод-имена для цветов, префиксы для остального */
const name = path => {
  const p = path.split('.');
  const map = {
    color: p => p[1] === 'alpha' ? p[2] : p[1],
    text: p => 'text-' + p[1], bg: p => 'bg-' + p[1], surface: p => 'surface-' + p[1],
    border: p => p[1] === 'default' ? 'border' : 'border-' + p[1], action: p => 'action-' + p[1],
    font: p => ({ size: 'fs', weight: 'fw', 'line-height': 'lh', 'letter-spacing': 'ls', family: 'font' })[p[1]] + '-' + p[2],
    radius: p => 'radius-' + p[1], space: p => 'space-' + p[1], layout: p => p[1],
    shadow: p => 'shadow-' + p[1],
    motion: p => p[1] === 'easing' ? (p[2] === 'default' ? 'ease' : 'ease-' + p[2]) : p[1] === 'duration' ? 'dur-' + p[2] : p[1]
  };
  return '--' + map[p[0]](p);
};
const ref = v => typeof v === 'string' ? v.replace(/\{([^}]+)\}/g, (_, r) => `var(${name(r)})`) : v;
const value = (t, path) => {
  const v = t.$value, type = t.$type;
  if (type === 'shadow') return `${v.offsetX} ${v.offsetY} ${v.blur} ${v.spread} ${ref(v.color)}`;
  if (type === 'cubicBezier') return `cubic-bezier(${v.join(',')})`;
  if (type === 'fontFamily') return v.map(f => /\s/.test(f) ? `'${f}'` : f).join(',');
  if (type === 'typography') return null;
  return ref(v);
};

const root = [], tablet = [], mobile = [];
const walk = (node, path, type) => {
  for (const [k, v] of Object.entries(node)) {
    if (k.startsWith('$')) continue;
    const p = path ? `${path}.${k}` : k;
    const t = v.$type || type;
    if (v && typeof v === 'object' && '$value' in v) {
      const val = value({ ...v, $type: t }, p);
      if (val == null) continue;
      root.push(`${name(p)}:${val}`);
      const r = v.$extensions?.['lavka.responsive'];
      if (r?.tablet) tablet.push(`${name(p)}:${r.tablet}`);
      if (r?.mobile) mobile.push(`${name(p)}:${r.mobile}`);
    } else if (v && typeof v === 'object') walk(v, p, t);
  }
};
walk(tokens, '', null);

const css = `/* Сгенерировано из design-system/tokens.json — не править руками. node design-system/build-tokens.mjs */
:root{${root.join(';')};--section:var(--space-10)}
@media (max-width:1100px){:root{${tablet.join(';')};--section:88px}}
@media (max-width:767px){:root{${mobile.join(';')};--section:var(--space-8)}}
`;
const out = join(here, '..', 'blocks', 'tokens.css');
writeFileSync(out, css);
console.log(`blocks/tokens.css: ${root.length} переменных, планшет ${tablet.length}, телефон ${mobile.length}`);

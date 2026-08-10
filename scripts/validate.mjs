import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const htmlPath = resolve(root, 'index.html');
const html = readFileSync(htmlPath, 'utf8');
const errors = [];

function fail(message) {
  errors.push(message);
}

// Duplicate IDs
const ids = [...html.matchAll(/\sid=["']([^"']+)["']/g)].map(match => match[1]);
const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
[...new Set(duplicates)].forEach(id => fail(`ID duplicado: #${id}`));

// Internal anchors
const anchors = [...html.matchAll(/href=["']#([^"']+)["']/g)].map(match => match[1]);
anchors.forEach(anchor => {
  if (!ids.includes(anchor)) fail(`Ancla sin destino: #${anchor}`);
});

// Local href/src references
const refs = [...html.matchAll(/(?:href|src)=["']([^"']+)["']/g)].map(match => match[1]);
const localRefs = refs.filter(ref =>
  ref &&
  !ref.startsWith('#') &&
  !ref.startsWith('http://') &&
  !ref.startsWith('https://') &&
  !ref.startsWith('mailto:') &&
  !ref.startsWith('tel:') &&
  !ref.startsWith('data:') &&
  !ref.startsWith('javascript:')
);

localRefs.forEach(ref => {
  const clean = ref.split('?')[0].split('#')[0];
  if (!clean) return;
  const path = resolve(root, clean.replace(/^\.\//, ''));
  if (!existsSync(path)) fail(`Archivo local inexistente: ${ref}`);
});

// Essential metadata
const requiredSnippets = [
  '<meta name="viewport"',
  '<meta name="description"',
  '<title>',
  'lang="es"',
  'aria-label=',
  'assets/mirmc-shield.svg',
  'script.js',
  'styles.css'
];
requiredSnippets.forEach(snippet => {
  if (!html.includes(snippet)) fail(`Falta requisito HTML: ${snippet}`);
});

if (errors.length) {
  console.error('\nValidación fallida:\n');
  errors.forEach(error => console.error(` - ${error}`));
  process.exit(1);
}

console.log(`Validación correcta: ${ids.length} IDs, ${anchors.length} anclas y ${localRefs.length} recursos locales revisados.`);

import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const errors = [];
const fail = m => errors.push(m);

['settings.html','settings.css','settings.js','sw.js','manifest.webmanifest'].forEach(file => {
  if (!existsSync(resolve(root,file))) fail(`Falta archivo V6: ${file}`);
});

const settings = readFileSync(resolve(root,'settings.js'),'utf8');
[
  'mirmc-guerra-espiritual-guardia-v1',
  'mirmc-guerra-espiritual-course-v1',
  'mirmc-guerra-espiritual-assessments-v1',
  'mirmc-guerra-espiritual-certificate-name-v1'
].forEach(key => { if (!settings.includes(key)) fail(`Respaldo no contempla la clave ${key}`); });
if (!settings.includes("version:1")) fail('El respaldo no declara versión de esquema');
if (!settings.includes('application/json')) fail('La exportación no genera JSON');

const sw = readFileSync(resolve(root,'sw.js'),'utf8');
const refs = [...sw.matchAll(/'\.\/([^']+)'/g)].map(match => match[1]).filter(ref => ref && ref !== '');
refs.forEach(ref => {
  if (!existsSync(resolve(root,ref))) fail(`Service worker referencia archivo inexistente: ${ref}`);
});
if (!sw.includes("event.request.mode === 'navigate'")) fail('Service worker no define estrategia de navegación');
if (!sw.includes('caches.open')) fail('Service worker no inicializa caché');

const manifest = JSON.parse(readFileSync(resolve(root,'manifest.webmanifest'),'utf8'));
if (manifest.display !== 'standalone') fail('Manifest debe usar display standalone');
if (!manifest.start_url) fail('Manifest sin start_url');
if (!Array.isArray(manifest.icons) || !manifest.icons.length) fail('Manifest sin iconos');

const enhancements = readFileSync(resolve(root,'course-enhancements.js'),'utf8');
if (!enhancements.includes("navigator.serviceWorker.register('sw.js')")) fail('Home no registra service worker');
if (!enhancements.includes('settings.html')) fail('Ruta MIRMC no enlaza Mis datos / respaldo');

if (errors.length) {
  console.error('\nValidación V6 fallida:\n');
  errors.forEach(error => console.error(` - ${error}`));
  process.exit(1);
}
console.log(`Validación V6 correcta: respaldo local, manifest y ${refs.length} recursos offline revisados.`);
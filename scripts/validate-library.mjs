import { readFileSync, existsSync } from 'node:fs';
import vm from 'node:vm';

const requiredFiles = ['resource-data.js','library.html','library.css','library.js','resource.html','resource.js'];
const errors = [];
const fail = message => errors.push(message);

requiredFiles.forEach(file => { if (!existsSync(file)) fail(`Falta archivo de biblioteca: ${file}`); });

if (existsSync('resource-data.js')) {
  const source = readFileSync('resource-data.js','utf8');
  const sandbox = { window: {} };
  vm.runInNewContext(source, sandbox);
  const lib = sandbox.window.MIRMC_LIBRARY;
  if (!lib) fail('resource-data.js no expone window.MIRMC_LIBRARY');
  else {
    if (!Array.isArray(lib.categories) || lib.categories.length < 1) fail('No hay categorías válidas');
    if (!Array.isArray(lib.resources) || lib.resources.length < 1) fail('No hay recursos válidos');
    const catIds = new Set((lib.categories || []).map(c => c.id));
    const ids = new Set();
    (lib.resources || []).forEach((r,index) => {
      const label = r.id || `#${index+1}`;
      if (!r.id || !r.title || !r.summary || !r.category) fail(`Recurso incompleto: ${label}`);
      if (ids.has(r.id)) fail(`ID de recurso duplicado: ${r.id}`);
      ids.add(r.id);
      if (!catIds.has(r.category)) fail(`Categoría inexistente en ${label}: ${r.category}`);
      if (![1,2,3].includes(r.level)) fail(`Nivel inválido en ${label}: ${r.level}`);
      if (!Array.isArray(r.sections) || r.sections.length < 2) fail(`Recurso sin desarrollo suficiente: ${label}`);
      if (!Array.isArray(r.scriptures) || r.scriptures.length < 1) fail(`Recurso sin base bíblica: ${label}`);
      if (!r.takeaway) fail(`Recurso sin idea para retener: ${label}`);
    });
    if ((lib.resources || []).length < 12) fail('La V4 debe iniciar con al menos 12 recursos');
  }
}

['library.html','resource.html'].forEach(file => {
  if (!existsSync(file)) return;
  const html = readFileSync(file,'utf8');
  for (const ref of [...html.matchAll(/(?:href|src)=["']([^"']+)["']/g)].map(m => m[1])) {
    if (!ref || ref.startsWith('#') || /^https?:/.test(ref) || ref.startsWith('mailto:') || ref.startsWith('tel:')) continue;
    const clean = ref.split('?')[0].split('#')[0];
    if (clean && !existsSync(clean)) fail(`${file}: referencia local inexistente ${ref}`);
  }
});

if (errors.length) {
  console.error('\nValidación de Biblioteca MIRMC fallida:\n');
  errors.forEach(error => console.error(` - ${error}`));
  process.exit(1);
}
console.log('Biblioteca MIRMC válida: estructura, recursos, categorías y referencias revisadas.');

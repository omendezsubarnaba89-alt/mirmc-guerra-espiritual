import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const errors = [];
const fail = message => errors.push(message);

for (const file of ['course-data.js','course-progress.js','course-enhancements.js','lesson.html','lesson.css','lesson.js','course-index.css']) {
  if (!existsSync(resolve(root, file))) fail(`Falta archivo del curso: ${file}`);
}

const context = { window: {} };
vm.createContext(context);
vm.runInContext(readFileSync(resolve(root, 'course-data.js'), 'utf8'), context);
const data = context.window.MIRMC_COURSE_DATA;

if (!data?.lessons || !data?.levels) fail('course-data.js no expone MIRMC_COURSE_DATA válido.');

if (data) {
  const ids = Object.keys(data.lessons).sort((a,b) => Number(a)-Number(b));
  if (ids.length !== 15) fail(`Se esperaban 15 lecciones y hay ${ids.length}.`);
  const expected = Array.from({length:15},(_,i) => String(i+1).padStart(2,'0'));
  if (ids.join(',') !== expected.join(',')) fail(`Numeración de lecciones inválida: ${ids.join(', ')}`);

  const listed = [];
  for (const [level, info] of Object.entries(data.levels)) {
    if (!Array.isArray(info.lessons) || info.lessons.length !== 5) fail(`Nivel ${level} debe tener 5 lecciones.`);
    listed.push(...(info.lessons || []));
    for (const id of info.lessons || []) {
      if (!data.lessons[id]) fail(`Nivel ${level} referencia lección inexistente ${id}.`);
      else if (String(data.lessons[id].level) !== String(level)) fail(`Lección ${id} declara nivel ${data.lessons[id].level}, esperado ${level}.`);
    }
  }
  if (new Set(listed).size !== 15) fail('Hay lecciones duplicadas o ausentes en los niveles.');

  for (const id of ids) {
    const lesson = data.lessons[id];
    for (const key of ['title','subtitle','objective','core','practice','reflection','duration']) {
      if (!lesson[key] || typeof lesson[key] !== 'string') fail(`Lección ${id}: falta ${key}.`);
    }
    if (!Array.isArray(lesson.scriptures) || lesson.scriptures.length < 2) fail(`Lección ${id}: base bíblica insuficiente.`);
    if (!Array.isArray(lesson.sections) || lesson.sections.length < 3) fail(`Lección ${id}: requiere al menos 3 secciones.`);
    if (!Array.isArray(lesson.keyPoints) || lesson.keyPoints.length !== 3) fail(`Lección ${id}: debe tener 3 puntos clave.`);
    if (!Array.isArray(lesson.quiz) || lesson.quiz.length !== 3) fail(`Lección ${id}: debe tener 3 preguntas de evaluación.`);
    for (const [qi, q] of (lesson.quiz || []).entries()) {
      if (!q.q || !Array.isArray(q.options) || q.options.length < 3) fail(`Lección ${id}, pregunta ${qi+1}: estructura inválida.`);
      if (!Number.isInteger(q.answer) || q.answer < 0 || q.answer >= (q.options?.length || 0)) fail(`Lección ${id}, pregunta ${qi+1}: respuesta correcta inválida.`);
    }
  }
}

const lessonHtml = readFileSync(resolve(root, 'lesson.html'), 'utf8');
for (const ref of ['styles.css','lesson.css','course-data.js','course-progress.js','lesson.js','assets/mirmc-shield.svg']) {
  if (!lessonHtml.includes(ref)) fail(`lesson.html no referencia ${ref}.`);
}

const indexHtml = readFileSync(resolve(root, 'index.html'), 'utf8');
for (const ref of ['course-index.css','course-data.js','course-progress.js','course-enhancements.js']) {
  if (!indexHtml.includes(ref)) fail(`index.html no integra ${ref}.`);
}

if (errors.length) {
  console.error('\nValidación del curso fallida:\n');
  errors.forEach(error => console.error(` - ${error}`));
  process.exit(1);
}

console.log('Curso validado: 3 niveles, 15 lecciones, evaluaciones, navegación y assets integrados.');
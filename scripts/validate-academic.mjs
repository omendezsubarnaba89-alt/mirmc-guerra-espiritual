import { readFileSync, existsSync } from 'node:fs';
import vm from 'node:vm';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const errors = [];
const fail = m => errors.push(m);

const required = ['assessment.html','assessment.css','assessment.js','assessment-data.js','assessment-progress.js','academic.html','academic.css','academic.js','certificate.html','certificate.css','certificate.js'];
required.forEach(file => { if (!existsSync(resolve(root,file))) fail(`Falta archivo académico: ${file}`); });

const sandbox = { window:{} };
vm.createContext(sandbox);
vm.runInContext(readFileSync(resolve(root,'assessment-data.js'),'utf8'), sandbox);
const data = sandbox.window.MIRMC_ASSESSMENTS;
if (!data) fail('assessment-data.js no expone MIRMC_ASSESSMENTS');
else {
  [1,2,3].forEach(level => {
    const exam = data[level];
    if (!exam) return fail(`Falta evaluación del Nivel ${level}`);
    if (exam.pass !== 80) fail(`Nivel ${level}: umbral esperado 80%`);
    if (!Array.isArray(exam.questions) || exam.questions.length !== 10) fail(`Nivel ${level}: debe tener exactamente 10 preguntas`);
    exam.questions?.forEach((q,index) => {
      if (!q.q || !Array.isArray(q.options) || q.options.length !== 4) fail(`Nivel ${level}, pregunta ${index+1}: estructura inválida`);
      if (!Number.isInteger(q.answer) || q.answer < 0 || q.answer >= q.options.length) fail(`Nivel ${level}, pregunta ${index+1}: respuesta fuera de rango`);
    });
  });
}

const courseProgress = readFileSync(resolve(root,'course-progress.js'),'utf8');
if (!courseProgress.includes("normalized === '06'") || !courseProgress.includes('examPassed(1)')) fail('Falta gate académico Nivel 1 → Nivel 2');
if (!courseProgress.includes("normalized === '11'") || !courseProgress.includes('examPassed(2)')) fail('Falta gate académico Nivel 2 → Nivel 3');

const lesson = readFileSync(resolve(root,'lesson.js'),'utf8');
['assessment.html?level=1','assessment.html?level=2','assessment.html?level=3'].forEach(ref => { if (!lesson.includes(ref)) fail(`lesson.js no enlaza ${ref}`); });

const certificate = readFileSync(resolve(root,'certificate.js'),'utf8');
if (!certificate.includes('[1,2,3].every')) fail('Certificado no verifica los tres exámenes');
if (!certificate.includes('progress?.stats().completed')) fail('Certificado no verifica finalización de lecciones');

if (errors.length) {
  console.error('\nValidación académica fallida:\n');
  errors.forEach(error => console.error(` - ${error}`));
  process.exit(1);
}
console.log('Validación académica correcta: 3 exámenes, 30 preguntas, gates de nivel, expediente y certificado revisados.');
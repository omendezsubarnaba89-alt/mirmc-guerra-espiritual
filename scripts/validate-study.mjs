import fs from 'node:fs';

const required = ['study.html','study.css','study.js','study-data.js','study-tools.js','study-tools.css'];
const missing = required.filter(file => !fs.existsSync(file));
if (missing.length) throw new Error(`Study files missing: ${missing.join(', ')}`);

const lesson = fs.readFileSync('lesson.html','utf8');
const resource = fs.readFileSync('resource.html','utf8');
for (const ref of ['study-data.js','study-tools.js','study-tools.css']) {
  if (!lesson.includes(ref)) throw new Error(`lesson.html missing study integration: ${ref}`);
  if (!resource.includes(ref)) throw new Error(`resource.html missing study integration: ${ref}`);
}

const data = fs.readFileSync('study-data.js','utf8');
for (const marker of ['mirmc-guerra-espiritual-study-v1','bookmarks','notes','history']) {
  if (!data.includes(marker)) throw new Error(`study-data.js missing marker: ${marker}`);
}

const settings = fs.readFileSync('settings.js','utf8');
if (!settings.includes('mirmc-guerra-espiritual-study-v1')) throw new Error('Backup does not include study notebook key.');

const cloud = fs.readFileSync('cloud-sync.js','utf8');
if (!cloud.includes("study: 'mirmc-guerra-espiritual-study-v1'")) throw new Error('Cloud sync does not include study notebook key.');
if (!cloud.includes('mergeStudy')) throw new Error('Cloud sync does not define study merge behavior.');

const sw = fs.readFileSync('sw.js','utf8');
for (const ref of ['study.html','study.css','study.js','study-data.js','study-tools.js','study-tools.css']) {
  if (!sw.includes(`./${ref}`)) throw new Error(`Service worker does not cache ${ref}`);
}

const home = fs.readFileSync('course-enhancements.js','utf8');
if (!home.includes('study.html')) throw new Error('Course home does not expose notebook link.');

console.log('Study notebook validation passed.');

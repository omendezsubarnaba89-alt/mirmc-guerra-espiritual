import fs from 'node:fs';

const course=fs.readFileSync('course-progress.js','utf8');
const assessment=fs.readFileSync('assessment-progress.js','utf8');
const recovery=fs.readFileSync('official-recovery.js','utf8');

const candidateNames=['complete','markComplete','completeLesson','setComplete'];
const exposed=candidateNames.filter(name=>new RegExp(`\\b${name}\\b`).test(course));
if(!exposed.length)throw new Error('Recovery API mismatch: course-progress.js exposes none of the supported completion operations.');
if(!/\brecord\b/.test(assessment)||!/\bpassed\b/.test(assessment))throw new Error('Recovery API mismatch: assessment-progress.js must expose record() and passed().');
for(const name of exposed)if(!recovery.includes(`'${name}'`))throw new Error(`Recovery does not recognize current course progress operation: ${name}`);
console.log(`Recovery API compatible. Completion operation(s): ${exposed.join(', ')}`);

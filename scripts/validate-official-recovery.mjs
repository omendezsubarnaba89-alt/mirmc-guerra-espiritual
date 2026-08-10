import fs from 'node:fs';

for(const file of ['official-recovery.html','official-recovery.css','official-recovery.js'])if(!fs.existsSync(file))throw new Error(`Missing recovery file: ${file}`);
const js=fs.readFileSync('official-recovery.js','utf8');
for(const marker of ['official.status()','isComplete','exams.passed','exams.record','mirmc-official-recovery-backup-v1','sync.snapshot','sync.push'])if(!js.includes(marker))throw new Error(`Recovery tool missing: ${marker}`);
if(!js.includes("filter(([id,row])=>row?.passed"))throw new Error('Recovery lessons must originate only from official passed rows.');
if(!js.includes("filter(([level,row])=>row?.passed"))throw new Error('Recovery exams must originate only from official passed rows.');
if(/localStorage\.clear\s*\(|removeItem\s*\(/.test(js))throw new Error('Recovery tool must never clear or delete local progress.');
if(/MIRMC-LOCAL|certificate/.test(js))throw new Error('Recovery tool must not manufacture certificate state.');
console.log('Official progress recovery validation passed.');

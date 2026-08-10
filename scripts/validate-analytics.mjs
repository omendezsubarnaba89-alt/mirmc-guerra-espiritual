import fs from 'node:fs';

const required=['admin-analytics.html','admin-analytics.css','admin-analytics.js','supabase/functions/academic-analytics/index.ts'];
for(const file of required)if(!fs.existsSync(file))throw new Error(`Missing V13 analytics file: ${file}`);

const edge=fs.readFileSync('supabase/functions/academic-analytics/index.ts','utf8');
for(const marker of ['SUPABASE_SERVICE_ROLE_KEY','auth.getUser(token)','user_roles','lesson_validations','exam_validations','exam_attempt_log','certificates',"privacy:'aggregated_only'"])if(!edge.includes(marker))throw new Error(`Analytics Edge missing: ${marker}`);
for(const forbidden of ['study_notes','study-data','favorite','favorites','note_text','notes_text','display_name'])if(edge.toLowerCase().includes(forbidden.toLowerCase()))throw new Error(`Analytics Edge must not query private study content: ${forbidden}`);
if(/return\s+reply\([\s\S]*email\s*:/i.test(edge))throw new Error('Analytics response must not include email fields.');

const browser=fs.readFileSync('admin-analytics.js','utf8');
if(/SUPABASE_SERVICE_ROLE_KEY|sb_secret_/i.test(browser))throw new Error('Analytics browser must not contain server secrets.');
for(const marker of ['academic-analytics','Authorization','access_token','user_roles'])if(!browser.includes(marker))throw new Error(`Analytics browser missing: ${marker}`);

console.log('V13 aggregate analytics privacy validation passed.');

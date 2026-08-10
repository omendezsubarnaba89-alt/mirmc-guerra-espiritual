import fs from 'node:fs';

const required=[
  'academic-official.js','academic-official-ui.css','lesson-official-hook.js',
  'assessment-data.js','assessment.js','assessment.html',
  'certificate-official.js','certificate-official.css','verify-certificate.html','verify-certificate.css','verify-certificate.js',
  'admin-certificates.html','admin-certificates.css','admin-certificates.js',
  'supabase/functions/academic-validation/index.ts','supabase/functions/certificate-management/index.ts',
  'supabase/migrations/20260810214446_add_authoritative_academic_records.sql',
  'supabase/migrations/20260810214845_add_verifiable_certificates.sql',
  'supabase/migrations/20260810214905_add_certificate_audit_log.sql',
  'supabase/migrations/20260810215913_add_official_exam_attempt_log.sql'
];
for(const file of required)if(!fs.existsSync(file))throw new Error(`Missing V12 file: ${file}`);

const browserFiles=['academic-official.js','lesson-official-hook.js','assessment-data.js','assessment.js','certificate-official.js','verify-certificate.js','admin-certificates.js'];
const browser=browserFiles.map(f=>fs.readFileSync(f,'utf8')).join('\n');
if(/SUPABASE_SERVICE_ROLE_KEY|sb_secret_/i.test(browser))throw new Error('V12 browser files must never expose service role or secret keys.');

const assessmentData=fs.readFileSync('assessment-data.js','utf8');
if(/\banswer\s*:/.test(assessmentData))throw new Error('Final exam answer keys must not exist in assessment-data.js.');
const assessmentJs=fs.readFileSync('assessment.js','utf8');
if(/\.answer\b|\[['"]answer['"]\]/.test(assessmentJs))throw new Error('Final exam browser grader must not access answer keys.');
for(const marker of ['submitExam','Calificando en servidor','attempts_remaining'])if(!assessmentJs.includes(marker))throw new Error(`assessment.js missing server-only grading marker: ${marker}`);

const academicEdge=fs.readFileSync('supabase/functions/academic-validation/index.ts','utf8');
for(const marker of ['SUPABASE_SERVICE_ROLE_KEY','EXAM_KEYS','submit_lesson','submit_exam','lesson_validations','exam_validations','exam_attempt_log','MAX_EXAM_ATTEMPTS_24H','content_items','effectiveLessonKey'])if(!academicEdge.includes(marker))throw new Error(`Academic Edge Function missing: ${marker}`);

const certificateEdge=fs.readFileSync('supabase/functions/certificate-management/index.ts','utf8');
for(const marker of ['SUPABASE_SERVICE_ROLE_KEY','lesson_validations','exam_validations','certificate_code','academic_snapshot','admin_list','revoke','reinstate'])if(!certificateEdge.includes(marker))throw new Error(`Certificate Edge Function missing: ${marker}`);

const certMigration=fs.readFileSync('supabase/migrations/20260810214845_add_verifiable_certificates.sql','utf8').toLowerCase();
for(const marker of ['verify_certificate','security invoker','certificate_verify_by_transaction_code','academic_snapshot','status text'])if(!certMigration.includes(marker))throw new Error(`Certificate migration missing: ${marker}`);

const verifyJs=fs.readFileSync('verify-certificate.js','utf8');
for(const marker of ['/rest/v1/rpc/verify_certificate','p_code','MIRMC-GE-','apikey'])if(!verifyJs.includes(marker))throw new Error(`Public verifier missing: ${marker}`);
if(/Authorization\s*:/.test(verifyJs))throw new Error('Public certificate verifier should not require a user JWT.');

const localCertificate=fs.readFileSync('certificate.js','utf8');
if(!localCertificate.includes('MIRMC-LOCAL-'))throw new Error('Local certificate code must remain visibly distinct from verifiable MIRMC-GE codes.');

const lessonHtml=fs.readFileSync('lesson.html','utf8');
for(const marker of ['academic-official.js','lesson-official-hook.js','academic-official-ui.css'])if(!lessonHtml.includes(marker))throw new Error(`lesson.html missing ${marker}`);
const assessmentHtml=fs.readFileSync('assessment.html','utf8');
for(const marker of ['academic-official.js','academic-official-ui.css'])if(!assessmentHtml.includes(marker))throw new Error(`assessment.html missing ${marker}`);
if(assessmentHtml.includes('assessment-official-hook.js'))throw new Error('Deprecated duplicate assessment hook must not be loaded.');

const sw=fs.readFileSync('sw.js','utf8');
for(const marker of ['./academic-official.js','./lesson-official-hook.js','./certificate-official.js','./verify-certificate.html','./verify-certificate.js','./admin-certificates.html','./admin-certificates.js'])if(!sw.includes(marker))throw new Error(`Service worker missing V12 file ${marker}`);

console.log('V12 official academic and certificate validation passed.');

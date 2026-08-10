import fs from 'node:fs';

const mustExist=[
  'academic-official.js','academic-official-summary.js','academic-official-summary.css',
  'assessment-data.js','assessment.js','certificate-official.js','verify-certificate.js','admin-certificates.js',
  'supabase/functions/academic-validation/index.ts','supabase/functions/certificate-management/index.ts','supabase/functions/admin-management/index.ts',
  'supabase/migrations/20260810220631_add_private_academic_answer_bank.sql'
];
for(const f of mustExist)if(!fs.existsSync(f))throw new Error(`V12 hardening: missing ${f}`);

const browserFiles=['academic-official.js','academic-official-summary.js','assessment-data.js','assessment.js','certificate-official.js','verify-certificate.js','admin-certificates.js','admin-user.js','admin.js'];
const browser=browserFiles.map(f=>fs.readFileSync(f,'utf8')).join('\n');
if(/SUPABASE_SERVICE_ROLE_KEY|sb_secret_/i.test(browser))throw new Error('V12 hardening: administrative secrets detected in browser code.');

const questions=fs.readFileSync('assessment-data.js','utf8');
if(/\banswer\s*:/.test(questions))throw new Error('V12 hardening: final answer key leaked through assessment-data.js.');
if((questions.match(/version:\s*2/g)||[]).length!==3)throw new Error('V12 hardening: all three final exams must remain on rotated version 2.');

const academicEdge=fs.readFileSync('supabase/functions/academic-validation/index.ts','utf8');
if(/const\s+EXAM_KEYS\b/.test(academicEdge))throw new Error('V12 hardening: EXAM_KEYS must never be committed in the public Edge Function.');
for(const marker of ['academic_answer_keys','effectiveExamKey','assessment_version_mismatch','exam_attempt_log','MAX_EXAM_ATTEMPTS_24H'])if(!academicEdge.includes(marker))throw new Error(`V12 hardening: academic Edge missing ${marker}`);

const bankSchema=fs.readFileSync('supabase/migrations/20260810220631_add_private_academic_answer_bank.sql','utf8');
if(/array\s*\[[0-9,\s]+\]/i.test(bankSchema))throw new Error('V12 hardening: private answer-key DATA detected in public migration.');
for(const marker of ['revoke all on public.academic_answer_keys from anon, authenticated','academic_answer_keys_deny_browser'])if(!bankSchema.toLowerCase().includes(marker))throw new Error(`V12 hardening: private bank policy missing ${marker}`);

const verifier=fs.readFileSync('verify-certificate.js','utf8');
if(!verifier.includes('/rest/v1/rpc/verify_certificate'))throw new Error('V12 hardening: public verifier must use exact-code RPC.');
if(/Authorization\s*:/.test(verifier))throw new Error('V12 hardening: public certificate verification must not depend on a user JWT.');

const certEdge=fs.readFileSync('supabase/functions/certificate-management/index.ts','utf8');
for(const marker of ['lesson_validations','exam_validations','academic_snapshot','certificate_audit_log','revoke','reinstate'])if(!certEdge.includes(marker))throw new Error(`V12 hardening: certificate Edge missing ${marker}`);

const adminEdge=fs.readFileSync('supabase/functions/admin-management/index.ts','utf8');
for(const marker of ['official_lessons','official_exams','certificate_status','certificate_code'])if(!adminEdge.includes(marker))throw new Error(`V12 hardening: admin dossier missing ${marker}`);

const localCertificate=fs.readFileSync('certificate.js','utf8');
if(!localCertificate.includes('MIRMC-LOCAL-'))throw new Error('V12 hardening: local certificate must remain visibly distinct from MIRMC-GE codes.');

console.log('V12 independent security hardening validation passed.');

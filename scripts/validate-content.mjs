import fs from 'node:fs';

const required = [
  'admin-content.html','admin-content.css','admin-content.js','content-runtime.js',
  'admin-content-audit.html','admin-content-audit.js',
  'admin-preview.html','admin-preview.css','admin-preview.js',
  'admin-versions.html','admin-versions.css','admin-versions.js',
  'supabase/functions/content-management/index.ts',
  'supabase/migrations/20260810211602_add_content_management_core.sql',
  'supabase/migrations/20260810211630_optimize_content_public_read_policy.sql',
  'supabase/migrations/20260810212343_index_content_foreign_keys.sql',
  'supabase/migrations/20260810213039_add_content_version_history.sql'
];
for (const file of required) if (!fs.existsSync(file)) throw new Error(`Missing V11 content file: ${file}`);

const browserFiles = ['admin-content.js','content-runtime.js','admin-preview.js','admin-content-audit.js','admin-versions.js','lesson.html','library.html','resource.html','study.html'];
const browser = browserFiles.map(f=>fs.readFileSync(f,'utf8')).join('\n');
if (/SUPABASE_SERVICE_ROLE_KEY|sb_secret_/i.test(browser)) throw new Error('V11 browser files must never expose administrative secrets.');

const runtime = fs.readFileSync('content-runtime.js','utf8');
for (const marker of ['published_payload','static-fallback','MIRMC_COURSE_DATA','MIRMC_LIBRARY','apikey']) {
  if (!runtime.includes(marker)) throw new Error(`Content runtime missing: ${marker}`);
}
if (/Authorization:\s*`Bearer \$\{config\.supabasePublishableKey\}/.test(runtime)) throw new Error('Publishable key must not be treated as a JWT.');

const edge = fs.readFileSync('supabase/functions/content-management/index.ts','utf8');
for (const marker of ['SUPABASE_SERVICE_ROLE_KEY','auth.getUser(token)','save_draft','super_admin_required','published_payload','content_audit_log','get_item','audit','list_versions','rollback','content_versions','current_version']) {
  if (!edge.includes(marker)) throw new Error(`Content Edge Function missing: ${marker}`);
}

const migration = fs.readFileSync('supabase/migrations/20260810211602_add_content_management_core.sql','utf8').toLowerCase();
for (const marker of ['content_items','draft_payload','published_payload','enable row level security','grant select (content_type, content_key, published_payload, position, published_at)','content_audit_log_deny_browser']) {
  if (!migration.includes(marker)) throw new Error(`Content migration missing: ${marker}`);
}

const versionsMigration = fs.readFileSync('supabase/migrations/20260810213039_add_content_version_history.sql','utf8').toLowerCase();
for (const marker of ['content_versions','current_version','content_versions_deny_browser','unique (content_type, content_key, version)']) {
  if (!versionsMigration.includes(marker)) throw new Error(`Version history migration missing: ${marker}`);
}

for (const html of ['lesson.html','library.html','resource.html','study.html']) {
  const text=fs.readFileSync(html,'utf8');
  for (const marker of ['cloud-config.js','content-runtime.js']) if (!text.includes(marker)) throw new Error(`${html} missing ${marker}`);
}

const preview = fs.readFileSync('admin-preview.js','utf8');
for (const marker of ['get_item','draft_payload','user_roles','admin','super_admin']) if (!preview.includes(marker)) throw new Error(`Preview missing security/content marker: ${marker}`);

const versions = fs.readFileSync('admin-versions.js','utf8');
for (const marker of ['list_versions','rollback','super_admin','user_roles']) if (!versions.includes(marker)) throw new Error(`Versions UI missing marker: ${marker}`);

const sw=fs.readFileSync('sw.js','utf8');
for (const marker of ['./admin-content.html','./admin-content.css','./admin-content.js','./content-runtime.js','./admin-content-audit.html','./admin-content-audit.js','./admin-preview.html','./admin-preview.css','./admin-preview.js','./admin-versions.html','./admin-versions.css','./admin-versions.js']) if(!sw.includes(marker)) throw new Error(`Service worker missing ${marker}`);

console.log('V11 content management validation passed.');

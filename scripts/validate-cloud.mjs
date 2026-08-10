import fs from 'node:fs';

const required = [
  'cloud-config.js','cloud-client.js','cloud-sync.js','cloud-autosync.js','account.html','account.css','account.js',
  'supabase/migrations/20260810143000_init_mirmc_cloud.sql',
  'supabase/migrations/20260810200500_harden_trigger_functions.sql',
  'supabase/README.md'
];
const missing = required.filter(path => !fs.existsSync(path));
if (missing.length) throw new Error(`Cloud files missing: ${missing.join(', ')}`);

const config = fs.readFileSync('cloud-config.js','utf8');
if (/service[_-]?role/i.test(config)) throw new Error('Administrative service role material must never be present in cloud-config.js.');
const cloudEnabled = /enabled\s*:\s*true/.test(config);
if (cloudEnabled) {
  if (!/https:\/\/.+\.supabase\.co/.test(config)) throw new Error('Cloud is enabled but cloud-config.js has no Supabase project URL.');
  const keyMatch = config.match(/supabasePublishableKey\s*:\s*['"]([^'"]+)['"]/);
  if (!keyMatch || keyMatch[1].length < 20) throw new Error('Cloud is enabled but no valid publishable key is configured.');
  if (/sb_secret_|service_role/i.test(keyMatch?.[1] || '')) throw new Error('A secret/admin key was placed in the public frontend.');
}

const client = fs.readFileSync('cloud-client.js','utf8');
if (!client.includes('persistSession: true') || !client.includes('autoRefreshToken: true')) throw new Error('Browser auth persistence configuration missing.');
if (/service[_-]?role|sb_secret_/i.test(client)) throw new Error('cloud-client.js must not reference an administrative key.');

const sync = fs.readFileSync('cloud-sync.js','utf8');
for (const marker of ['user_learning_state','bestPct','completed','schema_version','study']) {
  if (!sync.includes(marker)) throw new Error(`cloud-sync.js missing required marker: ${marker}`);
}

const autosync = fs.readFileSync('cloud-autosync.js','utf8');
for (const marker of ['MIRMCSync.sync','mirmc-course-progress','mirmc-assessment-progress','mirmc-study-change','visibilitychange','online']) {
  if (!autosync.includes(marker)) throw new Error(`cloud-autosync.js missing required marker: ${marker}`);
}

const migration = fs.readFileSync('supabase/migrations/20260810143000_init_mirmc_cloud.sql','utf8');
for (const marker of [
  'alter table public.profiles enable row level security',
  'alter table public.user_learning_state enable row level security',
  'auth.uid()',
  'to authenticated',
  'revoke all on public.profiles from anon',
  'revoke all on public.user_learning_state from anon'
]) {
  if (!migration.toLowerCase().includes(marker.toLowerCase())) throw new Error(`Supabase migration missing security marker: ${marker}`);
}

const hardening = fs.readFileSync('supabase/migrations/20260810200500_harden_trigger_functions.sql','utf8');
for (const marker of ['handle_new_user_profile','set_updated_at','revoke execute','from anon','from authenticated']) {
  if (!hardening.toLowerCase().includes(marker.toLowerCase())) throw new Error(`Hardening migration missing marker: ${marker}`);
}

const account = fs.readFileSync('account.html','utf8');
for (const ref of ['cloud-config.js','cloud-client.js','cloud-sync.js','account.js']) {
  if (!account.includes(ref)) throw new Error(`account.html missing ${ref}`);
}

console.log(`Cloud/account validation passed (${cloudEnabled ? 'cloud enabled' : 'local mode'}).`);

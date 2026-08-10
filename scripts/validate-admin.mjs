import fs from 'node:fs';

const required = [
  'admin.html','admin.css','admin.js',
  'supabase/functions/admin-management/index.ts',
  'supabase/migrations/20260810204832_add_secure_roles_and_admin_rpcs.sql',
  'supabase/migrations/20260810204844_default_student_role_on_signup.sql',
  'supabase/migrations/20260810205017_remove_exposed_admin_security_definer_rpcs.sql'
];
for (const file of required) if (!fs.existsSync(file)) throw new Error(`Missing V10 admin file: ${file}`);

const adminJs = fs.readFileSync('admin.js','utf8');
for (const marker of ['admin-management','Authorization','access_token','user_roles','super_admin']) {
  if (!adminJs.includes(marker)) throw new Error(`admin.js missing security marker: ${marker}`);
}
if (/service[_-]?role/i.test(adminJs)) throw new Error('Browser admin.js must never reference a service role.');

const edge = fs.readFileSync('supabase/functions/admin-management/index.ts','utf8');
for (const marker of ['SUPABASE_SERVICE_ROLE_KEY','auth.getUser(token)','callerRole','super_admin_required','cannot_demote_self']) {
  if (!edge.includes(marker)) throw new Error(`Edge admin function missing marker: ${marker}`);
}

const roles = fs.readFileSync('supabase/migrations/20260810204832_add_secure_roles_and_admin_rpcs.sql','utf8').toLowerCase();
for (const marker of ['user_roles','enable row level security','revoke all on public.user_roles from anon','user_roles_select_own']) {
  if (!roles.includes(marker)) throw new Error(`Roles migration missing: ${marker}`);
}

const removed = fs.readFileSync('supabase/migrations/20260810205017_remove_exposed_admin_security_definer_rpcs.sql','utf8');
for (const marker of ['admin_set_role','admin_list_users','is_staff']) {
  if (!removed.includes(marker)) throw new Error(`Admin RPC removal migration missing: ${marker}`);
}

const sw = fs.readFileSync('sw.js','utf8');
for (const marker of ['./admin.html','./admin.css','./admin.js']) if (!sw.includes(marker)) throw new Error(`Service worker missing ${marker}`);

console.log('V10 admin security validation passed.');

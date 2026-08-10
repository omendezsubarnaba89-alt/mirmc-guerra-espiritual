import fs from 'node:fs';

const required = [
  'admin.html','admin.css','admin.js','admin-enhancements.js',
  'admin-user.html','admin-user.js','admin-detail.css',
  'admin-audit.html','admin-audit.js','admin-audit.css',
  'supabase/functions/admin-management/index.ts',
  'supabase/migrations/20260810204832_add_secure_roles_and_admin_rpcs.sql',
  'supabase/migrations/20260810204844_default_student_role_on_signup.sql',
  'supabase/migrations/20260810205017_remove_exposed_admin_security_definer_rpcs.sql',
  'supabase/migrations/20260810210036_add_admin_audit_log.sql',
  'supabase/migrations/20260810210215_explicitly_deny_client_audit_log.sql',
  'supabase/migrations/20260810210340_optimize_user_roles_rls.sql'
];
for (const file of required) if (!fs.existsSync(file)) throw new Error(`Missing V10 admin file: ${file}`);

const adminJs = fs.readFileSync('admin.js','utf8');
for (const marker of ['admin-management','Authorization','access_token','user_roles','super_admin']) {
  if (!adminJs.includes(marker)) throw new Error(`admin.js missing security marker: ${marker}`);
}
if (/service[_-]?role/i.test(adminJs)) throw new Error('Browser admin.js must never reference a service role.');

for (const browserFile of ['admin-user.js','admin-audit.js','admin-enhancements.js']) {
  const src = fs.readFileSync(browserFile,'utf8');
  if (/service[_-]?role/i.test(src)) throw new Error(`${browserFile} must never reference a service role.`);
}

const edge = fs.readFileSync('supabase/functions/admin-management/index.ts','utf8');
for (const marker of ['SUPABASE_SERVICE_ROLE_KEY','auth.getUser(token)','callerRole','super_admin_required','cannot_demote_self','get_user_detail','list_audit','admin_audit_log']) {
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

const audit = fs.readFileSync('supabase/migrations/20260810210036_add_admin_audit_log.sql','utf8').toLowerCase();
for (const marker of ['admin_audit_log','enable row level security','revoke all on table public.admin_audit_log']) {
  if (!audit.includes(marker)) throw new Error(`Audit migration missing: ${marker}`);
}
const deny = fs.readFileSync('supabase/migrations/20260810210215_explicitly_deny_client_audit_log.sql','utf8').toLowerCase();
for (const marker of ['admin_audit_log_deny_clients','to anon, authenticated','using (false)','with check (false)']) {
  if (!deny.includes(marker)) throw new Error(`Audit deny policy missing: ${marker}`);
}
const optimized = fs.readFileSync('supabase/migrations/20260810210340_optimize_user_roles_rls.sql','utf8').toLowerCase();
if (!optimized.includes('(select auth.uid())')) throw new Error('Optimized role RLS policy is missing select auth.uid().');

const sw = fs.readFileSync('sw.js','utf8');
for (const marker of ['./admin.html','./admin.css','./admin.js','./admin-user.html','./admin-user.js','./admin-audit.html','./admin-audit.js']) {
  if (!sw.includes(marker)) throw new Error(`Service worker missing ${marker}`);
}

console.log('V10.1 admin security validation passed.');
